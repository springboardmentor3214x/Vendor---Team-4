"""
Email service.

Handles sending emails for password resets, welcome messages, etc.
In development mode, emails are logged to the console.
In production, configure SMTP settings in .env for actual delivery.
"""

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger("vrip.email")


class EmailService:
    """
    Email service for sending transactional emails.

    If SMTP is not configured, emails are logged to the console
    for development convenience. When SMTP credentials are provided,
    emails are sent via the configured SMTP server.
    """

    @staticmethod
    def _is_smtp_configured() -> bool:
        """Check if SMTP settings are configured."""
        return bool(settings.SMTP_USER and settings.SMTP_PASSWORD)

    @staticmethod
    def _send_email(to_email: str, subject: str, html_body: str) -> bool:
        """
        Send an email via SMTP.

        Args:
            to_email: Recipient email address.
            subject: Email subject line.
            html_body: HTML email body content.

        Returns:
            True if email was sent successfully, False otherwise.
        """
        if not EmailService._is_smtp_configured():
            logger.info(
                "[DEV MODE] Email would be sent to: %s | Subject: %s",
                to_email,
                subject,
            )
            logger.debug("[DEV MODE] Email body:\n%s", html_body)
            return True

        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.SMTP_USER}>"
            msg["To"] = to_email
            msg["Subject"] = subject
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)

            logger.info("Email sent successfully to: %s", to_email)
            return True

        except Exception as e:
            logger.error("Failed to send email to %s: %s", to_email, str(e))
            return False

    @staticmethod
    def send_welcome_email(email: str, first_name: str) -> bool:
        """
        Send a welcome email to a newly registered user.

        Args:
            email: The user's email address.
            first_name: The user's first name for personalization.

        Returns:
            True if sent successfully, False otherwise.
        """
        subject = f"Welcome to {settings.APP_NAME}!"
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Welcome to {settings.APP_NAME}, {first_name}!</h2>
            <p>Your account has been created successfully.</p>
            <p>You can now log in to access the platform and manage your vendor operations.</p>
            <hr>
            <p style="color: #888; font-size: 12px;">
                This is an automated message from {settings.APP_NAME}.
            </p>
        </body>
        </html>
        """
        return EmailService._send_email(email, subject, html_body)

    @staticmethod
    def send_reset_password_email(email: str, reset_token: str) -> bool:
        """
        Send a password reset email with the reset token.

        Args:
            email: The user's email address.
            reset_token: The JWT reset token to include in the email.

        Returns:
            True if sent successfully, False otherwise.
        """
        subject = f"{settings.APP_NAME} - Password Reset Request"
        # In a real app, this would link to a frontend reset page
        reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password.</p>
            <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
            <p>
                <a href="{reset_link}"
                   style="background-color: #4CAF50; color: white; padding: 10px 20px;
                          text-decoration: none; border-radius: 5px;">
                    Reset Password
                </a>
            </p>
            <p style="margin-top: 20px;">
                Or copy this token to use directly:<br>
                <code style="background: #f4f4f4; padding: 5px; border-radius: 3px;">
                    {reset_token}
                </code>
            </p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <hr>
            <p style="color: #888; font-size: 12px;">
                This is an automated message from {settings.APP_NAME}.
            </p>
        </body>
        </html>
        """
        return EmailService._send_email(email, subject, html_body)
