import os
import sqlite3
import bcrypt
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA busy_timeout=30000;")
    conn.row_factory = sqlite3.Row
    return conn

def dict_cursor(conn):
    """Return a cursor for the given connection (uses sqlite3.Row)."""
    return conn.cursor()

def hash_password(plain_password: str) -> str:
    """Hash a plain text password using bcrypt."""
    return bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        # If the stored password is not a valid bcrypt hash (legacy plain-text),
        # fall back to direct comparison
        return plain_password == hashed_password

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create tables (SQLite syntax)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Active',
        name TEXT DEFAULT '',
        phone TEXT DEFAULT ''
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Open',
        user_email TEXT NOT NULL,
        created_at TEXT NOT NULL,
        assigned_expert TEXT DEFAULT '',
        expert_email TEXT DEFAULT '',
        expert_phone TEXT DEFAULT ''
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        "user" TEXT NOT NULL,
        action TEXT NOT NULL,
        time TEXT NOT NULL,
        type TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS kb_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        module TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_size TEXT NOT NULL,
        uploaded_by TEXT NOT NULL DEFAULT 'admin@company.com',
        uploaded_at TEXT NOT NULL
    )
    """)

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

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'info',
        link TEXT DEFAULT '',
        is_read INTEGER DEFAULT 0,
        recipient_role TEXT DEFAULT 'admin',
        recipient_email TEXT DEFAULT '',
        created_at TEXT NOT NULL
    )
    """)
    
    conn.commit()
    
    # Simple migration: add columns if they don't exist
    migrations = [
        "ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'Active'",
        "ALTER TABLE users ADD COLUMN name TEXT DEFAULT ''",
        "ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ''",
        "ALTER TABLE tickets ADD COLUMN assigned_expert TEXT DEFAULT ''",
        "ALTER TABLE tickets ADD COLUMN expert_email TEXT DEFAULT ''",
        "ALTER TABLE tickets ADD COLUMN expert_phone TEXT DEFAULT ''",
        "ALTER TABLE notifications ADD COLUMN recipient_role TEXT DEFAULT 'admin'",
        "ALTER TABLE notifications ADD COLUMN recipient_email TEXT DEFAULT ''",
    ]
    for sql in migrations:
        try:
            cursor.execute(sql)
            conn.commit()
        except Exception:
            # Column already exists or table issue, safe to ignore in sqlite
            pass
    
    # Seed default data if users table is empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        # Seed users with bcrypt hashed passwords
        admin_hash = hash_password("admin123")
        employee_hash = hash_password("employee123")
        expert_hash = hash_password("expert123")
        
        cursor.execute("INSERT INTO users (email, password, role, name, phone) VALUES (?, ?, ?, ?, ?)", ("admin@company.com", admin_hash, "admin", "System Administrator", "+923001234567"))
        cursor.execute("INSERT INTO users (email, password, role, name, phone) VALUES (?, ?, ?, ?, ?)", ("employee@company.com", employee_hash, "employee", "Farhan Khan", "+923219876543"))
        cursor.execute("INSERT INTO users (email, password, role, name, phone) VALUES (?, ?, ?, ?, ?)", ("expert@company.com", expert_hash, "expert", "SAP Expert Consultant", "+923331112223"))
        
        # Seed settings
        cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ("confidence_threshold", "1.1"))
        
        # Seed initial tickets
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        initial_tickets = [
            ("FI Posting Error", "Unable to post financial documents for module FI. Error code: F5080.", "FI", "High", "Open", "employee@company.com", now_str),
            ("Password Reset", "Reset password for SAP GUI client login.", "Basis", "Low", "Resolved", "employee@company.com", now_str),
            ("MM Purchase Order Error", "Purchase order cannot be approved due to release strategy block.", "MM", "Medium", "Open", "employee@company.com", now_str),
        ]
        for t in initial_tickets:
            cursor.execute("INSERT INTO tickets (title, description, category, priority, status, user_email, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", t)
        
        # Seed initial audit logs
        initial_logs = [
            ("System Admin", "Database seeded and initialized", now_str, "system"),
            ("employee@company.com", "Created ticket #1 (FI Posting Error)", now_str, "ticket"),
        ]
        for log in initial_logs:
            cursor.execute('INSERT INTO audit_logs ("user", action, time, type) VALUES (?, ?, ?, ?)', log)

        # Seed Knowledge Base documents (demo entries)
        initial_kb_docs = [
            ("SAP Finance Posting SOP", "SOP", "FI", "sap_finance_posting_sop.pdf", "1.2 MB", "admin@company.com", now_str),
            ("SAP Material Management Guide", "Guide", "MM", "mm_guide.pdf", "4.5 MB", "admin@company.com", now_str),
            ("Sales & Distribution Customer Master FAQ", "FAQ", "SD", "sd_customer_faq.pdf", "320 KB", "admin@company.com", now_str),
            ("HR Time & Attendance SOP", "SOP", "HR", "hr_attendance_sop.pdf", "2.1 MB", "admin@company.com", now_str),
            ("Common Transaction Code Cheat Sheet", "Guide", "General", "tcode_cheatsheet.pdf", "850 KB", "admin@company.com", now_str),
        ]
        for doc in initial_kb_docs:
            cursor.execute(
                "INSERT INTO kb_documents (title, category, module, filename, file_size, uploaded_by, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                doc
            )

        conn.commit()
    else:
        # One-time migration: convert any plain-text passwords to bcrypt hashes
        _migrate_plaintext_passwords(conn)
        
    # Ensure expert user exists in database
    cursor.execute("SELECT COUNT(*) FROM users WHERE email = ?", ("expert@company.com",))
    if cursor.fetchone()[0] == 0:
        expert_hash = hash_password("expert123")
        cursor.execute("INSERT INTO users (email, password, role, name, phone) VALUES (?, ?, ?, ?, ?)", 
                       ("expert@company.com", expert_hash, "expert", "SAP Expert Consultant", "+923331112223"))
        conn.commit()
        print("[MIGRATION] Seeded default expert@company.com user.")
        
    # Seed initial notifications if table is empty
    cursor.execute("SELECT COUNT(*) FROM notifications")
    if cursor.fetchone()[0] == 0:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        initial_notifications = [
            ("Low Confidence Escalation", "AI flagged low confidence on SAP query: 'Error ME013 Purchase Order block'", "escalation", "/admin/tickets", 0, now_str),
            ("New Ticket Created", "Ticket #1 (FI Posting Error) created by employee@company.com", "ticket", "/admin/tickets", 0, now_str),
            ("New User Registration", "Employee Farhan Khan (employee@company.com) registered", "user", "/admin/analytics", 1, now_str),
            ("System Ready", "Enterprise Support AI Assistant initialized with Groq LLaMA-3.3", "system", "/admin/config", 1, now_str),
        ]
        for notif in initial_notifications:
            cursor.execute(
                "INSERT INTO notifications (title, message, type, link, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                notif
            )
        conn.commit()

    conn.close()

