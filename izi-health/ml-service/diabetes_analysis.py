
from __future__ import annotations

import json
import joblib
import time
from pathlib import Path
from typing import Any

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from sklearn.metrics import (
    ConfusionMatrixDisplay,
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)


# ============================================================
# 1. PATH CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "models" / "diabetes_model.pkl"

# Change this filename to the actual diabetes dataset filename.
# Example:
# DATA_PATH = BASE_DIR / "data" / "diabetes.csv"
DATA_PATH = BASE_DIR / "data" / "diabetes_prediction_dataset.csv"

OUTPUT_DIR = BASE_DIR / "outputs" / "diabetes_analysis"

# Change this only if your target column has a different name.
TARGET_COLUMN = "Outcome"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# 2. LOAD THE MODEL SAFELY
# ============================================================

def load_saved_model(model_path: Path) -> Any:
    """
    Load the existing diabetes model without modifying it.
    joblib.load is appropriate when the model was saved using joblib.dump.
    """

    if not model_path.exists():
        raise FileNotFoundError(
            f"Diabetes model not found:\n{model_path}"
        )

    try:
        loaded_object = joblib.load(model_path)
        print("Model loaded successfully using joblib.")
        return loaded_object

    except Exception as error:
        raise RuntimeError(
            "The diabetes model could not be loaded.\n"
            f"Original error: {error}\n\n"
            "The model may require the same scikit-learn version "
            "that was used when it was created."
        ) from error


saved_object = load_saved_model(MODEL_PATH)

print("=" * 70)
print("DIABETES MODEL ANALYSIS")
print("=" * 70)
print(f"Loaded file: {MODEL_PATH}")
print(f"Saved object type: {type(saved_object)}")


# ============================================================
# 3. IDENTIFY THE ACTUAL MODEL
# ============================================================

def extract_model(saved_data: Any) -> tuple[Any, dict]:
    """
    Handles common pickle formats.

    The pickle may contain:
    1. A model or Pipeline directly
    2. A dictionary containing the model, scaler and feature names
    """

    metadata: dict = {}

    if not isinstance(saved_data, dict):
        return saved_data, metadata

    print("\nKeys found inside diabetes_model.pkl:")
    print(list(saved_data.keys()))

    possible_model_keys = [
        "model",
        "classifier",
        "estimator",
        "pipeline",
        "diabetes_model",
        "best_model",
    ]

    for key in possible_model_keys:
        if key in saved_data:
            metadata = saved_data.copy()
            model = metadata.pop(key)

            print(f"Model extracted from dictionary key: '{key}'")
            return model, metadata

    raise ValueError(
        "The pickle contains a dictionary, but no known model key was found.\n"
        f"Available keys: {list(saved_data.keys())}\n"
        "Add the correct key to possible_model_keys in this script."
    )


model, model_metadata = extract_model(saved_object)

print(f"Model type: {type(model)}")


# ============================================================
# 4. EXTRACT OPTIONAL SAVED COMPONENTS
# ============================================================

def find_dictionary_value(
    dictionary: dict,
    possible_keys: list[str],
) -> Any | None:
    """Returns the first matching value from a list of possible keys."""

    for key in possible_keys:
        if key in dictionary:
            return dictionary[key]

    return None


saved_scaler = find_dictionary_value(
    model_metadata,
    [
        "scaler",
        "standard_scaler",
        "feature_scaler",
        "preprocessor",
    ],
)

saved_feature_names = find_dictionary_value(
    model_metadata,
    [
        "feature_names",
        "features",
        "columns",
        "input_features",
    ],
)

saved_target_name = find_dictionary_value(
    model_metadata,
    [
        "target",
        "target_column",
        "label_column",
    ],
)

if saved_target_name:
    TARGET_COLUMN = str(saved_target_name)

if saved_feature_names is not None:
    saved_feature_names = list(saved_feature_names)
    print("\nSaved feature names:")
    print(saved_feature_names)

if saved_scaler is not None:
    print(f"\nSaved scaler/preprocessor type: {type(saved_scaler)}")


# ============================================================
# 5. SAVE MODEL INFORMATION
# ============================================================

def make_json_safe(value: Any) -> Any:
    """Converts values into JSON-safe text where necessary."""

    if isinstance(value, (str, int, float, bool)) or value is None:
        return value

    if isinstance(value, (list, tuple)):
        return [make_json_safe(item) for item in value]

    if isinstance(value, dict):
        return {
            str(key): make_json_safe(item)
            for key, item in value.items()
        }

    return str(value)


