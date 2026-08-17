import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests

def send_email_otp(to_email: str, otp_code: str):
    """Send OTP via SMTP."""
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    if not smtp_username or not smtp_password:
        print(f"[DEV MODE] Email OTP for {to_email}: {otp_code}")
        return

    try:
        msg = MIMEMultipart()
        msg["From"] = smtp_username
        msg["To"] = to_email
        msg["Subject"] = "Your AI-Drive Post-Harvest Loss Prediction OTP"
        
        body = f"""
        <html>
            <body>
                <h2>Your Verification Code</h2>
                <p>Use the following OTP to log in or reset your password:</p>
                <h1 style="color: #8B1A1A;">{otp_code}</h1>
                <p>This code will expire in 10 minutes.</p>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, "html"))
        
        server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.sendmail(smtp_username, to_email, msg.as_string())
        server.quit()
        print(f"Email successfully sent to {to_email}!")
    except Exception as e:
        print(f"Error sending email: {e}")
        # In a real app we might raise an error, but let's fall back to print in dev
        print(f"[DEV MODE - FAILED EMAIL] Email OTP for {to_email}: {otp_code}")

def send_email_notification(to_email: str, subject: str, message_body: str):
    """Send a generic email notification via SMTP."""
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    if not smtp_username or not smtp_password:
        print(f"[DEV MODE] Email Notification to {to_email}: {subject}")
        return

    try:
        msg = MIMEMultipart()
        msg["From"] = smtp_username
        msg["To"] = to_email
        msg["Subject"] = subject
        
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <div style="background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #2e7d32;">AI-Drive Post-Harvest Alert</h2>
                    <p>{message_body}</p>
                    <p style="font-size: 0.9em; color: #555;">Log in to your dashboard to view more details.</p>
                </div>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, "html"))
        
        server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.sendmail(smtp_username, to_email, msg.as_string())
        server.quit()
        print(f"Notification email successfully sent to {to_email}!")
    except Exception as e:
        print(f"Error sending email: {e}")
        print(f"[DEV MODE - FAILED EMAIL] Notification for {to_email}")

def send_sms_otp(to_phone: str, otp_code: str):
    """Send OTP via Fast2SMS (Free for India)."""
    fast2sms_api_key = os.getenv("FAST2SMS_API_KEY")
    
    if not fast2sms_api_key:
        print(f"[DEV MODE] SMS OTP for {to_phone}: {otp_code}")
        return

    try:
        # Fast2SMS requires the number without +91 prefix
        if to_phone.startswith("+91"):
            to_phone = to_phone[3:]
            
        url = "https://www.fast2sms.com/dev/bulkV2"
        querystring = {
            "authorization": fast2sms_api_key,
            "variables_values": otp_code,
            "route": "otp",
            "numbers": to_phone
        }
        
        headers = {'cache-control': "no-cache"}
        response = requests.request("GET", url, headers=headers, params=querystring)
        
        data = response.json()
        if data.get("return"):
            print(f"Fast2SMS SMS sent successfully to {to_phone}!")
        else:
            print(f"Fast2SMS Error: {data.get('message')}")
            print(f"[DEV MODE - FAILED SMS] SMS OTP for {to_phone}: {otp_code}")
            
    except Exception as e:
        print(f"Error sending Fast2SMS: {e}")
        print(f"[DEV MODE - FAILED SMS] SMS OTP for {to_phone}: {otp_code}")
