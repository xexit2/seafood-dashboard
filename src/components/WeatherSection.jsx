import React from 'react';
import {
  Waves,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Thermometer,
  Wind,
  Compass,
  ExternalLink,
} from './Icons';

export default function WeatherSection({
  weatherMap,
  selectedSea,
  setSelectedSea,
  windyOverlay,
  setWindyOverlay,
}) {
  const currentWeather =
    weatherMap[selectedSea] || Object.values(weatherMap)[0];

  const windyEmbedUrl = `https://embed.windy.com/embed2.html?lat=${currentWeather.lat}&lon=${currentWeather.lon}&detailLat=${currentWeather.lat}&detailLon=${currentWeather.lon}&width=650&height=450&zoom=${currentWeather.zoom}&level=surface&overlay=${windyOverlay}&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=m%2Fs&metricTemp=%C2%B0C&radarRange=-1`;

  return (
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

        <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl">
          {Object.values(weatherMap).map((sea) => (
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
        <div className="lg:col-span-7 relative bg-slate-900 min-h-[300px] sm:min-h-[340px] border-b lg:border-b-0 lg:border-r border-slate-200">
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

        <div className="lg:col-span-5 p-5 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-sky-600">
                  선택 해역 브리핑
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {currentWeather.name}
                </h3>
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
  );
}