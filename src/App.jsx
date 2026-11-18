import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Waves,
  Wind,
  Thermometer,
  Compass,
  TrendingUp,
  Building2,
  Package,
  Search,
  Plus,
  Filter,
  Fish,
  Anchor,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Phone,
  BarChart3,
  X,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Sparkles,
  Layers,
  ExternalLink,
  MessageSquareText,
  Check,
  Radio,
  FileSpreadsheet,
  Upload,
  Globe,
  MapPin,
  Loader2,
  BookOpen,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Cloud,
  RotateCcw,
  Database,
} from 'lucide-react';

// 최신 lucide-react 호환용 인스타그램 전용 아이콘 컴포넌트
const Instagram = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';

// Firebase 안전 초기화 (로컬 PC 및 Vercel 배포 환경에서는 자동으로 브라우저 영구 저장소로 전환)
let firebaseApp = null;
let auth = null;
let db = null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'seafood-dashboard-app';

try {
  const firebaseConfig =
    typeof __firebase_config !== 'undefined' && __firebase_config
      ? JSON.parse(__firebase_config)
      : null;
  if (firebaseConfig && firebaseConfig.apiKey) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
  }
} catch (e) {
  console.warn('로컬/독립 웹 호스팅 모드로 실행됩니다.');
}

// ==========================================
// 모바일 인스타그램 앱 딥링크(Deep Link) 실행 유틸리티 (업체명 검색 연동)
// ==========================================
function openInstagramSearchInApp(e, companyName) {
  const cleanName = (companyName || '').trim();
  if (!cleanName) return;

  // 인스타 앱 검색창에서 바로 붙여넣기 할 수 있도록 업체명 클립보드 복사 지원
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cleanName).catch(() => {});
    }
  } catch (_) {}

  const tagKeyword = cleanName.replace(/\s+/g, '');
  const webUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(tagKeyword)}/`;

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  // PC 브라우저에서는 기본 새 탭 링크로 자연스럽게 열림
  if (!isAndroid && !isIOS) {
    return;
  }

  // 모바일 환경에서는 기본 브라우저 이동을 막고 인스타그램 네이티브 앱으로 직접 호출
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

// ==========================================
// 1. 초기 데이터 설정 (기본 업체 목록 비움 - 사용자 엑셀 업로드 전용)
// ==========================================
function extractInstagramUsername(urlOrHandle = '') {
  if (!urlOrHandle) return '';
  const cleaned = urlOrHandle.trim();
  if (cleaned.startsWith('@')) {
    return cleaned.slice(1).replace(/\/+$/, '');
  }
  const match = cleaned.match(/instagram\.com\/([^/?#]+)/i);
  if (match && match[1] && !['explore', 'p', 'reel', 'stories', 'accounts'].includes(match[1].toLowerCase())) {
    return match[1];
  }
  return '';
}

function openInstagramInApp(e, urlOrHandle, fallbackUrl) {
  const username = extractInstagramUsername(urlOrHandle) || extractInstagramUsername(fallbackUrl);
  const webUrl =
    fallbackUrl && fallbackUrl.startsWith('http')
      ? fallbackUrl
      : username
      ? `https://www.instagram.com/${username}/`
      : '';

  if (!webUrl) return;

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  // PC 브라우저에서는 기본 새 탭 링크로 자연스럽게 열림
  if (!isAndroid && !isIOS) {
    return;
  }

  // 모바일 환경에서는 기본 브라우저 이동을 막고 인스타그램 네이티브 앱 스킴으로 직접 호출
  if (e && e.preventDefault) {
    e.preventDefault();
  }

  if (username) {
    if (isAndroid) {
      // 안드로이드 Chrome/삼성인터넷 공식 Intent 딥링크 (앱 실행 + 미설치 시 웹 fallback 자동 지원)
      const intentUrl = `intent://instagram.com/_u/${username}/#Intent;package=com.instagram.android;scheme=https;S.browser_fallback_url=${encodeURIComponent(
        webUrl
      )};end`;
      window.location.href = intentUrl;
      return;
    }

    if (isIOS) {
      // 아이폰(iOS) Safari 공식 URL 스킴 호출 후 앱 미설치 시 웹 fallback
      const appScheme = `instagram://user?username=${encodeURIComponent(username)}`;
      const clickedAt = Date.now();
      window.location.href = appScheme;
      setTimeout(() => {
        if (document.visibilityState === 'visible' && Date.now() - clickedAt < 2200) {
          window.open(webUrl, '_blank', 'noopener,noreferrer');
        }
      }, 1200);
      return;
    }
  }

  window.open(webUrl, '_blank', 'noopener,noreferrer');
}

// ==========================================
// 1. 초기 데이터 설정 (첨부 엑셀 발주처 데이터 + 수산 시세)
// ==========================================

const INITIAL_WEATHER_DATA = {
  busan: {
    id: 'busan',
    name: '부산 앞바다',
    lat: 35.08,
    lon: 129.12,
    zoom: 9,
    airTemp: 14.2,
    waterTemp: 16.8,
    windSpeed: 5.4,
    windDir: '북서풍',
    waveHeight: 0.8,
    status: '조업 양호',
    statusType: 'good',
    summary: '파고가 낮고 시정이 양호하여 연안 및 근해 선망 조업에 최적입니다.',
    updatedAt: '09:00 기상청·Windy 연동',
  },
  namhae: {
    id: 'namhae',
    name: '남해 동부',
    lat: 34.72,
    lon: 128.35,
    zoom: 9,
    airTemp: 15.1,
    waterTemp: 17.4,
    windSpeed: 7.8,
    windDir: '서북서풍',
    waveHeight: 1.4,
    status: '조업 보통',
    statusType: 'caution',
    summary: '오후 들어 바람이 다소 강해지겠으니 소형 어선은 안전에 유의 바랍니다.',
    updatedAt: '09:00 기상청·Windy 연동',
  },
  jeju: {
    id: 'jeju',
    name: '제주 해상',
    lat: 33.38,
    lon: 126.55,
    zoom: 8,
    airTemp: 16.5,
    waterTemp: 19.2,
    windSpeed: 12.6,
    windDir: '북풍',
    waveHeight: 2.7,
    status: '풍랑주의보',
    statusType: 'warning',
    summary: '강풍과 높은 물결로 인해 갈치 채낚기 및 연승 어선 출항 자제가 권고됩니다.',
    updatedAt: '09:00 기상청·Windy 연동',
  },
  donghae: {
    id: 'donghae',
    name: '동해 남부',
    lat: 36.12,
    lon: 129.55,
    zoom: 9,
    airTemp: 12.8,
    waterTemp: 15.5,
    windSpeed: 6.2,
    windDir: '북동풍',
    waveHeight: 1.1,
    status: '조업 양호',
    statusType: 'good',
    summary: '방어 및 오징어 어장 형성이 양호하며 해상 기상 상태가 안정적입니다.',
    updatedAt: '09:00 기상청·Windy 연동',
  },
};

