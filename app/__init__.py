import os

# Must be set before `transformers` is imported anywhere in this package,
# otherwise it may try to load an incompatible TensorFlow/Keras 3 backend
# on machines that have TensorFlow installed, even though this project
# only uses the PyTorch backend.
os.environ.setdefault("USE_TF", "0")
