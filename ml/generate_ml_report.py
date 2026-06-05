from __future__ import annotations

import re
import textwrap
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.image as mpimg
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib.backends.backend_pdf import PdfPages


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset" / "heart.csv"
RESULTS_DIR = BASE_DIR / "results"
PLOTS_DIR = RESULTS_DIR / "plots"
REPORT_PATH = RESULTS_DIR / "HealthGuard_ML_Report.pdf"


def _wrap(text: str, width: int = 95) -> str:
    return "\n".join(textwrap.wrap(str(text), width=width))


def _new_page(pdf: PdfPages, title: str):
    fig = plt.figure(figsize=(11, 8.5))
    fig.suptitle(title, fontsize=18, fontweight="bold", y=0.96)
    return fig


def _add_text_page(pdf: PdfPages, title: str, blocks: list[str]) -> None:
    fig = _new_page(pdf, title)
    ax = fig.add_subplot(111)
    ax.axis("off")

    y = 0.92
    for block in blocks:
        ax.text(
            0.03,
            y,
            _wrap(block),
            fontsize=11,
            va="top",
            ha="left",
            linespacing=1.35,
        )
        y -= 0.11 + 0.025 * _wrap(block).count("\n")

    pdf.savefig(fig, bbox_inches="tight")
    plt.close(fig)


def _add_table_page(
    pdf: PdfPages,
    title: str,
    df: pd.DataFrame,
    max_rows: int | None = None,
    font_size: int = 8,
) -> None:
    fig = _new_page(pdf, title)
    ax = fig.add_subplot(111)
    ax.axis("off")

    table_df = df.copy()
    if max_rows is not None:
        table_df = table_df.head(max_rows)

    for column in table_df.columns:
        if pd.api.types.is_numeric_dtype(table_df[column]):
            table_df[column] = table_df[column].map(lambda value: f"{value:.4f}")

    table = ax.table(
        cellText=table_df.values,
        colLabels=table_df.columns,
        cellLoc="center",
        loc="center",
    )
    table.auto_set_font_size(False)
    table.set_fontsize(font_size)
    table.scale(1, 1.35)

    for (row, _column), cell in table.get_celld().items():
        if row == 0:
            cell.set_text_props(weight="bold", color="white")
            cell.set_facecolor("#2f6f8f")
        elif row % 2 == 0:
            cell.set_facecolor("#f2f6f8")

    pdf.savefig(fig, bbox_inches="tight")
    plt.close(fig)


def _add_image_page(pdf: PdfPages, title: str, image_path: Path, note: str | None = None) -> None:
    fig = _new_page(pdf, title)
    ax = fig.add_subplot(111)
    ax.axis("off")

    if image_path.exists():
        image = mpimg.imread(image_path)
        ax.imshow(image)
        ax.axis("off")
    else:
        ax.text(
            0.5,
            0.5,
            f"Missing image: {image_path.name}",
            ha="center",
            va="center",
            fontsize=13,
        )

    if note:
        fig.text(0.05, 0.04, _wrap(note, 115), fontsize=9, ha="left", va="bottom")

    pdf.savefig(fig, bbox_inches="tight")
    plt.close(fig)


def _parse_confusion_matrix(value: object) -> np.ndarray | None:
    numbers = [int(item) for item in re.findall(r"-?\d+", str(value))]
    if len(numbers) != 4:
        return None
    return np.array(numbers).reshape(2, 2)


def _add_confusion_matrices(pdf: PdfPages, results_df: pd.DataFrame) -> None:
    matrices = []
    for _, row in results_df.iterrows():
        matrix = _parse_confusion_matrix(row.get("Confusion Matrix"))
        if matrix is not None:
            matrices.append((row["Model"], matrix))

    if not matrices:
        _add_text_page(pdf, "Confusion Matrices", ["No confusion matrices were found in final_model_results.csv."])
        return

    for start in range(0, len(matrices), 6):
        fig = _new_page(pdf, "Confusion Matrices")
        subset = matrices[start : start + 6]

        for index, (model_name, matrix) in enumerate(subset):
            ax = fig.add_subplot(2, 3, index + 1)
            im = ax.imshow(matrix, cmap="Blues")
            ax.set_title(str(model_name), fontsize=9)
            ax.set_xlabel("Predicted")
            ax.set_ylabel("Actual")
            ax.set_xticks([0, 1])
            ax.set_yticks([0, 1])

            for row in range(2):
                for col in range(2):
                    ax.text(col, row, matrix[row, col], ha="center", va="center", color="black", fontsize=11)

            fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)

        pdf.savefig(fig, bbox_inches="tight")
        plt.close(fig)


def _dataset_summary() -> tuple[pd.DataFrame, list[str]]:
    df = pd.read_csv(DATASET_PATH)
    duplicate_count = int(df.duplicated().sum())
    clean_df = df.drop_duplicates()

    summary_df = pd.DataFrame(
        {
            "Metric": [
                "Raw rows",
                "Rows after duplicate removal",
                "Columns",
                "Feature columns",
                "Missing values",
                "Duplicate rows removed",
                "Heart disease cases",
                "No heart disease cases",
            ],
            "Value": [
                len(df),
                len(clean_df),
                df.shape[1],
                df.shape[1] - 1,
                int(df.isna().sum().sum()),
                duplicate_count,
                int(clean_df["target"].sum()),
                int((clean_df["target"] == 0).sum()),
            ],
        }
    )

    notes = [
        "The report is generated from the Heart Disease dataset used by the HealthGuard machine learning notebook. "
        "Duplicate rows are removed in the notebook before model training, so the cleaned dataset counts are shown here.",
        "The target variable uses 1 for heart disease and 0 for no heart disease. All model, clustering and feature "
        "importance summaries in this PDF are generated from saved training outputs in ml/results.",
    ]

    return summary_df, notes


