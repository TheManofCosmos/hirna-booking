import subprocess
import re
import sys

def main():
    cmd = [
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        '--headless',
        '--disable-gpu',
        '--virtual-time-budget=8000',
        '--dump-dom',
        'http://localhost:8000/test_suite.html'
    ]
    print("Launching Edge headless test runner...")
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=25)
    
    match = re.search(r'<pre id="test-results">([\s\S]*?)</pre>', res.stdout)
    if match:
        results = match.group(1).strip()
        print("\n=== BROWSER TEST EXECUTION RESULTS ===")
        print(results)
        print("======================================\n")
        if "[FAIL]" in results or "[ERROR]" in results:
            print("FAILED: Some browser tests failed!")
            sys.exit(1)
        else:
            print("SUCCESS: All browser tests PASSED successfully!")
            sys.exit(0)
    else:
        print("Could not find <pre id='test-results'>. Full stdout:")
        print(res.stdout[:2000])
        print("Stderr:")
        print(res.stderr[:2000])
        sys.exit(2)

if __name__ == '__main__':
    main()
