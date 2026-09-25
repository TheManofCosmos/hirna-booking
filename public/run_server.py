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
from email.header import Header
from email.utils import make_msgid, formatdate

GMAIL_SENDER = os.environ.get("GMAIL_SENDER", "hirnasecurity@gmail.com")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "mukfvbhuiepcocoq")

def send_real_email_otp(recipient_email, otp_code, purpose="login", device="Asus TUF Gaming F15 (Windows 11)", ip="120.28.17.44", browser="Edge", location="Caloocan City, Metro Manila, PH"):
    """Send real OTP email or Security Alert to Gmail inbox using Google App Password."""
    try:
        msg = MIMEMultipart("alternative")
        is_reset = purpose == "reset"
        is_pin = purpose in ["pin_setup", "pin_reset"]
        is_alert = purpose in ["new_login_alert", "security_alert"]
        
        msg["Date"] = formatdate(localtime=True)
        msg["Message-ID"] = make_msgid(domain="gmail.com")
        msg["X-Priority"] = "1"
        msg["Importance"] = "high"

        if is_alert:
            current_time = time.strftime("%Y-%m-%d %H:%M:%S UTC+8")
            msg["Subject"] = Header(f"Hirna Security Alert: New Device Sign-In ({device})", "utf-8").encode()
            msg["From"] = f"Hirna Security <{GMAIL_SENDER}>"
            msg["To"] = recipient_email
            msg["Reply-To"] = GMAIL_SENDER

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

        msg.attach(MIMEText(text_body, "plain", "utf-8"))
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
            server.login(GMAIL_SENDER, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        print(f"[OK] Email successfully delivered to: {recipient_email} (Purpose: {purpose})", flush=True)
        return True
    except Exception as e:
        print(f"[!] Gmail SMTP dispatch error to {recipient_email}: {e}", flush=True)
        return False

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        if self.path.startswith('/api/send-otp') or self.path.startswith('/api/send_otp'):
            query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            email = query.get('email', ['User'])[0]
            code = query.get('code', ['123456'])[0]
            purpose = query.get('purpose', ['login'])[0]
            device = query.get('device', ['Asus TUF Gaming F15 (Windows 11)'])[0]
            ip = query.get('ip', ['120.28.17.44'])[0]
            browser = query.get('browser', ['Web Browser'])[0]
            location = query.get('location', ['Caloocan City, Metro Manila, PH'])[0]

            # Dispatch REAL Gmail OTP email asynchronously
            print(f"[*] /api/send-otp received: email={email}, purpose={purpose}, code={code}", flush=True)
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
        if self.path.startswith('/api/accounts'):
            accounts_path = os.path.join(DIRECTORY, 'database', 'accounts.json')
            if os.path.exists(accounts_path):
                with open(accounts_path, 'r', encoding='utf-8') as f:
                    data = f.read().encode('utf-8')
            else:
                data = json.dumps([]).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        if self.path.startswith('/api/sessions'):
            query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            filter_email = query.get('email', [''])[0].strip().lower()
            sessions_path = os.path.join(DIRECTORY, 'database', 'sessions.json')
            sessions = []
            if os.path.exists(sessions_path):
                try:
                    with open(sessions_path, 'r', encoding='utf-8') as f:
                        sessions = json.load(f)
                except Exception:
                    sessions = []
            if filter_email:
                sessions = [s for s in sessions if s.get('email', '').strip().lower() == filter_email and s.get('status') == 'active']
            data = json.dumps(sessions).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        if self.path.startswith('/api/db') or self.path.startswith('/api/sync-db'):
            query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            table = query.get('table', [None])[0]
            db_path = os.path.join(DIRECTORY, 'database', 'data.json')
            db = {}
            if os.path.exists(db_path):
                try:
                    with open(db_path, 'r', encoding='utf-8') as f:
                        db = json.load(f)
                except Exception:
                    db = {}
            if table:
                resp_data = db.get(table, [])
            else:
                resp_data = db
            data = json.dumps(resp_data).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        super().do_GET()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path.startswith('/api/accounts'):
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                payload = json.loads(body) if body else {}
                accounts_path = os.path.join(DIRECTORY, 'database', 'accounts.json')
                pub_accounts_path = os.path.join(DIRECTORY, 'public', 'database', 'accounts.json')
                
                accounts = []
                if os.path.exists(accounts_path):
                    with open(accounts_path, 'r', encoding='utf-8') as f:
                        accounts = json.load(f)

                if isinstance(payload, list):
                    accounts = payload
                elif isinstance(payload, dict) and payload.get('email'):
                    clean_email = payload['email'].strip().lower()
                    existing_idx = next((i for i, a in enumerate(accounts) if a.get('email', '').strip().lower() == clean_email), -1)
                    if existing_idx >= 0:
                        accounts[existing_idx].update(payload)
                    else:
                        accounts.append(payload)

                os.makedirs(os.path.dirname(accounts_path), exist_ok=True)
                with open(accounts_path, 'w', encoding='utf-8') as f:
                    json.dump(accounts, f, indent=2)

                try:
                    os.makedirs(os.path.dirname(pub_accounts_path), exist_ok=True)
                    with open(pub_accounts_path, 'w', encoding='utf-8') as f:
                        json.dump(accounts, f, indent=2)
                except Exception:
                    pass

                resp_data = json.dumps({'status': 'ok', 'accounts': accounts}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(resp_data)))
                self.end_headers()
                self.wfile.write(resp_data)
                return
            except Exception as e:
                err_resp = json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err_resp)))
                self.end_headers()
                self.wfile.write(err_resp)
                return

        if self.path.startswith('/api/sessions'):
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                payload = json.loads(body) if body else {}
                sessions_path = os.path.join(DIRECTORY, 'database', 'sessions.json')
                pub_sessions_path = os.path.join(DIRECTORY, 'public', 'database', 'sessions.json')

                sessions = []
                if os.path.exists(sessions_path):
                    with open(sessions_path, 'r', encoding='utf-8') as f:
                        sessions = json.load(f)

                action = payload.get('action', 'register')
                if action == 'register' and payload.get('session'):
                    new_sess = payload['session']
                    clean_email = (new_sess.get('email') or '').strip().lower()
                    dev_id = new_sess.get('deviceId')
                    sessions = [s for s in sessions if not (s.get('email', '').strip().lower() == clean_email and s.get('deviceId') == dev_id)]
                    sessions.insert(0, new_sess)
                elif action == 'signout' and payload.get('sessionId'):
                    sid = payload['sessionId']
                    for s in sessions:
                        if s.get('sessionId') == sid:
                            s['status'] = 'revoked'
                    sessions = [s for s in sessions if s.get('sessionId') != sid]
                elif action == 'signout_all' and payload.get('email'):
                    clean_email = payload['email'].strip().lower()
                    curr_dev = payload.get('keepDeviceId')
                    sessions = [s for s in sessions if not (s.get('email', '').strip().lower() == clean_email and s.get('deviceId') != curr_dev)]

                os.makedirs(os.path.dirname(sessions_path), exist_ok=True)
                with open(sessions_path, 'w', encoding='utf-8') as f:
                    json.dump(sessions, f, indent=2)

                try:
                    os.makedirs(os.path.dirname(pub_sessions_path), exist_ok=True)
                    with open(pub_sessions_path, 'w', encoding='utf-8') as f:
                        json.dump(sessions, f, indent=2)
                except Exception:
                    pass

                resp_data = json.dumps({'status': 'ok', 'sessions': sessions}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(resp_data)))
                self.end_headers()
                self.wfile.write(resp_data)
                return
            except Exception as e:
                err_resp = json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err_resp)))
                self.end_headers()
                self.wfile.write(err_resp)
                return

        if self.path.startswith('/api/db') or self.path.startswith('/api/sync-db'):
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            try:
                payload = json.loads(post_data) if post_data else {}
                db_path = os.path.join(DIRECTORY, 'database', 'data.json')
                pub_db_path = os.path.join(DIRECTORY, 'public', 'database', 'data.json')
                db = {}
                if os.path.exists(db_path):
                    try:
                        with open(db_path, 'r', encoding='utf-8') as f:
                            db = json.load(f)
                    except Exception:
                        db = {}

                table = payload.get('table')
                action = payload.get('action', 'insert')

                if action == 'sync_all':
                    tables_data = payload.get('data', {})
                    if isinstance(tables_data, dict):
                        for tbl, records in tables_data.items():
                            if not isinstance(records, list):
                                continue
                            if tbl not in db:
                                db[tbl] = []
                            existing_map = {}
                            for idx, item in enumerate(db[tbl]):
                                k = item.get('booking_code') or item.get('id') or item.get('ticket_id') or item.get('invoice_no')
                                if k:
                                    existing_map[str(k)] = idx
                            for r in records:
                                k = r.get('booking_code') or r.get('id') or r.get('ticket_id') or r.get('invoice_no')
                                if k and str(k) in existing_map:
                                    db[tbl][existing_map[str(k)]].update(r)
                                else:
                                    db[tbl].insert(0, r)
                    resp = {'status': 'ok', 'message': 'Database synced across devices', 'db': db}

                elif table:
                    if table not in db:
                        db[table] = []
                    if action == 'insert':
                        record = payload.get('record', {})
                        if record:
                            k = record.get('booking_code') or record.get('id') or record.get('ticket_id') or record.get('invoice_no')
                            exists = False
                            if k:
                                for idx, item in enumerate(db[table]):
                                    ik = item.get('booking_code') or item.get('id') or item.get('ticket_id') or item.get('invoice_no')
                                    if ik and str(ik) == str(k):
                                        db[table][idx].update(record)
                                        exists = True
                                        break
                            if not exists:
                                db[table].insert(0, record)
                        resp = {'status': 'ok', 'record': record, 'table': table}

                    elif action == 'update':
                        id_val = str(payload.get('id', ''))
                        updates = payload.get('updates', {})
                        updated_item = None
                        for idx, item in enumerate(db[table]):
                            ik = str(item.get('booking_code') or item.get('id') or item.get('ticket_id') or item.get('invoice_no') or '')
                            if ik == id_val:
                                db[table][idx].update(updates)
                                updated_item = db[table][idx]
                                break
                        resp = {'status': 'ok', 'record': updated_item, 'table': table}

                    elif action == 'archive':
                        id_val = str(payload.get('id', ''))
                        reason = payload.get('reason', 'Archived by user')
                        archived_by = payload.get('user', 'superadmin@hirna.ph')
                        archived_item = None
                        for idx, item in enumerate(db[table]):
                            ik = str(item.get('booking_code') or item.get('id') or item.get('ticket_id') or item.get('invoice_no') or '')
                            if ik == id_val:
                                db[table][idx]['is_archived'] = True
                                db[table][idx]['archived_at'] = payload.get('timestamp')
                                db[table][idx]['archived_by'] = archived_by
                                db[table][idx]['archive_reason'] = reason
                                archived_item = db[table][idx]
                                break
                        resp = {'status': 'ok', 'record': archived_item, 'table': table}
                    else:
                        resp = {'status': 'error', 'message': f'Unknown action {action}'}
                else:
                    resp = {'status': 'error', 'message': 'Missing table or data'}

                # Write to disk
                os.makedirs(os.path.dirname(db_path), exist_ok=True)
                with open(db_path, 'w', encoding='utf-8') as f:
                    json.dump(db, f, indent=2)
                try:
                    os.makedirs(os.path.dirname(pub_db_path), exist_ok=True)
                    with open(pub_db_path, 'w', encoding='utf-8') as f:
                        json.dump(db, f, indent=2)
                except Exception:
                    pass

                resp_body = json.dumps(resp).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(resp_body)))
                self.end_headers()
                self.wfile.write(resp_body)
                return

            except Exception as e:
                err_body = json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err_body)))
                self.end_headers()
                self.wfile.write(err_body)
                return

        super().do_POST()

    # Disable caching for instant updates & enable CORS
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
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
