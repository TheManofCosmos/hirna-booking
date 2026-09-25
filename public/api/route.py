from http.server import BaseHTTPRequestHandler
import urllib.parse
import urllib.request
import json

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def do_GET(self):
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        try:
            start = query.get('start', [''])[0].split(',')
            end = query.get('end', [''])[0].split(',')
            lat1, lng1 = float(start[0]), float(start[1])
            lat2, lng2 = float(end[0]), float(end[1])
            osrm_url = f"http://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson&steps=true"
            req = urllib.request.Request(osrm_url, headers={'User-Agent': 'HirnaTNVS/1.0'})
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = resp.read()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        except Exception as e:
            err_body = json.dumps({'code': 'Error', 'message': str(e)}).encode('utf-8')
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(err_body)))
            self.end_headers()
            self.wfile.write(err_body)
            return
