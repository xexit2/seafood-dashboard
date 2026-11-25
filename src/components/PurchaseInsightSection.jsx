import React, { useMemo } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Package,
  Fish,
  CheckCircle2,
  AlertTriangle,
} from './Icons';

const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num);

export default function PurchaseInsightSection({
  speciesData = {},
  topIngredientsState = {},
  partnersCount = 0,
  selectedSpecies,
  onSelectSpecies,
}) {
  const topItems = Array.isArray(topIngredientsState?.items)
    ? topIngredientsState.items
    : [];

  // 위판장 시세 데이터와 판매처 TOP 5 수요 데이터를 교차 분석하여 매입 인사이트 산출
  const insights = useMemo(() => {
    const speciesKeys = Object.keys(speciesData || {});
    const demandMap = {};
    topItems.forEach((item) => {
      demandMap[String(item.name || '').trim()] = {
        rank: item.rank,
        count: Number(item.count) || 0,
        share: item.share || '0',
      };
    });

    const allNames = Array.from(new Set([...speciesKeys, ...Object.keys(demandMap)]));

    return allNames
      .map((name) => {
        const sp = speciesData[name] || null;
        const demand = demandMap[name] || null;
        const currentAvg = sp ? Number(sp.currentAvg || 0) : 0;
        const hasValidPrice = Boolean(sp && currentAvg > 0);
        const diffRate = hasValidPrice ? Number(sp.prevDiffRate || 0) : 0;
        const unit = sp?.unit || '원/kg';

        let signalType = 'neutral';
        let badgeLabel = '시세 미수신 (0원)';
        let strategyTitle = '공식 위판 데이터 미수신';
        let strategyDesc =
          '최근 영업일 기준 수신된 위판 시세가 없습니다. 상단 [시세 실시간 갱신] 또는 수동 시세 입력 후 전략을 확인하세요.';
        let score = 5;

        if (hasValidPrice && demand) {
          if (diffRate <= -0.5) {
            signalType = 'buy_strong';
            badgeLabel = '적극 매입 추천 (마진 확대)';
            strategyTitle = `산지 시세 ${Math.abs(diffRate)}% 하락 · 판매처 수요 ${demand.rank}위(${demand.count}개사)`;
            strategyDesc = `거래처 수요는 탄탄한 반면 산지 위판가가 내려 매입 적기입니다. 선도 우수 물량 중심으로 선제 확보를 권장합니다.`;
            score = 100 + demand.count * 5 + Math.abs(diffRate) * 3;
          } else if (diffRate >= 2.0) {
            signalType = 'pre_secure';
            badgeLabel = '선제 물량 확보 (시세 상승세)';
            strategyTitle = `산지 시세 +${diffRate}% 강세 · 판매처 핵심 원재료(${demand.count}개사)`;
            strategyDesc = `판매처 주력 품목이나 산지 낙찰가가 오르고 있습니다. 추가 상승 전 고정 거래처 배정 물량을 우선 확보하세요.`;
            score = 85 + demand.count * 4 + diffRate * 2;
          } else {
            signalType = 'steady_buy';
            badgeLabel = '안정 매입 추천 (수요 견조)';
            strategyTitle = `판매처 TOP ${demand.rank}위(${demand.share}%) · 산지 시세 안정권`;
            strategyDesc = `시세 변동 폭이 크지 않고 거래처 소비가 꾸준한 핵심 어종입니다. 정기 출고 물량에 맞춰 안정적으로 매입하세요.`;
            score = 75 + demand.count * 3;
          }
        } else if (demand && !hasValidPrice) {
          signalType = 'demand_only';
          badgeLabel = `판매처 수요 TOP ${demand.rank}위`;
          strategyTitle = `등록 거래처 ${demand.count}개사(${demand.share}%) 주력 사용 원재료`;
          strategyDesc = sp
            ? `판매처 주력 원재료이나 현재 산지 위판 시세(0원)가 수신되지 않았습니다. 위판 시세 확인 후 매입 단가를 산정하세요.`
            : `거래처 메뉴에서 수요가 확인된 원재료입니다. 상단 위판 시세 검색창에 '${name}'을 추가하면 산지 시세와 함께 추적할 수 있습니다.`;
          score = 60 + demand.count * 3;
        } else if (hasValidPrice && !demand) {
          if (diffRate <= -1.5) {
            signalType = 'price_dip';
            badgeLabel = '산지 저점 매수 기회';
            strategyTitle = `산지 위판가 전일 대비 ${diffRate}% 하락`;
            strategyDesc = `산지 입항 물량 증가로 경락가가 낮아졌습니다. 단가 경쟁력을 앞세워 거래처 특가 프로모션 제안을 검토해 보세요.`;
            score = 50 + Math.abs(diffRate) * 2;
          } else if (diffRate >= 2.0) {
            signalType = 'price_surge';
            badgeLabel = '산지 시세 급등 주의';
            strategyTitle = `산지 위판가 전일 대비 +${diffRate}% 상승`;
            strategyDesc = `산지 출하량 감소로 낙찰가가 오르고 있습니다. 무리한 대량 매입보다 확정 주문량 위주 분할 매입이 유리합니다.`;
            score = 40 + diffRate;
          } else {
            signalType = 'neutral';
            badgeLabel = '시세 보합 유지';
            strategyTitle = `산지 평균 ${formatNumber(currentAvg)} ${unit} (${diffRate >= 0 ? `+${diffRate}%` : `${diffRate}%`})`;
            strategyDesc = `전일 대비 큰 변동 없이 안정적인 위판 흐름을 보이고 있습니다.`;
            score = 20;
          }
        }

        return {
          name,
          sp,
          demand,
          hasValidPrice,
          diffRate,
          currentAvg,
          unit,
          signalType,
          badgeLabel,
          strategyTitle,
          strategyDesc,
          score,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [speciesData, topItems]);

  const topPick = insights[0] || null;
  const highDemandCount = topItems.length;
  const priceDropCount = Object.values(speciesData || {}).filter(
    (s) => Number(s?.currentAvg || 0) > 0 && Number(s?.prevDiffRate || 0) < 0
  ).length;

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-600 to-indigo-700 text-white flex items-center justify-center shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              매입 추천 · 트렌드 인사이트
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
              산지 위판 시세 × 판매처 TOP 5 수요 교차 분석
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            공식 산지 위판장 시세 등락률과 등록 거래처의 주력 원재료 수요를 자동 비교해 오늘의 우선 매입 어종과 유통 전략을 제안합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            시세 하락 어종 {priceDropCount}개
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-200">
            수요 핵심 원재료 {highDemandCount}개
          </span>
        </div>
      </div>

      {/* 상단 핵심 추천 배너 */}
      {topPick && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-sky-50 via-indigo-50/50 to-emerald-50/60 border border-sky-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-600 text-white">
                <Sparkles className="w-3 h-3" />
                오늘의 최우선 매입 포커스
              </span>
              <span className="text-base font-extrabold text-slate-900">{topPick.name}</span>
              <span className="text-xs font-bold text-sky-800 bg-white px-2.5 py-0.5 rounded-full border border-sky-200">
                {topPick.badgeLabel}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-800">{topPick.strategyTitle}</p>
            <p className="text-xs text-slate-600 leading-relaxed">{topPick.strategyDesc}</p>
          </div>

          {topPick.sp && onSelectSpecies && (
            <button
              type="button"
              onClick={() => onSelectSpecies(topPick.name)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shrink-0"
            >
              <Fish className="w-3.5 h-3.5" />
              {topPick.name} 위판장 상세 시세 보기
            </button>
          )}
        </div>
      )}

      {/* 어종별 매입 전략 카드 그리드 */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {insights.map((item) => {
          const isBuyStrong = item.signalType === 'buy_strong';
          const isPreSecure = item.signalType === 'pre_secure';
          const isSteady = item.signalType === 'steady_buy';
          const isSelected = selectedSpecies === item.name;

          const cardStyle = isBuyStrong
            ? 'border-emerald-300 bg-emerald-50/40'
            : isPreSecure
            ? 'border-amber-300 bg-amber-50/40'
            : isSteady
            ? 'border-sky-200 bg-sky-50/30'
            : 'border-slate-200 bg-slate-50/60';

          const badgeStyle = isBuyStrong
            ? 'bg-emerald-600 text-white'
            : isPreSecure
            ? 'bg-amber-500 text-white'
            : isSteady
            ? 'bg-sky-600 text-white'
            : 'bg-slate-200 text-slate-700';

          return (
            <div
              key={item.name}
              onClick={() => {
                if (item.sp && onSelectSpecies) onSelectSpecies(item.name);
              }}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${cardStyle} ${
                item.sp ? 'cursor-pointer hover:shadow-xs' : ''
              } ${isSelected ? 'ring-2 ring-sky-400' : ''}`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-slate-900">{item.name}</span>
                    {item.demand && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Package className="w-3 h-3" />
                        수요 {item.demand.rank}위 ({item.demand.count}개사)
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${badgeStyle}`}>
                    {item.badgeLabel}
                  </span>
                </div>

                {/* 산지 위판 시세 요약 */}
                <div className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded-lg border border-slate-100">
                  <span className="text-slate-500">산지 위판 평균가</span>
                  {item.hasValidPrice ? (
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-slate-900">
                        {formatNumber(item.currentAvg)} {item.unit}
                      </span>
                      <span
                        className={`inline-flex items-center text-[11px] ${
                          item.diffRate > 0
                            ? 'text-rose-600'
                            : item.diffRate < 0
                            ? 'text-blue-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.diffRate > 0 ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : item.diffRate < 0 ? (
                          <ArrowDownRight className="w-3 h-3" />
                        ) : null}
                        {item.diffRate > 0 ? `+${item.diffRate}%` : `${item.diffRate}%`}
                      </span>
                    </div>
                  ) : item.sp ? (
                    <span className="text-[11px] font-semibold text-slate-400">
                      0원 (수신 데이터 없음)
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">위판 탭 미등록 어종</span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{item.strategyDesc}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  {isBuyStrong || isSteady ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  {item.demand
                    ? `전체 ${partnersCount}개사 중 ${item.demand.share}% 점유`
                    : 'TOP 5 서치 실행 시 수요 자동 매칭'}
                </span>
                {item.sp && (
                  <span className="font-semibold text-sky-700">차트 선택 →</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}