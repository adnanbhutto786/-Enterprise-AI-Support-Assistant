import sqlite3
import os
import time

DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")

for attempt in range(10):
    try:
        conn = sqlite3.connect(DB_PATH, timeout=30.0)
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA busy_timeout=30000;")
        cursor = conn.cursor()

        # Ensure ticket_notes table exists
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS ticket_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id INTEGER NOT NULL,
            author TEXT NOT NULL,
            author_role TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """)

        # Migrate notifications columns
        for col_name, col_type in [
            ("recipient_role", "TEXT DEFAULT 'admin'"),
            ("recipient_email", "TEXT DEFAULT ''")
        ]:
            try:
                cursor.execute(f"ALTER TABLE notifications ADD COLUMN {col_name} {col_type}")
                conn.commit()
                print(f"Added column {col_name} to notifications")
            except Exception as e:
                print(f"Column {col_name}: {e}")

        # Migrate tickets columns
        for col_name, col_type in [
            ("assigned_expert", "TEXT DEFAULT ''"),
            ("expert_email", "TEXT DEFAULT ''"),
            ("expert_phone", "TEXT DEFAULT ''")
        ]:
            try:
                cursor.execute(f"ALTER TABLE tickets ADD COLUMN {col_name} {col_type}")
                conn.commit()
                print(f"Added column {col_name} to tickets")
            except Exception as e:
                print(f"Column {col_name}: {e}")

        cursor.execute("PRAGMA table_info(notifications)")
        print("Notifications columns:", [r[1] for r in cursor.fetchall()])

        cursor.execute("PRAGMA table_info(tickets)")
        print("Tickets columns:", [r[1] for r in cursor.fetchall()])

        cursor.execute("PRAGMA table_info(ticket_notes)")
        print("Ticket notes columns:", [r[1] for r in cursor.fetchall()])

        conn.close()
        print("Migration completed successfully!")
        break
    except sqlite3.OperationalError as e:
        print(f"Attempt {attempt+1} failed: {e}. Retrying in 1s...")
        time.sleep(1)
