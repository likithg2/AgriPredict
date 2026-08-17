import re

filepath = r"d:\antigravity\major proj\AI-Drive-post-harvest-loss-prediction--main\pages\1_📊_ML_Prediction.py"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
        if res['shelf'] <= 1.0:
            st.error(t(f"⚠️ **CRITICAL OPTIMIZATION ALERT:** Crop has an ultra-short remaining shelf life ({res['shelf']:.2f} days). The system has bypassed distant high-price facilities and prioritized the closest safe storage nodes to prevent total inventory decay."))
        else:
            rec_txt = t('Immediate sale advised. Avoid further transport. Contact cold storage if unsold by tomorrow.') if risk == "HIGH" else t('Monitor crop condition and prepare for transport within 48 hours.')
            st.markdown(f'<div class="rec-box"><b>📌 {t("Action Recommendation")}:</b><br>{rec_txt}</div>', unsafe_allow_html=True)
"""

# I will use a regex to match the if/else block starting from `if res['shelf'] <= 1.0:` up to `unsafe_allow_html=True)`
pattern = r"if res\['shelf'\] <= 1\.0:[\s\S]*?unsafe_allow_html=True\)"
content = re.sub(pattern, replacement.strip(), content)

# Check for any other selected_lang
content = re.sub(r'selected_lang', 'get_lang()', content)

# Ensure get_lang is imported
if 'from utils.translator import get_lang' not in content:
    content = content.replace('from utils.translator import t', 'from utils.translator import t, get_lang')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced selected_lang references.")