model_information = {
    "model_file": str(MODEL_PATH),
    "saved_object_type": str(type(saved_object)),
    "extracted_model_type": str(type(model)),
    "target_column": TARGET_COLUMN,
    "saved_feature_names": make_json_safe(saved_feature_names),
    "metadata_keys": list(model_metadata.keys()),
}

with (OUTPUT_DIR / "diabetes_model_information.json").open(
    "w",
    encoding="utf-8",
) as output_file:
    json.dump(
        model_information,
        output_file,
        indent=4,
    )


# ============================================================
# 6. LOAD THE DATASET
# ============================================================

if not DATA_PATH.exists():
    raise FileNotFoundError(
        "\nThe model was loaded successfully, but the diabetes dataset "
        "was not found.\n\n"
        f"Current dataset path:\n{DATA_PATH}\n\n"
        "Update DATA_PATH near the top of diabetes_analysis.py to point "
        "to the dataset used to train or test the diabetes model."
    )

df = pd.read_csv(DATA_PATH)

print(f"\nDataset loaded: {DATA_PATH}")
print(f"Dataset shape: {df.shape}")
print(f"Dataset columns: {list(df.columns)}")


# ============================================================
# 7. IDENTIFY THE TARGET COLUMN
# ============================================================

if TARGET_COLUMN not in df.columns:
    possible_target_names = [
        "Outcome",
        "outcome",
        "Diabetes",
        "diabetes",
        "target",
        "Target",
        "label",
        "Label",
        "class",
        "Class",
        "diabetes_binary",
    ]

    detected_target = next(
        (
            column
            for column in possible_target_names
            if column in df.columns
        ),
        None,
    )

    if detected_target is None:
        raise ValueError(
            f"Target column '{TARGET_COLUMN}' was not found.\n"
            f"Available columns: {list(df.columns)}"
        )

    TARGET_COLUMN = detected_target
    print(f"Automatically detected target column: {TARGET_COLUMN}")


# ============================================================
# 8. PREPARE FEATURES
# ============================================================

X = df.drop(columns=[TARGET_COLUMN]).copy()
y = df[TARGET_COLUMN].copy()

# Match the exact feature order used during training.
if saved_feature_names:
    missing_features = [
        feature
        for feature in saved_feature_names
        if feature not in X.columns
    ]

    if missing_features:
        raise ValueError(
            "The dataset is missing features expected by the model:\n"
            f"{missing_features}"
        )

    X = X[saved_feature_names]

elif hasattr(model, "feature_names_in_"):
    model_feature_names = list(model.feature_names_in_)

    missing_features = [
        feature
        for feature in model_feature_names
        if feature not in X.columns
    ]

    if missing_features:
        raise ValueError(
            "The dataset is missing model features:\n"
            f"{missing_features}"
        )

    X = X[model_feature_names]

print("\nFeatures supplied to the model:")
print(list(X.columns))


# ============================================================
# 9. NORMALIZE THE TARGET LABELS
# ============================================================

if y.dtype == "object":
    target_mapping = {
        "no": 0,
        "negative": 0,
        "non-diabetic": 0,
        "not diabetic": 0,
        "false": 0,
        "yes": 1,
        "positive": 1,
        "diabetic": 1,
        "diabetes": 1,
        "true": 1,
    }

    normalized_y = (
        y.astype(str)
        .str.lower()
        .str.strip()
        .map(target_mapping)
    )

    if normalized_y.isnull().any():
        raise ValueError(
            "Some target values could not be converted into 0 and 1.\n"
            f"Target values found: {y.unique()}"
        )

    y = normalized_y.astype(int)


# ============================================================
# 10. HANDLE MISSING CLINICAL VALUES
# ============================================================

# Some diabetes datasets represent unavailable measurements with zero.
# Replace those zeros only in medically continuous fields.
zero_as_missing_columns = [
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
]

for column in zero_as_missing_columns:
    if column in X.columns:
        X[column] = X[column].replace(0, np.nan)

# Fill numeric missing values with medians.
# This is used only when the loaded model does not already include
# preprocessing inside a Pipeline.
if not hasattr(model, "named_steps"):
    numeric_columns = X.select_dtypes(include=np.number).columns

    for column in numeric_columns:
        if X[column].isnull().any():
            X[column] = X[column].fillna(X[column].median())


# ============================================================
# 11. APPLY SAVED SCALER ONLY WHEN NECESSARY
# ============================================================

