import React from 'react';
import {
  BarChart3,
  RotateCcw,
  Search,
  Loader2,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
} from './Icons';

const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num);

export default function AuctionSection({
  speciesData,
  selectedSpecies,
  setSelectedSpecies,
  chartPeriod,
  setChartPeriod,
  speciesSearchInput,
  setSpeciesSearchInput,
  isSearchingSpecies,
  onSearchAndAddSpecies,
  onResetSpeciesToDefault,
}) {
  const currentSpecies =
    speciesData[selectedSpecies] || Object.values(speciesData)[0];
  const chartData =
    chartPeriod === '7d' ? currentSpecies.history7d : currentSpecies.history30d;

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <BarChart3 className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">
              위판장 판매 어종 및 가격 추이
            </h2>
            <button
              onClick={onResetSpeciesToDefault}
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
          <form onSubmit={onSearchAndAddSpecies} className="flex items-center gap-1.5">
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
  );
}