def _load_csv(name: str) -> pd.DataFrame:
    path = RESULTS_DIR / name
    if not path.exists():
        return pd.DataFrame()
    return pd.read_csv(path)


def generate_report(output_path: str | Path = REPORT_PATH) -> Path:
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    output_path = Path(output_path)

    final_results = _load_csv("final_model_results.csv")
    clustering_results = _load_csv("clustering_evaluation.csv")
    feature_importance = _load_csv("feature_importance.csv")
    cross_validation = _load_csv("cross_validation_results.csv")
    dataset_summary, dataset_notes = _dataset_summary()

    with PdfPages(output_path) as pdf:
        _add_text_page(
            pdf,
            "HealthGuard ML Report",
            [
                "This automated report summarizes the machine learning training outputs for HealthGuard.",
                "Included sections: dataset summary, model comparison, confusion matrices, ROC curves, clustering results, "
                "feature importance analysis and best model summary.",
            ],
        )

        _add_table_page(pdf, "Dataset Summary", dataset_summary, font_size=10)
        _add_text_page(pdf, "Dataset Notes", dataset_notes)

        if not final_results.empty:
            metrics = ["Model", "Accuracy", "Precision", "Recall", "F1-score"]
            if "ROC-AUC" in final_results.columns:
                metrics.append("ROC-AUC")
            _add_table_page(pdf, "Model Comparison Table", final_results[metrics], font_size=7)
            _add_image_page(pdf, "Model Comparison Chart", RESULTS_DIR / "model_comparison.png")
            _add_confusion_matrices(pdf, final_results)
            _add_image_page(pdf, "ROC Curves", RESULTS_DIR / "roc_curves.png")

            best_row = final_results.sort_values("F1-score", ascending=False).iloc[0]
            best_summary = [
                f"Best model by F1-score: {best_row['Model']}.",
                "Key metrics: "
                f"Accuracy={best_row['Accuracy']:.4f}, "
                f"Precision={best_row['Precision']:.4f}, "
                f"Recall={best_row['Recall']:.4f}, "
                f"F1-score={best_row['F1-score']:.4f}"
                + (f", ROC-AUC={best_row['ROC-AUC']:.4f}." if "ROC-AUC" in best_row else "."),
                "F1-score is used as the primary summary metric because it balances precision and recall, which is "
                "important when heart disease screening must manage both false positives and false negatives.",
            ]
            _add_text_page(pdf, "Best Model Summary", best_summary)
        else:
            _add_text_page(pdf, "Model Evaluation", ["final_model_results.csv was not found."])

        if not cross_validation.empty:
            _add_table_page(pdf, "Cross-Validation Stability", cross_validation, font_size=6)
            _add_text_page(
                pdf,
                "Model Stability Notes",
                [
                    "Cross-validation reports mean and standard deviation across five stratified folds. "
                    "Higher mean values indicate stronger average performance; lower standard deviations indicate "
                    "more stable behavior across different patient subsets.",
                    "Models with similar F1-score means should be compared by their F1-score standard deviation. "
                    "A lower standard deviation suggests the model is less dependent on one favorable train-test split.",
                ],
            )

        if not clustering_results.empty:
            _add_table_page(pdf, "Clustering Results", clustering_results, font_size=8)
            best_cluster = clustering_results.sort_values("Silhouette Score", ascending=False).iloc[0]
            _add_text_page(
                pdf,
                "Clustering Summary",
                [
                    f"The best cluster count selected by Silhouette Score was k={int(best_cluster['k'])}.",
                    f"For this k, Silhouette Score={best_cluster['Silhouette Score']:.4f}, "
                    f"Adjusted Rand Index={best_cluster['Adjusted Rand Index']:.4f}, and "
                    f"Normalized Mutual Information={best_cluster['Normalized Mutual Information']:.4f}.",
                    "ARI and NMI compare unsupervised cluster assignments with the known heart disease labels. "
                    "These metrics are diagnostic only; the labels are not used by K-Means during clustering.",
                ],
            )
            _add_image_page(pdf, "Elbow Method", PLOTS_DIR / "elbow_method.png")
            _add_image_page(pdf, "Silhouette Scores", PLOTS_DIR / "silhouette_scores.png")
            _add_image_page(
                pdf,
                "PCA Cluster Visualization",
                PLOTS_DIR / "kmeans_pca_clusters.png",
                "The left plot shows K-Means cluster assignments. The right plot shows the true heart disease labels for the same PCA-projected patients.",
            )

        if not feature_importance.empty:
            top_features = feature_importance.head(10)
            feature_columns = [
                "Overall Rank",
                "Feature",
                "Logistic Regression Coefficient",
                "Random Forest Importance",
                "Combined Importance",
            ]
            available_columns = [column for column in feature_columns if column in top_features.columns]
            _add_table_page(pdf, "Top 10 Feature Importance", top_features[available_columns], font_size=7)
            _add_image_page(pdf, "Feature Importance Chart", RESULTS_DIR / "feature_importance.png")
            leading_features = ", ".join(top_features["Feature"].head(5).astype(str))
            _add_text_page(
                pdf,
                "Feature Importance Analysis",
                [
                    f"The leading features in the combined importance ranking were: {leading_features}.",
                    "Logistic Regression coefficients provide direction: positive coefficients increase the predicted "
                    "risk score and negative coefficients decrease it. Random Forest importances rank how strongly each "
                    "feature contributes to tree split quality, but they do not provide a positive or negative direction.",
                ],
            )

    return output_path


if __name__ == "__main__":
    report = generate_report()
    print(f"Report saved to: {report}")
