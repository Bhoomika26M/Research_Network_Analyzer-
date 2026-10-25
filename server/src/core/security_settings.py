import json
import os
import re
from datetime import datetime
from typing import Dict, Any, Optional, List

CONFIG_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "security_config.json")

DEFAULT_SECURITY_SETTINGS = {
    "sessionTimeout": "1 hr",
    "minPasswordLen": 8,
    "requireSpecialChar": True,
    "requireUppercase": True,
    "ipAllowlist": False,
    "ipRanges": ["192.168.1.0/24"],
    "forceLogoutAt": None,
}

_current_settings: Dict[str, Any] = {}


def load_security_settings() -> Dict[str, Any]:
    global _current_settings
    if _current_settings:
        return _current_settings

    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                saved = json.load(f)
                _current_settings = {**DEFAULT_SECURITY_SETTINGS, **saved}
                return _current_settings
        except Exception:
            pass

    _current_settings = dict(DEFAULT_SECURITY_SETTINGS)
    return _current_settings


def save_security_settings(new_settings: Dict[str, Any]) -> Dict[str, Any]:
    global _current_settings
    current = load_security_settings()
    for k, v in new_settings.items():
        if k in DEFAULT_SECURITY_SETTINGS or k == "forceLogoutAt":
            current[k] = v
    _current_settings = current

    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(_current_settings, f, indent=2)
    except Exception:
        pass

    return _current_settings


def trigger_force_logout() -> int:
    """Sets forceLogoutAt timestamp (epoch milliseconds) so older tokens/sessions are invalidated."""
    timestamp_ms = int(datetime.utcnow().timestamp() * 1000)
    save_security_settings({"forceLogoutAt": timestamp_ms})
    return timestamp_ms


def get_force_logout_at() -> Optional[int]:
    settings = load_security_settings()
    return settings.get("forceLogoutAt")


def validate_password_policy(password: str) -> Optional[str]:
    """Validate password against current security settings. Returns error message if invalid, None if valid."""
    settings = load_security_settings()
    min_len = int(settings.get("minPasswordLen", 8))
    req_special = bool(settings.get("requireSpecialChar", True))
    req_upper = bool(settings.get("requireUppercase", True))

    if not password or len(password) < min_len:
        return f"Password must be at least {min_len} characters long."

    if req_upper and not any(c.isupper() for c in password):
        return "Password must contain at least one uppercase letter (A-Z)."

    if req_special:
        special_pattern = r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?`~]'
        if not re.search(special_pattern, password):
            return "Password must contain at least one special character (e.g. !@#$%^&*)."

    return None
