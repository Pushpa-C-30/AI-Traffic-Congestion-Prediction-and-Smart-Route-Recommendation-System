import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def test_model_pipeline_is_available():
    import importlib

    module = importlib.import_module('ml.training.train_model')
    assert hasattr(module, 'train_and_save_model')
