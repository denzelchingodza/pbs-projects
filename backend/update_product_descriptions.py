"""
One-off update for the six Product rows' descriptions, they were already
inserted by an earlier run of seed.py, so seed.py itself won't touch them
again (it only inserts a product if that slug doesn't already exist). This
script updates the existing rows in place instead, matching each one by its
slug, safe to run more than once, it just overwrites the same six rows with
the same text again.

There's no admin panel screen for editing products yet (only Projects, in
Admin > Gallery, can be renamed there directly), this script is the way to
push a copy change like this one to a database that already has real rows
in it, whether that's this local dev database or the live one.

Usage: python update_product_descriptions.py
"""
from app.database import SessionLocal
from app.models.product import Product

DESCRIPTIONS = {
    "windows": (
        "Aluminum awning and casement windows, built to size and fitted into brick or "
        "plastered walls, from a single opening to a full wall of glass. This is where "
        "most of PBS's real installs are, the most photographed work in the gallery."
    ),
    "doors": (
        "Sliding patio doors, security screen doors, and hinged entrances in aluminum, "
        "usually fitted on the same job as the windows, finished to match the rest of "
        "the home or shop."
    ),
    "shower-cubicles": (
        "Frameless sliding glass shower cubicles, sealed clean to the tile, no leaks, "
        "no rust, the same glasswork precision as everything else PBS builds."
    ),
    "shop-fronts": (
        "Full storefront glazing and aluminum framing, built to secure a shop overnight "
        "and welcome customers by day, the same joinery used on every window and door "
        "PBS fits, scaled up to a full frontage."
    ),
    "suspended-ceilings": (
        "Aluminum grid suspended ceilings for homes, shops, and offices, a clean finish "
        "with easy access above it for wiring and maintenance."
    ),
    "cabinets": (
        "Custom aluminum framed glass cabinets and display units, built to size for "
        "kitchens, shops, and display spaces."
    ),
}


def run():
    db = SessionLocal()
    updated = 0
    for slug, description in DESCRIPTIONS.items():
        product = db.query(Product).filter(Product.slug == slug).first()
        if product:
            product.description = description
            updated += 1
        else:
            print(f"No product found with slug '{slug}', skipped.")
    db.commit()
    db.close()
    print(f"Updated {updated} product description(s).")


if __name__ == "__main__":
    run()
