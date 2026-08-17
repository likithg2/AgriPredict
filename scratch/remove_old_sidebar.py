import re

filepath = r"d:\antigravity\major proj\AI-Drive-post-harvest-loss-prediction--main\pages\1_📊_ML_Prediction.py"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# We want to remove:
# st.markdown(t("<h2 style='text-align: center; color: #8B1A1A;'> 🏛️  BIT</h2>"), unsafe_allow_html=True)
# selected_lang = st.selectbox(" 🌐  Language /  ಭಾಷೆ  /  भाषा ", ["English", "Kannada (ಕನ್ನಡ)", "Hindi (हिंदी)"], index=0)
# st.markdown(f"### {txt['sidebar_hdr']}\n**{txt['sidebar_dept']}**")

# First, remove the BIT logo
content = re.sub(r'st\.markdown\(t\("<h2[^>]+> 🏛️  BIT</h2>"\),\s*unsafe_allow_html=True\)', '', content)

# Second, remove the selectbox
content = re.sub(r'selected_lang\s*=\s*st\.selectbox\([^)]+\)', '', content)

# Third, remove the sidebar headers
content = re.sub(r'st\.markdown\(f"### \{txt\[\'sidebar_hdr\'\]\}\\n\*\*\{txt\[\'sidebar_dept\'\]\}\*\*"\)', '', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed old language selector and BIT headers from ML_Prediction.py")
