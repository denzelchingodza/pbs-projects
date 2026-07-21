"""
Populate a fresh database with real starting data so the site isn't empty on
first run. Safe to re-run — it checks for existing rows before inserting.

Usage: python seed.py
"""
from app.database import SessionLocal
from app.models.user import User
from app.models.product import Product
from app.models.settings import SiteSettings
from app.models.testimonial import Testimonial
from app.core.security import hash_password

PRODUCTS = [
    ("Windows", "windows",
     "Aluminum awning and casement windows, built to size and fitted into brick or "
     "plastered walls, from a single opening to a full wall of glass."),
    ("Doors", "doors",
     "Sliding patio doors, security screen doors, and hinged entrances in aluminum, "
     "built for daily use and finished to match the rest of the home or shop."),
    ("Shower Cubicles", "shower-cubicles",
     "Frameless sliding glass shower cubicles, sealed clean to the tile, no leaks, no rust."),
    ("Shop Fronts", "shop-fronts",
     "Full storefront glazing and aluminum framing, built to secure a shop overnight "
     "and welcome customers by day."),
    ("Suspended Ceilings", "suspended-ceilings",
     "Aluminum grid suspended ceilings for homes, shops, and offices, a clean finish "
     "with easy access above it for wiring and maintenance."),
    ("Cabinets", "cabinets",
     "Custom aluminum framed glass cabinets and display units, built to size for "
     "kitchens, shops, and display spaces."),
]

TESTIMONIALS = [
    ("T. Moyo", "Shop Owner, Harare",
     "Sharp installation, on time, and the shop front looks exactly like we pictured it.", 5),
    ("R. Chikafu", "Homeowner, Waterfalls",
     "Professional from quote to install. Our new windows completely changed the house.", 5),
    ("N. Sibanda", "Property Developer",
     "Handled our whole office ceiling project with zero issues. Recommended.", 5),
]


def run():
    db = SessionLocal()

    # --- Admin user ---
    if not db.query(User).filter(User.email == "owner@pbsprojects.co.zw").first():
        db.add(User(
            name="Gift Mashaire",
            email="owner@pbsprojects.co.zw",
            hashed_password=hash_password("changeme123"),  # CHANGE before real deployment
            is_admin=True,
        ))
        print("Created admin user: owner@pbsprojects.co.zw / changeme123 (change this password!)")

    # --- Products ---
    for name, slug, desc in PRODUCTS:
        if not db.query(Product).filter(Product.slug == slug).first():
            db.add(Product(name=name, slug=slug, description=desc))
    print(f"Ensured {len(PRODUCTS)} product categories exist.")

    # --- Site settings (business info + founder bio) ---
    if not db.query(SiteSettings).first():
        db.add(SiteSettings(
            business_name="PBS Projects",
            address="09 Sherwood Rd, Waterfalls, Harare",
            phone_primary="+263 71 212 2020",
            phone_secondary="+263 77 743 3279",
            whatsapp_number="+263 71 212 2020",
            email="pbs@gmail.com",
            owner_role="Founder",
            years_experience=None,   # fill in via admin panel
            founded_year=2023,
        ))
        print("Created default site settings.")

    # --- Testimonials ---
    if db.query(Testimonial).count() == 0:
        for name, role, quote, rating in TESTIMONIALS:
            db.add(Testimonial(client_name=name, client_role=role, quote=quote, rating=rating))
        print(f"Added {len(TESTIMONIALS)} starter testimonials.")

    db.commit()
    db.close()
    print("Seed complete.")


if __name__ == "__main__":
    run()
