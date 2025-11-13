import os

env = os.environ.get("ENV", "dev").lower()

if env == "dev":
    from .dev import *