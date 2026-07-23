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
from app.models.delivery_performance import DeliveryPerformance
from app.routers import delivery_performance
from app.models.product_quality import ProductQualityEvaluation
from app.routers import product_quality
from app.models.communication_log import CommunicationLog
from app.routers import communication_log
from app.models.service_rating import ServiceRating
from app.routers import service_rating
from app.routers import vendor_performance
from app.models.vendor_reliability import VendorReliability
from app.routers.vendor_reliability import router as vendor_reliability_router
from app.models.vendor_performance import VendorPerformance
from app.models.vendor_reliability_history import VendorReliabilityHistory
from app.models.vendor_issue import VendorIssue
from app.routers import vendor_issue
from app.models import complaint
from app.routers import complaint
from app.routers import recommendation
from app.routers import high_risk_warning

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
app.include_router(delivery_performance.router)
app.include_router(product_quality.router)
app.include_router(communication_log.router)
app.include_router(service_rating.router)
app.include_router(vendor_performance.router)
app.include_router(vendor_reliability_router)
app.include_router(vendor_issue.router)
app.include_router(complaint.router)
app.include_router(recommendation.router)
app.include_router(high_risk_warning.router)

@app.get("/")
def home():
    return {
        "message": "Vendor Reliability Platform API Running"
    }