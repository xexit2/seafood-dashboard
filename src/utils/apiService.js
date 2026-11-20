import { buildRegionCompanyQuery } from './excelParser';
import { DEFAULT_SOUTH_MARKETS } from '../constants/initialData';

function parseFlexibleJson(rawText) {
  if (!rawText) return null;
  let cleaned = String(rawText)
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  const arrMatch = cleaned.match(/\[[\s\S]*\]/);
  const candidate = objMatch ? objMatch[0] : arrMatch ? arrMatch[0] : cleaned;

  try {
    return JSON.parse(candidate);
  } catch (_) {
    try {
      const fixed = candidate.replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(fixed);
    } catch (__) {
      return null;
    }
  }
}

async function callGeminiWithFallback(userQuery, geminiApiKey = '', useSearch = true) {
  const apiKey = (geminiApiKey || '').trim();
  const models = ['gemini-3-flash-preview', 'gemini-2.5-flash'];
  let lastErrMsg = '';

  for (const model of models) {
    const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const apiUrl = apiKey ? baseUrl : `${baseUrl}?key=`;
    const reqHeaders = { 'Content-Type': 'application/json' };
    if (apiKey) {
      reqHeaders['x-goog-api-key'] = apiKey;
    }

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      ...(useSearch ? { tools: [{ google_search: {} }] } : {}),
    };

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: reqHeaders,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errBody = await response.text().catch(() => '');
          lastErrMsg = `HTTP ${response.status}: ${errBody.slice(0, 120)}`;
          if (response.status === 429 && attempt === 0) {
            await new Promise((r) => setTimeout(r, 1500));
            continue;
          }
          break;
        }

        const result = await response.json();
        const parts = result?.candidates?.[0]?.content?.parts || [];
        const rawText = parts.map((p) => p.text || '').join('\n').trim();
        if (rawText) {
          return { ok: true, text: rawText, error: '' };
        }
        lastErrMsg = '응답 텍스트 비어 있음';
      } catch (err) {
        lastErrMsg = err?.message || '네트워크 오류';
        await new Promise((r) => setTimeout(r, 600));
      }
    }
  }

  return { ok: false, text: '', error: lastErrMsg || 'API 응답 실패' };
}

export async function searchPartnerWebAndMenus(partner, geminiApiKey = '') {
  const combinedQuery = buildRegionCompanyQuery(partner.companyName, partner.address);
  const tagKeyword = combinedQuery.replace(/\s+/g, '');
  const defaultInstaSearchUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(tagKeyword)}/`;
  const naverPlaceMenuUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(
    `${combinedQuery} 메뉴`
  )}`;

  const userQuery = `대한민국 업체 "${combinedQuery}" (상세주소: ${partner.address})의 네이버 플레이스(map.naver.com) 메뉴판 및 방문자 별점 5점(최고평점/호평) 리뷰와 네이버 블로그 후기를 분석해줘.
중요 규칙:
1. 네이버 플레이스 방문자 리뷰(특히 5점 만점 호평 리뷰 및 추천 리뷰)에서 고객들이 가장 많이 언급하고 극찬한 대표 메뉴 1순위를 "topReviewMenu"에 넣어줘.
2. 네이버 플레이스 메뉴판이나 블로그 리뷰에서 실제로 확인되는 전체 대표 메뉴 목록을 "menus" 배열에 넣어줘.
3. 추측하거나 지어내지 말고, 검색 결과에서 확인되지 않으면 "topReviewMenu"는 빈 문자열 "", "menus"는 빈 배열 [] 로 반환해줘.
4. 반드시 순수 JSON 객체만 반환해줘:
{
  "topReviewMenu": "네이버 5점 리뷰 최다 언급 1위 메뉴명",
  "menus": ["5점 리뷰 최다 언급 메뉴1", "메뉴2", "메뉴3"],
  "blogUrl": "확인된 네이버 플레이스 또는 블로그 URL (없으면 빈 문자열)",
  "summary": "네이버 5점 리뷰에서 가장 많이 언급된 메뉴와 고객 평가 특징 1~2문장 요약"
}`;

  const res = await callGeminiWithFallback(userQuery, geminiApiKey, true);
  if (res.ok) {
    const parsed = parseFlexibleJson(res.text);
    if (parsed) {
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
  }

  return {
    topReviewMenu: '',
    menus: [],
    instagramHandle: `#${tagKeyword}`,
    instagramUrl: defaultInstaSearchUrl,
    blogUrl: naverPlaceMenuUrl,
    summary: !(geminiApiKey || '').trim()
      ? `[${combinedQuery}] 실제 사이트에서 AI 자동 분석을 쓰려면 상단 [동기화 설정]에 무료 Gemini API 키를 입력해 주세요. 아래 '네이버 메뉴' 버튼으로 즉시 확인 가능합니다.`
      : `[${combinedQuery}] 네이버 리뷰·메뉴 검색 결과를 불러오지 못했습니다 (${res.error}). 우측 '네이버 메뉴' 버튼으로 바로 확인하세요.`,
  };
}

