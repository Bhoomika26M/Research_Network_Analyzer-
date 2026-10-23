"""Role → permission mapping, mirroring frontend/src/permissions/config.ts.

Roles are matched against the canonical strings used by the seed data
(researcher / institution / reviewer / admin); any unrecognized role gets
no permissions and is denied on guarded endpoints.
"""

ROLE_PERMISSIONS: dict[str, set[str]] = {
    "researcher": {
        "publications.create",
        "analytics.exportReports",
        "research.manageProjects",
        "research.createCollaboration",
    },
    "reviewer": {
        "publications.review",
    },
    "institution": {
        "publications.create",
        "publications.approve",
        "publications.archive",
        "analytics.exportReports",
        "analytics.viewAll",
        "research.manageProjects",
        "research.createCollaboration",
    },
    "admin": {
        "publications.create",
        "publications.approve",
        "publications.archive",
        "publications.review",
        "admin.manageUsers",
        "admin.manageInstitutions",
        "admin.assignRoles",
        "analytics.exportReports",
        "analytics.viewAuditLogs",
        "analytics.viewAll",
        "research.manageProjects",
        "research.createCollaboration",
        "system.configuration",
        "system.securitySettings",
        # Platform-level action with no frontend equivalent; admin-only.
        "dois.mint",
    },
}


def has_permission(role: str, permission: str) -> bool:
    """True if the given role holds the permission."""
    return permission in ROLE_PERMISSIONS.get(role, set())


def get_role_permissions(role: str) -> list[str]:
    """All permissions held by a role, sorted for a stable response."""
    return sorted(ROLE_PERMISSIONS.get(role, set()))
