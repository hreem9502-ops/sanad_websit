"""
مشروع التخرج: نظام "سند" (TechCare) الذكي لإدارة الأجهزة والصيانة التقنية
خادم تطبيقي متكامل (Python Flask + SQLite/MySQL) لتشغيل الموقع محلياً بضغطة زر
"""
import os
import sqlite3
from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(os.path.dirname(BASE_DIR), "frontend")
DB_PATH = os.path.join(BASE_DIR, "sanad_local.db")

app = Flask(__name__, static_folder=FRONTEND_DIR)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(FRONTEND_DIR, filename)


@app.route("/api/health")
def health():
    return jsonify({
        "status": "online",
        "system": "سند (Sanad TechCare) - نظام ذكي لإدارة الأجهزة والصيانة التقنية",
        "version": "2.5.0"
    })


if __name__ == "__main__":
    print("=" * 65)
    print("  نظام سند (Sanad TechCare) الذكي لإدارة الأجهزة والصيانة التقنية")
    print("  افتح المتصفح على العنوان: http://127.0.0.1:5000")
    print("=" * 65)
    app.run(host="127.0.0.1", port=5000, debug=True)
