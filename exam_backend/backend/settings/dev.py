from .base import *

DEBUG = True
ALLOWED_HOSTS = ["*"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        'NAME': BASE_DIR / "db.sqlite3",
    }
}

# EMAIL_BACKEND = os.environ.get("EMAIL_BACKEND")
# EMAIL_HOST = os.environ.get("EMAIL_HOST")
# EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS")
# EMAIL_PORT = os.environ.get("EMAIL_PORT")
# EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER")
# EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD")
# EMAIL_FROM = os.environ.get("EMAIL_FROM")

CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:5501",
    "http://192.168.0.198:5501"
    ]