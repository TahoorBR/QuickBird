import os
import json
from dotenv import load_dotenv
from google.oauth2 import service_account
from googleapiclient.discovery import build
from email.mime.text import MIMEText
import base64

# Load .env
load_dotenv()

GMAIL_SERVICE_ACCOUNT_JSON = os.getenv("GMAIL_SERVICE_ACCOUNT_JSON")
GMAIL_SENDER_EMAIL = os.getenv("GMAIL_SENDER_EMAIL")
GMAIL_TEST_RECIPIENT = os.getenv("GMAIL_TEST_RECIPIENT")

SERVICE_ACCOUNT_INFO = json.loads(GMAIL_SERVICE_ACCOUNT_JSON)
SCOPES = ["https://www.googleapis.com/auth/gmail.send"]
credentials = service_account.Credentials.from_service_account_info(
    SERVICE_ACCOUNT_INFO, scopes=SCOPES
)
delegated_credentials = credentials.with_subject(GMAIL_SENDER_EMAIL)
gmail_service = build("gmail", "v1", credentials=delegated_credentials)

def send_test_email(to_email: str):
    message = MIMEText("This is a test email from QuickBird backend.")
    message['to'] = to_email
    message['from'] = GMAIL_SENDER_EMAIL
    message['subject'] = "QuickBird Test Email"
    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
    body = {'raw': raw_message}
    try:
        gmail_service.users().messages().send(userId="me", body=body).execute()
        print(f"Email sent successfully to {to_email}")
    except Exception as e:
        print("Failed to send email:", e)

if __name__ == "__main__":
    if not GMAIL_TEST_RECIPIENT:
        print("Please set GMAIL_TEST_RECIPIENT in your .env")
    else:
        send_test_email(GMAIL_TEST_RECIPIENT)
