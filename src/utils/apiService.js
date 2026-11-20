import { buildRegionCompanyQuery, extractTopRegion } from './excelParser';

// Supabase 공통 헤더 빌더 (public 스키마 고정으로 graphql_public 충돌 원천 방지)
export function buildSupabaseHeaders(cleanKey, extra = {}) {
  const headers = {
    apikey: cleanKey,
    Accept: 'application/json',
    'Accept-Profile': 'public',
    'Content-Profile': 'public',
    ...extra,
  };
  if (cleanKey.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${cleanKey}`;
  }
  return headers;
}

// 유연한 JSON 배열/객체 추출 파서 (마크다운 펜스, 후행 쉼표 등 자동 보정)
export function parseForgivingJsonResults(rawText = '') {
  if (!rawText) return null;
  const cleaned = String(rawText)
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  const tryParse = (str) => {
    try {
      const noTrailingComma = str.replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(noTrailingComma);
    } catch (_) {
      return null;
    }
  };

  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const arrParsed = tryParse(cleaned.slice(firstBracket, lastBracket + 1));
    if (Array.isArray(arrParsed)) return arrParsed;
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const objParsed = tryParse(cleaned.slice(firstBrace, lastBrace + 1));
    if (objParsed) {
      if (Array.isArray(objParsed.results)) return objParsed.results;
      if (Array.isArray(objParsed.data)) return objParsed.data;
      if (Array.isArray(objParsed.items)) return objParsed.items;
    }
  }

  return null;
}

// 개별 거래처 네이버 5점 리뷰 최다 언급 메뉴 서칭
export async function searchPartnerWebAndMenus(partner, geminiApiKey = '') {
  const apiKey = (geminiApiKey || '').trim();
  const apiUrl = apiKey
    ? 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent'
    : 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=';
  const reqHeaders = { 'Content-Type': 'application/json' };
  if (apiKey) {
    reqHeaders['x-goog-api-key'] = apiKey;
  }

  const combinedQuery = buildRegionCompanyQuery(partner.companyName, partner.address);
  const tagKeyword = combinedQuery.replace(/\s+/g, '');
  const defaultInstaSearchUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(tagKeyword)}/`;
  const naverPlaceMenuUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(
    `${combinedQuery} 메뉴`
  )}`;

  const userQuery = `대한민국 업체 "${combinedQuery}" (상세주소: ${partner.address})의 네이버 플레이스(map.naver.com) 메뉴판 및 방문자 별점 5점(최고평점/호평) 리뷰와 네이버 블로그 후기를 분석해줘.
중요 규칙:
1. 네이버 플레이스 방문자 리뷰(특히 5점 만점 호평 리뷰 및 추천 리뷰)에서 고객들이 가장 많이 언급하고 극찬한 대표 메뉴 1순위를 "topReviewMenu"에 넣어줘. (예: "금태구이", "삼치회", "고등어봉초밥" 등)
2. 네이버 플레이스 메뉴판이나 블로그 리뷰에서 실제로 확인되는 전체 대표 메뉴 목록을 "menus" 배열에 넣어줘. (1순위가 가장 앞에 오도록 정렬)
3. 추측하거나 지어내지 말고, 검색 결과에서 확인되지 않으면 "topReviewMenu"는 빈 문자열 "", "menus"는 빈 배열 [] 로 반환해줘.
4. 반드시 순수 JSON 객체만 반환해줘:
{
  "topReviewMenu": "네이버 5점 리뷰 최다 언급 1위 메뉴명",
  "menus": ["5점 리뷰 최다 언급 메뉴1", "메뉴2", "메뉴3"],
  "blogUrl": "확인된 네이버 플레이스 또는 블로그 URL (없으면 빈 문자열)",
  "summary": "네이버 5점 리뷰에서 가장 많이 언급된 메뉴와 고객 평가 특징 1~2문장 요약"
}`;

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    tools: [{ google_search: {} }],
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const validMenus = Array.isArray(parsed.menus)
          ? parsed.menus.map((m) => String(m).trim()).filter(Boolean)
          : [];
        const topMenu = String(parsed.topReviewMenu || '').trim() || validMenus[0] || '';
        return {
          topReviewMenu: topMenu,
          menus: validMenus,
          instagramHandle: `#${tagKeyword}`,
          instagramUrl: defaultInstaSearchUrl,
          blogUrl:
            parsed.blogUrl && parsed.blogUrl.startsWith('http')
              ? parsed.blogUrl
              : naverPlaceMenuUrl,
          summary:
            parsed.summary ||
            (topMenu
              ? `[${combinedQuery}] 네이버 5점 리뷰 최다 언급 메뉴는 '${topMenu}'입니다.`
              : `[${combinedQuery}] 네이버 플레이스 리뷰 및 메뉴판에서 직접 확인이 필요합니다.`),
        };
      }
      break;
    } catch (err) {
      if (attempt === 2) {
        return {
          topReviewMenu: '',
          menus: [],
          instagramHandle: `#${tagKeyword}`,
          instagramUrl: defaultInstaSearchUrl,
          blogUrl: naverPlaceMenuUrl,
          summary: !apiKey
            ? `[${combinedQuery}] 실제 사이트에서 AI 자동 분석을 쓰려면 상단 [동기화 · AI키 설정]에 Gemini API 키를 입력해 주세요. 아래 '네이버 메뉴' 버튼으로 즉시 확인 가능합니다.`
            : `[${combinedQuery}] 네이버 리뷰·메뉴 검색 결과를 불러오지 못했습니다. 우측 '네이버 메뉴' 버튼으로 바로 확인하세요.`,
        };
      }
      await new Promise((r) => setTimeout(r, 800 * Math.pow(2, attempt)));
    }
  }
}

