"""
routers/shipments.py — Shipment Tracking Endpoints
Create, list, and update shipment bookings.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Shipment, ShipmentStatus, User, Notification, NotificationType
from backend.schemas import ShipmentCreate, ShipmentUpdate, ShipmentResponse
from backend.auth import get_current_user
from backend.communications import send_email_notification

router = APIRouter(prefix="/api/shipments", tags=["Shipments"])


@router.post("/", response_model=ShipmentResponse, status_code=201)
def create_shipment(
    payload: ShipmentCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new shipment booking."""
    # Check for duplicate booking ID
    existing = db.query(Shipment).filter(Shipment.booking_id == payload.booking_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Booking ID already exists.")

    try:
        shipment = Shipment(
            user_id=current_user.id,
            prediction_id=payload.prediction_id,
            booking_id=payload.booking_id,
            crop=payload.crop,
            tonnage=payload.tonnage,
            destination=payload.destination,
            route_quality=payload.route_quality,
            eta_hours=payload.eta_hours,
            risk_status=payload.risk_status,
            shelf_days_calculated=payload.shelf_days_calculated,
            status=ShipmentStatus.in_transit,
            farmer_name=payload.farmer_name or current_user.full_name,
            farmer_phone=payload.farmer_phone or current_user.phone,
        )
        db.add(shipment)
        db.commit()
        db.refresh(shipment)

        # Create a booking confirmed notification
        notif = Notification(
            user_id=current_user.id,
            shipment_id=shipment.id,
            type=NotificationType.booking_confirmed,
            title="Booking Confirmed",
            message=f"Shipment {shipment.booking_id} for {shipment.tonnage} tons of {shipment.crop} "
                    f"has been dispatched to {shipment.destination}. ETA: {shipment.eta_hours}.",
        )
        db.add(notif)
        db.commit()

        if current_user.email:
            background_tasks.add_task(send_email_notification, current_user.email, notif.title, notif.message)

        return ShipmentResponse.model_validate(shipment)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")


@router.get("/", response_model=list[ShipmentResponse])
def list_shipments(
    status: str = Query(None),
    destination: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List shipments for the current user (or all for warehouse managers)."""
    query = db.query(Shipment)

    # Farmers see only their own; warehouse managers and admins see all
    if current_user.role.value == "farmer":
        query = query.filter(Shipment.user_id == current_user.id)

    if status:
        query = query.filter(Shipment.status == status)
    if destination:
        query = query.filter(Shipment.destination.ilike(f"%{destination}%"))

    return [
        ShipmentResponse.model_validate(s)
        for s in query.order_by(Shipment.created_at.desc()).limit(100).all()
    ]


@router.get("/active", response_model=list[ShipmentResponse])
def list_active_shipments(
    destination: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List active (in-transit) shipments, optionally filtered by destination."""
    query = db.query(Shipment).filter(Shipment.status == ShipmentStatus.in_transit)

    if destination:
        query = query.filter(Shipment.destination.ilike(f"%{destination}%"))

    return [
        ShipmentResponse.model_validate(s)
        for s in query.order_by(Shipment.created_at.desc()).all()
    ]


@router.put("/{shipment_id}", response_model=ShipmentResponse)
def update_shipment(
    shipment_id: int,
    payload: ShipmentUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a shipment's status, risk, or shelf life."""
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found.")

    old_status = shipment.status.value if shipment.status else ""

    if payload.status is not None:
        try:
            shipment.status = ShipmentStatus(payload.status)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {payload.status}")
    if payload.risk_status is not None:
        shipment.risk_status = payload.risk_status
    if payload.shelf_days_calculated is not None:
        shipment.shelf_days_calculated = payload.shelf_days_calculated

    db.commit()
    db.refresh(shipment)

    # Create notification for status changes
    new_status = shipment.status.value if shipment.status else ""
    if old_status != new_status:
        # Notify the farmer (shipment owner)
        notif = Notification(
            user_id=shipment.user_id,
            shipment_id=shipment.id,
            type=NotificationType.dispatch_alert,
            title=f"Shipment Status: {new_status}",
            message=f"Your shipment {shipment.booking_id} ({shipment.crop}, "
                    f"{shipment.tonnage} tons) status changed from '{old_status}' "
                    f"to '{new_status}' at {shipment.destination}.",
        )
        db.add(notif)
        db.commit()
        
        farmer = db.query(User).filter(User.id == shipment.user_id).first()
        if farmer and farmer.email:
            background_tasks.add_task(send_email_notification, farmer.email, notif.title, notif.message)

    return ShipmentResponse.model_validate(shipment)


@router.get("/{shipment_id}", response_model=ShipmentResponse)
def get_shipment(
    shipment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single shipment by ID."""
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found.")
    return ShipmentResponse.model_validate(shipment)
