import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import torch
import yaml
from models.forensic_model import ForensicModel

def export_assets():
    with open("configs/config.yaml", "r") as f:
        config = yaml.safe_load(f)
        
    model = ForensicModel(backbone_name=config['model']['backbone'], pretrained=False)
    model.eval()
    
    dummy_input = torch.randn(1, 3, config['dataset']['img_size'], config['dataset']['img_size'])
    
    # 1. Export standard PyTorch JIT Trace (TorchScript optimization)
    traced_model = torch.jit.trace(model, dummy_input)  # type: ignore[attr-defined]
    traced_model.save("weights/forensic_engine.pt")  # type: ignore[union-attr]
    print("Successfully preserved optimized JIT TorchScript Asset compilation.")
    
    # 2. Export strict Open Neural Network Exchange graph
    torch.onnx.export(
        model,
        (dummy_input,),
        "weights/forensic_engine.onnx",
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=['input_tensor_frames'],
        output_names=['verdict_logits'],
        dynamic_axes={'input_tensor_frames': {0: 'batch_size'}, 'verdict_logits': {0: 'batch_size'}}
    )
    print("Successfully preserved scalable ONNX Runtime Computation graph asset.")

if __name__ == "__main__":
    export_assets()