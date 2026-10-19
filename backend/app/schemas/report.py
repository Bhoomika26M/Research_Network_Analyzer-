"""Schemas for the /api/v1/reports endpoints."""

from typing import Any

from pydantic import BaseModel


class ReportEnvelope(BaseModel):
    """A tabular report: column order plus one dict of values per row."""

    report: str
    count: int
    columns: list[str]
    rows: list[dict[str, Any]]
