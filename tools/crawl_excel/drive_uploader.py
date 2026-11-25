import os
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ["https://www.googleapis.com/auth/drive.file"]


def upload_to_drive(filepath: str, credentials_file: str = "credentials.json", token_file: str = "token.json", folder_id: str = ""):
    """
    생성된 엑셀 파일을 Google Drive에 업로드하고 파일 ID 및 공유 링크를 반환합니다.
    """
    if not os.path.exists(credentials_file):
        raise FileNotFoundError(
            f"구글 드라이브 인증 파일('{credentials_file}')이 없습니다. README.md를 참고해 credentials.json을 배치해 주세요."
        )

    creds = None
    if os.path.exists(token_file):
        creds = Credentials.from_authorized_user_file(token_file, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(credentials_file, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(token_file, "w", encoding="utf-8") as token:
            token.write(creds.to_json())

    service = build("drive", "v3", credentials=creds)

    file_metadata = {"name": os.path.basename(filepath)}
    if folder_id:
        file_metadata["parents"] = [folder_id]

    media = MediaFileUpload(
        filepath,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        resumable=True,
    )

    uploaded = (
        service.files()
        .create(body=file_metadata, media_body=media, fields="id, webViewLink")
        .execute()
    )

    return {
        "id": uploaded.get("id"),
        "webViewLink": uploaded.get("webViewLink"),
    }
