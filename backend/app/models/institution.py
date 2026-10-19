"""Institutions and their departments."""

import uuid
from decimal import Decimal

from sqlalchemy import Boolean, ForeignKey, Numeric, String, Text, UniqueConstraint, true
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin


class Institution(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "institutions"

    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    country: Mapped[str | None] = mapped_column(String(100))
    city: Mapped[str | None] = mapped_column(String(100))
    website: Mapped[str | None] = mapped_column(String(255))
    type: Mapped[str | None] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=true()
    )

    departments: Mapped[list["Department"]] = relationship(
        back_populates="institution", cascade="all, delete-orphan", passive_deletes=True
    )
    projects: Mapped[list["Project"]] = relationship(  # noqa: F821
        back_populates="institution", passive_deletes=True
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Institution {self.name}>"


class Department(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "departments"
    __table_args__ = (
        # No duplicate department names within the same institution.
        UniqueConstraint("institution_id", "name", name="uq_departments_institution_id_name"),
    )

    institution_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    head_name: Mapped[str | None] = mapped_column(String(255))
    budget: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))

    institution: Mapped["Institution"] = relationship(back_populates="departments")
    researchers: Mapped[list["Researcher"]] = relationship(  # noqa: F821
        back_populates="department"
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Department {self.name}>"
