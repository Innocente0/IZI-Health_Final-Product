import os
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

DATA_PATH = os.path.join("data", "diabetes_prediction_dataset.csv")
MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "diabetes_model.pkl")

df = pd.read_csv(DATA_PATH)

target = "diabetes"

X = df.drop(columns=[target])
y = df[target]

categorical_features = ["gender", "smoking_history"]
numeric_features = [
    "age",
    "hypertension",
    "heart_disease",
    "bmi",
    "HbA1c_level",
    "blood_glucose_level",
]

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
        ("num", "passthrough", numeric_features),
    ]
)

model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(n_estimators=120, random_state=42)),
    ]
)

Xtr, Xte, ytr, yte = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

model.fit(Xtr, ytr)

predictions = model.predict(Xte)
accuracy = accuracy_score(yte, predictions)

print("Diabetes model trained successfully.")
print("Accuracy:", round(accuracy, 4))
print(classification_report(yte, predictions))

os.makedirs(MODEL_DIR, exist_ok=True)
joblib.dump(model, MODEL_PATH)

print(f"Model saved to {MODEL_PATH}")
