# SeaSecret 독립 정보 수집기 (Python)

현재 SeaSecret 웹 앱과 **완전히 별개로 동작**하는 수동 실행형 정보 수집 프로그램입니다.

## 주요 기능
- 사용자가 `▶ 실행` 버튼을 눌렀을 때만 동작
- 등록한 URL에 Playwright로 접속해 데이터 추출 및 스크린샷 저장
- **봇 차단(WAF), 캡차, HTTP 400/403/500 오류, 구조 변경 감지 시 즉시 해당 사이트 접속 중단 및 경고 알림**
- 수집 데이터를 `.xlsx` 엑셀 파일로 저장
- Google Drive API를 통해 지정된 폴더에 엑셀 파일 업로드

## 설치 및 실행 방법
```bash
cd f:\SeaSecret\tools\crawl_excel
pip install -r requirements.txt
playwright install chromium
python gui.py
```

## 구글 드라이브 연동 설정
1. Google Cloud Console에서 OAuth 2.0 클라이언트 ID(데스크톱 앱)를 생성하고 `credentials.json`을 이 폴더에 저장합니다.
2. `.env.example`을 복사해 `.env` 파일을 만들고 `GOOGLE_DRIVE_FOLDER_ID`를 입력합니다.
