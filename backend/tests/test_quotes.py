def test_submit_quote(client):
    payload = {"full_name": "Test User", "phone": "0771234567", "product": "Windows"}
    r = client.post("/api/quotes/", json=payload)
    assert r.status_code in (200, 201)
