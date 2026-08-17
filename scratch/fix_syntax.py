import re

filepath = r"d:\antigravity\major proj\AI-Drive-post-harvest-loss-prediction--main\pages\1_📊_ML_Prediction.py"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken triple quotes that got matched as single quotes
# The regex replaced st.markdown(""" with st.markdown(t("")"
content = content.replace('st.markdown(t("")"', 'st.markdown("""')
content = content.replace("st.markdown(t('')'", "st.markdown('''")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed syntax errors.")
