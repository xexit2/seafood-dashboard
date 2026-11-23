import { buildRegionCompanyQuery } from './excelParser';
import { DEFAULT_SOUTH_MARKETS } from '../constants/initialData';

// 유료 API 과금 방지용 일일 호출 상한 설정 (KST 기준 하루 최대 30회)
export const DAILY_AI_CALL_LIMIT = 150;
const AI_USAGE_STORAGE_KEY = 'seasecret_ai_daily_usage_v1';

function getTodayKstKey() {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const yyyy = kst.getUTCFullYear();
  const mm = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(kst.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getDailyAiUsageStats() {
  const today = getTodayKstKey();
  try {
    const raw = localStorage.getItem(AI_USAGE_STORAGE_KEY);
    if (!raw) return { date: today, count: 0, limit: DAILY_AI_CALL_LIMIT };
    const parsed = JSON.parse(raw);
    if (parsed?.date !== today) {
      return { date: today, count: 0, limit: DAILY_AI_CALL_LIMIT };
    }
    return {
      date: today,
      count: Number(parsed.count) || 0,
      limit: DAILY_AI_CALL_LIMIT,
    };
  } catch {
    return { date: today, count: 0, limit: DAILY_AI_CALL_LIMIT };
  }
}

function incrementDailyAiUsage() {
  const stats = getDailyAiUsageStats();
  const next = { date: stats.date, count: stats.count + 1 };
  try {
    localStorage.setItem(AI_USAGE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 저장소 제한 무시
  }
  return next.count;
}

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

// 일일 호출 상한(Safety Cap) 및 Gemini 3.8 Flash 우선 호출 함수
async function callGeminiWithFallback(promptText, apiKey, useSearch = false) {
  const cleanKey = (apiKey || '').trim();
  if (!cleanKey) {
    return { ok: false, text: '', error: 'Gemini API 키가 설정되지 않았습니다.' };
  }

  // 안전장치 1: 일일 호출 상한 초과 시 즉시 차단
  const usage = getDailyAiUsageStats();
  if (usage.count >= DAILY_AI_CALL_LIMIT) {
    return {
      ok: false,
      text: '',
      error: `안전장치 작동: 오늘 AI 호출 상한(${DAILY_AI_CALL_LIMIT}회)에 도달하여 자동 차단되었습니다.`,
      isRateLimit: true,
    };
  }

  // Google AI Studio 활성 모델(Gemini 3.8 Flash) 최우선 호출
  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-3.8-flash-preview',
    'gemini-3-flash-preview',
  ];

  let lastError = '사용 가능한 Gemini 모델을 찾지 못했습니다.';

  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const body = {
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        generationConfig: { temperature: 0.1 },
      };

      if (useSearch) {
        body.tools = [{ google_search: {} }];
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': cleanKey,
        },
        body: JSON.stringify(body),
      });

      // 404(모델명 불일치)인 경우 일일 카운트를 차감하지 않고 다음 모델명으로 즉시 전환
      if (res.status === 404) {
        lastError = `모델 미지원(404): ${model}`;
        continue;
      }

      // 실제 모델 호출이 성사된 경우에만 일일 사용량 1회 차감
      incrementDailyAiUsage();

      if (res.status === 429) {
        return {
          ok: false,
          text: '',
          error: 'API 사용 한도 초과 (429)',
          isRateLimit: true,
        };
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData?.error?.message || `HTTP ${res.status}`;
        return { ok: false, text: '', error: msg };
      }

      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const text = parts.map((p) => p.text || '').join('\n').trim();
      if (text) {
        return { ok: true, text, error: '' };
      }
      return { ok: false, text: '', error: 'AI 응답이 비어 있습니다.' };
    } catch (e) {
      lastError = e.message || '네트워크 오류';
    }
  }

  return { ok: false, text: '', error: lastError };
}

