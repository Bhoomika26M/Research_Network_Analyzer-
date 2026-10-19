"""Real report exports.

POST /reports/export generates an actual document (CSV, JSON, or PDF) from
the live database for the requested data type, instead of the previous stub
that only pretended to queue a task. Every export is recorded in the audit
log (category "Export").
"""
from datetime import datetime
import csv
import io
import json
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.api.deps import require_permission
from src.core.audit import record_audit
from src.db.session import get_db
from src.models.citation import Citation
from src.models.project import Project
from src.models.publication import Publication
from src.models.user import User

router = APIRouter()


class ExportRequest(BaseModel):
    format: str = "CSV"  # CSV, PDF, JSON
    data_type: str = "publications"  # publications, researchers, projects, citations


async def _rows_for(db: AsyncSession, data_type: str) -> List[dict]:
    """Load real rows for the requested data type (soft-deleted records excluded)."""
    if data_type == "publications":
        result = await db.execute(select(Publication).where(Publication.is_deleted == False))
        return [
            {
                "Title": p.title,
                "Authors": ", ".join(p.authors or []),
                "Year": p.year,
                "Type": p.type,
                "Status": p.status,
                "Journal": p.journal,
                "Citations": p.citations,
                "DOI": p.doi or "",
            }
            for p in result.scalars().all()
        ]
    if data_type == "researchers":
        result = await db.execute(select(User).where(User.is_deleted == False))
        return [
            {
                "Name": u.name,
                "Email": u.email,
                "Role": u.role,
                "Institution": u.institution,
                "Department": u.department,
                "h-index": u.h_index,
                "Total Citations": u.citations_total,
                "Publications": len(u.publications_ids or []),
            }
            for u in result.scalars().all()
        ]
    if data_type == "projects":
        result = await db.execute(select(Project).where(Project.is_deleted == False))
        return [
            {
                "Title": p.title,
                "PI": p.pi,
                "Status": p.status,
                "Start Date": p.startDate,
                "End Date": p.endDate or "",
                "Members": len(p.members or []),
                "Tags": ", ".join(p.tags or []),
            }
            for p in result.scalars().all()
        ]
    if data_type == "citations":
        result = await db.execute(select(Citation))
        return [
            {
                "Source Publication": c.sourcePubId,
                "Target Publication": c.targetPubId,
                "Year": c.year,
                "Context": c.context,
            }
            for c in result.scalars().all()
        ]
    raise HTTPException(status_code=400, detail=f"Unsupported data type: {data_type}")


def _to_csv(rows: List[dict]) -> str:
    if not rows:
        return "No records found"
    out = io.StringIO()
    writer = csv.DictWriter(out, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)
    return out.getvalue()


def _to_json(rows: List[dict]) -> str:
    return json.dumps(rows, indent=2, ensure_ascii=False)


def _to_pdf(rows: List[dict]) -> bytes:
    """Render a paginated PDF report (latin-1-safe for fpdf core fonts)."""
    from fpdf import FPDF

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "SciCollab Export", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8)
    headers = list(rows[0].keys()) if rows else []

    def safe(value: Any) -> str:
        return str(value).encode("latin-1", "replace").decode("latin-1")

    if not rows:
        pdf.cell(0, 6, "No records found", new_x="LMARGIN", new_y="NEXT")
    for i, row in enumerate(rows, start=1):
        if i % 45 == 1 and i > 1:
            pdf.add_page()
        line = " | ".join(safe(row.get(h, "")) for h in headers)
        pdf.cell(0, 5, f"{i}. {safe(line)}", new_x="LMARGIN", new_y="NEXT")
    return bytes(pdf.output())


@router.post("/export")
async def generate_export(
    request: ExportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("analytics.exportReports")),
) -> Response:
    rows = await _rows_for(db, request.data_type.lower())
    fmt = request.format.upper()
    stamp = datetime.utcnow().strftime("%Y%m%d")
    base_name = request.data_type.lower()

    if fmt == "CSV":
        content: Any = _to_csv(rows)
        media = "text/csv"
    elif fmt == "JSON":
        content = _to_json(rows)
        media = "application/json"
    elif fmt == "PDF":
        content = _to_pdf(rows)
        media = "application/pdf"
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {request.format}")

    await record_audit(
        db,
        actor=current_user.name,
        action=f"exported {base_name} report",
        target=f"{fmt} · {len(rows)} records",
        category="Export",
    )
    await db.commit()

    filename = f"{base_name}-export-{stamp}.{fmt.lower()}"
    return Response(
        content=content,
        media_type=media,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
