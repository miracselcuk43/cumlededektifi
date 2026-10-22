"""
api/index.py
Vercel Serverless Function Giriş Noktası
Flask uygulamasını Vercel Python runtime için dışa aktarır.
"""

import sys
import os

# Kök dizini sys.path'e ekle
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app import app

# Vercel WSGI entry point
# Vercel, 'app' değişkenini otomatik olarak bulup çalıştırır.
if __name__ == "__main__":
    app.run()
