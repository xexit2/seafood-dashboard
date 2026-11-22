import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Anchor,
  Cloud,
  Database,
  FileSpreadsheet,
  Download,
  Plus,
  KeyRound,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Package,
  TrendingUp,
  Building2,
  Fish,
} from './components/Icons';
import WeatherSection from './components/WeatherSection';
import AuctionSection from './components/AuctionSection';
import PurchaseInsightSection from './components/PurchaseInsightSection';
import TopIngredientsSection from './components/TopIngredientsSection';
import PartnerTableSection from './components/PartnerTableSection';
import Modals from './components/Modals';
import {
  APP_ID,
  DEFAULT_MASTER_PIN,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
  DEFAULT_DRIVE_WEBHOOK_URL,
  DEFAULT_SOUTH_MARKETS,
  INITIAL_WEATHER_DATA,
  INITIAL_SPECIES_DATA,
  INITIAL_PARTNERS,
  isLegacySpeciesMap,
} from './constants/initialData';
import {
  parseXlsxNatively,
  buildRegionCompanyQuery,
  inferPartnerMetadata,
} from './utils/excelParser';
import {
  searchPartnerWebAndMenus,
  searchTopIngredientsBatch,
  fetchSpeciesAuctionTrend,
  fetchAllSpeciesAuctionBatch,
  getDailyAiUsageStats,
  DAILY_AI_CALL_LIMIT,
  buildPartnersAnalysisSnapshotText,
  uploadSnapshotToGoogleDrive,
} from './utils/apiService';

const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num);

