import React from 'react';
import {
  Sparkles,
  X,
  AlertTriangle,
  Database,
  ExternalLink,
  Loader2,
  RefreshCw,
  RotateCcw,
  FileSpreadsheet,
  Upload,
  Instagram,
} from './Icons';

export default function Modals({
  activeModal,
  setActiveModal,
  partnersCount,
  supabaseConfig,
  supabaseForm,
  setSupabaseForm,
  diagResults,
  isRunningDiag,
  onRunConnectionDiagnostics,
  onSaveSupabaseConfig,
  onClearAllPartners,
  onRunTopIngredientsSearch,
  fileInputRef,
  excelFileName,
  excelPreviewRows,
  setExcelPreviewRows,
  setExcelFileName,
  onExcelFileChange,
  onConfirmExcelImport,
  speciesData,
  newPartnerForm,
  setNewPartnerForm,
  onAddPartner,
  newAuctionForm,
  setNewAuctionForm,
  onAddAuction,
}) {
  if (!activeModal) return null;

  return (
    <>
      {/* 모달 1: TOP 5 메인재료 AI 서치 실행 확인창 */}
      {activeModal === 'confirmTopIngredients' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">
                  TOP 5 메인재료 AI 서치 실행 확인
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                등록된 전체 거래처의 네이버 메뉴·리뷰를 검색하여 <strong>메인 원재료 TOP 5</strong>를 집계합니다. 정말 실행하시겠습니까?
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">대상 거래처 수</span>
                  <strong className="text-slate-900">{partnersCount}개사</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">배치 실행 계획</span>
                  <strong className="text-slate-900">
                    5개사씩 묶음 · 총 {Math.ceil(partnersCount / 5)}회 API 호출
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">예상 리소스 · 비용</span>
                  <strong className="text-sky-700">무료 할당량 내 0원 / 유료 시 약 200~600원</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  실행 시 <strong>Gemini API 토큰 및 Google Search 그라운딩 할당량</strong>이 소모됩니다. (진행 중 언제든 [중지] 버튼으로 중단 가능)
                </span>
              </div>

              {!supabaseConfig.geminiKey && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    현재 Gemini API 키가 설정되어 있지 않습니다.
                  </div>
                  <p className="text-[11px]">
                    실제 홈페이지(Vercel)에서는 API 키가 없으면 검색이 차단됩니다. 먼저 키를 입력해 주세요.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveModal('cloud')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 text-[11px] font-bold cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5" />
                    동기화 · AI키 설정 열기
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  onRunTopIngredientsSearch();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs cursor-pointer"
              >
                확인 · 서치 시작
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모달 2: PC·모바일 실시간 동기화 및 AI 검색 키 설정 */}
      {activeModal === 'cloud' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">
                  PC·모바일 실시간 동기화 및 AI 검색 키 설정
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSaveSupabaseConfig} className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    Google Gemini API Key (실제 홈페이지 AI 시세·메뉴 서칭용)
                  </label>
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:underline shrink-0"
                  >
                    무료 키 10초 발급받기
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="text"
                  placeholder="AQ. 로 시작하는 Google AI Studio API 키 붙여넣기"
                  value={supabaseForm.geminiKey}
                  onChange={(e) =>
                    setSupabaseForm({ ...supabaseForm, geminiKey: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
                <p className="text-[11px] text-sky-800 leading-relaxed">
                  * 구글 최신 <strong>AQ. 인증 키</strong>(x-goog-api-key 헤더 방식)를 공식 지원합니다. 키 입력 후 아래 <strong>[연결 테스트 실행]</strong>으로 즉시 정상 여부를 확인하세요.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <div className="text-xs font-bold text-slate-800">
                  Supabase 클라우드 DB 연결 (PC · 스마트폰 실시간 공유)
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://xxxxx.supabase.co"
                    value={supabaseForm.url}
                    onChange={(e) => setSupabaseForm({ ...supabaseForm, url: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Supabase Anon Public Key
                  </label>
                  <input
                    type="text"
                    placeholder="eyJhbGciOiJIUzI1NiIs..."
                    value={supabaseForm.anonKey}
                    onChange={(e) =>
                      setSupabaseForm({ ...supabaseForm, anonKey: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-800">
                    자체 연결 진단 테스트 (실제 서버 응답 확인)
                  </span>
                  <button
                    type="button"
                    onClick={onRunConnectionDiagnostics}
                    disabled={isRunningDiag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {isRunningDiag ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    {isRunningDiag ? '진단 중...' : '연결 테스트 실행'}
                  </button>
                </div>

                {diagResults && (
                  <div className="space-y-1.5 pt-1 border-t border-slate-200">
                    {[
                      { label: '1. Supabase 읽기 (public)', res: diagResults.sbRead },
                      { label: '2. Supabase 쓰기 (public)', res: diagResults.sbWrite },
                      { label: '3. Gemini AI 키', res: diagResults.gemini },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className={`p-2 rounded-lg border text-[11px] ${
                          row.res.ok
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-rose-50 border-rose-200 text-rose-900'
                        }`}
                      >
                        <div className="font-bold flex items-center justify-between">
                          <span>{row.label}</span>
                          <span>{row.res.ok ? '✅ 성공' : '❌ 실패'}</span>
                        </div>
                        <div className="mt-0.5 break-all opacity-90 font-mono text-[10px]">
                          {row.res.detail}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="font-bold text-slate-800 pt-1">
                  Supabase SQL Editor 1회 실행 코드 (반드시 Run without RLS 클릭):
                </div>
                <pre className="bg-slate-900 text-emerald-300 p-2 rounded-lg overflow-x-auto text-[10px]">
{`create table if not exists public.seafood_state (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz default now()
);
alter table public.seafood_state disable row level security;
grant all on table public.seafood_state to anon, authenticated;
NOTIFY pgrst, 'reload schema';`}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClearAllPartners}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 rounded-lg cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  등록 업체 전체 비우기
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    닫기
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer"
                  >
                    저장 및 즉시 동기화
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 모달 3: 엑셀 파일 일괄 추가 */}
      {activeModal === 'excel' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  거래업체(발주처) 엑셀 파일 일괄 추가
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setExcelPreviewRows([]);
                  setExcelFileName('');
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 text-center space-y-2">
              <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="text-xs font-semibold text-slate-800">
                엑셀 파일(.xlsx, .xls, .csv)을 선택해 주세요
              </div>
              <p className="text-[11px] text-slate-500">
                열 구성: <strong>[A열: 순서] · [B열: 업체명] · [C열: 대표자] · [D열: 전화번호] · [E열: 주소]</strong>
                <br />
                기존에 등록된 업체명과 중복되는 행은 자동으로 제외되고 신규 업체만 추가됩니다.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={onExcelFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                {excelFileName ? `선택됨: ${excelFileName}` : 'PC에서 엑셀 파일 선택'}
              </button>
            </div>

            {excelPreviewRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    미리보기 (총 {excelPreviewRows.length}개 행 인식됨)
                  </span>
                  <span className="text-emerald-700 font-semibold">상위 5건 표시</span>
                </div>
                <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="py-2 px-2.5">업체명</th>
                        <th className="py-2 px-2.5">대표자</th>
                        <th className="py-2 px-2.5">전화번호</th>
                        <th className="py-2 px-2.5">주소</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {excelPreviewRows.slice(0, 5).map((r, i) => (
                        <tr key={i}>
                          <td className="py-1.5 px-2.5 font-bold text-slate-800">{r.companyName}</td>
                          <td className="py-1.5 px-2.5 text-slate-600">{r.ceoName}</td>
                          <td className="py-1.5 px-2.5 text-slate-600">{r.phone}</td>
                          <td className="py-1.5 px-2.5 text-slate-500 truncate max-w-[180px]">
                            {r.address}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setExcelPreviewRows([]);
                  setExcelFileName('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                disabled={excelPreviewRows.length === 0}
                onClick={onConfirmExcelImport}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg disabled:opacity-40 cursor-pointer"
              >
                {excelPreviewRows.length > 0
                  ? `${excelPreviewRows.length}건 거래업체 일괄 추가`
                  : '파일을 먼저 선택하세요'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모달 4: 신규 거래업체 개별 등록 */}
      {activeModal === 'partner' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                신규 거래업체(발주처) 개별 등록
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onAddPartner} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">업체명 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 부산수산유통"
                  value={newPartnerForm.companyName}
                  onChange={(e) =>
                    setNewPartnerForm({ ...newPartnerForm, companyName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-pink-50/50 border border-pink-100 space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  SNS 및 블로그 채널 연동 (선택)
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      인스타그램 계정 ID
                    </label>
                    <input
                      type="text"
                      placeholder="@account_id"
                      value={newPartnerForm.snsHandle}
                      onChange={(e) =>
                        setNewPartnerForm({ ...newPartnerForm, snsHandle: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      네이버 블로그/스토어 URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://blog.naver.com/..."
                      value={newPartnerForm.blogUrl}
                      onChange={(e) =>
                        setNewPartnerForm({ ...newPartnerForm, blogUrl: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    주력 어종 *
                  </label>
                  <select
                    value={newPartnerForm.category}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, category: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {Object.keys(speciesData).map((sp) => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    거래 상태
                  </label>
                  <select
                    value={newPartnerForm.status}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, status: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="활발">활발</option>
                    <option value="보통">보통</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  주요 판매 상품 / 메뉴 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 선망 참고등어 (대/10kg) · 회무침"
                  value={newPartnerForm.mainProduct}
                  onChange={(e) =>
                    setNewPartnerForm({ ...newPartnerForm, mainProduct: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    공급 단가 (원) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="39000"
                    value={newPartnerForm.unitPrice}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, unitPrice: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    주간 출고량
                  </label>
                  <input
                    type="number"
                    placeholder="500"
                    value={newPartnerForm.totalVolume}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, totalVolume: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    대표자 / 담당자
                  </label>
                  <input
                    type="text"
                    placeholder="홍길동 대표"
                    value={newPartnerForm.manager}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, manager: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">연락처</label>
                  <input
                    type="text"
                    placeholder="010-1234-5678"
                    value={newPartnerForm.phone}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  소재지 주소
                </label>
                <input
                  type="text"
                  placeholder="예: 부산시 서구 충무대로 202"
                  value={newPartnerForm.address}
                  onChange={(e) =>
                    setNewPartnerForm({ ...newPartnerForm, address: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer"
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 모달 5: 오늘의 위판장 시세 등록 */}
      {activeModal === 'auction' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">오늘의 위판장 시세 등록</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onAddAuction} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  어종 선택 *
                </label>
                <select
                  value={newAuctionForm.species}
                  onChange={(e) =>
                    setNewAuctionForm({ ...newAuctionForm, species: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {Object.keys(speciesData).map((sp) => (
                    <option key={sp} value={sp}>
                      {sp} ({speciesData[sp].unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  위판장명 *
                </label>
                <input
                  type="text"
                  required
                  value={newAuctionForm.market}
                  onChange={(e) =>
                    setNewAuctionForm({ ...newAuctionForm, market: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    당일 평균 낙찰가 (원) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="25000"
                    value={newAuctionForm.price}
                    onChange={(e) =>
                      setNewAuctionForm({ ...newAuctionForm, price: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    위판 물량
                  </label>
                  <input
                    type="text"
                    placeholder="예: 820 kg"
                    value={newAuctionForm.volume}
                    onChange={(e) =>
                      setNewAuctionForm({ ...newAuctionForm, volume: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  시세 동향
                </label>
                <select
                  value={newAuctionForm.status}
                  onChange={(e) =>
                    setNewAuctionForm({ ...newAuctionForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="급등">급등</option>
                  <option value="강세">강세</option>
                  <option value="상승">상승</option>
                  <option value="보합">보합</option>
                  <option value="약세">약세</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer"
                >
                  시세 반영
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}