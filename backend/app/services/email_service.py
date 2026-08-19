import os
import smtplib

from email.message import EmailMessage

from dotenv import load_dotenv


load_dotenv()


SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


def send_email(
    to_email: str,
    subject: str,
    body: str
):
    """
    Sends an email using Gmail SMTP.

    Returns:
        True  -> Email sent successfully
        False -> Failed to send
    """

    try:

        msg = EmailMessage()

        msg["Subject"] = subject
        msg["From"] = SMTP_EMAIL
        msg["To"] = to_email

        msg.set_content(body)

        with smtplib.SMTP(
            SMTP_SERVER,
            SMTP_PORT
        ) as server:

            server.starttls()

            server.login(
                SMTP_EMAIL,
                SMTP_PASSWORD
            )

            server.send_message(msg)

        print(f"Email sent to {to_email}")

        return True

    except Exception as e:

        print(f"Email Error: {e}")

        return False