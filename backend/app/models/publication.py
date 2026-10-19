"""Publications, their authors and citations between them."""

import uuid

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    false,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin, db_enum
from app.models.enums import PublicationStatus, PublicationType


class Publication(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "publications"

    title: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    abstract: Mapped[str | None] = mapped_column(Text)
    type: Mapped[PublicationType] = mapped_column(
        db_enum(PublicationType, "publication_type"), nullable=False, index=True
    )
    status: Mapped[PublicationStatus] = mapped_column(
        db_enum(PublicationStatus, "publication_status"),
        nullable=False,
        index=True,
        default=PublicationStatus.DRAFT,
        server_default=PublicationStatus.DRAFT.value,
    )
    year: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    venue: Mapped[str | None] = mapped_column(String(255))
    doi: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500))
    uploaded_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    author_links: Mapped[list["PublicationAuthor"]] = relationship(
        back_populates="publication",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="PublicationAuthor.author_order",
    )
    citations_made: Mapped[list["Citation"]] = relationship(
        back_populates="citing_publication",
        foreign_keys="Citation.citing_publication_id",
        passive_deletes=True,
    )
    cited_by: Mapped[list["Citation"]] = relationship(
        back_populates="cited_publication",
        foreign_keys="Citation.cited_publication_id",
        passive_deletes=True,
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Publication {self.title[:60]!r} ({self.year})>"


class PublicationAuthor(Base, TimestampMixin):
    __tablename__ = "publication_authors"
    __table_args__ = (
        # Composite PK => no duplicate co-author on the same publication.
        CheckConstraint("author_order >= 1", name="order_positive"),
    )

    publication_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("publications.id", ondelete="CASCADE"), primary_key=True
    )
    researcher_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("researchers.id", ondelete="RESTRICT"), primary_key=True
    )
    author_order: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    is_corresponding: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=false()
    )

    publication: Mapped["Publication"] = relationship(back_populates="author_links")
    researcher: Mapped["Researcher"] = relationship(  # noqa: F821
        back_populates="publication_links"
    )


class Citation(Base, TimestampMixin):
    __tablename__ = "citations"
    __table_args__ = (
        # Composite PK => a citation pair can only be recorded once.
        CheckConstraint(
            "citing_publication_id <> cited_publication_id", name="no_self_citation"
        ),
        Index("ix_citations_cited_publication_id", "cited_publication_id"),
    )

    citing_publication_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("publications.id", ondelete="CASCADE"), primary_key=True
    )
    cited_publication_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("publications.id", ondelete="CASCADE"), primary_key=True
    )

    citing_publication: Mapped["Publication"] = relationship(
        back_populates="citations_made", foreign_keys=[citing_publication_id]
    )
    cited_publication: Mapped["Publication"] = relationship(
        back_populates="cited_by", foreign_keys=[cited_publication_id]
    )
