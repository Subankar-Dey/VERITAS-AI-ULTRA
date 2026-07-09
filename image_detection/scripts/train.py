import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import yaml
import torch
from datasets.pipeline_dataset import DatasetPipelineFactory, DeepfakeDataset
from models.forensic_model import ForensicModel
from training.loss import FocalLoss, nn
from training.trainer import Trainer
from torch.utils.data import DataLoader

def main():
    with open("configs/config.yaml", "r") as f:
        config = yaml.safe_load(f)
        
    device = torch.device(config['system']['device'] if torch.cuda.is_available() else "cpu")  # type: ignore[attr-defined]
    
    # Split Construction Engine
    train_splits, val_splits, _ = DatasetPipelineFactory.create_splits(
        data_dirs=config['dataset']['train_dirs'],
        val_size=config['dataset']['val_split'],
        test_size=config['dataset']['test_split']
    )
    
    train_trans, val_trans = DatasetPipelineFactory.get_transforms(config['dataset']['img_size'])
    
    train_ds = DeepfakeDataset(train_splits['paths'], train_splits['labels'], train_trans)
    val_ds = DeepfakeDataset(val_splits['paths'], val_splits['labels'], val_trans)
    
    train_loader = DataLoader(train_ds, batch_size=config['dataset']['batch_size'], shuffle=True, num_workers=config['dataset']['num_workers'], pin_memory=True)
    val_loader = DataLoader(val_ds, batch_size=config['dataset']['batch_size'], shuffle=False, num_workers=config['dataset']['num_workers'], pin_memory=True)
    
    model = ForensicModel(backbone_name=config['model']['backbone'], pretrained=config['model']['pretrained'])
    
    optimizer = torch.optim.AdamW(model.parameters(), lr=config['training']['optimizer']['lr'], weight_decay=config['training']['optimizer']['weight_decay'])
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=config['training']['scheduler']['t_max'], eta_min=config['training']['scheduler']['eta_min'])
    
    loss_fn = FocalLoss(alpha=config['training']['focal_alpha'], gamma=config['training']['focal_gamma']) if config['training']['loss_type'] == "focal" else nn.CrossEntropyLoss()
    
    trainer = Trainer(model, train_loader, val_loader, optimizer, scheduler, loss_fn, config, device)
    trainer.fit()

if __name__ == "__main__":
    main()