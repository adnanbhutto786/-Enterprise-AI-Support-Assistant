import os

pages = ['Dashboard', 'AIChat', 'KnowledgeBase', 'TicketManagement', 'Analytics', 'Reports', 'AdminPanel', 'Login']
os.makedirs('src/pages', exist_ok=True)

for page in pages:
    with open(f'src/pages/{page}.tsx', 'w') as f:
        f.write(f'''export default function {page}() {{
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">{page}</h1>
      <p className="text-muted-foreground">This page is currently under construction.</p>
    </div>
  )
}}
''')
