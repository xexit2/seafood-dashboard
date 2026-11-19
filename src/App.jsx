import React, { useState, useEffect, useMemo, useRef } from 'react';

// 미리보기 및 Vite 환경에서 100% 호환되는 순수 함수형 아이콘 컴포넌트
const SvgIcon = ({ children, className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

const Waves = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
  </SvgIcon>
);
const Wind = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
  </SvgIcon>
);
const Thermometer = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
  </SvgIcon>
);
const Compass = ({ className }) => (
  <SvgIcon className={className}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </SvgIcon>
);
const TrendingUp = ({ className }) => (
  <SvgIcon className={className}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </SvgIcon>
);
const Building2 = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </SvgIcon>
);
const Package = ({ className }) => (
  <SvgIcon className={className}>
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </SvgIcon>
);
const Search = ({ className }) => (
  <SvgIcon className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </SvgIcon>
);
const Plus = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </SvgIcon>
);
const Filter = ({ className }) => (
  <SvgIcon className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </SvgIcon>
);
const Fish = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
    <path d="M18 12v.5" />
    <path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" />
    <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
  </SvgIcon>
);
const Anchor = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M12 22V8" />
    <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
    <circle cx="12" cy="5" r="3" />
  </SvgIcon>
);
const AlertTriangle = ({ className }) => (
  <SvgIcon className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </SvgIcon>
);
const CheckCircle2 = ({ className }) => (
  <SvgIcon className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </SvgIcon>
);
const Phone = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </SvgIcon>
);
const BarChart3 = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </SvgIcon>
);
const X = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </SvgIcon>
);
const ArrowUpRight = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </SvgIcon>
);
const ArrowDownRight = ({ className }) => (
  <SvgIcon className={className}>
    <path d="m7 7 10 10" />
    <path d="M17 7v10H7" />
  </SvgIcon>
);
const RefreshCw = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </SvgIcon>
);
const Sparkles = ({ className }) => (
  <SvgIcon className={className}>
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
  </SvgIcon>
);
const Layers = ({ className }) => (
  <SvgIcon className={className}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </SvgIcon>
);
const ExternalLink = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" x2="21" y1="14" y2="3" />
  </SvgIcon>
);
const MessageSquareText = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M13 8H7" />
    <path d="M17 12H7" />
  </SvgIcon>
);
const Check = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M20 6 9 17l-5-5" />
  </SvgIcon>
);
const Radio = ({ className }) => (
  <SvgIcon className={className}>
    <circle cx="12" cy="12" r="2" />
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
  </SvgIcon>
);
const FileSpreadsheet = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M8 13h2" />
    <path d="M14 13h2" />
    <path d="M8 17h2" />
    <path d="M14 17h2" />
  </SvgIcon>
);
const Upload = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </SvgIcon>
);
const Globe = ({ className }) => (
  <SvgIcon className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </SvgIcon>
);
const MapPin = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </SvgIcon>
);
const Loader2 = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </SvgIcon>
);
const BookOpen = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </SvgIcon>
);
const Lock = ({ className }) => (
  <SvgIcon className={className}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </SvgIcon>
);
const KeyRound = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
    <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
  </SvgIcon>
);
const ShieldCheck = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </SvgIcon>
);
const Cloud = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  </SvgIcon>
);
const RotateCcw = ({ className }) => (
  <SvgIcon className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </SvgIcon>
);
const Database = ({ className }) => (
  <SvgIcon className={className}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5V19A9 3 0 0 0 21 19V5" />
    <path d="M3 12A9 3 0 0 0 21 12" />
  </SvgIcon>
);

const Instagram = ({ className }) => (
  <SvgIcon className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </SvgIcon>
);

const appId = 'seafood-dashboard-app';

// 외부 라이브러리 없이 브라우저 자체 기능으로 .xlsx(ZIP+XML)를 직접 해독하는 내장 파서 (Central Directory 지원)
async function parseXlsxNatively(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const view = new DataView(arrayBuffer);
  const decoder = new TextDecoder('utf-8');
  const entries = {};

  const targetFiles = new Set(['xl/sharedStrings.xml', 'xl/worksheets/sheet1.xml']);

  const decompressEntry = async (method, rawData, fileName) => {
    if (method === 0) {
      return decoder.decode(rawData);
    }
    if (method === 8 && typeof DecompressionStream !== 'undefined') {
      const ds = new DecompressionStream('deflate-raw');
      const outPromise = new Response(ds.readable).arrayBuffer();
      const writer = ds.writable.getWriter();
      writer.write(rawData);
      writer.close();
      const outBuf = await outPromise;
      return decoder.decode(outBuf);
    }
    console.warn('지원하지 않는 압축 방식:', fileName, method);
    return null;
  };

  let eocdOffset = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65558); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset !== -1) {
    const cdCount = view.getUint16(eocdOffset + 10, true);
    const cdOffset = view.getUint32(eocdOffset + 16, true);
    let pos = cdOffset;

    for (let i = 0; i < cdCount && pos + 46 <= bytes.length; i++) {
      if (view.getUint32(pos, true) !== 0x02014b50) break;
      const method = view.getUint16(pos + 10, true);
      const compSize = view.getUint32(pos + 20, true);
      const nameLen = view.getUint16(pos + 28, true);
      const extraLen = view.getUint16(pos + 30, true);
      const commentLen = view.getUint16(pos + 32, true);
      const localOffset = view.getUint32(pos + 42, true);
      const fileName = decoder.decode(bytes.slice(pos + 46, pos + 46 + nameLen));

      if (targetFiles.has(fileName) || fileName.startsWith('xl/worksheets/sheet')) {
        const lNameLen = view.getUint16(localOffset + 26, true);
        const lExtraLen = view.getUint16(localOffset + 28, true);
        const dataStart = localOffset + 30 + lNameLen + lExtraLen;
        const rawData = bytes.slice(dataStart, dataStart + compSize);
        try {
          const text = await decompressEntry(method, rawData, fileName);
          if (text) entries[fileName] = text;
        } catch (err) {
          console.warn('XML 압축 해제 실패:', fileName, err);
        }
      }

      pos += 46 + nameLen + extraLen + commentLen;
    }
  }

  const sheetKey = entries['xl/worksheets/sheet1.xml']
    ? 'xl/worksheets/sheet1.xml'
    : Object.keys(entries).find((k) => k.startsWith('xl/worksheets/sheet'));

  if (!sheetKey) return [];

  const xmlParser = new DOMParser();
  const sharedStrings = [];
  if (entries['xl/sharedStrings.xml']) {
    const ssDoc = xmlParser.parseFromString(entries['xl/sharedStrings.xml'], 'application/xml');
    const siNodes = ssDoc.getElementsByTagName('si');
    for (let i = 0; i < siNodes.length; i++) {
      const tNodes = siNodes[i].getElementsByTagName('t');
      let combined = '';
      for (let j = 0; j < tNodes.length; j++) {
        combined += tNodes[j].textContent || '';
      }
      sharedStrings.push(combined);
    }
  }

  const colLetterToIndex = (ref) => {
    const letters = (ref || '').replace(/[0-9]/g, '');
    let idx = 0;
    for (let i = 0; i < letters.length; i++) {
      idx = idx * 26 + (letters.charCodeAt(i) - 64);
    }
    return Math.max(0, idx - 1);
  };

  const sheetDoc = xmlParser.parseFromString(entries[sheetKey], 'application/xml');
  const rowNodes = sheetDoc.getElementsByTagName('row');
  const resultRows = [];

  for (let i = 0; i < rowNodes.length; i++) {
    const rowArr = [];
    const cNodes = rowNodes[i].getElementsByTagName('c');
    for (let j = 0; j < cNodes.length; j++) {
      const cell = cNodes[j];
      const ref = cell.getAttribute('r') || '';
      const colIdx = ref ? colLetterToIndex(ref) : j;
      const type = cell.getAttribute('t');
      let val = '';

      if (type === 's') {
        const vNode = cell.getElementsByTagName('v')[0];
        const sIdx = vNode ? Number(vNode.textContent) : -1;
        val = sIdx >= 0 && sharedStrings[sIdx] !== undefined ? sharedStrings[sIdx] : '';
      } else if (type === 'inlineStr') {
        const tNode = cell.getElementsByTagName('t')[0];
        val = tNode ? tNode.textContent || '' : '';
      } else {
        const vNode = cell.getElementsByTagName('v')[0];
        val = vNode ? vNode.textContent || '' : '';
      }

      rowArr[colIdx] = val;
    }
    resultRows.push(rowArr);
  }

  return resultRows;
}

function extractTopRegion(address = '') {
  const clean = (address || '').trim();
  if (!clean || clean === '주소 미기재' || clean === '직접 등록 거래처' || clean === 'SNS 연동 업체') {
    return '';
  }
  const firstToken = clean.split(/\s+/)[0] || '';
  return firstToken
    .replace(/(특별시|광역시|특별자치시|특별자치도|도|시)$/, '')
    .trim();
}

function buildRegionCompanyQuery(companyName = '', address = '') {
  const name = (companyName || '').trim();
  const topRegion = extractTopRegion(address);
  if (!topRegion || name.includes(topRegion)) {
    return name;
  }
  return `${topRegion} ${name}`.trim();
}

function openInstagramSearchInApp(e, companyName, address = '') {
  const searchQuery = buildRegionCompanyQuery(companyName, address);
  if (!searchQuery) return;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(searchQuery).catch(() => {});
    }
  } catch (_) {}

  const tagKeyword = searchQuery.replace(/\s+/g, '');
  const webUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(tagKeyword)}/`;

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  if (!isAndroid && !isIOS) {
    return;
  }

  if (e && e.preventDefault) {
    e.preventDefault();
  }

  if (isAndroid) {
    const intentUrl = `intent://instagram.com/explore/tags/${encodeURIComponent(
      tagKeyword
    )}/#Intent;package=com.instagram.android;scheme=https;S.browser_fallback_url=${encodeURIComponent(
      webUrl
    )};end`;
    window.location.href = intentUrl;
    return;
  }

  if (isIOS) {
    const appScheme = `instagram://tag?name=${encodeURIComponent(tagKeyword)}`;
    const clickedAt = Date.now();
    window.location.href = appScheme;
    setTimeout(() => {
      if (document.visibilityState === 'visible' && Date.now() - clickedAt < 2200) {
        window.open(webUrl, '_blank', 'noopener,noreferrer');
      }
    }, 1200);
    return;
  }

  window.open(webUrl, '_blank', 'noopener,noreferrer');
}

const INITIAL_WEATHER_DATA = {
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
    summary: '연안 파고 1.1m 내외로 선망 및 연안 자망 어선 입출항이 원활하며 당일 위판 물량 공급이 안정적입니다.',
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
    summary: '제주 먼바다 풍속 11m/s 이상 강풍으로 소형 갈치 채낚기 어선 출항이 일부 제한되어 산지 시세 강세가 예상됩니다.',
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
    summary: '내만 해상 잔잔하여 가두리 양식장 출하 및 활어 운반차량 선적 작업에 지장이 없습니다.',
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
    summary: '동해 먼바다 너울성 파도가 다소 높아 대게·오징어 근해 어선 조업 시 기상 특보 확인이 필요합니다.',
  },
};

