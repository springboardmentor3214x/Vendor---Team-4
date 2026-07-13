import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from urllib.parse import urlparse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("Error: DATABASE_URL not found in .env file.")
    exit(1)

# Parse the database URL
url = urlparse(db_url)
username = url.username
password = url.password
host = url.hostname
port = url.port or 5432
target_db = url.path.lstrip("/")

# Connect to the default 'postgres' database to create the new one
print(f"Connecting to PostgreSQL at {host}:{port} as user '{username}'...")
try:
    conn = psycopg2.connect(
        dbname="postgres",
        user=username,
        password=password,
        host=host,
        port=port
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    # Check if database already exists
    cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{target_db}'")
    exists = cursor.fetchone()
    
    if not exists:
        print(f"Creating database '{target_db}'...")
        cursor.execute(f"CREATE DATABASE {target_db}")
        print(f"Database '{target_db}' created successfully!")
    else:
        print(f"Database '{target_db}' already exists.")
        
    cursor.close()
    conn.close()
    
except Exception as e:
    print("\nUnable to connect to PostgreSQL. Please check if:")
    print("1. PostgreSQL is installed and running on your computer.")
    print("2. Your PostgreSQL username & password match what is in the '.env' file.")
    print(f"\nError Details: {e}")
