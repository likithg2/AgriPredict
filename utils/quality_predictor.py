import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import Dense

# Monkey-patch Dense.from_config to strip quantization_config (Keras 2 artifact)
original_from_config = Dense.from_config
@classmethod
def custom_from_config(cls, config):
    config.pop('quantization_config', None)
    return original_from_config.__get__(None, cls)(config)

Dense.from_config = custom_from_config

# Load model only once when the app starts
model = load_model("models/vegetable_quality_model.keras")

class_names = [
    'freshapples',
    'freshbanana',
    'freshbittergroud',
    'freshcapsicum',
    'freshcucumber',
    'freshokra',
    'freshonion',
    'freshoranges',
    'freshpotato',
    'freshtomato',
    'rottenapples',
    'rottenbanana',
    'rottenbittergroud',
    'rottencapsicum',
    'rottencucumber',
    'rottenokra',
    'rottenonion',
    'rottenoranges',
    'rottenpotato',
    'rottentomato'
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

    predicted_class = class_names[predicted_index]

    confidence = float(prediction[0][predicted_index] * 100)

    # Separate quality and crop
    if predicted_class.startswith("fresh"):
        quality = "Fresh"
        crop = predicted_class.replace("fresh", "")
    else:
        quality = "Rotten"
        crop = predicted_class.replace("rotten", "")

    crop = crop.capitalize()

    return crop, quality, confidence