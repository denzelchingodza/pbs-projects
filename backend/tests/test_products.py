"""Covers the public products listing, both slash forms (see routers/products.py,
the no-slash version exists specifically for the phone-testing proxy)."""
from app.models.product import Product


def _seed_product(db_session):
    db_session.add(Product(name="Windows", slug="windows", description="Aluminum windows, built to size."))
    db_session.commit()


def test_list_products(client, db_session):
    _seed_product(db_session)
    r = client.get("/api/products/")
    assert r.status_code == 200
    names = [p["name"] for p in r.json()]
    assert "Windows" in names


def test_list_products_without_trailing_slash(client, db_session):
    _seed_product(db_session)
    r = client.get("/api/products", follow_redirects=False)
    assert r.status_code == 200
