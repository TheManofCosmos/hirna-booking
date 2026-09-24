import http.server
import socketserver
import socket
import webbrowser
import os
import sys
import threading
import time
import random
import subprocess
import urllib.parse
import urllib.request
import json

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

GMAIL_SENDER = os.environ.get("GMAIL_SENDER", "hirnasecurity@gmail.com")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "mukfvbhuiepcocoq")

def send_real_email_otp(recipient_email, otp_code, purpose="login", device="Windows PC", ip="120.28.17.44", browser="Edge", location="Metro Manila, PH"):
    """Send real OTP email or Security Alert to Gmail inbox using Google App Password."""
    try:
        msg = MIMEMultipart("alternative")
        is_reset = purpose == "reset"
        is_pin = purpose in ["pin_setup", "pin_reset"]
        is_alert = purpose in ["new_login_alert", "security_alert"]
        
        if is_alert:
            current_time = time.strftime("%Y-%m-%d %H:%M:%S UTC+8")
            msg["Subject"] = f"🚨 Hirna Security Alert: New Device Sign-In Detected ({device})"
            msg["From"] = f"Hirna TNVS Security <{GMAIL_SENDER}>"
            msg["To"] = recipient_email

            text_body = f"""Hirna TNVS Security Alert
----------------------------------------
New Device Sign-In Detected for {recipient_email}

Device: {device}
Browser: {browser}
IP Address: {ip}
Location: {location}
Timestamp: {current_time}

If this was you, you can safely disregard this email.
If you did not authorize this login, please log into your Hirna account immediately, navigate to 'Account Activity & Devices', and click 'Remote Sign-Out' to terminate the session.

Hirna: Transport & Delivery System (Team 10)
"""
            html_body = f"""
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #ffffff; padding: 24px; margin: 0;">
    <div style="max-width: 540px; margin: 0 auto; background: #0f172a; border-radius: 20px; border: 1px solid #1e293b; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 50px; height: 50px; line-height: 50px; background: #ef4444; border-radius: 14px; font-size: 24px; color: #ffffff; font-weight: 900;">🚨</div>
            <h2 style="color: #ffffff; margin: 12px 0 4px 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">HIRNA TNVS SECURITY</h2>
            <p style="color: #f87171; margin: 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">NEW DEVICE SIGN-IN DETECTED</p>
        </div>

        <div style="background: #1e293b; border-radius: 14px; padding: 20px; margin-bottom: 24px; border: 1px solid #334155;">
            <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">
                A new login occurred on your Hirna account (<strong>{recipient_email}</strong>) from a device or location not previously recognized:
            </p>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr style="border-bottom: 1px solid #334155;">
                    <td style="padding: 8px 0; color: #94a3b8; font-weight: 600;">Device:</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-weight: 700; text-align: right;">{device}</td>
                </tr>
                <tr style="border-bottom: 1px solid #334155;">
                    <td style="padding: 8px 0; color: #94a3b8; font-weight: 600;">Browser:</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-weight: 700; text-align: right;">{browser}</td>
                </tr>
                <tr style="border-bottom: 1px solid #334155;">
                    <td style="padding: 8px 0; color: #94a3b8; font-weight: 600;">IP Address:</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-family: monospace; font-weight: 700; text-align: right;">{ip}</td>
                </tr>
                <tr style="border-bottom: 1px solid #334155;">
                    <td style="padding: 8px 0; color: #94a3b8; font-weight: 600;">Location:</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-weight: 700; text-align: right;">{location}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #94a3b8; font-weight: 600;">Time:</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-weight: 700; text-align: right;">{current_time}</td>
                </tr>
            </table>
        </div>

        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 14px; margin-bottom: 20px;">
            <p style="color: #fca5a5; font-size: 12px; line-height: 1.5; margin: 0;">
                <strong>Did you recognize this activity?</strong><br>
                If this was you, you can safely disregard this email.<br>
                If you did not sign in, open Hirna TNVS immediately, access <strong>Account Activity & Devices</strong>, and click <strong>Remote Sign-Out</strong> to disconnect the unrecognized device.
            </p>
        </div>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; text-align: center; color: #475569; font-size: 11px;">
            Hirna Transport & Delivery • SuperAdmin SSO & Security Gateway<br>
            Protected by 2-Factor Authentication & Multi-Session Protection
        </div>
    </div>
</body>
</html>
"""
        else:
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
            
            msg["Subject"] = f"🔐 Your Hirna {subject_title}: {otp_code}"
            msg["From"] = f"Hirna TNVS Security <{GMAIL_SENDER}>"
            msg["To"] = recipient_email

            text_body = f"""Hirna TNVS Platform Security
----------------------------------------
Your One-Time Passkey (OTP) is: {otp_code}

Purpose: {subject_title}
This verification code was requested for {recipient_email} to {action_desc}.
It is valid for 5 minutes. Do NOT share this code with anyone.

Hirna: Transport & Delivery System (Team 10)
"""

            html_body = f"""
<!DOCTYPE html>
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

        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
            server.login(GMAIL_SENDER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_SENDER, [recipient_email], msg.as_string())
        print(f"[✓] Email successfully delivered to: {recipient_email} (Purpose: {purpose})")
        return True
    except Exception as e:
        print(f"[!] Gmail SMTP dispatch error to {recipient_email}: {e}")
        return False

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        if self.path.startswith('/api/send-otp'):
            query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            email = query.get('email', ['User'])[0]
            code = query.get('code', ['123456'])[0]
            purpose = query.get('purpose', ['login'])[0]
            device = query.get('device', ['Windows PC'])[0]
            ip = query.get('ip', ['120.28.17.44'])[0]
            browser = query.get('browser', ['Web Browser'])[0]
            location = query.get('location', ['Metro Manila, PH'])[0]

            # Dispatch REAL Gmail OTP email asynchronously
            threading.Thread(
                target=send_real_email_otp,
                args=(email, code, purpose, device, ip, browser, location),
                daemon=True
            ).start()

            resp_body = json.dumps({
                'status': 'dispatched',
                'email': email,
                'code': code,
                'purpose': purpose,
                'device': device,
                'ip': ip,
                'browser': browser,
                'location': location,
                'channel': 'gmail_smtp',
                'sender': GMAIL_SENDER,
                'email_sent': True
            }).encode('utf-8')

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(resp_body)))
            self.end_headers()
            self.wfile.write(resp_body)
            try:
                self.wfile.flush()
            except Exception:
                pass
            return

        if self.path.startswith('/api/route'):
            query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            try:
                start = query.get('start', [''])[0].split(',')
                end = query.get('end', [''])[0].split(',')
                lat1, lng1 = float(start[0]), float(start[1])
                lat2, lng2 = float(end[0]), float(end[1])
                osrm_url = f"http://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson&steps=true"
                req = urllib.request.Request(osrm_url, headers={'User-Agent': 'HirnaTNVS/1.0'})
                with urllib.request.urlopen(req, timeout=5) as resp:
                    data = resp.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                try:
                    self.wfile.flush()
                except Exception:
                    pass
                return
            except Exception as e:
                err_body = json.dumps({'code': 'Error', 'message': str(e)}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err_body)))
                self.end_headers()
                self.wfile.write(err_body)
                try:
                    self.wfile.flush()
                except Exception:
                    pass
                return
        super().do_GET()

    # Disable caching for instant updates & enable CORS
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def find_available_server():
    candidate_ports = [8000, 8001, 8002, 8003, 8080, 8081, 8888]
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    for p in candidate_ports:
        s = None
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.bind(("0.0.0.0", p))
            s.close()
            server = socketserver.ThreadingTCPServer(("0.0.0.0", p), Handler)
            return server, p
        except OSError:
            if s:
                try:
                    s.close()
                except Exception:
                    pass
            continue
    # Fallback to OS assigned free port
    server = socketserver.ThreadingTCPServer(("0.0.0.0", 0), Handler)
    return server, server.server_address[1]

def main():
    os.chdir(DIRECTORY)
    httpd, port = find_available_server()
    url = f"http://localhost:{port}/main.html"
    
    print("=" * 70)
    print(" [HIRNA MOBILITY SOLUTIONS - TNVS TEAM 10 PLATFORM]")
    print("=" * 70)
    print(f"[*] Main Portal:     {url}")
    print(f"[*] Login Page:      http://localhost:{port}/login.html")
    print(f"[*] Booking Module:  http://localhost:{port}/booking.html")
    print("[*] Serving all Submodules + AI Engines + WinRT Notification Bridge")
    print(f"[*] Local Server is ACTIVE on 0.0.0.0 (Port {port})")
    print("[*] Press Ctrl+C in this terminal window to stop the server anytime.")
    print("=" * 70)

    if not os.environ.get('NO_BROWSER'):
        try:
            webbrowser.open(url)
        except Exception as e:
            print(f"[!] Please open your browser and navigate to: {url}")

    with httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[*] Server shutting down cleanly. Goodbye!")
            sys.exit(0)

if __name__ == '__main__':
    main()
