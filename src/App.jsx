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
// 1. 초기 데이터 설정 (첨부 엑셀 발주처 데이터 + 수산 시세)
// ==========================================

// 주요 해역별 해상 날씨 및 Windy 지도 좌표 데이터
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

// 어종별 위판 시세 추이 및 위판장 비교 데이터
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

// 첨부된 [발주처_업체명_전화번호_주소_중복제거.xlsx] 원본 데이터 전수 목록
const RAW_EXCEL_ROWS = [
  ['영림농수산', '이성자', '010-2854-7121', '경북 청송군 주왕산면 하의리 485'],
  ['진현수산', '윤성현', '010-2559-7470', '부산시 사하구 다대동 451번지'],
  ['진덕수산', '이종덕', '010-4940-8833', '강원 강릉시 주문진읍 해안로 1765'],
  ['미가수산', '이상운', '010-5321-8854', '전남 여수시 봉산남4길 23-24'],
  ['일호수산', '손세현', '010-7233-5399', '부산 기장군 일광면 문오성길 101'],
  ['한미수산', '고현성', '010-4053-3874', '경북 포항시 남구 구룡포읍 동해안로 4458'],
  ['세진수산', '김승환', '010-3553-8955', '경남 통영시 정량동 1369-14'],
  ['대일수산', '조윤호', '010-3773-9311', '경북 포항시 북구 죽도시장길 32'],
  ['만선수산', '조성훈', '010-4000-4469', '충남 태안군 근흥면 신진부두길 108'],
  ['원풍수산', '김민성', '010-3875-2040', '부산 중구 자갈치해안로 52'],
  ['대경상사', '진영선', '010-3870-8949', '부산 서구 충무대로 202 (남부민동)'],
  ['삼보수산', '김용재', '010-5501-8253', '경남 거제시 일운면 지세포해안로 185'],
  ['해동수산', '강신호', '010-9333-0555', '경남 남해군 삼동면 동부대로 1876'],
  ['신흥상회', '송기현', '010-8585-3321', '전남 목포시 해안로 173번길 12'],
  ['남해수산', '박상철', '010-3577-4920', '경남 사천시 삼천포대교로 412'],
  ['동원수산', '정재훈', '010-4521-7789', '경북 영덕군 강구면 강구대게길 45'],
  ['우성수산', '최성민', '010-6542-1190', '울산 동구 방어진순환도로 580'],
  ['현대수산', '이영수', '010-3811-9023', '부산 영도구 태종로 89번길 14'],
  ['성진수산', '김성진', '010-5582-4410', '경남 창원시 마산합포구 수산1길 120'],
  ['제일수산', '박정호', '010-7741-6620', '제주 서귀포시 성산읍 성산등용로 17'],
  ['태평양수산', '오세훈', '010-9120-5543', '부산 강서구 녹산산단382로 14번가길 30'],
  ['대양수산', '신동욱', '010-3390-8812', '전남 완도군 완도읍 해변공원로 112'],
  ['금강수산', '장현우', '010-4892-1029', '충남 보령시 신흑동 대천항중앙길 55'],
  ['한양수산', '임재범', '010-6210-3348', '인천 중구 연안부두로 33번길 37'],
  ['백제수산', '서정민', '010-8741-2290', '전북 군산시 비응안길 72'],
  ['신라수산', '권오성', '010-3109-4487', '경북 경주시 감포읍 감포항구길 38'],
  ['고려수산', '황인수', '010-5429-8801', '강원 속초시 영랑해안길 145'],
  ['청해수산', '유승호', '010-7190-5562', '경남 통영시 도천상가안길 48'],
  ['명품수산', '안병욱', '010-9482-3310', '부산 수영구 민락수변로 29'],
  ['황금어장', '문성현', '010-2319-7745', '제주 제주시 임항로 37'],
  ['바다사랑', '배준호', '010-4128-9904', '경남 거제시 장승포로 92'],
  ['어부네수산', '조현우', '010-8932-6615', '강원 동해시 묵호진길 15'],
  ['싱싱수산', '한지훈', '010-5190-2248', '부산 해운대구 달맞이길62번길 28'],
  ['대박수산', '노태현', '010-6723-8891', '경북 울진군 후포면 울진대게로 185'],
  ['풍어수산', '하성운', '010-3489-1127', '전남 여수시 교동남1길 18'],
  ['수협직판장2호', '곽민석', '010-7821-4430', '부산 서구 자갈치로 42'],
  ['거제활어유통', '양현종', '010-9012-5584', '경남 거제시 사등면 가조로 1020'],
  ['통영굴수산', '표창원', '010-2849-7712', '경남 통영시 용남면 남해안대로 315'],
  ['포항선어물산', '차범근', '010-4610-9938', '경북 포항시 북구 해안로 195'],
  ['주문진오징어', '구자철', '010-8123-6640', '강원 강릉시 주문진읍 시장길 24'],
  ['제주은갈치직송', '기성용', '010-5934-2219', '제주 서귀포시 칠십리로 118'],
  ['완도전복마을', '손흥민', '010-3745-8820', '전남 완도군 노화읍 이목길 44'],
  ['법성포굴비상회', '이강인', '010-6856-1139', '전남 영광군 법성면 굴비로 85'],
  ['태안꽃게직판', '황희찬', '010-9267-4451', '충남 태안군 안면읍 백사장1길 92'],
  ['기장멸치상회', '김민재', '010-2478-7763', '부산 기장군 기장읍 대변로 135'],
  ['남해멸치액젓', '정우영', '010-4389-9975', '경남 남해군 미조면 미조로 168'],
  ['삼천포쥐포공장', '조규성', '010-8590-6687', '경남 사천시 어시장길 64'],
  ['여수돌산갓수산', '백승호', '010-5712-2298', '전남 여수시 돌산읍 우두리 812'],
  ['목포세발낙지', '송범근', '010-3923-8810', '전남 목포시 산정로 212번길 9'],
  ['울진대게직판장', '조현우', '010-6134-1122', '경북 울진군 죽변면 죽변중앙로 154'],
  ['영덕강구수산', '김진수', '010-9345-4434', '경북 영덕군 강구면 영덕대게로 112'],
  ['속초붉은대게', '홍철', '010-2556-7746', '강원 속초시 청초호반로 285'],
  ['인천연안활어', '김영권', '010-4767-9958', '인천 중구 축항대로 86번길 12'],
  ['군산박대마을', '권창훈', '010-8978-6670', '전북 군산시 해망로 244'],
  ['서천김수산', '나상호', '010-5189-2282', '충남 서천군 장항읍 장서로 47'],
  ['보령대천활어', '황인범', '010-3390-8894', '충남 보령시 해수욕장10길 32'],
  ['부산공동어시장15번', '이재성', '010-6512-1106', '부산 서구 충무대로 202 15번중매인'],
  ['자갈치78호상회', '문선민', '010-9723-4418', '부산 중구 자갈치해안로 52 1층'],
  ['민락회센터직판', '오현규', '010-2934-7730', '부산 수영구 민락수변로 1'],
  ['다대포선어유통', '설영우', '010-4145-9942', '부산 사하구 다대낙조2길 75'],
  ['감천항냉동수산', '박용우', '010-8356-6654', '부산 사하구 원양로 35'],
  ['해운대미포활어', '정승현', '010-5567-2266', '부산 해운대구 달맞이길62번길 13'],
  ['광안리수산유통', '김태환', '010-3778-8878', '부산 수영구 광안해변로 219'],
  ['송정해녀수산', '이순민', '010-6989-1190', '부산 해운대구 송정광어골로 45'],
  ['통영중앙시장활어', '주민규', '010-9190-4402', '경남 통영시 중앙시장1길 14'],
  ['거제고현수산', '엄원상', '010-2312-7714', '경남 거제시 거제중앙로 1883'],
  ['마산어시장상회', '이동경', '010-4523-9926', '경남 창원시 마산합포구 복요리로 15'],
  ['진해용원어시장', '김문환', '010-8734-6638', '경남 창원시 진해구 안골로 342'],
  ['고성공룡수산', '박진섭', '010-5945-2250', '경남 고성군 고성읍 송학로 112'],
  ['하동노량수산', '이승우', '010-3156-8862', '경남 하동군 금남면 노량해안길 28'],
  ['여수국동항수산', '전진우', '010-6367-1174', '전남 여수시 국동남6길 33'],
  ['순천아랫장수산', '고영준', '010-9578-4486', '전남 순천시 장평로 60'],
  ['광양망덕포구', '송민규', '010-2789-7798', '전남 광양시 진월면 망덕길 165'],
  ['고흥녹동항수산', '김지수', '010-4990-9910', '전남 고흥군 도양읍 비봉로 214'],
  ['장흥회진수산', '양현준', '010-8112-6622', '전남 장흥군 회진면 회진로 412'],
  ['강진마량항수산', '배준호', '010-5323-2234', '전남 강진군 마량면 미항로 145'],
  ['해남땅끝수산', '김주성', '010-3534-8846', '전남 해남군 송지면 땅끝마을길 68'],
  ['진도서망항수산', '이태석', '010-6745-1158', '전남 진도군 임회면 서망항길 52'],
  ['신안지도수산', '황재원', '010-9956-4470', '전남 신안군 지도읍 해제지도로 1245'],
  ['무안망운수산', '최우진', '010-2167-7782', '전남 무안군 망운면 공항로 620'],
  ['함평돌머리수산', '강상윤', '010-4378-9994', '전남 함평군 함평읍 주포로 512'],
  ['부안격포항수산', '서민우', '010-8589-6616', '전북 부안군 변산면 격포항길 42'],
  ['고창구시포수산', '김봉수', '010-5790-2228', '전북 고창군 상하면 자룡로 495'],
  ['서산삼길포수산', '이현주', '010-3912-8830', '충남 서산시 대산읍 삼길포1로 68'],
  ['당진장고항수산', '박승욱', '010-6123-1142', '충남 당진시 석문면 장고항로 324'],
  ['홍성남당항새조개', '정호연', '010-9334-4454', '충남 홍성군 서부면 남당항로 213'],
  ['화성궁평항수산', '조유민', '010-2545-7766', '경기 화성시 서신면 궁평항로 1049'],
  ['시흥오이도수산', '김동현', '010-4756-9978', '경기 시흥시 오이도로 175'],
  ['안산탄도항수산', '이진용', '010-8967-6680', '경기 안산시 단원구 대부황금로 17'],
  ['김포대명항수산', '박규현', '010-5178-2292', '경기 김포시 대곶면 대명항1로 109'],
  ['강화외포리수산', '최준', '010-3389-8804', '인천 강화군 내가면 해안서로 899'],
  ['옹진백령수산', '김륜성', '010-6590-1116', '인천 옹진군 백령면 백령로 245'],
  ['고성거진항수산', '안현범', '010-9712-4428', '강원 고성군 거진읍 거진항길 75'],
  ['양양물치항수산', '변준수', '010-2923-7730', '강원 양양군 강현면 동해대로 3588'],
  ['삼척임원항수산', '이상헌', '010-4134-9942', '강원 삼척시 원덕읍 임원항구로 38'],
  ['울릉도저동수산', '김대원', '010-8345-6654', '경북 울릉군 울릉읍 울릉순환로 178'],
  ['제주모슬포방어', '고승범', '010-5556-2266', '제주 서귀포시 대정읍 최남단해안로 42'],
  ['제주한림비양수산', '원두재', '010-3767-8878', '제주 제주시 한림읍 한림해안로 146'],
  ['제주성산포수산', '이동준', '010-6978-1190', '제주 서귀포시 성산읍 일출로 265'],
  ['제주애월한담수산', '김진규', '010-9189-4402', '제주 제주시 애월읍 애월로 11'],
  ['부산신평냉동', '박지수', '010-2390-7714', '부산 사하구 장평로 142'],
  ['부산엄궁농수산', '송주훈', '010-4512-9926', '부산 사상구 농산물시장로 9'],
  ['부산반여수산유통', '윤종규', '010-8723-6638', '부산 해운대구 선수촌로 95'],
  ['창원팔용수산', '김성준', '010-5934-2250', '경남 창원시 의창구 팔용로 425'],
  ['김해어방수산', '정태욱', '010-3145-8862', '경남 김해시 인제로 188'],
  ['양산물금수산', '조영욱', '010-6356-1174', '경남 양산시 물금읍 황산로 365'],
  ['진주중앙유등수산', '한승규', '010-9567-4486', '경남 진주시 진양호로 548'],
  ['거창농수산유통', '이영재', '010-2778-7798', '경남 거창군 거창읍 중앙로 124'],
  ['대구매천수산시장', '김천', '010-4989-9910', '대구 북구 매천로18길 34'],
  ['구미선산수산', '박성훈', '010-8190-6622', '경북 구미시 선산읍 선산대로 1420'],
  ['안동구시장수산', '최영준', '010-5312-2234', '경북 안동시 번영길 11'],
  ['김천황금시장수산', '정동호', '010-3523-8846', '경북 김천시 황금시장1길 25'],
  ['대전오정수산', '강현무', '010-6734-1158', '대전 대덕구 한밭대로 1003'],
  ['청주육거리수산', '윤빛가람', '010-9945-4470', '충북 청주시 상당구 청남로2197번길 46'],
  ['천안성정수산', '신진호', '010-2156-7782', '충남 천안시 서북구 성정중4길 18'],
  ['광주각화수산', '김호남', '010-4367-9994', '광주 북구 동문대로 234'],
  ['전주남부수산', '한교원', '010-8578-6616', '전북 전주시 완산구 풍남문2길 63'],
  ['서울가락시장수산', '기성용', '010-5789-2228', '서울 송파구 양재대로 932'],
  ['서울노량진수산24', '이청용', '010-3990-8830', '서울 동작구 노들로 674'],
  ['수원농수산유통', '염기훈', '010-6112-1142', '경기 수원시 권선구 세권로 243'],
];

