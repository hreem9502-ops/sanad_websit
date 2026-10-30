"""
مشروع التخرج: نظام "سند" (TechCare) الذكي لإدارة الأجهزة والصيانة التقنية
خادم تطبيقي متكامل (Python Flask + SQLite / MySQL) مع واجهات REST API كاملة
يربط الواجهة الأمامية بقاعدة البيانات مباشرة مع دعم العمل التلقائي الهجين.
"""
import os
import sqlite3
from datetime import datetime, timedelta
from flask import Flask, jsonify, request, send_from_directory, make_response

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(os.path.dirname(BASE_DIR), "frontend")
DB_PATH = os.path.join(BASE_DIR, "sanad_local.db")

app = Flask(__name__, static_folder=FRONTEND_DIR)


# ============================================================================
# إعداد CORS لدعم الاتصال من المتصفح أو من استضافة GitHub Pages
# ============================================================================
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


@app.route("/api/<path:subpath>", methods=["OPTIONS"])
def handle_options(subpath):
    return make_response("", 204)


# ============================================================================
# الاتصال بقاعدة البيانات وإنشاء الجداول والبيانات الأولية (Seed Data)
# ============================================================================
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def _hours_ago_iso(hours):
    return (datetime.now() - timedelta(hours=hours)).strftime("%Y-%m-%dT%H:%M:%S")


