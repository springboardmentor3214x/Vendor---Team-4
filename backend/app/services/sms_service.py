import os
from dotenv import load_dotenv
from twilio.rest import Client

load_dotenv()


class SMSService:

    @staticmethod
    def send_sms(to_number: str, message: str):

        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        from_number = os.getenv("TWILIO_PHONE_NUMBER")

        # Development mode
        if not account_sid or not auth_token or not from_number:
            print("\n========== SMS (DEV MODE) ==========")
            print(f"To: {to_number}")
            print(f"Message: {message}")
            print("====================================\n")

            return {
                "success": True,
                "mode": "development",
                "message": "SMS logged successfully"
            }

        # Twilio mode
        client = Client(account_sid, auth_token)

        sms = client.messages.create(
            body=message,
            from_=from_number,
            to=to_number
        )

        return {
            "success": True,
            "mode": "twilio",
            "message_sid": sms.sid
        }