export async function searchPartnerWebAndMenus(partner, geminiApiKey = '') {
  const combinedQuery = buildRegionCompanyQuery(partner.companyName, partner.address);
  const tagKeyword = combinedQuery.replace(/\s+/g, '');
  const defaultInstaSearchUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(tagKeyword)}/`;
  const naverPlaceMenuUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(
    `${combinedQuery} 메뉴`
  )}`;

  const userQuery = `대한민국 업체 "${combinedQuery}" (상세주소: ${partner.address})의 네이버 플레이스(map.naver.com), 네이버 블로그 후기, 티스토리·SNS·맛집 플랫폼(카카오맵·다이닝코드 등)을 웹 검색하여 메뉴판과 방문자 리뷰를 분석해줘.
중요 규칙:
1. 상세주소(${partner.address})와 일치하는 매장을 정확히 찾아서 분석해줘. (기간 제한 없이 최신 리뷰·메뉴 정보를 우선 반영)
2. 방문자 리뷰와 후기에서 고객들이 가장 많이 언급하고 호평한 대표 시그니처 메뉴 1순위를 "topReviewMenu"에 넣어줘.
3. 메뉴판이나 방문 후기에서 실제로 확인되는 전체 대표 메뉴 목록을 "menus" 배열에 넣어줘.
4. 검색 결과에서 확인되지 않으면 억지로 지어내지 말고 "topReviewMenu"는 빈 문자열 "", "menus"는 빈 배열 [] 로 반환해줘.
5. 반드시 순수 JSON 객체만 반환해줘:
{
  "topReviewMenu": "리뷰·후기 최다 언급 1위 대표 메뉴명",
  "menus": ["대표 메뉴1", "메뉴2", "메뉴3"],
  "blogUrl": "확인된 네이버 플레이스 또는 블로그 URL (없으면 빈 문자열)",
  "summary": "리뷰에서 가장 많이 언급된 메뉴와 고객 평가 특징 1~2문장 요약"
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
            ? `[${combinedQuery}] 리뷰 최다 언급 대표 메뉴는 '${topMenu}'입니다.`
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
      ? `[${combinedQuery}] 실제 사이트에서 AI 자동 분석을 쓰려면 상단 [동기화 설정]에 Gemini API 키를 입력해 주세요. 아래 '네이버 메뉴' 버튼으로 즉시 확인 가능합니다.`
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
      const shortAddr = String(p.address || '').trim();
      return `${idx + 1}. 검색키워드: "${q}" | 상호명: "${p.companyName}" | 상세주소: "${shortAddr}"`;
    })
    .join('\n');

  const userQuery = `다음 대한민국 식당/수산/요식업 매장들의 상호명과 상세주소(구·동·도로명)를 바탕으로 네이버 블로그 후기, 티스토리 리뷰, 인스타그램, 카카오맵, 다이닝코드, 네이버 플레이스 소개글을 웹 검색하여 각 매장의 [1번: 주력 메인 원재료]와 [2번: 대표·인기 요리 메뉴]를 추출해줘.

[업체 목록]
${listText}

