
import os
from dotenv import load_dotenv

load_dotenv()

from .base import *


DEBUG = True

ALLOWED_HOSTS = []

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "hireiq",           # Your DB name
        "USER": "hireiq_user",      # Your DB user
        "PASSWORD": os.environ.get("DB_PASSWORD"),    # Your DB password
        "HOST": "localhost",
        "PORT": "5432",
        # 
        # 👇 ADD THIS PART
        "OPTIONS": {
            "connect_timeout": 5,   # seconds
        }
    }
}

# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.postgresql",
#         "NAME": os.environ.get("DB_NAME", "hireiq"),
#         "USER": os.environ.get("DB_USER", "hireiq_user"),
#         "PASSWORD": os.environ.get("DB_PASSWORD"),
#         "HOST": os.environ.get("DB_HOST", "localhost"),
#         "PORT": "5432",
#         "OPTIONS": {
#             "connect_timeout": 5,
#         }
#     }
# }
