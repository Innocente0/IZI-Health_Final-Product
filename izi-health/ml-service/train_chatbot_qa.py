import os
import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors

DATA_PATH = os.path.join("data", "medquad.csv")
MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "chatbot_qa_model.pkl")

df = pd.read_csv(DATA_PATH)

# Normalize column names
df.columns = [c.strip().lower() for c in df.columns]

# Try to detect question and answer columns
question_col = None
answer_col = None

for col in df.columns:
    if "question" in col:
        question_col = col
    if "answer" in col:
        answer_col = col

if question_col is None or answer_col is None:
    raise ValueError(
        f"Could not find question/answer columns. Found columns: {list(df.columns)}"
    )

df = df[[question_col, answer_col]].dropna()
df = df.rename(columns={question_col: "question", answer_col: "answer"})

questions = df["question"].astype(str).tolist()

vectorizer = TfidfVectorizer(
    lowercase=True,
    stop_words="english",
    max_features=10000,
    ngram_range=(1, 2)
)

question_vectors = vectorizer.fit_transform(questions)

retriever = NearestNeighbors(
    n_neighbors=3,
    metric="cosine"
)

retriever.fit(question_vectors)

chatbot_model = {
    "vectorizer": vectorizer,
    "retriever": retriever,
    "questions": df["question"].tolist(),
    "answers": df["answer"].tolist()
}

os.makedirs(MODEL_DIR, exist_ok=True)
joblib.dump(chatbot_model, MODEL_PATH)

print("Healthcare Q&A chatbot model trained successfully.")
print(f"Total Q&A pairs: {len(df)}")
print(f"Model saved to: {MODEL_PATH}")
