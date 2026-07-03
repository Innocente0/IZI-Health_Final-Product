import os
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI(title="IZI Health ML Service")

DIABETES_MODEL_PATH = os.path.join("models", "diabetes_model.pkl")
MEDQUAD_CSV_PATH = os.path.join("data", "medquad.csv")

diabetes_model = joblib.load(DIABETES_MODEL_PATH)

medquad_df = pd.read_csv(MEDQUAD_CSV_PATH)
medquad_df = medquad_df.dropna(subset=["question", "answer"]).reset_index(drop=True)

sbert_model = SentenceTransformer("all-MiniLM-L6-v2")

medquad_embeddings = sbert_model.encode(
    medquad_df["question"].astype(str).tolist(),
    convert_to_numpy=True,
    normalize_embeddings=True,
)


class DiabetesInput(BaseModel):
    gender: str
    age: float
    hypertension: int
    heart_disease: int
    smoking_history: str
    bmi: float
    HbA1c_level: float
    blood_glucose_level: float


class ChatbotQuestion(BaseModel):
    question: str


@app.get("/")
def home():
    return {"message": "IZI Health ML Service is running"}


@app.post("/predict-diabetes")
def predict_diabetes(data: DiabetesInput):
    input_df = pd.DataFrame([data.dict()])

    prediction = diabetes_model.predict(input_df)[0]

    probability = None
    if hasattr(diabetes_model, "predict_proba"):
        probability = float(diabetes_model.predict_proba(input_df)[0][1])

    if prediction == 1:
        risk_level = "High Risk"
        recommendation = "Your result suggests elevated diabetes risk. Please consult a healthcare professional."
    elif data.blood_glucose_level >= 140 or data.HbA1c_level >= 5.7:
        risk_level = "Medium Risk"
        recommendation = "Your readings need attention. Continue monitoring and consider medical advice."
    else:
        risk_level = "Low Risk"
        recommendation = "Your readings look within a lower-risk range. Continue healthy habits and monitoring."

    return {
        "prediction": int(prediction),
        "riskLevel": risk_level,
        "probability": probability,
        "recommendation": recommendation,
    }


def safe_fallback_answer(question):
    q = question.lower()

    if any(word in q for word in ["headache", "migraine"]):
        return (
            "A headache can be caused by dehydration, stress, lack of sleep, or infection. "
            "Rest, drink water, and seek medical care if it is severe, sudden, or comes with fever, vomiting, weakness, or vision changes."
        )

    if any(word in q for word in ["fever", "cough", "flu"]):
        return (
            "Fever, cough, or flu-like symptoms may need rest, fluids, and monitoring. "
            "Seek care if symptoms worsen, breathing becomes difficult, or fever stays high."
        )

    if any(word in q for word in ["diabetes", "glucose", "sugar", "insulin"]):
        return (
            "Diabetes is related to high blood sugar levels. Keep monitoring glucose readings, take medication as prescribed, "
            "and visit a healthcare professional if readings stay high or symptoms continue."
        )

    if any(word in q for word in ["chest pain", "shortness of breath", "difficulty breathing"]):
        return (
            "Chest pain or difficulty breathing can be serious. Please seek urgent medical care immediately."
        )

    return (
        "I can provide general healthcare navigation and education, but I cannot diagnose or prescribe medication. "
        "Please consult a qualified healthcare professional for medical advice."
    )


@app.post("/chatbot-qa")
def chatbot_qa(data: ChatbotQuestion):
    question = data.question

    query_embedding = sbert_model.encode(
        [question],
        convert_to_numpy=True,
        normalize_embeddings=True,
    )

    similarities = np.dot(medquad_embeddings, query_embedding[0])
    best_index = int(np.argmax(similarities))
    confidence = float(similarities[best_index])

    matched_row = medquad_df.iloc[best_index]

    if confidence >= 0.55:
        answer = matched_row["answer"]
        mode = "medquad_semantic"
    else:
        answer = safe_fallback_answer(question)
        mode = "safe_fallback"

    safety_note = (
        "\n\nNote: IZI Health does not diagnose or prescribe medication. "
        "Please consult a qualified healthcare professional."
    )

    return {
        "question": question,
        "matchedQuestion": str(matched_row["question"]),
        "confidence": confidence,
        "similarity": confidence,
        "source": str(matched_row.get("source", "MedQuAD")),
        "focus_area": str(matched_row.get("focus_area", "General Health")),
        "mode": mode,
        "answer": answer + safety_note,
    }