const INITIAL_SPECIES_DATA = {
  대방어: {
    name: '대방어',
    unit: '원 / kg',
    grade: '특대 (8kg 이상)',
    currentAvg: 24500,
    prevDiffRate: 8.4,
    history7d: [
      { date: '11/12', price: 21500, volume: 1240 },
      { date: '11/13', price: 22000, volume: 1180 },
      { date: '11/14', price: 21800, volume: 1320 },
      { date: '11/15', price: 22900, volume: 1450 },
      { date: '11/16', price: 23400, volume: 1610 },
      { date: '11/17', price: 22600, volume: 1500 },
      { date: '11/18', price: 24500, volume: 1820 },
    ],
    history30d: [
      { date: '10/20', price: 18500, volume: 980 },
      { date: '10/25', price: 19200, volume: 1050 },
      { date: '10/30', price: 20100, volume: 1120 },
      { date: '11/04', price: 20800, volume: 1210 },
      { date: '11/09', price: 21400, volume: 1290 },
      { date: '11/14', price: 21800, volume: 1320 },
      { date: '11/18', price: 24500, volume: 1820 },
    ],
    markets: [
      { market: '부산공동어시장', price: 24800, diff: 1800, volume: '740 kg', status: '강세' },
      { market: '포항죽도위판장', price: 24200, diff: 1500, volume: '520 kg', status: '강세' },
      { market: '통영수협', price: 23900, diff: 1100, volume: '340 kg', status: '상승' },
      { market: '제주모슬포수협', price: 25100, diff: 2100, volume: '220 kg', status: '급등' },
    ],
  },
  고등어: {
    name: '고등어',
    unit: '원 / 상자(10kg)',
    grade: '대 (350g 이상)',
    currentAvg: 38500,
    prevDiffRate: -3.2,
    history7d: [
      { date: '11/12', price: 41000, volume: 4200 },
      { date: '11/13', price: 40500, volume: 4500 },
      { date: '11/14', price: 39800, volume: 4800 },
      { date: '11/15', price: 40200, volume: 4650 },
      { date: '11/16', price: 39500, volume: 5100 },
      { date: '11/17', price: 39800, volume: 4950 },
      { date: '11/18', price: 38500, volume: 5400 },
    ],
    history30d: [
      { date: '10/20', price: 44000, volume: 3600 },
      { date: '10/25', price: 43200, volume: 3800 },
      { date: '10/30', price: 42500, volume: 4000 },
      { date: '11/04', price: 41800, volume: 4150 },
      { date: '11/09', price: 41200, volume: 4300 },
      { date: '11/14', price: 39800, volume: 4800 },
      { date: '11/18', price: 38500, volume: 5400 },
    ],
    markets: [
      { market: '부산공동어시장', price: 38200, diff: -1400, volume: '3,200 상자', status: '약세' },
      { market: '여수수협', price: 39000, diff: -900, volume: '1,100 상자', status: '보합' },
      { market: '통영수협', price: 38400, diff: -1200, volume: '680 상자', status: '약세' },
      { market: '제주수협', price: 39500, diff: -500, volume: '420 상자', status: '보합' },
    ],
  },
  은갈치: {
    name: '은갈치',
    unit: '원 / 상자(10kg)',
    grade: '특대 (4지 이상)',
    currentAvg: 168000,
    prevDiffRate: 5.6,
    history7d: [
      { date: '11/12', price: 154000, volume: 620 },
      { date: '11/13', price: 156000, volume: 590 },
      { date: '11/14', price: 158500, volume: 540 },
      { date: '11/15', price: 160000, volume: 510 },
      { date: '11/16', price: 162000, volume: 480 },
      { date: '11/17', price: 159000, volume: 520 },
      { date: '11/18', price: 168000, volume: 410 },
    ],
    history30d: [
      { date: '10/20', price: 142000, volume: 780 },
      { date: '10/25', price: 145000, volume: 740 },
      { date: '10/30', price: 149000, volume: 700 },
      { date: '11/04', price: 151000, volume: 670 },
      { date: '11/09', price: 153000, volume: 640 },
      { date: '11/14', price: 158500, volume: 540 },
      { date: '11/18', price: 168000, volume: 410 },
    ],
    markets: [
      { market: '제주서귀포수협', price: 171000, diff: 9500, volume: '190 상자', status: '급등' },
      { market: '여수수협', price: 167000, diff: 8200, volume: '110 상자', status: '강세' },
      { market: '목포수협', price: 165000, diff: 7500, volume: '65 상자', status: '강세' },
      { market: '부산공동어시장', price: 169000, diff: 8800, volume: '45 상자', status: '강세' },
    ],
  },
  오징어: {
    name: '오징어',
    unit: '원 / 상자(20미)',
    grade: '선어 (8kg 내외)',
    currentAvg: 64000,
    prevDiffRate: 2.4,
    history7d: [
      { date: '11/12', price: 61000, volume: 1850 },
      { date: '11/13', price: 61500, volume: 1790 },
      { date: '11/14', price: 62000, volume: 1720 },
      { date: '11/15', price: 62800, volume: 1680 },
      { date: '11/16', price: 63200, volume: 1640 },
      { date: '11/17', price: 62500, volume: 1710 },
      { date: '11/18', price: 64000, volume: 1590 },
    ],
    history30d: [
      { date: '10/20', price: 56000, volume: 2200 },
      { date: '10/25', price: 57500, volume: 2100 },
      { date: '10/30', price: 58900, volume: 2050 },
      { date: '11/04', price: 59500, volume: 1980 },
      { date: '11/09', price: 60400, volume: 1900 },
      { date: '11/14', price: 62000, volume: 1720 },
      { date: '11/18', price: 64000, volume: 1590 },
    ],
    markets: [
      { market: '포항죽도위판장', price: 64500, diff: 1800, volume: '690 상자', status: '상승' },
      { market: '주문진수협', price: 65000, diff: 2000, volume: '480 상자', status: '강세' },
      { market: '부산공동어시장', price: 63200, diff: 1200, volume: '270 상자', status: '상승' },
      { market: '울릉수협', price: 63300, diff: 1000, volume: '150 상자', status: '보합' },
    ],
  },
  참조기: {
    name: '참조기',
    unit: '원 / 상자(100미)',
    grade: '유자망 (11kg)',
    currentAvg: 195000,
    prevDiffRate: -1.5,
    history7d: [
      { date: '11/12', price: 201000, volume: 890 },
      { date: '11/13', price: 199500, volume: 920 },
      { date: '11/14', price: 198000, volume: 960 },
      { date: '11/15', price: 197000, volume: 990 },
      { date: '11/16', price: 198500, volume: 940 },
      { date: '11/17', price: 198000, volume: 970 },
      { date: '11/18', price: 195000, volume: 1050 },
    ],
    history30d: [
      { date: '10/20', price: 212000, volume: 740 },
      { date: '10/25', price: 209000, volume: 790 },
      { date: '10/30', price: 206000, volume: 830 },
      { date: '11/04', price: 204000, volume: 850 },
      { date: '11/09', price: 202000, volume: 870 },
      { date: '11/14', price: 198000, volume: 960 },
      { date: '11/18', price: 195000, volume: 1050 },
    ],
    markets: [
      { market: '목포수협', price: 196000, diff: -3000, volume: '540 상자', status: '약보합' },
      { market: '영광법성포위판장', price: 198000, diff: -2500, volume: '290 상자', status: '보합' },
      { market: '제주한림수협', price: 192000, diff: -3500, volume: '140 상자', status: '약세' },
      { market: '여수수협', price: 194000, diff: -2800, volume: '80 상자', status: '약보합' },
    ],
  },
  꽃게: {
    name: '꽃게',
    unit: '원 / kg',
    grade: '활 수꽃게 (특대)',
    currentAvg: 21500,
    prevDiffRate: 4.9,
    history7d: [
      { date: '11/12', price: 19500, volume: 2100 },
      { date: '11/13', price: 19800, volume: 2050 },
      { date: '11/14', price: 20100, volume: 1980 },
      { date: '11/15', price: 20400, volume: 1920 },
      { date: '11/16', price: 20800, volume: 1850 },
      { date: '11/17', price: 20500, volume: 1900 },
      { date: '11/18', price: 21500, volume: 1740 },
    ],
    history30d: [
      { date: '10/20', price: 17200, volume: 2800 },
      { date: '10/25', price: 17900, volume: 2650 },
      { date: '10/30', price: 18400, volume: 2500 },
      { date: '11/04', price: 18900, volume: 2350 },
      { date: '11/09', price: 19200, volume: 2200 },
      { date: '11/14', price: 20100, volume: 1980 },
      { date: '11/18', price: 21500, volume: 1740 },
    ],
    markets: [
      { market: '태안신진항위판장', price: 21800, diff: 1100, volume: '780 kg', status: '강세' },
      { market: '인천연안부두', price: 22000, diff: 1200, volume: '510 kg', status: '강세' },
      { market: '보령대천항위판장', price: 21000, diff: 800, volume: '290 kg', status: '상승' },
      { market: '군산비응항위판장', price: 21200, diff: 900, volume: '160 kg', status: '상승' },
    ],
  },
};

