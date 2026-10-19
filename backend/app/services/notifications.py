"""Create in-app notifications (committed with the request session)."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


async def create_notification(
    db: AsyncSession, user_id: uuid.UUID | None, message: str
) -> Notification | None:
    if user_id is None:
        return None
    row = Notification(user_id=user_id, message=message)
    db.add(row)
    await db.flush()
    return row
