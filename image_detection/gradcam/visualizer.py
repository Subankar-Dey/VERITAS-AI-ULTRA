import cv2
import numpy as np
import torch
import torch.nn.functional as F

class ForensicGradCAM:
    def __init__(self, model: torch.nn.Module, target_layer: torch.nn.Module):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        self.handlers = []
        self._register_hooks()

    def _register_hooks(self):
        def forward_hook(module, input, output):
            self.activations = output
        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0]

        self.handlers.append(self.target_layer.register_forward_hook(forward_hook))
        self.handlers.append(self.target_layer.register_full_backward_hook(backward_hook))

    def generate_heatmap(self, input_tensor: torch.tensor, target_class: int = 1) -> np.ndarray:
        self.model.eval()
        output = self.model(input_tensor)
        self.model.zero_grad()
        
        loss = output[0, target_class]
        loss.backward()
        
        gradients = self.gradients.cpu().data.numpy()[0]
        activations = self.activations.cpu().data.numpy()[0]
        
        # Class Activation Map Math Weights Formulation
        weights = np.mean(gradients, axis=(1, 2))
        cam = np.zeros(activations.shape[1:], dtype=np.float32)
        
        for i, w in enumerate(weights):
            cam += w * activations[i, :, :]
            
        cam = np.maximum(cam, 0) # ReLU processing
        cam = cv2.resize(cam, (input_tensor.shape[2], input_tensor.shape[3]))
        cam -= np.min(cam)
        cam /= (np.max(cam) + 1e-8)
        return cam

    def overlay_heatmap(self, original_image_rgb: np.ndarray, heatmap: np.ndarray) -> np.ndarray:
        colored_heatmap = cv2.applyColorMap(np.uint8(255 * heatmap), cv2.COLORMAP_JET)
        colored_heatmap = cv2.cvtColor(colored_heatmap, cv2.COLOR_BGR2RGB)
        overlay = cv2.addWeighted(original_image_rgb, 0.6, colored_heatmap, 0.4, 0)
        return overlay

    def clear_hooks(self):
        for handler in self.handlers:
            handler.remove()