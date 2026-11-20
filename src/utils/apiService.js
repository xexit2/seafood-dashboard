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

// API 키에서 실제로 사용 가능한 최신 Flash 모델명을 1회 자동 조회해 캐싱
let cachedAvailableModel = '';

async function resolveWorkingGeminiModel(apiKey) {
  if (cachedAvailableModel) return cachedAvailableModel;

  try {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?pageSize=50',
      { headers: { 'x-goog-api-key': apiKey } }
    );
    if (res.ok) {
      const data = await res.json();
      const models = Array.isArray(data?.models) ? data.models : [];
      const supported = models
        .filter(
          (m) =>
            Array.isArray(m.supportedGenerationMethods) &&
            m.supportedGenerationMethods.includes('generateContent')
        )
        .map((m) => String(m.name || '').replace(/^models\//, ''));

      const preferredOrder = [
        'gemini-3-flash-preview',
        'gemini-2.5-flash-preview-05-20',
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
      ];
      for (const candidate of preferredOrder) {
        if (supported.includes(candidate)) {
          cachedAvailableModel = candidate;
          return candidate;
        }
      }
      const anyFlash = supported.find((name) => name.includes('flash'));
      if (anyFlash) {
        cachedAvailableModel = anyFlash;
        return anyFlash;
      }
    }
  } catch (_) {
    // 목록 조회 실패 시 기본값 사용
  }

  cachedAvailableModel = 'gemini-3-flash-preview';
  return cachedAvailableModel;
}

// 429(사용 한도 초과) 발생 시 연쇄 호출이나 재시도 없이 즉시 중단하는 단일 호출 함수
async function callGeminiWithFallback(userQuery, geminiApiKey = '', useSearch = true) {
  const apiKey = (geminiApiKey || '').trim();
  if (!apiKey) {
    return {
      ok: false,
      isRateLimit: false,
      text: '',
      error: 'Gemini API 키가 설정되지 않았습니다. 상단 [동기화 · AI키 설정]에서 키를 입력해 주세요.',
    };
  }

  const activeModel = await resolveWorkingGeminiModel(apiKey);
  const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent`;
  const reqHeaders = {
    'Content-Type': 'application/json',
    'x-goog-api-key': apiKey,
  };

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    ...(useSearch ? { tools: [{ google_search: {} }] } : {}),
  };

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: reqHeaders,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return {
          ok: false,
          isRateLimit: true,
          text: '',
          error:
            'AI 무료 사용 한도(분당 또는 일일 할당량)를 모두 소진했습니다. 추가 호출을 즉시 중지합니다.',
        };
      }

      if (response.status === 404) {
        cachedAvailableModel = '';
      }

      const errBody = await response.text().catch(() => '');
      return {
        ok: false,
        isRateLimit: false,
        text: '',
        error: `API 요청 오류 (HTTP ${response.status}): ${errBody.slice(0, 100)}`,
      };
    }

    const result = await response.json();
    const parts = result?.candidates?.[0]?.content?.parts || [];
    const rawText = parts.map((p) => p.text || '').join('\n').trim();
    if (rawText) {
      return { ok: true, isRateLimit: false, text: rawText, error: '' };
    }

    return {
      ok: false,
      isRateLimit: false,
      text: '',
      error: 'AI 응답 내용이 비어 있습니다.',
    };
  } catch (err) {
    return {
      ok: false,
      isRateLimit: false,
      text: '',
      error: `네트워크 연결 오류: ${err?.message || '알 수 없는 오류'}`,
    };
  }
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
    return { items: [], error: '', isRateLimit: false };
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
    return { items: [], error: res.error, isRateLimit: res.isRateLimit };
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

  return { items, error: '', isRateLimit: false };
}

// 오늘(KST) 기준 최근 7일 · 30일 날짜 라벨 배열 생성
function buildRecentDateLabels() {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const labels7d = [];
  const ymd7d = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    labels7d.push(`${mm}/${dd}`);
    ymd7d.push(`${yyyy}${mm}${dd}`);
  }
  const labels30d = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    labels30d.push(`${mm}/${dd}`);
  }
  return { labels7d, ymd7d, labels30d, todayLabel: labels7d[6] };
}

function normalizeHistoryDates(rawHistory, targetLabels, fallbackPrice) {
  const basePrice = Number(fallbackPrice) || 35000;
  const list = Array.isArray(rawHistory) ? rawHistory : [];
  return targetLabels.map((label, idx) => {
    const item = list[idx] || list[list.length - 1];
    const price = Number(item?.price) || basePrice;
    return { date: label, price };
  });
}

// 공공데이터포털 인증키 정규화 (Encoding 키 / Decoding 키 모두 안전 처리)
function normalizeServiceKeyParam(rawKey) {
  const trimmed = String(rawKey || '').trim();
  if (!trimmed) return '';
  return trimmed.includes('%') ? trimmed : encodeURIComponent(trimmed);
}

// 공공데이터포털(해양수산부·수협중앙회 산지위판장 경락가격 정보) 공식 Open API 조회
export async function fetchPublicDataAuctionPrices(
  speciesMap,
  publicDataKey = '',
  defaultMarkets = DEFAULT_SOUTH_MARKETS
) {
  const encodedKey = normalizeServiceKeyParam(publicDataKey);
  if (!encodedKey) {
    return { ok: false, updatedMap: null, matchedCount: 0, error: '공공데이터 인증키 미설정' };
  }

  const keys = Object.keys(speciesMap || {});
  const { labels7d, ymd7d, labels30d, todayLabel } = buildRecentDateLabels();

  // 어종별 검색 동의어 매핑 (예: 금태 -> 눈볼대/금태)
  const speciesAliases = {
    금태: ['금태', '눈볼대'],
    삼치: ['삼치'],
    고등어: ['고등어', '참고등어'],
    전갱이: ['전갱이', '매가리'],
  };

  try {
    // 최근 영업일(오늘부터 최대 3일 전까지) 위판장 경락 데이터 조회
    let allItems = [];
    for (let offset = 0; offset < 3; offset++) {
      const targetYmd = ymd7d[ymd7d.length - 1 - offset];
      const url = `https://apis.data.go.kr/1192000/select0040List/getselect0040List?serviceKey=${encodedKey}&numOfRows=300&pageNo=1&type=json&baseDt=${targetYmd}`;
      const res = await fetch(url);
      if (!res.ok) {
        return {
          ok: false,
          updatedMap: null,
          matchedCount: 0,
          error: `공공데이터 API 응답 오류 (HTTP ${res.status})`,
        };
      }
      const data = await res.json();
      const rawItems =
        data?.response?.body?.items?.item ||
        data?.body?.items?.item ||
        data?.items ||
        [];
      const list = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];
      if (list.length > 0) {
        allItems = list;
        break;
      }
    }

    if (allItems.length === 0) {
      return {
        ok: false,
        updatedMap: null,
        matchedCount: 0,
        error: '최근 위판일 경락 데이터가 아직 집계되지 않았습니다 (휴장일 또는 오전 경매 전)',
      };
    }

    const updatedMap = {};
    let matchedCount = 0;

    for (const k of keys) {
      const existing = speciesMap[k];
      const aliases = speciesAliases[k] || [k];
      const marketList =
        Array.isArray(existing?.markets) && existing.markets.length > 0
          ? existing.markets.map((m) => m.market)
          : defaultMarkets;

      // 해당 어종에 일치하는 공식 위판 레코드 필터링
      const speciesRows = allItems.filter((row) => {
        const spName = String(
          row.mtrlNm || row.fshlcNm || row.spcsNm || row.prdlstNm || ''
        ).trim();
        return aliases.some((al) => spName.includes(al));
      });

      if (speciesRows.length > 0) {
        matchedCount += 1;

        // 전체 평균 낙찰가 계산
        const prices = speciesRows
          .map((r) => Number(r.avrgPrc || r.cnsgnPrc || r.bidPrc || r.prc || 0))
          .filter((v) => v > 0);
        const newAvg =
          prices.length > 0
            ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
            : Number(existing?.currentAvg) || 35000;

        const prevAvg = Number(existing?.currentAvg) || newAvg;
        const diffRate =
          prevAvg > 0 ? Number((((newAvg - prevAvg) / prevAvg) * 100).toFixed(1)) : 0;

        // 위판장별 실제 낙찰가 및 위판 물량 매칭
        const normalizedMarkets = marketList.map((mName, idx) => {
          const shortMarket = mName
            .replace('위판장', '')
            .replace('수협', '')
            .replace('공동어시장', '')
            .trim();

          const mRows = speciesRows.filter((r) => {
            const apiMarket = String(
              r.cnsgnMktNm || r.whsalMrktNm || r.mktNm || r.mxtrNm || ''
            );
            return shortMarket && apiMarket.includes(shortMarket);
          });

          if (mRows.length > 0) {
            const mPrices = mRows
              .map((r) => Number(r.avrgPrc || r.cnsgnPrc || r.bidPrc || r.prc || 0))
              .filter((v) => v > 0);
            const mAvgPrice =
              mPrices.length > 0
                ? Math.round(mPrices.reduce((a, b) => a + b, 0) / mPrices.length)
                : newAvg;
            const totalQty = mRows.reduce(
              (acc, r) => acc + Number(r.cnsgnQty || r.qty || r.wt || 0),
              0
            );
            const prevMarketPrice = Number(existing?.markets?.[idx]?.price) || mAvgPrice;
            const diff = mAvgPrice - prevMarketPrice;

            return {
              market: mName,
              price: mAvgPrice,
              diff,
              volume: totalQty > 0 ? `${new Intl.NumberFormat('ko-KR').format(Math.round(totalQty))} kg/상자` : '집계완료',
              status: diff > 0 ? '상승' : diff < 0 ? '약세' : '보합',
            };
          }

          return {
            market: mName,
            price: Number(existing?.markets?.[idx]?.price) || newAvg,
            diff: Number(existing?.markets?.[idx]?.diff) || 0,
            volume: existing?.markets?.[idx]?.volume || '위판 대기',
            status: existing?.markets?.[idx]?.status || '보합',
          };
        });

        const norm7d = normalizeHistoryDates(existing?.history7d, labels7d, newAvg);
        norm7d[norm7d.length - 1] = { date: todayLabel, price: newAvg };
        const norm30d = normalizeHistoryDates(existing?.history30d, labels30d, newAvg);
        norm30d[norm30d.length - 1] = { date: todayLabel, price: newAvg };

        updatedMap[k] = {
          ...existing,
          currentAvg: newAvg,
          prevDiffRate: diffRate,
          history7d: norm7d,
          history30d: norm30d,
          markets: normalizedMarkets,
        };
      } else {
        const fallbackAvg = Number(existing?.currentAvg) || 35000;
        updatedMap[k] = {
          ...existing,
          history7d: normalizeHistoryDates(existing?.history7d, labels7d, fallbackAvg),
          history30d: normalizeHistoryDates(existing?.history30d, labels30d, fallbackAvg),
        };
      }
    }

    return {
      ok: matchedCount > 0,
      updatedMap,
      matchedCount,
      error: matchedCount > 0 ? '' : '공공데이터 응답 내 일치하는 어종 시세가 없습니다.',
    };
  } catch (err) {
    return {
      ok: false,
      updatedMap: null,
      matchedCount: 0,
      error: `공공데이터 API 연결 실패: ${err?.message || 'CORS 또는 네트워크 오류'}`,
    };
  }
}

