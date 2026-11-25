import json
import os
import threading
import tkinter as tk
from tkinter import messagebox, scrolledtext
from dotenv import load_dotenv

from crawler import crawl_url, CrawlBlockedError
from excel_writer import save_to_excel
from drive_uploader import upload_to_drive

load_dotenv()

URLS_FILE = "urls.json"


def load_urls():
    if not os.path.exists(URLS_FILE):
        return []
    with open(URLS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_urls(urls):
    with open(URLS_FILE, "w", encoding="utf-8") as f:
        json.dump(urls, f, ensure_ascii=False, indent=2)


class CrawlerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("SeaSecret 독립 정보 수집기 (수동 실행)")
        self.root.geometry("680x560")

        # URL 입력 영역
        frame_add = tk.Frame(root, padx=10, pady=8)
        frame_add.pack(fill=tk.X)

        tk.Label(frame_add, text="사이트명:").grid(row=0, column=0, sticky="w")
        self.entry_name = tk.Entry(frame_add, width=18)
        self.entry_name.grid(row=0, column=1, padx=4)

        tk.Label(frame_add, text="URL:").grid(row=0, column=2, sticky="w")
        self.entry_url = tk.Entry(frame_add, width=38)
        self.entry_url.grid(row=0, column=3, padx=4)

        tk.Button(frame_add, text="추가", command=self.add_url, bg="#0284C7", fg="white").grid(row=0, column=4, padx=4)

        # 등록된 URL 목록
        frame_list = tk.Frame(root, padx=10, pady=4)
        frame_list.pack(fill=tk.BOTH, expand=False)

        tk.Label(frame_list, text="등록된 접속 주소 목록 (실행 버튼 클릭 시에만 작동):").pack(anchor="w")
        self.listbox = tk.Listbox(frame_list, height=6)
        self.listbox.pack(fill=tk.X, pady=4)

        tk.Button(frame_list, text="선택 주소 삭제", command=self.delete_url).pack(anchor="e")

        # 실행 버튼
        frame_run = tk.Frame(root, padx=10, pady=8)
        frame_run.pack(fill=tk.X)

        self.btn_run = tk.Button(
            frame_run,
            text="▶ 실행 (수집 → 엑셀 생성 → 구글 드라이브 업로드)",
            command=self.start_run,
            bg="#059669",
            fg="white",
            font=("맑은 고딕", 10, "bold"),
            height=2,
        )
        self.btn_run.pack(fill=tk.X)

        # 로그 출력
        frame_log = tk.Frame(root, padx=10, pady=6)
        frame_log.pack(fill=tk.BOTH, expand=True)

        tk.Label(frame_log, text="실행 로그:").pack(anchor="w")
        self.log_box = scrolledtext.ScrolledText(frame_log, height=12, state="disabled")
        self.log_box.pack(fill=tk.BOTH, expand=True)

        self.urls = load_urls()
        self.refresh_listbox()

    def log(self, msg):
        def _append():
            self.log_box.configure(state="normal")
            self.log_box.insert(tk.END, msg + "\n")
            self.log_box.see(tk.END)
            self.log_box.configure(state="disabled")
        self.root.after(0, _append)

    def refresh_listbox(self):
        self.listbox.delete(0, tk.END)
        for item in self.urls:
            self.listbox.insert(tk.END, f"[{item.get('name', '')}] {item.get('url', '')}")

    def add_url(self):
        name = self.entry_name.get().strip()
        url = self.entry_url.get().strip()
        if not url.startswith("http"):
            messagebox.showwarning("입력 오류", "올바른 URL(http:// 또는 https://)을 입력해 주세요.")
            return
        self.urls.append({"name": name or "사이트", "url": url})
        save_urls(self.urls)
        self.refresh_listbox()
        self.entry_name.delete(0, tk.END)
        self.entry_url.delete(0, tk.END)

    def delete_url(self):
        sel = self.listbox.curselection()
        if not sel:
            return
        idx = sel[0]
        self.urls.pop(idx)
        save_urls(self.urls)
        self.refresh_listbox()

    def start_run(self):
        if not self.urls:
            messagebox.showwarning("목록 비어있음", "접속할 URL을 먼저 추가해 주세요.")
            return
        self.btn_run.configure(state="disabled", text="수집 중...")
        threading.Thread(target=self._run_worker, daemon=True).start()

    def _run_worker(self):
        site_results = {}
        try:
            for item in self.urls:
                name = item.get("name", "사이트")
                url = item.get("url", "")
                try:
                    rows = crawl_url(url, name=name, log_cb=self.log)
                    site_results[name] = rows
                except CrawlBlockedError as e:
                    self.log(f"❌ [중단] {e}")
                    self.root.after(0, lambda err=str(e): messagebox.showerror("접속 중단 (차단/오류)", err))
                    return
                except Exception as e:
                    self.log(f"❌ [오류] {name}: {e}")
                    self.root.after(0, lambda err=str(e): messagebox.showerror("오류 발생", err))
                    return

            excel_path = save_to_excel(site_results)
            self.log(f"✅ 엑셀 파일 생성 완료: {excel_path}")

            creds_file = os.getenv("GOOGLE_CREDENTIALS_FILE", "credentials.json")
            token_file = os.getenv("GOOGLE_TOKEN_FILE", "token.json")
            folder_id = os.getenv("GOOGLE_DRIVE_FOLDER_ID", "")

            if os.path.exists(creds_file):
                self.log("☁️ 구글 드라이브 업로드 중...")
                res = upload_to_drive(excel_path, creds_file, token_file, folder_id)
                self.log(f"✅ 구글 드라이브 업로드 완료! 링크: {res.get('webViewLink')}")
                self.root.after(0, lambda: messagebox.showinfo("완료", f"엑셀 생성 및 구글 드라이브 업로드 완료!\n파일: {excel_path}"))
            else:
                self.log("ℹ️ credentials.json이 없어 로컬 엑셀 파일만 저장되었습니다.")
                self.root.after(0, lambda: messagebox.showinfo("로컬 저장 완료", f"엑셀 파일이 저장되었습니다:\n{excel_path}\n(구글 드라이브 업로드를 위해 credentials.json을 설정하세요.)"))
        finally:
            self.root.after(0, lambda: self.btn_run.configure(state="normal", text="▶ 실행 (수집 → 엑셀 생성 → 구글 드라이브 업로드)"))


if __name__ == "__main__":
    root = tk.Tk()
    app = CrawlerApp(root)
    root.mainloop()