def get_seed_data():
    h6 = _hours_ago_iso(6)
    h30 = _hours_ago_iso(30)
    h3 = _hours_ago_iso(3.2)
    return {
        "schemaVersion": 2,
        "currentUserId": 1,
        "users": [
            {"User_ID": 1, "Name": "م. عبدالله المالكي", "Email": "admin@sanad.tech", "Password": "••••••", "Role": "Admin", "RoleAr": "مدير النظام", "Department": "إدارة تقنية المعلومات", "Phone": "0501122334"},
            {"User_ID": 2, "Name": "م. فهد العتيبي", "Email": "fahad.tech@sanad.tech", "Password": "••••••", "Role": "Technician", "RoleAr": "موظف الدعم الفني", "Department": "قسم الدعم الفني والصيانة", "Phone": "0502233445"},
            {"User_ID": 3, "Name": "م. ريان الزهراني", "Email": "rayan.tech@sanad.tech", "Password": "••••••", "Role": "Technician", "RoleAr": "موظف الدعم الفني", "Department": "قسم الشبكات والأنظمة", "Phone": "0503344556"},
            {"User_ID": 4, "Name": "أ. سارة القحطاني", "Email": "sara@sanad.tech", "Password": "••••••", "Role": "User", "RoleAr": "مستخدم", "Department": "إدارة الموارد البشرية", "Phone": "0554455667"},
            {"User_ID": 5, "Name": "أ. محمد الدوسري", "Email": "mohammed@sanad.tech", "Password": "••••••", "Role": "User", "RoleAr": "مستخدم", "Department": "الإدارة المالية والمحاسبة", "Phone": "0555566778"},
            {"User_ID": 6, "Name": "د. نورة الشمري", "Email": "noura@sanad.tech", "Password": "••••••", "Role": "User", "RoleAr": "مستخدم", "Department": "قسم الجودة والتطوير", "Phone": "0556677889"},
        ],
        "devices": [
            {"Device_ID": "SND-PC-101", "Device_Name": "HP EliteDesk 800 G8", "Device_Type": "كمبيوتر مكتبي", "Serial_Number": "SN-HP800-99214", "Status": "يعمل بكفاءة", "Location": "الإدارة المالية - مكتب 204", "Purchase_Date": "2024-02-15", "Specs": "Intel Core i7-11700, 16GB RAM, 512GB NVMe"},
            {"Device_ID": "SND-LP-102", "Device_Name": "Dell Latitude 5540", "Device_Type": "لابتوب", "Serial_Number": "SN-DL5540-44812", "Status": "تحت الصيانة", "Location": "الموارد البشرية - مكتب 108", "Purchase_Date": "2024-06-10", "Specs": "Intel Core i7-1355U, 16GB RAM, 512GB SSD"},
            {"Device_ID": "SND-PR-103", "Device_Name": "HP LaserJet Pro M404dn", "Device_Type": "طابعة", "Serial_Number": "SN-HPM404-77319", "Status": "معطل", "Location": "قسم الجودة - قاعة الطباعة المركزية", "Purchase_Date": "2023-05-20", "Specs": "طابعة ليزر شبكية مزدوجة الوجهين"},
            {"Device_ID": "SND-MN-104", "Device_Name": "Dell UltraSharp 27\" U2723QE", "Device_Type": "شاشة", "Serial_Number": "SN-DLU27-33108", "Status": "يعمل بكفاءة", "Location": "إدارة تقنية المعلومات - مكتب 301", "Purchase_Date": "2024-09-01", "Specs": "4K UHD IPS Black, USB-C Hub 90W"},
            {"Device_ID": "SND-SV-105", "Device_Name": "Dell PowerEdge R750", "Device_Type": "خادم (Server)", "Serial_Number": "SN-DLR750-10092", "Status": "يعمل بكفاءة", "Location": "غرفة الخوادم الرئيسية - الدور 3", "Purchase_Date": "2023-11-12", "Specs": "Dual Xeon Silver, 128GB ECC RAM, 8TB RAID10"},
            {"Device_ID": "SND-LP-106", "Device_Name": "Lenovo ThinkPad X1 Carbon G11", "Device_Type": "لابتوب", "Serial_Number": "SN-LNX1C-88401", "Status": "يعمل بكفاءة", "Location": "مكتب المدير التنفيذي - الدور 4", "Purchase_Date": "2025-01-18", "Specs": "Intel Core i7, 32GB RAM, 1TB SSD"},
            {"Device_ID": "SND-NW-107", "Device_Name": "Cisco Catalyst 9200L Switch", "Device_Type": "أجهزة شبكات", "Serial_Number": "SN-CSC92-55902", "Status": "تحت الصيانة", "Location": "كبينة الاتصالات الفرعية - الدور 2", "Purchase_Date": "2023-08-05", "Specs": "48-Port PoE+ Managed Network Switch"},
            {"Device_ID": "SND-PC-108", "Device_Name": "Lenovo ThinkCentre M90t", "Device_Type": "كمبيوتر مكتبي", "Serial_Number": "SN-LNM90-66230", "Status": "خارج الخدمة", "Location": "المستودع التقني - الدور الأرضي", "Purchase_Date": "2021-03-14", "Specs": "Intel Core i5-10500, 8GB RAM, 256GB SSD"},
        ],
        "faults": [
            {"Fault_ID": "FLT-2026-001", "Device_ID": "SND-PR-103", "User_ID": 6, "Assigned_Tech_ID": 2, "Fault_Category": "عطل ميكانيكي / سحب ورق", "Priority": "عالية", "Fault_Description": "الطابعة تتوقف عن سحب الورق وتظهر رسالة خطأ Paper Jam متكررة مع صوت احتكاك في البكرات الداخلية.", "Report_Date": h6[:10], "Reported_At": h6, "Closed_At": None, "Status": "جديد", "Rating": None, "Rating_Comment": None, "Rated_At": None},
            {"Fault_ID": "FLT-2026-002", "Device_ID": "SND-LP-102", "User_ID": 4, "Assigned_Tech_ID": 2, "Fault_Category": "عطل نظام التشغيل والحرارة", "Priority": "عالية", "Fault_Description": "ارتفاع شديد في حرارة اللابتوب وانطفاء مفاجئ عند تشغيل برامج قواعد البيانات مع بطء ملحوظ في الإقلاع.", "Report_Date": h30[:10], "Reported_At": h30, "Closed_At": None, "Status": "قيد المعالجة", "Rating": None, "Rating_Comment": None, "Rated_At": None},
            {"Fault_ID": "FLT-2026-003", "Device_ID": "SND-NW-107", "User_ID": 1, "Assigned_Tech_ID": 3, "Fault_Category": "انقطاع منافذ الشبكة PoE", "Priority": "حرجة", "Fault_Description": "توقف 6 منافذ تغذية PoE عن العمل في السويتش الفرعي بالدور الثاني مما أثر على هواتف IP في القسم.", "Report_Date": h3[:10], "Reported_At": h3, "Closed_At": None, "Status": "قيد المعالجة", "Rating": None, "Rating_Comment": None, "Rated_At": None},
            {"Fault_ID": "FLT-2026-004", "Device_ID": "SND-PC-101", "User_ID": 5, "Assigned_Tech_ID": 2, "Fault_Category": "مشكلة اتصال بالشبكة والنظام المالي", "Priority": "متوسطة", "Fault_Description": "انقطاع متكرر في كرت الشبكة الداخلي وتأخر في مزامنة ملفات النظام المحاسبي.", "Report_Date": "2026-10-10", "Reported_At": "2026-10-10T09:30:00", "Closed_At": "2026-10-11T13:00:00", "Status": "مغلق", "Rating": 5, "Rating_Comment": "تم الحل بسرعة وبشكل احترافي، شكراً.", "Rated_At": "2026-10-11T15:20:00"},
            {"Fault_ID": "FLT-2026-005", "Device_ID": "SND-PR-103", "User_ID": 4, "Assigned_Tech_ID": 2, "Fault_Category": "ضعف جودة الطباعة", "Priority": "منخفضة", "Fault_Description": "بهتان في النصوص المطبوعة وظهور خطوط طولية باهتة على الورق.", "Report_Date": "2026-09-22", "Reported_At": "2026-09-22T10:00:00", "Closed_At": "2026-09-23T12:00:00", "Status": "مغلق", "Rating": None, "Rating_Comment": None, "Rated_At": None},
            {"Fault_ID": "FLT-2026-006", "Device_ID": "SND-PR-103", "User_ID": 5, "Assigned_Tech_ID": 3, "Fault_Category": "تعطل وحدة الشبكة في الطابعة", "Priority": "متوسطة", "Fault_Description": "عدم ظهور الطابعة على الشبكة المحلية للموظفين في قسم المحاسبة.", "Report_Date": "2026-08-14", "Reported_At": "2026-08-14T09:00:00", "Closed_At": "2026-08-18T11:00:00", "Status": "مغلق", "Rating": 3, "Rating_Comment": "تم الإصلاح لكن الانتظار كان أطول من المتوقع.", "Rated_At": "2026-08-18T14:00:00"},
        ],
        "maintenance": [
            {"Maintenance_ID": "MNT-2026-501", "Fault_ID": "FLT-2026-004", "Technician_ID": 2, "Maintenance_Date": "2026-10-11", "Action_Taken": "تحديث تعريف كرت الشبكة Intel Ethernet إلى آخر إصدار واستبدال كيبل الشبكة بكيبل Cat6A معتمد.", "Parts_Replaced": "كيبل شبكة Cat6A بطول 5 متر", "Cost": 45, "Notes": "تم اختبار سرعة واستقرار الاتصال لمدة ساعتين ويعمل الجهاز بكفاءة تامة."},
            {"Maintenance_ID": "MNT-2026-502", "Fault_ID": "FLT-2026-005", "Technician_ID": 2, "Maintenance_Date": "2026-09-23", "Action_Taken": "تنظيف وحدة الدرام الليزري واستبدال خرطوشة الحبر الأصلية HP 59A وإجراء معايرة كاملة.", "Parts_Replaced": "خرطوشة حبر HP 59A", "Cost": 320, "Notes": "يُنصح باستخدام ورق 80 جرام لتقليل تآكل الدرام."},
            {"Maintenance_ID": "MNT-2026-503", "Fault_ID": "FLT-2026-006", "Technician_ID": 3, "Maintenance_Date": "2026-08-15", "Action_Taken": "إعادة ضبط إعدادات IP الثابت للطابعة وتحديث Firmware الخاص بوحدة الشبكة.", "Parts_Replaced": "لا يوجد", "Cost": 0, "Notes": "تكرار أعطال الطابعة SND-PR-103؛ يوصى بجدولة صيانة وقائية شهرية لها."},
            {"Maintenance_ID": "MNT-2026-504", "Fault_ID": "FLT-2026-002", "Technician_ID": 2, "Maintenance_Date": "2026-10-19", "Action_Taken": "فك الجهاز وتنظيف مروحة التبريد وتجديد المعجون الحراري، وجاري فحص سلامة قطاع الإقلاع.", "Parts_Replaced": "معجون حراري احترافي Arctic MX-6", "Cost": 60, "Notes": "الجهاز قيد الاختبار النهائي قبل إغلاق البلاغ."},
        ],
    }


