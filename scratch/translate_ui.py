import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # If the file doesn't have the translator import, add it
    if 'from utils.translator import t' not in content:
        content = content.replace('import streamlit as st', 'import streamlit as st\nfrom utils.translator import t')

    # Regex patterns for common single-line strings
    # Match st.xxx("Some text") -> st.xxx(t("Some text"))
    # Be careful not to match variables, f-strings, or if already wrapped in t()
    
    # Simple strings in st.markdown, st.header, st.subheader, st.title, st.success, st.warning, st.error, st.info
    funcs = ['markdown', 'header', 'subheader', 'title', 'success', 'warning', 'error', 'info', 'button', 'text_input', 'number_input', 'selectbox', 'radio']
    
    for func in funcs:
        # Matches st.func("String") -> st.func(t("String"))
        pattern = rf'st\.{func}\(\s*(["\'])(.*?)\1'
        
        def replacer(match):
            quote = match.group(1)
            text = match.group(2)
            if 'unsafe_allow_html' in text or 'key=' in text or '{' in text:
                return match.group(0) # skip f-string like or kwargs
            return f'st.{func}(t({quote}{text}{quote})'
            
        content = re.sub(pattern, replacer, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

process_file(r"d:\antigravity\major proj\AI-Drive-post-harvest-loss-prediction--main\pages\4_📜_Prediction_History.py")
print("Done processing History")