function getKstScheduleInfo() {
  const now = new Date();
  const kstMs = now.getTime() + 9 * 60 * 60 * 1000;
  const kst = new Date(kstMs);
  const yyyy = kst.getUTCFullYear();
  const mm = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(kst.getUTCDate()).padStart(2, '0');
  const hh = kst.getUTCHours();
  const min = String(kst.getUTCMinutes()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  return {
    todayStr,
    isAfterNoon: hh >= 12,
    formattedNow: `${yyyy}-${mm}-${dd} ${String(hh).padStart(2, '0')}:${min}`,
  };
}

export default function App() {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState('클라우드 연결 중...');
  const [supabaseConfig, setSupabaseConfig] = useState({
    url: DEFAULT_SUPABASE_URL,
    anonKey: DEFAULT_SUPABASE_ANON_KEY,
    geminiKey: '',
    publicDataKey: '',
    driveWebhookUrl: DEFAULT_DRIVE_WEBHOOK_URL,
  });
  const [supabaseForm, setSupabaseForm] = useState({
    url: DEFAULT_SUPABASE_URL,
    anonKey: DEFAULT_SUPABASE_ANON_KEY,
    geminiKey: '',
    publicDataKey: '',
    driveWebhookUrl: DEFAULT_DRIVE_WEBHOOK_URL,
  });
  const [diagResults, setDiagResults] = useState(null);
  const [isRunningDiag, setIsRunningDiag] = useState(false);

  const [savedPin, setSavedPin] = useState(DEFAULT_MASTER_PIN);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [currentPinForChange, setCurrentPinForChange] = useState('');
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
  const [auctionUpdatedAt, setAuctionUpdatedAt] = useState('');
  const [lastNoonSyncDate, setLastNoonSyncDate] = useState('');
  const [isRefreshingAuction, setIsRefreshingAuction] = useState(false);

  const [partners, setPartners] = useState(INITIAL_PARTNERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [regionFilter, setRegionFilter] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [searchingPartnerIds, setSearchingPartnerIds] = useState({});
  const [isBatchSearching, setIsBatchSearching] = useState(false);
  const [selectedPartnerDetail, setSelectedPartnerDetail] = useState(null);

  const [topIngredientsState, setTopIngredientsState] = useState({
    items: [],
    updatedAt: '',
    analyzedCount: 0,
    omittedCount: 0,
    lastError: '',
  });
  const [isSearchingTopIngredients, setIsSearchingTopIngredients] = useState(false);
  const [searchProgress, setSearchProgress] = useState({ done: 0, total: 0 });
  const abortSearchRef = useRef(false);

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

  const safeSpeciesData = useMemo(() => {
    if (
      speciesData &&
      typeof speciesData === 'object' &&
      !Array.isArray(speciesData) &&
      Object.keys(speciesData).length > 0
    ) {
      return speciesData;
    }
    return INITIAL_SPECIES_DATA;
  }, [speciesData]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const saveAndSyncAnalysisSnapshot = async (
    updatedPartnersList,
    modeLabel,
    newlyUpdatedCount,
    autoUploadDrive = true
  ) => {
    const schedule = getKstScheduleInfo();
    const textContent = buildPartnersAnalysisSnapshotText(updatedPartnersList, {
      savedAt: schedule.formattedNow,
      modeLabel,
      newlyUpdatedCount,
    });
    const safeStamp = schedule.formattedNow.replace(/[:\s]/g, '_').replace(/-/g, '');
    const fileName = `수산물_업체분석_누적_${safeStamp}.txt`;

    try {
      localStorage.setItem(`${APP_ID}_last_snapshot_txt`, textContent);
    } catch {
      // 저장소 용량 제한 무시
    }

    const targetWebhook = (
      supabaseConfig.driveWebhookUrl || DEFAULT_DRIVE_WEBHOOK_URL
    ).trim();

    if (autoUploadDrive && targetWebhook) {
      const driveRes = await uploadSnapshotToGoogleDrive(
        targetWebhook,
        fileName,
        textContent
      );
      if (driveRes.ok) {
        showToast(`구글 드라이브 자동 저장 완료! (${fileName})`);
      } else {
        showToast(`대시보드 저장 완료 (드라이브 전송 오류: ${driveRes.error})`);
      }
    }
    return { fileName, textContent };
  };

  // 사용자가 직접 눌러서 내 컴퓨터에 텍스트(.txt) 파일로 저장하는 함수
  const handleManualDownloadSnapshot = () => {
    const schedule = getKstScheduleInfo();
    const textContent = buildPartnersAnalysisSnapshotText(partners, {
      savedAt: schedule.formattedNow,
      modeLabel: '수동 다운로드 (전체 누적)',
      newlyUpdatedCount: 0,
    });
    const safeStamp = schedule.formattedNow.replace(/[:\s]/g, '_').replace(/-/g, '');
    const fileName = `수산물_업체분석_누적_${safeStamp}.txt`;

    const blob = new Blob(['\uFEFF' + textContent], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`내 컴퓨터에 텍스트 파일로 저장되었습니다: ${fileName}`);
  };

  useEffect(() => {
    let loadedSbUrl = DEFAULT_SUPABASE_URL;
    let loadedSbKey = DEFAULT_SUPABASE_ANON_KEY;
    try {
      const localPin = localStorage.getItem(`${APP_ID}_pin`);
      const localPartners = localStorage.getItem(`${APP_ID}_partners`);
      const localSpecies = localStorage.getItem(`${APP_ID}_species`);
      const localTopIng = localStorage.getItem(`${APP_ID}_top_ingredients`);
      const localAuctionMeta = localStorage.getItem(`${APP_ID}_auction_meta`);
      const localSb = localStorage.getItem(`${APP_ID}_supabase`);

      if (localSb) {
        const parsedSb = JSON.parse(localSb);
        const normalizedSb = {
          url: (parsedSb.url || DEFAULT_SUPABASE_URL)
            .trim()
            .replace(/\/rest\/v1\/?$/i, '')
            .replace(/\/$/, ''),
          anonKey: (parsedSb.anonKey || DEFAULT_SUPABASE_ANON_KEY).trim(),
          geminiKey: (parsedSb.geminiKey || '').trim(),
          publicDataKey: (parsedSb.publicDataKey || '').trim(),
          driveWebhookUrl: (parsedSb.driveWebhookUrl || DEFAULT_DRIVE_WEBHOOK_URL).trim(),
        };
        loadedSbUrl = normalizedSb.url;
        loadedSbKey = normalizedSb.anonKey;
        setSupabaseConfig(normalizedSb);
        setSupabaseForm(normalizedSb);
      }

      if (localPin && /^\d{4}$/.test(localPin)) {
        setSavedPin(localPin);
      }
      if (localPartners) {
        const parsedPartners = JSON.parse(localPartners);
        if (Array.isArray(parsedPartners)) {
          setPartners(parsedPartners);
        }
      }
      if (localSpecies) {
        const parsedSp = JSON.parse(localSpecies);
        if (parsedSp && typeof parsedSp === 'object' && !isLegacySpeciesMap(parsedSp)) {
          setSpeciesData(parsedSp);
          if (!parsedSp[selectedSpecies]) {
            setSelectedSpecies(Object.keys(parsedSp)[0] || '삼치');
          }
        }
      }
      if (localTopIng) {
        const parsedTop = JSON.parse(localTopIng);
        if (parsedTop && typeof parsedTop === 'object') setTopIngredientsState(parsedTop);
      }
      if (localAuctionMeta) {
        const meta = JSON.parse(localAuctionMeta);
        if (meta?.auctionUpdatedAt) setAuctionUpdatedAt(meta.auctionUpdatedAt);
        if (meta?.lastNoonSyncDate) setLastNoonSyncDate(meta.lastNoonSyncDate);
      }
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
      const headers = {
        apikey: cleanKey,
        Accept: 'application/json',
        'Accept-Profile': 'public',
      };
      if (cleanKey.startsWith('eyJ')) {
        headers.Authorization = `Bearer ${cleanKey}`;
      }

      const res = await fetch(`${cleanUrl}/rest/v1/seafood_state?id=eq.main&select=*`, {
        headers,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0 && rows[0].payload) {
        const remote = rows[0].payload;
        if (remote.pin && /^\d{4}$/.test(remote.pin)) {
          setSavedPin(remote.pin);
          localStorage.setItem(`${APP_ID}_pin`, remote.pin);
        }
        if (Array.isArray(remote.partners)) {
          setPartners(remote.partners);
          localStorage.setItem(`${APP_ID}_partners`, JSON.stringify(remote.partners));
        }
        if (
          remote.speciesData &&
          typeof remote.speciesData === 'object' &&
          !isLegacySpeciesMap(remote.speciesData)
        ) {
          setSpeciesData(remote.speciesData);
          localStorage.setItem(`${APP_ID}_species`, JSON.stringify(remote.speciesData));
          if (!remote.speciesData[selectedSpecies]) {
            setSelectedSpecies(Object.keys(remote.speciesData)[0] || '삼치');
          }
        }
        if (remote.auctionUpdatedAt) {
          setAuctionUpdatedAt(remote.auctionUpdatedAt);
        }
        if (remote.lastNoonSyncDate) {
          setLastNoonSyncDate(remote.lastNoonSyncDate);
        }
        if (remote.auctionUpdatedAt || remote.lastNoonSyncDate) {
          localStorage.setItem(
            `${APP_ID}_auction_meta`,
            JSON.stringify({
              auctionUpdatedAt: remote.auctionUpdatedAt || '',
              lastNoonSyncDate: remote.lastNoonSyncDate || '',
            })
          );
        }
        if (remote.topIngredients && Array.isArray(remote.topIngredients.items)) {
          setTopIngredientsState(remote.topIngredients);
          localStorage.setItem(
            `${APP_ID}_top_ingredients`,
            JSON.stringify(remote.topIngredients)
          );
        }
        if (remote.geminiKey || remote.publicDataKey || remote.driveWebhookUrl) {
          setSupabaseConfig((prev) => {
            const next = {
              ...prev,
              geminiKey: remote.geminiKey || prev.geminiKey,
              publicDataKey: remote.publicDataKey || prev.publicDataKey,
              driveWebhookUrl:
                remote.driveWebhookUrl || prev.driveWebhookUrl || DEFAULT_DRIVE_WEBHOOK_URL,
            };
            localStorage.setItem(`${APP_ID}_supabase`, JSON.stringify(next));
            return next;
          });
          setSupabaseForm((prev) => ({
            ...prev,
            geminiKey: remote.geminiKey || prev.geminiKey,
            publicDataKey: remote.publicDataKey || prev.publicDataKey,
            driveWebhookUrl:
              remote.driveWebhookUrl || prev.driveWebhookUrl || DEFAULT_DRIVE_WEBHOOK_URL,
          }));
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
    const nextSpecies =
      overrides.speciesData !== undefined ? overrides.speciesData : safeSpeciesData;
    const nextTopIng =
      overrides.topIngredients !== undefined ? overrides.topIngredients : topIngredientsState;
    const nextAuctionUpdatedAt =
      overrides.auctionUpdatedAt !== undefined ? overrides.auctionUpdatedAt : auctionUpdatedAt;
    const nextLastNoonSyncDate =
      overrides.lastNoonSyncDate !== undefined ? overrides.lastNoonSyncDate : lastNoonSyncDate;
    const activeSb = overrides.supabaseConfig || supabaseConfig;

    try {
      if (nextPin) localStorage.setItem(`${APP_ID}_pin`, nextPin);
      localStorage.setItem(`${APP_ID}_partners`, JSON.stringify(nextPartners));
      localStorage.setItem(`${APP_ID}_species`, JSON.stringify(nextSpecies));
      localStorage.setItem(`${APP_ID}_top_ingredients`, JSON.stringify(nextTopIng));
      localStorage.setItem(
        `${APP_ID}_auction_meta`,
        JSON.stringify({
          auctionUpdatedAt: nextAuctionUpdatedAt,
          lastNoonSyncDate: nextLastNoonSyncDate,
        })
      );
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
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Content-Profile': 'public',
          Prefer: 'resolution=merge-duplicates,return=minimal',
        };
        if (cleanKey.startsWith('eyJ')) {
          headers.Authorization = `Bearer ${cleanKey}`;
        }

        const res = await fetch(`${cleanUrl}/rest/v1/seafood_state?on_conflict=id`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            id: 'main',
            payload: {
              pin: nextPin,
              partners: nextPartners,
              speciesData: nextSpecies,
              topIngredients: nextTopIng,
              auctionUpdatedAt: nextAuctionUpdatedAt,
              lastNoonSyncDate: nextLastNoonSyncDate,
              publicDataKey: activeSb.publicDataKey || '',
              geminiKey: activeSb.geminiKey || '',
              driveWebhookUrl: activeSb.driveWebhookUrl || DEFAULT_DRIVE_WEBHOOK_URL,
            },
            updated_at: new Date().toISOString(),
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setSyncStatus('PC·모바일 실시간 동기화됨');
      } catch (err) {
        setSyncStatus('클라우드 저장 지연 (브라우저 저장됨)');
      }
    }
  };

  // 전 어종 시세를 일괄 갱신 (공공데이터 공식 API 기준 · 미설정 시 AI 할당량 보호)
  const refreshAllSpeciesAuction = async (isAutoNoon = false) => {
    if (isRefreshingAuction) return;
    setIsRefreshingAuction(true);

    const schedule = getKstScheduleInfo();
    const { updatedMap, liveUpdatedCount, source, isRateLimit, error } =
      await fetchAllSpeciesAuctionBatch(
        safeSpeciesData,
        supabaseConfig.geminiKey,
        DEFAULT_SOUTH_MARKETS,
        supabaseConfig.publicDataKey
      );

    const updatedLabel = `${schedule.formattedNow}${isAutoNoon ? ' (12:00 자동)' : ' (수동)'}`;
    const nextNoonDate = schedule.isAfterNoon ? schedule.todayStr : lastNoonSyncDate;

    setSpeciesData(updatedMap);
    setAuctionUpdatedAt(updatedLabel);
    if (nextNoonDate) setLastNoonSyncDate(nextNoonDate);
    setIsRefreshingAuction(false);

    await persistDashboardState({
      speciesData: updatedMap,
      auctionUpdatedAt: updatedLabel,
      lastNoonSyncDate: nextNoonDate,
    });

    if (isRateLimit) {
      showToast(
        '⚠️ AI 사용 한도에 도달하여 즉시 중지했습니다. [동기화 · API키 설정]을 확인해 주세요.'
      );
    } else if (isAutoNoon) {
      showToast('낮 12:00 정기 스케줄에 따라 부산·남해 위판장 시세가 자동 갱신되었습니다.');
    } else if (liveUpdatedCount > 0) {
      const sourceLabel =
        source === 'public' ? '해양수산부·수협 공식 위판장 전산' : 'AI 웹 검색';
      showToast(`${sourceLabel} 기준 ${liveUpdatedCount}개 어종 실제 시세·물량이 최신화되었습니다!`);
    } else {
      showToast(
        `조회된 공식 위판 데이터가 없어 시세가 0원으로 표시됩니다. (${error || '수신 데이터 없음'})`
      );
    }
  };

  useEffect(() => {
    if (!isDataLoaded || !isUnlocked) return;

    const checkAndRunNoonSync = () => {
      const schedule = getKstScheduleInfo();
      if (schedule.isAfterNoon && lastNoonSyncDate !== schedule.todayStr) {
        refreshAllSpeciesAuction(true);
      }
    };

    checkAndRunNoonSync();
    const timer = setInterval(checkAndRunNoonSync, 60 * 1000);
    return () => clearInterval(timer);
  }, [isDataLoaded, isUnlocked, lastNoonSyncDate]);

  const handleUpdateSpeciesMarkets = async (spName, updatedMarkets) => {
    const target = safeSpeciesData[spName];
    if (!target) return;

    const validPrices = updatedMarkets
      .map((m) => Number(m.price))
      .filter((p) => Number.isFinite(p) && p > 0);
    const newAvg =
      validPrices.length > 0
        ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length)
        : target.currentAvg;

    const prevAvg = target.currentAvg || newAvg;
    const diffRate =
      prevAvg > 0 ? Number((((newAvg - prevAvg) / prevAvg) * 100).toFixed(1)) : 0;

    const updatedHistory7d = [...(target.history7d || [])];
    if (updatedHistory7d.length > 0) {
      updatedHistory7d[updatedHistory7d.length - 1] = {
        ...updatedHistory7d[updatedHistory7d.length - 1],
        price: newAvg,
      };
    }

    const nextSpeciesData = {
      ...safeSpeciesData,
      [spName]: {
        ...target,
        currentAvg: newAvg,
        prevDiffRate: diffRate,
        history7d: updatedHistory7d,
        markets: updatedMarkets,
      },
    };

    setSpeciesData(nextSpeciesData);
    await persistDashboardState({ speciesData: nextSpeciesData });
    showToast(`[${spName}] 위판장 목록(${updatedMarkets.length}곳) 및 시세가 저장되었습니다.`);
  };

  const handleRunConnectionDiagnostics = async () => {
    setIsRunningDiag(true);
    const cleanUrl = (supabaseForm.url || '')
      .trim()
      .replace(/\/rest\/v1\/?$/i, '')
      .replace(/\/$/, '');
    const cleanSbKey = (supabaseForm.anonKey || '').trim();
    const cleanGeminiKey = (supabaseForm.geminiKey || '').trim();
    const cleanPublicKey = (supabaseForm.publicDataKey || '').trim();
    const cleanDriveUrl = (
      supabaseForm.driveWebhookUrl || DEFAULT_DRIVE_WEBHOOK_URL
    ).trim();

    const results = {
      sbRead: { ok: false, detail: '미실행' },
      sbWrite: { ok: false, detail: '미실행' },
      gemini: { ok: false, detail: '미실행' },
      publicData: { ok: false, detail: '미실행' },
    };

    const sbHeaders = {
      apikey: cleanSbKey,
      Accept: 'application/json',
      'Accept-Profile': 'public',
    };
    if (cleanSbKey.startsWith('eyJ')) {
      sbHeaders.Authorization = `Bearer ${cleanSbKey}`;
    }

    try {
      const res = await fetch(
        `${cleanUrl}/rest/v1/seafood_state?id=eq.main&select=id,updated_at`,
        { headers: sbHeaders }
      );
      const text = await res.text().catch(() => '');
      results.sbRead = res.ok
        ? { ok: true, detail: `HTTP ${res.status} 정상 (조회 성공)` }
        : { ok: false, detail: `HTTP ${res.status}: ${text.slice(0, 120)}` };
    } catch (e) {
      results.sbRead = { ok: false, detail: e.message };
    }

    try {
      const res = await fetch(`${cleanUrl}/rest/v1/seafood_state?on_conflict=id`, {
        method: 'POST',
        headers: {
          ...sbHeaders,
          'Content-Type': 'application/json',
          'Content-Profile': 'public',
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({
          id: 'main',
          payload: {
            pin: savedPin,
            partners,
            speciesData: safeSpeciesData,
            topIngredients: topIngredientsState,
            auctionUpdatedAt,
            lastNoonSyncDate,
            geminiKey: cleanGeminiKey,
            publicDataKey: cleanPublicKey,
            driveWebhookUrl: cleanDriveUrl,
          },
          updated_at: new Date().toISOString(),
        }),
      });
      const text = await res.text().catch(() => '');
      results.sbWrite = res.ok
        ? { ok: true, detail: `HTTP ${res.status} 정상 (저장 성공)` }
        : { ok: false, detail: `HTTP ${res.status}: ${text.slice(0, 120)}` };
    } catch (e) {
      results.sbWrite = { ok: false, detail: e.message };
    }

    if (!cleanGeminiKey) {
      results.gemini = { ok: false, detail: 'Gemini API 키가 비어 있습니다.' };
    } else {
      try {
        const res = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1',
          { headers: { 'x-goog-api-key': cleanGeminiKey } }
        );
        const text = await res.text().catch(() => '');
        results.gemini = res.ok
          ? { ok: true, detail: `HTTP ${res.status} 정상 (API 키 인증 성공)` }
          : { ok: false, detail: `HTTP ${res.status}: ${text.slice(0, 120)}` };
      } catch (e) {
        results.gemini = { ok: false, detail: e.message };
      }
    }

    if (!cleanPublicKey) {
      results.publicData = { ok: false, detail: '공공데이터 인증키가 비어 있습니다 (선택 입력).' };
    } else {
      try {
        const encoded = cleanPublicKey.includes('%')
          ? cleanPublicKey
          : encodeURIComponent(cleanPublicKey);
        const res = await fetch(
          `https://apis.data.go.kr/1192000/select0040List/getselect0040List?serviceKey=${encoded}&numOfRows=1&pageNo=1&type=json`
        );
        const text = await res.text().catch(() => '');
        const isServiceError =
          text.includes('SERVICE_KEY_IS_NOT_REGISTERED_ERROR') || text.includes('SERVICE ERROR');
        results.publicData =
          res.ok && !isServiceError
            ? { ok: true, detail: `HTTP ${res.status} 정상 (공공데이터 위판 시세 인증 성공)` }
            : { ok: false, detail: `인증 확인 필요: ${text.slice(0, 120)}` };
      } catch (e) {
        results.publicData = { ok: false, detail: e.message };
      }
    }

    setDiagResults(results);
    setIsRunningDiag(false);
  };

  const handleSaveSupabaseConfig = async (e) => {
    e.preventDefault();
    const trimmed = {
      url: supabaseForm.url.trim(),
      anonKey: supabaseForm.anonKey.trim(),
      geminiKey: (supabaseForm.geminiKey || '').trim(),
      publicDataKey: (supabaseForm.publicDataKey || '').trim(),
      driveWebhookUrl: (
        supabaseForm.driveWebhookUrl || DEFAULT_DRIVE_WEBHOOK_URL
      ).trim(),
    };
    setSupabaseConfig(trimmed);
    localStorage.setItem(`${APP_ID}_supabase`, JSON.stringify(trimmed));
    setActiveModal(null);
    await persistDashboardState({ supabaseConfig: trimmed });
    showToast('클라우드 DB, API 및 구글 드라이브 연동 설정이 저장되었습니다!');
  };

  const handleResetSpeciesToDefault = async () => {
    setSpeciesData(INITIAL_SPECIES_DATA);
    setSelectedSpecies('삼치');
    await persistDashboardState({ speciesData: INITIAL_SPECIES_DATA });
    showToast('부산·남해 위판장 기준 기본 4종(삼치·금태·고등어·전갱이)으로 초기화되었습니다.');
  };

  const handleLockScreen = () => {
    setIsUnlocked(false);
    setPinInput('');
    setPinConfirmInput('');
    setCurrentPinForChange('');
    setPinError('');
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
      setPinError('4자리 숫자를 정확히 입력해주세요.');
      return;
    }

    if (isChangingPin && isUnlocked) {
      if (currentPinForChange !== savedPin) {
        setPinError('현재 비밀번호(PIN)가 일치하지 않습니다.');
        return;
      }
      if (pinInput !== pinConfirmInput) {
        setPinError('새 PIN 확인 번호가 일치하지 않습니다.');
        return;
      }
      setSavedPin(pinInput);
      setIsChangingPin(false);
      setPinInput('');
      setPinConfirmInput('');
      setCurrentPinForChange('');
      setPinError('');
      await persistDashboardState({ pin: pinInput });
      showToast('마스터 PIN 번호가 변경되어 전 기기에 동기화되었습니다.');
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
    setSelectedPartnerDetail(null);
    setCurrentPage(1);
    await persistDashboardState({ partners: [] });
    showToast('등록된 거래업체 목록이 모두 비워졌습니다.');
  };

  const handleSearchAndAddSpecies = async (e) => {
    e.preventDefault();
    const keyword = speciesSearchInput.trim();
    if (!keyword) return;

    if (safeSpeciesData[keyword]) {
      setSelectedSpecies(keyword);
      setSpeciesSearchInput('');
      showToast(`이미 등록된 '${keyword}' 위판 시세 추이로 전환했습니다.`);
      return;
    }

    setIsSearchingSpecies(true);
    const res = await fetchSpeciesAuctionTrend(
      keyword,
      supabaseConfig.geminiKey,
      DEFAULT_SOUTH_MARKETS,
      null,
      supabaseConfig.publicDataKey
    );
    setIsSearchingSpecies(false);

    if (res && res.data) {
      const nextSpeciesData = { ...safeSpeciesData, [res.data.name]: res.data };
      setSpeciesData(nextSpeciesData);
      setSelectedSpecies(res.data.name);
      setSpeciesSearchInput('');
      persistDashboardState({ speciesData: nextSpeciesData });
      if (res.isRateLimit) {
        showToast(
          `⚠️ AI 사용 한도에 도달하여 '${res.data.name}' 탭만 기본 시세로 추가되었습니다.`
        );
      } else {
        showToast(
          res.isFallback
            ? `'${res.data.name}' 탭이 부산·남해 위판장 기준으로 추가되었습니다!`
            : `'${res.data.name}' 부산·남해 위판장 시세 및 가격 추이가 추가되었습니다!`
        );
      }
    }
  };

  const unsearchedTopPartnersCount = useMemo(
    () => partners.filter((p) => !p.topIngredientSearched).length,
    [partners]
  );

  const handleStartTopIngredientsSearch = async (mode = 'new') => {
    setActiveModal(null);
    if (partners.length === 0) {
      showToast('먼저 엑셀 파일을 업로드해 거래업체를 등록해 주세요.');
      return;
    }

    const isFullRescan = mode === 'all';
    const targetsToSearch = isFullRescan
      ? partners
      : partners.filter((p) => !p.topIngredientSearched);

    abortSearchRef.current = false;
    setIsSearchingTopIngredients(true);

    // 정밀 매칭을 위해 5개사씩 묶고, 1회 클릭당 최대 6배치(30개사)까지 안전 실행
    const batchSize = 5;
    const MAX_BATCHES_PER_RUN = 6;
    const cappedTargets = targetsToSearch.slice(0, batchSize * MAX_BATCHES_PER_RUN);
    const total = cappedTargets.length;
    setSearchProgress({ done: 0, total });

    const newlyFoundMap = {};
    let lastError = '';
    let hitRateLimit = false;

    for (let i = 0; i < total; i += batchSize) {
      if (abortSearchRef.current) break;

      const batch = cappedTargets.slice(i, i + batchSize);
      const batchRes = await searchTopIngredientsBatch(batch, supabaseConfig.geminiKey);
      if (batchRes.error && !lastError) {
        lastError = batchRes.error;
      }

      if (batchRes.isRateLimit) {
        hitRateLimit = true;
        break;
      }

      const returnedList = batchRes.items || [];
      batch.forEach((p, bIdx) => {
        const matched =
          returnedList.find((r) => r.companyName === p.companyName) || returnedList[bIdx];
        const ings = Array.isArray(matched?.ingredients)
          ? Array.from(new Set(matched.ingredients))
          : [];
        const menus = Array.isArray(matched?.menus)
          ? Array.from(new Set(matched.menus))
          : [];
        const topMenu = String(matched?.topMenu || '').trim() || menus[0] || '';
        newlyFoundMap[p.id] = { ingredients: ings, topMenu, menus };
      });

      const doneCount = Math.min(i + batch.length, total);
      setSearchProgress({ done: doneCount, total });

      if (i + batchSize < total && !abortSearchRef.current) {
        await new Promise((r) => setTimeout(r, 3500));
      }
    }

    const schedule = getKstScheduleInfo();
    const newlyCount = Object.keys(newlyFoundMap).length;

    const nextPartners = partners.map((p) => {
      if (Object.prototype.hasOwnProperty.call(newlyFoundMap, p.id)) {
        const found = newlyFoundMap[p.id];

        // 전체 재서칭(isFullRescan)일 때는 최신 검색 결과로 그대로 갱신
        if (isFullRescan) {
          return {
            ...p,
            topIngredientSearched: true,
            extractedIngredients: found.ingredients,
            topReviewMenu: found.topMenu || '',
            searchedMenus: found.menus,
            mainProduct: found.menus.length > 0 ? found.menus.join(' · ') : '',
            lastAnalyzedAt: schedule.formattedNow,
          };
        }

        // 신규 업체 추가 갱신 모드일 때만 기존 유효 데이터 보존
        const prevIngs = Array.isArray(p.extractedIngredients) ? p.extractedIngredients : [];
        const prevMenus = Array.isArray(p.searchedMenus) ? p.searchedMenus : [];
        const mergedIngs = found.ingredients.length > 0 ? found.ingredients : prevIngs;
        const mergedMenus = found.menus.length > 0 ? found.menus : prevMenus;
        const mergedTopMenu = found.topMenu || p.topReviewMenu || mergedMenus[0] || '';

        return {
          ...p,
          topIngredientSearched: true,
          extractedIngredients: mergedIngs,
          topReviewMenu: mergedTopMenu,
          searchedMenus: mergedMenus,
          mainProduct: mergedMenus.length > 0 ? mergedMenus.join(' · ') : p.mainProduct || '',
          lastAnalyzedAt: schedule.formattedNow,
        };
      }
      if (isFullRescan) {
        return {
          ...p,
          topIngredientSearched: false,
        };
      }
      return p;
    });

    const ingredientPartnersMap = {};
    let analyzedCount = 0;
    let omittedCount = 0;

    nextPartners.forEach((p) => {
      const ings = Array.isArray(p.extractedIngredients) ? p.extractedIngredients : [];
      if (ings.length === 0) {
        omittedCount += 1;
      } else {
        analyzedCount += 1;
        ings.forEach((ing) => {
          if (!ingredientPartnersMap[ing]) {
            ingredientPartnersMap[ing] = [];
          }
          if (!ingredientPartnersMap[ing].some((item) => item.id === p.id)) {
            ingredientPartnersMap[ing].push({
              id: p.id,
              companyName: p.companyName,
              address: p.address || '',
            });
          }
        });
      }
    });

    const sorted = Object.entries(ingredientPartnersMap)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5);
    const totalMentions = sorted.reduce((acc, [, pList]) => acc + pList.length, 0) || 1;

    const top5Items = sorted.map(([name, pList], idx) => ({
      rank: idx + 1,
      name,
      count: pList.length,
      share: ((pList.length / totalMentions) * 100).toFixed(1),
      partners: pList,
    }));

    const nextTopState = {
      items: top5Items,
      updatedAt: schedule.formattedNow,
      analyzedCount,
      omittedCount,
      lastError: hitRateLimit ? lastError : top5Items.length === 0 ? lastError : '',
    };

    setPartners(nextPartners);
    setTopIngredientsState(nextTopState);
    setIsSearchingTopIngredients(false);
    await persistDashboardState({
      partners: nextPartners,
      topIngredients: nextTopState,
    });

    const usageAfter = getDailyAiUsageStats();
    const hasMoreUnsearched = targetsToSearch.length > cappedTargets.length;

    if (newlyCount > 0) {
      await saveAndSyncAnalysisSnapshot(
        nextPartners,
        isFullRescan ? '전체 재서칭 (1·2번 통합)' : '신규 업체 추가 갱신 (기존 보존)',
        newlyCount,
        true
      );
    }

    if (hitRateLimit) {
      showToast(
        lastError ||
          `⚠️ 일일 AI 호출 상한(${DAILY_AI_CALL_LIMIT}회) 또는 한도에 도달하여 즉시 중지했습니다.`
      );
    } else if (abortSearchRef.current) {
      showToast(`서치가 중지되었습니다. (누적 확인 ${analyzedCount}개사 결과 반영)`);
    } else if (total === 0 && !isFullRescan) {
      showToast(
        `신규 미서치 업체가 없어 기존 저장 데이터(${analyzedCount}개사) 기준으로 TOP 5를 재정리했습니다.`
      );
    } else if (top5Items.length === 0) {
      showToast(
        lastError || '확인된 메인 원재료가 없습니다. 상단 [동기화 · AI키 설정]을 확인해 주세요.'
      );
    } else {
      showToast(
        `${total}개사 1·2번 분석 완료! (오늘 AI 호출 ${usageAfter.count}/${DAILY_AI_CALL_LIMIT}회${
          hasMoreUnsearched ? ' · 남은 업체는 [신규 업체만 서치]로 이어서 실행 가능' : ''
        })`
      );
    }
  };

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
      const matchesSearch =
        String(p.companyName || '').toLowerCase().includes(q) ||
        String(p.mainProduct || '').toLowerCase().includes(q) ||
        String(p.topReviewMenu || '').toLowerCase().includes(q) ||
        String(p.manager || '').toLowerCase().includes(q) ||
        String(p.phone || '').includes(q) ||
        String(p.address || '').toLowerCase().includes(q);
      const matchesCategory =
        categoryFilter === '전체' ||
        p.category === categoryFilter ||
        p.topReviewMenu === categoryFilter;
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
    const topItem = (topIngredientsState?.items || [])[0] || {
      name: '서치 대기',
      count: 0,
      share: '0',
    };
    const allSpecies = Object.values(safeSpeciesData);
    const avgChange =
      allSpecies.length > 0
        ? (
            allSpecies.reduce((acc, s) => acc + Number(s?.prevDiffRate || 0), 0) /
            allSpecies.length
          ).toFixed(1)
        : '0.0';
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
  }, [topIngredientsState, safeSpeciesData, partners]);

  const handleSearchSinglePartnerMenu = async (partner, skipAutoDrive = false) => {
    if (searchingPartnerIds[partner.id]) return;
    setSearchingPartnerIds((prev) => ({ ...prev, [partner.id]: true }));

    const result = await searchPartnerWebAndMenus(partner, supabaseConfig.geminiKey);
    const hasFoundMenus = result.menus && result.menus.length > 0;
    const top5StarMenu = result.topReviewMenu || (hasFoundMenus ? result.menus[0] : '');
    const schedule = getKstScheduleInfo();

    const nextPartners = partners.map((item) =>
      item.id === partner.id
        ? {
            ...item,
            topReviewMenu: top5StarMenu,
            searchedMenus: result.menus,
            mainProduct: hasFoundMenus ? result.menus.join(' · ') : '',
            snsPlatform: 'Instagram',
            snsHandle: result.instagramHandle,
            instagramUrl: result.instagramUrl,
            blogUrl: result.blogUrl,
            aiSummary: result.summary,
            isSearched: true,
            lastAnalyzedAt: schedule.formattedNow,
          }
        : item
    );
    setPartners(nextPartners);
    await persistDashboardState({ partners: nextPartners });

    if (!skipAutoDrive) {
      await saveAndSyncAnalysisSnapshot(
        nextPartners,
        `개별 업체 메뉴 갱신 (${partner.companyName})`,
        1,
        true
      );
    }

    setSearchingPartnerIds((prev) => ({ ...prev, [partner.id]: false }));
    setSelectedPartnerDetail({
      ...partner,
      topReviewMenu: top5StarMenu,
      searchedMenus: result.menus,
      snsHandle: result.instagramHandle,
      instagramUrl: result.instagramUrl,
      blogUrl: result.blogUrl,
      aiSummary: result.summary,
      lastAnalyzedAt: schedule.formattedNow,
    });
    showToast(
      top5StarMenu
        ? `[${buildRegionCompanyQuery(partner.companyName, partner.address)}] 5점 리뷰 1위 메뉴 '${top5StarMenu}' 반영 완료!`
        : `[${buildRegionCompanyQuery(partner.companyName, partner.address)}] 검색 완료`
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
      await handleSearchSinglePartnerMenu(target, true);
    }
    setIsBatchSearching(false);
    await saveAndSyncAnalysisSnapshot(
      partners,
      `일괄 업체 메뉴 갱신 (${targets.length}개사)`,
      targets.length,
      true
    );
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
          .map((line) => line.split(delimiter).map((c) => c.trim()));
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
        if (!Array.isArray(row) || row.length === 0 || idx <= headerRowIndex) return;
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
        showToast('엑셀 파일에서 유효한 업체 행을 찾지 못했습니다.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setExcelPreviewRows(parsed);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      showToast('엑셀 파일 분석 중 문제가 발생했습니다.');
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
    persistDashboardState({ partners: nextPartners });

    setCurrentPage(1);
    setExcelPreviewRows([]);
    setExcelFileName('');
    setActiveModal(null);
    showToast(`엑셀 거래업체 ${newItems.length}개사가 저장되었습니다!`);
  };

  const handleAddPartner = (e) => {
    e.preventDefault();
    if (!newPartnerForm.companyName || !newPartnerForm.mainProduct || !newPartnerForm.unitPrice) {
      return;
    }
    const tagKeyword = newPartnerForm.companyName.trim().replace(/\s+/g, '');
    const newItem = {
      id: `P-${Date.now()}`,
      companyName: newPartnerForm.companyName,
      snsPlatform: 'Instagram',
      snsHandle: `#${tagKeyword}`,
      instagramUrl: `https://www.instagram.com/explore/tags/${encodeURIComponent(tagKeyword)}/`,
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
      lastOrder: '2026-11-20',
    };

    const nextPartners = [newItem, ...partners];
    setPartners(nextPartners);
    persistDashboardState({ partners: nextPartners });
    setActiveModal(null);
    showToast(`신규 거래업체 '${newItem.companyName}'이(가) 등록되었습니다.`);
  };

  const handleAddAuction = (e) => {
    e.preventDefault();
    if (!newAuctionForm.price) return;

    const targetSpecies = newAuctionForm.species;
    const baseTarget = safeSpeciesData[targetSpecies] || Object.values(safeSpeciesData)[0];
    const newPrice = Number(newAuctionForm.price);
    const prevAvg = baseTarget.currentAvg;
    const diffAmount = newPrice - prevAvg;
    const diffRate = prevAvg > 0 ? Number(((diffAmount / prevAvg) * 100).toFixed(1)) : 0;

    const updatedHistory7d = [...(baseTarget.history7d || [])];
    if (updatedHistory7d.length > 0) {
      updatedHistory7d[updatedHistory7d.length - 1] = {
        ...updatedHistory7d[updatedHistory7d.length - 1],
        price: newPrice,
      };
    }

    const existingMarkets = baseTarget.markets || [];
    const hasMarket = existingMarkets.some((m) => m.market === newAuctionForm.market);
    const updatedMarkets = hasMarket
      ? existingMarkets.map((m) =>
          m.market === newAuctionForm.market
            ? {
                ...m,
                price: newPrice,
                diff: diffAmount,
                volume: newAuctionForm.volume || m.volume,
                status: newAuctionForm.status,
              }
            : m
        )
      : [
          ...existingMarkets,
          {
            market: newAuctionForm.market,
            price: newPrice,
            diff: diffAmount,
            volume: newAuctionForm.volume || '집계중',
            status: newAuctionForm.status,
          },
        ];

    const nextSpeciesData = {
      ...safeSpeciesData,
      [targetSpecies]: {
        ...baseTarget,
        currentAvg: newPrice,
        prevDiffRate: diffRate,
        history7d: updatedHistory7d,
        markets: updatedMarkets,
      },
    };
    setSpeciesData(nextSpeciesData);
    persistDashboardState({ speciesData: nextSpeciesData });
    setSelectedSpecies(targetSpecies);
    setActiveModal(null);
    showToast(`${targetSpecies} (${newAuctionForm.market}) 오늘의 위판 시세가 반영되었습니다.`);
  };

  if (!isUnlocked || (isChangingPin && isUnlocked)) {
    const isChangeMode = isChangingPin && isUnlocked;
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-sky-700 to-blue-800 p-6 text-white text-center">
            <div className="w-14 h-14 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/25">
              {isChangeMode ? (
                <KeyRound className="w-7 h-7 text-sky-200" />
              ) : (
                <Lock className="w-7 h-7 text-sky-200" />
              )}
            </div>
            <h1 className="text-xl font-bold tracking-tight">수산물 종합 유통·시세 대시보드</h1>
            <p className="text-xs text-sky-100 mt-1">
              {isChangeMode
                ? '현재 PIN 확인 후 새 마스터 비밀번호(PIN)로 변경합니다'
                : '승인된 사용자만 접속 가능합니다 · 4자리 비밀번호(PIN)를 입력하세요'}
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="p-6 space-y-4">
            {!isDataLoaded ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
                <span className="text-xs">클라우드 보안 정책 및 저장 데이터 불러오는 중...</span>
              </div>
            ) : (
              <>
                {isChangeMode && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      현재 4자리 비밀번호(PIN) 입력
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      autoFocus
                      placeholder="••••"
                      value={currentPinForChange}
                      onChange={(e) => {
                        setCurrentPinForChange(e.target.value.replace(/\D/g, '').slice(0, 4));
                        setPinError('');
                      }}
                      className="w-full text-center text-2xl tracking-[0.6em] font-bold py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isChangeMode ? '새 4자리 숫자 PIN 입력' : '4자리 비밀번호(PIN) 입력'}
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    autoFocus={!isChangeMode}
                    placeholder="••••"
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4));
                      setPinError('');
                    }}
                    className="w-full text-center text-2xl tracking-[0.6em] font-bold py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                  />
                </div>

                {isChangeMode && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      새 4자리 숫자 PIN 다시 입력 (확인)
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
                  {isChangeMode ? '마스터 PIN 변경 및 전 기기 동기화' : '잠금 해제 후 대시보드 열기'}
                </button>

                {isChangeMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPin(false);
                      setPinInput('');
                      setPinConfirmInput('');
                      setCurrentPinForChange('');
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
                    새로운 기기·브라우저에서는 임의 비밀번호 생성이 차단됩니다.
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    클라우드 상태: {syncStatus}
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
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 max-w-md">
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
                  v3.5 · 공식 위판시세 · 매입 인사이트
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="hidden sm:inline">
                  거래업체 {partners.length}개사 통합 관리 · 부산·남해 위판 시세 · Windy 해상 기상
                </span>
                <button
                  onClick={() => setActiveModal('cloud')}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium cursor-pointer text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100"
                >
                  <Cloud className="w-3 h-3" />
                  {syncStatus}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            <button
              onClick={handleManualDownloadSnapshot}
              title="누적된 거래업체 1번(주력 원재료)·2번(메뉴) 분석 결과를 내 컴퓨터 TXT 파일로 즉시 저장합니다."
              className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-lg border text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>분석 TXT 저장</span>
            </button>
            <button
              onClick={() => setActiveModal('cloud')}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-lg border text-sky-700 bg-sky-50 border-sky-200 hover:bg-sky-100 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden md:inline">동기화 · API키 설정</span>
            </button>
            <button
              onClick={() => setActiveModal('excel')}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">엑셀 업로드</span>
            </button>
            <button
              onClick={() => setActiveModal('auction')}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">위판 시세</span>
            </button>
            <button
              onClick={() => setActiveModal('partner')}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs cursor-pointer"
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
                setCurrentPinForChange('');
                setPinError('');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">PIN 변경</span>
            </button>
            <button
              onClick={handleLockScreen}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>잠금</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <WeatherSection
          weatherMap={INITIAL_WEATHER_DATA}
          selectedSea={selectedSea}
          setSelectedSea={setSelectedSea}
          windyOverlay={windyOverlay}
          setWindyOverlay={setWindyOverlay}
        />

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">최고 인기 메인재료</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{kpiSummary.topItem.name}</span>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                {kpiSummary.topItem.count > 0
                  ? `${kpiSummary.topItem.count}개사 (${kpiSummary.topItem.share}%)`
                  : '미실행'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {topIngredientsState.updatedAt
                ? `최근 갱신: ${topIngredientsState.updatedAt}`
                : '하단 TOP 5 섹션에서 서치 실행 시 갱신'}
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
                {Number(kpiSummary.avgChange) > 0
                  ? `+${kpiSummary.avgChange}%`
                  : `${kpiSummary.avgChange}%`}
              </span>
              <span className="text-xs font-medium text-slate-500">전일 위판가 대비</span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              부산·남해 위판장 매일 12:00 자동 갱신
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
              엑셀 일괄 등록 및 웹 메뉴 검색 연동 완료
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

        <AuctionSection
          speciesData={safeSpeciesData}
          selectedSpecies={selectedSpecies}
          setSelectedSpecies={setSelectedSpecies}
          chartPeriod={chartPeriod}
          setChartPeriod={setChartPeriod}
          speciesSearchInput={speciesSearchInput}
          setSpeciesSearchInput={setSpeciesSearchInput}
          isSearchingSpecies={isSearchingSpecies}
          onSearchAndAddSpecies={handleSearchAndAddSpecies}
          onResetSpeciesToDefault={handleResetSpeciesToDefault}
          auctionUpdatedAt={auctionUpdatedAt}
          isRefreshingAuction={isRefreshingAuction}
          onRefreshAuctionNow={() => refreshAllSpeciesAuction(false)}
          onUpdateSpeciesMarkets={handleUpdateSpeciesMarkets}
        />

        {/* 매입 추천 · 트렌드 인사이트 (공식 위판 시세 × 판매처 TOP 5 수요 교차 분석) */}
        <PurchaseInsightSection
          speciesData={safeSpeciesData}
          topIngredientsState={topIngredientsState}
          partnersCount={partners.length}
          selectedSpecies={selectedSpecies}
          onSelectSpecies={setSelectedSpecies}
        />

        <section className="space-y-6">
          <TopIngredientsSection
            partnersCount={partners.length}
            unsearchedCount={unsearchedTopPartnersCount}
            partners={partners}
            topIngredientsState={topIngredientsState}
            isSearchingTopIngredients={isSearchingTopIngredients}
            searchProgress={searchProgress}
            onRequestNewSearchConfirm={() => setActiveModal('confirmTopSearchNew')}
            onRequestFullRescanConfirm={() => setActiveModal('confirmTopSearchAll')}
            onDownloadSnapshotTxt={handleManualDownloadSnapshot}
            onAbortSearch={() => {
              abortSearchRef.current = true;
            }}
          />

          <PartnerTableSection
            partners={partners}
            filteredPartners={filteredPartners}
            paginatedPartners={paginatedPartners}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            regionFilter={regionFilter}
            setRegionFilter={setRegionFilter}
            availableRegions={availableRegions}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            speciesKeys={Object.keys(safeSpeciesData)}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            searchingPartnerIds={searchingPartnerIds}
            isBatchSearching={isBatchSearching}
            selectedPartnerDetail={selectedPartnerDetail}
            setSelectedPartnerDetail={setSelectedPartnerDetail}
            onClearAllPartners={handleClearAllPartners}
            onBatchSearchCurrentPage={handleBatchSearchCurrentPage}
            onSearchSinglePartnerMenu={handleSearchSinglePartnerMenu}
            onOpenExcelModal={() => setActiveModal('excel')}
          />
        </section>
      </main>

      <Modals
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        partnersCount={partners.length}
        unsearchedPartnersCount={unsearchedTopPartnersCount}
        geminiKey={supabaseConfig.geminiKey}
        onConfirmTopSearch={handleStartTopIngredientsSearch}
        supabaseForm={supabaseForm}
        setSupabaseForm={setSupabaseForm}
        onSaveSupabaseConfig={handleSaveSupabaseConfig}
        onRunConnectionDiagnostics={handleRunConnectionDiagnostics}
        isRunningDiag={isRunningDiag}
        diagResults={diagResults}
        onClearAllPartners={handleClearAllPartners}
        fileInputRef={fileInputRef}
        onExcelFileChange={handleExcelFileChange}
        excelFileName={excelFileName}
        setExcelFileName={setExcelFileName}
        excelPreviewRows={excelPreviewRows}
        setExcelPreviewRows={setExcelPreviewRows}
        onConfirmExcelImport={handleConfirmExcelImport}
        newPartnerForm={newPartnerForm}
        setNewPartnerForm={setNewPartnerForm}
        onAddPartner={handleAddPartner}
        speciesKeys={Object.keys(safeSpeciesData)}
        speciesData={safeSpeciesData}
        newAuctionForm={newAuctionForm}
        setNewAuctionForm={setNewAuctionForm}
        onAddAuction={handleAddAuction}
      />
    </div>
  );
}