def init_db(force_reset=False):
    conn = get_db()
    cur = conn.cursor()

    cur.executescript(
        """
        CREATE TABLE IF NOT EXISTS AppMeta (
            Key TEXT PRIMARY KEY,
            Value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS Users (
            User_ID INTEGER PRIMARY KEY,
            Name TEXT NOT NULL,
            Email TEXT NOT NULL UNIQUE,
            Password TEXT NOT NULL,
            Role TEXT NOT NULL DEFAULT 'User',
            RoleAr TEXT NOT NULL DEFAULT 'مستخدم',
            Department TEXT DEFAULT 'الإدارة العامة',
            Phone TEXT DEFAULT NULL
        );

        CREATE TABLE IF NOT EXISTS Devices (
            Device_ID TEXT PRIMARY KEY,
            Device_Name TEXT NOT NULL,
            Device_Type TEXT NOT NULL,
            Serial_Number TEXT NOT NULL,
            Status TEXT NOT NULL DEFAULT 'يعمل بكفاءة',
            Location TEXT NOT NULL,
            Purchase_Date TEXT NOT NULL,
            Specs TEXT DEFAULT ''
        );

        CREATE TABLE IF NOT EXISTS Faults (
            Fault_ID TEXT PRIMARY KEY,
            Device_ID TEXT NOT NULL,
            User_ID INTEGER NOT NULL,
            Assigned_Tech_ID INTEGER DEFAULT NULL,
            Fault_Category TEXT NOT NULL,
            Priority TEXT NOT NULL DEFAULT 'متوسطة',
            Fault_Description TEXT NOT NULL,
            Report_Date TEXT NOT NULL,
            Reported_At TEXT DEFAULT NULL,
            Closed_At TEXT DEFAULT NULL,
            Status TEXT NOT NULL DEFAULT 'جديد',
            Rating INTEGER DEFAULT NULL,
            Rating_Comment TEXT DEFAULT NULL,
            Rated_At TEXT DEFAULT NULL
        );

        CREATE TABLE IF NOT EXISTS Maintenance (
            Maintenance_ID TEXT PRIMARY KEY,
            Fault_ID TEXT NOT NULL,
            Technician_ID INTEGER NOT NULL,
            Maintenance_Date TEXT NOT NULL,
            Action_Taken TEXT NOT NULL,
            Parts_Replaced TEXT DEFAULT 'لا يوجد',
            Cost REAL DEFAULT 0,
            Notes TEXT DEFAULT ''
        );
        """
    )

    user_count = cur.execute("SELECT COUNT(*) FROM Users").fetchone()[0]
    if force_reset or user_count == 0:
        write_full_state(conn, get_seed_data())

    conn.commit()
    conn.close()