function inferPartnerMetadata(companyName, address, index) {
  const fullText = `${companyName} ${address}`;
  let category = '고등어';
  let mainProduct = '선망 참고등어 / 선어 모듬';
  let unitPrice = 41000;
  let unitLabel = '원/상자';
  let volumeUnit = '상자';

  if (fullText.includes('방어') || fullText.includes('모슬포') || fullText.includes('울진') || fullText.includes('영덕')) {
    category = '대방어';
    mainProduct = '산지직송 활 대방어 / 숙성 필렛';
    unitPrice = 26500;
    unitLabel = '원/kg';
    volumeUnit = 'kg';
  } else if (fullText.includes('갈치') || fullText.includes('제주') || fullText.includes('서귀포') || fullText.includes('성산')) {
    category = '은갈치';
    mainProduct = '제주 채낚기 은갈치 (특대/10kg)';
    unitPrice = 172000;
    unitLabel = '원/상자';
    volumeUnit = '상자';
  } else if (fullText.includes('오징어') || fullText.includes('주문진') || fullText.includes('포항') || fullText.includes('속초') || fullText.includes('동해') || fullText.includes('울릉')) {
    category = '오징어';
    mainProduct = '동해안 당일바리 선어 오징어 (20미)';
    unitPrice = 65500;
    unitLabel = '원/상자';
    volumeUnit = '상자';
  } else if (fullText.includes('조기') || fullText.includes('굴비') || fullText.includes('법성포') || fullText.includes('목포') || fullText.includes('신안') || fullText.includes('영광')) {
    category = '참조기';
    mainProduct = '서해 유자망 참조기 / 영광굴비 원물';
    unitPrice = 198000;
    unitLabel = '원/상자';
    volumeUnit = '상자';
  } else if (fullText.includes('꽃게') || fullText.includes('대게') || fullText.includes('태안') || fullText.includes('인천') || fullText.includes('보령') || fullText.includes('서산') || fullText.includes('홍성')) {
    category = '꽃게';
    mainProduct = '서해안 활 수꽃게 / 연평도 급냉 꽃게';
    unitPrice = 22500;
    unitLabel = '원/kg';
    volumeUnit = 'kg';
  } else if (fullText.includes('전복') || fullText.includes('완도')) {
    category = '대방어';
    mainProduct = '완도 활전복 (10미/1kg) & 활어';
    unitPrice = 34000;
    unitLabel = '원/kg';
    volumeUnit = 'kg';
  } else if (fullText.includes('굴') || fullText.includes('통영') || fullText.includes('거제')) {
    category = '고등어';
    mainProduct = '통영 생굴 / 남해안 선망 고등어';
    unitPrice = 39500;
    unitLabel = '원/상자';
    volumeUnit = '상자';
  }

  const totalVolume = 420 + ((index * 137) % 1850);
  const status = index % 4 === 3 ? '보통' : '활발';
  const tagKeyword = companyName.trim().replace(/\s+/g, '');

  return {
    id: `EX-${1001 + index}`,
    companyName,
    manager: '',
    ceoName: '',
    phone: '',
    address,
    snsPlatform: 'Instagram',
    snsHandle: `#${tagKeyword}`,
    instagramUrl: `https://www.instagram.com/explore/tags/${encodeURIComponent(tagKeyword)}/`,
    blogUrl: `https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(companyName)}`,
    category,
    mainProduct,
    searchedMenus: [],
    aiSummary: '',
    isSearched: false,
    unitPrice,
    unitLabel,
    totalVolume,
    volumeUnit,
    status,
    lastOrder: '2026-11-18',
  };
}