def prepare_model_input(
    features: pd.DataFrame,
    loaded_model: Any,
    scaler: Any | None,
) -> Any:
    """
    Uses the saved scaler only when the model is not already a Pipeline.

    A sklearn Pipeline normally performs its own preprocessing.
    """

    if hasattr(loaded_model, "named_steps"):
        print("\nThe saved object is a Pipeline.")
        print("Its own preprocessing will be used.")
        return features

    if scaler is not None:
        print("\nApplying scaler/preprocessor saved with the model.")
        return scaler.transform(features)

    print("\nNo separate scaler was found.")
    print("The raw prepared feature values will be supplied to the model.")
    return features


X_model = prepare_model_input(
    features=X,
    loaded_model=model,
    scaler=saved_scaler,
)


# ============================================================
# 12. GENERATE PREDICTIONS
# ============================================================

prediction_start = time.perf_counter()

y_pred = model.predict(X_model)

prediction_end = time.perf_counter()

total_prediction_time_ms = (
    prediction_end - prediction_start
) * 1000

average_prediction_time_ms = (
    total_prediction_time_ms / len(X)
)

print("\nPredictions generated successfully.")
print(
    f"Average prediction time: "
    f"{average_prediction_time_ms:.4f} ms per record"
)


# ============================================================
# 13. GENERATE PROBABILITIES OR DECISION SCORES
# ============================================================

y_score = None

if hasattr(model, "predict_proba"):
    prediction_probabilities = model.predict_proba(X_model)

    if prediction_probabilities.ndim == 2:
        y_score = prediction_probabilities[:, 1]
    else:
        y_score = prediction_probabilities

elif hasattr(model, "decision_function"):
    decision_scores = model.decision_function(X_model)

    # Convert scores to a 0–1 range for easier visual interpretation.
    score_min = decision_scores.min()
    score_max = decision_scores.max()

    if score_max != score_min:
        y_score = (
            decision_scores - score_min
        ) / (
            score_max - score_min
        )


# ============================================================
# 14. CALCULATE PERFORMANCE METRICS
# ============================================================

accuracy = accuracy_score(y, y_pred)
precision = precision_score(
    y,
    y_pred,
    zero_division=0,
)
recall = recall_score(
    y,
    y_pred,
    zero_division=0,
)
f1 = f1_score(
    y,
    y_pred,
    zero_division=0,
)

metrics = {
    "Accuracy": accuracy,
    "Precision": precision,
    "Recall": recall,
    "F1-score": f1,
}

if y_score is not None:
    metrics["ROC-AUC"] = roc_auc_score(y, y_score)

metrics_df = pd.DataFrame(
    [
        {
            "Metric": metric_name,
            "Value": metric_value,
            "Percentage": metric_value * 100,
        }
        for metric_name, metric_value in metrics.items()
    ]
)

metrics_df.to_csv(
    OUTPUT_DIR / "diabetes_evaluation_metrics.csv",
    index=False,
)

print("\nDiabetes model evaluation results:")
print(metrics_df.round(4))


# ============================================================
# 15. GRAPH: CLASS DISTRIBUTION
# ============================================================

class_counts = y.value_counts().sort_index()

display_labels = []

for class_value in class_counts.index:
    if class_value == 0:
        display_labels.append("Non-diabetic")
    elif class_value == 1:
        display_labels.append("Diabetic")
    else:
        display_labels.append(str(class_value))

plt.figure(figsize=(7, 5))

bars = plt.bar(
    display_labels,
    class_counts.values,
)

plt.title("Diabetes Class Distribution")
plt.xlabel("Patient Classification")
plt.ylabel("Number of Records")

for bar, value in zip(bars, class_counts.values):
    plt.text(
        bar.get_x() + bar.get_width() / 2,
        bar.get_height(),
        str(value),
        ha="center",
        va="bottom",
    )

plt.tight_layout()

plt.savefig(
    OUTPUT_DIR / "diabetes_class_distribution.png",
    dpi=300,
    bbox_inches="tight",
)

plt.close()


# ============================================================
# 16. GRAPH: MODEL EVALUATION METRICS
# ============================================================

plt.figure(figsize=(9, 6))

bars = plt.bar(
    metrics_df["Metric"],
    metrics_df["Percentage"],
)

plt.title("Diabetes Model Performance")
plt.xlabel("Evaluation Metric")
plt.ylabel("Performance (%)")
plt.ylim(0, 100)

for bar, value in zip(
    bars,
    metrics_df["Percentage"],
):
    plt.text(
        bar.get_x() + bar.get_width() / 2,
        bar.get_height() + 1,
        f"{value:.1f}%",
        ha="center",
        va="bottom",
    )

plt.tight_layout()

plt.savefig(
    OUTPUT_DIR / "diabetes_model_performance.png",
    dpi=300,
    bbox_inches="tight",
)

