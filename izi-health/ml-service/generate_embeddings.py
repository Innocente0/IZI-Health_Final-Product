import os

import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer


DATA_PATH = os.path.join("data", "medquad.csv")
OUTPUT_PATH = os.path.join("models", "medquad_embeddings.npy")


def main():
    print("Reading MedQuAD dataset...")

    medquad_df = pd.read_csv(DATA_PATH)
    medquad_df = medquad_df.dropna(
        subset=["question", "answer"]
    ).reset_index(drop=True)

    print(f"Loaded {len(medquad_df)} valid questions.")

    print("Loading Sentence-BERT model...")
    model = SentenceTransformer("all-MiniLM-L6-v2")

    print("Generating embeddings...")
    embeddings = model.encode(
        medquad_df["question"].astype(str).tolist(),
        convert_to_numpy=True,
        normalize_embeddings=True,
        batch_size=32,
        show_progress_bar=True,
    )

    os.makedirs("models", exist_ok=True)
    np.save(OUTPUT_PATH, embeddings)

    print(f"Embeddings saved to: {OUTPUT_PATH}")
    print(f"Embedding shape: {embeddings.shape}")


if __name__ == "__main__":
    main()
    