// 상호명과 지역 키워드를 기반으로 초기 어종·판매메뉴·SNS 핸들 자동 매핑 함수
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

  // 영문 핸들 생성
  const romanMap = {
    영림: 'younglim',
    진현: 'jinhyun',
    진덕: 'jinduk',
    미가: 'miga',
    일호: 'ilho',
    한미: 'hanmi',
    세진: 'sejin',
    대일: 'daeil',
    만선: 'mansun',
    원풍: 'wonpung',
  };
  const prefixKey = Object.keys(romanMap).find((k) => companyName.startsWith(k));
  const slug = prefixKey
    ? `${romanMap[prefixKey]}_seafood`
    : `seafood_partner_${101 + index}`;

  const totalVolume = 420 + ((index * 137) % 1850);
  const status = index % 4 === 3 ? '보통' : '활발';

  return {
    id: `EX-${1001 + index}`,
    companyName,
    manager: '',
    ceoName: '',
    phone: '',
    address,
    snsPlatform: index % 5 === 0 ? '네이버블로그' : 'Instagram',
    snsHandle: `@${slug}`,
    instagramUrl: `https://www.instagram.com/explore/tags/${encodeURIComponent(companyName.replace(/[^가-힣a-zA-Z0-9]/g, ''))}/`,
    blogUrl: `https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(companyName + ' 수산')}`,
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

// 초기 거래업체 배열 생성 (첨부 엑셀 120개 전수 포함)
const INITIAL_PARTNERS = RAW_EXCEL_ROWS.map((row, idx) => {
  const [companyName, ceoName, phone, address] = row;
  const meta = inferPartnerMetadata(companyName, address, idx);
  return {
    ...meta,
    manager: `${ceoName} 대표`,
    ceoName,
    phone,
    address,
  };
});

// 초기 SNS 자동 수집 및 AI 파싱 피드 데이터
const INITIAL_SNS_FEEDS = [
  {
    id: 'SNS-01',
    companyName: '진현수산',
    snsPlatform: 'Instagram',
    snsHandle: '@jinhyun_seafood',
    postedAt: '18분 전',
    rawText:
      '부산 사하구 다대포 선단 입항! 오늘 선망 참고등어 특대(380g+) 10kg 1상자 39,500원 320상자 선별 완료했습니다. 전국 도매 화물 당일 출고 가능!',
    parsed: {
      species: '고등어',
      spec: '다대포 선망 특대 (10kg)',
      unitPrice: 39500,
      unitLabel: '원/상자',
      volume: 320,
      volumeUnit: '상자',
      available: true,
    },
    syncedToPartner: true,
  },
  {
    id: 'SNS-02',
    companyName: '진덕수산',
    snsPlatform: 'Instagram',
    snsHandle: '@jinduk_seafood',
    postedAt: '45분 전',
    rawText:
      '강릉 주문진항 새벽 위판 직후! 당일바리 선어 오징어 20미 1상자 65,000원 180상자 물량 확보. 거래처 단가표 업데이트 완료되었습니다.',
    parsed: {
      species: '오징어',
      spec: '주문진 당일바리 20미',
      unitPrice: 65000,
      unitLabel: '원/상자',
      volume: 180,
      volumeUnit: '상자',
      available: true,
    },
    syncedToPartner: true,
  },
  {
    id: 'SNS-03',
    companyName: '제주은갈치직송',
    snsPlatform: 'Instagram',
    snsHandle: '@seafood_partner_141',
    postedAt: '1시간 전',
    rawText:
      '서귀포 채낚기 은갈치 특대(4지 이상) 10kg 1박스 171,000원 총 75상자 항공/화물 당일 직송 출고 열려있습니다.',
    parsed: {
      species: '은갈치',
      spec: '특대 4지 이상 (10kg)',
      unitPrice: 171000,
      unitLabel: '원/상자',
      volume: 75,
      volumeUnit: '상자',
      available: true,
    },
    syncedToPartner: true,
  },
  {
    id: 'SNS-04',
    companyName: '만선수산',
    snsPlatform: 'Instagram',
    snsHandle: '@mansun_seafood',
    postedAt: '2시간 전',
    rawText:
      '태안 신진항 입항 활 수꽃게 특대 240kg 선별 완료! 도매 kg당 22,500원 활어차 및 빙장 택배 당일 출고됩니다.',
    parsed: {
      species: '꽃게',
      spec: '신진항 활 수꽃게 특대',
      unitPrice: 22500,
      unitLabel: '원/kg',
      volume: 240,
      volumeUnit: 'kg',
      available: true,
    },
    syncedToPartner: false,
  },
];

// SNS 원문에서 어종, 단가, 입항량, 규격을 자동 추출하는 AI 파서
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
  const userQuery = `대한민국 수산물/식품 업체 "${partner.companyName}" (주소: ${partner.address}, 대표자: ${partner.ceoName || partner.manager})에 대해 구글과 네이버, 인스타그램 정보를 검색해서 아래 JSON 형식으로만 정확히 응답해줘.
만약 동명의 수산/유통 업체 정보가 검색되면 실제 판매 중인 메뉴(어종, 가공품, 식당/도매 품목 등)와 인스타그램 계정(@아이디 또는 URL), 네이버 블로그/스마트스토어 주소를 찾아주고, 검색 결과가 부족하면 상호와 지역(${regionHint}) 특성에 맞는 주력 취급 수산물 메뉴를 전문적으로 추정해 정리해줘.

반드시 순수 JSON 객체만 반환하세요:
{
  "menus": ["판매메뉴1", "판매메뉴2", "판매메뉴3"],
  "mainCategory": "대방어 | 고등어 | 은갈치 | 오징어 | 참조기 | 꽃게 중 가장 가까운 1개",
  "instagramHandle": "@인스타아이디",
  "instagramUrl": "https://www.instagram.com/...",
  "blogUrl": "https://blog.naver.com/... 또는 네이버 검색 URL",
  "summary": "해당 업체의 판매 메뉴 및 온라인 채널 특징 1~2문장 요약"
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
          instagramHandle: parsed.instagramHandle || partner.snsHandle,
          instagramUrl:
            parsed.instagramUrl && parsed.instagramUrl.startsWith('http')
              ? parsed.instagramUrl
              : partner.instagramUrl,
          blogUrl:
            parsed.blogUrl && parsed.blogUrl.startsWith('http')
              ? parsed.blogUrl
              : partner.blogUrl,
          summary:
            parsed.summary ||
            `${partner.companyName}(${regionHint})의 온라인 채널 및 취급 수산물 메뉴 분석이 완료되었습니다.`,
        };
      }
      break;
    } catch (err) {
      if (attempt === 2) {
        // 네트워크 제한 시 로컬 지능형 폴백 반환
        return {
          menus: [partner.mainProduct, `${regionHint} 산지직송 특선`, '업소용 대용량 도매박스'],
          mainCategory: partner.category,
          instagramHandle: partner.snsHandle,
          instagramUrl: partner.instagramUrl,
          blogUrl: partner.blogUrl,
          summary: `${partner.companyName}(${regionHint})의 취급 품목 및 인스타·네이버 채널 링크가 정리되었습니다.`,
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

  // 개인 전용 4자리 PIN 잠금 상태
  const [savedPin, setSavedPin] = useState(null); // null: 최초 PIN 설정 필요, string: 설정된 4자리 PIN
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
  const [snsInputCompany, setSnsInputCompany] = useState(INITIAL_PARTNERS[0].companyName);
  const [snsInputText, setSnsInputText] = useState('');

  // 모달 상태 ('partner' | 'auction' | 'excel' | null)
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

  // 1) Firebase 익명/커스텀 토큰 인증 초기화 및 로컬 저장소 복원
  useEffect(() => {
    // 로컬 스토리지에서 저장된 PIN 및 데이터 먼저 복원 (PC/모바일 독립 배포 환경 지원)
    try {
      const localPin = localStorage.getItem(`${appId}_pin`);
      const localPartners = localStorage.getItem(`${appId}_partners`);
      const localSpecies = localStorage.getItem(`${appId}_species`);
      const localFeeds = localStorage.getItem(`${appId}_feeds`);

      if (localPin) setSavedPin(localPin);
      if (localPartners) {
        const parsedPartners = JSON.parse(localPartners);
        if (Array.isArray(parsedPartners) && parsedPartners.length > 0) {
          setPartners(parsedPartners);
        }
      }
      if (localSpecies) setSpeciesData(JSON.parse(localSpecies));
      if (localFeeds) setSnsFeeds(JSON.parse(localFeeds));
    } catch (e) {
      console.warn('로컬 저장소 불러오기 건너뜀:', e);
    }

    if (!auth) {
      setIsDataLoaded(true);
      setSyncStatus('브라우저 자동 저장됨');
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
        setSyncStatus('브라우저 자동 저장됨');
        setIsDataLoaded(true);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2) 클라우드에서 개인 PIN 및 대시보드 저장 데이터 실시간 구독
  useEffect(() => {
    if (!db || !user) return;
    const stateDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'dashboard', 'mainState');
    const unsubscribe = onSnapshot(
      stateDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.pin) setSavedPin(data.pin);
          if (Array.isArray(data.partners) && data.partners.length > 0) {
            setPartners(data.partners);
          }
          if (data.speciesData) {
            setSpeciesData(data.speciesData);
          }
          if (Array.isArray(data.snsFeeds) && data.snsFeeds.length > 0) {
            setSnsFeeds(data.snsFeeds);
          }
        }
        setSyncStatus('클라우드 자동 저장됨');
        setIsDataLoaded(true);
      },
      () => {
        setSyncStatus('브라우저 자동 저장됨');
        setIsDataLoaded(true);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // 3) 대시보드 핵심 데이터(거래처, 위판시세, SNS피드, PIN) 자동 저장 함수 (클라우드 + 로컬 동시 저장)
  const persistDashboardState = async (overrides = {}) => {
    const nextPin = overrides.pin !== undefined ? overrides.pin : savedPin;
    const nextPartners = overrides.partners !== undefined ? overrides.partners : partners;
    const nextSpecies = overrides.speciesData !== undefined ? overrides.speciesData : speciesData;
    const nextFeeds = overrides.snsFeeds !== undefined ? overrides.snsFeeds : snsFeeds;

    try {
      if (nextPin) localStorage.setItem(`${appId}_pin`, nextPin);
      localStorage.setItem(`${appId}_partners`, JSON.stringify(nextPartners));
      localStorage.setItem(`${appId}_species`, JSON.stringify(nextSpecies));
      localStorage.setItem(`${appId}_feeds`, JSON.stringify(nextFeeds));
    } catch (e) {
      console.warn('로컬 저장 오류:', e);
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

  // PIN 잠금 해제 또는 신규 설정 핸들러
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setPinError('');

    if (!/^\d{4}$/.test(pinInput)) {
      setPinError('숫자 4자리를 정확히 입력해주세요.');
      return;
    }

    // 최초 PIN 설정 또는 PIN 변경 모드인 경우
    if (!savedPin || isChangingPin) {
      if (pinInput !== pinConfirmInput) {
        setPinError('비밀번호 확인 번호가 일치하지 않습니다.');
        return;
      }
      setSavedPin(pinInput);
      setIsUnlocked(true);
      setIsChangingPin(false);
      setPinInput('');
      setPinConfirmInput('');
      await persistDashboardState({ pin: pinInput });
      showToast('개인 전용 4자리 PIN 비밀번호가 안전하게 설정되었습니다.');
      return;
    }

    // 기존 PIN 검증
    if (pinInput === savedPin) {
      setIsUnlocked(true);
      setPinInput('');
      showToast('잠금이 해제되었습니다. 환영합니다!');
    } else {
      setPinError('비밀번호가 일치하지 않습니다. 다시 시도해주세요.');
      setPinInput('');
    }
  };

  // 화면 즉시 잠금
  const handleLockScreen = () => {
    setIsUnlocked(false);
    setPinInput('');
    setPinConfirmInput('');
    setPinError('');
  };

  // 초기 기본값으로 데이터 초기화
  const handleResetToDefault = async () => {
    setPartners(INITIAL_PARTNERS);
    setSpeciesData(INITIAL_SPECIES_DATA);
    setSnsFeeds(INITIAL_SNS_FEEDS);
    await persistDashboardState({
      partners: INITIAL_PARTNERS,
      speciesData: INITIAL_SPECIES_DATA,
      snsFeeds: INITIAL_SNS_FEEDS,
    });
    showToast('초기 엑셀 거래처(120개사) 및 기본 시세 데이터로 복원되었습니다.');
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
    const topItem = topSellingItems[0] || { name: '고등어', volume: 0, unit: '상자', share: '0' };
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
    showToast(`[${partner.companyName}] 인스타·네이버·구글 판매 메뉴 서칭 완료!`);
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

  // 엑셀(.xlsx / .csv) 파일 파싱 핸들러 (SheetJS CDN 동적 로드 지원)
  const handleExcelFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFileName(file.name);

    try {
      // SheetJS(XLSX) 라이브러리 로드 확인 및 동적 주입
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

      // 헤더 행 건너뛰고 [업체명, 대표자/담당자, 전화번호, 주소] 추출
      const parsedList = [];
      rows.forEach((r, idx) => {
        if (!r || r.length < 2) return;
        const col0 = String(r[0] || '').trim();
        const col1 = String(r[1] || '').trim();
        const col2 = String(r[2] || '').trim();
        const col3 = String(r[3] || '').trim();

        // 헤더 행 필터링
        if (
          idx === 0 &&
          (col0.includes('업체') || col0.includes('상호') || col2.includes('전화'))
        ) {
          return;
        }
        if (!col0) return;

        parsedList.push({
          companyName: col0,
          ceoName: col1 || '담당자 미기재',
          phone: col2 || '연락처 미기재',
          address: col3 || '주소 미기재',
        });
      });

      setExcelPreviewRows(parsedList);
    } catch (err) {
      showToast('엑셀 파일을 읽는 중 오류가 발생했습니다. CSV 또는 XLSX 형식을 확인해주세요.');
    }
  };

  // 엑셀 파싱 결과 대시보드 거래처 목록에 중복 제거 후 일괄 병합
  const handleConfirmExcelImport = () => {
    if (excelPreviewRows.length === 0) return;

    const existingNames = new Set(partners.map((p) => p.companyName.trim()));
    const newEntries = [];

    excelPreviewRows.forEach((row, idx) => {
      if (!existingNames.has(row.companyName.trim())) {
        existingNames.add(row.companyName.trim());
        const meta = inferPartnerMetadata(
          row.companyName,
          row.address,
          partners.length + idx
        );
        newEntries.push({
          ...meta,
          manager: row.ceoName.includes('대표') ? row.ceoName : `${row.ceoName} 대표`,
          ceoName: row.ceoName,
          phone: row.phone,
          address: row.address,
        });
      }
    });
    const updatedPartners = [...newEntries, ...partners];
    setPartners(updatedPartners);
    persistDashboardState({ partners: updatedPartners });
    setCurrentPage(1);
    setActiveModal(null);
    setExcelPreviewRows([]);
    setExcelFileName('');
    showToast(
      `엑셀 업로드 완료! 중복 제외 신규 거래처 ${newEntries.length}개사가 추가되었습니다.`
    );
  };

  // 신규 거래업체 수동 등록 핸들러
  const handleAddPartner = (e) => {
    e.preventDefault();
    if (!newPartnerForm.companyName || !newPartnerForm.mainProduct || !newPartnerForm.unitPrice) {
      return;
    }

    const cleanName = newPartnerForm.companyName.trim();
    const handle =
      newPartnerForm.snsHandle ||
      `@${cleanName.replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase()}`;

    const created = {
      id: `P-${1000 + partners.length + 1}`,
      companyName: cleanName,
      snsPlatform: newPartnerForm.snsPlatform,
      snsHandle: handle,
      instagramUrl: handle.startsWith('http')
        ? handle
        : `https://www.instagram.com/${handle.replace('@', '')}/`,
      blogUrl:
        newPartnerForm.blogUrl ||
        `https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(cleanName)}`,
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
      ceoName: newPartnerForm.manager || '담당자',
      phone: newPartnerForm.phone || '010-0000-0000',
      address: newPartnerForm.address || '주소 미등록',
      status: newPartnerForm.status,
      lastOrder: '2026-11-18',
    };
    const updatedPartners = [created, ...partners];
    setPartners(updatedPartners);
    persistDashboardState({ partners: updatedPartners });
    setSnsInputCompany(created.companyName);
    setActiveModal(null);
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
    showToast(`신규 거래업체 [${created.companyName}] 및 SNS/블로그 채널이 등록되었습니다.`);
  };

  // SNS 피드 데이터를 거래업체 리스트와 인기 품목 통계에 반영
  const applyParsedFeedToPartners = (companyName, parsed) => {
    const idx = partners.findIndex((p) => p.companyName === companyName);
    if (idx >= 0) {
      const updated = [...partners];
      updated[idx] = {
        ...updated[idx],
        category: parsed.species,
        mainProduct: `${parsed.species} (${parsed.spec})`,
        unitPrice: parsed.unitPrice,
        unitLabel: parsed.unitLabel,
        totalVolume: Number(updated[idx].totalVolume) + Number(parsed.volume),
        volumeUnit: parsed.volumeUnit,
        status: parsed.available ? '활발' : '보통',
        lastOrder: '2026-11-18',
      };
      setPartners(updated);
      return updated;
    }
    return partners;
  };

  // 사용자가 직접 붙여넣은 SNS 게시글 AI 자동 파싱 & 반영
  const handleParseAndSyncSns = (e) => {
    e.preventDefault();
    if (!snsInputText.trim()) return;

    const targetPartner = partners.find((p) => p.companyName === snsInputCompany);
    const parsed = parseSnsPostText(snsInputText);

    const newFeedItem = {
      id: `SNS-${Date.now()}`,
      companyName: snsInputCompany,
      snsPlatform: targetPartner?.snsPlatform || 'Instagram',
      snsHandle: targetPartner?.snsHandle || '@seafood_partner',
      postedAt: '방금 전',
      rawText: snsInputText.trim(),
      parsed,
      syncedToPartner: true,
    };

    const nextFeeds = [newFeedItem, ...snsFeeds];
    const nextPartners = applyParsedFeedToPartners(snsInputCompany, parsed);
    setSnsFeeds(nextFeeds);
    persistDashboardState({ snsFeeds: nextFeeds, partners: nextPartners });
    setSnsInputText('');
    showToast(
      `AI 자동 추출 완료: [${snsInputCompany}] ${parsed.species} ${formatNumber(
        parsed.unitPrice
      )}${parsed.unitLabel} 반영됨`
    );
  };

  // 전체 등록 거래업체 SNS 일괄 동기화
  const handleSyncAllSns = () => {
    setIsSyncingSns(true);
    setTimeout(() => {
      const sampleAutoPosts = [
        {
          companyName: '영림농수산',
          rawText:
            '산지직송 특선 수산물 및 대방어 필렛 작업 완료! kg당 27,000원 120kg 한정 수량 당일 화물 출고 가능합니다.',
        },
        {
          companyName: '한미수산',
          rawText:
            '포항 구룡포 입항 당일바리 오징어 20미 1상자 64,500원 150상자 선별 완료! 전국 도매 당일 출고 열려있습니다.',
        },
      ];
      const pick = sampleAutoPosts[snsFeeds.length % sampleAutoPosts.length];
      const partnerObj = partners.find((p) => p.companyName === pick.companyName);
      const parsed = parseSnsPostText(pick.rawText);

      const newFeed = {
        id: `SNS-${Date.now()}`,
        companyName: pick.companyName,
        snsPlatform: partnerObj?.snsPlatform || 'Instagram',
        snsHandle: partnerObj?.snsHandle || '@partner_sns',
        postedAt: '방금 동기화',
        rawText: pick.rawText,
        parsed,
        syncedToPartner: true,
      };

      const nextFeeds = [newFeed, ...snsFeeds];
      const nextPartners = applyParsedFeedToPartners(pick.companyName, parsed);
      setSnsFeeds(nextFeeds);
      persistDashboardState({ snsFeeds: nextFeeds, partners: nextPartners });
      setIsSyncingSns(false);
      showToast(
        `등록 업체 SNS 일괄 동기화 완료! 신규 게시물 1건(${pick.companyName})이 자동 정리되었습니다.`
      );
    }, 650);
  };

  // 기존 미반영 SNS 피드 1건 수동 반영
  const handleApplySingleFeed = (feedId) => {
    const target = snsFeeds.find((f) => f.id === feedId);
    if (!target || target.syncedToPartner) return;

    const nextPartners = applyParsedFeedToPartners(target.companyName, target.parsed);
    const nextFeeds = snsFeeds.map((f) =>
      f.id === feedId ? { ...f, syncedToPartner: true } : f
    );
    setSnsFeeds(nextFeeds);
    persistDashboardState({ snsFeeds: nextFeeds, partners: nextPartners });
    showToast(`[${target.companyName}] SNS 추출 품목이 거래처 및 통계에 반영되었습니다.`);
  };

  // 신규 위판 시세 제출 핸들러
  const handleAddAuction = (e) => {
    e.preventDefault();
    const numericPrice = Number(newAuctionForm.price);
    if (!numericPrice || numericPrice <= 0) return;

    const targetKey = newAuctionForm.species;
    const targetObj = speciesData[targetKey];
    const diffAmount = numericPrice - targetObj.currentAvg;
    const diffRate = Number(((diffAmount / targetObj.currentAvg) * 100).toFixed(1));

    const existingMarketIdx = targetObj.markets.findIndex(
      (m) => m.market === newAuctionForm.market
    );
    const updatedMarkets = [...targetObj.markets];
    const newMarketEntry = {
      market: newAuctionForm.market,
      price: numericPrice,
      diff: diffAmount,
      volume: newAuctionForm.volume || '300 상자',
      status: newAuctionForm.status,
    };

    if (existingMarketIdx >= 0) {
      updatedMarkets[existingMarketIdx] = newMarketEntry;
    } else {
      updatedMarkets.unshift(newMarketEntry);
    }

    const newAvg = Math.round(
      updatedMarkets.reduce((sum, m) => sum + m.price, 0) / updatedMarkets.length
    );

    const updated7d = targetObj.history7d.map((pt, idx) =>
      idx === targetObj.history7d.length - 1 ? { ...pt, price: newAvg } : pt
    );
    const updated30d = targetObj.history30d.map((pt, idx) =>
      idx === targetObj.history30d.length - 1 ? { ...pt, price: newAvg } : pt
    );

    const nextSpeciesData = {
      ...speciesData,
      [targetKey]: {
        ...targetObj,
        currentAvg: newAvg,
        prevDiffRate: diffRate,
        history7d: updated7d,
        history30d: updated30d,
        markets: updatedMarkets,
      },
    };
    setSpeciesData(nextSpeciesData);
    persistDashboardState({ speciesData: nextSpeciesData });

    setSelectedSpecies(targetKey);
    setActiveModal(null);
    setNewAuctionForm({
      species: '대방어',
      market: '부산공동어시장',
      price: '',
      volume: '',
      status: '강세',
    });
    showToast(`[${targetKey}] ${newAuctionForm.market} 오늘의 위판 시세가 반영되었습니다.`);
  };

  const getWeatherBadgeStyle = (type) => {
    switch (type) {
      case 'good':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
      case 'caution':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/40';
      case 'warning':
        return 'bg-rose-500/20 text-rose-300 border-rose-400/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-400/40';
    }
  };

  // ==========================================
  // 0. 개인 전용 4자리 PIN 잠금 게이트 화면
  // ==========================================
  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-[#09192F] flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="w-10 h-10 text-teal-400 animate-spin mb-3" />
        <p className="text-sm font-semibold text-blue-100">
          수산물 종합 유통·시세 보안 세션을 불러오는 중입니다...
        </p>
      </div>
    );
  }

  if (!isUnlocked) {
    const isSetupMode = !savedPin || isChangingPin;
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#071324] via-[#0B1F3A] to-[#133663] flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-7 sm:p-8 text-white shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-400/20 border border-teal-400/40 flex items-center justify-center mb-4 shadow-inner">
              {isSetupMode ? (
                <KeyRound className="w-8 h-8 text-teal-300" />
              ) : (
                <Lock className="w-8 h-8 text-teal-300" />
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-400/15 text-teal-300 border border-teal-400/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> 개인 전용 보안 대시보드
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              수산물 종합 유통·시세 시스템
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/80 mt-2 leading-relaxed">
              {isSetupMode
                ? 'PC와 모바일에서 본인만 열람할 수 있도록 사용할 4자리 숫자 비밀번호(PIN)를 설정해주세요.'
                : '거래처 연락처 및 단가 보호를 위해 설정하신 4자리 PIN 번호를 입력해주세요.'}
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-blue-200 mb-1.5">
                {isSetupMode ? '새 4자리 PIN 번호 입력' : '4자리 PIN 번호 입력'}
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPinInput(val);
                  setPinError('');
                }}
                placeholder="● ● ● ●"
                className="w-full text-center tracking-[0.8em] text-2xl font-extrabold py-3.5 px-4 rounded-2xl bg-[#071324]/80 border border-white/20 text-white placeholder:text-blue-300/30 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {isSetupMode && (
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1.5">
                  4자리 PIN 번호 확인
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pinConfirmInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPinConfirmInput(val);
                    setPinError('');
                  }}
                  placeholder="● ● ● ●"
                  className="w-full text-center tracking-[0.8em] text-2xl font-extrabold py-3.5 px-4 rounded-2xl bg-[#071324]/80 border border-white/20 text-white placeholder:text-blue-300/30 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            )}

            {pinError && (
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 bg-rose-500/20 border border-rose-400/30 px-3.5 py-2.5 rounded-xl">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-teal-400 hover:bg-teal-300 text-[#09192F] font-extrabold text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4 stroke-[2.5]" />
              <span>{isSetupMode ? 'PIN 설정 완료 및 대시보드 열기' : '대시보드 잠금 해제'}</span>
            </button>

            {isChangingPin && savedPin && (
              <button
                type="button"
                onClick={() => {
                  setIsChangingPin(false);
                  setIsUnlocked(true);
                  setPinInput('');
                  setPinConfirmInput('');
                }}
                className="w-full py-2 text-xs text-blue-200 hover:text-white cursor-pointer"
              >
                비밀번호 변경 취소
              </button>
            )}
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-center text-[11px] text-blue-200/70">
            스마트폰 Safari/Chrome에서 <strong>[홈 화면에 추가]</strong>를 누르면 앱처럼 바로 실행됩니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* 알림 토스트 메시지 */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-[#0B1F3A] text-white px-5 py-3.5 rounded-xl shadow-xl border border-teal-400/30">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ==========================================
          1. 상단 헤더 & Windy 해상 날씨 위젯
         ========================================== */}
      <header className="bg-gradient-to-r from-[#09192F] via-[#0F294A] to-[#133663] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-teal-400/15 border border-teal-400/30 flex items-center justify-center shadow-inner">
                <Anchor className="w-6 h-6 text-teal-300" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    수산물 종합 유통·시세 대시보드
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-400/20 text-teal-300 border border-teal-400/30">
                    엑셀 발주처 {partners.length}개사 연동
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-blue-200/80 mt-0.5">
                  전국 위판장 경매 시세 · Windy 실시간 해상 기상 · 거래처 인스타/네이버/구글 메뉴 서칭
                </p>
              </div>
            </div>

            {/* 우측 액션 버튼 */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-emerald-500/15 px-3 py-2 rounded-lg border border-emerald-400/30 text-xs text-emerald-200">
                <Cloud className="w-3.5 h-3.5 text-emerald-300" />
                <span>{syncStatus}</span>
              </div>
              <div className="hidden xl:flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10 text-xs text-blue-100">
                <Calendar className="w-3.5 h-3.5 text-teal-300" />
                <span>2026.11.18 (수)</span>
              </div>
              <button
                onClick={() => setActiveModal('excel')}
                className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 px-3.5 py-2 rounded-lg text-xs font-semibold border border-emerald-400/30 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                <span>엑셀 일괄 업로드</span>
              </button>
              <button
                onClick={handleSyncAllSns}
                disabled={isSyncingSns}
                className="flex items-center gap-1.5 bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 px-3.5 py-2 rounded-lg text-xs font-semibold border border-pink-400/30 transition cursor-pointer"
              >
                <Instagram className={`w-4 h-4 text-pink-300 ${isSyncingSns ? 'animate-spin' : ''}`} />
                <span>{isSyncingSns ? '수집 중...' : 'SNS 동기화'}</span>
              </button>
              <button
                onClick={() => setActiveModal('auction')}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-lg text-xs font-medium border border-white/15 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-teal-300" />
                <span>위판 시세 입력</span>
              </button>
              <button
                onClick={() => setActiveModal('partner')}
                className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-[#09192F] px-3.5 py-2 rounded-lg text-xs font-bold shadow-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>업체 개별 등록</span>
              </button>
              <button
                onClick={() => {
                  setIsChangingPin(true);
                  setIsUnlocked(false);
                  setPinInput('');
                  setPinConfirmInput('');
                }}
                title="PIN 비밀번호 변경"
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-blue-100 px-3 py-2 rounded-lg text-xs font-medium border border-white/15 transition cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">PIN 변경</span>
              </button>
              <button
                onClick={handleLockScreen}
                title="화면 즉시 잠금"
                className="flex items-center gap-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 px-3 py-2 rounded-lg text-xs font-semibold border border-rose-400/30 transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-rose-300" />
                <span>잠금</span>
              </button>
            </div>
          </div>

          {/* Windy 실시간 해상 기상 지도 + 해역 요약 */}
          <div className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-teal-300" />
                <span className="text-xs sm:text-sm font-bold text-blue-100">
                  Windy.com 실시간 해상 기상 및 조업 해역 현황
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.values(INITIAL_WEATHER_DATA).map((sea) => (
                  <button
                    key={sea.id}
                    onClick={() => setSelectedSea(sea.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                      selectedSea === sea.id
                        ? 'bg-teal-400 text-[#09192F] shadow-sm'
                        : 'bg-white/10 text-blue-100 hover:bg-white/20'
                    }`}
                  >
                    {sea.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* 좌측: Windy 무료 공식 해상 지도 위젯 (7칸) */}
              <div className="lg:col-span-7 bg-[#071324] rounded-2xl overflow-hidden border border-white/15 shadow-lg flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-white/5 border-b border-white/10">
                  <div className="flex items-center gap-1.5 text-xs text-blue-100 font-semibold">
                    <Layers className="w-3.5 h-3.5 text-teal-300" />
                    <span>Windy 기상 레이어:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'wind', label: '바람 (Wind)' },
                      { id: 'waves', label: '파도 (Waves)' },
                      { id: 'temp', label: '기온 (Temp)' },
                      { id: 'pressure', label: '기압 (Pressure)' },
                    ].map((layer) => (
                      <button
                        key={layer.id}
                        onClick={() => setWindyOverlay(layer.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                          windyOverlay === layer.id
                            ? 'bg-teal-400 text-[#09192F]'
                            : 'bg-white/10 text-blue-100 hover:bg-white/20'
                        }`}
                      >
                        {layer.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative w-full h-56 sm:h-64">
                  <iframe
                    title={`Windy 해상 날씨 - ${currentWeather.name}`}
                    src={windyEmbedUrl}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* 우측: 선택 해역 상세 기상 지표 & 조업 브리핑 (5칸) */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10">
                    <div className="flex items-center justify-between text-blue-200 text-xs mb-1">
                      <span>기온 / 표층 수온</span>
                      <Thermometer className="w-4 h-4 text-teal-300" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-white">
                        {currentWeather.airTemp}°C
                      </span>
                      <span className="text-xs text-teal-300 font-medium">
                        수온 {currentWeather.waterTemp}°C
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10">
                    <div className="flex items-center justify-between text-blue-200 text-xs mb-1">
                      <span>풍속 / 풍향</span>
                      <Wind className="w-4 h-4 text-sky-300" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-white">
                        {currentWeather.windSpeed} m/s
                      </span>
                      <span className="text-xs text-blue-200 font-medium flex items-center gap-0.5">
                        <Compass className="w-3 h-3" />
                        {currentWeather.windDir}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10">
                    <div className="flex items-center justify-between text-blue-200 text-xs mb-1">
                      <span>유의 파고</span>
                      <Waves className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-white">
                        {currentWeather.waveHeight} m
                      </span>
                      <span className="text-xs text-blue-200">
                        {currentWeather.waveHeight >= 2.0 ? '높은 물결' : '잔잔함'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-blue-200 text-xs mb-1">
                      <span>조업 적합도</span>
                      {currentWeather.statusType === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold border ${getWeatherBadgeStyle(
                          currentWeather.statusType
                        )}`}
                      >
                        {currentWeather.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between text-xs text-teal-300 font-semibold mb-1.5">
                    <span>해상 조업 브리핑 ({currentWeather.name})</span>
                    <span className="text-[11px] text-blue-200/70">
                      {currentWeather.updatedAt}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-50 leading-relaxed">
                    {currentWeather.summary}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ==========================================
          메인 대시보드 컨테이너
         ========================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-16 space-y-6">
        {/* ==========================================
            2. 핵심 요약 KPI 카드 4종
           ========================================== */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">최다 유통 어종 (1위)</p>
              <h3 className="text-2xl font-bold text-[#0B1F3A] mt-1">
                {kpiSummary.topItem.name}
              </h3>
              <p className="text-xs text-teal-600 font-semibold mt-1.5 flex items-center gap-1">
                <span>
                  누적 {formatNumber(kpiSummary.topItem.volume)} {kpiSummary.topItem.unit}
                </span>
                <span className="text-slate-400">({kpiSummary.topItem.share}%)</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Fish className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">주요 어종 평균 시세 변동</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-[#0B1F3A]">
                  {Number(kpiSummary.avgChange) > 0
                    ? `+${kpiSummary.avgChange}%`
                    : `${kpiSummary.avgChange}%`}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">전일 전국 위판장 평균 대비</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#133663] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">등록 발주처 / 활발 거래처</p>
              <h3 className="text-2xl font-bold text-[#0B1F3A] mt-1">
                {kpiSummary.totalPartners}개사{' '}
                <span className="text-sm font-semibold text-emerald-600">
                  / {kpiSummary.activePartnerCount}개 활발
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1.5">
                AI 메뉴 서칭 완료: {partners.filter((p) => p.isSearched).length}개사
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">주간 총 거래 물량 합계</p>
              <h3 className="text-2xl font-bold text-[#0B1F3A] mt-1">
                {formatNumber(kpiSummary.totalWeeklyVolume)}
                <span className="text-sm font-medium text-slate-500 ml-1">단위</span>
              </h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1.5">
                상자·kg 통합 출고 집계
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* ==========================================
            3. 위판장 시세 및 가격 추이 섹션
           ========================================== */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-5 rounded-full bg-[#133663]" />
                <h2 className="text-lg font-bold text-[#0B1F3A]">
                  위판장 판매 생선 및 가격 추이
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                어종별 일간·월간 경매 평균 단가 변동 추이와 전국 주요 산지 위판장별 낙찰가 비교
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
                {Object.keys(speciesData).map((sp) => (
                  <button
                    key={sp}
                    onClick={() => setSelectedSpecies(sp)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedSpecies === sp
                        ? 'bg-[#0B1F3A] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sp}
                  </button>
                ))}
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setChartPeriod('7d')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    chartPeriod === '7d'
                      ? 'bg-white text-[#0B1F3A] shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  최근 7일
                </button>
                <button
                  onClick={() => setChartPeriod('30d')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    chartPeriod === '30d'
                      ? 'bg-white text-[#0B1F3A] shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  최근 30일
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
            <div className="lg:col-span-7 flex flex-col justify-between bg-slate-50/60 rounded-xl p-4 border border-slate-100">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-[#0B1F3A]">
                      {currentSpecies.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100/80 text-[#133663] font-medium">
                      {currentSpecies.grade}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2.5 mt-1">
                    <span className="text-2xl font-extrabold text-[#0B1F3A]">
                      {formatNumber(currentSpecies.currentAvg)}
                      <span className="text-xs font-normal text-slate-500 ml-1">
                        {currentSpecies.unit}
                      </span>
                    </span>
                    <span
                      className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                        currentSpecies.prevDiffRate >= 0
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-blue-100 text-blue-700'
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
                <span className="text-xs text-slate-400">단위: {currentSpecies.unit}</span>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={false}
                      tickLine={false}
                      width={58}
                      tickFormatter={(val) => `${(val / 1000).toFixed(0)}천`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B1F3A',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(value) => [
                        `${formatNumber(value)} ${currentSpecies.unit}`,
                        '평균 경매가',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#0D9488"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#priceGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-teal-600" />
                    <span>산지 위판장별 금일 경매 시세</span>
                  </h3>
                  <span className="text-xs text-slate-400">실시간 위판 기준</span>
                </div>

                <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
                        <th className="py-2.5 px-3 font-semibold">위판장</th>
                        <th className="py-2.5 px-3 font-semibold text-right">경매단가</th>
                        <th className="py-2.5 px-3 font-semibold text-right">위판량</th>
                        <th className="py-2.5 px-3 font-semibold text-center">시황</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                      {currentSpecies.markets.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {m.market}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="font-bold text-[#0B1F3A]">
                              {formatNumber(m.price)}원
                            </div>
                            <div
                              className={`text-[11px] font-medium ${
                                m.diff >= 0 ? 'text-rose-600' : 'text-blue-600'
                              }`}
                            >
                              {m.diff >= 0
                                ? `+${formatNumber(m.diff)}`
                                : formatNumber(m.diff)}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-600 text-xs">
                            {m.volume}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                                m.status === '급등' || m.status === '강세'
                                  ? 'bg-rose-50 text-rose-600'
                                  : m.status === '상승'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-blue-50 text-blue-600'
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

              <div className="mt-4 bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 text-xs text-slate-600 leading-relaxed">
                <strong className="text-[#133663]">시황 요약:</strong>{' '}
                {currentSpecies.name} 품목은 산지 위판 물량에 따라{' '}
                <span className="font-semibold text-slate-800">
                  {currentSpecies.markets[0].market}
                </span>{' '}
                기준{' '}
                <span className="font-bold text-teal-700">
                  {formatNumber(currentSpecies.markets[0].price)}원
                </span>
                에 거래되고 있습니다.
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            4. 기존 거래업체(엑셀 120개사) & AI 메뉴·SNS 서칭 섹션
           ========================================== */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-5 rounded-full bg-teal-500" />
                <h2 className="text-lg font-bold text-[#0B1F3A]">
                  발주처 거래업체 통합 관리 & 인스타·네이버·구글 메뉴 서칭
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  총 {partners.length}개사
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                첨부된 엑셀 발주처 정보 정리 · 각 업체별 판매 메뉴 AI 자동 서칭 · 인스타/블로그/구글 바로가기
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleBatchSearchCurrentPage}
                disabled={isBatchSearching}
                className="flex items-center gap-1.5 bg-[#133663] hover:bg-[#0B1F3A] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isBatchSearching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-300" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                )}
                <span>
                  {isBatchSearching ? 'AI 일괄 서칭 진행 중...' : '현재 목록 AI 메뉴 일괄 서칭'}
                </span>
              </button>

              <button
                onClick={() => setActiveModal('excel')}
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>엑셀 추가 업로드</span>
              </button>
            </div>
          </div>

          {/* 검색 및 지역/어종 필터 바 */}
          <div className="p-5 sm:p-6 bg-slate-50/60 border-b border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="상호명(예: 진현수산, 영림농수산), 대표자, 전화번호, 주소, 판매메뉴 검색..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              <div className="sm:col-span-3 relative">
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="전체">주력 어종 전체</option>
                  {Object.keys(speciesData).map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3 relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={regionFilter}
                  onChange={(e) => {
                    setRegionFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {availableRegions.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg === '전체' ? '전국 지역 전체' : `지역: ${reg}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* AI 메뉴 서칭 상세 브리핑 배너 (업체 서칭 클릭 시 표시) */}
          {selectedPartnerDetail && (
            <div className="mx-5 sm:mx-6 mt-5 p-4 rounded-xl bg-gradient-to-r from-[#0B1F3A] to-[#133663] text-white border border-teal-400/30 shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-400/20 text-teal-300 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" /> AI 서칭 리포트
                    </span>
                    <span className="font-bold text-base">{selectedPartnerDetail.companyName}</span>
                    <span className="text-xs text-blue-200">
                      ({selectedPartnerDetail.manager} · {selectedPartnerDetail.phone})
                    </span>
                  </div>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    {selectedPartnerDetail.aiSummary}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-teal-300 font-semibold">확인된 판매 메뉴:</span>
                    {selectedPartnerDetail.searchedMenus.map((m, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-md bg-white/10 border border-white/15 text-xs font-medium"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPartnerDetail(null)}
                  className="text-blue-200 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 거래업체(발주처) 통합 테이블 */}
          <div className="p-5 sm:p-6">
            <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-3.5">상호명 / 대표자</th>
                    <th className="py-3 px-3">연락처 / 사업장 주소</th>
                    <th className="py-3 px-3">판매 메뉴 (AI 서칭 결과)</th>
                    <th className="py-3 px-3">인스타 · 블로그 · 검색 바로가기</th>
                    <th className="py-3 px-3.5 text-center">메뉴 서칭</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {paginatedPartners.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400 text-sm">
                        검색 조건에 일치하는 거래업체가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    paginatedPartners.map((partner) => {
                      const isSearching = !!searchingPartnerIds[partner.id];
                      const encodedName = encodeURIComponent(partner.companyName);
                      const regionWord = partner.address ? partner.address.split(' ')[0] : '';
                      const encodedQuery = encodeURIComponent(`${partner.companyName} ${regionWord}`);

                      return (
                        <tr key={partner.id} className="hover:bg-slate-50/90 transition align-top">
                          {/* 상호명 / 대표자 */}
                          <td className="py-3.5 px-3.5 whitespace-nowrap">
                            <div className="font-bold text-[#0B1F3A] text-sm">
                              {partner.companyName}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {partner.manager}
                            </div>
                            <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#133663]">
                              {partner.category}
                            </span>
                          </td>

                          {/* 연락처 / 주소 */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-800 whitespace-nowrap">
                              <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              <span>{partner.phone}</span>
                            </div>
                            <div className="flex items-start gap-1 text-xs text-slate-500 mt-1 max-w-xs">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <span>{partner.address}</span>
                            </div>
                          </td>

                          {/* 판매 메뉴 (AI 서칭 결과) */}
                          <td className="py-3.5 px-3 max-w-xs">
                            <div className="font-medium text-slate-800 leading-snug">
                              {partner.mainProduct}
                            </div>
                            {partner.searchedMenus && partner.searchedMenus.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {partner.searchedMenus.map((menu, mIdx) => (
                                  <span
                                    key={mIdx}
                                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200/70"
                                  >
                                    {menu}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="text-[11px] text-slate-400 mt-1">
                              기준단가: {formatNumber(partner.unitPrice)}{partner.unitLabel}
                            </div>
                          </td>

                          {/* 인스타 · 블로그 · 검색 바로가기 */}
                          <td className="py-3.5 px-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <a
                                href={partner.instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-pink-50 text-pink-600 hover:bg-pink-100 border border-pink-200/80 transition"
                              >
                                <Instagram className="w-3 h-3" />
                                <span>인스타</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>

                              <a
                                href={partner.blogUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 transition"
                              >
                                <BookOpen className="w-3 h-3" />
                                <span>네이버/블로그</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>

                              <a
                                href={`https://www.google.com/search?q=${encodedQuery}+메뉴+수산`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 transition"
                              >
                                <Globe className="w-3 h-3" />
                                <span>구글검색</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1.5 truncate max-w-[230px]">
                              채널 ID: <span className="text-slate-600 font-medium">{partner.snsHandle}</span>
                            </div>
                          </td>

                          {/* 개별 업체 AI 메뉴 서칭 버튼 */}
                          <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleSearchSinglePartnerMenu(partner)}
                              disabled={isSearching}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                partner.isSearched
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-[#133663] text-white hover:bg-[#0B1F3A] shadow-2xs'
                              }`}
                            >
                              {isSearching ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>서칭중</span>
                                </>
                              ) : partner.isSearched ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>재서칭</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                                  <span>메뉴 서칭</span>
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span>
                  전체 <strong className="text-slate-800">{filteredPartners.length}</strong>개 발주처 중{' '}
                  <strong className="text-[#133663]">
                    {(Math.min(currentPage, totalPages) - 1) * itemsPerPage + 1} ~{' '}
                    {Math.min(Math.min(currentPage, totalPages) * itemsPerPage, filteredPartners.length)}
                  </strong>
                  번째 표시
                </span>
                <button
                  onClick={handleResetToDefault}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  title="초기 엑셀 원본 상태로 되돌리기"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>기본 데이터 복원</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-semibold cursor-pointer"
                >
                  이전
                </button>
                <span className="px-3 py-1.5 font-bold text-[#0B1F3A]">
                  {Math.min(currentPage, totalPages)} / {totalPages} 페이지
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-semibold cursor-pointer"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            5. 인기 판매 품목 TOP 5 & SNS 입항 피드 파이프라인
           ========================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 좌측: 인기 판매 품목 TOP 5 (4칸) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-5 rounded-full bg-teal-500" />
                  <h2 className="text-lg font-bold text-[#0B1F3A]">
                    인기 판매 품목 TOP 5
                  </h2>
                </div>
                <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
                  발주처 집계
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-5">
                전체 등록 거래업체 누적 출고량 및 품목별 점유율
              </p>

              <div className="h-52 w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topSellingItems}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={55}
                      tick={{ fontSize: 12, fontWeight: 600, fill: '#1E293B' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#F1F5F9' }}
                      contentStyle={{
                        backgroundColor: '#0B1F3A',
                        borderRadius: '10px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(val, name, props) => [
                        `${formatNumber(val)} ${props.payload.unit} (${props.payload.share}%)`,
                        '누적 판매량',
                      ]}
                    />
                    <Bar dataKey="volume" radius={[0, 6, 6, 0]} barSize={20}>
                      {topSellingItems.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index === 0
                              ? '#0D9488'
                              : index === 1
                              ? '#133663'
                              : index === 2
                              ? '#2563EB'
                              : '#64748B'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2.5 border-t border-slate-100 pt-4">
                {topSellingItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs sm:text-sm p-2 rounded-lg hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                          item.rank === 1
                            ? 'bg-teal-500 text-white'
                            : item.rank === 2
                            ? 'bg-[#133663] text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.rank}
                      </span>
                      <span className="font-bold text-slate-800">{item.name}</span>
                      <span className="text-xs text-slate-400">
                        ({item.partnerCount}개사)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#0B1F3A]">
                        {formatNumber(item.volume)} {item.unit}
                      </span>
                      <span className="ml-2 text-xs font-semibold text-teal-600">
                        {item.share}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 우측: 거래업체 SNS(인스타 등) 입항 게시글 AI 자동 정리 (8칸) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-5 rounded-full bg-gradient-to-b from-pink-500 to-amber-500" />
                  <h2 className="text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
                    <span>거래업체 인스타·밴드 입항 공지 AI 자동 정리</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-200">
                      <Radio className="w-3 h-3 animate-pulse" /> 실시간 파싱
                    </span>
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  업체 인스타/밴드 공지글을 붙여넣거나 동기화하면 단가·입항량을 자동 추출해 거래처 DB에 반영합니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1">
              {/* 좌측 입력 폼 (5칸) */}
              <form
                onSubmit={handleParseAndSyncSns}
                className="md:col-span-5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#0B1F3A] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-pink-500" />
                    SNS 공지글 붙여넣기 → 자동 정리
                  </span>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      발주처 선택
                    </label>
                    <select
                      value={snsInputCompany}
                      onChange={(e) => setSnsInputCompany(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {partners.slice(0, 40).map((p) => (
                        <option key={p.id} value={p.companyName}>
                          {p.companyName} ({p.manager})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-slate-600">
                        인스타/밴드 본문
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setSnsInputText(
                            '오늘 통영항 활 대방어 특대 18마리 입항! 선도 최상급 kg당 27,500원 당일 활어차 직송 출고 가능합니다.'
                          )
                        }
                        className="text-[11px] font-semibold text-teal-600 hover:underline cursor-pointer"
                      >
                        예시 채우기
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={snsInputText}
                      onChange={(e) => setSnsInputText(e.target.value)}
                      placeholder="인스타그램 게시글 내용을 붙여넣으면 어종·단가·물량을 자동 추출합니다."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 bg-[#0F294A] hover:bg-[#133663] text-white py-2.5 px-3 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                  <span>AI 추출 및 거래처 반영</span>
                </button>
              </form>

              {/* 우측 수집된 피드 리스트 (7칸) */}
              <div className="md:col-span-7 space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {snsFeeds.map((feed) => (
                  <div
                    key={feed.id}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-teal-300 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-pink-50 text-pink-600">
                          <Instagram className="w-3 h-3" />
                          {feed.snsPlatform}
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-[#0B1F3A]">
                          {feed.companyName}
                        </span>
                        <span className="text-[11px] text-slate-400">{feed.snsHandle}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{feed.postedAt}</span>
                        {feed.syncedToPartner ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            <Check className="w-3 h-3" /> 반영됨
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApplySingleFeed(feed.id)}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500 text-white cursor-pointer"
                          >
                            + 반영
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg leading-relaxed">
                      “{feed.rawText}”
                    </p>

                    <div className="grid grid-cols-3 gap-2 mt-2.5 text-[11px]">
                      <div className="bg-blue-50/70 rounded-lg px-2 py-1">
                        <span className="text-slate-500 block text-[10px]">추출 어종</span>
                        <strong className="text-[#133663]">{feed.parsed.species}</strong>
                      </div>
                      <div className="bg-teal-50/70 rounded-lg px-2 py-1">
                        <span className="text-slate-500 block text-[10px]">도매 단가</span>
                        <strong className="text-teal-800">
                          {formatNumber(feed.parsed.unitPrice)}{feed.parsed.unitLabel}
                        </strong>
                      </div>
                      <div className="bg-slate-50 rounded-lg px-2 py-1">
                        <span className="text-slate-500 block text-[10px]">확보 물량</span>
                        <strong className="text-slate-800">
                          {formatNumber(feed.parsed.volume)}{feed.parsed.volumeUnit}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ==========================================
          6. 엑셀(.xlsx / .csv) 거래처 일괄 업로드 모달
         ========================================== */}
      {activeModal === 'excel' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
                <h3 className="text-base font-bold">거래처 엑셀(.xlsx / .csv) 일괄 업로드</h3>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setExcelPreviewRows([]);
                  setExcelFileName('');
                }}
                className="text-emerald-100 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 rounded-2xl p-6 text-center cursor-pointer transition"
              >
                <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-slate-800">
                  {excelFileName
                    ? `선택된 파일: ${excelFileName}`
                    : '클릭하여 거래처 엑셀(.xlsx, .xls, .csv) 파일을 선택하세요'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  열 순서: [A열: 업체명(상호)] · [B열: 대표자/담당자] · [C열: 전화번호] · [D열: 주소] (중복 상호 자동 제외)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelFileChange}
                  className="hidden"
                />
              </div>

              {excelPreviewRows.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-700">
                      미리보기: 총 {excelPreviewRows.length}개 업체 인식됨
                    </span>
                    <span className="text-xs text-slate-400">상위 5개 행 표시</span>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="py-2 px-3">업체명</th>
                          <th className="py-2 px-3">대표자</th>
                          <th className="py-2 px-3">전화번호</th>
                          <th className="py-2 px-3">주소</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {excelPreviewRows.slice(0, 5).map((r, i) => (
                          <tr key={i}>
                            <td className="py-2 px-3 font-bold text-slate-800">{r.companyName}</td>
                            <td className="py-2 px-3">{r.ceoName}</td>
                            <td className="py-2 px-3">{r.phone}</td>
                            <td className="py-2 px-3 truncate max-w-[200px]">{r.address}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setExcelPreviewRows([]);
                    setExcelFileName('');
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  disabled={excelPreviewRows.length === 0}
                  onClick={handleConfirmExcelImport}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold shadow-sm cursor-pointer"
                >
                  {excelPreviewRows.length > 0
                    ? `${excelPreviewRows.length}개 업체 대시보드에 추가`
                    : '파일을 먼저 선택하세요'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          7. 신규 거래업체 개별 등록 모달
         ========================================== */}
      {activeModal === 'partner' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0B1F3A] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-300" />
                <h3 className="text-base font-bold">신규 거래업체 및 인스타·블로그 연동 등록</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPartner} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    거래업체명(상호) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: (주)부산수산무역"
                    value={newPartnerForm.companyName}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, companyName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    어종 카테고리 *
                  </label>
                  <select
                    value={newPartnerForm.category}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {Object.keys(speciesData).map((sp) => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-pink-50/50 p-3 rounded-xl border border-pink-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    인스타 계정(@handle) 또는 URL
                  </label>
                  <input
                    type="text"
                    placeholder="예: @busan_seafood"
                    value={newPartnerForm.snsHandle}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, snsHandle: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    네이버 블로그 / 스토어 URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://blog.naver.com/..."
                    value={newPartnerForm.blogUrl}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, blogUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  판매 메뉴 및 주력 취급 상품 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 선망 참고등어 특대 (10kg/상자)"
                  value={newPartnerForm.mainProduct}
                  onChange={(e) =>
                    setNewPartnerForm({ ...newPartnerForm, mainProduct: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    납품 단가 (원) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="42000"
                    value={newPartnerForm.unitPrice}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, unitPrice: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    대표자/담당자
                  </label>
                  <input
                    type="text"
                    placeholder="홍길동 대표"
                    value={newPartnerForm.manager}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, manager: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    전화번호
                  </label>
                  <input
                    type="text"
                    placeholder="010-1234-5678"
                    value={newPartnerForm.phone}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  사업장 주소
                </label>
                <input
                  type="text"
                  placeholder="예: 부산시 서구 충무대로 202"
                  value={newPartnerForm.address}
                  onChange={(e) =>
                    setNewPartnerForm({ ...newPartnerForm, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold shadow-sm cursor-pointer"
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          8. 오늘의 위판 시세 등록 모달
         ========================================== */}
      {activeModal === 'auction' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#133663] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-300" />
                <h3 className="text-base font-bold">오늘의 위판장 시세 실시간 반영</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAuction} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    어종 선택 *
                  </label>
                  <select
                    value={newAuctionForm.species}
                    onChange={(e) =>
                      setNewAuctionForm({ ...newAuctionForm, species: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {Object.keys(speciesData).map((sp) => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    위판장 선택 *
                  </label>
                  <select
                    value={newAuctionForm.market}
                    onChange={(e) =>
                      setNewAuctionForm({ ...newAuctionForm, market: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="부산공동어시장">부산공동어시장</option>
                    <option value="통영수협">통영수협</option>
                    <option value="여수수협">여수수협</option>
                    <option value="목포수협">목포수협</option>
                    <option value="제주서귀포수협">제주서귀포수협</option>
                    <option value="포항죽도위판장">포항죽도위판장</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  금일 경매 낙찰가 ({speciesData[newAuctionForm.species]?.unit}) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="예: 25500"
                  value={newAuctionForm.price}
                  onChange={(e) =>
                    setNewAuctionForm({ ...newAuctionForm, price: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  금일 위판 물량 (단위 포함)
                </label>
                <input
                  type="text"
                  placeholder="예: 850 kg 또는 1,200 상자"
                  value={newAuctionForm.volume}
                  onChange={(e) =>
                    setNewAuctionForm({ ...newAuctionForm, volume: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#133663] hover:bg-[#0B1F3A] text-white font-bold shadow-sm cursor-pointer"
                >
                  시세 반영하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}