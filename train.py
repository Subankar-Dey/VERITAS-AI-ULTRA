"""
Fine-tunes the existing DistilBERT checkpoint (saved_models/text_model) on
news_data/real.csv + news_data/fake.csv, and saves the result to
saved_models/text_model_v2 (the original checkpoint is left untouched).

Usage:
    python train.py
"""

import csv
import os
from pathlib import Path

os.environ.setdefault("USE_TF", "0")

import numpy as np
from datasets import Dataset
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from transformers import (
    AutoTokenizer,
    DistilBertForSequenceClassification,
    Trainer,
    TrainingArguments,
)

BASE_DIR = Path(__file__).resolve().parent
SOURCE_MODEL = BASE_DIR / "saved_models" / "text_model"
OUTPUT_MODEL = BASE_DIR / "saved_models" / "text_model_v4"
DATA_DIR = BASE_DIR / "news_data"

LABEL_TO_ID = {"FAKE": 0, "REAL": 1}


def load_csv(path):
    texts, labels = [], []
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            text = row["text"].strip()
            if text:
                texts.append(text)
                labels.append(LABEL_TO_ID[row["label"].strip()])
    return texts, labels


def load_dataset():
    real_texts, real_labels = load_csv(DATA_DIR / "real.csv")
    fake_texts, fake_labels = load_csv(DATA_DIR / "fake.csv")

    texts = real_texts + fake_texts
    labels = real_labels + fake_labels

    print(f"Loaded {len(real_texts)} real + {len(fake_texts)} fake = {len(texts)} rows")
    return texts, labels


def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=1)
    return {
        "accuracy": accuracy_score(labels, predictions),
        "precision": precision_score(labels, predictions, zero_division=0),  # type: ignore[arg-type]
        "recall": recall_score(labels, predictions, zero_division=0),  # type: ignore[arg-type]
        "f1": f1_score(labels, predictions, zero_division=0),  # type: ignore[arg-type]
    }


def main():
    texts, labels = load_dataset()

    train_texts, val_texts, train_labels, val_labels = train_test_split(
        texts, labels, test_size=0.15, random_state=42, stratify=labels
    )

    tokenizer = AutoTokenizer.from_pretrained(SOURCE_MODEL)
    model = DistilBertForSequenceClassification.from_pretrained(SOURCE_MODEL)

    def tokenize(batch):
        return tokenizer(batch["text"], truncation=True, padding="max_length", max_length=256)

    train_ds = Dataset.from_dict({"text": train_texts, "label": train_labels}).map(
        tokenize, batched=True
    )
    val_ds = Dataset.from_dict({"text": val_texts, "label": val_labels}).map(
        tokenize, batched=True
    )

    training_args = TrainingArguments(
        output_dir=str(BASE_DIR / "training_output"),
        num_train_epochs=3,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        learning_rate=2e-5,
        weight_decay=0.01,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        logging_steps=10,
        report_to=[],
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=val_ds,
        compute_metrics=compute_metrics,
    )

    trainer.train()

    metrics = trainer.evaluate()
    print("Final validation metrics:", metrics)

    OUTPUT_MODEL.mkdir(parents=True, exist_ok=True)
    trainer.save_model(str(OUTPUT_MODEL))
    tokenizer.save_pretrained(str(OUTPUT_MODEL))
    print(f"Saved fine-tuned model to {OUTPUT_MODEL}")


if __name__ == "__main__":
    main()