def create_notification(
    title: str, 
    message: str, 
    notif_type: str = "info", 
    link: str = "", 
    recipient_role: str = "admin", 
    recipient_email: str = ""
):
    """Create a new notification for administrators, experts, or specific users."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        try:
            cursor.execute(
                "INSERT INTO notifications (title, message, type, link, is_read, recipient_role, recipient_email, created_at) VALUES (?, ?, ?, ?, 0, ?, ?, ?)",
                (title, message, notif_type, link, recipient_role, recipient_email, now)
            )
        except Exception:
            # Fallback for legacy schema without recipient columns
            cursor.execute(
                "INSERT INTO notifications (title, message, type, link, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)",
                (title, message, notif_type, link, now)
            )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[NOTIFICATION ERROR] Failed to create notification: {e}")

def _migrate_plaintext_passwords(conn):
    """Migrate any existing plain-text passwords to bcrypt hashes."""
    cursor = dict_cursor(conn)
    cursor.execute("SELECT id, password FROM users")
    rows = cursor.fetchall()
    migrated = 0
    # Create a normal cursor for updates to avoid potential row_factory issues if any
    update_cursor = conn.cursor()
    for row in rows:
        user_id = row["id"]
        stored_pw = row["password"]
        # bcrypt hashes always start with '$2b$' or '$2a$'
        if not stored_pw.startswith("$2b$") and not stored_pw.startswith("$2a$"):
            hashed = hash_password(stored_pw)
            update_cursor.execute("UPDATE users SET password = ? WHERE id = ?", (hashed, user_id))
            migrated += 1
    if migrated > 0:
        conn.commit()
        print(f"[MIGRATION] Converted {migrated} plain-text password(s) to bcrypt hashes.")

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully with SQLite!")
