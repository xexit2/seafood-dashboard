export const APP_ID = 'seafood-dashboard-app';
export const APP_VERSION = 'v3.3 · 모듈화 경량판';

// [보안 기본 마스터 PIN] 관리자가 원하는 4자리 숫자로 변경 가능 (클라우드 DB에 저장된 PIN이 있으면 최우선 적용됨)
export const DEFAULT_MASTER_PIN = '1234';

// 대표님 전용 Supabase 실시간 동기화 기본 설정 (PC · 모바일 무설정 자동 연동)
export const DEFAULT_SUPABASE_URL = 'https://xoprcktqaekcmkuhdehg.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvcHJja3RxYWVrY21rdWhkZWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwMDc3NDUsImV4cCI6MjExMDU4Mzc0NX0.9Jw9TCCYNWYkx2ZtK-A45s2OVHOHEDDASqVV0zIzeM0';

export const INITIAL_WEATHER_DATA = {
  busan: {
    id: 'busan',
    name: '부산 · 남해동부 (공동어시장)',
    lat: 35.09,
    lon: 129.04,
    zoom: 8,
    airTemp: 14,
    waterTemp: 16.5,
    windSpeed: 5.4,
    windDir: '북서풍',
    waveHeight: 1.1,
    status: '조업 원활',
    statusType: 'good',
    updatedAt: '오늘 06:00 기상청·Windy 기준',
    summary:
      '연안 파고 1.1m 내외로 선망 및 연안 자망 어선 입출항이 원활하며 당일 위판 물량 공급이 안정적입니다.',
  },
  jeju: {
    id: 'jeju',
    name: '제주 · 추자 근해 (한림·서귀포)',
    lat: 33.45,
    lon: 126.55,
    zoom: 8,
    airTemp: 16,
    waterTemp: 18.2,
    windSpeed: 11.8,
    windDir: '북동풍',
    waveHeight: 2.6,
    status: '풍랑 주의',
    statusType: 'warning',
    updatedAt: '오늘 06:00 기상청·Windy 기준',
    summary:
      '제주 먼바다 풍속 11m/s 이상 강풍으로 소형 갈치 채낚기 어선 출항이 일부 제한되어 산지 시세 강세가 예상됩니다.',
  },
  tongyeong: {
    id: 'tongyeong',
    name: '통영 · 거제 (남해중부)',
    lat: 34.84,
    lon: 128.43,
    zoom: 9,
    airTemp: 13,
    waterTemp: 15.8,
    windSpeed: 6.2,
    windDir: '서풍',
    waveHeight: 0.9,
    status: '조업 양호',
    statusType: 'good',
    updatedAt: '오늘 06:00 기상청·Windy 기준',
    summary:
      '내만 해상 잔잔하여 가두리 양식장 출하 및 활어 운반차량 선적 작업에 지장이 없습니다.',
  },
  east: {
    id: 'east',
    name: '포항 · 구룡포 (동해남부)',
    lat: 36.01,
    lon: 129.55,
    zoom: 8,
    airTemp: 11,
    waterTemp: 14.1,
    windSpeed: 8.9,
    windDir: '북풍',
    waveHeight: 1.9,
    status: '일부 주의',
    statusType: 'caution',
    updatedAt: '오늘 06:00 기상청·Windy 기준',
    summary:
      '동해 먼바다 너울성 파도가 다소 높아 대게·오징어 근해 어선 조업 시 기상 특보 확인이 필요합니다.',
  },
};

