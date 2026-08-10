import requests

login_res = requests.post("http://localhost:8000/api/login", json={"email": "admin@company.com", "password": "admin123"})
token = login_res.json()["token"]
headers = {"Authorization": f"Bearer {token}"}

down_res = requests.get("http://localhost:8000/api/kb/download/1", headers=headers)
print("Status:", down_res.status_code)
print("Headers:", down_res.headers.get("Content-Disposition"))
print("First 200 chars:\n", down_res.text[:200])
