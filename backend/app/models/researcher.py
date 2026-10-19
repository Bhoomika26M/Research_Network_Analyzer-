"""Researcher profiles."""

import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin


class Researcher(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "researchers"

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True
    )
    department_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True
    )
    first_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    title: Mapped[str | None] = mapped_column(String(100))
    bio: Mapped[str | None] = mapped_column(Text)
    orcid: Mapped[str | None] = mapped_column(String(19), unique=True, nullable=True)

    user: Mapped["User | None"] = relationship(back_populates="researcher")  # noqa: F821
    department: Mapped["Department | None"] = relationship(  # noqa: F821
        back_populates="researchers"
    )
    skills: Mapped[list["ResearcherSkill"]] = relationship(
        back_populates="researcher", cascade="all, delete-orphan", passive_deletes=True
    )
    interests: Mapped[list["ResearcherInterest"]] = relationship(
        back_populates="researcher", cascade="all, delete-orphan", passive_deletes=True
    )
    affiliations: Mapped[list["ResearcherAffiliation"]] = relationship(
        back_populates="researcher", cascade="all, delete-orphan", passive_deletes=True
    )
    publication_links: Mapped[list["PublicationAuthor"]] = relationship(  # noqa: F821
        back_populates="researcher", passive_deletes=True
    )
    project_links: Mapped[list["ProjectMember"]] = relationship(  # noqa: F821
        back_populates="researcher", passive_deletes=True
    )
    conference_links: Mapped[list["ConferenceParticipation"]] = relationship(  # noqa: F821
        back_populates="researcher", passive_deletes=True
    )

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Researcher {self.full_name}>"


class ResearcherSkill(Base, TimestampMixin):
    """A skill tag on a researcher profile (composite PK => no duplicates)."""

    __tablename__ = "researcher_skills"

    researcher_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("researchers.id", ondelete="CASCADE"), primary_key=True
    )
    name: Mapped[str] = mapped_column(String(255), primary_key=True)

    researcher: Mapped["Researcher"] = relationship(back_populates="skills")

    def __repr__(self) -> str:  # pragma: no cover
        return f"<ResearcherSkill {self.name}>"


class ResearcherInterest(Base, TimestampMixin):
    """A research-interest tag on a researcher profile (composite PK => no duplicates)."""

    __tablename__ = "research_interests"

    researcher_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("researchers.id", ondelete="CASCADE"), primary_key=True
    )
    name: Mapped[str] = mapped_column(String(255), primary_key=True)

    researcher: Mapped["Researcher"] = relationship(back_populates="interests")

    def __repr__(self) -> str:  # pragma: no cover
        return f"<ResearcherInterest {self.name}>"


class ResearcherAffiliation(Base, TimestampMixin):
    """An institution a researcher profile is affiliated with."""

    __tablename__ = "researcher_affiliations"

    researcher_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("researchers.id", ondelete="CASCADE"), primary_key=True
    )
    institution_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("institutions.id", ondelete="CASCADE"), primary_key=True, index=True
    )

    researcher: Mapped["Researcher"] = relationship(back_populates="affiliations")
    institution: Mapped["Institution"] = relationship()  # noqa: F821

    def __repr__(self) -> str:  # pragma: no cover
        return f"<ResearcherAffiliation {self.researcher_id}/{self.institution_id}>"