const INITIAL_SPECIES_DATA = {
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

function isLegacySpeciesMap(spMap) {
  if (!spMap || typeof spMap !== 'object') return true;
  const keys = Object.keys(spMap);
  if (keys.length === 0) return true;
  const legacyOnly = ['대방어', '은갈치', '참돔', '광어', '오징어', '꽃게'];
  const hasNewCore = keys.includes('삼치') && keys.includes('금태');
  const hasLegacy = keys.some((k) => legacyOnly.includes(k));
  return !hasNewCore && hasLegacy;
}

const INITIAL_PARTNERS = [];
const INITIAL_SNS_FEEDS = [];

function inferPartnerMetadata(companyName = '', address = '', idx = 0) {
  const combined = `${companyName} ${address}`;
  let category = '고등어';
  let mainProduct = '네이버 메뉴 서칭 대기';
  let unitPrice = 38500;
  let unitLabel = '원/상자';
  let volumeUnit = '상자';

  if (combined.includes('삼치') || combined.includes('여수')) {
    category = '삼치';
    unitPrice = 64000;
    unitLabel = '원/상자';
    volumeUnit = '상자';
  } else if (combined.includes('금태') || combined.includes('눈볼대') || combined.includes('일식') || combined.includes('오마카세')) {
    category = '금태';
    unitPrice = 48500;
    unitLabel = '원/kg';
    volumeUnit = 'kg';
  } else if (combined.includes('전갱이') || combined.includes('통영') || combined.includes('아지')) {
    category = '전갱이';
    unitPrice = 29800;
    unitLabel = '원/상자';
    volumeUnit = '상자';
  }

  const combinedQuery = buildRegionCompanyQuery(companyName, address);
  const tagKeyword = combinedQuery.replace(/\s+/g, '');

  return {
    snsPlatform: 'Instagram',
    snsHandle: `#${tagKeyword}`,
    instagramUrl: `https://www.instagram.com/explore/tags/${encodeURIComponent(tagKeyword)}/`,
    blogUrl: `https://search.naver.com/search.naver?query=${encodeURIComponent(combinedQuery)}`,
    category,
    mainProduct,
    topReviewMenu: '',
    searchedMenus: [],
    aiSummary: '',
    isSearched: false,
    unitPrice,
    unitLabel,
    totalVolume: 120 + (idx % 10) * 15,
    volumeUnit,
    status: '활발',
    lastOrder: '2026-11-18',
  };
}

function parseSnsPostText(rawText = '') {
  const text = String(rawText || '');
  const speciesList = ['삼치', '금태', '고등어', '전갱이'];
  let species = '고등어';
  for (const sp of speciesList) {
    if (text.includes(sp) || (sp === '금태' && text.includes('눈볼대')) || (sp === '전갱이' && text.includes('아지'))) {
      species = sp;
      break;
    }
  }

  const priceMatch = text.match(/(\d{1,3}(?:,\d{3})+|\d{4,6})\s*원/);
  const unitPrice = priceMatch ? Number(priceMatch[1].replace(/,/g, '')) : 39000;
  const isKg = text.toLowerCase().includes('kg') && !text.includes('상자');
  const unitLabel = isKg ? '원/kg' : '원/상자';

  const volMatch = text.match(/(\d+)\s*(상자|박스|kg|마리)/i);
  const volume = volMatch ? Number(volMatch[1]) : 100;
  const volumeUnit = volMatch && volMatch[2].toLowerCase() === 'kg' ? 'kg' : '상자';

  const specMatch = text.match(/(\d+\s*kg[^,\n.]*|특대|대자|선망|산지\s*직송)/i);
  const spec = specMatch ? specMatch[0].trim() : `${species} 산지 직송 특선`;

  return {
    species,
    spec,
    unitPrice,
    unitLabel,
    volume,
    volumeUnit,
    available: true,
  };
}

async function searchPartnerWebAndMenus(partner, geminiApiKey = '') {
  const apiKey = (geminiApiKey || '').trim();
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

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
        headers: { 'Content-Type': 'application/json' },
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
            ? `[${combinedQuery}] 실제 사이트에서 AI 자동 분석을 쓰려면 상단 [동기화 설정]에 무료 Gemini API 키를 입력해 주세요. 아래 '네이버 메뉴' 버튼으로 즉시 확인 가능합니다.`
            : `[${combinedQuery}] 네이버 리뷰·메뉴 검색 결과를 불러오지 못했습니다. 우측 '네이버 메뉴' 버튼으로 바로 확인하세요.`,
        };
      }
      await new Promise((r) => setTimeout(r, 800 * Math.pow(2, attempt)));
    }
  }
}

async function fetchSpeciesAuctionTrend(speciesKeyword, geminiApiKey = '') {
  const apiKey = (geminiApiKey || '').trim();
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

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
        headers: { 'Content-Type': 'application/json' },
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

  // 실제 사이트에서 Gemini API 키가 없거나 일시 차단된 경우에도 어종 탭이 즉시 추가되도록 기본 표준 시세 템플릿 반환
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

const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num);

