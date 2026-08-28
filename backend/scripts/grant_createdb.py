import psycopg
try:
    with psycopg.connect("dbname=postgres user=postgres password=postgres host=127.0.0.1") as conn:
        conn.autocommit = True
        conn.execute("ALTER ROLE pricing_logistics_app CREATEDB;")
    print("Granted CREATEDB to pricing_logistics_app")
except Exception as e:
    print(f"Error: {e}")