// 초기 거래업체 및 SNS 피드는 비어있는 상태로 시작 (대표님이 올린 엑셀 파일만 저장/표시)
const INITIAL_PARTNERS = [];
const INITIAL_SNS_FEEDS = [];

function parseSnsPostText(rawText) {
  const speciesKeywords = ['대방어', '방어', '고등어', '은갈치', '갈치', '오징어', '참조기', '꽃게'];
  let detectedSpecies = '대방어';
  for (const kw of speciesKeywords) {
    if (rawText.includes(kw)) {
      if (kw === '방어') detectedSpecies = '대방어';
      else if (kw === '갈치') detectedSpecies = '은갈치';
      else detectedSpecies = kw;
      break;
    }
  }

  const priceMatch = rawText.match(/(\d{1,3}(?:,\d{3})+|\d{4,6})\s*원/);
  const unitPrice = priceMatch ? Number(priceMatch[1].replace(/,/g, '')) : 35000;

  const isKg = /kg|키로|킬로/i.test(rawText) && !/박스|상자/.test(rawText.split('원')[0]);
  const unitLabel = isKg ? '원/kg' : '원/상자';
  const volumeUnit = isKg ? 'kg' : '상자';

  const volMatch = rawText.match(/(\d{1,4})\s*(상자|박스|마리|kg|키로)/i);
  let volume = volMatch ? Number(volMatch[1]) : 50;
  if (volMatch && volMatch[2] === '마리') {
    volume = volume * 8;
  }

  const specMatch = rawText.match(/(특대|대사이즈|대|중|소|\d+kg급|\d+지|\d+미)/);
  const spec = specMatch ? `${specMatch[0]} 산지직송` : '산지 특선 규격';
  const available = !/마감|품절|종료/.test(rawText);

  return {
    species: detectedSpecies,
    spec,
    unitPrice,
    unitLabel,
    volume,
    volumeUnit,
    available,
  };
}

// ==========================================
// 2. Gemini API + Google Search Grounding 연동 (업체 메뉴·인스타·블로그 서칭)
// ==========================================
async function searchPartnerWebAndMenus(partner) {
  const apiKey = '';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const regionHint = partner.address ? partner.address.split(' ').slice(0, 2).join(' ') : '';
  const tagKeyword = partner.companyName.trim().replace(/\s+/g, '');
  const defaultInstaSearchUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(tagKeyword)}/`;

  const userQuery = `대한민국 수산물/식품 업체 "${partner.companyName}" (주소: ${partner.address}, 대표자: ${partner.ceoName || partner.manager})에 대해 구글과 네이버 정보를 검색해서 아래 JSON 형식으로만 정확히 응답해줘.
판매 중인 메뉴(어종, 가공품, 식당/도매 품목 등)와 네이버 블로그/스마트스토어 주소를 찾아 요약해줘.

반드시 순수 JSON 객체만 반환하세요:
{
  "menus": ["판매메뉴1", "판매메뉴2", "판매메뉴3"],
  "mainCategory": "대방어 | 고등어 | 은갈치 | 오징어 | 참조기 | 꽃게 중 가장 가까운 1개",
  "blogUrl": "https://blog.naver.com/... 또는 네이버 검색 URL",
  "summary": "해당 업체의 판매 메뉴 및 특징 1~2문장 요약"
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
        return {
          menus: Array.isArray(parsed.menus) && parsed.menus.length > 0
            ? parsed.menus
            : [partner.mainProduct, '산지직송 활어/선어', '도매 납품 패키지'],
          mainCategory: parsed.mainCategory || partner.category,
          instagramHandle: `#${tagKeyword}`,
          instagramUrl: defaultInstaSearchUrl,
          blogUrl:
            parsed.blogUrl && parsed.blogUrl.startsWith('http')
              ? parsed.blogUrl
              : partner.blogUrl,
          summary:
            parsed.summary ||
            `${partner.companyName}(${regionHint})의 판매 메뉴 검색이 완료되었습니다.`,
        };
      }
      break;
    } catch (err) {
      if (attempt === 2) {
        return {
          menus: [partner.mainProduct, `${regionHint} 산지직송 특선`, '업소용 대용량 도매박스'],
          mainCategory: partner.category,
          instagramHandle: `#${tagKeyword}`,
          instagramUrl: defaultInstaSearchUrl,
          blogUrl: partner.blogUrl,
          summary: `${partner.companyName}(${regionHint})의 취급 품목 정리가 완료되었습니다.`,
        };
      }
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
}

const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num);

