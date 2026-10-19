"""Seed demo data (safe to re-run: every row is matched by a natural key first).

Usage, from the ``backend/`` directory:

    python scripts/seed.py

Creates a handful of institutions + departments, ~15 researchers (each with a
login), ~30 publications with co-authors (for the network graph), 5 projects with
members, institutional collaborations, and one demo login per role.
"""

import asyncio
import sys
from datetime import date
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models import (
    Department,
    Institution,
    InstitutionalCollaboration,
    Project,
    ProjectMember,
    Publication,
    PublicationAuthor,
    Researcher,
    User,
)
from app.models.enums import (
    ProjectStatus,
    PublicationStatus,
    PublicationType,
    UserRole,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

SEED_PASSWORD = "Password123!"
DEFAULT_DOI_PREFIX = "10.5555"
DEFAULT_ORCID = "0009-0000-0000-000X"

INSTITUTIONS = [
    ("University of Nova", "Norway", "Oslo"),
    ("Copenhagen Institute of Science", "Denmark", "Copenhagen"),
    ("Heidelberg Research Center", "Germany", "Heidelberg"),
]

DEPARTMENTS = [
    (0, "Computer Science"),
    (0, "Data Science"),
    (1, "Bioinformatics"),
    (1, "Physics"),
    (2, "Materials Science"),
]

RESEARCHERS = [
    ("Ada", "Lovelace", "Professor of Computer Science", 0),
    ("Niels", "Bohr", "Professor of Physics", 3),
    ("Marie", "Curie", "Senior Researcher", 0),
    ("Rosalind", "Franklin", "Head of Bioinformatics", 2),
    ("Alan", "Turing", "Professor of Computer Science", 0),
    ("Grace", "Hopper", "Senior Lecturer", 1),
    ("Katherine", "Johnson", "Research Fellow", 1),
    ("Lise", "Meitner", "Professor of Physics", 3),
    ("Barbara", "McClintock", "Professor of Biology", 2),
    ("Dorothy", "Hodgkin", "Senior Researcher", 4),
    ("Emmy", "Noether", "Professor of Mathematics", 1),
    ("Chien-Shiung", "Wu", "Research Fellow", 3),
    ("Jane", "Goodall", "Senior Researcher", 2),
    ("Tu", "Youyou", "Professor of Pharmacology", 2),
    ("Vera", "Rubin", "Professor of Astronomy", 3),
]

PUBLICATION_TOPICS = [
    "Scalable graph neural networks for citation analysis",
    "A unified framework for async data pipelines",
    "Explainable machine learning in clinical decision support",
    "Co-authorship networks and research impact",
    "Quantum error correction at scale",
    "Reproducible computational notebooks in academia",
    "Cross-institution research collaboration patterns",
    "Deep learning for protein structure prediction",
    "Sparse attention transformers for long documents",
    "Benchmarking scholarly recommendation systems",
    "Federated learning across institutional boundaries",
    "Knowledge graphs for scientific literature",
    "Trustworthy AI in peer review",
    "High-throughput materials screening",
    "Statistical methods for gravitational waves",
    "Open science infrastructure and data sharing",
    "Ontology alignment for biomedical datasets",
    "Temporal dynamics of research funding",
    "Privacy-preserving record linkage in health data",
    "Graph embeddings for interdisciplinary discovery",
    "Automated reproducibility checks for papers",
    "Data-centric evaluation of language models",
    "Energy-aware training of large models",
    "Causal inference in observational studies",
    "Collaborative filtering for grant matching",
    "Robustness of scientific classifiers",
    "Multimodal fusion for microscopy images",
    "Synthetic data generation for rare diseases",
    "Citation-aware document ranking",
    "Ethics and governance of research data",
]

PROJECTS = [
    (
        "Co-Authorship Network Analytics",
        "Mapping collaboration across institutions.",
        "EU Horizon",
        250000,
    ),
    (
        "Trustworthy Medical AI",
        "Explainable models for clinical triage.",
        "National Research Council",
        180000,
    ),
    (
        "Open Science Platform",
        "Federated repositories for reproducible science.",
        "Open Science Fund",
        120000,
    ),
    (
        "Quantum Simulation Toolkit",
        "Software for quantum many-body simulation.",
        "DFG",
        320000,
    ),
    (
        "Materials Discovery Pipeline",
        "High-throughput screening of candidate materials.",
        "Industry Consortium",
        95000,
    ),
]






async def _get_or_create(db: AsyncSession, model, defaults=None, **filters):
    obj = (await db.execute(select(model).filter_by(**filters))).scalar_one_or_none()
    if obj is not None:
        return obj
    obj = model(**filters, **(defaults or {}))
    db.add(obj)
    await db.flush()
    return obj


async def seed() -> None:
    async with AsyncSessionLocal() as db:
        # Institutions + departments
        institutions: list[Institution] = []
        for name, country, city in INSTITUTIONS:
            institutions.append(
                await _get_or_create(
                    db, Institution, {"country": country, "city": city}, name=name
                )
            )
        departments: list[Department] = []
        for inst_idx, dept_name in DEPARTMENTS:
            departments.append(
                await _get_or_create(
                    db,
                    Department,
                    {"description": None},
                    institution_id=institutions[inst_idx].id,
                    name=dept_name,
                )
            )

        # Researchers + a login account each
        password_hash = hash_password(SEED_PASSWORD)
        researchers: list[Researcher] = []
        for index, (first, last, title, dept_idx) in enumerate(RESEARCHERS):
            email = f"{first.lower()}.{last.lower()}@example.edu"
            user = await _get_or_create(
                db,
                User,
                {
                    "hashed_password": password_hash,
                    "role": UserRole.RESEARCHER,
                    "is_active": True,
                },
                email=email,
                full_name=f"{first} {last}",
            )
            researcher = await _get_or_create(
                db,
                Researcher,
                {
                    "title": title,
                    "bio": f"{title} at {DEPARTMENTS[dept_idx][1]}.",
                    "orcid": DEFAULT_ORCID if index == 0 else None,
                },
                user_id=user.id,
                department_id=departments[dept_idx].id,
                first_name=first,
                last_name=last,
            )
            researchers.append(researcher)

        # Publications with co-authors
        types = list(PublicationType)
        publications: list[Publication] = []
        for index, topic in enumerate(PUBLICATION_TOPICS):
            doi = f"{DEFAULT_DOI_PREFIX}/seed-{index + 1:03d}"
            publication = await _get_or_create(
                db,
                Publication,
                {
                    "abstract": f"An investigation into {topic.lower()}.",
                    "type": types[index % len(types)],
                    "status": PublicationStatus.PUBLISHED,
                    "year": 2018 + (index % 7),
                    "venue": "Journal of Collaborative Science",
                    "uploaded_by": researchers[index % len(researchers)].user_id,
                },
                title=topic,
                doi=doi,
            )
            publications.append(publication)
            # 2-4 co-authors on a rotating window (deterministic, no duplicates)
            author_ids = {
                researchers[(index * 3 + step) % len(researchers)].id
                for step in range(2 + index % 3)
            }
            for order, researcher_id in enumerate(sorted(author_ids, key=str)):
                await _get_or_create(
                    db,
                    PublicationAuthor,
                    {"is_corresponding": order == 0},
                    publication_id=publication.id,
                    researcher_id=researcher_id,
                    author_order=order + 1,
                )

        # Institutional collaborations
        pairs = [(0, 1), (1, 2)]
        for a, b in pairs:
            left, right = sorted([institutions[a].id, institutions[b].id], key=str)
            await _get_or_create(
                db,
                InstitutionalCollaboration,
                {
                    "type": "joint_research",
                    "status": "active",
                    "description": "Seed collaboration agreement.",
                },
                institution_a_id=left,
                institution_b_id=right,
                start_date=date(2023, 1, 1),
            )

        # Projects + members
        for index, (title, description, agency, budget) in enumerate(PROJECTS):
            project = await _get_or_create(
                db,
                Project,
                {
                    "description": description,
                    "funding_agency": agency,
                    "budget": Decimal(budget),
                    "end_date": date(2026, 12, 31),
                    "status": ProjectStatus.ACTIVE,
                    "institution_id": institutions[index % len(institutions)].id,
                },
                title=title,
                start_date=date(2024, 1, 1),
            )
            member_ids = {
                researchers[(index * 2 + step) % len(researchers)].id for step in range(4)
            }
            for order, researcher_id in enumerate(sorted(member_ids, key=str)):
                await _get_or_create(
                    db,
                    ProjectMember,
                    {"end_date": None},
                    project_id=project.id,
                    researcher_id=researcher_id,
                    role="Principal Investigator" if order == 0 else "Researcher",
                    start_date=date(2024, 1, 1),
                )

        # Conferences + registrations
        # (removed: conference data is no longer seeded)

        # Citations
        # (removed: citation data is no longer seeded)

        # One demo login per role (documented in README.md). Re-running the
        # seed promotes the matching researcher accounts instead of duplicating.
        demo_users: list[tuple[str, str, UserRole]] = [
            ("ada.lovelace@example.edu", "Ada Lovelace", UserRole.RESEARCHER),
            ("niels.bohr@example.edu", "Niels Bohr", UserRole.INSTITUTION_ADMIN),
            ("marie.curie@example.edu", "Marie Curie", UserRole.REVIEWER),
            ("albert.einstein@example.edu", "Albert Einstein", UserRole.SYSTEM_ADMIN),
        ]
        for email, full_name, role in demo_users:
            user = (
                await db.execute(select(User).where(User.email == email))
            ).scalar_one_or_none()
            if user is None:
                db.add(
                    User(
                        email=email,
                        full_name=full_name,
                        hashed_password=password_hash,
                        role=role,
                        is_active=True,
                    )
                )
                await db.flush()
            elif user.role is not role:
                user.role = role
                await db.flush()

        await db.commit()

    print("Seed complete.")
    print(f"  institutions: {len(INSTITUTIONS)}")
    print(f"  researchers:  {len(RESEARCHERS)} (password: {SEED_PASSWORD})")
    print(
        "  demo logins:  ada.lovelace@example.edu (researcher), "
        "niels.bohr@example.edu (institution_admin), "
        "marie.curie@example.edu (reviewer), "
        f"albert.einstein@example.edu (system_admin) — password: {SEED_PASSWORD}"
    )
    print(f"  publications: {len(PUBLICATION_TOPICS)}")
    print(f"  projects:     {len(PROJECTS)}")



if __name__ == "__main__":
    asyncio.run(seed())
