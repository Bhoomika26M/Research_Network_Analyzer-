"""All ORM models. Importing this package registers the full metadata."""

from app.models.audit_log import AuditLog
from app.models.collaboration import InstitutionalCollaboration
from app.models.conference import Conference, ConferenceParticipation
from app.models.enums import (
    AuditCategory,
    ProjectStatus,
    PublicationStatus,
    PublicationType,
    ReviewStatus,
    UserRole,
)
from app.models.institution import Department, Institution
from app.models.notification import Notification
from app.models.project import Project, ProjectMember
from app.models.publication import Citation, Publication, PublicationAuthor
from app.models.researcher import (
    Researcher,
    ResearcherAffiliation,
    ResearcherInterest,
    ResearcherSkill,
)
from app.models.review import Review
from app.models.user import User

__all__ = [
    "AuditCategory",
    "AuditLog",
    "Citation",
    "Conference",
    "ConferenceParticipation",
    "Department",
    "Institution",
    "InstitutionalCollaboration",
    "Notification",
    "Project",
    "ProjectMember",
    "ProjectStatus",
    "Publication",
    "PublicationAuthor",
    "PublicationStatus",
    "PublicationType",
    "Researcher",
    "Review",
    "ReviewStatus",
    "ResearcherAffiliation",
    "ResearcherInterest",
    "ResearcherSkill",
    "User",
    "UserRole",
]
