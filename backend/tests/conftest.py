import os
import sys

# Ensure app package is importable and no real API calls are made in tests
os.environ.setdefault("OPENAI_API_KEY", "")
os.environ.setdefault("MOCK_MODE", "true")

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
