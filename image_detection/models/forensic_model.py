import torch
import torch.nn as nn
import timm

class ForensicModel(nn.Module):
    def __init__(self, backbone_name: str, pretrained: bool = True, num_classes: int = 2, dropout_rate: float = 0.4):
        super().__init__()
        self.backbone_name = backbone_name
        
        # Load backbone structurally dynamically
        self.model = timm.create_model(backbone_name, pretrained=pretrained, num_classes=num_classes, drop_rate=dropout_rate)
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.model(x)

    def get_target_layer(self) -> nn.Module:
        """Returns target convolutional layer for Grad-CAM depending on structural backbone topology."""
        if "efficientnet" in self.backbone_name:
            return self.model.conv_head
        elif "convnext" in self.backbone_name:
            return self.model.stages[-1].blocks[-1]
        else:
            raise NotImplementedError("Dynamic tracking hook not configured for this specific backbone architecture.")