[필수 규칙]
1. 동명이인 매장 혼동을 막기 위해 반드시 "상세주소(구·동·도로명)"와 일치하는 실제 매장의 방문 후기 및 메뉴를 찾아줘. (기간 제한 없이 최신 후기·메뉴판 우선 반영)
2. "ingredients" (1번 정보): 완성된 요리명이 아니라, 메뉴와 후기에서 확인되는 핵심 순수 "메인 원재료명"만 적어줘. (예: "삼치", "금태", "고등어", "전갱이", "대방어", "갈치", "참돔", "광어", "우럭", "오징어", "문어", "전복", "꽃게", "새우", "한우", "돼지고기", "장어", "아귀", "복어" 등)
3. "topMenu" (2번 정보 1순위): 블로그 후기·리뷰·메뉴 소개에서 가장 많이 언급되는 대표 시그니처 메뉴 1개. (예: "삼치 짚불 타다키", "숙성모듬회", "금태구이" 등)
4. "menus" (2번 정보 전체): 실제 판매가 확인되는 대표 메뉴·요리명 1~3개 배열.
5. 웹 검색으로 매장과 메뉴가 확인되는 곳은 모두 추출하고, 전혀 검색되지 않는 업체만 ingredients: [], topMenu: "", menus: [] 로 반환해줘.
6. 설명 문장 없이 반드시 아래 순수 JSON 형식만 출력해줘:
{
  "results": [
    {
      "idx": 1,
      "companyName": "업체명",
      "ingredients": ["삼치"],
      "topMenu": "삼치 짚불 타다키",
      "menus": ["삼치 짚불 타다키", "모듬사시미 10p"]
    }
  ]
}`;

  // 실질적인 블로그·리뷰·메뉴판 수집을 위해 실시간 웹 검색(useSearch = true) 활성화
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

    const validMenus = Array.isArray(r?.menus)
      ? r.menus
          .map((m) => String(m).trim())
          .filter((m) => m.length >= 1 && m !== '없음' && m !== '확인불가')
      : [];
    const topMenu = String(r?.topMenu || '').trim() || validMenus[0] || '';

    return {
      companyName: matchedPartner ? matchedPartner.companyName : String(r?.companyName || ''),
      ingredients: Array.isArray(r?.ingredients)
        ? r.ingredients
            .map((ing) => String(ing).trim().replace(/(회|구이|조림|찜|탕|무침|초밥|덮밥)$/, ''))
            .filter((ing) => ing.length >= 1 && ing !== '없음' && ing !== '확인불가')
        : [],
      topMenu,
      menus: validMenus,
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

function normalizeHistoryDates(rawHistory, targetLabels, fallbackPrice = 0) {
  const basePrice = Number(fallbackPrice) || 0;
  const list = Array.isArray(rawHistory) ? rawHistory : [];
  return targetLabels.map((label, idx) => {
    const item = list[idx];
    const price = item && Number(item.price) > 0 ? Number(item.price) : basePrice;
    return { date: label, price };
  });
}

// 데이터가 없는 어종용 빈(0) 구조 생성 헬퍼
function buildEmptySpeciesRecord(existing, labels7d, labels30d, defaultMarkets) {
  const marketList =
    Array.isArray(existing?.markets) && existing.markets.length > 0
      ? existing.markets.map((m) => m.market)
      : defaultMarkets;

  return {
    ...existing,
    currentAvg: 0,
    prevDiffRate: 0,
    hasLiveData: false,
    history7d: labels7d.map((date) => ({ date, price: 0 })),
    history30d: labels30d.map((date) => ({ date, price: 0 })),
    markets: marketList.map((mName) => ({
      market: mName,
      price: 0,
      diff: 0,
      volume: '데이터 없음',
      status: '미집계',
    })),
  };
}

function normalizeServiceKeyParam(rawKey) {
  const trimmed = String(rawKey || '').trim();
  if (!trimmed) return '';
  return trimmed.includes('%') ? trimmed : encodeURIComponent(trimmed);
}

// 공공데이터포털 JSON 또는 XML 응답에서 모든 형태의 레코드 배열 추출
function extractDataGoItems(rawText) {
  const trimmed = String(rawText || '').trim();
  if (!trimmed) return { items: [], errorMsg: '빈 응답' };

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const data = JSON.parse(trimmed);
      const resultCode =
        data?.response?.header?.resultCode || data?.header?.resultCode || '';
      const resultMsg =
        data?.response?.header?.resultMsg || data?.header?.resultMsg || '';
      if (resultCode && resultCode !== '00' && resultCode !== 'NORMAL_CODE') {
        return { items: [], errorMsg: `${resultMsg || resultCode}` };
      }

      const bodyItems = data?.response?.body?.items || data?.body?.items || data?.items;
      let rawItems = [];
      if (Array.isArray(bodyItems)) {
        rawItems = bodyItems;
      } else if (bodyItems && typeof bodyItems === 'object') {
        if (Array.isArray(bodyItems.item)) {
          rawItems = bodyItems.item;
        } else if (bodyItems.item && typeof bodyItems.item === 'object') {
          rawItems = [bodyItems.item];
        } else {
          const firstArrayVal = Object.values(bodyItems).find((v) => Array.isArray(v));
          if (firstArrayVal) rawItems = firstArrayVal;
        }
      }
      return { items: rawItems, errorMsg: '' };
    } catch (_) {
      // XML 파싱으로 진행
    }
  }

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(trimmed, 'text/xml');
    const errMsgNode =
      xmlDoc.querySelector('returnAuthMsg') || xmlDoc.querySelector('resultMsg');
    const codeNode =
      xmlDoc.querySelector('returnReasonCode') || xmlDoc.querySelector('resultCode');
    const codeVal = codeNode?.textContent?.trim() || '';
    if (codeVal && codeVal !== '00') {
      return {
        items: [],
        errorMsg: errMsgNode?.textContent?.trim() || `오류코드 ${codeVal}`,
      };
    }

    const itemNodes = Array.from(xmlDoc.querySelectorAll('item, row, list'));
    const list = itemNodes.map((node) => {
      const obj = {};
      Array.from(node.children).forEach((child) => {
        obj[child.tagName] = child.textContent?.trim() || '';
      });
      return obj;
    });
    return { items: list, errorMsg: '' };
  } catch (e) {
    return { items: [], errorMsg: '응답 파싱 오류' };
  }
}

// 공공데이터포털(해양수산부_위판장별 위탁 판매 현황 /getselect0040List) 공식 Open API 조회
export async function fetchPublicDataAuctionPrices(
  speciesMap,
  publicDataKey = '',
  defaultMarkets = DEFAULT_SOUTH_MARKETS
) {
  const keys = Object.keys(speciesMap || {});
  const { labels7d, labels30d } = buildRecentDateLabels();

  const buildZeroMap = () => {
    const map = {};
    for (const k of keys) {
      map[k] = buildEmptySpeciesRecord(speciesMap[k], labels7d, labels30d, defaultMarkets);
    }
    return map;
  };

  const encodedKey = normalizeServiceKeyParam(publicDataKey);
  if (!encodedKey) {
    return {
      ok: false,
      updatedMap: buildZeroMap(),
      matchedCount: 0,
      error: '공공데이터 인증키 미설정 (시세 0원 초기화)',
    };
  }

  const recent3Ymd = [];
  const nowKst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  for (let i = 0; i < 3; i++) {
    const d = new Date(nowKst.getTime() - i * 24 * 60 * 60 * 1000);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    recent3Ymd.push(`${yyyy}${mm}${dd}`);
  }

  const speciesAliases = {
    금태: ['눈볼대', '금태'],
    삼치: ['삼치'],
    고등어: ['고등어', '참고등어'],
    전갱이: ['전갱이'],
  };

  const baseUrl = 'https://apis.data.go.kr/1192000/select0040List/getselect0040List';

  try {
    let validBaseDt = '';
    let lastApiError = '';

    for (const ymd of recent3Ymd) {
      const probeUrl = `${baseUrl}?serviceKey=${encodedKey}&numOfRows=10&pageNo=1&type=json&baseDt=${ymd}`;
      const res = await fetch(probeUrl);
      if (res.status === 401 || res.status === 403) {
        return {
          ok: false,
          updatedMap: buildZeroMap(),
          matchedCount: 0,
          error: `정부 API 접근 권한 오류 (HTTP ${res.status})`,
        };
      }
      if (!res.ok) {
        lastApiError = `HTTP ${res.status}`;
        continue;
      }

      const rawText = await res.text();
      const { items, errorMsg } = extractDataGoItems(rawText);
      if (errorMsg) {
        lastApiError = errorMsg;
        break;
      }
      if (items.length > 0) {
        validBaseDt = ymd;
        break;
      }
    }

    if (!validBaseDt) {
      return {
        ok: false,
        updatedMap: buildZeroMap(),
        matchedCount: 0,
        error: lastApiError
          ? `공공데이터 API 안내: ${lastApiError} (시세 0원 표시)`
          : '최근 3일간 위판장 공식 집계 데이터가 없어 0원으로 표시됩니다.',
      };
    }

    const matchedDateLabel = `${validBaseDt.slice(4, 6)}/${validBaseDt.slice(6, 8)}`;
    const updatedMap = {};
    let matchedCount = 0;

    for (const k of keys) {
      const existing = speciesMap[k];
      const aliases = speciesAliases[k] || [k];
      const marketList =
        Array.isArray(existing?.markets) && existing.markets.length > 0
          ? existing.markets.map((m) => m.market)
          : defaultMarkets;

      let speciesRows = [];
      for (const aliasName of aliases) {
        const spUrl = `${baseUrl}?serviceKey=${encodedKey}&numOfRows=500&pageNo=1&type=json&baseDt=${validBaseDt}&mprcStdCodeNm=${encodeURIComponent(
          aliasName
        )}`;
        const spRes = await fetch(spUrl);
        if (spRes.ok) {
          const spText = await spRes.text();
          const { items } = extractDataGoItems(spText);
          if (items.length > 0) {
            speciesRows = items;
            break;
          }
        }
      }

      if (speciesRows.length > 0) {
        matchedCount += 1;

        const calcRowUnitPrice = (r) => {
          const untpc = Number(r.csmtUntpc || 0);
          if (untpc > 0) return untpc;

          const amt = Number(r.csmtAmount || 0);
          const qy = Number(r.csmtQy || 0);
          const wt = Number(r.csmtWt || 0);
          if (amt > 0 && qy > 0) return Math.round(amt / qy);
          if (amt > 0 && wt > 0) return Math.round(amt / wt);
          return 0;
        };

        const prices = speciesRows.map(calcRowUnitPrice).filter((v) => v > 0);
        const newAvg =
          prices.length > 0
            ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
            : 0;

        const prevAvg = Number(existing?.currentAvg) || 0;
        const diffRate =
          prevAvg > 0 && newAvg > 0
            ? Number((((newAvg - prevAvg) / prevAvg) * 100).toFixed(1))
            : 0;

        const sampleUnitNm = String(
          speciesRows.find((r) => r.goodsUnitNm)?.goodsUnitNm || ''
        ).trim();
        const updatedUnitLabel = sampleUnitNm ? `원/${sampleUnitNm}` : existing?.unit || '원/kg';

        const normalizedMarkets = marketList.map((mName, idx) => {
          const shortMarket = mName
            .replace('위판장', '')
            .replace('수협', '')
            .replace('공동어시장', '')
            .trim();

          const mRows = speciesRows.filter((r) => {
            const apiMarket = `${r.csmtmktNm || ''} ${r.mxtrNm || ''}`;
            return shortMarket && apiMarket.includes(shortMarket);
          });

          if (mRows.length > 0) {
            const mPrices = mRows.map(calcRowUnitPrice).filter((v) => v > 0);
            const mAvgPrice =
              mPrices.length > 0
                ? Math.round(mPrices.reduce((a, b) => a + b, 0) / mPrices.length)
                : 0;

            const totalQy = mRows.reduce((acc, r) => acc + Number(r.csmtQy || 0), 0);
            const totalWt = mRows.reduce((acc, r) => acc + Number(r.csmtWt || 0), 0);
            const unitText = String(mRows[0]?.goodsUnitNm || '').includes('상자')
              ? '상자'
              : 'kg';

            let volumeLabel = `${mRows.length}건 위판`;
            if (totalQy > 0) {
              volumeLabel = `${new Intl.NumberFormat('ko-KR').format(Math.round(totalQy))} ${unitText}`;
            } else if (totalWt > 0) {
              volumeLabel = `${new Intl.NumberFormat('ko-KR').format(Math.round(totalWt))} kg`;
            }

            const prevMarketPrice = Number(existing?.markets?.[idx]?.price) || 0;
            const diff = prevMarketPrice > 0 && mAvgPrice > 0 ? mAvgPrice - prevMarketPrice : 0;

            return {
              market: mName,
              price: mAvgPrice,
              diff,
              volume: volumeLabel,
              status: diff > 0 ? '상승' : diff < 0 ? '약세' : '보합',
            };
          }

          return {
            market: mName,
            price: 0,
            diff: 0,
            volume: '당일 위판 없음',
            status: '미집계',
          };
        });

        const norm7d = labels7d.map((d) => ({ date: d, price: 0 }));
        norm7d[norm7d.length - 1] = { date: matchedDateLabel, price: newAvg };
        const norm30d = labels30d.map((d) => ({ date: d, price: 0 }));
        norm30d[norm30d.length - 1] = { date: matchedDateLabel, price: newAvg };

        updatedMap[k] = {
          ...existing,
          unit: updatedUnitLabel,
          currentAvg: newAvg,
          prevDiffRate: diffRate,
          hasLiveData: newAvg > 0,
          history7d: norm7d,
          history30d: norm30d,
          markets: normalizedMarkets,
        };
      } else {
        updatedMap[k] = buildEmptySpeciesRecord(existing, labels7d, labels30d, defaultMarkets);
      }
    }

    return {
      ok: matchedCount > 0,
      updatedMap,
      matchedCount,
      matchedDateLabel,
      error:
        matchedCount > 0
          ? ''
          : `위판일(${matchedDateLabel}) 데이터 내 일치하는 어종 거래가 없어 0원으로 표시됩니다.`,
    };
  } catch (err) {
    return {
      ok: false,
      updatedMap: buildZeroMap(),
      matchedCount: 0,
      error: `공공데이터 API 연결 오류 (시세 0원 표시): ${err?.message || '네트워크 오류'}`,
    };
  }
}

// 등록된 전체 어종 시세 일괄 갱신 (공공데이터 키 미설정 시 AI 할당량 보호를 위해 0원 반환)
export async function fetchAllSpeciesAuctionBatch(
  speciesMap,
  geminiApiKey = '',
  defaultMarkets = DEFAULT_SOUTH_MARKETS,
  publicDataKey = ''
) {
  if (!(publicDataKey || '').trim()) {
    const pubRes = await fetchPublicDataAuctionPrices(
      speciesMap,
      '',
      defaultMarkets
    );
    return {
      updatedMap: pubRes.updatedMap,
      liveUpdatedCount: 0,
      source: 'public',
      isRateLimit: false,
      error: '공공데이터 인증키 미설정 (시세 0원 유지 · AI 할당량 보호)',
    };
  }

  const pubRes = await fetchPublicDataAuctionPrices(
    speciesMap,
    publicDataKey,
    defaultMarkets
  );
  return {
    updatedMap: pubRes.updatedMap,
    liveUpdatedCount: pubRes.matchedCount,
    source: 'public',
    isRateLimit: false,
    error: pubRes.error,
  };
}

// 단일 신규 어종 추가 조회용 (실제 데이터 미확인 시 0원 반환)
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
    currentAvg: 0,
    prevDiffRate: 0,
    hasLiveData: false,
    history7d: [],
    history30d: [],
    markets: targetMarkets.map((m) => ({
      market: m,
      price: 0,
      diff: 0,
      volume: '데이터 없음',
      status: '미집계',
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

// 모든 업체의 1번(주력 원재료), 2번(대표·5점 리뷰 메뉴) 누적 현황을 저장 시간과 함께 텍스트로 포맷
export function buildPartnersAnalysisSnapshotText(partners, meta = {}) {
  const savedAt = meta.savedAt || new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const modeLabel = meta.modeLabel || '누적 스냅샷';
  const newlyUpdatedCount = Number(meta.newlyUpdatedCount) || 0;

  const DUMMY_TEXTS = new Set([
    '미확인',
    '선망 참고등어 / 선어 모듬',
    '선망 참고등어',
    '선어 모듬',
    '네이버 메뉴 서칭 대기',
  ]);

  const cleanDummyList = (arr) =>
    (Array.isArray(arr) ? arr : [])
      .map((v) => String(v || '').trim())
      .filter((v) => v && !DUMMY_TEXTS.has(v));

  const analyzedPartners = (Array.isArray(partners) ? partners : []).filter(
    (p) =>
      p &&
      (p.topIngredientSearched ||
        p.isSearched ||
        cleanDummyList(p.extractedIngredients).length > 0 ||
        cleanDummyList(p.searchedMenus).length > 0 ||
        (p.topReviewMenu && !DUMMY_TEXTS.has(String(p.topReviewMenu).trim())))
  );

  const lines = [
    '====================================================================',
    `[수산물 종합 유통·시세 대시보드 - 거래업체 분석 누적 기록]`,
    `- 저장 일시: ${savedAt}`,
    `- 갱신 구분: ${modeLabel} (이번 신규 갱신: ${newlyUpdatedCount}개사 / 전체 누적: ${analyzedPartners.length}개사)`,
    '====================================================================',
    '',
  ];

  if (analyzedPartners.length === 0) {
    lines.push('저장된 업체 분석 데이터가 없습니다.');
    return lines.join('\n');
  }

  analyzedPartners.forEach((p, idx) => {
    const validIngs = cleanDummyList(p.extractedIngredients);
    const ingList = validIngs.length > 0 ? validIngs.join(', ') : '';

    const menuCandidates = [];
    const topMenu = String(p.topReviewMenu || '').trim();
    if (topMenu && !DUMMY_TEXTS.has(topMenu)) {
      menuCandidates.push(`5점리뷰1위: ${topMenu}`);
    }
    const validMenus = cleanDummyList(p.searchedMenus);
    if (validMenus.length > 0) {
      menuCandidates.push(validMenus.join(', '));
    }

    const menuText = menuCandidates.length > 0 ? menuCandidates.join(' / ') : '';
    const updatedStamp = p.lastAnalyzedAt ? ` (갱신시각: ${p.lastAnalyzedAt})` : '';

    lines.push(`${idx + 1}. ${p.companyName} | ${p.address || '주소 미기재'}${updatedStamp}`);
    lines.push(`   - [1번 정보] 주력 원재료: ${ingList}`);
    lines.push(`   - [2번 정보] 대표·리뷰 메뉴: ${menuText}`);
    lines.push('');
  });

  return lines.join('\n');
}

// Google Apps Script 웹 앱 URL을 통해 내 구글 드라이브로 텍스트 파일 자동 업로드
export async function uploadSnapshotToGoogleDrive(
  webhookUrl,
  fileName,
  content,
  folderName = '수산물_대시보드_분석이력'
) {
  const cleanUrl = String(webhookUrl || '').trim();
  if (!cleanUrl) {
    return { ok: false, error: '구글 드라이브 웹훅 URL이 설정되지 않았습니다.' };
  }

  try {
    await fetch(cleanUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        folderName,
        fileName,
        content,
      }),
    });
    return { ok: true, error: '' };
  } catch (err) {
    return { ok: false, error: err?.message || '구글 드라이브 전송 실패' };
  }
}

export const PDF_MAX_STORAGE_BYTES = 500 * 1024 * 1024; // 총 500MB 한도
export const PDF_SINGLE_FILE_MAX_BYTES = 35 * 1024 * 1024; // 1회 웹훅 전송 안정 한도 (35MB)
export const DRIVE_PDF_FOLDER_NAME = '수산물_대시보드_PDF자료실';

// 구글 드라이브 전용 PDF 폴더 목록 및 500MB 용량 현황 조회
export async function fetchDrivePdfList(webhookUrl, folderName = DRIVE_PDF_FOLDER_NAME) {
  const cleanUrl = String(webhookUrl || '').trim();
  if (!cleanUrl) {
    return { ok: false, files: [], totalBytes: 0, maxBytes: PDF_MAX_STORAGE_BYTES, error: '구글 드라이브 웹훅 URL이 설정되지 않았습니다.' };
  }

  try {
    const sep = cleanUrl.includes('?') ? '&' : '?';
    const url = `${cleanUrl}${sep}action=list_pdfs&folderName=${encodeURIComponent(folderName)}&_t=${Date.now()}`;
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();
    if (!data.ok) {
      return { ok: false, files: [], totalBytes: 0, maxBytes: PDF_MAX_STORAGE_BYTES, error: data.error || '목록 조회 실패' };
    }
    return {
      ok: true,
      files: Array.isArray(data.files) ? data.files : [],
      totalBytes: Number(data.totalBytes || 0),
      maxBytes: Number(data.maxBytes || PDF_MAX_STORAGE_BYTES),
      error: '',
    };
  } catch (err) {
    return {
      ok: false,
      files: [],
      totalBytes: 0,
      maxBytes: PDF_MAX_STORAGE_BYTES,
      error: err?.message || '구글 드라이브 PDF 목록 연결 오류 (Apps Script 새 버전 배포 여부를 확인하세요)',
    };
  }
}

// PDF 파일을 구글 드라이브 전용 폴더로 업로드 (총 500MB 한도 검사)
export async function uploadPdfToGoogleDrive(
  webhookUrl,
  file,
  currentTotalBytes = 0,
  folderName = DRIVE_PDF_FOLDER_NAME
) {
  const cleanUrl = String(webhookUrl || '').trim();
  if (!cleanUrl) {
    return { ok: false, error: '구글 드라이브 웹훅 URL이 설정되지 않았습니다.' };
  }
  if (!file) {
    return { ok: false, error: '선택된 PDF 파일이 없습니다.' };
  }
  if (file.size > PDF_SINGLE_FILE_MAX_BYTES) {
    return {
      ok: false,
      error: `단일 PDF 파일은 35MB 이하만 업로드할 수 있습니다. (현재 파일: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
    };
  }
  if (currentTotalBytes + file.size > PDF_MAX_STORAGE_BYTES) {
    return {
      ok: false,
      error: `최대 저장 한도(500MB)를 초과합니다. 기존 PDF를 일부 삭제한 뒤 다시 올려주세요.`,
    };
  }

  try {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const commaIdx = result.indexOf(',');
        resolve(commaIdx !== -1 ? result.slice(commaIdx + 1) : result);
      };
      reader.onerror = () => reject(new Error('PDF 파일을 읽는 중 오류가 발생했습니다.'));
      reader.readAsDataURL(file);
    });

    const res = await fetch(cleanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'upload_pdf',
        folderName,
        fileName: file.name,
        base64,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      return { ok: false, error: data.error || '구글 드라이브 업로드 실패' };
    }
    return {
      ok: true,
      files: Array.isArray(data.files) ? data.files : [],
      totalBytes: Number(data.totalBytes || 0),
      maxBytes: Number(data.maxBytes || PDF_MAX_STORAGE_BYTES),
      error: '',
    };
  } catch (err) {
    return { ok: false, error: err?.message || '구글 드라이브 전송 중 네트워크 오류' };
  }
}

// 구글 드라이브 전용 폴더 내 특정 PDF 삭제
export async function deleteDrivePdfFile(
  webhookUrl,
  fileId,
  folderName = DRIVE_PDF_FOLDER_NAME
) {
  const cleanUrl = String(webhookUrl || '').trim();
  if (!cleanUrl || !fileId) {
    return { ok: false, error: '삭제 대상 정보가 올바르지 않습니다.' };
  }

  try {
    const res = await fetch(cleanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'delete_pdf',
        folderName,
        fileId,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      return { ok: false, error: data.error || '삭제 실패' };
    }
    return {
      ok: true,
      files: Array.isArray(data.files) ? data.files : [],
      totalBytes: Number(data.totalBytes || 0),
      maxBytes: Number(data.maxBytes || PDF_MAX_STORAGE_BYTES),
      error: '',
    };
  } catch (err) {
    return { ok: false, error: err?.message || '구글 드라이브 삭제 통신 오류' };
  }
}