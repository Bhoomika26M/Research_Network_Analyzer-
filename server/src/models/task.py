from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from src.db.session import Base


class ProjectTask(Base):
    __tablename__ = "project_tasks"

    id = Column(Integer, primary_key=True, index=True)
    projectId = Column(Integer, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    assignee = Column(String(255), nullable=False)
    dueDate = Column(String(50), nullable=False)
    status = Column(String(50), default="In Progress")  # In Progress, Completed
    priority = Column(String(50), default="Medium")  # Low, Medium, High
    created_at = Column(DateTime, default=datetime.utcnow)
