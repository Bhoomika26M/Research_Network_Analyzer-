"""In-app notifications for users."""

import uuid

from sqlalchemy import Boolean, ForeignKey, Text, false
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Notification(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "notifications"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=false(), index=True
    )

    user: Mapped["User"] = relationship(back_populates="notifications")  # noqa: F821

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Notification to user={self.user_id} read={self.is_read}>"