def write_full_state(conn, data):
    cur = conn.cursor()
    cur.execute("DELETE FROM Maintenance")
    cur.execute("DELETE FROM Faults")
    cur.execute("DELETE FROM Devices")
    cur.execute("DELETE FROM Users")
    cur.execute("DELETE FROM AppMeta")

    cur.execute(
        "INSERT INTO AppMeta (Key, Value) VALUES (?, ?), (?, ?)",
        (
            "schemaVersion",
            str(data.get("schemaVersion", 2)),
            "currentUserId",
            str(data.get("currentUserId", 1)),
        ),
    )

    role_ar_map = {"Admin": "مدير النظام", "Technician": "موظف الدعم الفني", "User": "مستخدم"}
    for u in data.get("users", []):
        role = u.get("Role", "User")
        cur.execute(
            """
            INSERT INTO Users (User_ID, Name, Email, Password, Role, RoleAr, Department, Phone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                int(u["User_ID"]),
                u["Name"],
                u["Email"],
                u.get("Password", "••••••"),
                role,
                u.get("RoleAr") or role_ar_map.get(role, "مستخدم"),
                u.get("Department", "الإدارة العامة"),
                u.get("Phone"),
            ),
        )

    for d in data.get("devices", []):
        cur.execute(
            """
            INSERT INTO Devices (Device_ID, Device_Name, Device_Type, Serial_Number, Status, Location, Purchase_Date, Specs)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                d["Device_ID"],
                d["Device_Name"],
                d["Device_Type"],
                d.get("Serial_Number", "-"),
                d.get("Status", "يعمل بكفاءة"),
                d.get("Location", "-"),
                d.get("Purchase_Date", datetime.now().strftime("%Y-%m-%d")),
                d.get("Specs", ""),
            ),
        )

    for f in data.get("faults", []):
        cur.execute(
            """
            INSERT INTO Faults (
                Fault_ID, Device_ID, User_ID, Assigned_Tech_ID, Fault_Category,
                Priority, Fault_Description, Report_Date, Reported_At, Closed_At,
                Status, Rating, Rating_Comment, Rated_At
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                f["Fault_ID"],
                f["Device_ID"],
                int(f["User_ID"]),
                int(f["Assigned_Tech_ID"]) if f.get("Assigned_Tech_ID") is not None else None,
                f.get("Fault_Category", "عطل عام"),
                f.get("Priority", "متوسطة"),
                f.get("Fault_Description", ""),
                f.get("Report_Date", datetime.now().strftime("%Y-%m-%d")),
                f.get("Reported_At"),
                f.get("Closed_At"),
                f.get("Status", "جديد"),
                int(f["Rating"]) if f.get("Rating") is not None else None,
                f.get("Rating_Comment"),
                f.get("Rated_At"),
            ),
        )

    for m in data.get("maintenance", []):
        cur.execute(
            """
            INSERT INTO Maintenance (
                Maintenance_ID, Fault_ID, Technician_ID, Maintenance_Date,
                Action_Taken, Parts_Replaced, Cost, Notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                m["Maintenance_ID"],
                m["Fault_ID"],
                int(m["Technician_ID"]),
                m.get("Maintenance_Date", datetime.now().strftime("%Y-%m-%d")),
                m.get("Action_Taken", ""),
                m.get("Parts_Replaced", "لا يوجد"),
                float(m.get("Cost", 0) or 0),
                m.get("Notes", ""),
            ),
        )