export async function searchTopIngredientsBatch(partnersBatch, geminiApiKey = '') {
  if (!Array.isArray(partnersBatch) || partnersBatch.length === 0) {
    return { items: [], error: '' };
  }

  const listText = partnersBatch
    .map((p, idx) => {
      const q = buildRegionCompanyQuery(p.companyName, p.address);
      return `${idx + 1}. ${q} (업체명: ${p.companyName}, 주소: ${p.address || ''})`;
    })
    .join('\n');

  const userQuery = `다음 대한민국 식당/수산 업체들의 네이버 플레이스 메뉴와 방문자 리뷰를 검색해서, 각 업체가 주력으로 사용하는 "메인 식재료(원재료)"만 추출해줘.

[업체 목록]
${listText}

[필수 규칙]
1. "삼치회", "금태구이", "고등어조림", "모듬회" 같은 완성된 음식명/요리명이 아니라, 그 요리의 핵심이 되는 순수 "메인 원재료명"만 적어줘. (예: "삼치", "금태", "고등어", "전갱이", "대방어", "갈치", "참돔", "광어", "우럭", "오징어", "문어", "전복", "꽃게", "새우", "한우", "돼지고기", "장어", "아귀", "복어" 등 단일 표준 원재료명)
2. 네이버 검색 결과에서 메뉴나 주력 식재료를 명확히 확인할 수 없는 업체는 억지로 추측하지 말고 ingredients를 빈 배열 [] 로 반환해줘.
3. 설명 문장 없이 반드시 아래 순수 JSON 형식만 출력해줘:
{
  "results": [
    { "idx": 1, "companyName": "업체명", "ingredients": ["삼치", "고등어"] }
  ]
}`;

  const res = await callGeminiWithFallback(userQuery, geminiApiKey, true);
  if (!res.ok) {
    return { items: [], error: res.error };
  }

  const parsed = parseFlexibleJson(res.text);
  const rawList = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.results)
    ? parsed.results
    : [];

  const items = rawList.map((r, i) => {
    const idxNum = Number(r?.idx);
    const matchedPartner =
      Number.isFinite(idxNum) && idxNum >= 1 && idxNum <= partnersBatch.length
        ? partnersBatch[idxNum - 1]
        : partnersBatch.find(
            (p) =>
              String(r?.companyName || '').includes(p.companyName) ||
              p.companyName.includes(String(r?.companyName || ''))
          ) || partnersBatch[i];

    return {
      companyName: matchedPartner ? matchedPartner.companyName : String(r?.companyName || ''),
      ingredients: Array.isArray(r?.ingredients)
        ? r.ingredients
            .map((ing) => String(ing).trim().replace(/(회|구이|조림|찜|탕|무침|초밥|덮밥)$/, ''))
            .filter((ing) => ing.length >= 1 && ing !== '없음' && ing !== '확인불가')
        : [],
    };
  });

  return { items, error: '' };
}

