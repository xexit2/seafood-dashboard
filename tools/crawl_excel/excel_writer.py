import os
from datetime import datetime
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment


def save_to_excel(site_results: dict, output_dir: str = "output") -> str:
    """
    수집된 사이트별 데이터를 하나의 .xlsx 파일로 저장합니다.
    site_results: { "사이트명": [[col1, col2, ...], ...], ... }
    """
    os.makedirs(output_dir, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = os.path.join(output_dir, f"수산시장_수집정보_{stamp}.xlsx")

    wb = Workbook()
    # 기본 시트 제거 준비
    default_ws = wb.active

    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="0284C7", end_color="0284C7", fill_type="solid")

    created_sheets = 0
    for site_name, rows in site_results.items():
        if not rows:
            continue
        safe_title = "".join(c for c in site_name if c not in r'[]:*?/\\')[:31] or "Sheet"
        ws = wb.create_sheet(title=safe_title)
        created_sheets += 1

        for r_idx, row in enumerate(rows, start=1):
            ws.append(row)
            if r_idx == 1:
                for col_idx in range(1, len(row) + 1):
                    cell = ws.cell(row=1, column=col_idx)
                    cell.font = header_font
                    cell.fill = header_fill
                    cell.alignment = Alignment(horizontal="center")

    if created_sheets > 0:
        wb.remove(default_ws)
    else:
        default_ws.title = "수집결과"
        default_ws.append(["수집된 데이터가 없습니다."])

    wb.save(filepath)
    return filepath
