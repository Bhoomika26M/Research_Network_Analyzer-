from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

# ==================== Audit Logs Schemas ====================
class AuditLogBase(BaseModel):
    timestamp: Optional[str] = None
    user: str
    action: str
    target: str
    ip: str
    result: str = "Success"
    tab_category: Optional[str] = "User Activity"

class AuditLogCreate(AuditLogBase):
    pass

class AuditLogRead(AuditLogBase):
    id: int

    class Config:
        from_attributes = True

class ComplianceReportBase(BaseModel):
    name: str
    range: str
    by: str
    date: str
    size: str
    filename: str

class ComplianceReportCreate(ComplianceReportBase):
    csv_content: str

class ComplianceReportRead(ComplianceReportBase):
    id: int
    csv_content: str

    class Config:
        from_attributes = True

class ComplianceReportGenerateRequest(BaseModel):
    name: str
    range: str
    by: str
    filename: Optional[str] = None

# ==================== Settings Schemas ====================
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    title: Optional[str] = None
    department: Optional[str] = None
    institution: Optional[str] = None
    phone: Optional[str] = None
    biography: Optional[str] = None

class ProfileRead(BaseModel):
    id: int
    email: str
    full_name: str
    title: str
    department: str
    institution: str
    phone: str
    biography: str
    avatar_initials: str
    role: str
    two_fa_enabled: bool

    class Config:
        from_attributes = True

class NotificationSettingsUpdate(BaseModel):
    email_notifs: bool
    in_app_notifs: bool
    pub_alerts: bool
    proj_alerts: bool
    conf_reminders: bool
    citation_alerts: bool

class NotificationSettingsRead(NotificationSettingsUpdate):
    id: int

    class Config:
        from_attributes = True

class SessionRead(BaseModel):
    id: int
    device: str
    location: str
    time: str
    current: bool

    class Config:
        from_attributes = True

class SecurityOverviewRead(BaseModel):
    two_fa_enabled: bool
    sessions: List[SessionRead]

class TwoFaUpdate(BaseModel):
    enabled: bool

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class SystemSettingsUpdate(BaseModel):
    default_user_role: str
    session_timeout: str
    data_retention: str
    feature_flags: List[bool]

class SystemSettingsRead(SystemSettingsUpdate):
    id: int

    class Config:
        from_attributes = True

class AppearanceSettingsUpdate(BaseModel):
    selected_accent: str
    density: str
    dark_mode: Optional[bool] = None

class AppearanceSettingsRead(BaseModel):
    selected_accent: str
    density: str
    dark_mode: bool

    class Config:
        from_attributes = True

class PrivacySettingsUpdate(BaseModel):
    privacy_toggles: List[bool]

class PrivacySettingsRead(BaseModel):
    privacy_toggles: List[bool]
    export_requested: bool

    class Config:
        from_attributes = True

# ==================== Auth Schemas ====================
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: ProfileRead

class RoleSwitchRequest(BaseModel):
    role: str
