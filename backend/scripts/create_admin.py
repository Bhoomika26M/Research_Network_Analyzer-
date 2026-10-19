"""Create the first system_admin account interactively.

Usage (from the backend/ directory):

    python scripts/create_admin.py

You type the email, full name and password at the terminal (password is hidden).
"""

import asyncio
import getpass
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.security import hash_password  # noqa: E402
from app.db.session import AsyncSessionLocal  # noqa: E402
from app.models import AuditLog, User  # noqa: E402
from app.models.enums import AuditCategory, UserRole  # noqa: E402
from sqlalchemy import select  # noqa: E402


async def main() -> None:
    email = input("Email: ").strip().lower()
    if "@" not in email or not email.split("@")[0]:
        sys.exit("Invalid email address.")

    full_name = input("Full name: ").strip() or "System Administrator"

    password = getpass.getpass("Password: ")
    confirm = getpass.getpass("Confirm password: ")
    if password != confirm:
        sys.exit("Passwords do not match.")
    if len(password) < 8:
        sys.exit("Password must be at least 8 characters.")

    async with AsyncSessionLocal() as session:
        stmt = select(User).where(User.email == email)
        existing = (await session.execute(stmt)).scalar_one_or_none()
        if existing is not None:
            sys.exit(f"A user with this email already exists (role={existing.role.value}).")

        user = User(
            email=email,
            full_name=full_name,
            hashed_password=hash_password(password),
            role=UserRole.SYSTEM_ADMIN,
            is_active=True,
        )
        session.add(user)
        await session.flush()
        session.add(
            AuditLog(
                user_id=user.id,
                entity_id=user.id,
                action="create_system_admin",
                entity_type="user",
                category=AuditCategory.SECURITY,
                details={"email": email},
            )
        )
        await session.commit()

    print(f"System admin created: {email}")


if __name__ == "__main__":
    asyncio.run(main())
