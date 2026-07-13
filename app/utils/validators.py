"""
Input validation utilities.

Provides reusable validators for password strength,
phone number format, and other input constraints.
"""

import re


def validate_password_strength(password: str) -> list[str]:
    """
    Validate password meets security requirements.

    Requirements:
        - Minimum 8 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character (!@#$%^&*()_+-=[]{}|;':\",./<>?)

    Args:
        password: The password string to validate.

    Returns:
        A list of validation error messages. Empty list means valid.
    """
    errors: list[str] = []

    if len(password) < 8:
        errors.append("Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter.")
    if not re.search(r"[a-z]", password):
        errors.append("Password must contain at least one lowercase letter.")
    if not re.search(r"\d", password):
        errors.append("Password must contain at least one digit.")
    if not re.search(r"[!@#$%^&*()_+\-=\[\]{}|;':\",./<>?\\`~]", password):
        errors.append("Password must contain at least one special character.")

    return errors


def validate_phone_number(phone: str) -> bool:
    """
    Validate phone number format.

    Accepts formats like:
        +1234567890, +91-9876543210, (123) 456-7890,
        123-456-7890, 1234567890

    Args:
        phone: The phone number string to validate.

    Returns:
        True if the phone number format is valid, False otherwise.
    """
    pattern = r"^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$"
    return bool(re.match(pattern, phone))


def validate_username(username: str) -> list[str]:
    """
    Validate username format.

    Requirements:
        - 3 to 50 characters
        - Only alphanumeric, underscores, and hyphens
        - Must start with a letter

    Args:
        username: The username string to validate.

    Returns:
        A list of validation error messages. Empty list means valid.
    """
    errors: list[str] = []

    if len(username) < 3:
        errors.append("Username must be at least 3 characters long.")
    if len(username) > 50:
        errors.append("Username must be at most 50 characters long.")
    if not re.match(r"^[a-zA-Z]", username):
        errors.append("Username must start with a letter.")
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9_-]*$", username):
        errors.append("Username can only contain letters, numbers, underscores, and hyphens.")

    return errors