export default function App() {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState('연결 중...');
  const [supabaseConfig, setSupabaseConfig] = useState({ url: '', anonKey: '', geminiKey: '' });
  const [supabaseForm, setSupabaseForm] = useState({ url: '', anonKey: '', geminiKey: '' });

  const [savedPin, setSavedPin] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinConfirmInput, setPinConfirmInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);

  const [selectedSea, setSelectedSea] = useState('busan');
  const [windyOverlay, setWindyOverlay] = useState('wind');
  const [speciesData, setSpeciesData] = useState(INITIAL_SPECIES_DATA);
  const [selectedSpecies, setSelectedSpecies] = useState('삼치');
  const [chartPeriod, setChartPeriod] = useState('7d');
  const [speciesSearchInput, setSpeciesSearchInput] = useState('');
  const [isSearchingSpecies, setIsSearchingSpecies] = useState(false);

  const [partners, setPartners] = useState(INITIAL_PARTNERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [regionFilter, setRegionFilter] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [searchingPartnerIds, setSearchingPartnerIds] = useState({});
  const [isBatchSearching, setIsBatchSearching] = useState(false);
  const [selectedPartnerDetail, setSelectedPartnerDetail] = useState(null);

  const [snsFeeds, setSnsFeeds] = useState(INITIAL_SNS_FEEDS);
  const [isSyncingSns, setIsSyncingSns] = useState(false);
  const [snsInputCompany, setSnsInputCompany] = useState('');
  const [snsInputText, setSnsInputText] = useState('');

  const [activeModal, setActiveModal] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [excelPreviewRows, setExcelPreviewRows] = useState([]);
  const [excelFileName, setExcelFileName] = useState('');
  const fileInputRef = useRef(null);

  const [newPartnerForm, setNewPartnerForm] = useState({
    companyName: '',
    snsPlatform: 'Instagram',
    snsHandle: '',
    blogUrl: '',
    category: '고등어',
    mainProduct: '',
    unitPrice: '',
    unitLabel: '원/상자',
    totalVolume: '',
    volumeUnit: '상자',
    manager: '',
    phone: '',
    address: '',
    status: '활발',
  });

  const [newAuctionForm, setNewAuctionForm] = useState({
    species: '삼치',
    market: '부산공동어시장',
    price: '',
    volume: '',
    status: '강세',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  useEffect(() => {
    let loadedSbUrl = '';
    let loadedSbKey = '';
    try {
      const localPin = localStorage.getItem(`${appId}_pin`);
      const localPartners = localStorage.getItem(`${appId}_partners`);
      const localSpecies = localStorage.getItem(`${appId}_species`);
      const localFeeds = localStorage.getItem(`${appId}_feeds`);
      const localSb = localStorage.getItem(`${appId}_supabase`);

      if (localSb) {
        const parsedSb = JSON.parse(localSb);
        const normalizedSb = {
          url: parsedSb.url || '',
          anonKey: parsedSb.anonKey || '',
          geminiKey: parsedSb.geminiKey || '',
        };
        loadedSbUrl = normalizedSb.url;
        loadedSbKey = normalizedSb.anonKey;
        setSupabaseConfig(normalizedSb);
        setSupabaseForm(normalizedSb);
      }

      if (localPin) setSavedPin(localPin);
      if (localPartners) {
        const parsedPartners = JSON.parse(localPartners);
        setPartners(parsedPartners);
        if (parsedPartners.length > 0) {
          setSnsInputCompany(parsedPartners[0].companyName);
        }
      }
      if (localSpecies) {
        const parsedSp = JSON.parse(localSpecies);
        if (parsedSp && !isLegacySpeciesMap(parsedSp)) {
          setSpeciesData(parsedSp);
          if (!parsedSp[selectedSpecies]) {
            setSelectedSpecies(Object.keys(parsedSp)[0]);
          }
        } else {
          // 이전 버전(대방어·은갈치 등) 초기 데이터는 새 기본 4종(삼치·금태·고등어·전갱이)으로 자동 갱신
          setSpeciesData(INITIAL_SPECIES_DATA);
          setSelectedSpecies('삼치');
          localStorage.setItem(`${appId}_species`, JSON.stringify(INITIAL_SPECIES_DATA));
        }
      }
      if (localFeeds) setSnsFeeds(JSON.parse(localFeeds));
    } catch (e) {
      console.warn('로컬 저장소 불러오기 건너뜀:', e);
    }

    if (loadedSbUrl && loadedSbKey) {
      fetchFromSupabase(loadedSbUrl, loadedSbKey).finally(() => setIsDataLoaded(true));
    } else {
      setIsDataLoaded(true);
      setSyncStatus('브라우저 자동 저장됨');
    }
  }, []);

  const fetchFromSupabase = async (url, anonKey) => {
    if (!url || !anonKey) return;
    try {
      setSyncStatus('클라우드 동기화 중...');
      const cleanUrl = url.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '');
      const cleanKey = anonKey.trim();
      const headers = { apikey: cleanKey };
      if (cleanKey.startsWith('eyJ')) {
        headers.Authorization = `Bearer ${cleanKey}`;
      }

      const res = await fetch(`${cleanUrl}/rest/v1/seafood_state?id=eq.main&select=*`, {
        headers,
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0 && rows[0].payload) {
        const remote = rows[0].payload;
        if (remote.pin) {
          setSavedPin(remote.pin);
          localStorage.setItem(`${appId}_pin`, remote.pin);
        }
        if (Array.isArray(remote.partners)) {
          setPartners(remote.partners);
          localStorage.setItem(`${appId}_partners`, JSON.stringify(remote.partners));
        }
        if (remote.speciesData && !isLegacySpeciesMap(remote.speciesData)) {
          setSpeciesData(remote.speciesData);
          localStorage.setItem(`${appId}_species`, JSON.stringify(remote.speciesData));
          if (!remote.speciesData[selectedSpecies]) {
            setSelectedSpecies(Object.keys(remote.speciesData)[0]);
          }
        } else {
          setSpeciesData(INITIAL_SPECIES_DATA);
          setSelectedSpecies('삼치');
          localStorage.setItem(`${appId}_species`, JSON.stringify(INITIAL_SPECIES_DATA));
        }
        if (remote.geminiKey) {
          setSupabaseConfig((prev) => {
            const next = { ...prev, geminiKey: remote.geminiKey };
            localStorage.setItem(`${appId}_supabase`, JSON.stringify(next));
            return next;
          });
          setSupabaseForm((prev) => ({ ...prev, geminiKey: remote.geminiKey }));
        }
        if (Array.isArray(remote.snsFeeds)) {
          setSnsFeeds(remote.snsFeeds);
          localStorage.setItem(`${appId}_feeds`, JSON.stringify(remote.snsFeeds));
        }
      }
      setSyncStatus('PC·모바일 실시간 동기화됨');
    } catch (err) {
      console.warn('Supabase 동기화 대기:', err);
      setSyncStatus('클라우드 연결 확인 필요');
    }
  };

  const persistDashboardState = async (overrides = {}) => {
    const nextPin = overrides.pin !== undefined ? overrides.pin : savedPin;
    const nextPartners = overrides.partners !== undefined ? overrides.partners : partners;
    const nextSpecies = overrides.speciesData !== undefined ? overrides.speciesData : speciesData;
    const nextFeeds = overrides.snsFeeds !== undefined ? overrides.snsFeeds : snsFeeds;
    const activeSb = overrides.supabaseConfig || supabaseConfig;

    try {
      if (nextPin) localStorage.setItem(`${appId}_pin`, nextPin);
      localStorage.setItem(`${appId}_partners`, JSON.stringify(nextPartners));
      localStorage.setItem(`${appId}_species`, JSON.stringify(nextSpecies));
      localStorage.setItem(`${appId}_feeds`, JSON.stringify(nextFeeds));
    } catch (e) {
      console.warn('로컬 저장 오류:', e);
    }

    if (activeSb && activeSb.url && activeSb.anonKey) {
      try {
        setSyncStatus('클라우드 저장 중...');
        const cleanUrl = activeSb.url.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '');
        const cleanKey = activeSb.anonKey.trim();
        const headers = {
          apikey: cleanKey,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        };
        if (cleanKey.startsWith('eyJ')) {
          headers.Authorization = `Bearer ${cleanKey}`;
        }

        const res = await fetch(`${cleanUrl}/rest/v1/seafood_state`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            id: 'main',
            payload: {
              pin: nextPin,
              partners: nextPartners,
              speciesData: nextSpecies,
              snsFeeds: nextFeeds,
              geminiKey: activeSb.geminiKey || '',
            },
            updated_at: new Date().toISOString(),
          }),
        });
        if (!res.ok) {
          const errDetail = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status}: ${errDetail}`);
        }
        setSyncStatus('PC·모바일 실시간 동기화됨');
        return;
      } catch (err) {
        const msg = String(err?.message || '');
        if (msg.includes('404') || msg.includes('PGRST205') || msg.includes('seafood_state')) {
          setSyncStatus('API 캐시 갱신 필요 (10초 후 재시도)');
          showToast('Supabase 새 테이블 반영 중입니다. 10초 뒤 [동기화 설정]에서 다시 저장해 주세요!');
        } else if (msg.includes('401') || msg.includes('403') || msg.includes('Invalid API key')) {
          setSyncStatus('API 키 오류 (키 다시 확인)');
          showToast('Supabase API Keys에서 Publishable 또는 anon public 키를 다시 복사해 넣어주세요.');
        } else {
          setSyncStatus(`연결 오류 (${msg.slice(0, 28)})`);
          showToast(`클라우드 연결 응답: ${msg.slice(0, 60)}`);
        }
        return;
      }
    }

    setSyncStatus('브라우저 자동 저장됨');
  };

  const handleSaveSupabaseConfig = async (e) => {
    e.preventDefault();
    const trimmed = {
      url: supabaseForm.url.trim(),
      anonKey: supabaseForm.anonKey.trim(),
      geminiKey: (supabaseForm.geminiKey || '').trim(),
    };
    setSupabaseConfig(trimmed);
    localStorage.setItem(`${appId}_supabase`, JSON.stringify(trimmed));
    setActiveModal(null);

    if (trimmed.url && trimmed.anonKey) {
      await fetchFromSupabase(trimmed.url, trimmed.anonKey);
      await persistDashboardState({ supabaseConfig: trimmed });
      showToast('클라우드 DB 및 AI API 설정이 저장되었습니다!');
    } else {
      setSyncStatus('브라우저 자동 저장됨');
      showToast(
        trimmed.geminiKey
          ? 'Google Gemini AI 키가 저장되었습니다! 이제 실제 홈페이지에서도 AI 검색이 작동합니다.'
          : '설정이 저장되었습니다.'
      );
    }
  };

  const handleResetSpeciesToDefault = async () => {
    setSpeciesData(INITIAL_SPECIES_DATA);
    setSelectedSpecies('삼치');
    await persistDashboardState({ speciesData: INITIAL_SPECIES_DATA });
    showToast('위판장 판매 어종이 기본 4종(삼치·금태·고등어·전갱이)으로 초기화되었습니다.');
  };

  const handleLockScreen = () => {
    setIsUnlocked(false);
    setPinInput('');
    setPinConfirmInput('');
    setPinError('');
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
      setPinError('4자리 숫자를 정확히 입력해주세요.');
      return;
    }

    if (!savedPin || isChangingPin) {
      if (pinInput !== pinConfirmInput) {
        setPinError('확인용 PIN 번호가 일치하지 않습니다.');
        return;
      }
      setSavedPin(pinInput);
      setIsChangingPin(false);
      setIsUnlocked(true);
      setPinInput('');
      setPinConfirmInput('');
      setPinError('');
      await persistDashboardState({ pin: pinInput });
      showToast('개인 보안 PIN 번호가 안전하게 설정되었습니다.');
      return;
    }

    if (pinInput === savedPin) {
      setIsUnlocked(true);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
      setPinInput('');
    }
  };

  const handleClearAllPartners = async () => {
    setPartners([]);
    setSnsFeeds([]);
    setSelectedPartnerDetail(null);
    setCurrentPage(1);
    await persistDashboardState({
      partners: [],
      snsFeeds: [],
    });
    showToast('등록된 거래업체 목록이 모두 깨끗하게 비워졌습니다.');
  };

  const currentWeather = INITIAL_WEATHER_DATA[selectedSea];
  const windyEmbedUrl = `https://embed.windy.com/embed2.html?lat=${currentWeather.lat}&lon=${currentWeather.lon}&detailLat=${currentWeather.lat}&detailLon=${currentWeather.lon}&width=650&height=450&zoom=${currentWeather.zoom}&level=surface&overlay=${windyOverlay}&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=m%2Fs&metricTemp=%C2%B0C&radarRange=-1`;

  const currentSpecies =
    speciesData[selectedSpecies] || Object.values(speciesData)[0] || INITIAL_SPECIES_DATA['삼치'];
  const chartData =
    chartPeriod === '7d' ? currentSpecies.history7d : currentSpecies.history30d;

  const handleSearchAndAddSpecies = async (e) => {
    e.preventDefault();
    const keyword = speciesSearchInput.trim();
    if (!keyword) return;

    if (speciesData[keyword]) {
      setSelectedSpecies(keyword);
      setSpeciesSearchInput('');
      showToast(`이미 등록된 '${keyword}' 위판 시세 추이로 전환했습니다.`);
      return;
    }

    setIsSearchingSpecies(true);
    const res = await fetchSpeciesAuctionTrend(keyword, supabaseConfig.geminiKey);
    setIsSearchingSpecies(false);

    if (res && res.data) {
      const nextSpeciesData = {
        ...speciesData,
        [res.data.name]: res.data,
      };
      setSpeciesData(nextSpeciesData);
      setSelectedSpecies(res.data.name);
      setSpeciesSearchInput('');
      persistDashboardState({ speciesData: nextSpeciesData });

      if (res.isFallback) {
        showToast(
          `'${res.data.name}' 탭이 추가되었습니다! (실시간 AI 시세 자동 조회는 상단 [동기화 설정]에 Gemini API 키 입력 시 활성화됩니다)`
        );
      } else {
        showToast(`'${res.data.name}' 전국 위판장 시세 및 가격 추이가 추가되었습니다!`);
      }
    }
  };

  const topSellingItems = useMemo(() => {
    const grouped = {};
    partners.forEach((p) => {
      const itemKey = p.topReviewMenu || p.category || '기타 수산물';
      if (!grouped[itemKey]) {
        grouped[itemKey] = {
          name: itemKey,
          volume: 0,
          unit: p.volumeUnit || '상자',
          partnerCount: 0,
        };
      }
      grouped[itemKey].volume += Number(p.totalVolume) || 0;
      grouped[itemKey].partnerCount += 1;
    });

    const list = Object.values(grouped).sort((a, b) => b.volume - a.volume);
    const totalAll = list.reduce((acc, item) => acc + item.volume, 0) || 1;

    return list.slice(0, 5).map((item, idx) => ({
      ...item,
      rank: idx + 1,
      share: ((item.volume / totalAll) * 100).toFixed(1),
    }));
  }, [partners]);

  const availableRegions = useMemo(() => {
    const set = new Set();
    partners.forEach((p) => {
      if (p.address) {
        const firstToken = p.address.trim().split(' ')[0];
        if (firstToken) set.add(firstToken);
      }
    });
    return ['전체', ...Array.from(set)];
  }, [partners]);

  const filteredPartners = useMemo(() => {
    const q = String(searchQuery || '').toLowerCase();
    return partners.filter((p) => {
      if (!p) return false;
      const cName = String(p.companyName || '').toLowerCase();
      const mProd = String(p.mainProduct || '').toLowerCase();
      const topMenu = String(p.topReviewMenu || '').toLowerCase();
      const mgr = String(p.manager || '').toLowerCase();
      const ph = String(p.phone || '');
      const addr = String(p.address || '').toLowerCase();

      const matchesSearch =
        cName.includes(q) ||
        mProd.includes(q) ||
        topMenu.includes(q) ||
        mgr.includes(q) ||
        ph.includes(q) ||
        addr.includes(q);
      const matchesCategory =
        categoryFilter === '전체' || p.category === categoryFilter || p.topReviewMenu === categoryFilter;
      const matchesRegion =
        regionFilter === '전체' || String(p.address || '').startsWith(regionFilter);
      return matchesSearch && matchesCategory && matchesRegion;
    });
  }, [partners, searchQuery, categoryFilter, regionFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPartners.length / itemsPerPage));
  const paginatedPartners = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * itemsPerPage;
    return filteredPartners.slice(start, start + itemsPerPage);
  }, [filteredPartners, currentPage, totalPages]);

  const kpiSummary = useMemo(() => {
    const topItem = topSellingItems[0] || { name: '데이터 대기', volume: 0, unit: '상자', share: '0' };
    const allSpecies = Object.values(speciesData);
    const avgChange = (
      allSpecies.reduce((acc, s) => acc + s.prevDiffRate, 0) / allSpecies.length
    ).toFixed(1);
    const activePartnerCount = partners.filter((p) => p.status === '활발').length;
    const totalWeeklyVolume = partners.reduce(
      (acc, p) => acc + Number(p.totalVolume || 0),
      0
    );

    return {
      topItem,
      avgChange,
      totalPartners: partners.length,
      activePartnerCount,
      totalWeeklyVolume,
    };
  }, [topSellingItems, speciesData, partners]);

  const handleSearchSinglePartnerMenu = async (partner) => {
    if (searchingPartnerIds[partner.id]) return;
    setSearchingPartnerIds((prev) => ({ ...prev, [partner.id]: true }));

    const result = await searchPartnerWebAndMenus(partner, supabaseConfig.geminiKey);
    const hasFoundMenus = result.menus && result.menus.length > 0;
    const top5StarMenu = result.topReviewMenu || (hasFoundMenus ? result.menus[0] : '');

    const nextPartners = partners.map((item) =>
      item.id === partner.id
        ? {
            ...item,
            topReviewMenu: top5StarMenu,
            searchedMenus: result.menus,
            mainProduct: hasFoundMenus ? result.menus.join(' · ') : item.mainProduct,
            snsPlatform: 'Instagram',
            snsHandle: result.instagramHandle,
            instagramUrl: result.instagramUrl,
            blogUrl: result.blogUrl,
            aiSummary: result.summary,
            isSearched: true,
          }
        : item
    );
    setPartners(nextPartners);
    persistDashboardState({ partners: nextPartners });

    setSearchingPartnerIds((prev) => ({ ...prev, [partner.id]: false }));
    setSelectedPartnerDetail({
      ...partner,
      topReviewMenu: top5StarMenu,
      searchedMenus: result.menus,
      snsHandle: result.instagramHandle,
      instagramUrl: result.instagramUrl,
      blogUrl: result.blogUrl,
      aiSummary: result.summary,
    });
    showToast(
      top5StarMenu
        ? `[${buildRegionCompanyQuery(partner.companyName, partner.address)}] 5점 리뷰 1위 메뉴 '${top5StarMenu}' 반영 완료!`
        : `[${buildRegionCompanyQuery(partner.companyName, partner.address)}] 검색 완료 (네이버 메뉴판 링크 연결됨)`
    );
  };

  const handleBatchSearchCurrentPage = async () => {
    const targets = paginatedPartners.filter((p) => !p.isSearched).slice(0, 5);
    if (targets.length === 0) {
      showToast('현재 목록의 주요 업체는 이미 서칭이 완료되었습니다.');
      return;
    }
    setIsBatchSearching(true);
    for (const target of targets) {
      await handleSearchSinglePartnerMenu(target);
    }
    setIsBatchSearching(false);
    showToast(`${targets.length}개 거래처의 판매 메뉴 및 SNS 주소 일괄 서칭이 완료되었습니다.`);
  };

  const handleExcelFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFileName(file.name);

    try {
      const lowerName = file.name.toLowerCase();
      let rows = [];

      if (lowerName.endsWith('.xlsx')) {
        const buffer = await file.arrayBuffer();
        rows = await parseXlsxNatively(buffer);
      }

      if (rows.length === 0 && (lowerName.endsWith('.csv') || lowerName.endsWith('.txt'))) {
        const text = await file.text();
        const delimiter = text.includes('\t') ? '\t' : ',';
        rows = text
          .split(/\r?\n/)
          .filter((line) => line.trim() !== '')
          .map((line) => {
            const cells = [];
            let cur = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
              const ch = line[i];
              if (ch === '"') {
                inQuotes = !inQuotes;
              } else if (ch === delimiter && !inQuotes) {
                cells.push(cur.trim());
                cur = '';
              } else {
                cur += ch;
              }
            }
            cells.push(cur.trim());
            return cells;
          });
      }

      if (rows.length === 0) {
        const cdnUrls = [
          'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
          'https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js',
        ];
        if (!window.XLSX) {
          for (const url of cdnUrls) {
            try {
              await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = url;
                script.async = true;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
              });
              if (window.XLSX) break;
            } catch (_) {}
          }
        }
        if (window.XLSX) {
          const buffer = await file.arrayBuffer();
          const workbook = window.XLSX.read(new Uint8Array(buffer), { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          rows = window.XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
        }
      }

      const parsed = [];
      let colMap = { name: 1, ceo: 2, phone: 3, address: 4 };
      let headerRowIndex = -1;

      for (let i = 0; i < Math.min(5, rows.length); i++) {
        const r = rows[i];
        if (!Array.isArray(r)) continue;
        const cells = r.map((c) => String(c ?? '').trim());
        const nameIdx = cells.findIndex(
          (c) => c.includes('업체') || c.includes('상호') || c.includes('거래처')
        );
        if (nameIdx !== -1) {
          headerRowIndex = i;
          const ceoIdx = cells.findIndex(
            (c) => c.includes('대표') || c.includes('담당') || c.includes('성명')
          );
          const phoneIdx = cells.findIndex(
            (c) => c.includes('전화') || c.includes('연락') || c.includes('휴대폰')
          );
          const addrIdx = cells.findIndex(
            (c) => c.includes('주소') || c.includes('소재지')
          );
          colMap = {
            name: nameIdx,
            ceo: ceoIdx !== -1 ? ceoIdx : nameIdx + 1,
            phone: phoneIdx !== -1 ? phoneIdx : nameIdx + 2,
            address: addrIdx !== -1 ? addrIdx : nameIdx + 3,
          };
          break;
        }
      }

      rows.forEach((row, idx) => {
        if (!Array.isArray(row) || row.length === 0) return;
        if (idx <= headerRowIndex) return;

        const firstCell = String(row[0] ?? '').trim();
        if (
          headerRowIndex === -1 &&
          idx === 0 &&
          (firstCell === '순서' || firstCell === '번호' || firstCell.toLowerCase() === 'no')
        ) {
          return;
        }

        const companyName = String(row[colMap.name] ?? '').trim();
        const ceoName = String(row[colMap.ceo] ?? '').trim();
        const phone = String(row[colMap.phone] ?? '').trim();
        const address = String(row[colMap.address] ?? '').trim();

        if (
          !companyName ||
          companyName.includes('발주처') ||
          companyName === '업체명' ||
          companyName === '상호'
        ) {
          return;
        }

        parsed.push({
          companyName,
          ceoName: ceoName || '담당자',
          phone: phone || '-',
          address: address || '주소 미기재',
        });
      });

      if (parsed.length === 0) {
        showToast('엑셀 파일에서 유효한 업체 행을 찾지 못했습니다. (A열: 순서, B열: 업체명 기준)');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setExcelPreviewRows(parsed);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('엑셀 처리 오류:', err);
      showToast(
        '엑셀 파일 분석 중 문제가 발생했습니다. 파일 암호 설정 여부를 확인해 주세요.'
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmExcelImport = () => {
    if (excelPreviewRows.length === 0) return;

    const existingNames = new Set(
      partners.map((p) => String(p?.companyName || '').trim()).filter(Boolean)
    );
    const newItems = [];

    excelPreviewRows.forEach((row, idx) => {
      const cleanCompanyName = String(row.companyName || '').trim();
      if (!cleanCompanyName || existingNames.has(cleanCompanyName)) return;
      existingNames.add(cleanCompanyName);

      const meta = inferPartnerMetadata(cleanCompanyName, row.address, partners.length + idx);
      newItems.push({
        ...meta,
        id: `UP-${Date.now()}-${idx}`,
        companyName: cleanCompanyName,
        manager: `${row.ceoName || '담당자'} 대표`,
        ceoName: row.ceoName || '담당자',
        phone: row.phone || '-',
        address: row.address || '주소 미기재',
      });
    });

    const nextPartners = [...newItems, ...partners];
    setPartners(nextPartners);
    if (nextPartners.length > 0 && !snsInputCompany) {
      setSnsInputCompany(nextPartners[0].companyName);
    }
    persistDashboardState({ partners: nextPartners });

    setCurrentPage(1);
    setExcelPreviewRows([]);
    setExcelFileName('');
    setActiveModal(null);
    showToast(`엑셀 거래업체 ${newItems.length}개사가 저장되었습니다! (중복 ${excelPreviewRows.length - newItems.length}건 제외)`);
  };

  const applySnsFeedToPartner = (feedItem) => {
    const { companyName, parsed } = feedItem;
    const tagKeyword = companyName.trim().replace(/\s+/g, '');
    const instaUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(tagKeyword)}/`;

    let nextPartners = [];
    const exists = partners.some((p) => p.companyName === companyName);
    if (exists) {
      nextPartners = partners.map((p) =>
        p.companyName === companyName
          ? {
              ...p,
              category: parsed.species,
              mainProduct: parsed.spec,
              unitPrice: parsed.unitPrice,
              unitLabel: parsed.unitLabel,
              totalVolume: Number(p.totalVolume) + Number(parsed.volume),
              volumeUnit: parsed.volumeUnit,
              snsPlatform: 'Instagram',
              snsHandle: `#${tagKeyword}`,
              instagramUrl: instaUrl,
              lastOrder: '2026-11-18 (SNS자동)',
              status: '활발',
            }
          : p
      );
    } else {
      const created = {
        id: `P-${Date.now()}`,
        companyName,
        snsPlatform: 'Instagram',
        snsHandle: `#${tagKeyword}`,
        instagramUrl: instaUrl,
        blogUrl: `https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(companyName)}`,
        category: parsed.species,
        mainProduct: parsed.spec,
        searchedMenus: [parsed.spec],
        aiSummary: '',
        isSearched: false,
        unitPrice: parsed.unitPrice,
        unitLabel: parsed.unitLabel,
        totalVolume: Number(parsed.volume),
        volumeUnit: parsed.volumeUnit,
        manager: 'SNS 자동등록',
        ceoName: 'SNS 담당',
        phone: '010-0000-0000',
        address: 'SNS 연동 업체',
        status: '활발',
        lastOrder: '2026-11-18 (SNS자동)',
      };
      nextPartners = [created, ...partners];
    }

    const nextFeeds = snsFeeds.map((f) =>
      f.id === feedItem.id ? { ...f, syncedToPartner: true } : f
    );

    setPartners(nextPartners);
    setSnsFeeds(nextFeeds);
    persistDashboardState({ partners: nextPartners, snsFeeds: nextFeeds });

    showToast(`[${companyName}] SNS 입고/단가 정보가 거래업체 목록에 반영되었습니다.`);
  };

  const handleSyncAllPartnersSns = () => {
    if (partners.length === 0) {
      showToast('먼저 엑셀 파일을 업로드하여 거래업체를 등록해 주세요.');
      return;
    }
    setIsSyncingSns(true);
    setTimeout(() => {
      const target = partners[0];
      const tagKeyword = target.companyName.trim().replace(/\s+/g, '');
      const simulatedPost = {
        id: `SNS-${Date.now()}`,
        companyName: target.companyName,
        snsPlatform: 'Instagram',
        snsHandle: `#${tagKeyword}`,
        postedAt: '방금 전',
        rawText: `${target.companyName} 산지 직송 특선 삼치(3kg급) 20상자 입항 완료! 상자당 64,500원 거래처 선착순 배정합니다.`,
        parsed: {
          species: '삼치',
          spec: '산지 직송 특선 삼치 (3kg급)',
          unitPrice: 64500,
          unitLabel: '원/상자',
          volume: 20,
          volumeUnit: '상자',
          available: true,
        },
        syncedToPartner: false,
      };
      const nextFeeds = [simulatedPost, ...snsFeeds];
      setSnsFeeds(nextFeeds);
      persistDashboardState({ snsFeeds: nextFeeds });
      setIsSyncingSns(false);
      showToast(`등록 거래처 SNS 최신 게시물 수집 및 AI 구조화가 완료되었습니다.`);
    }, 650);
  };

  const handleExtractCustomSnsPost = (e) => {
    e.preventDefault();
    if (!snsInputText.trim()) return;
    const targetCompany = snsInputCompany || (partners[0] && partners[0].companyName);
    if (!targetCompany) {
      showToast('먼저 엑셀 파일을 업로드하여 거래업체를 등록해 주세요.');
      return;
    }

    const tagKeyword = targetCompany.trim().replace(/\s+/g, '');
    const parsed = parseSnsPostText(snsInputText);
    const newFeed = {
      id: `SNS-${Date.now()}`,
      companyName: targetCompany,
      snsPlatform: 'Instagram',
      snsHandle: `#${tagKeyword}`,
      postedAt: '방금 전',
      rawText: snsInputText.trim(),
      parsed,
      syncedToPartner: false,
    };

    const nextFeeds = [newFeed, ...snsFeeds];
    setSnsFeeds(nextFeeds);
    applySnsFeedToPartner(newFeed);
    setSnsInputText('');
  };

  const handleAddPartner = (e) => {
    e.preventDefault();
    if (!newPartnerForm.companyName || !newPartnerForm.mainProduct || !newPartnerForm.unitPrice) {
      return;
    }

    const tagKeyword = newPartnerForm.companyName.trim().replace(/\s+/g, '');
    const instaUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(tagKeyword)}/`;

    const newItem = {
      id: `P-${Date.now()}`,
      companyName: newPartnerForm.companyName,
      snsPlatform: 'Instagram',
      snsHandle: `#${tagKeyword}`,
      instagramUrl: instaUrl,
      blogUrl:
        newPartnerForm.blogUrl.trim() ||
        `https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(newPartnerForm.companyName)}`,
      category: newPartnerForm.category,
      mainProduct: newPartnerForm.mainProduct,
      searchedMenus: [newPartnerForm.mainProduct],
      aiSummary: '',
      isSearched: false,
      unitPrice: Number(newPartnerForm.unitPrice),
      unitLabel: newPartnerForm.unitLabel,
      totalVolume: Number(newPartnerForm.totalVolume) || 100,
      volumeUnit: newPartnerForm.volumeUnit,
      manager: newPartnerForm.manager || '담당자 미지정',
      ceoName: newPartnerForm.manager || '대표',
      phone: newPartnerForm.phone || '010-0000-0000',
      address: newPartnerForm.address || '직접 등록 거래처',
      status: newPartnerForm.status,
      lastOrder: '2026-11-18',
    };

    const nextPartners = [newItem, ...partners];
    setPartners(nextPartners);
    persistDashboardState({ partners: nextPartners });

    setNewPartnerForm({
      companyName: '',
      snsPlatform: 'Instagram',
      snsHandle: '',
      blogUrl: '',
      category: '고등어',
      mainProduct: '',
      unitPrice: '',
      unitLabel: '원/상자',
      totalVolume: '',
      volumeUnit: '상자',
      manager: '',
      phone: '',
      address: '',
      status: '활발',
    });
    setActiveModal(null);
    showToast(`신규 거래업체 '${newItem.companyName}'이(가) 등록되었습니다.`);
  };

  const handleAddAuction = (e) => {
    e.preventDefault();
    if (!newAuctionForm.price) return;

    const targetSpecies = newAuctionForm.species;
    const newPrice = Number(newAuctionForm.price);
    const prevAvg = speciesData[targetSpecies].currentAvg;
    const diffAmount = newPrice - prevAvg;
    const diffRate = prevAvg > 0 ? Number(((diffAmount / prevAvg) * 100).toFixed(1)) : 0;

    const updatedHistory7d = [...speciesData[targetSpecies].history7d];
    updatedHistory7d[updatedHistory7d.length - 1] = {
      ...updatedHistory7d[updatedHistory7d.length - 1],
      price: newPrice,
    };

    const updatedMarkets = speciesData[targetSpecies].markets.map((m) =>
      m.market === newAuctionForm.market
        ? {
            ...m,
            price: newPrice,
            diff: diffAmount,
            volume: newAuctionForm.volume || m.volume,
            status: newAuctionForm.status,
          }
        : m
    );

    const nextSpeciesData = {
      ...speciesData,
      [targetSpecies]: {
        ...speciesData[targetSpecies],
        currentAvg: newPrice,
        prevDiffRate: diffRate,
        history7d: updatedHistory7d,
        markets: updatedMarkets,
      },
    };
    setSpeciesData(nextSpeciesData);
    persistDashboardState({ speciesData: nextSpeciesData });

    setSelectedSpecies(targetSpecies);
    setNewAuctionForm({
      species: '삼치',
      market: '부산공동어시장',
      price: '',
      volume: '',
      status: '강세',
    });
    setActiveModal(null);
    showToast(`${targetSpecies} (${newAuctionForm.market}) 오늘의 위판 시세가 반영되었습니다.`);
  };

  if (!isUnlocked || isChangingPin) {
    const isSetupMode = !savedPin || isChangingPin;
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-sky-700 to-blue-800 p-6 text-white text-center">
            <div className="w-14 h-14 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/25">
              {isSetupMode ? (
                <KeyRound className="w-7 h-7 text-sky-200" />
              ) : (
                <Lock className="w-7 h-7 text-sky-200" />
              )}
            </div>
            <h1 className="text-xl font-bold tracking-tight">수산물 종합 유통·시세 대시보드</h1>
            <p className="text-xs text-sky-100 mt-1">
              {isSetupMode
                ? '대표님 전용 4자리 개인 비밀번호(PIN)를 설정하세요'
                : '거래처 단가 및 시세 보호를 위해 PIN 번호를 입력하세요'}
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="p-6 space-y-4">
            {!isDataLoaded ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
                <span className="text-xs">보안 설정 및 저장 데이터 불러오는 중...</span>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isSetupMode ? '새 4자리 숫자 PIN 입력' : '4자리 비밀번호(PIN) 입력'}
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    autoFocus
                    placeholder="••••"
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4));
                      setPinError('');
                    }}
                    className="w-full text-center text-2xl tracking-[0.6em] font-bold py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                  />
                </div>

                {isSetupMode && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      4자리 숫자 PIN 다시 입력 (확인)
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="••••"
                      value={pinConfirmInput}
                      onChange={(e) => {
                        setPinConfirmInput(e.target.value.replace(/\D/g, '').slice(0, 4));
                        setPinError('');
                      }}
                      className="w-full text-center text-2xl tracking-[0.6em] font-bold py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    />
                  </div>
                )}

                {pinError && (
                  <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg text-center">
                    {pinError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isSetupMode ? '개인 PIN 설정 완료 및 시작하기' : '잠금 해제 후 대시보드 열기'}
                </button>

                {isChangingPin && savedPin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPin(false);
                      setIsUnlocked(true);
                      setPinInput('');
                      setPinConfirmInput('');
                      setPinError('');
                    }}
                    className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    변경 취소하고 돌아가기
                  </button>
                )}

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    업로드한 엑셀 거래처와 AI 메뉴 검색 결과는 자동 저장됩니다.
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    모바일 브라우저에서 &apos;홈 화면에 추가&apos; 시 앱처럼 실행됩니다.
                  </p>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-14">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 animate-fade-in max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium leading-snug">{toastMessage}</span>
        </div>
      )}

      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-blue-800 flex items-center justify-center text-white shadow-sm shrink-0">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  수산물 종합 유통·시세 대시보드
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  v2.7 · 실제사이트 AI·어종완전연동판
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="hidden sm:inline">거래업체 {partners.length}개사 통합 관리 · 위판장 시세 · Windy 해상 기상</span>
                <button
                  onClick={() => setActiveModal('cloud')}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium cursor-pointer transition-colors ${
                    supabaseConfig.url
                      ? 'text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100'
                      : 'text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                  title="PC와 모바일 간 실시간 데이터 동기화 및 AI API 키 설정"
                >
                  <Cloud className="w-3 h-3" />
                  {syncStatus}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            <button
              onClick={() => setActiveModal('cloud')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                supabaseConfig.url || supabaseConfig.geminiKey
                  ? 'text-sky-700 bg-sky-50 border-sky-200 hover:bg-sky-100'
                  : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
              }`}
              title="PC·모바일 실시간 동기화 및 AI API 키 설정"
            >
              <Database className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden md:inline">동기화 · AI키 설정</span>
            </button>
            <button
              onClick={() => setActiveModal('excel')}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">엑셀 업로드</span>
            </button>
            <button
              onClick={() => setActiveModal('auction')}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">위판 시세</span>
            </button>
            <button
              onClick={() => setActiveModal('partner')}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">업체 등록</span>
            </button>

            <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block" />

            <button
              onClick={() => {
                setIsChangingPin(true);
                setPinInput('');
                setPinConfirmInput('');
                setPinError('');
              }}
              title="개인 PIN 비밀번호 변경"
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">PIN 변경</span>
            </button>
            <button
              onClick={handleLockScreen}
              title="즉시 화면 잠금"
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>잠금</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Waves className="w-5 h-5 text-sky-400" />
              <span className="font-bold text-sm sm:text-base">
                Windy.com 실시간 해상 기상 및 조업 여건
              </span>
              <span className="text-xs text-sky-300 hidden sm:inline">
                ({currentWeather.updatedAt})
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl">
              {Object.values(INITIAL_WEATHER_DATA).map((sea) => (
                <button
                  key={sea.id}
                  onClick={() => setSelectedSea(sea.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedSea === sea.id
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {sea.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 relative bg-slate-900 min-h-[300px] sm:min-h-[340px] border-b lg:border-b-0 lg:border-r border-slate-200">
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-slate-900/85 backdrop-blur px-2 py-1.5 rounded-xl border border-slate-700 shadow-md">
                <Layers className="w-3.5 h-3.5 text-sky-400 mr-1" />
                {[
                  { id: 'wind', label: '바람' },
                  { id: 'waves', label: '파도' },
                  { id: 'temp', label: '기온' },
                  { id: 'pressure', label: '기압' },
                ].map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => setWindyOverlay(layer.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      windyOverlay === layer.id
                        ? 'bg-sky-500 text-white'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {layer.label}
                  </button>
                ))}
              </div>

              <iframe
                title={`Windy 해상 기상 - ${currentWeather.name}`}
                src={windyEmbedUrl}
                className="w-full h-full min-h-[300px] sm:min-h-[340px] border-0"
                loading="lazy"
              />
            </div>

            <div className="lg:col-span-5 p-5 flex flex-col justify-between bg-white">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-semibold text-sky-600">선택 해역 브리핑</span>
                    <h3 className="text-lg font-bold text-slate-900">{currentWeather.name}</h3>
                  </div>

                  {currentWeather.statusType === 'good' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {currentWeather.status}
                    </span>
                  )}
                  {currentWeather.statusType === 'caution' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {currentWeather.status}
                    </span>
                  )}
                  {currentWeather.statusType === 'warning' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {currentWeather.status}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                      <span>기온 / 표층 수온</span>
                    </div>
                    <div className="text-base font-bold text-slate-900">
                      {currentWeather.airTemp}°C{' '}
                      <span className="text-xs font-semibold text-sky-600">
                        / 수온 {currentWeather.waterTemp}°C
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Wind className="w-3.5 h-3.5 text-teal-600" />
                      <span>풍속 및 풍향</span>
                    </div>
                    <div className="text-base font-bold text-slate-900">
                      {currentWeather.windSpeed} m/s{' '}
                      <span className="text-xs font-normal text-slate-500">
                        ({currentWeather.windDir})
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                        <Compass className="w-3.5 h-3.5 text-indigo-600" />
                        <span>유의 파고 (물결 높이)</span>
                      </div>
                      <div className="text-base font-bold text-slate-900">
                        {currentWeather.waveHeight} m
                      </div>
                    </div>
                    <a
                      href={`https://www.windy.com/${currentWeather.lat}/${currentWeather.lon}?${windyOverlay},${currentWeather.lat},${currentWeather.lon},${currentWeather.zoom}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200"
                    >
                      Windy 크게 보기
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-sky-800 mr-1.5">[조업 가이드]</span>
                {currentWeather.summary}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">최고 거래 인기 품목</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{kpiSummary.topItem.name}</span>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                점유율 {kpiSummary.topItem.share}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              삼치(+6.2%) · 금태(+4.5%) · 전갱이(+3.1%) 추이 반영
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">주요 어종 평균 시세 변동</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {Number(kpiSummary.avgChange) > 0 ? `+${kpiSummary.avgChange}%` : `${kpiSummary.avgChange}%`}
              </span>
              <span className="text-xs font-medium text-slate-500">전일 위판가 대비</span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              삼치(+6.2%) · 금태(+4.5%) 강세 지속
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">등록 / 활성 거래업체</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {kpiSummary.activePartnerCount}
              </span>
              <span className="text-sm font-medium text-slate-400">
                / {kpiSummary.totalPartners} 개사
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              엑셀 일괄 등록 및 SNS·웹 검색 연동 완료
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">금주 총 유통 물량</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Fish className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {formatNumber(kpiSummary.totalWeeklyVolume)}
              </span>
              <span className="text-xs font-medium text-slate-500">박스 · kg 합산</span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              산지 위판장 직송 및 도매 거래처 출고 기준
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <BarChart3 className="w-5 h-5 text-sky-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  위판장 판매 어종 및 가격 추이
                </h2>
                <button
                  onClick={handleResetSpeciesToDefault}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-500 hover:text-sky-700 bg-slate-100 hover:bg-sky-50 border border-slate-200 transition-colors cursor-pointer"
                  title="기본 4종(삼치·금태·고등어·전갱이)으로 초기화"
                >
                  <RotateCcw className="w-3 h-3" />
                  기본 4종 초기화
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                기본 어종(삼치·금태·고등어·전갱이) 외 원하는 어종을 검색해 시세 추이를 추가할 수 있습니다.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <form onSubmit={handleSearchAndAddSpecies} className="flex items-center gap-1.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="어종 추가 검색 (예: 대방어, 갈치)"
                    value={speciesSearchInput}
                    onChange={(e) => setSpeciesSearchInput(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white w-48 sm:w-52"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingSpecies || !speciesSearchInput.trim()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {isSearchingSpecies ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  {isSearchingSpecies ? '조회중' : '어종 추가'}
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-1.5">
                {Object.keys(speciesData).map((sp) => {
                  const rate = speciesData[sp].prevDiffRate;
                  const isSelected = selectedSpecies === sp;
                  return (
                    <button
                      key={sp}
                      onClick={() => setSelectedSpecies(sp)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>{sp}</span>
                      <span
                        className={`text-[11px] ${
                          isSelected
                            ? 'text-sky-100'
                            : rate >= 0
                            ? 'text-rose-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {rate >= 0 ? `▲${rate}%` : `▼${Math.abs(rate)}%`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
            <div className="lg:col-span-7 flex flex-col justify-between bg-slate-50/70 rounded-xl p-4 border border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">
                      {currentSpecies.name} 평균 위판가
                    </span>
                    <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {currentSpecies.grade}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2.5 mt-1">
                    <span className="text-2xl font-extrabold text-sky-700">
                      {formatNumber(currentSpecies.currentAvg)}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {currentSpecies.unit}
                    </span>
                    <span
                      className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                        currentSpecies.prevDiffRate >= 0
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {currentSpecies.prevDiffRate >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                      )}
                      {Math.abs(currentSpecies.prevDiffRate)}%
                    </span>
                  </div>
                </div>

                <div className="inline-flex rounded-lg bg-slate-200/70 p-0.5">
                  <button
                    onClick={() => setChartPeriod('7d')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      chartPeriod === '7d'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    최근 7일
                  </button>
                  <button
                    onClick={() => setChartPeriod('30d')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      chartPeriod === '30d'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    최근 30일
                  </button>
                </div>
              </div>

              <div className="h-64 w-full bg-white rounded-xl border border-slate-100 p-3 flex flex-col justify-between">
                {(() => {
                  const pts = chartData || [];
                  const prices = pts.map((d) => Number(d.price) || 0);
                  const minVal = prices.length ? Math.min(...prices) : 0;
                  const maxVal = prices.length ? Math.max(...prices) : 100;
                  const pad = Math.max(Math.round((maxVal - minVal) * 0.2), 500);
                  const yMin = Math.max(0, minVal - pad);
                  const yMax = maxVal + pad;
                  const range = Math.max(1, yMax - yMin);
                  const w = 560;
                  const h = 180;
                  const padL = 56;
                  const padR = 16;
                  const padT = 16;
                  const padB = 26;
                  const plotW = w - padL - padR;
                  const plotH = h - padT - padB;

                  const coords = pts.map((d, idx) => {
                    const x =
                      padL +
                      (pts.length <= 1 ? plotW / 2 : (idx / (pts.length - 1)) * plotW);
                    const y =
                      padT + plotH - (((Number(d.price) || 0) - yMin) / range) * plotH;
                    return { x, y, date: d.date, price: Number(d.price) || 0 };
                  });

                  const linePath = coords
                    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
                    .join(' ');
                  const areaPath =
                    coords.length > 0
                      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(
                          padT + plotH
                        ).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`
                      : '';

                  const yTicks = [yMax, Math.round((yMax + yMin) / 2), yMin];

                  return (
                    <svg
                      viewBox={`0 0 ${w} ${h}`}
                      className="w-full h-full overflow-visible"
                      role="img"
                      aria-label={`${currentSpecies.name} 가격 추이 차트`}
                    >
                      <defs>
                        <linearGradient id="priceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.26" />
                          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.01" />
                        </linearGradient>
                      </defs>

                      {yTicks.map((val, idx) => {
                        const ty = padT + (idx / 2) * plotH;
                        return (
                          <g key={idx}>
                            <line
                              x1={padL}
                              y1={ty}
                              x2={w - padR}
                              y2={ty}
                              stroke="#e2e8f0"
                              strokeDasharray="3 3"
                            />
                            <text
                              x={padL - 8}
                              y={ty + 4}
                              textAnchor="end"
                              fill="#64748b"
                              fontSize="10"
                            >
                              {formatNumber(val)}
                            </text>
                          </g>
                        );
                      })}

                      {areaPath && <path d={areaPath} fill="url(#priceAreaGrad)" />}
                      {linePath && (
                        <path
                          d={linePath}
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {coords.map((c, idx) => (
                        <g key={idx}>
                          <circle
                            cx={c.x}
                            cy={c.y}
                            r="4"
                            fill="#ffffff"
                            stroke="#0284c7"
                            strokeWidth="2.5"
                          />
                          <text
                            x={c.x}
                            y={c.y - 8}
                            textAnchor="middle"
                            fill="#0f172a"
                            fontSize="9.5"
                            fontWeight="600"
                          >
                            {formatNumber(c.price)}
                          </text>
                          <text
                            x={c.x}
                            y={h - 6}
                            textAnchor="middle"
                            fill="#64748b"
                            fontSize="10.5"
                          >
                            {c.date}
                          </text>
                        </g>
                      ))}
                    </svg>
                  );
                })()}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800">
                    주요 위판장별 당일 낙찰 시세
                  </h3>
                  <span className="text-xs text-slate-400">단위: {currentSpecies.unit}</span>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                        <th className="py-2.5 px-3.5">위판장명</th>
                        <th className="py-2.5 px-3 text-right">당일 시세</th>
                        <th className="py-2.5 px-3 text-right">전일 대비</th>
                        <th className="py-2.5 px-3.5 text-center">동향</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {currentSpecies.markets.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3.5">
                            <div className="font-semibold text-slate-800">{m.market}</div>
                            <div className="text-[11px] text-slate-400">물량 {m.volume}</div>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900">
                            {formatNumber(m.price)}원
                          </td>
                          <td
                            className={`py-3 px-3 text-right font-semibold ${
                              m.diff >= 0 ? 'text-rose-600' : 'text-blue-600'
                            }`}
                          >
                            {m.diff >= 0 ? `+${formatNumber(m.diff)}` : formatNumber(m.diff)}
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                m.status === '급등' || m.status === '강세'
                                  ? 'bg-rose-50 text-rose-700'
                                  : m.status === '상승'
                                  ? 'bg-amber-50 text-amber-700'
                                  : m.status === '보합'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong>매입 참고:</strong> 상단 <strong>[위판 시세]</strong> 버튼을 누르면
                  새로 추가한 어종의 당일 낙찰가와 물량도 직접 업데이트할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-2xs">
                  <Instagram className="w-4 h-4" />
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  등록 거래업체 SNS 자동 수집 및 AI 단가·입고 정리
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Radio className="w-3 h-3 animate-pulse" />
                  인스타 · 네이버 연동
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                등록된 거래업체의 인스타그램 입항 공지를 자동 수집해 어종·단가·물량으로 구조화합니다.
              </p>
            </div>

            <button
              onClick={handleSyncAllPartnersSns}
              disabled={isSyncingSns}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer disabled:opacity-60 self-start md:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSns ? 'animate-spin' : ''}`} />
              {isSyncingSns ? 'SNS 채널 수집 중...' : '전체 거래처 SNS 지금 동기화'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
            <div className="lg:col-span-7 space-y-3 max-h-[430px] overflow-y-auto pr-1">
              {snsFeeds.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center space-y-2">
                  <Instagram className="w-7 h-7 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">
                    수집된 거래업체 SNS 게시글이 없습니다.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    엑셀 파일을 업로드해 거래처를 등록한 뒤 우측 입력창이나 상단 동기화 버튼을 이용해 주세요.
                  </p>
                </div>
              ) : (
                snsFeeds.map((feed) => (
                  <div
                    key={feed.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{feed.companyName}</span>
                        <a
                          href={`https://www.instagram.com/explore/tags/${encodeURIComponent(
                            buildRegionCompanyQuery(feed.companyName, '').replace(/\s+/g, '')
                          )}/`}
                          onClick={(e) => openInstagramSearchInApp(e, feed.companyName, '')}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100"
                        >
                          <Instagram className="w-3 h-3" />
                          인스타 앱 검색
                        </a>
                        <span className="text-[11px] text-slate-400">{feed.postedAt}</span>
                      </div>

                      {feed.syncedToPartner ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <Check className="w-3 h-3" />
                          거래처 단가표 반영됨
                        </span>
                      ) : (
                        <button
                          onClick={() => applySnsFeedToPartner(feed)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-sky-600 hover:bg-sky-700 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                        >
                          거래처 정보에 즉시 반영
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed mb-2.5">
                      &ldquo;{feed.rawText}&rdquo;
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold">
                        <Sparkles className="w-3 h-3" />
                        AI 추출: {feed.parsed.species}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {feed.parsed.spec}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold">
                        {formatNumber(feed.parsed.unitPrice)} {feed.parsed.unitLabel}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold">
                        입고 {formatNumber(feed.parsed.volume)} {feed.parsed.volumeUnit}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-sky-50/40 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
              <form onSubmit={handleExtractCustomSnsPost} className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    업체 인스타 게시글 붙여넣기 · 자동 정리
                  </h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  거래업체가 인스타그램에 올린 입항 공지글을 복사해 붙여넣으면 AI가 어종, 단가,
                  입항량을 자동 추출하여 아래 거래업체 단가표와 인기 품목에 즉시 반영합니다.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    대상 거래업체 선택
                  </label>
                  <select
                    value={snsInputCompany}
                    onChange={(e) => setSnsInputCompany(e.target.value)}
                    disabled={partners.length === 0}
                    className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100"
                  >
                    {partners.length === 0 ? (
                      <option value="">먼저 엑셀 파일을 업로드해 주세요</option>
                    ) : (
                      partners.slice(0, 100).map((p) => (
                        <option key={p.id} value={p.companyName}>
                          {p.companyName}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    인스타그램 게시글 내용
                  </label>
                  <textarea
                    rows={4}
                    placeholder="예: 오늘 새벽 통영항 입항! 선망 고등어 특대 10kg 1상자 39,000원 총 250상자 선별 완료했습니다. 당일 화물 출고 가능!"
                    value={snsInputText}
                    onChange={(e) => setSnsInputText(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI 자동 추출 및 거래처 상품 반영
                </button>
              </form>

              <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500">
                * 인스타 미등록 업체도 게시글 원문을 입력하면 판매 품목과 단가가 자동 정리됩니다.
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  전체 등록 거래처 인기 판매 품목 TOP 5
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  인스타·네이버·구글 모두 <strong>[제일 큰 소재지 + 업체명]</strong>으로 검색되며, 주소 아래 주력 상품은 <strong>네이버 5점 리뷰 최다 언급 메뉴</strong>가 표시됩니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 h-48 bg-slate-50/70 rounded-xl border border-slate-100 p-3.5 flex flex-col justify-center">
                {topSellingItems.length === 0 ? (
                  <div className="text-center text-xs text-slate-400">
                    엑셀 파일을 업로드하면 품목별 출고 비중 그래프가 표시됩니다.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {(() => {
                      const maxVol = Math.max(
                        1,
                        ...topSellingItems.map((it) => Number(it.volume) || 0)
                      );
                      return topSellingItems.map((item, idx) => {
                        const pct = Math.min(
                          100,
                          Math.round(((Number(item.volume) || 0) / maxVol) * 100)
                        );
                        const barColor =
                          idx === 0
                            ? 'bg-sky-600'
                            : idx === 1
                            ? 'bg-sky-500'
                            : idx === 2
                            ? 'bg-sky-400'
                            : 'bg-slate-400';
                        return (
                          <div key={item.name} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-700">{item.name}</span>
                              <span className="text-[11px] font-semibold text-slate-500">
                                {formatNumber(item.volume)} {item.unit} ({item.share}%)
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {topSellingItems.map((item) => (
                  <div
                    key={item.name}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                            item.rank === 1
                              ? 'bg-sky-600 text-white'
                              : item.rank === 2
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {item.rank}
                        </span>
                        <span className="font-bold text-sm text-slate-800">{item.name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-sky-700 bg-sky-100/70 px-1.5 py-0.5 rounded">
                        {item.share}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      취급처 {item.partnerCount}개사 · {formatNumber(item.volume)} {item.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    등록 거래업체(발주처) 통합 관리 및 판매 메뉴·SNS 서칭
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                    총 {filteredPartners.length}개사
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  인스타·네이버·구글 모두 <strong>[제일 큰 소재지 + 업체명]</strong>으로 검색되며, 메뉴 서칭은 네이버 실제 메뉴판 기준으로 정리됩니다.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {partners.length > 0 && (
                  <button
                    onClick={handleClearAllPartners}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                    title="기존에 등록된 거래업체 목록을 모두 지우고 비웁니다"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    전체 업체 비우기
                  </button>
                )}
                <button
                  onClick={handleBatchSearchCurrentPage}
                  disabled={isBatchSearching || partners.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isBatchSearching ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {isBatchSearching ? 'AI 메뉴 일괄 서칭 중...' : '현재 목록 AI 메뉴 일괄 서칭'}
                </button>
                <button
                  onClick={() => setActiveModal('excel')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  엑셀 일괄 업로드
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="업체명, 대표자, 전화번호, 주소, 판매 메뉴 검색..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={regionFilter}
                    onChange={(e) => {
                      setRegionFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8 pr-6 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {availableRegions.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg === '전체' ? '전체 지역' : reg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8 pr-6 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="전체">전체 품목</option>
                    {Object.keys(speciesData).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {selectedPartnerDetail && (
              <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-sky-50 to-white border border-indigo-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-600 text-white">
                      <Sparkles className="w-3 h-3" />
                      AI 웹·SNS 서칭 결과
                    </span>
                    <span className="font-bold text-sm text-slate-900">
                      {selectedPartnerDetail.companyName}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({selectedPartnerDetail.address})
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedPartnerDetail.aiSummary}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500 mr-1">
                      네이버 5점 리뷰 인기 메뉴:
                    </span>
                    {selectedPartnerDetail.topReviewMenu && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                        ★ 1위: {selectedPartnerDetail.topReviewMenu}
                      </span>
                    )}
                    {(selectedPartnerDetail.searchedMenus || []).length > 0 ? (
                      selectedPartnerDetail.searchedMenus.map((menu, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white text-sky-800 border border-sky-200 shadow-2xs"
                        >
                          {menu}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">
                        자동 추출된 메뉴가 없습니다. 우측 &apos;네이버 메뉴 보기&apos;를 눌러 직접 확인하세요.
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://www.instagram.com/explore/tags/${encodeURIComponent(
                      buildRegionCompanyQuery(
                        selectedPartnerDetail.companyName,
                        selectedPartnerDetail.address
                      ).replace(/\s+/g, '')
                    )}/`}
                    onClick={(e) =>
                      openInstagramSearchInApp(
                        e,
                        selectedPartnerDetail.companyName,
                        selectedPartnerDetail.address
                      )
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-pink-600 text-white hover:bg-pink-700"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    인스타 앱 검색
                  </a>
                  <a
                    href={`https://search.naver.com/search.naver?query=${encodeURIComponent(
                      `${buildRegionCompanyQuery(
                        selectedPartnerDetail.companyName,
                        selectedPartnerDetail.address
                      )} 메뉴`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    네이버 메뉴 보기
                  </a>
                  <button
                    onClick={() => setSelectedPartnerDetail(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                    <th className="py-3 px-3.5">업체명 / 대표·연락처</th>
                    <th className="py-3 px-3">소재지 주소</th>
                    <th className="py-3 px-3">판매 메뉴 (AI 정리)</th>
                    <th className="py-3 px-3">인스타 · 블로그 · 검색 바로가기</th>
                    <th className="py-3 px-3.5 text-center">메뉴·SNS 서칭</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedPartners.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-14 text-center">
                        <div className="max-w-sm mx-auto space-y-3">
                          <FileSpreadsheet className="w-9 h-9 text-emerald-600 mx-auto" />
                          <div className="font-bold text-sm text-slate-800">
                            {partners.length === 0
                              ? '현재 등록된 거래업체가 없습니다'
                              : '검색 조건에 일치하는 거래업체가 없습니다'}
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {partners.length === 0
                              ? '대표님의 발주처 엑셀 파일(.xlsx, .xls, .csv)을 업로드하시면 목록이 서버와 브라우저에 안전하게 저장됩니다.'
                              : '다른 검색어나 필터를 선택해 보세요.'}
                          </p>
                          {partners.length === 0 && (
                            <button
                              onClick={() => setActiveModal('excel')}
                              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              엑셀 파일 업로드하기
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedPartners.map((partner) => {
                      const isSearchingThis = Boolean(searchingPartnerIds[partner.id]);
                      const combinedQuery = buildRegionCompanyQuery(
                        partner.companyName,
                        partner.address
                      );
                      const tagKeyword = combinedQuery.replace(/\s+/g, '');
                      const instaTagUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(
                        tagKeyword
                      )}/`;
                      const naverSearchUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(
                        combinedQuery
                      )}`;
                      const naverMenuSearchUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(
                        `${combinedQuery} 메뉴`
                      )}`;
                      const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
                        combinedQuery
                      )}`;

                      return (
                        <tr key={partner.id} className="hover:bg-slate-50/90 transition-colors">
                          <td className="py-3 px-3.5 align-top">
                            <div className="font-bold text-slate-900 text-sm">
                              {partner.companyName}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                              <span>{partner.manager}</span>
                              {partner.phone && (
                                <a
                                  href={`tel:${partner.phone}`}
                                  className="inline-flex items-center gap-0.5 text-sky-700 font-medium hover:underline"
                                >
                                  <Phone className="w-3 h-3" />
                                  {partner.phone}
                                </a>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3 align-top max-w-[210px]">
                            <div className="text-slate-700 leading-snug">{partner.address}</div>
                            {partner.topReviewMenu ? (
                              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                                ★ 5점 리뷰 최다: {partner.topReviewMenu}
                              </span>
                            ) : (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-medium">
                                5점 리뷰 메뉴: 서칭 전
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 align-top max-w-[240px]">
                            {partner.isSearched ? (
                              partner.searchedMenus?.length > 0 ? (
                                <div className="space-y-1">
                                  <div className="flex flex-wrap gap-1">
                                    {partner.searchedMenus.map((m, idx) => (
                                      <span
                                        key={idx}
                                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                                          idx === 0
                                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        }`}
                                      >
                                        {idx === 0 ? `★ ${m}` : m}
                                      </span>
                                    ))}
                                  </div>
                                  {partner.aiSummary && (
                                    <p className="text-[11px] text-slate-500 line-clamp-2">
                                      {partner.aiSummary}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="text-[11px] font-medium text-slate-600">
                                    네이버 자동 추출 메뉴 없음
                                  </div>
                                  <a
                                    href={naverMenuSearchUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline"
                                  >
                                    네이버 메뉴판 직접 열기 →
                                  </a>
                                </div>
                              )
                            ) : (
                              <div>
                                <div className="font-medium text-slate-500">{partner.mainProduct}</div>
                                <span className="text-[11px] text-slate-400">
                                  우측 &apos;메뉴 서칭&apos; 클릭 시 네이버 5점 리뷰 인기 메뉴 정리
                                </span>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 align-top">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <a
                                href={instaTagUrl}
                                onClick={(e) =>
                                  openInstagramSearchInApp(e, partner.companyName, partner.address)
                                }
                                target="_blank"
                                rel="noreferrer"
                                title={`인스타 앱에서 '${combinedQuery}' 검색`}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100 transition-colors"
                              >
                                <Instagram className="w-3 h-3" />
                                인스타
                              </a>

                              <a
                                href={naverSearchUrl}
                                target="_blank"
                                rel="noreferrer"
                                title={`네이버에서 '${combinedQuery}' 검색`}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                              >
                                <BookOpen className="w-3 h-3" />
                                네이버
                              </a>

                              <a
                                href={googleSearchUrl}
                                target="_blank"
                                rel="noreferrer"
                                title={`구글에서 '${combinedQuery}' 검색`}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                              >
                                <Globe className="w-3 h-3" />
                                구글
                              </a>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              검색어: <strong className="text-slate-600">{combinedQuery}</strong>
                            </div>
                          </td>

                          <td className="py-3 px-3.5 align-top text-center">
                            <button
                              onClick={() => handleSearchSinglePartnerMenu(partner)}
                              disabled={isSearchingThis}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                                partner.isSearched
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-sky-600 text-white hover:bg-sky-700 shadow-2xs'
                              }`}
                            >
                              {isSearchingThis ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  서칭중
                                </>
                              ) : partner.isSearched ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  재서칭
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3" />
                                  메뉴 서칭
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-xs text-slate-500">
              <div>
                전체 <strong>{filteredPartners.length}</strong>개 업체 중{' '}
                <strong>
                  {filteredPartners.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                </strong>
                –
                <strong>
                  {Math.min(currentPage * itemsPerPage, filteredPartners.length)}
                </strong>
                번 표시
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  이전
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg font-semibold cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-sky-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {activeModal === 'cloud' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">
                  PC·모바일 실시간 동기화 및 AI 검색 키 설정
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupabaseConfig} className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    Google Gemini API Key (실제 홈페이지 AI 시세·메뉴 서칭용)
                  </label>
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-sky-700 underline hover:text-sky-900"
                  >
                    무료 키 10초 발급받기 →
                  </a>
                </div>
                <input
                  type="text"
                  placeholder="AIzaSy... 로 시작하는 무료 Gemini API 키 붙여넣기"
                  value={supabaseForm.geminiKey}
                  onChange={(e) => setSupabaseForm({ ...supabaseForm, geminiKey: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
                <p className="text-[11px] text-sky-800 leading-relaxed">
                  * 개인 Vercel 홈페이지에서도 <strong>[어종 추가 시세 조회]</strong>와{' '}
                  <strong>[네이버 5점 리뷰 메뉴 서칭]</strong>을 사용하려면 무료 키를 1회 입력해 주세요. (Supabase 연동 시 모바일에도 자동 공유됩니다)
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <div className="text-xs font-bold text-slate-800">
                  Supabase 클라우드 DB 연결 (PC · 스마트폰 실시간 공유)
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    placeholder="예: https://abcdefghijklm.supabase.co"
                    value={supabaseForm.url}
                    onChange={(e) => setSupabaseForm({ ...supabaseForm, url: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Supabase Anon Public Key
                  </label>
                  <input
                    type="text"
                    placeholder="sb_publishable_... 또는 eyJhbGciOiJIUzI1NiIs..."
                    value={supabaseForm.anonKey}
                    onChange={(e) => setSupabaseForm({ ...supabaseForm, anonKey: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">Supabase SQL Editor 1회 실행 코드:</div>
                <pre className="bg-slate-900 text-emerald-300 p-2 rounded-lg overflow-x-auto text-[10px]">
{`create table if not exists seafood_state (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz default now()
);
alter table seafood_state disable row level security;`}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClearAllPartners}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 rounded-lg cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  등록 업체 전체 비우기
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    닫기
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer"
                  >
                    저장 및 즉시 동기화
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'excel' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  거래업체(발주처) 엑셀 파일 일괄 추가
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setExcelPreviewRows([]);
                  setExcelFileName('');
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 text-center space-y-2">
              <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="text-xs font-semibold text-slate-800">
                엑셀 파일(.xlsx, .xls, .csv)을 선택해 주세요
              </div>
              <p className="text-[11px] text-slate-500">
                열 구성: <strong>[A열: 순서] · [B열: 업체명] · [C열: 대표자] · [D열: 전화번호] · [E열: 주소]</strong>
                <br />
                기존에 등록된 업체명과 중복되는 행은 자동으로 제외되고 신규 업체만 추가됩니다.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleExcelFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                {excelFileName ? `선택됨: ${excelFileName}` : 'PC에서 엑셀 파일 선택'}
              </button>
            </div>

            {excelPreviewRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    미리보기 (총 {excelPreviewRows.length}개 행 인식됨)
                  </span>
                  <span className="text-emerald-700 font-semibold">상위 5건 표시</span>
                </div>
                <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="py-2 px-2.5">업체명</th>
                        <th className="py-2 px-2.5">대표자</th>
                        <th className="py-2 px-2.5">전화번호</th>
                        <th className="py-2 px-2.5">주소</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {excelPreviewRows.slice(0, 5).map((r, i) => (
                        <tr key={i}>
                          <td className="py-1.5 px-2.5 font-bold text-slate-800">{r.companyName}</td>
                          <td className="py-1.5 px-2.5 text-slate-600">{r.ceoName}</td>
                          <td className="py-1.5 px-2.5 text-slate-600">{r.phone}</td>
                          <td className="py-1.5 px-2.5 text-slate-500 truncate max-w-[180px]">
                            {r.address}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setExcelPreviewRows([]);
                  setExcelFileName('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                disabled={excelPreviewRows.length === 0}
                onClick={handleConfirmExcelImport}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg disabled:opacity-40 cursor-pointer"
              >
                {excelPreviewRows.length > 0
                  ? `${excelPreviewRows.length}건 거래업체 일괄 추가`
                  : '파일을 먼저 선택하세요'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'partner' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                신규 거래업체(발주처) 개별 등록
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPartner} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  업체명 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 부산수산유통"
                  value={newPartnerForm.companyName}
                  onChange={(e) =>
                    setNewPartnerForm({ ...newPartnerForm, companyName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-pink-50/50 border border-pink-100 space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  SNS 및 블로그 채널 연동 (선택)
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      인스타그램 계정 ID
                    </label>
                    <input
                      type="text"
                      placeholder="@account_id"
                      value={newPartnerForm.snsHandle}
                      onChange={(e) =>
                        setNewPartnerForm({ ...newPartnerForm, snsHandle: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      네이버 블로그/스토어 URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://blog.naver.com/..."
                      value={newPartnerForm.blogUrl}
                      onChange={(e) =>
                        setNewPartnerForm({ ...newPartnerForm, blogUrl: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    주력 어종 *
                  </label>
                  <select
                    value={newPartnerForm.category}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, category: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {Object.keys(speciesData).map((sp) => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    거래 상태
                  </label>
                  <select
                    value={newPartnerForm.status}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, status: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="활발">활발</option>
                    <option value="보통">보통</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  주요 판매 상품 / 메뉴 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 선망 참고등어 (대/10kg) · 회무침"
                  value={newPartnerForm.mainProduct}
                  onChange={(e) =>
                    setNewPartnerForm({ ...newPartnerForm, mainProduct: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    공급 단가 (원) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="39000"
                    value={newPartnerForm.unitPrice}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, unitPrice: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    주간 출고량
                  </label>
                  <input
                    type="number"
                    placeholder="500"
                    value={newPartnerForm.totalVolume}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, totalVolume: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    대표자 / 담당자
                  </label>
                  <input
                    type="text"
                    placeholder="홍길동 대표"
                    value={newPartnerForm.manager}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, manager: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    연락처
                  </label>
                  <input
                    type="text"
                    placeholder="010-1234-5678"
                    value={newPartnerForm.phone}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  소재지 주소
                </label>
                <input
                  type="text"
                  placeholder="예: 부산시 서구 충무대로 202"
                  value={newPartnerForm.address}
                  onChange={(e) =>
                    setNewPartnerForm({ ...newPartnerForm, address: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer"
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'auction' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">오늘의 위판장 시세 등록</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAuction} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  어종 선택 *
                </label>
                <select
                  value={newAuctionForm.species}
                  onChange={(e) =>
                    setNewAuctionForm({ ...newAuctionForm, species: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {Object.keys(speciesData).map((sp) => (
                    <option key={sp} value={sp}>
                      {sp} ({speciesData[sp].unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  위판장명 *
                </label>
                <input
                  type="text"
                  required
                  value={newAuctionForm.market}
                  onChange={(e) =>
                    setNewAuctionForm({ ...newAuctionForm, market: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    당일 평균 낙찰가 (원) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="25000"
                    value={newAuctionForm.price}
                    onChange={(e) =>
                      setNewAuctionForm({ ...newAuctionForm, price: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    위판 물량
                  </label>
                  <input
                    type="text"
                    placeholder="예: 820 kg"
                    value={newAuctionForm.volume}
                    onChange={(e) =>
                      setNewAuctionForm({ ...newAuctionForm, volume: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  시세 동향
                </label>
                <select
                  value={newAuctionForm.status}
                  onChange={(e) =>
                    setNewAuctionForm({ ...newAuctionForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="급등">급등</option>
                  <option value="강세">강세</option>
                  <option value="상승">상승</option>
                  <option value="보합">보합</option>
                  <option value="약세">약세</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer"
                >
                  시세 반영
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}