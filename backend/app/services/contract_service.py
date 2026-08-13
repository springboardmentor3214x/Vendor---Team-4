from datetime import date

from sqlalchemy.orm import Session
from app.models.vendor import Vendor
from app.models.contract import Contract, ContractStatus
from app.schemas.contract import ContractCreate, ContractUpdate

from app.models.user import User
from app.services.email_service import send_email

from app.models.notification import (
    Notification,
    NotificationType,
    NotificationPriority,
    DeliveryMethod
)

# ---------------------------------------------------
# Create Contract
# ---------------------------------------------------

def create_contract(
    db: Session,
    contract: ContractCreate
):

    vendor = (
        db.query(Vendor)
        .filter(
            Vendor.id == contract.vendor_id
        )
        .first()
    )

    if not vendor:

        raise ValueError("Vendor not found")

    db_contract = Contract(
        **contract.model_dump()
    )

    db.add(db_contract)

    db.commit()

    db.refresh(db_contract)

    return db_contract

# ---------------------------------------------------
# Get All Contracts
# ---------------------------------------------------

def get_contracts(db: Session):

    return db.query(Contract).all()


# ---------------------------------------------------
# Get Contract By ID
# ---------------------------------------------------

def get_contract(db: Session, contract_id: int):

    return (
        db.query(Contract)
        .filter(Contract.id == contract_id)
        .first()
    )


# ---------------------------------------------------
# Update Contract
# ---------------------------------------------------

def update_contract(
    db: Session,
    contract_id: int,
    contract: ContractUpdate
):

    db_contract = get_contract(db, contract_id)

    if not db_contract:

        return None

    update_data = contract.model_dump(exclude_unset=True)

    for key, value in update_data.items():

        setattr(db_contract, key, value)

    db.commit()

    db.refresh(db_contract)

    return db_contract


# ---------------------------------------------------
# Delete Contract
# ---------------------------------------------------

def delete_contract(
    db: Session,
    contract_id: int
):

    db_contract = get_contract(db, contract_id)

    if not db_contract:

        return None

    db.delete(db_contract)

    db.commit()

    return True


# ---------------------------------------------------
# Expiring Contracts
# ---------------------------------------------------

def get_expiring_contracts(
    db: Session,
    days: int = 30
):
    today = date.today()

    contracts = db.query(Contract).all()

    expiring = []

    for contract in contracts:

        remaining = (
            contract.end_date - today
        ).days

        if 0 <= remaining <= days:

            vendor = db.query(Vendor).filter(
                Vendor.id == contract.vendor_id
            ).first()

            if vendor is None:
                continue

            # Check whether notification already exists
            existing = db.query(Notification).filter(
                Notification.user_id == vendor.created_by,
                Notification.notification_type == NotificationType.CONTRACT,
                Notification.related_record_id == contract.id,
                Notification.title == "Contract Expiring Soon"
            ).first()

            if existing is None:

                description = (
                    f"Contract {contract.contract_number} "
                    f"will expire in {remaining} day(s)."
                )

                # Create in-app notification
                notification = Notification(
                    user_id=vendor.created_by,
                    notification_type=NotificationType.CONTRACT,
                    title="Contract Expiring Soon",
                    description=description,
                    related_module="Contract",
                    related_record_id=contract.id,
                    priority=NotificationPriority.HIGH,
                    delivery_method=DeliveryMethod.IN_APP
                )

                db.add(notification)

                # Find the actual user
                user = db.query(User).filter(
                    User.id == vendor.created_by
                ).first()

                # Send email notification
                if user and user.email:

                    send_email(
                        to_email=user.email,
                        subject="Contract Expiring Soon",
                        body=description
                    )

            expiring.append(contract)

    db.commit()

    return expiring


# ---------------------------------------------------
# Renew Contract
# ---------------------------------------------------

def renew_contract(
    db: Session,
    contract_id: int,
    new_end_date: date
):

    db_contract = get_contract(db, contract_id)

    if not db_contract:

        return None

    db_contract.end_date = new_end_date

    db_contract.status = ContractStatus.RENEWED

    db.commit()

    db.refresh(db_contract)

    return db_contract
def get_active_contracts(db: Session):

    return (
        db.query(Contract)
        .filter(
            Contract.status == ContractStatus.ACTIVE
        )
        .all()
    )
def get_vendor_contracts(
    db: Session,
    vendor_id: int
):

    return (
        db.query(Contract)
        .filter(Contract.vendor_id == vendor_id)
        .all()
    )
# ---------------------------------------------------
# Update Contract Status
# ---------------------------------------------------

def update_contract_status(
    db: Session,
    contract_id: int,
    status: ContractStatus
):

    contract = get_contract(
        db,
        contract_id
    )

    if not contract:

        return None

    contract.status = status

    db.commit()

    db.refresh(contract)

    return contract

# ---------------------------------------------------
# Get Expired Contracts
# ---------------------------------------------------

def get_expired_contracts(db: Session):

    today = date.today()

    return (
        db.query(Contract)
        .filter(
            Contract.end_date < today
        )
        .all()
    )