# core/backend/app/core/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Create SQLAlchemy engine using the Postgres DSN from .env (e.g., postgres://scicollab:scicollab@postgres:5432/scicollab)
engine = create_engine(settings.POSTGRES_DSN, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
