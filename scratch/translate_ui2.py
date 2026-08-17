import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'from utils.translator import t' not in content:
        content = content.replace('import streamlit as st', 'import streamlit as st\nfrom utils.translator import t')

    # Remove the st.sidebar.radio
    content = re.sub(r'selected_lang\s*=\s*st\.sidebar\.radio\([^)]+\)\n', '', content)
    
    # We will dynamically translate the txt dictionary so the old keys still work!
    content = content.replace('txt = LANG_DICT[selected_lang]', 'txt = {k: t(v) for k, v in LANG_DICT["English"].items()}')

    funcs = ['markdown', 'header', 'subheader', 'title', 'success', 'warning', 'error', 'info']
    
    def replacer(match):
        func = match.group(0).split('(')[0].replace('st.', '')
        prefix = match.group(1) # captures f, r, b etc or empty
        quote = match.group(2)
        text = match.group(3)
        
        if 't(' in text or 'f' in prefix.lower() or '{' in text or '<div' in text or '<style' in text or '<span' in text:
            return match.group(0)
            
        return f'st.{func}(t({quote}{text}{quote})'
        
    for func in funcs:
        pattern = rf'st\.{func}\(\s*([a-zA-Z]*)(["\'])(.*?)\2'
        content = re.sub(pattern, replacer, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

process_file(r"d:\antigravity\major proj\AI-Drive-post-harvest-loss-prediction--main\pages\1_📊_ML_Prediction.py")
print("Done processing ML Prediction")
