from sqlalchemy.orm import Session

from app.models.file_share import FileShare
from app.models.user import User
from app.models.vendor import Vendor
from app.models.purchase_order import PurchaseOrder
from app.models.discussion import Discussion
from app.services.email_service import send_email

from app.schemas.file_share import FileShareResponse


# ---------------------------------------------------
# Create File Share
# ---------------------------------------------------

def create_file_share(db: Session, data):

    user = db.query(User).filter(
        User.id == data.uploaded_by
    ).first()

    if not user:
        raise ValueError("User not found")

    if data.vendor_id:

        vendor = db.query(Vendor).filter(
            Vendor.id == data.vendor_id
        ).first()

        if not vendor:
            raise ValueError("Vendor not found")

    if data.purchase_order_id:

        po = db.query(PurchaseOrder).filter(
            PurchaseOrder.id == data.purchase_order_id
        ).first()

        if not po:
            raise ValueError("Purchase Order not found")

    if data.discussion_id:

        discussion = db.query(Discussion).filter(
            Discussion.id == data.discussion_id
        ).first()

        if not discussion:
            raise ValueError("Discussion not found")

    file = FileShare(**data.model_dump())

    db.add(file)

    db.commit()

    db.refresh(file)

    user = db.query(User).filter(
        User.id == file.uploaded_by
    ).first()

    if user and user.email:

        send_email(
            user.email,
            "File Uploaded Successfully",
            f"""
    Hello {user.full_name},

    The following file has been uploaded successfully.

    File:
    {file.file_name}

    Please login to the platform to view the uploaded document.

    Regards,
    Vendor Reliability Intelligence Platform
    """
        )

    return file


# ---------------------------------------------------
# Get All Files
# ---------------------------------------------------

def get_files(db: Session):

    return db.query(FileShare).all()


# ---------------------------------------------------
# Get File
# ---------------------------------------------------

def get_file(db: Session, file_id: int):

    return db.query(FileShare).filter(
        FileShare.id == file_id
    ).first()


# ---------------------------------------------------
# Delete File
# ---------------------------------------------------

def delete_file(db: Session, file_id: int):

    file = get_file(db, file_id)

    if not file:
        return None

    db.delete(file)

    db.commit()

    return True