"""Peer-review assignments and their decisions."""

import uuid

from sqlalchemy import ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin, db_enum
from app.models.enums import ReviewStatus


class Review(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "reviews"
    __table_args__ = (
        # A reviewer is only ever assigned once per publication.
        UniqueConstraint("publication_id", "reviewer_id", name="uq_reviews_publication_reviewer"),
    )

    publication_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("publications.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reviewer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[ReviewStatus] = mapped_column(
        db_enum(ReviewStatus, "review_status"),
        nullable=False,
        index=True,
        default=ReviewStatus.PENDING,
        server_default=ReviewStatus.PENDING.value,
    )
    comments: Mapped[str | None] = mapped_column(Text)

    publication: Mapped["Publication"] = relationship()  # noqa: F821
    reviewer: Mapped["User"] = relationship()  # noqa: F821

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Review {self.status.value} publication={self.publication_id}>"
