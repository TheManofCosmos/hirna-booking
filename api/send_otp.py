from http.server import BaseHTTPRequestHandler
import urllib.parse
import json
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.header import Header
from email.utils import make_msgid, formatdate
import os

GMAIL_SENDER = os.environ.get("GMAIL_SENDER", "hirnasecurity@gmail.com")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "mukfvbhuiepcocoq")

def send_real_email_otp(recipient_email, otp_code, purpose="login"):
    """Send real OTP email to Gmail inbox using Google App Password with standard UTF-8 MIME encoding."""
    try:
        msg = MIMEMultipart("alternative")
        is_reset = purpose == "reset"
        is_pin = purpose in ["pin_setup", "pin_reset"]

        if is_reset:
            subject_title = "Password Reset Passkey"
            badge_title = "PASSWORD RESET PASSKEY"
            box_label = "Password Reset Passkey"
            action_desc = "reset your account password"
        elif is_pin:
            action_word = "create" if purpose == "pin_setup" else "reset"
            subject_title = "4-Digit PIN Security Code"
            badge_title = "4-DIGIT PIN SECURITY GATEWAY"
            box_label = "4-Digit PIN Verification Code"
            action_desc = f"{action_word} your 4-digit security PIN"
        else:
            subject_title = "Security Verification Code"
            badge_title = "IDENTITY & TWO-FACTOR AUTHENTICATION"
            box_label = "Your One-Time Passkey (OTP)"
            action_desc = "verify identity login"

        msg["Date"] = formatdate(localtime=True)
        msg["Message-ID"] = make_msgid(domain="gmail.com")
        msg["X-Priority"] = "1"
        msg["Importance"] = "high"
        msg["Subject"] = Header(f"Your Hirna {subject_title}: {otp_code}", "utf-8").encode()
        msg["From"] = f"Hirna Security <{GMAIL_SENDER}>"
        msg["To"] = recipient_email
        msg["Reply-To"] = GMAIL_SENDER

        text_body = f"""Hirna TNVS Platform Security
----------------------------------------
Your One-Time Passkey (OTP) is: {otp_code}

Purpose: {subject_title}
This verification code was requested for {recipient_email} to {action_desc}.
It is valid for 5 minutes. Do NOT share this code with anyone.

Hirna: Transport & Delivery System (Team 10)
"""

        html_body = f"""<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #ffffff; padding: 24px; margin: 0;">
    <div style="max-width: 520px; margin: 0 auto; background: #0f172a; border-radius: 20px; border: 1px solid #1e293b; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 50px; height: 50px; line-height: 50px; background: #f59e0b; border-radius: 14px; font-size: 24px; color: #020617; font-weight: 900;">🚕</div>
            <h2 style="color: #ffffff; margin: 12px 0 4px 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">HIRNA TNVS SECURITY</h2>
            <p style="color: #94a3b8; margin: 0; font-size: 12px;">{badge_title}</p>
        </div>

        <div style="background: #1e293b; border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 24px; border: 1px solid #334155;">
            <p style="color: #cbd5e1; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">{box_label}</p>
            <div style="font-family: 'Consolas', 'Courier New', monospace; font-size: 34px; font-weight: 900; color: #f59e0b; letter-spacing: 8px; margin: 8px 0;">{otp_code}</div>
            <p style="color: #64748b; margin: 8px 0 0 0; font-size: 11px;">Expires in 5 minutes • Valid for 1 single verification attempt</p>
        </div>

        <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0 0 16px 0;">
            This security code was dispatched for <strong>{recipient_email}</strong> to {action_desc}. If you did not request this code, please secure your Hirna account immediately.
        </p>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; text-align: center; color: #475569; font-size: 11px;">
            Hirna Transport & Delivery • SuperAdmin SSO & Security Gateway<br>
            Protected by 2-Factor Authentication & LTFRB SOP Compliance
        </div>
    </div>
</body>
</html>
"""
        msg.attach(MIMEText(text_body, "plain", "utf-8"))
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
            server.login(GMAIL_SENDER, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        return True, "Email sent successfully"
    except Exception as e:
        return False, str(e)

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def do_GET(self):
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        email = query.get('email', [''])[0]
        code = query.get('code', ['123456'])[0]
        purpose = query.get('purpose', ['login'])[0]

        if not email:
            resp_body = json.dumps({'error': 'Missing email parameter'}).encode('utf-8')
            self.send_response(400)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(resp_body)))
            self.end_headers()
            self.wfile.write(resp_body)
            return

        success, msg = send_real_email_otp(email, code, purpose)

        resp_body = json.dumps({
            'status': 'dispatched' if success else 'failed',
            'email': email,
            'code': code,
            'channel': 'gmail_smtp',
            'sender': GMAIL_SENDER,
            'email_sent': success,
            'message': msg
        }).encode('utf-8')

        self.send_response(200 if success else 500)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(resp_body)))
        self.end_headers()
        self.wfile.write(resp_body)
        return
