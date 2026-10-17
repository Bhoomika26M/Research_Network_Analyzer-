import asyncio
from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.database import Base
from app.config import settings
from app.models import (
    User, UserSession, NotificationSettings, SystemSettings,
    AppearanceSettings, PrivacySettings, AuditLog, ComplianceReport
)
from app.auth import get_password_hash

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def seed():
    print("Connecting to PostgreSQL and syncing tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if user already exists
        from sqlalchemy import select
        res = await session.execute(select(User).where(User.email == "schen@mit.edu"))
        existing_user = res.scalar_one_or_none()

        if not existing_user:
            print("Creating default user (Dr. Sarah Chen)...")
            user = User(
                email="schen@mit.edu",
                full_name="Dr. Sarah Chen",
                title="Associate Professor",
                department="Computer Science",
                institution="MIT",
                phone="+1 617-253-0001",
                biography="Specializes in large-scale machine learning systems and natural language processing with a focus on fairness and interpretability.",
                avatar_initials="SC",
                role="System Admin",
                hashed_password=get_password_hash("password123"),
                two_fa_enabled=False
            )
            session.add(user)
            await session.flush()

            # Active sessions
            sessions = [
                UserSession(user_id=user.id, device="MacBook Pro • Chrome 126", location="Cambridge, MA", time="Now (current)", is_current=True),
                UserSession(user_id=user.id, device="iPhone 15 • Safari", location="Cambridge, MA", time="2 days ago", is_current=False),
                UserSession(user_id=user.id, device="Windows PC • Firefox", location="Boston, MA", time="5 days ago", is_current=False),
            ]
            session.add_all(sessions)

            # Notifications
            notifs = NotificationSettings(
                user_id=user.id,
                email_notifs=True,
                in_app_notifs=True,
                pub_alerts=True,
                proj_alerts=False,
                conf_reminders=True,
                citation_alerts=True
            )
            session.add(notifs)

            # Appearance
            app_cfg = AppearanceSettings(
                user_id=user.id,
                selected_accent="#16324F",
                density="comfortable",
                dark_mode=False
            )
            session.add(app_cfg)

            # Privacy
            priv_cfg = PrivacySettings(
                user_id=user.id,
                privacy_toggles=[True, True, False],
                export_requested=False
            )
            session.add(priv_cfg)
        else:
            print("Default user already exists.")
            user = existing_user

        # System settings
        res = await session.execute(select(SystemSettings))
        if not res.scalars().first():
            print("Seeding system configuration...")
            sys_cfg = SystemSettings(
                default_user_role="Researcher",
                session_timeout="60",
                data_retention="365",
                feature_flags=[True, False, False]
            )
            session.add(sys_cfg)

        # Audit Logs from mock.ts
        res = await session.execute(select(AuditLog))
        if not res.scalars().first():
            print("Seeding initial 10 Audit Logs...")
            initial_logs = [
                AuditLog(timestamp="2024-07-28 09:14:32", user="Dr. Sarah Chen", action="Publication Created", target="Federated Learning with DP...", ip="18.212.44.91", result="Success", tab_category="Publication History"),
                AuditLog(timestamp="2024-07-28 09:02:11", user="admin@scna.edu", action="User Role Updated", target="Dr. Marcus Webb → Institution Admin", ip="10.0.1.5", result="Success", tab_category="User Activity"),
                AuditLog(timestamp="2024-07-27 16:45:00", user="Prof. James Okafor", action="Report Exported", target="Publication Report Q2 2024", ip="171.66.3.22", result="Success", tab_category="User Activity"),
                AuditLog(timestamp="2024-07-27 14:22:55", user="unknown@external.com", action="Login Attempt", target="Auth endpoint", ip="45.33.32.156", result="Failed", tab_category="Security Logs"),
                AuditLog(timestamp="2024-07-27 11:08:17", user="Dr. Elena Vasquez", action="Publication Status Updated", target="Quantum Error Correction... → Published", ip="131.215.55.10", result="Success", tab_category="Publication History"),
                AuditLog(timestamp="2024-07-26 17:33:44", user="Prof. Aisha Nkosi", action="Researcher Profile Updated", target="Dr. Hana Müller → Skills", ip="128.135.11.2", result="Success", tab_category="User Activity"),
                AuditLog(timestamp="2024-07-26 15:01:29", user="system", action="DOI Batch Resolution", target="14 publications resolved", ip="internal", result="Success", tab_category="User Activity"),
                AuditLog(timestamp="2024-07-26 09:45:12", user="admin@scna.edu", action="Institution Added", target="Max Planck Institute", ip="10.0.1.5", result="Success", tab_category="User Activity"),
                AuditLog(timestamp="2024-07-25 22:11:08", user="bot@scraper.net", action="Login Attempt", target="Auth endpoint", ip="198.51.100.22", result="Failed", tab_category="Security Logs"),
                AuditLog(timestamp="2024-07-25 14:30:00", user="Dr. Raj Patel", action="Data Export", target="Researcher Directory CSV", ip="128.2.210.42", result="Success", tab_category="User Activity"),
            ]
            session.add_all(initial_logs)

        # Compliance Reports
        res = await session.execute(select(ComplianceReport))
        if not res.scalars().first():
            print("Seeding Compliance Reports...")
            reports = [
                ComplianceReport(
                    name="HIPAA / FERPA Access Log Q2 2024",
                    range="Apr 1 - Jun 30, 2024",
                    by="admin@scna.edu",
                    date="2024-07-01",
                    size="24.8 KB",
                    csv_content="Timestamp,User,Action,Target,IP,Result\r\n2024-06-30 23:59:00,admin@scna.edu,Access Check,All Systems,10.0.1.5,Success",
                    filename="hipaa_ferpa_access_q2_2024.csv"
                ),
                ComplianceReport(
                    name="Quarterly User Activity Audit - Q1 2024",
                    range="Jan 1 - Mar 31, 2024",
                    by="admin@scna.edu",
                    date="2024-04-01",
                    size="88.2 KB",
                    csv_content="Timestamp,User,Action,Target,IP,Result\r\n2024-03-31 12:00:00,system,Quarterly Check,User DB,internal,Success",
                    filename="user_activity_q1_2024.csv"
                ),
                ComplianceReport(
                    name="System Security & Failed Auth Report",
                    range="Last 90 Days",
                    by="security-bot@scna.edu",
                    date="2024-07-15",
                    size="12.1 KB",
                    csv_content="Timestamp,User,Action,Target,IP,Result\r\n2024-07-15 00:00:00,bot@scraper.net,Failed Login,Auth,198.51.100.22,Failed",
                    filename="security_failed_auth_90d.csv"
                ),
            ]
            session.add_all(reports)

        await session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
