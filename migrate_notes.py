import sqlite3, os
DB = os.path.join(os.path.dirname(__file__), 'database.db')
conn = sqlite3.connect(DB)
cursor = conn.cursor()

# Add expert_email and expert_phone to tickets
for col in ['expert_email', 'expert_phone']:
    try:
        cursor.execute(f"ALTER TABLE tickets ADD COLUMN {col} TEXT DEFAULT ''")
        conn.commit()
        print(f'{col} column added!')
    except sqlite3.OperationalError as e:
        print(f'{col}: {e}')

# Create ticket_notes table
cursor.execute('''
CREATE TABLE IF NOT EXISTS ticket_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    author TEXT NOT NULL,
    author_role TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
)
''')
conn.commit()
print('ticket_notes table ready!')
conn.close()