// 신규 어종 위판 시세 추이 조회
export async function fetchSpeciesAuctionTrend(speciesKeyword, geminiApiKey = '') {
  const apiKey = (geminiApiKey || '').trim();
  const apiUrl = apiKey
    ? 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent'
    : 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=';
  const reqHeaders = { 'Content-Type': 'application/json' };
  if (apiKey) {
    reqHeaders['x-goog-api-key'] = apiKey;
  }

  const cleanName = String(speciesKeyword || '').trim();
  const userQuery = `대한민국 수협 위판장(부산공동어시장, 통영수협, 여수수협, 제주한림수협, 속초수협 등)에서 거래되는 수산물 어종 "${cleanName}"의 최근 도매 위판 시세(낙찰가)와 주요 위판장별 시세를 검색해서 JSON으로 정리해줘.
반드시 아래 JSON 형식만 출력해줘:
{
  "name": "${cleanName}",
  "grade": "대표 규격 (예: 특대 10kg 상자 또는 1kg 기준)",
  "unit": "원/kg 또는 원/상자",
  "currentAvg": 35000,
  "prevDiffRate": 2.4,
  "history7d": [
    { "date": "11/12", "price": 33500 },
    { "date": "11/13", "price": 33800 },
    { "date": "11/14", "price": 34000 },
    { "date": "11/15", "price": 34200 },
    { "date": "11/16", "price": 34500 },
    { "date": "11/17", "price": 34200 },
    { "date": "11/18", "price": 35000 }
  ],
  "history30d": [
    { "date": "10/20", "price": 31000 },
    { "date": "10/27", "price": 32200 },
    { "date": "11/03", "price": 33000 },
    { "date": "11/10", "price": 34100 },
    { "date": "11/18", "price": 35000 }
  ],
  "markets": [
    { "market": "부산공동어시장", "price": 35200, "diff": 800, "volume": "1,200 상자", "status": "상승" },
    { "market": "통영수협위판장", "price": 34800, "diff": 600, "volume": "850 상자", "status": "보합" },
    { "market": "여수수협위판장", "price": 35000, "diff": 900, "volume": "640 상자", "status": "강세" }
  ]
}`;

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    tools: [{ google_search: {} }],
  };

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && parsed.currentAvg && Array.isArray(parsed.history7d) && Array.isArray(parsed.markets)) {
          return {
            isFallback: false,
            data: {
              name: String(parsed.name || cleanName),
              grade: String(parsed.grade || '산지 위판 표준 규격'),
              unit: String(parsed.unit || '원/kg'),
              currentAvg: Number(parsed.currentAvg) || 30000,
              prevDiffRate: Number(parsed.prevDiffRate) || 0,
              history7d: parsed.history7d.map((h) => ({
                date: String(h.date || ''),
                price: Number(h.price) || 0,
              })),
              history30d: Array.isArray(parsed.history30d)
                ? parsed.history30d.map((h) => ({
                    date: String(h.date || ''),
                    price: Number(h.price) || 0,
                  }))
                : parsed.history7d,
              markets: parsed.markets.map((m) => ({
                market: String(m.market || '산지위판장'),
                price: Number(m.price) || Number(parsed.currentAvg) || 30000,
                diff: Number(m.diff) || 0,
                volume: String(m.volume || '집계중'),
                status: String(m.status || '보합'),
              })),
            },
          };
        }
      }
      break;
    } catch (err) {
      if (attempt === 1) break;
      await new Promise((r) => setTimeout(r, 700));
    }
  }

  return {
    isFallback: true,
    data: {
      name: cleanName,
      grade: '산지 위판 표준 규격 (수동 시세 입력 가능)',
      unit: '원/kg',
      currentAvg: 35000,
      prevDiffRate: 0.0,
      history7d: [
        { date: '11/13', price: 35000 },
        { date: '11/14', price: 35000 },
        { date: '11/15', price: 35000 },
        { date: '11/16', price: 35000 },
        { date: '11/17', price: 35000 },
        { date: '11/18', price: 35000 },
        { date: '11/19', price: 35000 },
      ],
      history30d: [
        { date: '10/22', price: 35000 },
        { date: '10/29', price: 35000 },
        { date: '11/05', price: 35000 },
        { date: '11/12', price: 35000 },
        { date: '11/19', price: 35000 },
      ],
      markets: [
        { market: '부산공동어시장', price: 35000, diff: 0, volume: '집계중', status: '보합' },
        { market: '통영수협위판장', price: 35000, diff: 0, volume: '집계중', status: '보합' },
        { market: '여수수협위판장', price: 35000, diff: 0, volume: '집계중', status: '보합' },
      ],
    },
  };
}

