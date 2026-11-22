import React from 'react';
import {
  RotateCcw,
  Loader2,
  Sparkles,
  Upload,
  Plus,
  Search,
  MapPin,
  Filter,
  Instagram,
  BookOpen,
  X,
  FileSpreadsheet,
  Phone,
  Globe,
  Check,
} from './Icons';
import { buildRegionCompanyQuery, openInstagramSearchInApp } from '../utils/excelParser';

export default function PartnerTableSection({
  partners,
  filteredPartners,
  paginatedPartners,
  searchQuery,
  setSearchQuery,
  regionFilter,
  setRegionFilter,
  categoryFilter,
  setCategoryFilter,
  availableRegions,
  speciesData,
  speciesKeys,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
  searchingPartnerIds,
  isBatchSearching,
  selectedPartnerDetail,
  setSelectedPartnerDetail,
  onClearAllPartners,
  onDeletePartner,
  onBatchSearchCurrentPage,
  onOpenExcelModal,
  onOpenAddPartnerModal,
  onSearchSinglePartnerMenu,
}) {
  const categoryOptions =
    Array.isArray(speciesKeys) && speciesKeys.length > 0
      ? speciesKeys
      : Object.keys(speciesData || {});

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              등록 거래업체(발주처) 통합 관리 및 판매 메뉴·SNS 서칭
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
              총 {filteredPartners.length}개사
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            인스타·네이버·구글 모두 <strong>[제일 큰 소재지 + 업체명]</strong>으로 검색되며, 메뉴 서칭은 네이버 실제 메뉴판 기준으로 정리됩니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {partners.length > 0 && (
            <button
                          onClick={() => onDeletePartner(partner)}
                          title={`${partner.companyName} 삭제`}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          삭제
                        </button>
          )}
          <button
            onClick={onBatchSearchCurrentPage}
            disabled={isBatchSearching || partners.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
          >
            {isBatchSearching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {isBatchSearching ? 'AI 메뉴 일괄 서칭 중...' : '현재 목록 AI 메뉴 일괄 서칭'}
          </button>
          <button
            onClick={onOpenAddPartnerModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            업체 개별 추가
          </button>
          <button
            onClick={onOpenExcelModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            엑셀 일괄 업로드
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="업체명, 대표자, 전화번호, 주소, 5점 리뷰 인기 메뉴 검색..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <select
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-6 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {availableRegions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg === '전체' ? '전체 지역' : reg}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-6 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="전체">전체 품목</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedPartnerDetail && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-sky-50 to-white border border-indigo-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-600 text-white">
                <Sparkles className="w-3 h-3" />
                AI 웹·SNS 서칭 결과
              </span>
              <span className="font-bold text-sm text-slate-900">
                {selectedPartnerDetail.companyName}
              </span>
              <span className="text-xs text-slate-500">({selectedPartnerDetail.address})</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {selectedPartnerDetail.aiSummary}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500 mr-1">
                네이버 5점 리뷰 인기 메뉴:
              </span>
              {selectedPartnerDetail.topReviewMenu && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                  ★ 1위: {selectedPartnerDetail.topReviewMenu}
                </span>
              )}
              {(selectedPartnerDetail.searchedMenus || []).length > 0 ? (
                selectedPartnerDetail.searchedMenus.map((menu, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white text-sky-800 border border-sky-200 shadow-2xs"
                  >
                    {menu}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">
                  자동 추출된 메뉴가 없습니다. 우측 &apos;네이버 메뉴 보기&apos;를 눌러 직접 확인하세요.
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://www.instagram.com/explore/tags/${encodeURIComponent(
                buildRegionCompanyQuery(
                  selectedPartnerDetail.companyName,
                  selectedPartnerDetail.address
                ).replace(/\s+/g, '')
              )}/`}
              onClick={(e) =>
                openInstagramSearchInApp(
                  e,
                  selectedPartnerDetail.companyName,
                  selectedPartnerDetail.address
                )
              }
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-pink-600 text-white hover:bg-pink-700"
            >
              <Instagram className="w-3.5 h-3.5" />
              인스타 앱 검색
            </a>
            <a
              href={`https://search.naver.com/search.naver?query=${encodeURIComponent(
                `${buildRegionCompanyQuery(
                  selectedPartnerDetail.companyName,
                  selectedPartnerDetail.address
                )} 메뉴`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <BookOpen className="w-3.5 h-3.5" />
              네이버 메뉴 보기
            </a>
            <button
              onClick={() => setSelectedPartnerDetail(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
              <th className="py-3 px-3.5">업체명 / 대표·연락처</th>
              <th className="py-3 px-3">소재지 주소</th>
              <th className="py-3 px-3">판매 메뉴 (AI 정리)</th>
              <th className="py-3 px-3">인스타 · 블로그 · 검색 바로가기</th>
              <th className="py-3 px-3.5 text-center">메뉴 서칭 · 삭제</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {paginatedPartners.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-14 text-center">
                  <div className="max-w-sm mx-auto space-y-3">
                    <FileSpreadsheet className="w-9 h-9 text-emerald-600 mx-auto" />
                    <div className="font-bold text-sm text-slate-800">
                      {partners.length === 0
                        ? '현재 등록된 거래업체가 없습니다'
                        : '검색 조건에 일치하는 거래업체가 없습니다'}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {partners.length === 0
                        ? '대표님의 발주처 엑셀 파일(.xlsx, .xls, .csv)을 업로드하거나 개별 추가 버튼으로 거래업체를 등록해 주세요.'
                        : '다른 검색어나 필터를 선택해 보세요.'}
                    </p>
                    {partners.length === 0 && (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={onOpenAddPartnerModal}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          업체 개별 추가
                        </button>
                        <button
                          onClick={onOpenExcelModal}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          엑셀 파일 업로드
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedPartners.map((partner) => {
                const isSearchingThis = Boolean(searchingPartnerIds[partner.id]);
                const combinedQuery = buildRegionCompanyQuery(
                  partner.companyName,
                  partner.address
                );
                const tagKeyword = combinedQuery.replace(/\s+/g, '');
                const instaTagUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(
                  tagKeyword
                )}/`;
                const naverSearchUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(
                  combinedQuery
                )}`;
                const naverMenuSearchUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(
                  `${combinedQuery} 메뉴`
                )}`;
                const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
                  combinedQuery
                )}`;

                return (
                  <tr key={partner.id} className="hover:bg-slate-50/90 transition-colors">
                    <td className="py-3 px-3.5 align-top">
                      <div className="font-bold text-slate-900 text-sm">{partner.companyName}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span>{partner.manager}</span>
                        {partner.phone && (
                          <a
                            href={`tel:${partner.phone}`}
                            className="inline-flex items-center gap-0.5 text-sky-700 font-medium hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            {partner.phone}
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top max-w-[210px]">
                      <div className="text-slate-700 leading-snug">{partner.address}</div>
                      {partner.topReviewMenu ? (
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                          ★ 5점 리뷰 최다: {partner.topReviewMenu}
                        </span>
                      ) : (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-medium">
                          5점 리뷰 메뉴: 서칭 전
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 align-top max-w-[240px]">
                      {partner.isSearched || partner.searchedMenus?.length > 0 ? (
                        partner.searchedMenus?.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {partner.searchedMenus.map((m, idx) => (
                                <span
                                  key={idx}
                                  className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                                    idx === 0
                                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  }`}
                                >
                                  {idx === 0 ? `★ ${m}` : m}
                                </span>
                              ))}
                            </div>
                            {partner.aiSummary && (
                              <p className="text-[11px] text-slate-500 line-clamp-2">
                                {partner.aiSummary}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="text-[11px] font-medium text-slate-600">
                              네이버 자동 추출 메뉴 없음
                            </div>
                            <a
                              href={naverMenuSearchUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline"
                            >
                              네이버 메뉴판 직접 열기 →
                            </a>
                          </div>
                        )
                      ) : (
                        <div>
                          <div className="font-medium text-slate-500">{partner.mainProduct}</div>
                          <span className="text-[11px] text-slate-400">
                            우측 &apos;메뉴 서칭&apos; 클릭 시 네이버 5점 리뷰 인기 메뉴 정리
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 align-top">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <a
                          href={instaTagUrl}
                          onClick={(e) =>
                            openInstagramSearchInApp(e, partner.companyName, partner.address)
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100 transition-colors"
                        >
                          <Instagram className="w-3 h-3" />
                          인스타
                        </a>

                        <a
                          href={naverSearchUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                        >
                          <BookOpen className="w-3 h-3" />
                          네이버
                        </a>

                        <a
                          href={googleSearchUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          <Globe className="w-3 h-3" />
                          구글
                        </a>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        검색어: <strong className="text-slate-600">{combinedQuery}</strong>
                      </div>
                    </td>

                    <td className="py-3 px-3.5 align-top text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onSearchSinglePartnerMenu(partner)}
                          disabled={isSearchingThis}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                            partner.isSearched
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-sky-600 text-white hover:bg-sky-700 shadow-2xs'
                          }`}
                        >
                          {isSearchingThis ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              서칭중
                            </>
                          ) : partner.isSearched ? (
                            <>
                              <Check className="w-3 h-3" />
                              재서칭
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              메뉴 서칭
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => onDeletePartner(partner)}
                          title={`${partner.companyName} 삭제`}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-xs text-slate-500">
        <div>
          전체 <strong>{filteredPartners.length}</strong>개 업체 중{' '}
          <strong>
            {filteredPartners.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
          </strong>
          –
          <strong>{Math.min(currentPage * itemsPerPage, filteredPartners.length)}</strong>번 표시
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`w-7 h-7 rounded-lg font-semibold cursor-pointer ${
                currentPage === pageNum
                  ? 'bg-sky-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {pageNum}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}