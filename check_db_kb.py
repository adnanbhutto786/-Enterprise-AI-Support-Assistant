import os, sqlite3

DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")
KB_UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads", "kb")

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()
cursor.execute("SELECT * FROM kb_documents WHERE id = 1")
row = cursor.fetchone()
print("Row from DB:", dict(row))
filename = row["filename"]
file_path = os.path.join(KB_UPLOAD_DIR, filename)
print("File path:", file_path)
print("Exists on disk?:", os.path.exists(file_path))
conn.close()
