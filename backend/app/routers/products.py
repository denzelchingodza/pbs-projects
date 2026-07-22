"""Public: list the 6 product categories shown on the Products page."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductOut

router = APIRouter()

# Registered both with and without the trailing slash, see the comment in
# routers/settings.py, this is what keeps product data loading correctly
# when the site is opened on a phone through the Next.js dev proxy.


@router.get("", response_model=list[ProductOut], include_in_schema=False)
@router.get("/", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db)):
    return db.query(Product).all()
