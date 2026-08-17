import os
import re

pages_dir = r"d:\antigravity\major proj\AI-Drive-post-harvest-loss-prediction--main\pages"
files = os.listdir(pages_dir)

dashboard_file = next((f for f in files if "Dashboard" in f), None)
warehouse_file = next((f for f in files if "Warehouse" in f), None)

login_file = os.path.join(pages_dir, "0_🔐_Login.py")
with open(login_file, "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(r'st\.switch_page\("pages/.*?Dashboard\.py"\)', f'st.switch_page("pages/{dashboard_file}")', content)
content = re.sub(r'st\.switch_page\("pages/.*?Warehouse_Manager\.py"\)', f'st.switch_page("pages/{warehouse_file}")', content)

with open(login_file, "w", encoding="utf-8") as f:
    f.write(content)