// 부산 인근 · 남해 주요 위판장 기준 어종 시세 조회 및 갱신
export async function fetchSpeciesAuctionTrend(
  speciesKeyword,
  geminiApiKey = '',
  targetMarkets = DEFAULT_SOUTH_MARKETS,
  existingSpecies = null
) {
  const cleanName = String(speciesKeyword || '').trim();
  const marketList =
    Array.isArray(targetMarkets) && targetMarkets.length > 0
      ? targetMarkets
      : DEFAULT_SOUTH_MARKETS;

  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayLabel = `${mm}/${dd}`;

  const userQuery = `대한민국 부산 인근 및 남해권 주요 수협 위판장(${marketList.join(
    ', '
  )})에서 거래되는 수산물 어종 "${cleanName}"의 오늘(${todayLabel}) 도매 위판 시세(낙찰가)와 위판장별 시세를 검색해서 JSON으로 정리해줘.
반드시 지정된 위판장 목록(${marketList.join(', ')})을 모두 포함하고, 아래 순수 JSON 형식만 출력해줘:
{
  "name": "${cleanName}",
  "grade": "대표 규격 (예: 특대 10kg 상자 또는 1kg 기준)",
  "unit": "원/kg 또는 원/상자",
  "currentAvg": 35000,
  "prevDiffRate": 2.4,
  "history7d": [
    { "date": "11/14", "price": 33500 },
    { "date": "11/15", "price": 33800 },
    { "date": "11/16", "price": 34000 },
    { "date": "11/17", "price": 34200 },
    { "date": "11/18", "price": 34500 },
    { "date": "11/19", "price": 34200 },
    { "date": "${todayLabel}", "price": 35000 }
  ],
  "history30d": [
    { "date": "10/22", "price": 31000 },
    { "date": "10/29", "price": 32200 },
    { "date": "11/05", "price": 33000 },
    { "date": "11/12", "price": 34100 },
    { "date": "${todayLabel}", "price": 35000 }
  ],
  "markets": [
    ${marketList
      .map(
        (m) =>
          `{ "market": "${m}", "price": 35000, "diff": 800, "volume": "1,200 상자", "status": "상승" }`
      )
      .join(',\n    ')}
  ]
}`;

  const res = await callGeminiWithFallback(userQuery, geminiApiKey, true);
  if (res.ok) {
    const parsed = parseFlexibleJson(res.text);
    if (parsed && parsed.currentAvg && Array.isArray(parsed.markets)) {
      const normalizedMarkets = marketList.map((mName, idx) => {
        const found = parsed.markets.find(
          (pm) =>
            String(pm.market || '').includes(mName.replace('위판장', '')) ||
            mName.includes(String(pm.market || ''))
        ) || parsed.markets[idx];

        return {
          market: mName,
          price: Number(found?.price) || Number(parsed.currentAvg) || 35000,
          diff: Number(found?.diff) || 0,
          volume: String(found?.volume || '집계중'),
          status: String(found?.status || '보합'),
        };
      });

      return {
        isFallback: false,
        data: {
          name: String(parsed.name || cleanName),
          grade: String(parsed.grade || existingSpecies?.grade || '남해권 위판 표준 규격'),
          unit: String(parsed.unit || existingSpecies?.unit || '원/kg'),
          currentAvg: Number(parsed.currentAvg) || 35000,
          prevDiffRate: Number(parsed.prevDiffRate) || 0,
          history7d: Array.isArray(parsed.history7d) && parsed.history7d.length > 0
            ? parsed.history7d.map((h) => ({
                date: String(h.date || ''),
                price: Number(h.price) || 0,
              }))
            : existingSpecies?.history7d || [{ date: todayLabel, price: Number(parsed.currentAvg) || 35000 }],
          history30d: Array.isArray(parsed.history30d) && parsed.history30d.length > 0
            ? parsed.history30d.map((h) => ({
                date: String(h.date || ''),
                price: Number(h.price) || 0,
              }))
            : existingSpecies?.history30d || [{ date: todayLabel, price: Number(parsed.currentAvg) || 35000 }],
          markets: normalizedMarkets,
        },
      };
    }
  }

  // API 키 미설정 또는 일시 오류 시 기존 시세/표준 시세 유지하면서 부산·남해 위판장 구조 보존
  const basePrice = existingSpecies?.currentAvg || 35000;
  return {
    isFallback: true,
    data: {
      name: cleanName,
      grade: existingSpecies?.grade || '부산·남해권 위판 표준 규격 (수동 시세 입력 가능)',
      unit: existingSpecies?.unit || '원/kg',
      currentAvg: basePrice,
      prevDiffRate: existingSpecies?.prevDiffRate ?? 0.0,
      history7d: existingSpecies?.history7d || [
        { date: '11/14', price: basePrice },
        { date: '11/15', price: basePrice },
        { date: '11/16', price: basePrice },
        { date: '11/17', price: basePrice },
        { date: '11/18', price: basePrice },
        { date: '11/19', price: basePrice },
        { date: todayLabel, price: basePrice },
      ],
      history30d: existingSpecies?.history30d || [
        { date: '10/22', price: basePrice },
        { date: '10/29', price: basePrice },
        { date: '11/05', price: basePrice },
        { date: '11/12', price: basePrice },
        { date: todayLabel, price: basePrice },
      ],
      markets: marketList.map((mName) => {
        const prevM = existingSpecies?.markets?.find((m) => m.market === mName);
        return {
          market: mName,
          price: prevM?.price || basePrice,
          diff: prevM?.diff || 0,
          volume: prevM?.volume || '집계중',
          status: prevM?.status || '보합',
        };
      }),
    },
  };
}