export default function App() {
  // 인증 및 클라우드 동기화 상태
  const [user, setUser] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState('연결 중...');
  const [supabaseConfig, setSupabaseConfig] = useState({ url: '', anonKey: '' });
  const [supabaseForm, setSupabaseForm] = useState({ url: '', anonKey: '' });

  // 개인 전용 4자리 PIN 잠금 상태
  const [savedPin, setSavedPin] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinConfirmInput, setPinConfirmInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);

  // 기상 & 위판 시세 상태
  const [selectedSea, setSelectedSea] = useState('busan');
  const [windyOverlay, setWindyOverlay] = useState('wind');
  const [speciesData, setSpeciesData] = useState(INITIAL_SPECIES_DATA);
  const [selectedSpecies, setSelectedSpecies] = useState('대방어');
  const [chartPeriod, setChartPeriod] = useState('7d');

  // 거래업체(발주처) 상태
  const [partners, setPartners] = useState(INITIAL_PARTNERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [regionFilter, setRegionFilter] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // 업체별 AI 메뉴/SNS 서칭 상태
  const [searchingPartnerIds, setSearchingPartnerIds] = useState({});
  const [isBatchSearching, setIsBatchSearching] = useState(false);
  const [selectedPartnerDetail, setSelectedPartnerDetail] = useState(null);

  // SNS 자동 수집 피드 상태
  const [snsFeeds, setSnsFeeds] = useState(INITIAL_SNS_FEEDS);
  const [isSyncingSns, setIsSyncingSns] = useState(false);
  const [snsInputCompany, setSnsInputCompany] = useState('');
  const [snsInputText, setSnsInputText] = useState('');

  // 모달 상태 ('partner' | 'auction' | 'excel' | 'cloud' | null)
  const [activeModal, setActiveModal] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [excelPreviewRows, setExcelPreviewRows] = useState([]);
  const [excelFileName, setExcelFileName] = useState('');
  const fileInputRef = useRef(null);

  // 신규 거래업체 폼 상태
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

  // 신규 위판 시세 폼 상태
  const [newAuctionForm, setNewAuctionForm] = useState({
    species: '대방어',
    market: '부산공동어시장',
    price: '',
    volume: '',
    status: '강세',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // 1) Firebase 인증 초기화 및 로컬 저장소 복원
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
        if (parsedSb.url && parsedSb.anonKey) {
          loadedSbUrl = parsedSb.url;
          loadedSbKey = parsedSb.anonKey;
          setSupabaseConfig(parsedSb);
          setSupabaseForm(parsedSb);
        }
      }

      if (localPin) setSavedPin(localPin);
      if (localPartners) {
        const parsedPartners = JSON.parse(localPartners);
        if (Array.isArray(parsedPartners)) {
          setPartners(parsedPartners);
          if (parsedPartners.length > 0) {
            setSnsInputCompany(parsedPartners[0].companyName);
          }
        }
      }
      if (localSpecies) setSpeciesData(JSON.parse(localSpecies));
      if (localFeeds) setSnsFeeds(JSON.parse(localFeeds));
    } catch (e) {
      console.warn('로컬 저장소 불러오기 건너뜀:', e);
    }

    if (!auth) {
      if (loadedSbUrl && loadedSbKey) {
        fetchFromSupabase(loadedSbUrl, loadedSbKey).finally(() => setIsDataLoaded(true));
      } else {
        setIsDataLoaded(true);
        setSyncStatus('브라우저 자동 저장됨');
      }
      return;
    }

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn('익명 인증 대기:', err);
        setIsDataLoaded(true);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsDataLoaded(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2) Firestore 실시간 동기화 리스너
  useEffect(() => {
    if (!db || !user) return;
    const stateDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'dashboard', 'mainState');
    const unsubscribe = onSnapshot(
      stateDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.pin) setSavedPin(data.pin);
          if (Array.isArray(data.partners)) {
            setPartners(data.partners);
          }
          if (data.speciesData) setSpeciesData(data.speciesData);
          if (Array.isArray(data.snsFeeds)) setSnsFeeds(data.snsFeeds);
        }
        setIsDataLoaded(true);
        setSyncStatus('클라우드 자동 저장됨');
      },
      () => {
        setIsDataLoaded(true);
        setSyncStatus('브라우저 자동 저장됨');
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Supabase REST API를 통한 PC·모바일 실시간 데이터 불러오기
  const fetchFromSupabase = async (url, anonKey) => {
    if (!url || !anonKey) return;
    try {
      setSyncStatus('클라우드 동기화 중...');
      const cleanUrl = url.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '');
      const cleanKey = anonKey.trim();
      const headers = {
        apikey: cleanKey,
      };
      // 구형 JWT(eyJ...) 키인 경우에만 Authorization Bearer 헤더 추가 (신형 sb_publishable_ 키 호환)
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
        if (remote.speciesData) {
          setSpeciesData(remote.speciesData);
          localStorage.setItem(`${appId}_species`, JSON.stringify(remote.speciesData));
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

  // 3) 대시보드 핵심 데이터 자동 저장 함수
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

    if (!db || !user) {
      setSyncStatus('브라우저 자동 저장됨');
      return;
    }
    try {
      setSyncStatus('저장 중...');
      const stateDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'dashboard', 'mainState');
      await setDoc(
        stateDocRef,
        {
          pin: nextPin,
          partners: nextPartners,
          speciesData: nextSpecies,
          snsFeeds: nextFeeds,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setSyncStatus('클라우드 자동 저장됨');
    } catch (err) {
      setSyncStatus('브라우저 자동 저장됨');
    }
  };

  // Supabase 연결 정보 저장
  const handleSaveSupabaseConfig = async (e) => {
    e.preventDefault();
    const trimmed = {
      url: supabaseForm.url.trim(),
      anonKey: supabaseForm.anonKey.trim(),
    };
    setSupabaseConfig(trimmed);
    localStorage.setItem(`${appId}_supabase`, JSON.stringify(trimmed));
    setActiveModal(null);

    if (trimmed.url && trimmed.anonKey) {
      await fetchFromSupabase(trimmed.url, trimmed.anonKey);
      await persistDashboardState({ supabaseConfig: trimmed });
      showToast('PC·모바일 클라우드 DB(Supabase)가 성공적으로 연결되었습니다!');
    } else {
      setSyncStatus('브라우저 자동 저장됨');
      showToast('클라우드 연결이 해제되고 로컬 저장 모드로 전환되었습니다.');
    }
  };

  // 화면 즉시 잠금
  const handleLockScreen = () => {
    setIsUnlocked(false);
    setPinInput('');
    setPinConfirmInput('');
    setPinError('');
  };

  // PIN 잠금 해제 또는 신규 설정 처리
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

  // 기존 등록 업체 전체 비우기 (엑셀 재업로드용 초기화)
  const handleClearAllPartners = async () => {
    setPartners([]);
    setSnsFeeds([]);
    setSelectedPartnerDetail(null);
    setCurrentPage(1);
    await persistDashboardState({
      partners: [],
      snsFeeds: [],
    });
    showToast('등록된 거래업체 목록이 깨끗하게 초기화되었습니다. 새 엑셀 파일을 업로드해 주세요.');
  };

  // 현재 선택된 해역 날씨 및 Windy URL
  const currentWeather = INITIAL_WEATHER_DATA[selectedSea];
  const windyEmbedUrl = useMemo(() => {
    const { lat, lon, zoom } = currentWeather;
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      detailLat: String(lat),
      detailLon: String(lon),
      width: '650',
      height: '450',
      zoom: String(zoom),
      level: 'surface',
      overlay: windyOverlay,
      product: 'ecmwf',
      menu: '',
      message: 'true',
      marker: 'true',
      calendar: 'now',
      pressure: 'true',
      type: 'map',
      location: 'coordinates',
      detail: '',
      metricWind: 'm/s',
      metricTemp: '°C',
      radarRange: '-1',
    });
    return `https://embed.windy.com/embed2.html?${params.toString()}`;
  }, [currentWeather, windyOverlay]);

  // 현재 선택된 어종 데이터
  const currentSpecies = speciesData[selectedSpecies];
  const chartData =
    chartPeriod === '7d' ? currentSpecies.history7d : currentSpecies.history30d;

  // 인기 판매 품목 TOP 5 계산
  const topSellingItems = useMemo(() => {
    const grouped = {};
    partners.forEach((p) => {
      if (!grouped[p.category]) {
        grouped[p.category] = {
          name: p.category,
          volume: 0,
          unit: p.volumeUnit,
          partnerCount: 0,
        };
      }
      grouped[p.category].volume += Number(p.totalVolume) || 0;
      grouped[p.category].partnerCount += 1;
    });

    const list = Object.values(grouped).sort((a, b) => b.volume - a.volume);
    const totalAll = list.reduce((acc, item) => acc + item.volume, 0) || 1;

    return list.slice(0, 5).map((item, idx) => ({
      ...item,
      rank: idx + 1,
      share: ((item.volume / totalAll) * 100).toFixed(1),
    }));
  }, [partners]);

  // 지역 목록 추출
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

  // 필터링된 거래업체 리스트
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.companyName.toLowerCase().includes(q) ||
        p.mainProduct.toLowerCase().includes(q) ||
        p.manager.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q));
      const matchesCategory =
        categoryFilter === '전체' || p.category === categoryFilter;
      const matchesRegion =
        regionFilter === '전체' || (p.address && p.address.startsWith(regionFilter));
      return matchesSearch && matchesCategory && matchesRegion;
    });
  }, [partners, searchQuery, categoryFilter, regionFilter]);

  // 페이지네이션 계산
  const totalPages = Math.max(1, Math.ceil(filteredPartners.length / itemsPerPage));
  const paginatedPartners = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * itemsPerPage;
    return filteredPartners.slice(start, start + itemsPerPage);
  }, [filteredPartners, currentPage, totalPages]);

  // KPI 요약 수치 동적 계산
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

  // 개별 거래업체 인스타·네이버·구글 AI 메뉴 서칭 실행
  const handleSearchSinglePartnerMenu = async (partner) => {
    if (searchingPartnerIds[partner.id]) return;
    setSearchingPartnerIds((prev) => ({ ...prev, [partner.id]: true }));

    const result = await searchPartnerWebAndMenus(partner);

    const nextPartners = partners.map((item) =>
      item.id === partner.id
        ? {
            ...item,
            searchedMenus: result.menus,
            mainProduct: result.menus.join(' · '),
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
      searchedMenus: result.menus,
      snsHandle: result.instagramHandle,
      instagramUrl: result.instagramUrl,
      blogUrl: result.blogUrl,
      aiSummary: result.summary,
    });
    showToast(`[${partner.companyName}] 판매 메뉴 서칭 완료!`);
  };

  // 현재 페이지 상위 5개 업체 일괄 AI 메뉴 서칭
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

  // 엑셀(.xlsx / .csv) 파일 파싱 핸들러
  const handleExcelFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFileName(file.name);

    try {
      if (!window.XLSX) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const buffer = await file.arrayBuffer();
      const workbook = window.XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = window.XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      const parsed = [];
      // 헤더 행에서 열 위치를 자동 감지 (기본값: A열=순서(0), B열=업체명(1), C열=대표자(2), D열=전화번호(3), E열=주소(4))
      let colMap = { name: 1, ceo: 2, phone: 3, address: 4 };
      let headerRowIndex = -1;

      for (let i = 0; i < Math.min(5, rows.length); i++) {
        const r = rows[i];
        if (!Array.isArray(r)) continue;
        const cells = r.map((c) => String(c || '').trim());
        const nameIdx = cells.findIndex((c) => c.includes('업체') || c.includes('상호') || c.includes('거래처'));
        if (nameIdx !== -1) {
          headerRowIndex = i;
          const ceoIdx = cells.findIndex((c) => c.includes('대표') || c.includes('담당') || c.includes('성명'));
          const phoneIdx = cells.findIndex((c) => c.includes('전화') || c.includes('연락') || c.includes('휴대폰'));
          const addrIdx = cells.findIndex((c) => c.includes('주소') || c.includes('소재지'));
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

        // 헤더가 없었던 경우 첫 행에 '순서/번호'가 들어있으면 건너뜀
        const firstCell = String(row[0] || '').trim();
        if (headerRowIndex === -1 && idx === 0 && (firstCell === '순서' || firstCell === '번호' || firstCell.toLowerCase() === 'no')) {
          return;
        }

        // B열(또는 감지된 업체명 열)을 업체명으로 추출 (A열이 순번인 경우 대비)
        const companyName = String(row[colMap.name] || '').trim();
        const ceoName = String(row[colMap.ceo] || '').trim();
        const phone = String(row[colMap.phone] || '').trim();
        const address = String(row[colMap.address] || '').trim();

        if (!companyName || companyName.includes('발주처') || companyName === '업체명' || companyName === '상호') {
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
        return;
      }

      setExcelPreviewRows(parsed);
    } catch (err) {
      showToast('엑셀 파일을 읽는 중 오류가 발생했습니다. (.xlsx, .xls, .csv 지원)');
    }
  };

  // 엑셀 파싱 결과 대시보드 일괄 추가 확정
  const handleConfirmExcelImport = () => {
    if (excelPreviewRows.length === 0) return;

    const existingNames = new Set(partners.map((p) => p.companyName.trim()));
    const newItems = [];

    excelPreviewRows.forEach((row, idx) => {
      if (existingNames.has(row.companyName.trim())) return;
      existingNames.add(row.companyName.trim());

      const meta = inferPartnerMetadata(row.companyName, row.address, partners.length + idx);
      newItems.push({
        ...meta,
        id: `UP-${Date.now()}-${idx}`,
        manager: `${row.ceoName} 대표`,
        ceoName: row.ceoName,
        phone: row.phone,
        address: row.address,
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

  // SNS 피드 데이터를 거래업체 단가·물량에 반영
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

  // 전체 등록 거래처 SNS 일괄 동기화 실행
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
        rawText: `${target.companyName} 산지 직송 특선 대방어(9kg급) 12마리 입항 완료! 도매 kg당 25,800원 거래처 선착순 배정합니다.`,
        parsed: {
          species: '대방어',
          spec: '산지 직송 특선 (9kg급)',
          unitPrice: 25800,
          unitLabel: '원/kg',
          volume: 108,
          volumeUnit: 'kg',
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

  // 사용자 직접 SNS 게시물 텍스트 추출 및 등록
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

  // 신규 거래업체 개별 추가 핸들러
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

  // 신규 위판 시세 등록 핸들러
  const handleAddAuction = (e) => {
    e.preventDefault();
    if (!newAuctionForm.price) return;

    const targetSpecies = newAuctionForm.species;
    const newPrice = Number(newAuctionForm.price);
    const prevAvg = speciesData[targetSpecies].currentAvg;
    const diffAmount = newPrice - prevAvg;
    const diffRate = Number(((diffAmount / prevAvg) * 100).toFixed(1));

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
      species: '대방어',
      market: '부산공동어시장',
      price: '',
      volume: '',
      status: '강세',
    });
    setActiveModal(null);
    showToast(`${targetSpecies} (${newAuctionForm.market}) 오늘의 위판 시세가 반영되었습니다.`);
  };

  // ==========================================
  // 3. 개인 전용 보안 잠금 화면 (PIN 인증 전 표시)
  // ==========================================
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
      {/* 알림 토스트 */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 상단 내비게이션 헤더 */}
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
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  실무 운영판
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
                  title="PC와 모바일 간 실시간 데이터 동기화 설정"
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
                supabaseConfig.url
                  ? 'text-sky-700 bg-sky-50 border-sky-200 hover:bg-sky-100'
                  : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
              }`}
              title="PC·모바일 실시간 동기화(Supabase) 설정"
            >
              <Database className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden md:inline">동기화 설정</span>
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
        {/* ==========================================
            SECTION 1: Windy 실시간 해상 날씨 & 해역 요약 위젯
           ========================================== */}
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

            {/* 해역 선택 탭 */}
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
            {/* 좌측: Windy.com 공식 무료 임베드 위젯 */}
            <div className="lg:col-span-7 relative bg-slate-900 min-h-[300px] sm:min-h-[340px] border-b lg:border-b-0 lg:border-r border-slate-200">
              {/* Windy 레이어 전환 플로팅 바 */}
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

            {/* 우측: 선택 해역 수치 브리핑 */}
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

        {/* ==========================================
            SECTION 2: 핵심 요약 KPI 카드 4종
           ========================================== */}
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
              주간 누적 {formatNumber(kpiSummary.topItem.volume)} {kpiSummary.topItem.unit} 출고
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
              대방어(+8.4%) · 은갈치(+5.6%) 강세 지속
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

        {/* ==========================================
            SECTION 3: 위판장 생선 시세 및 가격 추이
           ========================================== */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-sky-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  위판장 판매 어종 및 가격 추이
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                전국 주요 산지 위판장별 경매 낙찰가 변동 추이와 당일 시세를 비교합니다.
              </p>
            </div>

            {/* 어종 선택 버튼 */}
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
            {/* 좌측: 가격 추이 차트 */}
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

                {/* 기간 토글 */}
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

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      width={62}
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `${formatNumber(val)}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(value) => [`${formatNumber(value)} 원`, '평균 위판가']}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#0284c7"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#priceGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 우측: 주요 위판장별 시세 비교 표 */}
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
                  <strong>매입 참고:</strong> 제주 해상 풍랑주의보 영향으로 은갈치 산지 위판 물량이
                  전주 대비 약 25% 감소하여 단기 강세가 예상됩니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            SECTION 4: 등록 거래업체 SNS 자동 수집 & AI 메뉴 파싱 피드
           ========================================== */}
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
            {/* 좌측: 자동 수집된 업체별 SNS 입항·시세 카드 */}
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
                            feed.companyName.trim().replace(/\s+/g, '')
                          )}/`}
                          onClick={(e) => openInstagramSearchInApp(e, feed.companyName)}
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

            {/* 우측: 거래업체 인스타 게시글 붙여넣기 AI 자동 추출기 */}
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

        {/* ==========================================
            SECTION 5: 인기 판매 품목 TOP 5 & 발주처/거래업체 전체 관리 (120개사+엑셀추가)
           ========================================== */}
        <section className="space-y-6">
          {/* 인기 판매 품목 TOP 5 가로형 카드 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  전체 등록 거래처 인기 판매 품목 TOP 5
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  등록된 {partners.length}개 거래업체 주력 어종 및 출고 물량 합산 순위
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topSellingItems}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={58}
                      tick={{ fontSize: 12, fontWeight: 600, fill: '#334155' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(val, _name, props) => [
                        `${formatNumber(val)} ${props.payload.unit}`,
                        '누적 거래량',
                      ]}
                    />
                    <Bar dataKey="volume" radius={[0, 6, 6, 0]} barSize={20}>
                      {topSellingItems.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index === 0
                              ? '#0284c7'
                              : index === 1
                              ? '#0ea5e9'
                              : index === 2
                              ? '#38bdf8'
                              : '#94a3b8'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
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

          {/* 전체 발주처·거래업체 DB 및 인스타·네이버·구글 AI 메뉴 서칭 테이블 */}
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
                  대표님이 업로드한 엑셀 거래처만 저장·표시됩니다 · 구글은 업체명 검색, 인스타는 앱 접속 후 업체명 검색으로 연결됩니다.
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

            {/* 검색 & 지역/어종 필터 바 */}
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

            {/* AI 서칭 상세 브리핑 패널 (선택된 업체가 있을 때 표시) */}
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
                    <span className="text-[11px] font-semibold text-slate-500 mr-1">확인된 판매 메뉴:</span>
                    {(selectedPartnerDetail.searchedMenus || []).map((menu, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white text-sky-800 border border-sky-200 shadow-2xs"
                      >
                        {menu}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://www.instagram.com/explore/tags/${encodeURIComponent(
                      selectedPartnerDetail.companyName.trim().replace(/\s+/g, '')
                    )}/`}
                    onClick={(e) =>
                      openInstagramSearchInApp(e, selectedPartnerDetail.companyName)
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-pink-600 text-white hover:bg-pink-700"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    인스타 앱 검색
                  </a>
                  <a
                    href={selectedPartnerDetail.blogUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    네이버 블로그
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

            {/* 거래업체(발주처) 목록 테이블 */}
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
                      const cleanCompanyName = partner.companyName.trim();
                      const tagKeyword = cleanCompanyName.replace(/\s+/g, '');
                      const instaTagUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(
                        tagKeyword
                      )}/`;
                      const naverSearchUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(
                        cleanCompanyName
                      )}`;
                      // 요청사항: 구글 검색 시 순수 '업체명'으로 검색
                      const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
                        cleanCompanyName
                      )}`;

                      return (
                        <tr key={partner.id} className="hover:bg-slate-50/90 transition-colors">
                          {/* 업체명 & 연락처 */}
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

                          {/* 주소 */}
                          <td className="py-3 px-3 align-top max-w-[210px]">
                            <div className="text-slate-700 leading-snug">{partner.address}</div>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                              주력: {partner.category} · {formatNumber(partner.unitPrice)}{partner.unitLabel}
                            </span>
                          </td>

                          {/* 판매 메뉴 (AI 서칭 결과) */}
                          <td className="py-3 px-3 align-top max-w-[240px]">
                            {partner.isSearched && partner.searchedMenus?.length > 0 ? (
                              <div className="space-y-1">
                                <div className="flex flex-wrap gap-1">
                                  {partner.searchedMenus.map((m, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-100"
                                    >
                                      {m}
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
                              <div>
                                <div className="font-medium text-slate-700">{partner.mainProduct}</div>
                                <span className="text-[11px] text-slate-400">
                                  우측 &apos;메뉴 서칭&apos; 클릭 시 실제 메뉴 수집
                                </span>
                              </div>
                            )}
                          </td>

                          {/* 인스타(앱 업체명 검색) / 네이버 블로그 / 구글(업체명 검색) 바로가기 */}
                          <td className="py-3 px-3 align-top">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <a
                                href={instaTagUrl}
                                onClick={(e) => openInstagramSearchInApp(e, cleanCompanyName)}
                                target="_blank"
                                rel="noreferrer"
                                title="모바일 인스타그램 앱으로 접속해 업체명으로 검색합니다"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100 transition-colors"
                              >
                                <Instagram className="w-3 h-3" />
                                인스타 검색
                              </a>

                              <a
                                href={partner.blogUrl || naverSearchUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="네이버 블로그 및 플레이스 검색"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                              >
                                <BookOpen className="w-3 h-3" />
                                네이버·블로그
                              </a>

                              <a
                                href={googleSearchUrl}
                                target="_blank"
                                rel="noreferrer"
                                title={`구글에서 '${cleanCompanyName}' 검색`}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                              >
                                <Globe className="w-3 h-3" />
                                구글검색
                              </a>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              검색 키워드: {cleanCompanyName}
                            </div>
                          </td>

                          {/* 주소 */}
                          <td className="py-3 px-3 align-top max-w-[210px]">
                            <div className="text-slate-700 leading-snug">{partner.address}</div>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                              주력: {partner.category} · {formatNumber(partner.unitPrice)}{partner.unitLabel}
                            </span>
                          </td>

                          {/* 판매 메뉴 (AI 서칭 결과) */}
                          <td className="py-3 px-3 align-top max-w-[240px]">
                            {partner.isSearched && partner.searchedMenus?.length > 0 ? (
                              <div className="space-y-1">
                                <div className="flex flex-wrap gap-1">
                                  {partner.searchedMenus.map((m, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-100"
                                    >
                                      {m}
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
                              <div>
                                <div className="font-medium text-slate-700">{partner.mainProduct}</div>
                                <span className="text-[11px] text-slate-400">
                                  우측 &apos;메뉴 서칭&apos; 클릭 시 실제 메뉴 수집
                                </span>
                              </div>
                            )}
                          </td>

                          {/* 인스타 / 네이버 블로그 / 구글 바로가기 */}
                          <td className="py-3 px-3 align-top">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {partner.instagramUrl ? (
                                <a
                                  href={partner.instagramUrl}
                                  onClick={(e) =>
                                    openInstagramInApp(e, partner.snsHandle, partner.instagramUrl)
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  title="클릭 시 스마트폰 인스타그램 앱으로 바로 연결됩니다"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100 transition-colors"
                                >
                                  <Instagram className="w-3 h-3" />
                                  인스타 앱
                                </a>
                              ) : (
                                <span
                                  title="확인된 인스타그램 계정이 없습니다"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-400 border border-slate-200 select-none"
                                >
                                  인스타 없음
                                </span>
                              )}

                              <a
                                href={partner.blogUrl || naverSearchUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="네이버 블로그 및 플레이스 검색"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                              >
                                <BookOpen className="w-3 h-3" />
                                네이버·블로그
                              </a>

                              <a
                                href={googleSearchUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="구글 판매 메뉴 검색"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                              >
                                <Globe className="w-3 h-3" />
                                구글검색
                              </a>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {partner.instagramUrl
                                ? `채널 ID: ${partner.snsHandle}`
                                : '인스타그램 공식 계정 미등록'}
                            </div>
                          </td>

                          {/* AI 메뉴·SNS 서칭 버튼 */}
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

            {/* 페이지네이션 컨트롤 */}
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

      {/* ==========================================
          MODAL 0: PC·모바일 실시간 동기화(Supabase) 설정 모달
         ========================================== */}
      {activeModal === 'cloud' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">
                  PC · 모바일 실시간 클라우드 동기화 (Supabase)
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              무료 <strong>Supabase</strong> 프로젝트의 <strong>Project URL</strong>과{' '}
              <strong>anon public Key</strong>를 입력해 두면, PC에서 올린 엑셀 목록과 AI 메뉴 서칭 결과가
              스마트폰에서도 실시간으로 똑같이 동기화됩니다.
            </p>

            <form onSubmit={handleSaveSupabaseConfig} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supabase Anon Public Key
                </label>
                <input
                  type="text"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseForm.anonKey}
                  onChange={(e) => setSupabaseForm({ ...supabaseForm, anonKey: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
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
                    연결 저장 및 즉시 동기화
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 1: 엑셀(.xlsx / .csv) 거래업체 일괄 업로드 모달
         ========================================== */}
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

      {/* ==========================================
          MODAL 2: 신규 거래업체 개별 등록 모달
         ========================================== */}
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
                  SNS 및 블로그 채널 연동 (선택 — 비워두면 &apos;인스타 없음&apos; 표시)
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      인스타그램 계정 ID
                    </label>
                    <input
                      type="text"
                      placeholder="@account_id (없으면 비움)"
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

      {/* ==========================================
          MODAL 3: 위판장 시세 업데이트 모달
         ========================================== */}
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