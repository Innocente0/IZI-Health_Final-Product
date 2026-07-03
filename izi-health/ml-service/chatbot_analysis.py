import os
import time
import random
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay, classification_report
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

DATA_PATH = "data/medquad.csv"
OUTPUT_DIR = "outputs/chatbot_figures"

os.makedirs(OUTPUT_DIR, exist_ok=True)

df = pd.read_csv(DATA_PATH)
df = df.dropna(subset=["question", "answer"])

df["question_length"] = df["question"].astype(str).apply(lambda x: len(x.split()))
df["answer_length"] = df["answer"].astype(str).apply(lambda x: len(x.split()))

print("Dataset shape:", df.shape)
print(df.head())
print(df.columns)

# -------------------------------
# Dataset Summary
# -------------------------------
summary = pd.DataFrame({
    "Metric": [
        "Total QA pairs",
        "Unique sources",
        "Unique focus areas",
        "Average question length",
        "Average answer length"
    ],
    "Value": [
        len(df),
        df["source"].nunique(),
        df["focus_area"].nunique(),
        round(df["question_length"].mean(), 2),
        round(df["answer_length"].mean(), 2)
    ]
})

summary.to_csv(os.path.join(OUTPUT_DIR, "chatbot_dataset_summary.csv"), index=False)

# -------------------------------
# Source Pie Chart
# -------------------------------
source_counts = df["source"].value_counts().head(8)

plt.figure(figsize=(8, 8))
plt.pie(source_counts.values, labels=source_counts.index, autopct="%1.1f%%")
plt.title("MedQuAD Source Distribution")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "source_distribution_pie.png"))
plt.close()

# -------------------------------
# Focus Area Bar Chart
# -------------------------------
focus_counts = df["focus_area"].value_counts().head(15)

plt.figure(figsize=(12, 6))
focus_counts.plot(kind="bar")
plt.title("Top 15 MedQuAD Focus Areas")
plt.xlabel("Focus Area")
plt.ylabel("Number of Questions")
plt.xticks(rotation=45, ha="right")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "focus_area_bar_chart.png"))
plt.close()

# -------------------------------
# Question Length Histogram
# -------------------------------
plt.figure(figsize=(10, 5))
plt.hist(df["question_length"], bins=35)
plt.title("Question Length Distribution")
plt.xlabel("Number of Words")
plt.ylabel("Frequency")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "question_length_histogram.png"))
plt.close()

# -------------------------------
# Answer Length Histogram
# -------------------------------
plt.figure(figsize=(10, 5))
plt.hist(df["answer_length"], bins=40)
plt.title("Answer Length Distribution")
plt.xlabel("Number of Words")
plt.ylabel("Frequency")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "answer_length_histogram.png"))
plt.close()

# -------------------------------
# Retrieval Model
# -------------------------------
vectorizer = TfidfVectorizer(stop_words="english", max_features=10000)
question_vectors = vectorizer.fit_transform(df["question"].astype(str))

def paraphrase_question(q):
    q = str(q).lower()

    replacements = {
        "what is": "can you explain",
        "what are": "tell me about",
        "causes": "reasons for",
        "symptoms": "signs",
        "treatments": "ways to manage",
        "how to": "what is the way to",
        "disease": "condition",
        "diabetes": "diabets",
        "glucose": "sugar",
    }

    for old, new in replacements.items():
        q = q.replace(old, new)

    words = q.split()

    if len(words) > 6:
        keep = random.sample(words, max(4, int(len(words) * 0.7)))
        q = " ".join(keep)

    return q

def retrieve(query, top_k=5):
    q_vec = vectorizer.transform([query])
    sims = cosine_similarity(q_vec, question_vectors).flatten()
    top_idx = sims.argsort()[-top_k:][::-1]
    return top_idx, sims[top_idx]

# Use realistic paraphrased user queries
sample_df = df.sample(min(500, len(df)), random_state=42).copy()
sample_df["user_query"] = sample_df["question"].apply(paraphrase_question)

top1_correct = 0
top3_correct = 0
top5_correct = 0
similarity_scores = []
response_times = []

for idx, row in sample_df.iterrows():
    start = time.time()
    top_idx, scores = retrieve(row["user_query"], top_k=5)
    response_times.append((time.time() - start) * 1000)

    similarity_scores.append(scores[0])

    if idx == top_idx[0]:
        top1_correct += 1
    if idx in top_idx[:3]:
        top3_correct += 1
    if idx in top_idx[:5]:
        top5_correct += 1

top1 = round((top1_correct / len(sample_df)) * 100, 2)
top3 = round((top3_correct / len(sample_df)) * 100, 2)
top5 = round((top5_correct / len(sample_df)) * 100, 2)

accuracy_df = pd.DataFrame({
    "Metric": ["Top-1 Accuracy", "Top-3 Accuracy", "Top-5 Accuracy"],
    "Accuracy (%)": [top1, top3, top5]
})

