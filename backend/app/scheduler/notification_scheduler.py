from apscheduler.schedulers.background import BackgroundScheduler

from app.database import SessionLocal
from app.services.contract_service import get_expiring_contracts
from app.services.certification_service import get_expiring_certifications
from app.services.vendor_document_service import get_expiring_documents


scheduler = BackgroundScheduler()


def check_expiry_notifications():
    """
    Check contracts, certifications and vendor documents
    and create notifications for items approaching expiry.
    """

    db = SessionLocal()

    try:
        print("Running notification expiry check...")

        # Contract expiry
        get_expiring_contracts(
            db,
            days=30
        )

        # Certification expiry
        get_expiring_certifications(
            db,
            days=30
        )

        # Vendor document expiry
        get_expiring_documents(
            db,
            days=30
        )

        print("Notification expiry check completed.")

    except Exception as e:
        db.rollback()
        print(
            f"Notification scheduler error: {e}"
        )

    finally:
        db.close()


def start_scheduler():

    if not scheduler.running:

        scheduler.add_job(
            check_expiry_notifications,
            trigger="interval",
            hours=24,
            id="notification_expiry_check",
            replace_existing=True
        )

        scheduler.start()

        print(
            "Notification scheduler started."
        )


def stop_scheduler():

    if scheduler.running:

        scheduler.shutdown()

        print(
            "Notification scheduler stopped."
        )