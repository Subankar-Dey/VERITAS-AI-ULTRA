import torch
from transformers import AutoTokenizer, DistilBertForSequenceClassification

MODEL_PATH = "saved_models/text_model_v4"

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)

model = DistilBertForSequenceClassification.from_pretrained(MODEL_PATH)

model.eval()


def predict_news(news):

    inputs = tokenizer(
        news,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=256
    )

    with torch.no_grad():
        outputs = model(**inputs)

    prediction = torch.argmax(outputs.logits, dim=1).item()

    probabilities = torch.softmax(outputs.logits, dim=1)

    confidence = probabilities[0][prediction].item() * 100
    real_confidence = probabilities[0][1].item() * 100

    if prediction == 1:
        label = "REAL NEWS ✅"
    else:
        label = "FAKE NEWS ❌"

    return label, round(confidence, 2), round(real_confidence, 2)