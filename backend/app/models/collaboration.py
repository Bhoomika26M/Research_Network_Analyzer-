"""Agreements between two institutions."""

import uuid
from datetime import date

from sqlalchemy import CheckConstraint, Date, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin


class InstitutionalCollaboration(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "institutional_collaborations"
    __table_args__ = (
        UniqueConstraint("institution_a_id", "institution_b_id", name="uq_collab_pair"),
        CheckConstraint("institution_a_id <> institution_b_id", name="no_self_institution"),
        CheckConstraint("end_date IS NULL OR end_date >= start_date", name="end_after_start"),
    )

    institution_a_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    institution_b_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(String(100), nullable=False, default="joint_research")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active", index=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date)
    description: Mapped[str | None] = mapped_column(Text)

    institution_a: Mapped["Institution"] = relationship(  # noqa: F821
        foreign_keys=[institution_a_id]
    )
    institution_b: Mapped["Institution"] = relationship(  # noqa: F821
        foreign_keys=[institution_b_id]
    )
