# Emergency Call Prioritization System

## Overview
This repository contains the end-to-end Machine Learning processing pipeline for predicting the criticality and resource allocation needs of emergency 911 dispatch calls. 

## Requirements
To execute this project, ensure you have Python 3.x installed along with the following primary libraries:
- `pandas`
- `numpy`
- `scikit-learn`

You can install all dependencies via your terminal:
```powershell
pip install pandas numpy scikit-learn
```

## Running the Project

The pipeline is split into two distinct execution scripts, expected to be run in sequence from this root directory (`c:\ml_aat`).

### 1. Data Synthesization & Preprocessing
First, transform the raw dataset (`911.csv`) into processed features and synthesize the audio transcripts. This outputs a new structured file inside the `data` folder.

**Run the following command in your terminal:**
```powershell
python src\data_prep.py
```

### 2. Model Training & Evaluation
After processing the data, evaluate the baseline TF-IDF algorithms alongside the modeled complex architectures. This file will output the accuracy, recall thresholds, and measured sub-300ms latency tests.

**Run the following command in your terminal:**
```powershell
python src\modeling.py
```

## Documentation
Full academic and structural justification for system architecture, SDGs, monitoring, and bias analysis resides in the `/docs/technical_report.md` file.