// 5개 거래처 단위 배치로 네이버 메뉴·리뷰의 메인 원재료만 추출하는 내결함성 AI 서치 함수
export async function searchBatchMainIngredients(batchPartners = [], geminiApiKey = '') {
  const apiKey = (geminiApiKey || '').trim();
  const reqHeaders = { 'Content-Type': 'application/json' };
  if (apiKey) {
    reqHeaders['x-goog-api-key'] = apiKey;
  }

  const targetLines = batchPartners
    .map((p, idx) => {
      const region = extractTopRegion(p.address) || '전국';
      const knownMenus = [
        p.topReviewMenu,
        ...(Array.isArray(p.searchedMenus) ? p.searchedMenus : []),
      ]
        .filter(Boolean)
        .slice(0, 4)
        .join(', ');
      return `idx=${idx} | 업체명="${p.companyName}" | 지역="${region}"${
        knownMenus ? ` | 기존확인메뉴="${knownMenus}"` : ''
      }`;
    })
    .join('\n');

  const userQuery = `아래 대한민국 식당/거래처들의 네이버 플레이스 메뉴판 및 방문자 리뷰를 Google 검색으로 확인하여, 각 업체 대표 메뉴에 사용된 "메인 원재료(식재료/어종명)"만 추출해줘.

[대상 거래처 목록]
${targetLines}

[필수 변환 규칙]
1. 음식명/조리명이 아니라 반드시 표준화된 "메인 원재료명"으로 변환해줘.
   예시: "삼치회"->"삼치", "금태구이"->"금태", "고등어봉초밥"->"고등어", "대방어회"->"방어", "갈치조림"->"갈치", "참돔유비끼"->"참돔", "오징어순대"->"오징어", "모둠활어회"->["광어","우럭"], "연어초밥"->"연어", "전복죽"->"전복", "장어구이"->"장어", "꽃게탕"->"꽃게", "소고기구이"->"소고기", "삼겹살"->"돼지고기"
2. 기존확인메뉴가 있으면 함께 참고하되, 네이버 검색에서 업체나 메뉴·원재료가 확인되지 않으면 추측하지 말고 반드시 빈 배열 [] 로 반환해줘.
3. "수산물", "해산물", "생선", "회", "모둠", "기타", "확인불가" 같은 모호한 표현은 절대 넣지 마.
4. 다른 설명 없이 반드시 순수 JSON 배열만 출력해줘:
[{"idx": 0, "companyName": "업체명", "ingredients": ["삼치", "금태"]}]`;

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    tools: [{ google_search: {} }],
  };

  const models = ['gemini-3-flash-preview', 'gemini-2.5-flash'];
  let lastError = '';

  for (const model of models) {
    const apiUrl = apiKey
      ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
      : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=`;

    for (let retry = 0; retry < 2; retry++) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: reqHeaders,
          body: JSON.stringify(payload),
        });

        if (response.status === 429) {
          const errText = await response.text().catch(() => '');
          lastError = `HTTP 429 요청 한도 초과 (${model}): ${errText.slice(0, 90)}`;
          if (retry === 0) {
            await new Promise((r) => setTimeout(r, 1500));
            continue;
          }
          break;
        }

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          lastError = `HTTP ${response.status} (${model}): ${errText.slice(0, 110)}`;
          if ([400, 404, 500, 503].includes(response.status)) {
            break;
          }
          return { ok: false, results: [], error: lastError };
        }

        const result = await response.json();
        const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsedArray = parseForgivingJsonResults(rawText);

        if (Array.isArray(parsedArray)) {
          return { ok: true, results: parsedArray, error: '' };
        }
        lastError = `응답 JSON 파싱 실패 (${model})`;
        break;
      } catch (err) {
        lastError = `네트워크 오류 (${model}): ${err.message}`;
        if (retry === 0) {
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }
      }
    }
  }

  return { ok: false, results: [], error: lastError || '알 수 없는 API 오류가 발생했습니다.' };
}