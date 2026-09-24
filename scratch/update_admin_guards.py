import os
import re

admin_files = [
    'main.html',
    'booking.html',
    'payments.html',
    'crm.html',
    'gps.html',
    'analytics.html',
    'audit.html',
    'sso.html'
]

old_pattern = re.compile(
    r'<script>\s*\(function\(\)\s*\{[\s\S]*?var sessionUser = sessionStorage\.getItem\(\'hirna_auth_user\'\);[\s\S]*?\}\)\(\);\s*</script>',
    re.MULTILINE
)

new_guard = """<script>
        (function() {
            try {
                var raw = localStorage.getItem('hirna_auth_user') || sessionStorage.getItem('hirna_auth_user');
                if (!raw) {
                    window.location.replace('login.html');
                    return;
                }
                var user = JSON.parse(raw);
                if (user && user.role === 'passenger') {
                    window.location.replace('passenger.html');
                }
            } catch (e) {
                window.location.replace('login.html');
            }
        })();
    </script>"""

for fname in admin_files:
    for base_dir in ['', 'public/']:
        filepath = os.path.join(base_dir, fname)
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            if old_pattern.search(content):
                updated = old_pattern.sub(new_guard, content, count=1)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(updated)
                print(f"Updated guard in {filepath}")
            else:
                print(f"Pattern not found in {filepath}")

print("Done updating admin guards!")
