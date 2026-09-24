import subprocess
import re
import sys
import os
import json
import tempfile
import shutil

def test_url_dump(url, preseed_local_storage=None):
    wrapper_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <script>
            try {{
                const data = {json.dumps(preseed_local_storage or {})};
                for (const k in data) {{
                    localStorage.setItem(k, typeof data[k] === 'string' ? data[k] : JSON.stringify(data[k]));
                }}
            }} catch(e) {{}}
            window.location.replace('{url}');
        </script>
    </head>
    <body>Redirecting...</body>
    </html>
    """
    tmp_path = os.path.join(os.getcwd(), 'scratch_redirect_test.html')
    with open(tmp_path, 'w', encoding='utf-8') as f:
        f.write(wrapper_html)
    
    tmp_user_dir = tempfile.mkdtemp(prefix='msedge_test_')
    
    cmd = [
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        '--headless',
        '--disable-gpu',
        '--no-first-run',
        f'--user-data-dir={tmp_user_dir}',
        '--virtual-time-budget=4000',
        '--dump-dom',
        'http://localhost:8000/scratch_redirect_test.html'
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=15)
        stdout = res.stdout
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except:
                pass
        try:
            shutil.rmtree(tmp_user_dir, ignore_errors=True)
        except:
            pass
            
    return stdout

def main():
    print("--- Redirection & Guard Verification ---")

    # TEST 1: Unauthenticated visitor to passenger.html must land on Sign In page (login.html)
    out1 = test_url_dump('passenger.html', preseed_local_storage={})
    assert "Sign In to Your Account" in out1 or "Sign In - Hirna" in out1, "Unauthenticated access to passenger.html failed to redirect to login.html"
    print("[PASS] Unauthenticated visit to passenger.html redirects to login.html")

    # TEST 2: Unauthenticated visitor to main.html must land on Sign In page
    out2 = test_url_dump('main.html', preseed_local_storage={})
    assert "Sign In to Your Account" in out2 or "Sign In - Hirna" in out2, "Unauthenticated access to main.html failed to redirect to login.html"
    print("[PASS] Unauthenticated visit to main.html redirects to login.html")

    # TEST 3: Passenger logged in visiting main.html must redirect to passenger.html
    passenger_session = {
        "hirna_auth_user": {
            "email": "passenger@hirna.ph",
            "name": "Verified Passenger",
            "role": "passenger",
            "roleTitle": "Verified Passenger"
        }
    }
    out3 = test_url_dump('main.html', preseed_local_storage=passenger_session)
    assert "Passenger Portal" in out3, "Passenger accessing main.html failed to redirect to passenger.html"
    assert "1. Booking" in out3 and "2. Fare & Payments" in out3, "Passenger portal tabs not found in passenger.html"
    print("[PASS] Passenger accessing main.html automatically redirects to passenger.html")

    # TEST 4: Passenger logged in visiting booking.html must redirect to passenger.html
    out4 = test_url_dump('booking.html', preseed_local_storage=passenger_session)
    assert "Passenger Portal" in out4, "Passenger accessing booking.html failed to redirect to passenger.html"
    print("[PASS] Passenger accessing booking.html automatically redirects to passenger.html")

    # TEST 5: SuperAdmin visiting main.html remains on main.html
    superadmin_session = {
        "hirna_auth_user": {
            "email": "superadmin@hirna.ph",
            "name": "SuperAdmin Hirna",
            "role": "superadmin",
            "roleTitle": "SuperAdmin (Full Access)"
        }
    }
    out5 = test_url_dump('main.html', preseed_local_storage=superadmin_session)
    assert "Main Operations Portal" in out5, "SuperAdmin visiting main.html was redirected away"
    assert "Enterprise Role-Based Access Control (RBAC) & Accounts Management" in out5, "RBAC Accounts section not found in main.html"
    print("[PASS] SuperAdmin visiting main.html stays on main.html with RBAC Accounts Management")

    print("\nSUCCESS: All redirection and RBAC guards verified successfully!")

if __name__ == '__main__':
    main()
