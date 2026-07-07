from fastapi import FastAPI

from app.database import Base, engine

from app.routers import auth
from app.routers import users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Vendor Reliability Platform")

app.include_router(auth.router)
app.include_router(users.router)


@app.get("/")
def home():
    return {
        "message": "Vendor Reliability Platform API Running"
    }