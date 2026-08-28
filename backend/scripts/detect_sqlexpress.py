import pyodbc
import sys

def check_conn():
    drivers = [
        '{ODBC Driver 17 for SQL Server}',
        '{ODBC Driver 18 for SQL Server}',
        '{SQL Server}'
    ]
    servers = [
        '.\\SQLEXPRESS',
        '(local)',
        'localhost',
        '127.0.0.1',
        'localhost\\SQLEXPRESS'
    ]
    
    for driver in drivers:
        for server in servers:
            try:
                # Use TrustServerCertificate=yes for Driver 18
                conn_str = f'DRIVER={driver};SERVER={server};Trusted_Connection=yes;TrustServerCertificate=yes;'
                conn = pyodbc.connect(conn_str, timeout=3)
                print(f"Success with {driver} on {server}")
                cursor = conn.cursor()
                cursor.execute("SELECT @@VERSION")
                print(cursor.fetchone()[0])
                conn.close()
                return True
            except pyodbc.Error as e:
                pass
    print("Failed to connect to any common local instance")
    return False

if __name__ == "__main__":
    check_conn()