plt.close()


# ============================================================
# 17. GRAPH: CONFUSION MATRIX
# ============================================================

matrix = confusion_matrix(y, y_pred)

matrix_display = ConfusionMatrixDisplay(
    confusion_matrix=matrix,
    display_labels=[
        "Non-diabetic",
        "Diabetic",
    ],
)

matrix_display.plot(
    values_format="d",
)

plt.title("Diabetes Prediction Confusion Matrix")
plt.tight_layout()

plt.savefig(
    OUTPUT_DIR / "diabetes_confusion_matrix.png",
    dpi=300,
    bbox_inches="tight",
)

plt.close()


# ============================================================
# 18. GRAPH: ACTUAL VS PREDICTED CLASS DISTRIBUTION
# ============================================================

actual_counts = pd.Series(y).value_counts().sort_index()
predicted_counts = pd.Series(y_pred).value_counts().sort_index()

all_classes = sorted(
    set(actual_counts.index).union(predicted_counts.index)
)

actual_values = [
    actual_counts.get(class_value, 0)
    for class_value in all_classes
]

predicted_values = [
    predicted_counts.get(class_value, 0)
    for class_value in all_classes
]

comparison_labels = [
    "Non-diabetic" if value == 0
    else "Diabetic" if value == 1
    else str(value)
    for value in all_classes
]

x_positions = np.arange(len(comparison_labels))
bar_width = 0.36

plt.figure(figsize=(8, 6))

actual_bars = plt.bar(
    x_positions - bar_width / 2,
    actual_values,
    bar_width,
    label="Actual",
)

predicted_bars = plt.bar(
    x_positions + bar_width / 2,
    predicted_values,
    bar_width,
    label="Predicted",
)

plt.title("Actual and Predicted Diabetes Cases")
plt.xlabel("Patient Classification")
plt.ylabel("Number of Records")
plt.xticks(
    x_positions,
    comparison_labels,
)
plt.legend()

for bars in [actual_bars, predicted_bars]:
    for bar in bars:
        plt.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height(),
            f"{int(bar.get_height())}",
            ha="center",
            va="bottom",
        )

plt.tight_layout()

plt.savefig(
    OUTPUT_DIR / "diabetes_actual_vs_predicted.png",
    dpi=300,
    bbox_inches="tight",
)

plt.close()


# ============================================================
# 19. GRAPH: ROC CURVE
# ============================================================

if y_score is not None:
    false_positive_rate, true_positive_rate, _ = roc_curve(
        y,
        y_score,
    )

    roc_auc = roc_auc_score(
        y,
        y_score,
    )

    plt.figure(figsize=(8, 6))

    plt.plot(
        false_positive_rate,
        true_positive_rate,
        linewidth=2,
        label=f"Model ROC curve (AUC = {roc_auc:.3f})",
    )

    plt.plot(
        [0, 1],
        [0, 1],
        linestyle="--",
        label="Random classifier",
    )

    plt.title("ROC Curve for Diabetes Prediction Model")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.legend(loc="lower right")
    plt.grid(alpha=0.3)
    plt.tight_layout()

    plt.savefig(
        OUTPUT_DIR / "diabetes_roc_curve.png",
        dpi=300,
        bbox_inches="tight",
    )

    plt.close()

else:
    print(
        "\nROC curve was skipped because the model does not provide "
        "predict_proba() or decision_function()."
    )


# ============================================================
# 20. GRAPH: PREDICTION CONFIDENCE DISTRIBUTION
# ============================================================

if y_score is not None:
    confidence_categories = pd.cut(
        y_score,
        bins=[
            -np.inf,
            0.40,
            0.70,
            np.inf,
        ],
        labels=[
            "Low (<0.40)",
            "Medium (0.40–0.69)",
            "High (≥0.70)",
        ],
    )

    confidence_counts = (
        confidence_categories
        .value_counts()
        .reindex(
            [
                "High (≥0.70)",
                "Medium (0.40–0.69)",
                "Low (<0.40)",
            ]
        )
        .fillna(0)
    )

    plt.figure(figsize=(9, 6))

    bars = plt.bar(
        confidence_counts.index,
        confidence_counts.values,
    )

    plt.title("Diabetes Model Prediction Confidence")
    plt.xlabel("Confidence Level")
    plt.ylabel("Number of Records")

    for bar, value in zip(
        bars,
        confidence_counts.values,
    ):
        plt.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height(),
            str(int(value)),
            ha="center",
            va="bottom",
        )

    plt.tight_layout()

    plt.savefig(
        OUTPUT_DIR / "diabetes_prediction_confidence.png",
        dpi=300,
        bbox_inches="tight",
    )

    plt.close()


