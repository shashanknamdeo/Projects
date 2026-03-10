import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
load_dotenv(BASE_DIR / '.env')

def get_path(env_key, default_name):
    """
    Returns a path from environment variable or a default relative to BASE_DIR.
    """
    env_path = os.getenv(env_key)
    if env_path:
        return Path(env_path).resolve()
    
    # Default fallback to project root/data/default_name
    default_path = (BASE_DIR / 'data' / default_name).resolve()
    os.makedirs(default_path, exist_ok=True)
    return default_path

# Exported Paths
KITECONNECT_DATA_DIR = get_path('KITECONNECT_DATA_DIR', 'kite_data')
GOOGLEDRIVE_TRADE_LOGS_DIR = get_path('GOOGLEDRIVE_TRADE_LOGS_DIR', 'logs')
DROPBOX_TRADING_DATA_DIR = get_path('DROPBOX_TRADING_DATA_DIR', 'option_data')
PYTHON_LIB_FILEIO_DIR = get_path('PYTHON_LIB_FILEIO_DIR', 'lib_fileio')
EXAMPLE_DATA_PATH = os.getenv('EXAMPLE_DATA_PATH', '')
