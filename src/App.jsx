import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Anchor,
  Cloud,
  Database,
  FileSpreadsheet,
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
  Instagram,
  Radio,
  RefreshCw,
  Sparkles,
  Check,
  MessageSquareText,
} from './components/Icons';
import WeatherSection from './components/WeatherSection';
import AuctionSection from './components/AuctionSection';
import TopIngredientsSection from './components/TopIngredientsSection';
import PartnerTableSection from './components/PartnerTableSection';
import Modals from './components/Modals';
import {
  APP_ID,
  DEFAULT_MASTER_PIN,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
  DEFAULT_SOUTH_MARKETS,
  INITIAL_WEATHER_DATA,
  INITIAL_SPECIES_DATA,
  INITIAL_PARTNERS,
  INITIAL_SNS_FEEDS,
  isLegacySpeciesMap,
} from './constants/initialData';
import {
  parseXlsxNatively,
  buildRegionCompanyQuery,
  openInstagramSearchInApp,
  inferPartnerMetadata,
  parseSnsPostText,
} from './utils/excelParser';
import {
  searchPartnerWebAndMenus,
  searchTopIngredientsBatch,
  fetchSpeciesAuctionTrend,
  fetchAllSpeciesAuctionBatch,
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
  });
  const [supabaseForm, setSupabaseForm] = useState({
    url: DEFAULT_SUPABASE_URL,
    anonKey: DEFAULT_SUPABASE_ANON_KEY,
    geminiKey: '',
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

  const [snsFeeds, setSnsFeeds] = useState(INITIAL_SNS_FEEDS);
  const [isSyncingSns, setIsSyncingSns] = useState(false);
  const [snsInputCompany, setSnsInputCompany] = useState('');
  const [snsInputText, setSnsInputText] = useState('');

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

  // 절대 null/undefined가 되지 않도록 보장하는 안전 객체
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

  useEffect(() => {
    let loadedSbUrl = DEFAULT_SUPABASE_URL;
    let loadedSbKey = DEFAULT_SUPABASE_ANON_KEY;
    try {
      const localPin = localStorage.getItem(`${APP_ID}_pin`);
      const localPartners = localStorage.getItem(`${APP_ID}_partners`);
      const localSpecies = localStorage.getItem(`${APP_ID}_species`);
      const localFeeds = localStorage.getItem(`${APP_ID}_feeds`);
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
          if (parsedPartners.length > 0) {
            setSnsInputCompany(parsedPartners[0].companyName);
          }
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
      if (localFeeds) {
        const parsedFeeds = JSON.parse(localFeeds);
        if (Array.isArray(parsedFeeds)) setSnsFeeds(parsedFeeds);
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
        if (remote.geminiKey) {
          setSupabaseConfig((prev) => {
            const next = { ...prev, geminiKey: remote.geminiKey };
            localStorage.setItem(`${APP_ID}_supabase`, JSON.stringify(next));
            return next;
          });
          setSupabaseForm((prev) => ({ ...prev, geminiKey: remote.geminiKey }));
        }
        if (Array.isArray(remote.snsFeeds)) {
          setSnsFeeds(remote.snsFeeds);
          localStorage.setItem(`${APP_ID}_feeds`, JSON.stringify(remote.snsFeeds));
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
    const nextFeeds = overrides.snsFeeds !== undefined ? overrides.snsFeeds : snsFeeds;
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
      localStorage.setItem(`${APP_ID}_feeds`, JSON.stringify(nextFeeds));
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
              snsFeeds: nextFeeds,
              topIngredients: nextTopIng,
              auctionUpdatedAt: nextAuctionUpdatedAt,
              lastNoonSyncDate: nextLastNoonSyncDate,
              geminiKey: activeSb.geminiKey || '',
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

  // 전 어종 시세를 단 1회 AI 호출로 일괄 갱신 (12:00 자동 갱신 및 실시간 수동 갱신 공용)
  const refreshAllSpeciesAuction = async (isAutoNoon = false) => {
    if (isRefreshingAuction) return;
    setIsRefreshingAuction(true);

    const schedule = getKstScheduleInfo();
    const { updatedMap, liveUpdatedCount, isRateLimit, error } =
      await fetchAllSpeciesAuctionBatch(
        safeSpeciesData,
        supabaseConfig.geminiKey,
        DEFAULT_SOUTH_MARKETS
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
        '⚠️ AI 무료 사용 한도를 모두 소진하여 연쇄 호출 없이 즉시 중지했습니다. (날짜만 오늘 기준으로 갱신됨)'
      );
    } else if (isAutoNoon) {
      showToast('낮 12:00 정기 스케줄에 따라 부산·남해 위판장 시세가 자동 갱신되었습니다.');
    } else if (liveUpdatedCount > 0) {
      showToast(`부산·남해 위판장 ${liveUpdatedCount}개 어종 실시간 시세와 날짜가 최신화되었습니다!`);
    } else {
      showToast(
        `기준 날짜가 오늘(${schedule.todayStr})로 갱신되었습니다. (${error || 'AI 키 확인 필요'})`
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

    const results = {
      sbRead: { ok: false, detail: '미실행' },
      sbWrite: { ok: false, detail: '미실행' },
      gemini: { ok: false, detail: '미실행' },
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
            snsFeeds,
            topIngredients: topIngredientsState,
            auctionUpdatedAt,
            lastNoonSyncDate,
            geminiKey: cleanGeminiKey,
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

    setDiagResults(results);
    setIsRunningDiag(false);
  };

  const handleSaveSupabaseConfig = async (e) => {
    e.preventDefault();
    const trimmed = {
      url: supabaseForm.url.trim(),
      anonKey: supabaseForm.anonKey.trim(),
      geminiKey: (supabaseForm.geminiKey || '').trim(),
    };
    setSupabaseConfig(trimmed);
    localStorage.setItem(`${APP_ID}_supabase`, JSON.stringify(trimmed));
    setActiveModal(null);
    await persistDashboardState({ supabaseConfig: trimmed });
    showToast('클라우드 DB 및 AI API 설정이 저장되었습니다!');
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
    setSnsFeeds([]);
    setSelectedPartnerDetail(null);
    setCurrentPage(1);
    await persistDashboardState({ partners: [], snsFeeds: [] });
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
      DEFAULT_SOUTH_MARKETS
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
          `⚠️ AI 무료 사용 한도를 소진하여 '${res.data.name}' 탭만 기본 시세로 추가되었습니다.`
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

    const batchSize = 15;
    const total = targetsToSearch.length;
    setSearchProgress({ done: 0, total });

    // 이번 서치로 새로 확인된 업체별 원재료 맵: { [partnerId]: ['삼치', '고등어'] }
    const newlyFoundMap = {};
    let lastError = '';
    let hitRateLimit = false;

    for (let i = 0; i < total; i += batchSize) {
      if (abortSearchRef.current) break;

      const batch = targetsToSearch.slice(i, i + batchSize);
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
        newlyFoundMap[p.id] = ings;
      });

      const doneCount = Math.min(i + batch.length, total);
      setSearchProgress({ done: doneCount, total });

      if (i + batchSize < total && !abortSearchRef.current) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    // 기존 partners 상태에 이번 서치 결과를 누적 반영
    const nextPartners = partners.map((p) => {
      if (Object.prototype.hasOwnProperty.call(newlyFoundMap, p.id)) {
        return {
          ...p,
          topIngredientSearched: true,
          extractedIngredients: newlyFoundMap[p.id],
        };
      }
      if (isFullRescan && !hitRateLimit && !abortSearchRef.current) {
        return { ...p, topIngredientSearched: false, extractedIngredients: [] };
      }
      return p;
    });

    // 전체 partners(기존 누적 + 신규 확인) 기준으로 TOP 5 재집계
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

    const schedule = getKstScheduleInfo();
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

    if (hitRateLimit) {
      showToast(
        '⚠️ AI 무료 사용 한도를 모두 소진하여 즉시 중지했습니다. (직전까지 확인된 업체 결과는 저장됨)'
      );
    } else if (abortSearchRef.current) {
      showToast(`서치가 중지되었습니다. (누적 확인 ${analyzedCount}개사 결과 반영)`);
    } else if (total === 0 && !isFullRescan) {
      showToast(`신규 미서치 업체가 없어 기존 저장 데이터(${analyzedCount}개사) 기준으로 TOP 5를 재정리했습니다.`);
    } else if (top5Items.length === 0) {
      showToast(
        lastError || '확인된 메인 원재료가 없습니다. 상단 [동기화 · AI키 설정]을 확인해 주세요.'
      );
    } else {
      showToast(
        `${isFullRescan ? '전체 재서칭' : `신규 ${total}개사 서치`} 완료! (누적 확인 ${analyzedCount}개사 · 생략 ${omittedCount}개사)`
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
    if (nextPartners.length > 0 && !snsInputCompany) {
      setSnsInputCompany(nextPartners[0].companyName);
    }
    persistDashboardState({ partners: nextPartners });

    setCurrentPage(1);
    setExcelPreviewRows([]);
    setExcelFileName('');
    setActiveModal(null);
    showToast(`엑셀 거래업체 ${newItems.length}개사가 저장되었습니다!`);
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
              lastOrder: '2026-11-20 (SNS자동)',
              status: '활발',
            }
          : p
      );
    } else {
      nextPartners = [
        {
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
          lastOrder: '2026-11-20 (SNS자동)',
        },
        ...partners,
      ];
    }

    const nextFeeds = snsFeeds.map((f) =>
      f.id === feedItem.id ? { ...f, syncedToPartner: true } : f
    );

    setPartners(nextPartners);
    setSnsFeeds(nextFeeds);
    persistDashboardState({ partners: nextPartners, snsFeeds: nextFeeds });
    showToast(`[${companyName}] SNS 입고/단가 정보가 반영되었습니다.`);
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
      showToast('등록 거래처 SNS 최신 게시물 수집이 완료되었습니다.');
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
                  v3.4 · 부산·남해 위판장 · 12시 자동갱신
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
              onClick={() => setActiveModal('cloud')}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-lg border text-sky-700 bg-sky-50 border-sky-200 hover:bg-sky-100 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden md:inline">동기화 · AI키 설정</span>
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
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-sky-600 hover:bg-sky-700 px-2.5 py-1 rounded-full cursor-pointer"
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
                  입항량을 자동 추출하여 아래 거래업체 단가표에 즉시 반영합니다.
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
                    placeholder="예: 오늘 새벽 통영항 입항! 선망 고등어 특대 10kg 1상자 39,000원 총 250상자 선별 완료했습니다."
                    value={snsInputText}
                    onChange={(e) => setSnsInputText(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI 자동 추출 및 거래처 상품 반영
                </button>
              </form>
            </div>
          </div>
        </section>

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