from http.server import BaseHTTPRequestHandler
import urllib.parse
import urllib.request
import json
import os

MAPBOX_ACCESS_TOKEN = os.environ.get("MAPBOX_ACCESS_TOKEN", "").strip()

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
            
            mb_token = query.get('token', [''])[0].strip() or MAPBOX_ACCESS_TOKEN
            route_json = None

            # 1. Attempt Mapbox driving-traffic if token provided
            if mb_token:
                try:
                    mapbox_url = (
                        f"https://api.mapbox.com/directions/v5/mapbox/driving-traffic/"
                        f"{lng1},{lat1};{lng2},{lat2}"
                        f"?overview=full&geometries=geojson&steps=true"
                        f"&annotations=congestion,duration,distance"
                        f"&access_token={mb_token}"
                    )
                    mb_req = urllib.request.Request(mapbox_url, headers={'User-Agent': 'HirnaTNVS/1.0'})
                    with urllib.request.urlopen(mb_req, timeout=6) as mb_resp:
                        if mb_resp.status == 200:
                            mb_data = json.loads(mb_resp.read().decode('utf-8'))
                            if mb_data.get('code') == 'Ok' and mb_data.get('routes'):
                                mb_route = mb_data['routes'][0]
                                duration_traffic = mb_route.get('duration', 0)
                                duration_typical = mb_route.get('duration_typical', duration_traffic)
                                
                                congestions = []
                                for leg in mb_route.get('legs', []):
                                    ann = leg.get('annotation', {})
                                    congestions.extend(ann.get('congestion', []))
                                
                                heavy_count = sum(1 for c in congestions if c in ['heavy', 'severe'])
                                mod_count = sum(1 for c in congestions if c == 'moderate')
                                total_segs = max(1, len(congestions))
                                
                                congestion_level = 'low'
                                if (heavy_count / total_segs) > 0.20:
                                    congestion_level = 'severe'
                                elif (heavy_count / total_segs) > 0.08 or (mod_count / total_segs) > 0.25:
                                    congestion_level = 'heavy'
                                elif (mod_count / total_segs) > 0.10:
                                    congestion_level = 'moderate'

                                route_json = {
                                    'code': 'Ok',
                                    'provider': 'mapbox',
                                    'traffic_aware': True,
                                    'traffic_telemetry': {
                                        'congestion_level': congestion_level,
                                        'duration_traffic_sec': duration_traffic,
                                        'duration_typical_sec': duration_typical,
                                        'congestion_ratio': round(duration_traffic / max(1, duration_typical), 2)
                                    },
                                    'routes': mb_data['routes'],
                                    'waypoints': mb_data.get('waypoints', [])
                                }
                except Exception as mb_err:
                    pass

            # 2. OSRM fallback if Mapbox token absent or request failed
            if not route_json:
                osrm_url = f"http://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson&steps=true"
                req = urllib.request.Request(osrm_url, headers={'User-Agent': 'HirnaTNVS/1.0'})
                with urllib.request.urlopen(req, timeout=8) as resp:
                    raw_data = resp.read()
                    parsed = json.loads(raw_data.decode('utf-8'))
                    parsed['provider'] = 'osrm'
                    parsed['traffic_aware'] = False
                    route_json = parsed

            data = json.dumps(route_json).encode('utf-8')
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
