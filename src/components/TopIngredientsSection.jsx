import React from 'react';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
} from './Icons';

export default function TopIngredientsSection({
  partnersCount,
  topIngredientsState,
  isSearchingTopIngredients,
  searchProgress,
  onRequestSearchConfirm,
  onAbortSearch,
}) {
  const { items = [], updatedAt = '', analyzedCount = 0, omittedCount = 0, lastError = '' } =
    topIngredientsState || {};

  const maxCount = Math.max(1, ...items.map((it) => Number(it.count) || 0));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
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
            등록 거래처의 네이버 메뉴·리뷰에서 음식명이 아닌 <strong>메인 원재료</strong>만 AI 서치해 빈도 TOP 5를 산출합니다. (버튼 클릭 시에만 갱신 · 확인 불가 재료 생략)
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isSearchingTopIngredients && (
            <button
              type="button"
              onClick={onAbortSearch}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              중지
            </button>
          )}
          <button
            type="button"
            onClick={onRequestSearchConfirm}
            disabled={isSearchingTopIngredients || partnersCount === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSearchingTopIngredients ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>
                  서치 중 ({searchProgress.done}/{searchProgress.total})
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>TOP 5 메인재료 서치</span>
              </>
            )}
          </button>
        </div>
      </div>

      {(updatedAt || isSearchingTopIngredients) && (
        <div className="mb-4 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div>
            분석 요약:{' '}
            <strong>전체 {partnersCount}개사</strong> 중{' '}
            <strong className="text-emerald-700">확인 {analyzedCount}개사</strong> · 확인 불가{' '}
            <strong>{omittedCount}개사</strong> 생략
          </div>
          <div className="text-[11px] text-slate-400">
            PC·모바일 클라우드 자동 동기화됨
          </div>
        </div>
      )}

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
                우측 상단 <strong>[TOP 5 메인재료 서치]</strong> 버튼을 누르시면 등록된 거래처의 네이버 메뉴·리뷰를 분석해 원재료 TOP 5를 산출합니다.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {items.map((item, idx) => {
                const pct = Math.min(
                  100,
                  Math.round(((Number(item.count) || 0) / maxCount) * 100)
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
                  </div>
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
            items.map((item) => (
              <div
                key={item.name}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
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
                <div className="text-xs text-slate-500">
                  확인 거래처 <strong>{item.count}개사</strong> 주력 원재료
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}