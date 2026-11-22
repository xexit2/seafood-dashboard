import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Upload, X, Globe, CheckCircle2 } from './Icons';

export default function PdfViewerModal({ isOpen, onClose, savedPdfLink, onSavePdfLink }) {
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [driveLinkInput, setDriveLinkInput] = useState(savedPdfLink || '');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setDriveLinkInput(savedPdfLink || '');
  }, [savedPdfLink]);

  useEffect(() => {
    const checkMobile = () => {
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      setIsMobile(/Android|iPhone|iPad|iPod/i.test(ua) || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;
    if (pdfUrl && pdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pdfUrl);
    }
    const objectUrl = URL.createObjectURL(file);
    setPdfUrl(objectUrl);
    setPdfName(file.name);
  };

  const handleApplyDriveLink = (e) => {
    e.preventDefault();
    const trimmed = driveLinkInput.trim();
    if (!trimmed) return;
    // 구글 드라이브 공유 링크(/view)를 임베드 미리보기(/preview)로도 변환 지원
    const embedUrl = trimmed.includes('drive.google.com')
      ? trimmed.replace(/\/view(\?.*)?$/, '/preview')
      : trimmed;
    setPdfUrl(embedUrl);
    setPdfName('클라우드 공유 PDF 자료');
    if (onSavePdfLink) onSavePdfLink(trimmed);
  };

  const activeUrl = pdfUrl || (savedPdfLink ? savedPdfLink.replace(/\/view(\?.*)?$/, '/preview') : '');
  const activeTitle = pdfName || (savedPdfLink ? '등록된 클라우드 PDF 자료' : 'PDF 자료실 (단가표 · 명세서 · 안내서)');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* 상단 헤더 바 */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <FileSpreadsheet className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-bold text-sm text-slate-900 truncate">{activeTitle}</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              {isMobile ? '모바일 뷰어 모드' : 'PC 브라우저 뷰어 모드'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>내 기기 PDF 열기</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            {activeUrl && (
              <a
                href={savedPdfLink && !pdfUrl ? savedPdfLink : activeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isMobile ? '폰 전체화면으로 열기' : '새 탭에서 크게 보기'}</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PC·모바일 공용 구글 드라이브 PDF 링크 연결 바 */}
        <form
          onSubmit={handleApplyDriveLink}
          className="px-4 py-2 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs"
        >
          <span className="font-semibold text-slate-600 shrink-0">
            공용 PDF 링크(구글 드라이브 등):
          </span>
          <input
            type="url"
            placeholder="https://drive.google.com/file/d/.../view 링크를 붙여넣으면 PC·모바일에서 함께 열립니다"
            value={driveLinkInput}
            onChange={(e) => setDriveLinkInput(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg cursor-pointer shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            링크 저장·열기
          </button>
        </form>

        {/* 본문 뷰어 영역 (PC: 내장 브라우저 뷰어 / 모바일: 스마트폰 최적화 뷰어 안내 + 전체화면) */}
        <div className="flex-1 bg-slate-200 relative overflow-hidden">
          {activeUrl ? (
            isMobile ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-white space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-base font-bold text-slate-900">{activeTitle}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    스마트폰 환경에서는 아래 버튼을 누르면 <strong>손가락 확대(핀치 줌), 페이지 넘김, 본문 텍스트 검색</strong>이 완벽히 지원되는 모바일 전용 뷰어로 열립니다.
                  </p>
                </div>
                <a
                  href={savedPdfLink && !pdfUrl ? savedPdfLink : activeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md"
                >
                  <Globe className="w-4 h-4" />
                  모바일 PDF 뷰어로 바로 열기
                </a>
              </div>
            ) : (
              <iframe
                src={
                  activeUrl.startsWith('blob:')
                    ? `${activeUrl}#toolbar=1&navpanes=0&scrollbar=1`
                    : activeUrl
                }
                title={activeTitle}
                className="w-full h-full border-0"
              />
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <FileSpreadsheet className="w-12 h-12 text-slate-400" />
              <div className="text-sm font-bold text-slate-700">
                열람할 PDF 자료를 선택하거나 공유 링크를 등록해 주세요
              </div>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                PC에서는 화면 내에서 <strong>페이지 이동·확대·텍스트 검색(Ctrl+F)</strong>이 작동하며, 모바일에서는 스마트폰 기본 PDF 뷰어로 깔끔하게 열립니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}