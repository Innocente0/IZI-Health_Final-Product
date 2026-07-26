import os
from threading import Lock

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


# Application setup

app = FastAPI(title="IZI Health ML Service")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DIABETES_MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "diabetes_model.pkl",
)

MEDQUAD_CSV_PATH = os.path.join(
    BASE_DIR,
    "data",
    "medquad.csv",
)

MEDQUAD_EMBEDDINGS_PATH = os.path.join(
    BASE_DIR,
    "models",
    "medquad_embeddings.npy",
)


# Validate local files

if not os.path.exists(DIABETES_MODEL_PATH):
    raise FileNotFoundError(
        f"Diabetes model not found: {DIABETES_MODEL_PATH}"
    )


# Load Sentence-BERT only when the chatbot is first used.
# This lets FastAPI open its Render port before loading the larger model.
diabetes_model = None
diabetes_lock = Lock()
medquad_df = None
medquad_embeddings = None
medquad_lock = Lock()
sbert_model = None
sbert_lock = Lock()


def get_diabetes_model():
    global diabetes_model

    if diabetes_model is None:
        with diabetes_lock:
            if diabetes_model is None:
                print("Loading diabetes model...")
                import joblib

                diabetes_model = joblib.load(DIABETES_MODEL_PATH)
                print("Diabetes model loaded successfully.")

    return diabetes_model


def get_sbert_model():
    global sbert_model

    if sbert_model is None:
        with sbert_lock:
            if sbert_model is None:
                from sentence_transformers import SentenceTransformer

                print("Loading Sentence-BERT model...")
                sbert_model = SentenceTransformer(
                    "all-MiniLM-L6-v2",
                    device="cpu",
                )
                print("Sentence-BERT model loaded successfully.")

    return sbert_model


def get_medquad_data():
    global medquad_df, medquad_embeddings

    if medquad_df is None or medquad_embeddings is None:
        with medquad_lock:
            if medquad_df is None or medquad_embeddings is None:
                if not os.path.exists(MEDQUAD_CSV_PATH):
                    raise FileNotFoundError(
                        f"MedQuAD CSV file not found: {MEDQUAD_CSV_PATH}"
                    )

                if not os.path.exists(MEDQUAD_EMBEDDINGS_PATH):
                    raise FileNotFoundError(
                        "MedQuAD embeddings file not found. Expected file at: "
                        f"{MEDQUAD_EMBEDDINGS_PATH}"
                    )

                print("Loading MedQuAD data...")
                import numpy as np
                import pandas as pd

                loaded_df = pd.read_csv(MEDQUAD_CSV_PATH)
                loaded_df = loaded_df.dropna(
                    subset=["question", "answer"]
                ).reset_index(drop=True)

                loaded_embeddings = np.load(
                    MEDQUAD_EMBEDDINGS_PATH,
                    mmap_mode="r",
                )

                if len(loaded_embeddings) != len(loaded_df):
                    raise ValueError(
                        "The number of saved MedQuAD embeddings does not match "
                        "the number of valid rows in medquad.csv. "
                        f"Embeddings: {len(loaded_embeddings)}, "
                        f"CSV rows: {len(loaded_df)}."
                    )

                medquad_df = loaded_df
                medquad_embeddings = loaded_embeddings
                print("MedQuAD data loaded successfully.")

    return medquad_df, medquad_embeddings


# Request models

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


# Health routes

@app.get("/")
def home():
    return {
        "message": "IZI Health ML Service is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "diabetesModelLoaded": diabetes_model is not None,
        "diabetesModelAvailable": os.path.exists(DIABETES_MODEL_PATH),
        "medquadDataLoaded": medquad_df is not None,
        "medquadDataAvailable": os.path.exists(MEDQUAD_CSV_PATH),
        "medquadEmbeddingsLoaded": medquad_embeddings is not None,
        "medquadEmbeddingsAvailable": os.path.exists(MEDQUAD_EMBEDDINGS_PATH),
        "chatbotModelLoaded": sbert_model is not None,
    }


# Diabetes prediction

