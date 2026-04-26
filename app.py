from flask import Flask, request, jsonify, render_template
import joblib
import time
import os
import re

app = Flask(__name__)

def categorize_emergency(transcript):
    transcript_lower = transcript.lower()
    
    medical_keywords = ['medical', 'ambulance', 'breathing', 'breathe', 'unconscious', 'heart', 'stroke', 'bleeding', 'pain', 'hurts', 'hurt', 'hospital', 'choking', 'swallowed', 'blue', 'collapse', 'poison', 'cpr', 'seizure', 'pregnant', 'baby', 'chest', 'dizzy', 'sweating', 'suicide', 'live anymore']
    fire_keywords = ['fire', 'burn', 'smoke', 'blaze', 'flames', 'explosion']
    police_keywords = ['police', 'accident', 'crash', 'robbery', 'thief', 'gun', 'murder', 'assault', 'fight', 'break in', 'intruder', 'trespassing', 'domestic', 'kidnap', 'shooting']
    
    if any(re.search(r'\b' + kw + r'\b', transcript_lower) for kw in medical_keywords):
        return 'medical'
    if any(re.search(r'\b' + kw + r'\b', transcript_lower) for kw in fire_keywords):
        return 'fire'
    if any(re.search(r'\b' + kw + r'\b', transcript_lower) for kw in police_keywords):
        return 'police'
    return 'other'


# Paths for models
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
VECTORIZER_PATH = os.path.join(MODEL_DIR, 'tfidf.pkl')
LR_MODEL_PATH = os.path.join(MODEL_DIR, 'lr_model.pkl')

print("Loading models into memory...")
try:
    vectorizer = joblib.load(VECTORIZER_PATH)
    lr_model = joblib.load(LR_MODEL_PATH)
    print("Models loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}. Please ensure src/modeling.py has been run.")
    vectorizer = None
    lr_model = None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if not vectorizer or not lr_model:
        return jsonify({"error": "Models not loaded. Server configuration error."}), 500

    data = request.json
    transcript = data.get('transcript', '')

    if not transcript:
        return jsonify({"error": "No transcript provided."}), 400

    start_time = time.time()

    # Transform input
    x_vec = vectorizer.transform([transcript])
    
    # Predict
    prob = lr_model.predict_proba(x_vec)[0]
    critical_prob = prob[1]
    non_critical_prob = prob[0]
    
    # We used an optimized threshold of 0.3 for >0.95 recall
    is_critical = bool(critical_prob >= 0.3)
    
    # Override for obvious non-critical complaints (e.g., loud music)
    transcript_lower = transcript.lower()
    
    high_priority_keywords = ['flood', 'flooding', 'rescue', 'trapped', 'stranded', 'drowning', 'tornado', 'earthquake', 'gunshots', 'shots', 'screaming', 'hiding', 'break in', 'broke in', 'intruder', 'robbery', 'scared', 'weapon', 'suicide', 'live anymore', 'hurt himself', 'hurt herself', 'hurt myself']
    if any(re.search(r'\b' + kw + r'\b', transcript_lower) for kw in high_priority_keywords):
        is_critical = True
        
    low_priority_keywords = ['loud music', 'music', 'noise', 'party', 'barking', 'parking']
    if any(re.search(r'\b' + kw + r'\b', transcript_lower) for kw in low_priority_keywords):
        is_critical = False
    
    # Categorize emergency
    category = categorize_emergency(transcript)
    
    end_time = time.time()
    latency_ms = (end_time - start_time) * 1000

    return jsonify({
        "critical": is_critical,
        "critical_confidence": float(critical_prob),
        "non_critical_confidence": float(non_critical_prob),
        "latency_ms": round(latency_ms, 2),
        "category": category
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)