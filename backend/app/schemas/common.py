"""Generic paginated response envelope shared by the content routes."""

from pydantic import BaseModel


class Page[T](BaseModel):
    items: list[T]
    total: int
    skip: int
    limit: int
