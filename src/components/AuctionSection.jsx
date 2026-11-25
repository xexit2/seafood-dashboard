import React, { useState } from 'react';
import {
  BarChart3,
  RotateCcw,
  Search,
  Loader2,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  RefreshCw,
  Check,
  X,
} from './Icons';
import { INITIAL_SPECIES_DATA } from '../constants/initialData';

const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(Number(num) || 0);

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
  auctionUpdatedAt,
  isRefreshingAuction,
  onRefreshAuctionNow,
  onUpdateSpeciesMarkets,
}) {
  const safeSpeciesData =
    speciesData && typeof speciesData === 'object' && Object.keys(speciesData).length > 0
      ? speciesData
      : INITIAL_SPECIES_DATA;

  const speciesKeys = Object.keys(safeSpeciesData);
  const currentSpecies =
    safeSpeciesData[selectedSpecies] || safeSpeciesData[speciesKeys[0]];
  const chartData =
    chartPeriod === '7d' ? currentSpecies?.history7d : currentSpecies?.history30d;

  const [isEditingMarkets, setIsEditingMarkets] = useState(false);
  const [draftMarkets, setDraftMarkets] = useState([]);
  const [newMarketName, setNewMarketName] = useState('');

  if (!currentSpecies) return null;

  const currentAvgVal = Number(currentSpecies.currentAvg) || 0;
  const currentDiffRate = Number(currentSpecies.prevDiffRate) || 0;

  const handleStartEditMarkets = () => {
    setDraftMarkets(
      (currentSpecies.markets || []).map((m) => ({ ...m }))
    );
    setNewMarketName('');
    setIsEditingMarkets(true);
  };

  const handleDraftFieldChange = (idx, field, value) => {
    setDraftMarkets((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              [field]:
                field === 'price' || field === 'diff'
                  ? Number(value) || 0
                  : value,
            }
          : item
      )
    );
  };

  const handleAddDraftMarket = () => {
    const trimmed = newMarketName.trim();
    if (!trimmed) return;
    if (draftMarkets.some((m) => m.market === trimmed)) {
      setNewMarketName('');
      return;
    }
    setDraftMarkets((prev) => [
      ...prev,
      {
        market: trimmed,
        price: Number(currentSpecies.currentAvg) || 0,
        diff: 0,
        volume: '집계중',
        status: '보합',
      },
    ]);
    setNewMarketName('');
  };

  const handleRemoveDraftMarket = (idx) => {
    if (draftMarkets.length <= 1) return;
    setDraftMarkets((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveMarkets = () => {
    const valid = draftMarkets.filter((m) => String(m.market || '').trim() !== '');
    if (valid.length === 0) return;
    if (onUpdateSpeciesMarkets) {
      onUpdateSpeciesMarkets(selectedSpecies || speciesKeys[0], valid);
    }
    setIsEditingMarkets(false);
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <BarChart3 className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">
              위판장 판매 어종 및 가격 추이
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
              매일 12:00 자동갱신{auctionUpdatedAt ? ` · 최근 ${auctionUpdatedAt}` : ''}
            </span>
            <button
              type="button"
              onClick={onRefreshAuctionNow}
              disabled={isRefreshingAuction}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 transition-colors cursor-pointer"
              title="지금 즉시 전 어종의 부산·남해 위판장 시세를 실시간 갱신합니다"
            >
              <RefreshCw
                className={`w-3 h-3 ${isRefreshingAuction ? 'animate-spin' : ''}`}
              />
              {isRefreshingAuction ? '시세 갱신중...' : '시세 실시간 갱신'}
            </button>
            <button
              type="button"
              onClick={onResetSpeciesToDefault}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-500 hover:text-sky-700 bg-slate-100 hover:bg-sky-50 border border-slate-200 transition-colors cursor-pointer"
              title="부산·남해 위판장 기준 기본 4종(삼치·금태·고등어·전갱이)으로 초기화"
            >
              <RotateCcw className="w-3 h-3" />
              기본 4종 초기화
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            부산 인근·남해 위판장(부산공동어시장·통영·여수·삼천포 등) 시세를 매일 낮 12시에 자동 갱신하며, 우측 위판장 목록도 직접 편집할 수 있습니다.
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
            {speciesKeys.map((sp) => {
              const spPrice = Number(safeSpeciesData[sp]?.currentAvg) || 0;
              const rate = Number(safeSpeciesData[sp]?.prevDiffRate) || 0;
              const isSelected = selectedSpecies === sp;
              return (
                <button
                  key={sp}
                  onClick={() => {
                    setSelectedSpecies && setSelectedSpecies(sp);
                    setIsEditingMarkets(false);
                  }}
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
                        : spPrice <= 0
                        ? 'text-slate-400'
                        : rate >= 0
                        ? 'text-rose-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {spPrice <= 0
                      ? '미수신'
                      : rate >= 0
                      ? `▲${rate}%`
                      : `▼${Math.abs(rate)}%`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        <div className="lg:col-span-6 flex flex-col justify-between bg-slate-50/70 rounded-xl p-4 border border-slate-100">
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
                <span
                  className={`text-2xl font-extrabold ${
                    currentAvgVal > 0 ? 'text-sky-700' : 'text-slate-400'
                  }`}
                >
                  {formatNumber(currentAvgVal)}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {currentSpecies.unit}
                </span>
                {currentAvgVal <= 0 ? (
                  <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    수신 데이터 없음
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                      currentDiffRate >= 0
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {currentDiffRate >= 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                    )}
                    {Math.abs(currentDiffRate)}%
                  </span>
                )}
              </div>
            </div>

            <div className="inline-flex rounded-lg bg-slate-200/70 p-0.5">
              <button
                onClick={() => setChartPeriod && setChartPeriod('7d')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  chartPeriod === '7d'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                최근 7일
              </button>
              <button
                onClick={() => setChartPeriod && setChartPeriod('30d')}
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

          <div className="h-52 sm:h-64 w-full bg-white rounded-xl border border-slate-100 p-2 sm:p-3 flex flex-col justify-between">
            {(() => {
              const pts = Array.isArray(chartData) ? chartData : [];
              const prices = pts.map((d) => Number(d?.price) || 0);
              const hasAnyPositivePrice = prices.some((p) => p > 0);
              const minVal = prices.length ? Math.min(...prices) : 0;
              const maxVal = hasAnyPositivePrice ? Math.max(...prices) : 1000;
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
                  padT + plotH - (((Number(d?.price) || 0) - yMin) / range) * plotH;
                return { x, y, date: d?.date || '', price: Number(d?.price) || 0 };
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
                  preserveAspectRatio="xMidYMid meet"
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

        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  부산 인근 · 남해 위판장별 당일 낙찰 시세
                </h3>
                <span className="text-[11px] text-slate-400">
                  단위: {currentSpecies.unit}
                </span>
              </div>

              {!isEditingMarkets ? (
                <button
                  type="button"
                  onClick={handleStartEditMarkets}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer"
                >
                  위판장 목록·시세 수정
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsEditingMarkets(false)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMarkets}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    저장 반영
                  </button>
                </div>
              )}
            </div>

            {!isEditingMarkets ? (
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
                    {(currentSpecies.markets || []).map((m, idx) => {
                      const mPrice = Number(m?.price) || 0;
                      const mDiff = Number(m?.diff) || 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3.5">
                            <div className="font-semibold text-slate-800">{m.market}</div>
                            <div className="text-[11px] text-slate-400">
                              {mPrice > 0 ? `물량 ${m.volume}` : m.volume || '데이터 없음'}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900">
                            {mPrice > 0 ? `${formatNumber(mPrice)}원` : '0원'}
                          </td>
                          <td
                            className={`py-3 px-3 text-right font-semibold ${
                              mPrice <= 0
                                ? 'text-slate-400'
                                : mDiff >= 0
                                ? 'text-rose-600'
                                : 'text-blue-600'
                            }`}
                          >
                            {mPrice <= 0
                              ? '-'
                              : mDiff >= 0
                              ? `+${formatNumber(mDiff)}`
                              : formatNumber(mDiff)}
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                mPrice <= 0 || m.status === '미집계'
                                  ? 'bg-slate-100 text-slate-400'
                                  : m.status === '급등' || m.status === '강세'
                                  ? 'bg-rose-50 text-rose-700'
                                  : m.status === '상승'
                                  ? 'bg-amber-50 text-amber-700'
                                  : m.status === '보합'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {mPrice <= 0 ? '미집계' : m.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-2.5 p-3 rounded-xl bg-slate-50 border border-sky-200">
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {draftMarkets.map((m, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-1.5 items-center bg-white p-2 rounded-lg border border-slate-200 text-xs"
                    >
                      <input
                        type="text"
                        value={m.market}
                        onChange={(e) =>
                          handleDraftFieldChange(idx, 'market', e.target.value)
                        }
                        placeholder="위판장명"
                        className="col-span-4 px-2 py-1 border border-slate-200 rounded font-semibold text-slate-800"
                      />
                      <input
                        type="number"
                        value={m.price}
                        onChange={(e) =>
                          handleDraftFieldChange(idx, 'price', e.target.value)
                        }
                        placeholder="시세(원)"
                        className="col-span-3 px-2 py-1 border border-slate-200 rounded text-right font-bold"
                      />
                      <input
                        type="text"
                        value={m.volume}
                        onChange={(e) =>
                          handleDraftFieldChange(idx, 'volume', e.target.value)
                        }
                        placeholder="물량"
                        className="col-span-2 px-2 py-1 border border-slate-200 rounded text-center text-[11px]"
                      />
                      <select
                        value={m.status}
                        onChange={(e) =>
                          handleDraftFieldChange(idx, 'status', e.target.value)
                        }
                        className="col-span-2 px-1 py-1 border border-slate-200 rounded text-[11px]"
                      >
                        <option value="급등">급등</option>
                        <option value="강세">강세</option>
                        <option value="상승">상승</option>
                        <option value="보합">보합</option>
                        <option value="약세">약세</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveDraftMarket(idx)}
                        disabled={draftMarkets.length <= 1}
                        title="위판장 삭제"
                        className="col-span-1 flex justify-center text-rose-500 hover:text-rose-700 disabled:opacity-30 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200">
                  <input
                    type="text"
                    value={newMarketName}
                    onChange={(e) => setNewMarketName(e.target.value)}
                    placeholder="새 위판장 추가 (예: 거제수협, 기장수협, 남해군수협)"
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddDraftMarket}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    위판장 추가
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">
              <strong>갱신 안내:</strong> 매일 <strong>낮 12:00(정오)</strong>에 부산·남해권 위판장 시세가 자동 갱신되며, 수신된 공식 위판 데이터가 없는 어종·위판장은 실제 가격과 혼동되지 않도록 <strong>0원(미집계)</strong>으로 표시됩니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}