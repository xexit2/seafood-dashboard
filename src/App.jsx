import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
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
  Phone,
  X,
  RefreshCw,
  Sparkles,
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
  KeyRound,
  ShieldCheck,
  Cloud,
  RotateCcw,
  Database,
  Instagram,
} from './components/Icons';
import WeatherSection from './components/WeatherSection';
import AuctionSection from './components/AuctionSection';
import TopIngredientsSection from './components/TopIngredientsSection';
import PartnerTableSection from './components/PartnerTableSection';
import Modals from './components/Modals';
import {
  APP_ID,
  APP_VERSION,
  DEFAULT_MASTER_PIN,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
  INITIAL_SPECIES_DATA,
  INITIAL_PARTNERS,
  INITIAL_SNS_FEEDS,
  isLegacySpeciesMap,
  formatNumber,
  formatDateTimeKST,
} from './constants/initialData';
import {
  buildRegionCompanyQuery,
  openInstagramSearchInApp,
  parseXlsxNatively,
  inferPartnerMetadata,
  parseSnsPostText,
} from './utils/excelParser';
import {
  buildSupabaseHeaders,
  searchPartnerWebAndMenus,
  fetchSpeciesAuctionTrend,
  searchBatchMainIngredients,
} from './utils/apiService';

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

  // 마스터 PIN 보안 게이트 상태
  const [savedPin, setSavedPin] = useState(DEFAULT_MASTER_PIN);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentPinForChange, setCurrentPinForChange] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinConfirmInput, setPinConfirmInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);

  // 기상 · 위판 시세 상태
  const [selectedSea, setSelectedSea] = useState('busan');
  const [windyOverlay, setWindyOverlay] = useState('wind');
  const [speciesData, setSpeciesData] = useState(INITIAL_SPECIES_DATA);
  const [selectedSpecies, setSelectedSpecies] = useState('삼치');
  const [chartPeriod, setChartPeriod] = useState('7d');
  const [speciesSearchInput, setSpeciesSearchInput] = useState('');
  const [isSearchingSpecies, setIsSearchingSpecies] = useState(false);

  // 거래업체 · 검색 · 페이지네이션 상태
  const [partners, setPartners] = useState(INITIAL_PARTNERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [regionFilter, setRegionFilter] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [searchingPartnerIds, setSearchingPartnerIds] = useState({});
  const [isBatchSearching, setIsBatchSearching] = useState(false);
  const [selectedPartnerDetail, setSelectedPartnerDetail] = useState(null);

  // 인기 메인재료 TOP 5 상태
  const [topIngredientsState, setTopIngredientsState] = useState({
    items: [],
    updatedAt: '',
    analyzedCount: 0,
    confirmedCount: 0,
    omittedCount: 0,
    errorSummary: '',
  });
  const [isSearchingTopIngredients, setIsSearchingTopIngredients] = useState(false);
  const [ingredientSearchProgress, setIngredientSearchProgress] = useState({
    currentBatch: 0,
    totalBatches: 0,
    confirmedSoFar: 0,
    failedBatches: 0,
  });
  const cancelIngredientSearchRef = useRef(false);

  // SNS 피드 상태
  const [snsFeeds, setSnsFeeds] = useState(INITIAL_SNS_FEEDS);
  const [isSyncingSns, setIsSyncingSns] = useState(false);
  const [snsInputCompany, setSnsInputCompany] = useState('');
  const [snsInputText, setSnsInputText] = useState('');

  // 모달 · 엑셀 업로드 상태
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
    let loadedSbUrl = DEFAULT_SUPABASE_URL;
    let loadedSbKey = DEFAULT_SUPABASE_ANON_KEY;
    try {
      const localPin = localStorage.getItem(`${APP_ID}_pin`);
      const localPartners = localStorage.getItem(`${APP_ID}_partners`);
      const localSpecies = localStorage.getItem(`${APP_ID}_species`);
      const localFeeds = localStorage.getItem(`${APP_ID}_feeds`);
      const localTopIngredients = localStorage.getItem(`${APP_ID}_top_ingredients`);
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
      } else {
        localStorage.setItem(
          `${APP_ID}_supabase`,
          JSON.stringify({
            url: DEFAULT_SUPABASE_URL,
            anonKey: DEFAULT_SUPABASE_ANON_KEY,
            geminiKey: '',
          })
        );
      }

      if (localPin && /^\d{4}$/.test(localPin)) {
        setSavedPin(localPin);
      }
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
          setSpeciesData(INITIAL_SPECIES_DATA);
          setSelectedSpecies('삼치');
          localStorage.setItem(`${APP_ID}_species`, JSON.stringify(INITIAL_SPECIES_DATA));
        }
      }
      if (localFeeds) setSnsFeeds(JSON.parse(localFeeds));
      if (localTopIngredients) {
        const parsedTop = JSON.parse(localTopIngredients);
        if (parsedTop && Array.isArray(parsedTop.items)) {
          setTopIngredientsState(parsedTop);
        }
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

      const res = await fetch(`${cleanUrl}/rest/v1/seafood_state?id=eq.main&select=*`, {
        headers: buildSupabaseHeaders(cleanKey),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0 && rows[0].payload) {
        const remote = rows[0].payload;
        if (remote.pin && /^\d{4}$/.test(String(remote.pin))) {
          const verifiedPin = String(remote.pin);
          setSavedPin(verifiedPin);
          localStorage.setItem(`${APP_ID}_pin`, verifiedPin);
        }
        if (Array.isArray(remote.partners)) {
          setPartners(remote.partners);
          localStorage.setItem(`${APP_ID}_partners`, JSON.stringify(remote.partners));
          if (remote.partners.length > 0) {
            setSnsInputCompany((prev) => prev || remote.partners[0].companyName);
          }
        }
        if (remote.speciesData && !isLegacySpeciesMap(remote.speciesData)) {
          setSpeciesData(remote.speciesData);
          localStorage.setItem(`${APP_ID}_species`, JSON.stringify(remote.speciesData));
          if (!remote.speciesData[selectedSpecies]) {
            setSelectedSpecies(Object.keys(remote.speciesData)[0]);
          }
        } else {
          setSpeciesData(INITIAL_SPECIES_DATA);
          setSelectedSpecies('삼치');
          localStorage.setItem(`${APP_ID}_species`, JSON.stringify(INITIAL_SPECIES_DATA));
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
        if (remote.topIngredients && Array.isArray(remote.topIngredients.items)) {
          setTopIngredientsState(remote.topIngredients);
          localStorage.setItem(`${APP_ID}_top_ingredients`, JSON.stringify(remote.topIngredients));
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
    const nextTopIngredients =
      overrides.topIngredients !== undefined ? overrides.topIngredients : topIngredientsState;
    const activeSb = overrides.supabaseConfig || supabaseConfig;

    try {
      if (nextPin) localStorage.setItem(`${APP_ID}_pin`, nextPin);
      localStorage.setItem(`${APP_ID}_partners`, JSON.stringify(nextPartners));
      localStorage.setItem(`${APP_ID}_species`, JSON.stringify(nextSpecies));
      localStorage.setItem(`${APP_ID}_feeds`, JSON.stringify(nextFeeds));
      localStorage.setItem(`${APP_ID}_top_ingredients`, JSON.stringify(nextTopIngredients));
    } catch (e) {
      console.warn('로컬 저장 오류:', e);
    }

    if (activeSb && activeSb.url && activeSb.anonKey) {
      try {
        setSyncStatus('클라우드 저장 중...');
        const cleanUrl = activeSb.url.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '');
        const cleanKey = activeSb.anonKey.trim();

        const res = await fetch(`${cleanUrl}/rest/v1/seafood_state?on_conflict=id`, {
          method: 'POST',
          headers: buildSupabaseHeaders(cleanKey, {
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=minimal',
          }),
          body: JSON.stringify({
            id: 'main',
            payload: {
              pin: nextPin,
              partners: nextPartners,
              speciesData: nextSpecies,
              snsFeeds: nextFeeds,
              topIngredients: nextTopIngredients,
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
        if (
          msg.includes('42501') ||
          msg.includes('row-level security') ||
          msg.includes('permission denied')
        ) {
          setSyncStatus('RLS/권한 차단 (SQL 재실행 필요)');
          showToast(
            'Supabase 보안 잠금(RLS) 또는 권한 오류입니다. SQL Editor에서 Run without RLS로 실행해 주세요.'
          );
        } else if (msg.includes('404') || msg.includes('PGRST205')) {
          setSyncStatus('테이블 미노출 (Exposed tables 확인)');
          showToast(
            'Supabase Data API > Settings > Exposed tables에 seafood_state가 체크되어 있는지 확인해 주세요.'
          );
        } else if (msg.includes('401') || msg.includes('403') || msg.includes('Invalid API key')) {
          setSyncStatus('API 키 오류 (키 다시 확인)');
          showToast('Supabase API Keys에서 anon public 키를 다시 복사해 넣어주세요.');
        } else {
          setSyncStatus(`연결 오류 (${msg.slice(0, 32)})`);
          showToast(`클라우드 연결 응답: ${msg.slice(0, 80)}`);
        }
        return;
      }
    }

    setSyncStatus('브라우저 자동 저장됨');
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

    if (!cleanUrl || !cleanSbKey) {
      results.sbRead = { ok: false, detail: 'URL 또는 Anon Key가 비어 있습니다.' };
    } else {
      try {
        const res = await fetch(
          `${cleanUrl}/rest/v1/seafood_state?id=eq.main&select=id,updated_at`,
          { headers: buildSupabaseHeaders(cleanSbKey) }
        );
        const text = await res.text().catch(() => '');
        if (res.ok) {
          results.sbRead = { ok: true, detail: `HTTP ${res.status} 정상 (public 스키마 조회 성공)` };
        } else {
          results.sbRead = { ok: false, detail: `HTTP ${res.status}: ${text.slice(0, 120)}` };
        }
      } catch (e) {
        results.sbRead = { ok: false, detail: `네트워크 차단/오류: ${e.message}` };
      }
    }

    if (!cleanUrl || !cleanSbKey) {
      results.sbWrite = { ok: false, detail: 'URL 또는 Anon Key가 비어 있습니다.' };
    } else {
      try {
        const res = await fetch(`${cleanUrl}/rest/v1/seafood_state?on_conflict=id`, {
          method: 'POST',
          headers: buildSupabaseHeaders(cleanSbKey, {
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=minimal',
          }),
          body: JSON.stringify({
            id: 'main',
            payload: {
              pin: savedPin,
              partners,
              speciesData,
              snsFeeds,
              topIngredients: topIngredientsState,
              geminiKey: cleanGeminiKey,
            },
            updated_at: new Date().toISOString(),
          }),
        });
        const text = await res.text().catch(() => '');
        if (res.ok) {
          results.sbWrite = { ok: true, detail: `HTTP ${res.status} 정상 (클라우드 저장 성공)` };
          setSyncStatus('PC·모바일 실시간 동기화됨');
        } else {
          results.sbWrite = { ok: false, detail: `HTTP ${res.status}: ${text.slice(0, 140)}` };
        }
      } catch (e) {
        results.sbWrite = { ok: false, detail: `네트워크 차단/오류: ${e.message}` };
      }
    }

    if (!cleanGeminiKey) {
      results.gemini = { ok: false, detail: 'Gemini API 키가 입력되지 않았습니다.' };
    } else {
      try {
        const res = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1',
          {
            headers: { 'x-goog-api-key': cleanGeminiKey },
          }
        );
        const text = await res.text().catch(() => '');
        if (res.ok) {
          results.gemini = {
            ok: true,
            detail: `HTTP ${res.status} 정상 (${cleanGeminiKey.startsWith('AQ.') ? '신규 AQ. 인증키' : '표준키'} 연결 확인)`,
          };
        } else {
          results.gemini = { ok: false, detail: `HTTP ${res.status}: ${text.slice(0, 140)}` };
        }
      } catch (e) {
        results.gemini = { ok: false, detail: `네트워크 차단/오류: ${e.message}` };
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
    setIsChangingPin(false);
    setCurrentPinForChange('');
    setPinInput('');
    setPinConfirmInput('');
    setPinError('');
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();

    if (isUnlocked && isChangingPin) {
      if (currentPinForChange !== savedPin) {
        setPinError('현재 4자리 비밀번호(PIN)가 일치하지 않습니다.');
        return;
      }
      if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
        setPinError('새 비밀번호는 4자리 숫자로 정확히 입력해주세요.');
        return;
      }
      if (pinInput !== pinConfirmInput) {
        setPinError('새 PIN 번호 확인이 일치하지 않습니다.');
        return;
      }
      setSavedPin(pinInput);
      setIsChangingPin(false);
      setCurrentPinForChange('');
      setPinInput('');
      setPinConfirmInput('');
      setPinError('');
      await persistDashboardState({ pin: pinInput });
      showToast('마스터 PIN 번호가 변경되어 PC·모바일 모든 기기에 즉시 적용되었습니다.');
      return;
    }

    if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
      setPinError('4자리 숫자를 정확히 입력해주세요.');
      return;
    }

    if (pinInput === savedPin) {
      setIsUnlocked(true);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('비밀번호가 일치하지 않습니다. 승인된 사용자만 접속할 수 있습니다.');
      setPinInput('');
    }
  };

  const handleClearAllPartners = async () => {
    const emptyTop = {
      items: [],
      updatedAt: '',
      analyzedCount: 0,
      confirmedCount: 0,
      omittedCount: 0,
      errorSummary: '',
    };
    setPartners([]);
    setSnsFeeds([]);
    setTopIngredientsState(emptyTop);
    setSelectedPartnerDetail(null);
    setCurrentPage(1);
    await persistDashboardState({
      partners: [],
      snsFeeds: [],
      topIngredients: emptyTop,
    });
    showToast('등록된 거래업체 목록이 모두 깨끗하게 비워졌습니다.');
  };

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
          `'${res.data.name}' 탭이 추가되었습니다! (실시간 AI 시세 자동 조회는 상단 [동기화 · AI키 설정]에 Gemini API 키 입력 시 활성화됩니다)`
        );
      } else {
        showToast(`'${res.data.name}' 전국 위판장 시세 및 가격 추이가 추가되었습니다!`);
      }
    }
  };

  const handleRunTopIngredientsSearch = async () => {
    if (isSearchingTopIngredients) return;
    if (partners.length === 0) {
      showToast('먼저 엑셀 업로드나 업체 등록으로 거래처를 추가해 주세요.');
      return;
    }

    const BATCH_SIZE = 5;
    const totalBatches = Math.ceil(partners.length / BATCH_SIZE);
    cancelIngredientSearchRef.current = false;
    setIsSearchingTopIngredients(true);
    setIngredientSearchProgress({
      currentBatch: 0,
      totalBatches,
      confirmedSoFar: 0,
      failedBatches: 0,
    });

    const ignoredTerms = new Set([
      '',
      '기타',
      '수산물',
      '해산물',
      '생선',
      '활어',
      '회',
      '모둠',
      '모듬',
      '확인불가',
      '미확인',
      '없음',
      '알수없음',
      '미상',
      '식재료',
      '메뉴',
    ]);

    const ingredientPartnerMap = {};
    let confirmedCount = 0;
    let omittedCount = 0;
    let processedCount = 0;
    let failedBatches = 0;
    let lastErrorMsg = '';
    let wasCancelled = false;

    try {
      for (let b = 0; b < totalBatches; b++) {
        if (cancelIngredientSearchRef.current) {
          wasCancelled = true;
          break;
        }

        const startIdx = b * BATCH_SIZE;
        const batch = partners.slice(startIdx, startIdx + BATCH_SIZE);
        const batchRes = await searchBatchMainIngredients(batch, supabaseConfig.geminiKey);

        if (!batchRes.ok) {
          failedBatches += 1;
          if (batchRes.error) lastErrorMsg = batchRes.error;
        }

        const resultsArr = Array.isArray(batchRes.results) ? batchRes.results : [];
        const byIdx = new Map();
        const byName = new Map();

        resultsArr.forEach((r) => {
          if (!r || typeof r !== 'object') return;
          if (r.idx !== undefined && r.idx !== null && !Number.isNaN(Number(r.idx))) {
            byIdx.set(Number(r.idx), r.ingredients);
          }
          if (r.companyName) {
            const norm = String(r.companyName).replace(/\s+/g, '').toLowerCase();
            byName.set(norm, r.ingredients);
          }
        });

        batch.forEach((partner, localIdx) => {
          processedCount += 1;
          const nameKey = String(partner.companyName || '').trim();
          const normName = nameKey.replace(/\s+/g, '').toLowerCase();

          let rawIngredients = byIdx.has(localIdx) ? byIdx.get(localIdx) : byName.get(normName);

          if (!Array.isArray(rawIngredients)) {
            for (const [k, v] of byName.entries()) {
              if (k && normName && (k.includes(normName) || normName.includes(k))) {
                rawIngredients = v;
                break;
              }
            }
          }

          const validIngredients = Array.isArray(rawIngredients)
            ? Array.from(
                new Set(
                  rawIngredients
                    .map((ing) => String(ing || '').trim())
                    .filter((ing) => ing.length > 0 && !ignoredTerms.has(ing.replace(/\s+/g, '')))
                )
              )
            : [];

          if (validIngredients.length > 0) {
            confirmedCount += 1;
            validIngredients.forEach((ing) => {
              if (!ingredientPartnerMap[ing]) {
                ingredientPartnerMap[ing] = new Set();
              }
              ingredientPartnerMap[ing].add(nameKey);
            });
          } else {
            omittedCount += 1;
          }
        });

        setIngredientSearchProgress({
          currentBatch: b + 1,
          totalBatches,
          confirmedSoFar: confirmedCount,
          failedBatches,
        });

        if (b + 1 < totalBatches && !cancelIngredientSearchRef.current) {
          await new Promise((r) => setTimeout(r, 350));
        }
      }

      const sorted = Object.entries(ingredientPartnerMap)
        .map(([name, partnerSet]) => ({
          name,
          count: partnerSet.size,
          partnerNames: Array.from(partnerSet),
        }))
        .sort((a, b) => b.count - a.count);

      const top5Items = sorted.slice(0, 5).map((item, idx) => ({
        ...item,
        rank: idx + 1,
        share: confirmedCount > 0 ? ((item.count / confirmedCount) * 100).toFixed(1) : '0.0',
      }));

      const errorSummary =
        failedBatches > 0
          ? `총 ${totalBatches}개 배치 중 ${failedBatches}개 배치 호출 실패 — 최근 응답: ${lastErrorMsg}`
          : '';

      const nextTopState = {
        items: top5Items,
        updatedAt: formatDateTimeKST(new Date()),
        analyzedCount: processedCount,
        confirmedCount,
        omittedCount,
        errorSummary,
      };

      setTopIngredientsState(nextTopState);
      await persistDashboardState({ topIngredients: nextTopState });

      if (wasCancelled) {
        showToast(
          `서치가 중지되었습니다. (${processedCount}/${partners.length}개사 부분 집계 완료 · 확인 ${confirmedCount}개사)`
        );
      } else if (confirmedCount === 0 && errorSummary) {
        showToast('API 호출 오류로 메인재료를 가져오지 못했습니다. 하단 오류 내용을 확인해 주세요.');
      } else {
        showToast(
          `메인재료 TOP 5 갱신 완료! (전체 ${processedCount}개사 중 확인 ${confirmedCount}개사 · 생략 ${omittedCount}개사)`
        );
      }
    } catch (err) {
      console.error('메인재료 TOP 5 서치 오류:', err);
      const errState = {
        ...topIngredientsState,
        updatedAt: formatDateTimeKST(new Date()),
        analyzedCount: processedCount,
        confirmedCount,
        omittedCount,
        errorSummary: `예기치 않은 오류: ${err.message}`,
      };
      setTopIngredientsState(errState);
      showToast(`메인재료 서치 중 오류 발생: ${err.message}`);
    } finally {
      setIsSearchingTopIngredients(false);
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
    const topItem = topIngredientsState.items[0] || { name: '서치 대기', count: 0, share: '0' };
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
  }, [topIngredientsState, speciesData, partners]);

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
      showToast('엑셀 파일 분석 중 문제가 발생했습니다. 파일 암호 설정 여부를 확인해 주세요.');
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
    showToast(
      `엑셀 거래업체 ${newItems.length}개사가 저장되었습니다! (중복 ${excelPreviewRows.length - newItems.length}건 제외)`
    );
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
      showToast('등록 거래처 SNS 최신 게시물 수집 및 AI 구조화가 완료되었습니다.');
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

  // 보안 게이트 화면
  if (!isUnlocked || (isUnlocked && isChangingPin)) {
    const isChangeMode = isUnlocked && isChangingPin;
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
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/15 text-sky-100 border border-white/20 mb-2">
              {APP_VERSION}
            </div>
            <h1 className="text-xl font-bold tracking-tight">수산물 종합 유통·시세 대시보드</h1>
            <p className="text-xs text-sky-100 mt-1">
              {isChangeMode
                ? '현재 마스터 PIN 확인 후 새 4자리 비밀번호로 변경합니다'
                : '승인된 사용자만 접속 가능합니다 · 4자리 비밀번호(PIN)를 입력하세요'}
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="p-6 space-y-4">
            {!isDataLoaded ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
                <span className="text-xs">클라우드 마스터 보안 정책 및 데이터 동기화 중...</span>
              </div>
            ) : (
              <>
                {isChangeMode && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      현재 4자리 비밀번호(PIN) 확인
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
                      setCurrentPinForChange('');
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
                    새로운 기기·브라우저에서는 임의로 비밀번호를 새로 생성할 수 없습니다.
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    클라우드 동기화 상태: {syncStatus}
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
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  수산물 종합 유통·시세 대시보드
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  {APP_VERSION}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="hidden sm:inline">
                  거래업체 {partners.length}개사 통합 관리 · 위판장 시세 · Windy 해상 기상
                </span>
                <button
                  onClick={() => setActiveModal('cloud')}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium cursor-pointer transition-colors ${
                    supabaseConfig.url
                      ? 'text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100'
                      : 'text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                  }`}
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
                setCurrentPinForChange('');
                setPinInput('');
                setPinConfirmInput('');
                setPinError('');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">PIN 변경</span>
            </button>
            <button
              onClick={handleLockScreen}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>잠금</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* 1. Windy 실시간 해상 기상 섹션 */}
        <WeatherSection
          selectedSea={selectedSea}
          setSelectedSea={setSelectedSea}
          windyOverlay={windyOverlay}
          setWindyOverlay={setWindyOverlay}
        />

        {/* 2. 상단 KPI 요약 카드 4종 */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">최다 사용 메인 원재료 1위</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{kpiSummary.topItem.name}</span>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                비중 {kpiSummary.topItem.share}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {topIngredientsState.updatedAt
                ? `최근 갱신: ${topIngredientsState.updatedAt}`
                : '하단 [TOP 5 메인재료 서치] 클릭 시 산출'}
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
            <p className="text-xs text-slate-500 mt-1.5">삼치(+6.2%) · 금태(+4.5%) 강세 지속</p>
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

        {/* 3. 위판장 판매 어종 및 가격 추이 섹션 */}
        <AuctionSection
          speciesData={speciesData}
          selectedSpecies={selectedSpecies}
          setSelectedSpecies={setSelectedSpecies}
          chartPeriod={chartPeriod}
          setChartPeriod={setChartPeriod}
          speciesSearchInput={speciesSearchInput}
          setSpeciesSearchInput={setSpeciesSearchInput}
          isSearchingSpecies={isSearchingSpecies}
          onSearchAndAddSpecies={handleSearchAndAddSpecies}
          onResetSpeciesToDefault={handleResetSpeciesToDefault}
        />

        {/* 4. 등록 거래업체 SNS 자동 수집 및 AI 단가·입고 정리 섹션 */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
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

        {/* 5. 전체 등록 거래처 인기 메인재료 TOP 5 & 거래처 관리 섹션 */}
        <section className="space-y-6">
          <TopIngredientsSection
            topIngredientsState={topIngredientsState}
            isSearchingTopIngredients={isSearchingTopIngredients}
            ingredientSearchProgress={ingredientSearchProgress}
            partnersCount={partners.length}
            onOpenConfirmModal={() => setActiveModal('confirmTopIngredients')}
            onCancelSearch={() => {
              cancelIngredientSearchRef.current = true;
            }}
            onOpenCloudModal={() => setActiveModal('cloud')}
          />

          <PartnerTableSection
            partners={partners}
            filteredPartners={filteredPartners}
            paginatedPartners={paginatedPartners}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            regionFilter={regionFilter}
            setRegionFilter={setRegionFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            availableRegions={availableRegions}
            speciesData={speciesData}
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
            onOpenExcelModal={() => setActiveModal('excel')}
            onSearchSinglePartnerMenu={handleSearchSinglePartnerMenu}
          />
        </section>
      </main>

      <Modals
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        partnersCount={partners.length}
        supabaseConfig={supabaseConfig}
        supabaseForm={supabaseForm}
        setSupabaseForm={setSupabaseForm}
        diagResults={diagResults}
        isRunningDiag={isRunningDiag}
        onRunConnectionDiagnostics={handleRunConnectionDiagnostics}
        onSaveSupabaseConfig={handleSaveSupabaseConfig}
        onClearAllPartners={handleClearAllPartners}
        onRunTopIngredientsSearch={handleRunTopIngredientsSearch}
        fileInputRef={fileInputRef}
        excelFileName={excelFileName}
        excelPreviewRows={excelPreviewRows}
        setExcelPreviewRows={setExcelPreviewRows}
        setExcelFileName={setExcelFileName}
        onExcelFileChange={handleExcelFileChange}
        onConfirmExcelImport={handleConfirmExcelImport}
        speciesData={speciesData}
        newPartnerForm={newPartnerForm}
        setNewPartnerForm={setNewPartnerForm}
        onAddPartner={handleAddPartner}
        newAuctionForm={newAuctionForm}
        setNewAuctionForm={setNewAuctionForm}
        onAddAuction={handleAddAuction}
      />
    </div>
  );
}