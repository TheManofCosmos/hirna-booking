from http.server import BaseHTTPRequestHandler
import urllib.parse
import json
import os

DIRECTORY = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def get_db_path():
    p = os.path.join(DIRECTORY, 'database', 'data.json')
    if not os.path.exists(p):
        p = os.path.join(DIRECTORY, 'public', 'database', 'data.json')
    return p

def read_db():
    p = get_db_path()
    if os.path.exists(p):
        try:
            with open(p, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def write_db(data):
    paths = [
        os.path.join(DIRECTORY, 'database', 'data.json'),
        os.path.join(DIRECTORY, 'public', 'database', 'data.json')
    ]
    for p in paths:
        try:
            os.makedirs(os.path.dirname(p), exist_ok=True)
            with open(p, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
        except Exception:
            pass

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        table = query.get('table', [None])[0]
        db = read_db()

        if table:
            resp_data = db.get(table, [])
        else:
            resp_data = db

        body = json.dumps(resp_data).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8')
        try:
            payload = json.loads(post_data) if post_data else {}
            db = read_db()
            table = payload.get('table')
            action = payload.get('action', 'insert') # 'insert', 'update', 'archive', 'sync_all'

            if action == 'sync_all':
                tables_data = payload.get('data', {})
                if isinstance(tables_data, dict):
                    for tbl, records in tables_data.items():
                        if not isinstance(records, list):
                            continue
                        if tbl not in db:
                            db[tbl] = []
                        # Merge records by id or booking_code
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
                write_db(db)
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
                    write_db(db)
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
                    write_db(db)
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
                    write_db(db)
                    resp = {'status': 'ok', 'record': archived_item, 'table': table}
                else:
                    resp = {'status': 'error', 'message': f'Unknown action {action}'}
            else:
                resp = {'status': 'error', 'message': 'Missing table or data'}

            body = json.dumps(resp).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        except Exception as e:
            err = json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8')
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(err)))
            self.end_headers()
            self.wfile.write(err)
