"""Research projects and their members."""

import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    Date,
    ForeignKey,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin, db_enum
from app.models.enums import ProjectStatus


class Project(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "projects"
    __table_args__ = (
        CheckConstraint("end_date IS NULL OR end_date > start_date", name="end_after_start"),
        CheckConstraint("budget IS NULL OR budget >= 0", name="budget_non_negative"),
    )

    title: Mapped[str] = mapped_column(String(300), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    funding_agency: Mapped[str | None] = mapped_column(String(255))
    budget: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[ProjectStatus] = mapped_column(
        db_enum(ProjectStatus, "project_status"),
        nullable=False,
        index=True,
        default=ProjectStatus.PLANNED,
        server_default=ProjectStatus.PLANNED.value,
    )
    institution_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("institutions.id", ondelete="SET NULL"), nullable=True, index=True
    )

    institution: Mapped["Institution | None"] = relationship(  # noqa: F821
        back_populates="projects"
    )
    member_links: Mapped[list["ProjectMember"]] = relationship(
        back_populates="project", cascade="all, delete-orphan", passive_deletes=True
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Project {self.title[:60]!r} ({self.status.value})>"


class ProjectMember(Base, TimestampMixin):
    __tablename__ = "project_members"
    __table_args__ = (
        CheckConstraint("end_date IS NULL OR end_date > start_date", name="end_after_start"),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True
    )
    researcher_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("researchers.id", ondelete="RESTRICT"), primary_key=True
    )
    role: Mapped[str | None] = mapped_column(String(100))
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date)

    project: Mapped["Project"] = relationship(back_populates="member_links")
    researcher: Mapped["Researcher"] = relationship(  # noqa: F821
        back_populates="project_links"
    )
