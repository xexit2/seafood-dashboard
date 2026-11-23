import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Upload,
  X,
  Globe,
  Loader2,
  RotateCcw,
} from './Icons';
import {
  PDF_MAX_STORAGE_BYTES,
  DRIVE_PDF_FOLDER_NAME,
  fetchDrivePdfList,
  uploadPdfToGoogleDrive,
  deleteDrivePdfFile,
} from '../utils/apiService';

function formatBytesToMb(bytes) {
  return `${(Number(bytes || 0) / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PdfViewerModal({ isOpen, onClose, driveWebhookUrl, onNotify }) {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [totalBytes, setTotalBytes] = useState(0);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      setIsMobile(/Android|iPhone|iPad|iPod/i.test(ua) || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadPdfFiles = async () => {
    if (!driveWebhookUrl) {
      setStatusError('상단 [동기화 · API키 설정]에서 구글 드라이브 웹훅 URL을 먼저 확인해 주세요.');
      return;
    }
    setIsLoadingList(true);
    setStatusError('');
    const res = await fetchDrivePdfList(driveWebhookUrl, DRIVE_PDF_FOLDER_NAME);
    setIsLoadingList(false);

    if (!res.ok) {
      setStatusError(res.error);
      return;
    }
    setPdfFiles(res.files);
    setTotalBytes(res.totalBytes);
    if (res.files.length > 0 && !selectedPdf) {
      setSelectedPdf(res.files[0]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPdfFiles();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const usagePercent = Math.min(100, (totalBytes / PDF_MAX_STORAGE_BYTES) * 100);

  const handleUploadPdf = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setStatusError('PDF(.pdf) 파일만 업로드할 수 있습니다.');
      return;
    }

    setIsUploading(true);
    setStatusError('');
    const res = await uploadPdfToGoogleDrive(
      driveWebhookUrl,
      file,
      totalBytes,
      DRIVE_PDF_FOLDER_NAME
    );
    setIsUploading(false);

    if (!res.ok) {
      setStatusError(res.error);
      return;
    }

    setPdfFiles(res.files);
    setTotalBytes(res.totalBytes);
    if (res.files.length > 0) {
      setSelectedPdf(res.files[0]);
    }
    if (onNotify) {
      onNotify(`'${file.name}' PDF가 구글 드라이브(${DRIVE_PDF_FOLDER_NAME})에 저장되었습니다!`);
    }
  };

  const handleDeletePdf = async (item) => {
    if (!item?.id) return;
    const ok = window.confirm(`'${item.name}' 파일을 구글 드라이브 자료실에서 삭제하시겠습니까?`);
    if (!ok) return;

    setIsLoadingList(true);
    const res = await deleteDrivePdfFile(driveWebhookUrl, item.id, DRIVE_PDF_FOLDER_NAME);
    setIsLoadingList(false);

    if (!res.ok) {
      setStatusError(res.error);
      return;
    }
    setPdfFiles(res.files);
    setTotalBytes(res.totalBytes);
    if (selectedPdf?.id === item.id) {
      setSelectedPdf(res.files[0] || null);
    }
    if (onNotify) {
      onNotify(`'${item.name}' 파일이 삭제되어 저장 공간이 확보되었습니다.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5">
      <div className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* 상단 타이틀 및 500MB 용량 한도 바 */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileSpreadsheet className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-sm sm:text-base text-slate-900">
                  구글 드라이브 공용 PDF 자료실 ({DRIVE_PDF_FOLDER_NAME})
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800">
                  PC · 모바일 실시간 공유
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                <span>
                  저장 용량: <strong>{formatBytesToMb(totalBytes)}</strong> / 최대{' '}
                  <strong>500.0 MB</strong> ({usagePercent.toFixed(1)}%)
                </span>
                <div className="w-24 sm:w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      usagePercent > 85 ? 'bg-rose-500' : 'bg-sky-600'
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadPdfFiles}
              disabled={isLoadingList}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
              title="구글 드라이브 폴더 목록 새로고침"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">새로고침</span>
            </button>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-2xs cursor-pointer">
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{isUploading ? '드라이브 업로드 중...' : 'PDF 올리기 (PC·모바일)'}</span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                disabled={isUploading}
                onChange={handleUploadPdf}
                className="hidden"
              />
            </label>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {statusError && (
          <div className="px-4 py-2 bg-rose-50 border-b border-rose-200 text-xs font-semibold text-rose-700">
            ⚠️ {statusError}
          </div>
        )}

        {/* 본문: 좌측(모바일 상단) 파일 목록 + 우측 뷰어 */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* 공용 PDF 목록 사이드바 */}
          <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/70 overflow-y-auto max-h-48 md:max-h-none p-3 space-y-2 shrink-0">
            <div className="text-[11px] font-bold text-slate-500 px-1">
              업로드된 PDF 목록 ({pdfFiles.length}개)
            </div>

            {isLoadingList && pdfFiles.length === 0 ? (
              <div className="py-8 flex items-center justify-center text-xs text-slate-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                불러오는 중...
              </div>
            ) : pdfFiles.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                저장된 PDF가 없습니다. 상단 <strong>[PDF 올리기]</strong> 버튼으로 단가표나 명세서를 올려보세요.
              </div>
            ) : (
              pdfFiles.map((item) => {
                const isSelected = selectedPdf?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPdf(item)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {formatBytesToMb(item.sizeBytes)} · {item.updatedAt}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePdf(item);
                        }}
                        title="파일 삭제"
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 뷰어 영역 (PC: 브라우저 내장 페이지/확대/검색 뷰어, 모바일: 스마트폰 네이티브 뷰어) */}
          <div className="flex-1 bg-slate-200 flex flex-col overflow-hidden">
            {selectedPdf ? (
              isMobile ? (
                <div className="flex-1 bg-white flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
                    <FileSpreadsheet className="w-7 h-7" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h3 className="text-base font-bold text-slate-900 break-all">
                      {selectedPdf.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      용량: {formatBytesToMb(selectedPdf.sizeBytes)} · 등록일: {selectedPdf.updatedAt}
                    </p>
                    <p className="text-xs text-slate-600 pt-2 leading-relaxed">
                      모바일 환경에서는 아래 버튼을 누르면 <strong>손가락 확대(핀치 줌), 페이지 넘김, 본문 텍스트 검색</strong>이 가능한 스마트폰 전용 뷰어로 열립니다.
                    </p>
                  </div>
                  <a
                    href={selectedPdf.viewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md"
                  >
                    <Globe className="w-4 h-4" />
                    모바일 뷰어로 PDF 열기
                  </a>
                </div>
              ) : (
                <>
                  <div className="px-4 py-2 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate">
                      미리보기: {selectedPdf.name} (뷰어 내 확대·페이지 이동·검색 지원)
                    </span>
                    <a
                      href={selectedPdf.viewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg shrink-0"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      새 탭 전체화면
                    </a>
                  </div>
                  <iframe
                    src={selectedPdf.previewUrl}
                    title={selectedPdf.name}
                    className="w-full flex-1 border-0"
                  />
                </>
              )
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
                <FileSpreadsheet className="w-12 h-12 text-slate-400" />
                <div className="text-sm font-bold text-slate-700">
                  목록에서 PDF 파일을 선택하거나 새 파일을 업로드하세요
                </div>
                <p className="text-xs text-slate-500 max-w-md">
                  PC에서 올린 파일은 모바일에서, 모바일에서 올린 파일은 PC에서 즉시 확인할 수 있습니다. (총 한도 500MB)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}