def read_full_state():
    conn = get_db()
    cur = conn.cursor()

    meta = {row["Key"]: row["Value"] for row in cur.execute("SELECT Key, Value FROM AppMeta").fetchall()}
    users = [dict(r) for r in cur.execute("SELECT * FROM Users ORDER BY User_ID ASC").fetchall()]
    devices = [dict(r) for r in cur.execute("SELECT * FROM Devices").fetchall()]

    faults = []
    for r in cur.execute("SELECT * FROM Faults").fetchall():
        d = dict(r)
        # Drop None optional fields so JSON matches frontend expectations cleanly
        faults.append({k: v for k, v in d.items() if v is not None or k in ("Assigned_Tech_ID",)})

    maintenance = [dict(r) for r in cur.execute("SELECT * FROM Maintenance").fetchall()]
    conn.close()

    return {
        "schemaVersion": int(meta.get("schemaVersion", 2)),
        "currentUserId": int(meta.get("currentUserId", 1)),
        "users": users,
        "devices": devices,
        "faults": faults,
        "maintenance": maintenance,
        "backend": {
            "engine": "SQLite",
            "database": "sanad_local.db",
            "status": "connected",
        },
    }


# ============================================================================
# مسارات الواجهة الأمامية (Static Frontend Serving)
# ============================================================================
@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(FRONTEND_DIR, filename)


# ============================================================================
# مسارات REST API الخلفية (ربط الفرونت بقاعدة البيانات)
# ============================================================================
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "engine": "SQLite (sanad_local.db)",
        "system": "سند (Sanad TechCare) - نظام ذكي لإدارة الأجهزة والصيانة التقنية",
        "version": "2.6.0",
    })


@app.route("/api/bootstrap", methods=["GET"])
def api_bootstrap():
    """جلب كامل بيانات النظام من جداول قاعدة البيانات (Users, Devices, Faults, Maintenance)"""
    return jsonify(read_full_state())


