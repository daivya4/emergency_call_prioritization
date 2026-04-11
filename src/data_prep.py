import pandas as pd
import numpy as np
import datetime
import os

# Subsetting dataset for speed demonstration
DATA_FILE = r'c:\ml_aat\911.csv'
PROCESSED_FILE = r'c:\ml_aat\data\processed_911.csv'

# Define critical keywords for Urgency target
CRITICAL_KEYWORDS = [
    'CARDIAC EMERGENCY', 'RESPIRATORY EMERGENCY', 'CVA/STROKE', 
    'HEMORRHAGING', 'ALTERED MENTAL STATUS', 'SEIZURES', 
    'UNRESPONSIVE SUBJECT', 'UNCONSCIOUS SUBJECT', 'BUILDING FIRE',
    'FIRE ALARM'
]

def load_data():
    print("Loading raw 911 dispatch dataset...")
    df = pd.read_csv(DATA_FILE, nrows=50000)  # Use 50k instances for proof-of-concept
    return df

def simulate_transcript(row):
    """
    Generating synthetic transcripts from dispatch notes to simulate audio extraction,
    per the assignment requirements for NLP-based and Transformer models.
    """
    date_str = str(row['timeStamp'])
    address = str(row['addr'])
    town = str(row['twp'])
    zipcode = str(row['zip'])
    emergency_type = str(row['title'])
    desc = str(row['desc'])
    
    transcript = (f"Caller reporting an emergency at {address} in {town}, zip code {zipcode}. "
                  f"The nature of the emergency is {emergency_type}. "
                  f"Additional details from caller: {desc}. Please dispatch units.")
    return transcript

def engineer_features(df):
    print("Engineering temporal and text features...")
    # 1. Temporal
    df['timeStamp'] = pd.to_datetime(df['timeStamp'], errors='coerce')
    df['Hour'] = df['timeStamp'].dt.hour
    df['DayOfWeek'] = df['timeStamp'].dt.dayofweek
    df['Month'] = df['timeStamp'].dt.month
    
    # 2. Text/Transcript synthesis
    df['transcript'] = df.apply(simulate_transcript, axis=1)
    
    # 3. Label targets: Criticality (Binary 1/0)
    def determine_criticality(title):
        if pd.isna(title): return 0
        for keyword in CRITICAL_KEYWORDS:
            if keyword in title:
                return 1
        return 0
        
    df['is_critical'] = df['title'].apply(determine_criticality)
    
    # 4. Label targets: Resource Allocation (EMS vs Fire vs Traffic)
    df['resource_type'] = df['title'].apply(lambda x: str(x).split(':')[0] if pd.notna(x) and ':' in x else 'Unknown')
    
    # Clean NaNs in required clustering columns
    df['lat'] = df['lat'].fillna(df['lat'].median())
    df['lng'] = df['lng'].fillna(df['lng'].median())
    
    return df

if __name__ == "__main__":
    os.makedirs(r'c:\ml_aat\data', exist_ok=True)
    df = load_data()
    df = engineer_features(df)
    
    print(f"Data processing complete. Critical Ratio: {df['is_critical'].mean():.2f}")
    
    # Save the processed data
    df.to_csv(PROCESSED_FILE, index=False)
    print(f"Processed dataset saved to {PROCESSED_FILE}")
