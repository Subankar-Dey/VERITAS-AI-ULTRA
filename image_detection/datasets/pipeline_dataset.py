import os
import glob
import torch
import numpy as np
from typing import List, Tuple, Dict
from torch.utils.data import Dataset
from sklearn.model_selection import train_test_split
import cv2
import albumentations as A
from albumentations.pytorch import ToTensorV2
import logging

logger = logging.getLogger("ForensicDataset")

class DeepfakeDataset(Dataset):
    def __init__(self, file_paths: List[str], labels: List[int], transform: A.Compose):
        self.file_paths = file_paths
        self.labels = labels
        self.transform = transform

    def __len__(self) -> int:
        return len(self.file_paths)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        img_path = self.file_paths[idx]
        label = self.labels[idx]
        
        # Safe image loading
        img = cv2.imread(img_path)
        if img is None:
            # Fallback to a zero-filled array if corrupt mid-training
            img = np.zeros((380, 380, 3), dtype=np.uint8)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        augmented = self.transform(image=img)
        return augmented['image'], label


class DatasetPipelineFactory:
    @staticmethod
    def clean_and_validate(file_paths: List[str]) -> List[str]:
        valid_paths = []
        for path in file_paths:
            if os.path.exists(path) and os.path.getsize(path) > 1024: # Must be > 1KB
                valid_paths.append(path)
        return valid_paths

    @classmethod
    def create_splits(cls, data_dirs: List[str], val_size: float, test_size: float) -> Tuple[Dict, Dict, Dict]:
        all_paths = []
        all_labels = []

        for base_dir in data_dirs:
            # Expecting subdirectories: 'real' and 'fake'
            for label_idx, category in enumerate(['real', 'fake']):
                cat_dir = os.path.join(base_dir, category)
                if not os.path.exists(cat_dir):
                    continue
                paths = glob.glob(os.path.join(cat_dir, "**/*.*"), recursive=True)
                valid_paths = cls.clean_and_validate(paths)
                
                all_paths.extend(valid_paths)
                all_labels.extend([label_idx] * len(valid_paths))

        if len(all_paths) == 0:
            raise ValueError("No valid image samples found across designated repositories.")

        # Split Processing
        train_paths, test_paths, train_labels, test_labels = train_test_split(
            all_paths, all_labels, test_size=test_size, stratify=all_labels, random_state=42
        )
        
        adjusted_val_size = val_size / (1.0 - test_size)
        train_paths, val_paths, train_labels, val_labels = train_test_split(
            train_paths, train_labels, test_size=adjusted_val_size, stratify=train_labels, random_state=42
        )

        return (
            {"paths": train_paths, "labels": train_labels},
            {"paths": val_paths, "labels": val_labels},
            {"paths": test_paths, "labels": test_labels}
        )

    @staticmethod
    def get_transforms(img_size: int) -> Tuple[A.Compose, A.Compose]:
        train_transform = A.Compose(  # type: ignore[arg-type]
            [
                A.Resize(img_size, img_size),
                A.HorizontalFlip(p=0.5),
                A.RandomRotate90(p=0.3),
                A.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1, hue=0.05, p=0.5),
                A.GaussNoise(std_range=(0.04, 0.2), p=0.3),
                A.ImageCompression(quality_range=(70, 100), p=0.4),
                A.GaussianBlur(blur_limit=(3, 5), p=0.3),
                A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
                ToTensorV2(),
            ]
        )

        val_transform = A.Compose(  # type: ignore[arg-type]
            [
                A.Resize(img_size, img_size),
                A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
                ToTensorV2(),
            ]
        )
        return train_transform, val_transform