export const INITIAL_SPECIES_DATA = {
  삼치: {
    name: '삼치',
    grade: '선망 특대 (3kg 이상/마리)',
    unit: '원/상자(10kg)',
    currentAvg: 64000,
    prevDiffRate: 6.2,
    history7d: [
      { date: '11/12', price: 58500 },
      { date: '11/13', price: 59200 },
      { date: '11/14', price: 60500 },
      { date: '11/15', price: 61800 },
      { date: '11/16', price: 62500 },
      { date: '11/17', price: 60300 },
      { date: '11/18', price: 64000 },
    ],
    history30d: [
      { date: '10/20', price: 52000 },
      { date: '10/27', price: 55400 },
      { date: '11/03', price: 58000 },
      { date: '11/10', price: 61000 },
      { date: '11/18', price: 64000 },
    ],
    markets: [
      { market: '부산공동어시장', price: 64500, diff: 3800, volume: '1,850 상자', status: '강세' },
      { market: '여수수협위판장', price: 65200, diff: 4100, volume: '1,120 상자', status: '급등' },
      { market: '서귀포수협위판장', price: 62300, diff: 2900, volume: '740 상자', status: '상승' },
    ],
  },
  금태: {
    name: '금태',
    grade: '눈볼대 특대 (400g 이상)',
    unit: '원/kg',
    currentAvg: 48500,
    prevDiffRate: 4.5,
    history7d: [
      { date: '11/12', price: 45000 },
      { date: '11/13', price: 45800 },
      { date: '11/14', price: 46200 },
      { date: '11/15', price: 47000 },
      { date: '11/16', price: 47500 },
      { date: '11/17', price: 46400 },
      { date: '11/18', price: 48500 },
    ],
    history30d: [
      { date: '10/20', price: 41000 },
      { date: '10/27', price: 43200 },
      { date: '11/03', price: 44800 },
      { date: '11/10', price: 46500 },
      { date: '11/18', price: 48500 },
    ],
    markets: [
      { market: '부산공동어시장', price: 49000, diff: 2200, volume: '520 kg', status: '강세' },
      { market: '속초수협위판장', price: 48200, diff: 1800, volume: '340 kg', status: '상승' },
      { market: '제주한림수협', price: 48300, diff: 2000, volume: '290 kg', status: '강세' },
    ],
  },
  고등어: {
    name: '고등어',
    grade: '선망 대 (10kg 상자)',
    unit: '원/상자',
    currentAvg: 38500,
    prevDiffRate: -2.1,
    history7d: [
      { date: '11/12', price: 40500 },
      { date: '11/13', price: 40000 },
      { date: '11/14', price: 39800 },
      { date: '11/15', price: 39200 },
      { date: '11/16', price: 39500 },
      { date: '11/17', price: 39300 },
      { date: '11/18', price: 38500 },
    ],
    history30d: [
      { date: '10/20', price: 42000 },
      { date: '10/27', price: 41200 },
      { date: '11/03', price: 40100 },
      { date: '11/10', price: 39400 },
      { date: '11/18', price: 38500 },
    ],
    markets: [
      { market: '부산공동어시장', price: 38500, diff: -800, volume: '8,500 상자', status: '약세' },
      { market: '제주한림수협', price: 39200, diff: -500, volume: '2,100 상자', status: '보합' },
      { market: '삼천포수협위판장', price: 37800, diff: -1000, volume: '1,650 상자', status: '약세' },
    ],
  },
  전갱이: {
    name: '전갱이',
    grade: '선망 중·대 (10kg 상자)',
    unit: '원/상자',
    currentAvg: 29800,
    prevDiffRate: 3.1,
    history7d: [
      { date: '11/12', price: 28000 },
      { date: '11/13', price: 28400 },
      { date: '11/14', price: 28700 },
      { date: '11/15', price: 29000 },
      { date: '11/16', price: 29200 },
      { date: '11/17', price: 28900 },
      { date: '11/18', price: 29800 },
    ],
    history30d: [
      { date: '10/20', price: 26500 },
      { date: '10/27', price: 27200 },
      { date: '11/03', price: 28100 },
      { date: '11/10', price: 29000 },
      { date: '11/18', price: 29800 },
    ],
    markets: [
      { market: '부산공동어시장', price: 30000, diff: 900, volume: '3,400 상자', status: '상승' },
      { market: '통영수협위판장', price: 29500, diff: 800, volume: '1,820 상자', status: '상승' },
      { market: '제주한림수협', price: 29900, diff: 1000, volume: '1,450 상자', status: '강세' },
    ],
  },
};

export const INITIAL_PARTNERS = [];
export const INITIAL_SNS_FEEDS = [];

export function isLegacySpeciesMap(spMap) {
  if (!spMap || typeof spMap !== 'object') return true;
  const keys = Object.keys(spMap);
  if (keys.length === 0) return true;
  const legacyOnly = ['대방어', '은갈치', '참돔', '광어', '오징어', '꽃게'];
  const hasNewCore = keys.includes('삼치') && keys.includes('금태');
  const hasLegacy = keys.some((k) => legacyOnly.includes(k));
  return !hasNewCore && hasLegacy;
}

export const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num);

export function formatDateTimeKST(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}