@app.route("/api/sync", methods=["POST"])
def api_sync():
    """مزامنة وحفظ التعديلات من الواجهة الأمامية إلى جداول قاعدة البيانات"""
    payload = request.get_json(silent=True)
    if not payload or not isinstance(payload, dict):
        return jsonify({"error": "Invalid payload"}), 400

    conn = get_db()
    try:
        write_full_state(conn, payload)
        conn.commit()
    finally:
        conn.close()

    return jsonify({"ok": True, "syncedAt": datetime.now().isoformat()})


@app.route("/api/reset", methods=["POST"])
def api_reset():
    """استعادة البيانات الافتراضية في قاعدة البيانات"""
    init_db(force_reset=True)
    return jsonify(read_full_state())


@app.route("/api/auth/login", methods=["POST"])
def api_login():
    """التحقق من بيانات تسجيل الدخول في جدول المستخدمين (Users)"""
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip().lower()
    conn = get_db()
    row = conn.execute("SELECT * FROM Users WHERE LOWER(Email) = ?", (email,)).fetchone()
    if not row:
        conn.close()
        return jsonify({"ok": False, "error": "البريد الإلكتروني غير مسجل في النظام"}), 401

    user = dict(row)
    conn.execute("INSERT OR REPLACE INTO AppMeta (Key, Value) VALUES ('currentUserId', ?)", (str(user["User_ID"]),))
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "user": user})


@app.route("/api/devices", methods=["GET", "POST"])
def api_devices():
    conn = get_db()
    if request.method == "GET":
        rows = [dict(r) for r in conn.execute("SELECT * FROM Devices").fetchall()]
        conn.close()
        return jsonify(rows)

    d = request.get_json(silent=True) or {}
    conn.execute(
        """
        INSERT OR REPLACE INTO Devices (Device_ID, Device_Name, Device_Type, Serial_Number, Status, Location, Purchase_Date, Specs)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            d["Device_ID"],
            d["Device_Name"],
            d["Device_Type"],
            d.get("Serial_Number", "-"),
            d.get("Status", "يعمل بكفاءة"),
            d.get("Location", "-"),
            d.get("Purchase_Date", datetime.now().strftime("%Y-%m-%d")),
            d.get("Specs", ""),
        ),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "Device_ID": d["Device_ID"]}), 201


@app.route("/api/devices/<device_id>", methods=["PUT", "DELETE"])
def api_device_item(device_id):
    conn = get_db()
    if request.method == "DELETE":
        conn.execute("DELETE FROM Faults WHERE Device_ID = ?", (device_id,))
        conn.execute("DELETE FROM Devices WHERE Device_ID = ?", (device_id,))
        conn.commit()
        conn.close()
        return jsonify({"ok": True})

    d = request.get_json(silent=True) or {}
    conn.execute(
        """
        UPDATE Devices
        SET Device_Name = ?, Device_Type = ?, Status = ?, Location = ?
        WHERE Device_ID = ?
        """,
        (d.get("Device_Name"), d.get("Device_Type"), d.get("Status"), d.get("Location"), device_id),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.route("/api/faults", methods=["GET", "POST"])
def api_faults():
    conn = get_db()
    if request.method == "GET":
        rows = [dict(r) for r in conn.execute("SELECT * FROM Faults").fetchall()]
        conn.close()
        return jsonify(rows)

    f = request.get_json(silent=True) or {}
    now_iso = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    conn.execute(
        """
        INSERT OR REPLACE INTO Faults (
            Fault_ID, Device_ID, User_ID, Assigned_Tech_ID, Fault_Category,
            Priority, Fault_Description, Report_Date, Reported_At, Status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            f["Fault_ID"],
            f["Device_ID"],
            int(f["User_ID"]),
            int(f.get("Assigned_Tech_ID", 2)),
            f.get("Fault_Category", "عطل عام"),
            f.get("Priority", "متوسطة"),
            f.get("Fault_Description", ""),
            f.get("Report_Date", now_iso[:10]),
            f.get("Reported_At", now_iso),
            f.get("Status", "جديد"),
        ),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "Fault_ID": f["Fault_ID"]}), 201


