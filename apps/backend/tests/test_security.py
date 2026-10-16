from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)


def test_password_hashing():
    raw = "SuperSecret123!"
    hashed = get_password_hash(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_jwt_access_token():
    user_id = "user-12345"
    token = create_access_token(subject=user_id, role="admin")
    assert token is not None

    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == user_id
    assert payload["role"] == "admin"
    assert payload["type"] == "access"


def test_jwt_invalid_token():
    assert decode_token("invalid.token.signature") is None

