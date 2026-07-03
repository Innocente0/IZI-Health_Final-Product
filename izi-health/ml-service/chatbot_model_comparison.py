import os
import time
import random
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

DATA_PATH = "data/medquad.csv"
OUTPUT_DIR = "outputs/chatbot_model_comparison"

os.makedirs(OUTPUT_DIR, exist_ok=True)

df = pd.read_csv(DATA_PATH)
df = df.dropna(subset=["question", "answer"]).reset_index(drop=True)

def paraphrase_question(q):
    q = str(q).lower()

    replacements = {
        "what is": "explain",
        "what are": "tell me about",
        "causes": "reasons for",
        "symptoms": "signs of",
        "treatments": "ways to manage",
        "diabetes": "diabets",
        "glucose": "sugar",
        "disease": "condition",
    }

    for old, new in replacements.items():
        q = q.replace(old, new)

    words = q.split()

    if len(words) > 6:
        words = random.sample(words, max(4, int(len(words) * 0.75)))

    return " ".join(words)

sample_df = df.sample(min(500, len(df)), random_state=42).copy()
sample_df["user_query"] = sample_df["question"].apply(paraphrase_question)

results = []

def evaluate_retrieval_model(model_name, vectorizer):
    print(f"Evaluating {model_name}...")

    question_vectors = vectorizer.fit_transform(df["question"].astype(str))

    top1 = 0
    top3 = 0
    top5 = 0
    response_times = []

    for original_index, row in sample_df.iterrows():
        start = time.time()

        query_vector = vectorizer.transform([row["user_query"]])
        sims = cosine_similarity(query_vector, question_vectors).flatten()
        top_idx = sims.argsort()[-5:][::-1]

        response_times.append((time.time() - start) * 1000)

        if original_index == top_idx[0]:
            top1 += 1
        if original_index in top_idx[:3]:
            top3 += 1
        if original_index in top_idx[:5]:
            top5 += 1

    n = len(sample_df)

    results.append({
        "Model": model_name,
        "Top-1 Accuracy (%)": round((top1 / n) * 100, 2),
        "Top-3 Accuracy (%)": round((top3 / n) * 100, 2),
        "Top-5 Accuracy (%)": round((top5 / n) * 100, 2),
        "Average Response Time (ms)": round(sum(response_times) / len(response_times), 2),
    })

evaluate_retrieval_model(
    "TF-IDF + Cosine",
    TfidfVectorizer(stop_words="english", max_features=10000)
)

evaluate_retrieval_model(
    "CountVectorizer + Cosine",
    CountVectorizer(stop_words="english", max_features=10000)
)

# Optional SBERT model
try:
    from sentence_transformers import SentenceTransformer
    import numpy as np

    print("Evaluating Sentence-BERT...")

    model = SentenceTransformer("all-MiniLM-L6-v2")

    corpus_embeddings = model.encode(
        df["question"].astype(str).tolist(),
        show_progress_bar=True,
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    top1 = 0
    top3 = 0
    top5 = 0
    response_times = []

    for original_index, row in sample_df.iterrows():
        start = time.time()

        query_embedding = model.encode(
            [row["user_query"]],
            convert_to_numpy=True,
            normalize_embeddings=True
        )

        sims = np.dot(corpus_embeddings, query_embedding[0])
        top_idx = sims.argsort()[-5:][::-1]

        response_times.append((time.time() - start) * 1000)

        if original_index == top_idx[0]:
            top1 += 1
        if original_index in top_idx[:3]:
            top3 += 1
        if original_index in top_idx[:5]:
            top5 += 1

    n = len(sample_df)

    results.append({
        "Model": "Sentence-BERT",
        "Top-1 Accuracy (%)": round((top1 / n) * 100, 2),
        "Top-3 Accuracy (%)": round((top3 / n) * 100, 2),
        "Top-5 Accuracy (%)": round((top5 / n) * 100, 2),
        "Average Response Time (ms)": round(sum(response_times) / len(response_times), 2),
    })

except Exception as e:
    print("Sentence-BERT skipped because it is not installed or could not load.")
    print("Reason:", e)

comparison_df = pd.DataFrame(results)
comparison_df.to_csv(os.path.join(OUTPUT_DIR, "chatbot_model_comparison.csv"), index=False)

print(comparison_df)

# Accuracy comparison
plt.figure(figsize=(10, 6))
plt.bar(comparison_df["Model"], comparison_df["Top-1 Accuracy (%)"])
plt.title("Chatbot Model Comparison: Top-1 Retrieval Accuracy")
plt.ylabel("Accuracy (%)")
plt.ylim(0, 100)
plt.xticks(rotation=20, ha="right")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "model_top1_accuracy_comparison.png"))
plt.close()

# Top1 Top3 Top5 comparison
plt.figure(figsize=(10, 6))

x = range(len(comparison_df))
width = 0.25

plt.bar([i - width for i in x], comparison_df["Top-1 Accuracy (%)"], width=width, label="Top-1")
plt.bar(x, comparison_df["Top-3 Accuracy (%)"], width=width, label="Top-3")
plt.bar([i + width for i in x], comparison_df["Top-5 Accuracy (%)"], width=width, label="Top-5")

plt.title("Chatbot Retrieval Accuracy Comparison")
plt.ylabel("Accuracy (%)")
plt.xticks(x, comparison_df["Model"], rotation=20, ha="right")
plt.ylim(0, 100)
plt.legend()
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "model_topk_accuracy_comparison.png"))
plt.close()

# Response time comparison
plt.figure(figsize=(10, 6))
plt.bar(comparison_df["Model"], comparison_df["Average Response Time (ms)"])
plt.title("Chatbot Model Response Time Comparison")
plt.ylabel("Average Response Time (ms)")
plt.xticks(rotation=20, ha="right")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "model_response_time_comparison.png"))
plt.close()

# Simple score table
comparison_df["Final Score"] = (
    comparison_df["Top-1 Accuracy (%)"] * 0.45 +
    comparison_df["Top-3 Accuracy (%)"] * 0.30 +
    comparison_df["Top-5 Accuracy (%)"] * 0.20 -
    comparison_df["Average Response Time (ms)"] * 0.05
).round(2)

comparison_df.to_csv(os.path.join(OUTPUT_DIR, "chatbot_model_comparison_with_score.csv"), index=False)

plt.figure(figsize=(10, 6))
plt.bar(comparison_df["Model"], comparison_df["Final Score"])
plt.title("Overall Chatbot Model Selection Score")
plt.ylabel("Score")
plt.xticks(rotation=20, ha="right")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "model_selection_score.png"))
plt.close()

print("Model comparison figures saved in:", OUTPUT_DIR)
