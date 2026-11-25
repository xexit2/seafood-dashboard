import os
from datetime import datetime
from playwright.sync_api import sync_playwright


class CrawlBlockedError(Exception):
    """사이트 차단, 오류 응답(400/403/500), 캡차 등 감지 시 즉시 중단하기 위한 예외"""
    pass


def crawl_url(url: str, name: str = "", screenshot_dir: str = "screenshots", log_cb=None):
    """
    지정된 URL에 Playwright로 접속하여 테이블/텍스트 정보를 추출합니다.
    - HTTP 400 이상 오류 또는 봇 차단(WAF/캡차) 감지 시 즉시 접속을 중단하고 예외를 발생시킵니다.
    """
    def log(msg):
        if log_cb:
            log_cb(msg)
        else:
            print(msg)

    os.makedirs(screenshot_dir, exist_ok=True)
    rows = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800},
        )
        page = context.new_page()

        try:
            log(f"[{name or url}] 접속 시도 중...")
            response = page.goto(url, wait_until="domcontentloaded", timeout=20000)

            if response is None:
                raise CrawlBlockedError(f"응답이 없습니다: {url}")

            status = response.status
            if status >= 400:
                raise CrawlBlockedError(
                    f"HTTP {status} 오류 발생 ({url}) - 사이트 접속을 즉시 중단합니다."
                )

            page.wait_for_timeout(2000)
            body_text = page.inner_text("body") if page.locator("body").count() > 0 else ""

            # 봇 차단 / 캡차 / 에러 페이지 감지
            block_keywords = ["400 Bad Request", "403 Forbidden", "Access Denied", "Cloudflare", "로봇이 아닙니다", "captcha"]
            for kw in block_keywords:
                if kw.lower() in body_text.lower():
                    raise CrawlBlockedError(
                        f"봇 차단 또는 오류 페이지 감지 ('{kw}') - 사이트 접속을 즉시 중단합니다."
                    )

            # 스크린샷 저장
            stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_name = "".join(c for c in (name or "site") if c.isalnum() or c in ("_", "-"))
            shot_path = os.path.join(screenshot_dir, f"{safe_name}_{stamp}.png")
            page.screenshot(path=shot_path, full_page=True)
            log(f"[{name or url}] 스크린샷 저장 완료: {shot_path}")

            # 테이블 데이터 추출 (table tr td/th)
            tables = page.locator("table")
            table_count = tables.count()
            if table_count > 0:
                for t_idx in range(table_count):
                    trs = tables.nth(t_idx).locator("tr")
                    tr_count = trs.count()
                    for r_idx in range(tr_count):
                        cells = trs.nth(r_idx).locator("th, td")
                        cell_count = cells.count()
                        row_vals = [cells.nth(c).inner_text().strip().replace("\n", " ") for c in range(cell_count)]
                        if any(row_vals):
                            rows.append(row_vals)
            else:
                # 테이블이 없으면 주요 텍스트 줄 단위 추출
                lines = [ln.strip() for ln in body_text.splitlines() if ln.strip()]
                for ln in lines[:100]:
                    rows.append([ln])

            if not rows:
                raise CrawlBlockedError(
                    f"추출된 데이터가 없습니다 (페이지 구조 변경 가능성) - 접속을 중단합니다."
                )

            log(f"[{name or url}] 데이터 {len(rows)}행 추출 완료")
            return rows

        finally:
            browser.close()