# ============================================================
# 21. GRAPH: FEATURE IMPORTANCE
# ============================================================

def find_classifier_for_importance(
    loaded_model: Any,
) -> Any:
    """
    If the saved model is a Pipeline, returns its final estimator.
    Otherwise, returns the model itself.
    """

    if hasattr(loaded_model, "named_steps"):
        pipeline_steps = list(
            loaded_model.named_steps.values()
        )

        if pipeline_steps:
            return pipeline_steps[-1]

    return loaded_model


importance_model = find_classifier_for_importance(model)

importance_values = None

if hasattr(importance_model, "feature_importances_"):
    importance_values = importance_model.feature_importances_

elif hasattr(importance_model, "coef_"):
    coefficients = np.asarray(importance_model.coef_)

    if coefficients.ndim == 2:
        importance_values = np.abs(coefficients[0])
    else:
        importance_values = np.abs(coefficients)


if importance_values is not None:
    current_feature_names = list(X.columns)

    if len(importance_values) == len(current_feature_names):
        feature_importance_df = pd.DataFrame(
            {
                "Feature": current_feature_names,
                "Importance": importance_values,
            }
        ).sort_values(
            by="Importance",
            ascending=False,
        )

        feature_importance_df.to_csv(
            OUTPUT_DIR / "diabetes_feature_importance.csv",
            index=False,
        )

        graph_data = feature_importance_df.head(10).sort_values(
            by="Importance",
            ascending=True,
        )

        plt.figure(figsize=(9, 6))

        plt.barh(
            graph_data["Feature"],
            graph_data["Importance"],
        )

        plt.title("Important Features in Diabetes Prediction")
        plt.xlabel("Feature Importance")
        plt.ylabel("Clinical Feature")
        plt.tight_layout()

        plt.savefig(
            OUTPUT_DIR / "diabetes_feature_importance.png",
            dpi=300,
            bbox_inches="tight",
        )

        plt.close()

    else:
        print(
            "\nFeature importance graph was skipped because the number "
            "of transformed model features differs from the original "
            "dataset columns."
        )

else:
    print(
        "\nFeature importance was skipped because this model does not "
        "provide feature_importances_ or coef_."
    )


# ============================================================
# 22. SAVE CLASSIFICATION REPORT
# ============================================================

report = classification_report(
    y,
    y_pred,
    target_names=[
        "Non-diabetic",
        "Diabetic",
    ],
    output_dict=True,
    zero_division=0,
)

report_df = pd.DataFrame(report).transpose()

report_df.to_csv(
    OUTPUT_DIR / "diabetes_classification_report.csv",
)


# ============================================================
# 23. SAVE THE PREDICTION RESULTS
# ============================================================

prediction_results = X.copy()

prediction_results["Actual Outcome"] = np.asarray(y)
prediction_results["Predicted Outcome"] = np.asarray(y_pred)

if y_score is not None:
    prediction_results["Predicted Probability"] = y_score

prediction_results.to_csv(
    OUTPUT_DIR / "diabetes_prediction_results.csv",
    index=False,
)


# ============================================================
# 24. SAVE RESPONSE TIME
# ============================================================

response_time_df = pd.DataFrame(
    [
        {
            "Number of Records": len(X),
            "Total Prediction Time (ms)": total_prediction_time_ms,
            "Average Prediction Time per Record (ms)": (
                average_prediction_time_ms
            ),
        }
    ]
)

response_time_df.to_csv(
    OUTPUT_DIR / "diabetes_response_time.csv",
    index=False,
)


# ============================================================
# 25. COMPLETION MESSAGE
# ============================================================

print("\n" + "=" * 70)
print("ANALYSIS COMPLETED SUCCESSFULLY")
print("=" * 70)

print(f"\nYour original model remains unchanged:\n{MODEL_PATH}")

print(f"\nResults were saved to:\n{OUTPUT_DIR}")

print("\nGenerated outputs include:")
print("1. diabetes_class_distribution.png")
print("2. diabetes_model_performance.png")
print("3. diabetes_confusion_matrix.png")
print("4. diabetes_actual_vs_predicted.png")
print("5. diabetes_roc_curve.png")
print("6. diabetes_prediction_confidence.png")
print("7. diabetes_feature_importance.png")
print("8. diabetes_evaluation_metrics.csv")
print("9. diabetes_classification_report.csv")
print("10. diabetes_prediction_results.csv")
print("11. diabetes_response_time.csv")