import os
import numpy as np
from PIL import Image

# Robust Keras import: try tf.keras (TF 2.x built-in), then tf_keras shim, then standalone keras
try:
    import tensorflow as tf
    from tensorflow.keras.models import load_model
    from tensorflow.keras.layers import Dense
    _keras_source = "tensorflow.keras"
except (ImportError, AttributeError):
    try:
        import tf_keras
        from tf_keras.models import load_model
        from tf_keras.layers import Dense
        _keras_source = "tf_keras"
    except ImportError:
        from keras.models import load_model
        from keras.layers import Dense
        _keras_source = "keras"

# Monkey-patch Dense.from_config to strip quantization_config (Keras 2 artifact)
original_from_config = Dense.from_config
@classmethod
def custom_from_config(cls, config):
    config.pop('quantization_config', None)
    return original_from_config.__get__(None, cls)(config)
Dense.from_config = custom_from_config

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_path = os.path.join(BASE_DIR, "models", "vegetable_quality_v5_model.keras")
model = load_model(model_path, compile=False)


# Keras models do not store string labels. If the model outputs 8 classes, we define 8 temporary labels.
# The user can update these 8 labels to match the exact crops they trained on.
class_names_8 = [
    'freshcucumber', 'freshonion', 'freshpotato', 'freshtomato',
    'rottencucumber', 'rottenonion', 'rottenpotato', 'rottentomato'
]

class_names_20 = [
    'freshapples', 'freshbanana', 'freshbittergroud', 'freshcapsicum', 'freshcucumber', 'freshokra', 'freshonion', 'freshoranges', 'freshpotato', 'freshtomato',
    'rottenapples', 'rottenbanana', 'rottenbittergroud', 'rottencapsicum', 'rottencucumber', 'rottenokra', 'rottenonion', 'rottenoranges', 'rottenpotato', 'rottentomato'
]

IMG_SIZE = (224, 224)

def predict_quality(uploaded_file):
    # Read image
    img = Image.open(uploaded_file).convert("RGB")
    img = img.resize(IMG_SIZE)

    # Convert to NumPy
    img_array = np.array(img, dtype=np.float32)

    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)

    # Predict
    prediction = model.predict(img_array, verbose=0)
    
    predicted_index = np.argmax(prediction)
    
    # Choose the correct label list based on model output size
    num_classes = prediction.shape[1]
    if num_classes == 8:
        class_list = class_names_8
    else:
        class_list = class_names_20
        
    predicted_class = class_list[predicted_index]

    confidence = float(prediction[0][predicted_index] * 100)

    # Separate quality and crop
    if predicted_class.startswith("fresh"):
        quality = "Fresh"
        crop = predicted_class.replace("fresh", "")
    else:
        quality = "Rotten"
        crop = predicted_class.replace("rotten", "")

    crop = crop.capitalize()

    # Calculate both fresh and rotten percentages for this specific crop
    fresh_class_name = f"fresh{crop.lower()}"
    rotten_class_name = f"rotten{crop.lower()}"
    
    try:
        fresh_idx = class_list.index(fresh_class_name)
        rotten_idx = class_list.index(rotten_class_name)
        fresh_pct = float(prediction[0][fresh_idx] * 100)
        rotten_pct = float(prediction[0][rotten_idx] * 100)
    except ValueError:
        fresh_pct = confidence if quality == "Fresh" else 0.0
        rotten_pct = confidence if quality == "Rotten" else 0.0

    return crop, quality, confidence, fresh_pct, rotten_pct