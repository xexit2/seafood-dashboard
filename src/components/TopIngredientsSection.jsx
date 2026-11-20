import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
  BookOpen,
  ExternalLink,
  Building2,
  RefreshCw,
} from './Icons';
import { buildRegionCompanyQuery } from '../utils/excelParser';

export default function TopIngredientsSection({
  partnersCount,
  unsearchedCount = 0,
  partners = [],
  topIngredientsState,
  isSearchingTopIngredients,
  searchProgress,
  onRequestNewSearchConfirm,
  onRequestFullRescanConfirm,
  onAbortSearch,
}) {
  const { items = [], updatedAt = '', analyzedCount = 0, omittedCount = 0, lastError = '' } =
    topIngredientsState || {};

  const [selectedIngredientName, setSelectedIngredientName] = useState('');

  const searchedDoneCount = Math.max(0, partnersCount - unsearchedCount);
  const maxCount = Math.max(1, ...items.map((it) => Number(it.count) || 0));

  const selectedItem = useMemo(() => {
    if (!selectedIngredientName) return null;
    return items.find((it) => it.name === selectedIngredientName) || null;
  }, [items, selectedIngredientName]);

  const matchedPartners = useMemo(() => {
    if (!selectedItem) return [];
    if (Array.isArray(selectedItem.partners) && selectedItem.partners.length > 0) {
      return selectedItem.partners;
    }
    const kw = String(selectedItem.name || '').trim();
    if (!kw || !Array.isArray(partners)) return [];
    return partners
      .filter(
        (p) =>
          (Array.isArray(p.extractedIngredients) && p.extractedIngredients.includes(kw)) ||
          String(p.mainProduct || '').includes(kw) ||
          String(p.topReviewMenu || '').includes(kw) ||
          String(p.category || '').includes(kw)
      )
      .map((p) => ({
        id: p.id,
        companyName: p.companyName,
        address: p.address || '',
      }));
  }, [selectedItem, partners]);

  const handleToggleIngredient = (name) => {
    setSelectedIngredientName((prev) => (prev === name ? '' : name));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-900">
              전체 등록 거래처 인기 메인재료 TOP 5
            </h2>
            {updatedAt && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                갱신: {updatedAt}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            한 번 서치한 업체 데이터는 클라우드에 저장되며, 기본 버튼은 <strong>신규·미서치 업체만 추가 검색</strong>해 기존 결과와 합산합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isSearchingTopIngredients ? (
            <>
              <button
                type="button"
                onClick={onAbortSearch}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                중지
              </button>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-600 rounded-xl shadow-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>
                  서치 중 ({searchProgress.done}/{searchProgress.total})
                </span>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onRequestFullRescanConfirm}
                disabled={partnersCount === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                title="기존 저장 데이터를 초기화하고 등록된 모든 거래처를 처음부터 다시 검색합니다"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>전체 업체 재서칭</span>
              </button>

              <button
                type="button"
                onClick={onRequestNewSearchConfirm}
                disabled={partnersCount === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {unsearchedCount > 0
                    ? `신규 업체 서치 (${unsearchedCount}개사)`
                    : '신규 업체 서치 (0개사 · 재집계)'}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            누적 현황: <strong>전체 {partnersCount}개사</strong> 중 서치 완료{' '}
            <strong className="text-sky-700">{searchedDoneCount}개사</strong> · 미서치 신규{' '}
            <strong className="text-amber-700">{unsearchedCount}개사</strong>
          </span>
          {(updatedAt || analyzedCount > 0) && (
            <span className="text-slate-500">
              (원재료 확인 <strong className="text-emerald-700">{analyzedCount}개사</strong> · 생략{' '}
              <strong>{omittedCount}개사</strong>)
            </span>
          )}
        </div>
        <div className="text-[11px] text-sky-700 font-semibold">
          원재료를 클릭해 취급 거래처 확인 가능
        </div>
      </div>

      {lastError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong>서치 안내:</strong> {lastError}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 min-h-[190px] bg-slate-50/70 rounded-xl border border-slate-100 p-4 flex flex-col justify-center">
          {items.length === 0 ? (
            <div className="text-center space-y-1.5 py-4">
              <Sparkles className="w-6 h-6 text-sky-500 mx-auto" />
              <div className="text-xs font-bold text-slate-700">
                아직 메인재료 TOP 5 서치가 실행되지 않았습니다
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                우측 상단 <strong>[신규 업체 서치]</strong> 버튼을 누르시면 미서치 거래처만 분석해 기존 결과와 합산한 TOP 5를 산출합니다.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {items.map((item, idx) => {
                const pct = Math.min(
                  100,
                  Math.round(((Number(item.count) || 0) / maxCount) * 100)
                );
                const isSelected = selectedIngredientName === item.name;
                const barColor =
                  idx === 0
                    ? 'bg-sky-600'
                    : idx === 1
                    ? 'bg-sky-500'
                    : idx === 2
                    ? 'bg-sky-400'
                    : 'bg-slate-400';
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleToggleIngredient(item.name)}
                    className={`w-full text-left space-y-1 p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isSelected ? 'bg-sky-100/70' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{item.name}</span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {item.count}개사 사용 ({item.share}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {items.length === 0 ? (
            <div className="sm:col-span-2 md:col-span-3 p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
              서치 완료 시 상위 5개 메인 원재료와 취급 거래처 수가 이곳에 카드 형태로 정리됩니다.
            </div>
          ) : (
            items.map((item) => {
              const isSelected = selectedIngredientName === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleToggleIngredient(item.name)}
                  className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-200 shadow-xs'
                      : 'bg-slate-50 border-slate-100 hover:border-sky-300 hover:bg-white'
                  }`}
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
                      <span className="font-bold text-sm text-slate-900">{item.name}</span>
                    </div>
                    <span className="text-[11px] font-bold text-sky-700 bg-sky-100/70 px-1.5 py-0.5 rounded">
                      {item.share}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                    <span>
                      확인 거래처 <strong>{item.count}개사</strong>
                    </span>
                    <span className="text-[11px] font-semibold text-sky-600">
                      {isSelected ? '접기 ▲' : '업체 보기 ▼'}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 선택된 원재료의 확인 거래처 목록 및 네이버 메뉴 바로가기 패널 */}
      {selectedItem && (
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-sky-50/90 via-white to-emerald-50/50 border border-sky-200 space-y-3">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-sky-100">
            <div className="flex items-center gap-2 flex-wrap">
              <Building2 className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">
                &lsquo;{selectedItem.name}&rsquo; 주력 사용 확인 거래처 목록
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-600 text-white">
                {matchedPartners.length > 0
                  ? `${matchedPartners.length}개사`
                  : `${selectedItem.count}개사`}
              </span>
              <span className="text-[11px] text-slate-500">
                (업체를 클릭하면 네이버 메뉴 페이지로 바로 이동합니다)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedIngredientName('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              title="목록 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {matchedPartners.length === 0 ? (
            <div className="p-4 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 leading-relaxed">
              이전에 저장된 집계 데이터에는 개별 업체 매핑 정보가 포함되어 있지 않습니다.{' '}
              <strong>[전체 업체 재서칭]</strong>을 실행하시면 업체별 네이버 메뉴 바로가기 목록이 자동 저장됩니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {matchedPartners.map((p, idx) => {
                const combinedQuery = buildRegionCompanyQuery(p.companyName, p.address);
                const naverMenuUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(
                  `${combinedQuery} 메뉴`
                )}`;

                return (
                  <a
                    key={p.id || `${p.companyName}-${idx}`}
                    href={naverMenuUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all flex items-center justify-between gap-2"
                    title={`${combinedQuery} 네이버 메뉴 새 탭에서 열기`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 truncate">
                        {p.companyName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {p.address || '소재지 정보 없음'}
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                      <BookOpen className="w-3 h-3" />
                      네이버 메뉴
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}