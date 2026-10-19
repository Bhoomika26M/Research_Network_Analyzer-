"""In-app notifications for the authenticated user."""

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.core.errors import ApiException
from app.models.notification import Notification
from app.schemas.common import Page
from app.schemas.dashboard import NotificationOut
from app.schemas.user import MessageResponse

router = APIRouter(
    prefix="/api/v1/notifications",
    tags=["notifications"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=Page[NotificationOut])
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    unread_only: bool = False,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Page[NotificationOut]:
    stmt = select(Notification).where(Notification.user_id == user.id)
    if unread_only:
        stmt = stmt.where(Notification.is_read.is_(False))
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    items = (
        await db.execute(
            stmt.order_by(Notification.created_at.desc()).offset(skip).limit(limit)
        )
    ).scalars().all()
    return Page[NotificationOut](
        items=[NotificationOut.model_validate(item) for item in items],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/unread-count")
async def unread_count(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> dict[str, int]:
    count = (
        await db.execute(
            select(func.count())
            .select_from(Notification)
            .where(Notification.user_id == user.id, Notification.is_read.is_(False))
        )
    ).scalar_one()
    return {"unread": int(count)}


@router.post("/read-all", response_model=MessageResponse)
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> MessageResponse:
    await db.execute(
        update(Notification)
        .where(Notification.user_id == user.id, Notification.is_read.is_(False))
        .values(is_read=True)
    )
    await db.flush()
    return MessageResponse(message="All notifications marked as read")


@router.post("/{notification_id}/read", response_model=NotificationOut)
async def mark_read(
    notification_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> NotificationOut:
    notification = (
        await db.execute(
            select(Notification).where(
                Notification.id == notification_id, Notification.user_id == user.id
            )
        )
    ).scalar_one_or_none()
    if notification is None:
        raise ApiException(404, "notification_not_found", "Notification not found")
    notification.is_read = True
    await db.flush()
    return NotificationOut.model_validate(notification)
