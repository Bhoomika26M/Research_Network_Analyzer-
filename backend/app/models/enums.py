"""Python enums shared between models, schemas and services."""

import enum


class UserRole(enum.StrEnum):
    RESEARCHER = "researcher"
    INSTITUTION_ADMIN = "institution_admin"
    REVIEWER = "reviewer"
    SYSTEM_ADMIN = "system_admin"


class PublicationType(enum.StrEnum):
    JOURNAL = "journal"
    CONFERENCE = "conference"
    BOOK = "book"
    PATENT = "patent"
    TECHNICAL_REPORT = "technical_report"


class PublicationStatus(enum.StrEnum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ReviewStatus(enum.StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CHANGES_REQUESTED = "changes_requested"


class ProjectStatus(enum.StrEnum):
    PLANNED = "planned"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class AuditCategory(enum.StrEnum):
    USER_ACTIVITY = "user_activity"
    PUBLICATION_HISTORY = "publication_history"
    PROJECT_LOG = "project_log"
    SECURITY = "security"
