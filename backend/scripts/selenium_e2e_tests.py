import subprocess
import sys
import os

def run_tests():
    print("Starting Comprehensive Selenium E2E Test Suite...")
    print("Executing 'python manage.py test rates.e2e_tests'")
    
    # Ensure we run from project root
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    try:
        result = subprocess.run(
            [sys.executable, "manage.py", "test", "rates.e2e_tests", "tests.test_e2e_tenant_isolation_selenium", "-v", "2", "--keepdb"],
            cwd=project_root,
            check=True
        )
        print("All E2E scenarios completed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"E2E Test Suite failed with exit code {e.returncode}")
        sys.exit(e.returncode)

if __name__ == "__main__":
    run_tests()
