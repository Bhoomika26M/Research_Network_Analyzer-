# Import all SQLAlchemy models here for Alembic migrations
from src.db.session import Base  # noqa
from src.models.user import User  # noqa
from src.models.publication import Publication  # noqa
from src.models.project import Project  # noqa
from src.models.conference import Conference  # noqa
from src.models.citation import Citation  # noqa
from src.models.audit import AuditLog  # noqa
from src.models.team import Team  # noqa
from src.models.task import ProjectTask  # noqa
from src.models.assignment import Assignment  # noqa
from src.models.link import PublicationLink  # noqa
