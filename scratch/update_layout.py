import re

filepath = r"d:\antigravity\major proj\AI-Drive-post-harvest-loss-prediction--main\pages\1_📊_ML_Prediction.py"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace columns with containers
content = content.replace(
    'col_in, col_out = st.columns([1,1], gap="large")',
    'col_in = st.container()\ncol_out = st.container()'
)

# 2. Remove the empty state image and info message
# We will just remove the whole else block that has the info_msg
pattern = r"else:\s*st\.info\(txt\[\"info_msg\"\]\)\s*st\.image\([^)]+\)"
content = re.sub(pattern, '', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Layout updated.")
