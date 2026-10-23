from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str] = mapped_column(String(255), default="Associate Professor")
    department: Mapped[str] = mapped_column(String(255), default="Computer Science")
    institution: Mapped[str] = mapped_column(String(255), default="MIT")
    phone: Mapped[str] = mapped_column(String(50), default="+1 617-253-0001")
    biography: Mapped[str] = mapped_column(Text, default="")
    avatar_initials: Mapped[str] = mapped_column(String(10), default="SC")
    role: Mapped[str] = mapped_column(String(50), default="Researcher")
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    two_fa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sessions: Mapped[List["UserSession"]] = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[Optional["NotificationSettings"]] = relationship("NotificationSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    appearance: Mapped[Optional["AppearanceSettings"]] = relationship("AppearanceSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    privacy: Mapped[Optional["PrivacySettings"]] = relationship("PrivacySettings", back_populates="user", uselist=False, cascade="all, delete-orphan")

class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    device: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    time: Mapped[str] = mapped_column(String(100), nullable=False)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="sessions")

class NotificationSettings(Base):
    __tablename__ = "notification_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    email_notifs: Mapped[bool] = mapped_column(Boolean, default=True)
    in_app_notifs: Mapped[bool] = mapped_column(Boolean, default=True)
    pub_alerts: Mapped[bool] = mapped_column(Boolean, default=True)
    proj_alerts: Mapped[bool] = mapped_column(Boolean, default=False)
    conf_reminders: Mapped[bool] = mapped_column(Boolean, default=True)
    citation_alerts: Mapped[bool] = mapped_column(Boolean, default=True)

    user: Mapped["User"] = relationship("User", back_populates="notifications")

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    default_user_role: Mapped[str] = mapped_column(String(50), default="Researcher")
    session_timeout: Mapped[str] = mapped_column(String(20), default="60")
    data_retention: Mapped[str] = mapped_column(String(20), default="365")
    feature_flags: Mapped[list] = mapped_column(JSON, default=lambda: [True, False, False])
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AppearanceSettings(Base):
    __tablename__ = "appearance_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    selected_accent: Mapped[str] = mapped_column(String(20), default="#16324F")
    density: Mapped[str] = mapped_column(String(20), default="comfortable")
    dark_mode: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship("User", back_populates="appearance")

class PrivacySettings(Base):
    __tablename__ = "privacy_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    privacy_toggles: Mapped[list] = mapped_column(JSON, default=lambda: [True, True, False])
    export_requested: Mapped[bool] = mapped_column(Boolean, default=False)
    export_requested_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="privacy")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    timestamp: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    user: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    action: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    target: Mapped[str] = mapped_column(String(500), nullable=False)
    ip: Mapped[str] = mapped_column(String(100), nullable=False)
    result: Mapped[str] = mapped_column(String(50), nullable=False) # 'Success' or 'Failed'
    tab_category: Mapped[str] = mapped_column(String(100), default="User Activity") # 'User Activity', 'Publication History', 'Project Logs', 'Security Logs'

class ComplianceReport(Base):
    __tablename__ = "compliance_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    range: Mapped[str] = mapped_column(String(100), nullable=False)
    by: Mapped[str] = mapped_column(String(255), nullable=False)
    date: Mapped[str] = mapped_column(String(50), nullable=False)
    size: Mapped[str] = mapped_column(String(50), nullable=False)
    csv_content: Mapped[str] = mapped_column(Text, nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
