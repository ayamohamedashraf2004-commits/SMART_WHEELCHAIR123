import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("postgresql://postgres.jqlczjccjkzxqobmiykd:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres")