// 등록된 전체 어종 시세 일괄 갱신 (1순위: 공공데이터 공식 API / 2순위: Gemini AI 보조 폴백)
export async function fetchAllSpeciesAuctionBatch(
  speciesMap,
  geminiApiKey = '',
  defaultMarkets = DEFAULT_SOUTH_MARKETS,
  publicDataKey = ''
) {
  // 1순위: 공공데이터포털 인증키가 있으면 무료 공식 API로 실제 낙찰가·물량 우선 조회
  if ((publicDataKey || '').trim()) {
    const pubRes = await fetchPublicDataAuctionPrices(
      speciesMap,
      publicDataKey,
      defaultMarkets
    );
    if (pubRes.ok && pubRes.updatedMap) {
      return {
        updatedMap: pubRes.updatedMap,
        liveUpdatedCount: pubRes.matchedCount,
        source: 'public',
        isRateLimit: false,
        error: '',
      };
    }
    // 공공데이터 키만 있고 Gemini 키가 없는 경우 공공데이터 오류 사유 반환
    if (!(geminiApiKey || '').trim()) {
      const keys = Object.keys(speciesMap || {});
      const { labels7d, labels30d } = buildRecentDateLabels();
      const dateOnlyMap = {};
      for (const k of keys) {
        const existing = speciesMap[k];
        const fallbackAvg = Number(existing?.currentAvg) || 35000;
        dateOnlyMap[k] = {
          ...existing,
          history7d: normalizeHistoryDates(existing?.history7d, labels7d, fallbackAvg),
          history30d: normalizeHistoryDates(existing?.history30d, labels30d, fallbackAvg),
        };
      }
      return {
        updatedMap: dateOnlyMap,
        liveUpdatedCount: 0,
        source: 'public',
        isRateLimit: false,
        error: pubRes.error,
      };
    }
  }

  // 2순위: Gemini AI 일괄 시세 조회
  const keys = Object.keys(speciesMap || {});
  const { labels7d, labels30d, todayLabel } = buildRecentDateLabels();

  const speciesSpecs = keys
    .map((k) => {
      const sp = speciesMap[k];
      const mList =
        Array.isArray(sp?.markets) && sp.markets.length > 0
          ? sp.markets.map((m) => m.market)
          : defaultMarkets;
      return `- ${k} (규격: ${sp?.grade || '표준'}, 단위: ${sp?.unit || '원/kg'}, 위판장: ${mList.join(', ')})`;
    })
    .join('\n');

  const userQuery = `오늘(${todayLabel}) 기준 대한민국 부산 인근 및 남해권 주요 수협 위판장의 아래 수산물 어종별 최신 도매 위판 시세(낙찰가)를 검색해서 JSON으로 정리해줘.

[조회 대상 어종 및 위판장]
${speciesSpecs}

[필수 규칙]
1. 반드시 모든 대상 어종(${keys.join(', ')})을 포함하고, 각 어종마다 지정된 위판장 목록의 당일 시세(price), 전일대비(diff), 물량(volume), 동향(status: 급등/강세/상승/보합/약세 중 택1)을 채워줘.
2. history7d는 최근 7일(${labels7d.join(', ')}) 순서대로 7개, history30d는 최근 30일(${labels30d.join(', ')}) 순서대로 5개 가격을 넣어줘.
3. 설명 없이 반드시 아래 순수 JSON 객체만 출력해줘:
{
  "species": {
    "${keys[0] || '삼치'}": {
      "currentAvg": 64000,
      "prevDiffRate": 2.5,
      "history7d": [
        { "date": "${labels7d[0]}", "price": 61000 },
        { "date": "${labels7d[6]}", "price": 64000 }
      ],
      "history30d": [
        { "date": "${labels30d[0]}", "price": 58000 },
        { "date": "${labels30d[4]}", "price": 64000 }
      ],
      "markets": [
        { "market": "부산공동어시장", "price": 64500, "diff": 1500, "volume": "1,800 상자", "status": "상승" }
      ]
    }
  }
}`;

  const res = await callGeminiWithFallback(userQuery, geminiApiKey, true);
  const parsed = res.ok ? parseFlexibleJson(res.text) : null;
  const parsedSpeciesObj = parsed?.species || parsed || {};

  const updatedMap = {};
  let liveUpdatedCount = 0;

  for (const k of keys) {
    const existing = speciesMap[k];
    const found = parsedSpeciesObj[k];
    const marketList =
      Array.isArray(existing?.markets) && existing.markets.length > 0
        ? existing.markets.map((m) => m.market)
        : defaultMarkets;

    if (found && Number(found.currentAvg) > 0) {
      liveUpdatedCount += 1;
      const newAvg = Number(found.currentAvg);
      const rawMarkets = Array.isArray(found.markets) ? found.markets : [];
      const normalizedMarkets = marketList.map((mName, idx) => {
        const matchedM =
          rawMarkets.find(
            (pm) =>
              String(pm?.market || '').includes(mName.replace('위판장', '')) ||
              mName.includes(String(pm?.market || ''))
          ) || rawMarkets[idx];

        return {
          market: mName,
          price: Number(matchedM?.price) || newAvg,
          diff: Number(matchedM?.diff) || 0,
          volume: String(matchedM?.volume || existing?.markets?.[idx]?.volume || '집계중'),
          status: String(matchedM?.status || '보합'),
        };
      });

      const norm7d = normalizeHistoryDates(found.history7d, labels7d, newAvg);
      norm7d[norm7d.length - 1] = { date: todayLabel, price: newAvg };
      const norm30d = normalizeHistoryDates(found.history30d, labels30d, newAvg);
      norm30d[norm30d.length - 1] = { date: todayLabel, price: newAvg };

      updatedMap[k] = {
        ...existing,
        currentAvg: newAvg,
        prevDiffRate: Number(found.prevDiffRate) ?? existing.prevDiffRate ?? 0,
        history7d: norm7d,
        history30d: norm30d,
        markets: normalizedMarkets,
      };
    } else {
      const fallbackAvg = Number(existing?.currentAvg) || 35000;
      const norm7d = normalizeHistoryDates(existing?.history7d, labels7d, fallbackAvg);
      const norm30d = normalizeHistoryDates(existing?.history30d, labels30d, fallbackAvg);
      updatedMap[k] = {
        ...existing,
        history7d: norm7d,
        history30d: norm30d,
      };
    }
  }

  return {
    updatedMap,
    liveUpdatedCount,
    source: 'ai',
    isRateLimit: res.isRateLimit,
    error: res.ok ? '' : res.error,
  };
}

// 단일 신규 어종 추가 조회용
export async function fetchSpeciesAuctionTrend(
  speciesKeyword,
  geminiApiKey = '',
  targetMarkets = DEFAULT_SOUTH_MARKETS,
  existingSpecies = null,
  publicDataKey = ''
) {
  const cleanName = String(speciesKeyword || '').trim();
  const baseObj = existingSpecies || {
    name: cleanName,
    grade: '부산·남해권 위판 표준 규격',
    unit: '원/kg',
    currentAvg: 35000,
    prevDiffRate: 0,
    history7d: [],
    history30d: [],
    markets: targetMarkets.map((m) => ({
      market: m,
      price: 35000,
      diff: 0,
      volume: '집계중',
      status: '보합',
    })),
  };

  const batchRes = await fetchAllSpeciesAuctionBatch(
    { [cleanName]: baseObj },
    geminiApiKey,
    targetMarkets,
    publicDataKey
  );

  return {
    isFallback: batchRes.liveUpdatedCount === 0,
    isRateLimit: batchRes.isRateLimit,
    source: batchRes.source,
    error: batchRes.error,
    data: batchRes.updatedMap[cleanName],
  };
}