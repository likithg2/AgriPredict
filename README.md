# 🌾 Smart Agricultural Supply Chain Optimization using AI & Machine Learning

## 📌 Overview

The Smart Agricultural Supply Chain Optimization System is an AI-powered web application designed to help farmers reduce post-harvest losses by predicting crop spoilage, optimizing transportation decisions, and analyzing vegetable quality using Deep Learning.

The system combines Machine Learning, Deep Learning, weather data, route optimization, and an interactive dashboard to provide intelligent recommendations for storage and transportation.

---

## 🚀 Features

- 🌿 Vegetable Quality Analysis using Deep Learning (MobileNetV2)
- 📈 Crop Spoilage Prediction
- ☁️ Live Weather Data Integration
- 📍 Route Optimization
- 🗺️ Cold Storage Recommendation
- 💰 Financial Loss Estimation
- 🔊 AI-generated Voice Advisory
- 🌐 Multi-language Support (English & Kannada)
- 📊 Interactive Dashboard using Streamlit

---

## 🧠 Technologies Used

### Frontend
- Streamlit
- HTML
- CSS

### Backend
- Python

### Machine Learning
- TensorFlow
- Keras
- MobileNetV2
- Scikit-Learn

### Data Processing
- NumPy
- Pandas
- Pillow

### Visualization
- Plotly
- Folium
- Matplotlib

### APIs
- OpenWeather API
- Gemini API

---

## 📂 Project Structure

```
Smart_Agricultural_Supply_Chain/
│
├── models/
│   ├── vegetable_quality_model.keras
│   └── spoilage_prediction_model.pkl
│
├── utils/
│   ├── quality_predictor.py
│   ├── weather.py
│   ├── prediction.py
│   └── routing.py
│
├── pages/
│   ├── Home.py
│   ├── ML_Prediction.py
│   └── Dashboard.py
│
├── assets/
│
├── data/
│
├── requirements.txt
│
└── app.py
```

---

## 🧠 Machine Learning Modules

### 1. Vegetable Quality Analysis

- MobileNetV2 Transfer Learning
- Image Classification
- 20 Vegetable Classes
- Fresh/Rotten Detection
- Confidence Score Prediction

### 2. Crop Spoilage Prediction

Predicts

- Spoilage Probability
- Remaining Shelf Life
- Financial Loss
- Storage Recommendation

---

## 📊 Dataset

The quality analysis model was trained using a custom dataset containing approximately **27,000+ images** across **20 classes**, including fresh and rotten vegetables.

Classes include:

- Apple
- Banana
- Bitter Gourd
- Capsicum
- Cucumber
- Okra
- Onion
- Orange
- Potato
- Tomato

Each vegetable contains Fresh and Rotten categories.

---

## 🖥️ Installation

Clone the repository

```bash
git clone <repository-link>
```

Navigate to project

```bash
cd Smart_Agricultural_Supply_Chain
```

Create Virtual Environment

```bash
python -m venv venv
```

Activate

Windows

```bash
venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run

```bash
streamlit run app.py
```

---



## Future Improvements

- Real-time IoT Sensor Integration
- Edge Device Deployment
- Additional Crop Support
- Disease Detection

---

## Contributors

- Your Name: Brijesh Gowda C
- Team Members: Akash, Shubham & Likith

---

## License

This project is developed for academic purposes.
