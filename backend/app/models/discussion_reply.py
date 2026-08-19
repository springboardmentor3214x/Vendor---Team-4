from datetime import datetime
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class DiscussionReply(Base):
    __tablename__ = "discussion_replies"

    id = Column(Integer, primary_key=True, index=True)
    discussion_id = Column(Integer, ForeignKey("discussions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    discussion = relationship("Discussion")
    user = relationship("User")