accuracy_df.to_csv(os.path.join(OUTPUT_DIR, "retrieval_accuracy.csv"), index=False)

plt.figure(figsize=(8, 5))
plt.bar(accuracy_df["Metric"], accuracy_df["Accuracy (%)"])
plt.title("Chatbot Retrieval Accuracy")
plt.ylabel("Accuracy (%)")
plt.ylim(0, 100)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "retrieval_accuracy_bar_chart.png"))
plt.close()

# -------------------------------
# Realistic Similarity Distribution
# -------------------------------
plt.figure(figsize=(10, 5))
plt.hist(similarity_scores, bins=30)
plt.title("Realistic User Query Similarity Score Distribution")
plt.xlabel("Cosine Similarity Score")
plt.ylabel("Frequency")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "realistic_similarity_distribution.png"))
plt.close()

# -------------------------------
# Confidence Levels
# -------------------------------
confidence_groups = {
    "High (>=0.70)": sum(s >= 0.70 for s in similarity_scores),
    "Medium (0.40-0.69)": sum(0.40 <= s < 0.70 for s in similarity_scores),
    "Low (<0.40)": sum(s < 0.40 for s in similarity_scores),
}

plt.figure(figsize=(8, 5))
plt.bar(confidence_groups.keys(), confidence_groups.values())
plt.title("Chatbot Confidence Levels Using Realistic User Queries")
plt.ylabel("Number of Queries")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "realistic_confidence_level_bar_chart.png"))
plt.close()

# -------------------------------
# Response Time
# -------------------------------
response_df = pd.DataFrame({
    "Metric": ["Minimum", "Average", "Maximum"],
    "Response Time (ms)": [
        round(min(response_times), 2),
        round(sum(response_times) / len(response_times), 2),
        round(max(response_times), 2)
    ]
})

response_df.to_csv(os.path.join(OUTPUT_DIR, "response_time_summary.csv"), index=False)

plt.figure(figsize=(8, 5))
plt.bar(response_df["Metric"], response_df["Response Time (ms)"])
plt.title("Chatbot Retrieval Response Time")
plt.ylabel("Milliseconds")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "response_time_bar_chart.png"))
plt.close()

# -------------------------------
# Intent Classification
# -------------------------------
def label_intent(text):
    text = str(text).lower()

    if any(w in text for w in ["hospital", "clinic", "facility", "where", "doctor", "specialist"]):
        return "facility_search"

    if any(w in text for w in ["diabetes", "glucose", "blood sugar", "insulin"]):
        return "diabetes_question"

    if any(w in text for w in ["emergency", "chest pain", "shortness of breath"]):
        return "emergency"

    if any(w in text for w in ["medicine", "medication", "drug", "dose", "treatment"]):
        return "medication"

    return "general_health"

df["intent"] = df["question"].apply(label_intent)

X_train, X_test, y_train, y_test = train_test_split(
    df["question"].astype(str),
    df["intent"],
    test_size=0.25,
    random_state=42,
    stratify=df["intent"]
)

intent_vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
X_train_vec = intent_vectorizer.fit_transform(X_train)
X_test_vec = intent_vectorizer.transform(X_test)

clf = LogisticRegression(max_iter=1000)
clf.fit(X_train_vec, y_train)

pred = clf.predict(X_test_vec)

report = classification_report(y_test, pred, output_dict=True)
pd.DataFrame(report).transpose().to_csv(
    os.path.join(OUTPUT_DIR, "intent_classification_report.csv")
)

print(classification_report(y_test, pred))

cm = confusion_matrix(y_test, pred, labels=clf.classes_)
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=clf.classes_)

plt.figure(figsize=(10, 8))
disp.plot(cmap="Blues", xticks_rotation=45)
plt.title("Chatbot Intent Classification Confusion Matrix")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "intent_confusion_matrix.png"))
plt.close()

# -------------------------------
# Hyperparameters
# -------------------------------
hyperparams = pd.DataFrame({
    "Component": [
        "Retrieval TF-IDF Vectorizer",
        "Retrieval TF-IDF Vectorizer",
        "Retrieval Similarity",
        "Intent TF-IDF Vectorizer",
        "Intent Classifier",
        "Intent Classifier",
        "Confidence Threshold",
        "Evaluation Queries"
    ],
    "Parameter": [
        "stop_words",
        "max_features",
        "metric",
        "max_features",
        "algorithm",
        "max_iter",
        "high confidence",
        "paraphrased user queries"
    ],
    "Value": [
        "english",
        "10000",
        "cosine similarity",
        "5000",
        "Logistic Regression",
        "1000",
        ">= 0.70",
        len(sample_df)
    ]
})

hyperparams.to_csv(os.path.join(OUTPUT_DIR, "chatbot_hyperparameters.csv"), index=False)

print("Top-1 Accuracy:", top1)
print("Top-3 Accuracy:", top3)
print("Top-5 Accuracy:", top5)
print("All improved chatbot analysis figures saved in:", OUTPUT_DIR)