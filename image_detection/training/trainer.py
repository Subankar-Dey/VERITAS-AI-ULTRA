import torch
import torch.nn as nn
from typing import Tuple
from torch.utils.tensorboard import SummaryWriter
import mlflow
from tqdm import tqdm


class Trainer:
    def __init__(self, model: nn.Module, train_loader, val_loader, optimizer, scheduler, loss_fn, config, device):
        self.model = model.to(device)
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.optimizer = optimizer
        self.scheduler = scheduler
        self.loss_fn = loss_fn
        self.config = config
        self.device = device
        self.use_amp = config['training']['mixed_precision']
        self.scaler = torch.amp.GradScaler(enabled=self.use_amp)  # type: ignore[attr-defined]
        self.writer = SummaryWriter(log_dir=config['system']['log_dir'])

        mlflow.set_tracking_uri(config['mlops']['mlflow_tracking_uri'])
        mlflow.set_experiment(config['mlops']['experiment_name'])

    def train_epoch(self, epoch: int) -> float:
        self.model.train()
        running_loss = 0.0
        self.optimizer.zero_grad()
        accum_steps = self.config['training']['gradient_accumulation_steps']

        for batch_idx, (images, labels) in enumerate(tqdm(self.train_loader, desc=f"Epoch {epoch}")):
            images, labels = images.to(self.device), labels.to(self.device)

            with torch.amp.autocast(device_type=str(self.device).split(":")[0], enabled=self.use_amp):  # type: ignore[attr-defined]
                outputs = self.model(images)
                loss = self.loss_fn(outputs, labels) / accum_steps

            self.scaler.scale(loss).backward()

            if (batch_idx + 1) % accum_steps == 0:
                self.scaler.step(self.optimizer)
                self.scaler.update()
                self.optimizer.zero_grad()

            running_loss += loss.item() * accum_steps

        return running_loss / len(self.train_loader)

    def validate(self) -> Tuple[float, float]:
        self.model.eval()
        running_loss = 0.0
        correct = 0
        total = 0

        with torch.no_grad():
            for images, labels in self.val_loader:
                images, labels = images.to(self.device), labels.to(self.device)
                outputs = self.model(images)
                loss = self.loss_fn(outputs, labels)

                running_loss += loss.item()
                _, predicted = outputs.max(1)
                total += labels.size(0)
                correct += predicted.eq(labels).sum().item()

        return running_loss / len(self.val_loader), correct / total

    def fit(self) -> None:
        best_val_acc = 0.0
        patience_counter = 0

        os_makedirs = __import__('os').makedirs
        os_makedirs(self.config['system']['checkpoint_dir'], exist_ok=True)

        with mlflow.start_run():
            mlflow.log_params(self.config['training'])
            mlflow.log_param("backbone", self.config['model']['backbone'])

            for epoch in range(1, self.config['training']['epochs'] + 1):
                train_loss = self.train_epoch(epoch)
                val_loss, val_acc = self.validate()
                self.scheduler.step()

                self.writer.add_scalar("Loss/Train", train_loss, epoch)
                self.writer.add_scalar("Loss/Val", val_loss, epoch)
                self.writer.add_scalar("Accuracy/Val", val_acc, epoch)

                mlflow.log_metric("train_loss", train_loss, step=epoch)
                mlflow.log_metric("val_loss", val_loss, step=epoch)
                mlflow.log_metric("val_accuracy", val_acc, step=epoch)

                print(f"Epoch {epoch} | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.4f}")

                if val_acc > best_val_acc:
                    best_val_acc = val_acc
                    patience_counter = 0
                    torch.save(self.model.state_dict(), f"{self.config['system']['checkpoint_dir']}/best_model.pth")
                else:
                    patience_counter += 1
                    if patience_counter >= self.config['training']['early_stopping_patience']:
                        print("Early stopping triggered.")
                        break

        self.writer.close()