@app.route("/api/faults/<fault_id>/rating", methods=["POST"])
def api_fault_rating(fault_id):
    payload = request.get_json(silent=True) or {}
    rating = int(payload.get("Rating", 5))
    comment = payload.get("Rating_Comment", "")
    rated_at = payload.get("Rated_At") or datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    conn = get_db()
    conn.execute(
        "UPDATE Faults SET Rating = ?, Rating_Comment = ?, Rated_At = ? WHERE Fault_ID = ?",
        (rating, comment, rated_at, fault_id),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.route("/api/maintenance", methods=["GET", "POST"])
def api_maintenance():
    conn = get_db()
    if request.method == "GET":
        rows = [dict(r) for r in conn.execute("SELECT * FROM Maintenance").fetchall()]
        conn.close()
        return jsonify(rows)

    m = request.get_json(silent=True) or {}
    conn.execute(
        """
        INSERT OR REPLACE INTO Maintenance (
            Maintenance_ID, Fault_ID, Technician_ID, Maintenance_Date,
            Action_Taken, Parts_Replaced, Cost, Notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            m["Maintenance_ID"],
            m["Fault_ID"],
            int(m["Technician_ID"]),
            m.get("Maintenance_Date", datetime.now().strftime("%Y-%m-%d")),
            m.get("Action_Taken", ""),
            m.get("Parts_Replaced", "لا يوجد"),
            float(m.get("Cost", 0) or 0),
            m.get("Notes", ""),
        ),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "Maintenance_ID": m["Maintenance_ID"]}), 201


@app.route("/api/users", methods=["GET", "POST"])
def api_users():
    conn = get_db()
    if request.method == "GET":
        rows = [dict(r) for r in conn.execute("SELECT * FROM Users ORDER BY User_ID ASC").fetchall()]
        conn.close()
        return jsonify(rows)

    u = request.get_json(silent=True) or {}
    role = u.get("Role", "User")
    role_ar_map = {"Admin": "مدير النظام", "Technician": "موظف الدعم الفني", "User": "مستخدم"}
    conn.execute(
        """
        INSERT OR REPLACE INTO Users (User_ID, Name, Email, Password, Role, RoleAr, Department, Phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            int(u["User_ID"]),
            u["Name"],
            u["Email"],
            u.get("Password", "••••••"),
            role,
            u.get("RoleAr") or role_ar_map.get(role, "مستخدم"),
            u.get("Department", "الإدارة العامة"),
            u.get("Phone"),
        ),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "User_ID": u["User_ID"]}), 201


@app.route("/api/stats", methods=["GET"])
def api_stats():
    conn = get_db()
    total_devices = conn.execute("SELECT COUNT(*) FROM Devices").fetchone()[0]
    active_devices = conn.execute("SELECT COUNT(*) FROM Devices WHERE Status = 'يعمل بكفاءة'").fetchone()[0]
    open_faults = conn.execute("SELECT COUNT(*) FROM Faults WHERE Status != 'مغلق'").fetchone()[0]
    completed_maint = conn.execute("SELECT COUNT(*) FROM Maintenance").fetchone()[0]
    repeat_devices = [
        dict(r)
        for r in conn.execute(
            """
            SELECT d.Device_ID, d.Device_Name, d.Location, COUNT(f.Fault_ID) AS fault_count
            FROM Devices d
            JOIN Faults f ON f.Device_ID = d.Device_ID
            GROUP BY d.Device_ID
            HAVING COUNT(f.Fault_ID) >= 2
            ORDER BY fault_count DESC
            """
        ).fetchall()
    ]
    conn.close()
    return jsonify({
        "kpis": {
            "total_devices": total_devices,
            "active_devices": active_devices,
            "open_faults": open_faults,
            "completed_maintenance": completed_maint,
        },
        "repeat_fault_devices": repeat_devices,
    })


# تهيئة قاعدة البيانات تلقائياً عند تشغيل التطبيق
init_db()


if __name__ == "__main__":
    print("=" * 68)
    print("  نظام سند (Sanad TechCare) الذكي لإدارة الأجهزة والصيانة التقنية")
    print("  قاعدة البيانات المتصلة: SQLite -> backend_flask/sanad_local.db")
    print("  افتح المتصفح على العنوان: http://127.0.0.1:5000")
    print("=" * 68)
    app.run(host="127.0.0.1", port=5000, debug=True)