@app.post("/predict-diabetes")
def predict_diabetes(data: DiabetesInput):
    try:
        import pandas as pd

        model = get_diabetes_model()
        input_df = pd.DataFrame([data.model_dump()])

        prediction = model.predict(input_df)[0]

        probability = None

        if hasattr(model, "predict_proba"):
            probability = float(
                model.predict_proba(input_df)[0][1]
            )

        if prediction == 1:
            risk_level = "High Risk"
            recommendation = (
                "Your result suggests elevated diabetes risk. "
                "Please consult a healthcare professional."
            )

        elif (
            data.blood_glucose_level >= 140
            or data.HbA1c_level >= 5.7
        ):
            risk_level = "Medium Risk"
            recommendation = (
                "Your readings need attention. Continue monitoring "
                "and consider medical advice."
            )

        else:
            risk_level = "Low Risk"
            recommendation = (
                "Your readings look within a lower-risk range. "
                "Continue healthy habits and monitoring."
            )

        return {
            "prediction": int(prediction),
            "riskLevel": risk_level,
            "probability": probability,
            "recommendation": recommendation,
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Diabetes prediction failed: {str(error)}",
        ) from error


# Safe chatbot fallback responses

def safe_fallback_answer(question: str):
    q = question.lower()

    if any(word in q for word in ["headache", "migraine"]):
        return (
            "A headache can be caused by dehydration, stress, "
            "lack of sleep, or infection. Rest, drink water, and "
            "seek medical care if it is severe, sudden, or comes "
            "with fever, vomiting, weakness, or vision changes."
        )

    if any(word in q for word in ["fever", "cough", "flu"]):
        return (
            "Fever, cough, or flu-like symptoms may need rest, "
            "fluids, and monitoring. Seek care if symptoms worsen, "
            "breathing becomes difficult, or fever stays high."
        )

    if any(
        word in q
        for word in ["diabetes", "glucose", "sugar", "insulin"]
    ):
        return (
            "Diabetes is related to high blood sugar levels. "
            "Keep monitoring glucose readings, take medication as "
            "prescribed, and visit a healthcare professional if "
            "readings stay high or symptoms continue."
        )

    if any(
        phrase in q
        for phrase in [
            "chest pain",
            "shortness of breath",
            "difficulty breathing",
        ]
    ):
        return (
            "Chest pain or difficulty breathing can be serious. "
            "Please seek urgent medical care immediately."
        )

    return (
        "I can provide general healthcare navigation and education, "
        "but I cannot diagnose or prescribe medication. Please "
        "consult a qualified healthcare professional for medical advice."
    )


# Chatbot route

@app.post("/chatbot-qa")
def chatbot_qa(data: ChatbotQuestion):
    question = data.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Please provide a question.",
        )

    try:
        import numpy as np

        medquad_df, medquad_embeddings = get_medquad_data()
        model = get_sbert_model()

        query_embedding = model.encode(
            [question],
            convert_to_numpy=True,
            normalize_embeddings=True,
        )

        similarities = np.dot(
            medquad_embeddings,
            query_embedding[0],
        )

        best_index = int(np.argmax(similarities))
        confidence = float(similarities[best_index])

        matched_row = medquad_df.iloc[best_index]

        if confidence >= 0.55:
            answer = str(matched_row["answer"])
            mode = "medquad_semantic"
        else:
            answer = safe_fallback_answer(question)
            mode = "safe_fallback"

        safety_note = (
            "\n\nNote: IZI Health does not diagnose or prescribe "
            "medication. Please consult a qualified healthcare "
            "professional."
        )

        return {
            "question": question,
            "matchedQuestion": str(
                matched_row["question"]
            ),
            "confidence": confidence,
            "similarity": confidence,
            "source": str(
                matched_row.get("source", "MedQuAD")
            ),
            "focus_area": str(
                matched_row.get(
                    "focus_area",
                    "General Health",
                )
            ),
            "mode": mode,
            "answer": answer + safety_note,
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Chatbot request failed: {str(error)}",
        ) from error
    
