import pytest
import torch
import numpy as np
from models.forensic_model import ForensicModel
from datasets.pipeline_dataset import DatasetPipelineFactory

def test_model_structural_io():
    model = ForensicModel(backbone_name="efficientnet_b4", pretrained=False)
    x = torch.randn(2, 3, 380, 380)
    out = model(x)
    assert out.shape == (2, 2), "Output logits classification shape topology failure."

def test_data_augmentation_invariance():
    t_train, _ = DatasetPipelineFactory.get_transforms(380)
    dummy_img = np.uint8(np.random.rand(500, 500, 3) * 255)
    augmented = t_train(image=dummy_img)
    assert augmented['image'].shape == (3, 380, 380), "Transformation Pipeline sizing validation step constraint mismatch."