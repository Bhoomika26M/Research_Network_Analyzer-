"""Conferences and researcher participations."""

import uuid
from datetime import date

from sqlalchemy import CheckConstraint, Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Conference(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "conferences"
    __table_args__ = (
        CheckConstraint("end_date IS NULL OR end_date >= start_date", name="end_after_start"),
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    location: Mapped[str | None] = mapped_column(String(255))
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date)
    website: Mapped[str | None] = mapped_column(String(255))
    submission_deadline: Mapped[date | None] = mapped_column(Date)
    topics: Mapped[str | None] = mapped_column(Text)

    participation_links: Mapped[list["ConferenceParticipation"]] = relationship(
        back_populates="conference", cascade="all, delete-orphan", passive_deletes=True
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Conference {self.name!r} ({self.start_date})>"


class ConferenceParticipation(Base, TimestampMixin):
    __tablename__ = "conference_participations"

    conference_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("conferences.id", ondelete="CASCADE"), primary_key=True
    )
    researcher_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("researchers.id", ondelete="RESTRICT"), primary_key=True
    )
    publication_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("publications.id", ondelete="SET NULL"), nullable=True, index=True
    )
    presentation_type: Mapped[str | None] = mapped_column(String(50))
    registration_status: Mapped[str | None] = mapped_column(String(50))

    conference: Mapped["Conference"] = relationship(back_populates="participation_links")
    researcher: Mapped["Researcher"] = relationship(  # noqa: F821
        back_populates="conference_links"
    )
    publication: Mapped["Publication | None"] = relationship()  # noqa: F821
