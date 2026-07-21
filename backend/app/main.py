from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import user
from app.models import vendor
from app.models import vendor_document
from app.routers import vendor
from app.models.procurement_request import ProcurementRequest
from app.routers import procurement
from app.models.purchase_order import PurchaseOrder
from app.routers import purchase_order
from app.routers import order_tracking
from app.models.invoice import Invoice
from app.routers import invoice

from app.database import Base, engine
from app.routers import auth
from app.routers import users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Vendor Reliability Platform")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(vendor.router)
app.include_router(procurement.router)
app.include_router(purchase_order.router)
app.include_router(order_tracking.router)
app.include_router(invoice.router)

@app.get("/")
def home():
    return {
        "message": "Vendor Reliability Platform API Running"
    }