-- ============================================================================
-- مشروع التخرج: نظام "سند" (TechCare) الذكي لإدارة الأجهزة والصيانة التقنية
-- قاعدة البيانات: MySQL (متوافقة مع XAMPP / phpMyAdmin / MySQL Workbench)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS sanad_techcare_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sanad_techcare_db;

-- ----------------------------------------------------------------------------
-- 1. جدول المستخدمين (Users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Users (
    User_ID INT AUTO_INCREMENT PRIMARY KEY COMMENT 'رقم المستخدم',
    Name VARCHAR(120) NOT NULL COMMENT 'اسم المستخدم الكامل',
    Email VARCHAR(150) NOT NULL UNIQUE COMMENT 'البريد الإلكتروني',
    Password VARCHAR(255) NOT NULL COMMENT 'كلمة المرور المشفرة',
    Role ENUM('Admin', 'Technician', 'User') NOT NULL DEFAULT 'User' COMMENT 'نوع المستخدم (مدير النظام، موظف الدعم الفني، مستخدم)',
    Department VARCHAR(100) DEFAULT 'الإدارة العامة' COMMENT 'القسم أو الإدارة',
    Phone VARCHAR(30) DEFAULT NULL COMMENT 'رقم التواصل',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. جدول الأجهزة (Devices)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Devices (
    Device_ID VARCHAR(30) PRIMARY KEY COMMENT 'رقم أو رمز الجهاز الخاص (Asset Code)',
    Device_Name VARCHAR(150) NOT NULL COMMENT 'اسم وموديل الجهاز',
    Device_Type ENUM('كمبيوتر مكتبي', 'لابتوب', 'طابعة', 'شاشة', 'خادم (Server)', 'أجهزة شبكات') NOT NULL COMMENT 'نوع الجهاز',
    Serial_Number VARCHAR(100) NOT NULL UNIQUE COMMENT 'الرقم التسلسلي',
    Status ENUM('يعمل بكفاءة', 'تحت الصيانة', 'معطل', 'خارج الخدمة') NOT NULL DEFAULT 'يعمل بكفاءة' COMMENT 'حالة الجهاز',
    Location VARCHAR(150) NOT NULL COMMENT 'موقع الجهاز (القسم / المكتب)',
    Purchase_Date DATE NOT NULL COMMENT 'تاريخ الشراء',
    Specs VARCHAR(255) DEFAULT NULL COMMENT 'المواصفات الفنية المختصرة',
    Warranty_Expiry DATE DEFAULT NULL COMMENT 'تاريخ انتهاء الضمان',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. جدول الأعطال وبلاغات الصيانة (Faults)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Faults (
    Fault_ID VARCHAR(30) PRIMARY KEY COMMENT 'رقم بلاغ العطل',
    Device_ID VARCHAR(30) NOT NULL COMMENT 'رقم الجهاز المرتبط',
    User_ID INT NOT NULL COMMENT 'رقم المستخدم المبلّغ',
    Assigned_Tech_ID INT DEFAULT NULL COMMENT 'رقم فني الدعم المعيّن',
    Fault_Category VARCHAR(100) DEFAULT 'عطل عتاد (Hardware)' COMMENT 'تصنيف العطل',
    Priority ENUM('حرجة', 'عالية', 'متوسطة', 'منخفضة') NOT NULL DEFAULT 'متوسطة' COMMENT 'أولوية البلاغ',
    Fault_Description TEXT NOT NULL COMMENT 'وصف المشكلة بالتفصيل',
    Report_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'تاريخ ووقت الإبلاغ',
    Status ENUM('جديد', 'قيد المعالجة', 'مغلق') NOT NULL DEFAULT 'جديد' COMMENT 'حالة الطلب',
    CONSTRAINT fk_fault_device FOREIGN KEY (Device_ID) REFERENCES Devices(Device_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_fault_user FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_fault_tech FOREIGN KEY (Assigned_Tech_ID) REFERENCES Users(User_ID) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. جدول سجل الصيانة (Maintenance)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Maintenance (
    Maintenance_ID VARCHAR(30) PRIMARY KEY COMMENT 'رقم سجل الصيانة',
    Fault_ID VARCHAR(30) NOT NULL COMMENT 'رقم العطل المرتبط',
    Technician_ID INT NOT NULL COMMENT 'رقم فني الدعم المنفّذ',
    Maintenance_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'تاريخ إنجاز الصيانة',
    Action_Taken TEXT NOT NULL COMMENT 'الإجراء التقني المتخذ',
    Parts_Replaced VARCHAR(255) DEFAULT 'لا يوجد' COMMENT 'قطع الغيار المستبدلة',
    Cost DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'تكلفة الصيانة (إن وجدت)',
    Notes TEXT DEFAULT NULL COMMENT 'ملاحظات وتوصيات الفني',
    CONSTRAINT fk_maint_fault FOREIGN KEY (Fault_ID) REFERENCES Faults(Fault_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_maint_tech FOREIGN KEY (Technician_ID) REFERENCES Users(User_ID) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- إدراج البيانات الأولية التجريبية (Seed Data)
-- ============================================================================

INSERT INTO Users (User_ID, Name, Email, Password, Role, Department, Phone) VALUES
(1, 'م. عبدالله المالكي', 'admin@sanad.tech', 'hashed_admin_123', 'Admin', 'إدارة تقنية المعلومات', '0501122334'),
(2, 'م. فهد العتيبي', 'fahad.tech@sanad.tech', 'hashed_tech_123', 'Technician', 'قسم الدعم الفني والصيانة', '0502233445'),
(3, 'م. ريان الزهراني', 'rayan.tech@sanad.tech', 'hashed_tech_456', 'Technician', 'قسم الشبكات والأنظمة', '0503344556'),
(4, 'أ. سارة القحطاني', 'sara@sanad.tech', 'hashed_user_123', 'User', 'إدارة الموارد البشرية', '0554455667'),
(5, 'أ. محمد الدوسري', 'mohammed@sanad.tech', 'hashed_user_456', 'User', 'الإدارة المالية والمحاسبة', '0555566778'),
(6, 'د. نورة الشمري', 'noura@sanad.tech', 'hashed_user_789', 'User', 'قسم الجودة والتطوير', '0556677889');

INSERT INTO Devices (Device_ID, Device_Name, Device_Type, Serial_Number, Status, Location, Purchase_Date, Specs, Warranty_Expiry) VALUES
('SND-PC-101', 'HP EliteDesk 800 G8', 'كمبيوتر مكتبي', 'SN-HP800-99214', 'يعمل بكفاءة', 'الإدارة المالية - مكتب 204', '2024-02-15', 'Intel Core i7-11700, 16GB RAM, 512GB NVMe', '2027-02-15'),
('SND-LP-102', 'Dell Latitude 5540', 'لابتوب', 'SN-DL5540-44812', 'تحت الصيانة', 'الموارد البشرية - مكتب 108', '2024-06-10', 'Intel Core i7-1355U, 16GB RAM, 512GB SSD', '2027-06-10'),
('SND-PR-103', 'HP LaserJet Pro M404dn', 'طابعة', 'SN-HPM404-77319', 'معطل', 'قسم الجودة - قاعة الطباعة المركزية', '2023-05-20', 'طابعة ليزر شبكية مزدوجة الوجهين', '2025-05-20'),
('SND-MN-104', 'Dell UltraSharp 27" U2723QE', 'شاشة', 'SN-DLU27-33108', 'يعمل بكفاءة', 'إدارة تقنية المعلومات - مكتب 301', '2024-09-01', '4K UHD IPS Black, USB-C Hub 90W', '2027-09-01'),
('SND-SV-105', 'Dell PowerEdge R750', 'خادم (Server)', 'SN-DLR750-10092', 'يعمل بكفاءة', 'غرفة الخوادم الرئيسية - الدور الثالث', '2023-11-12', 'Dual Xeon Silver, 128GB ECC RAM, 8TB RAID10', '2028-11-12'),
('SND-LP-106', 'Lenovo ThinkPad X1 Carbon Gen 11', 'لابتوب', 'SN-LNX1C-88401', 'يعمل بكفاءة', 'مكتب المدير التنفيذي - الدور الرابع', '2025-01-18', 'Intel Core i7, 32GB RAM, 1TB SSD', '2028-01-18'),
('SND-NW-107', 'Cisco Catalyst 9200L Switch', 'أجهزة شبكات', 'SN-CSC92-55902', 'تحت الصيانة', 'كبينة الاتصالات الفرعية - الدور الثاني', '2023-08-05', '48-Port PoE+ Managed Network Switch', '2026-08-05'),
('SND-PC-108', 'Lenovo ThinkCentre M90t', 'كمبيوتر مكتبي', 'SN-LNM90-66230', 'خارج الخدمة', 'المستودع التقني - الدور الأرضي', '2021-03-14', 'Intel Core i5-10500, 8GB RAM, 256GB SSD', '2024-03-14');

INSERT INTO Faults (Fault_ID, Device_ID, User_ID, Assigned_Tech_ID, Fault_Category, Priority, Fault_Description, Report_Date, Status) VALUES
('FLT-2026-001', 'SND-PR-103', 6, 2, 'عطل ميكانيكي / سحب ورق', 'عالية', 'الطابعة تتوقف عن سحب الورق وتظهر رسالة خطأ Paper Jam متكررة مع صوت احتكاك في البكرات الداخلية.', '2026-10-18 09:30:00', 'جديد'),
('FLT-2026-002', 'SND-LP-102', 4, 2, 'عطل نظام التشغيل والحرارة', 'عالية', 'ارتفاع شديد في حرارة اللابتوب وانطفاء مفاجئ عند تشغيل برامج قواعد البيانات مع بطء ملحوظ في الإقلاع.', '2026-10-16 11:15:00', 'قيد المعالجة'),
('FLT-2026-003', 'SND-NW-107', 1, 3, 'انقطاع منافذ الشبكة PoE', 'حرجة', 'توقف 6 منافذ تغذية PoE عن العمل في السويتش الفرعي بالدور الثاني مما أثر على هواتف IP في القسم.', '2026-10-17 14:00:00', 'قيد المعالجة'),
('FLT-2026-004', 'SND-PC-101', 5, 2, 'مشكلة اتصال بالشبكة والنظام المالي', 'متوسطة', 'انقطاع متكرر في كرت الشبكة الداخلي وتأخر في مزامنة ملفات النظام المحاسبي.', '2026-10-10 10:00:00', 'مغلق'),
('FLT-2026-005', 'SND-PR-103', 4, 2, 'ضعف جودة الطباعة', 'منخفضة', 'بهتان في النصوص المطبوعة وظهور خطوط طولية باهتة على الورق.', '2026-09-22 13:20:00', 'مغلق'),
('FLT-2026-006', 'SND-PR-103', 5, 3, 'تعطل وحدة الشبكة في الطابعة', 'متوسطة', 'عدم ظهور الطابعة على الشبكة المحلية للموظفين في قسم المحاسبة.', '2026-08-14 08:45:00', 'مغلق');

INSERT INTO Maintenance (Maintenance_ID, Fault_ID, Technician_ID, Maintenance_Date, Action_Taken, Parts_Replaced, Cost, Notes) VALUES
('MNT-2026-501', 'FLT-2026-004', 2, '2026-10-11 15:30:00', 'تحديث تعريف كرت الشبكة Intel Ethernet إلى آخر إصدار واستبدال كيبل الشبكة بكيبل Cat6A معتمد.', 'كيبل شبكة Cat6A بطول 5 متر', 45.00, 'تم اختبار سرعة واستقرار الاتصال لمدة ساعتين ويعمل الجهاز بكفاءة تامة.'),
('MNT-2026-502', 'FLT-2026-005', 2, '2026-09-23 11:00:00', 'تنظيف وحدة الدرام الليزري واستبدال خرطوشة الحبر الأصلية HP 59A وإجراء معايرة كاملة.', 'خرطوشة حبر HP 59A', 320.00, 'يُنصح باستخدام ورق 80 جرام لتقليل تآكل الدرام.'),
('MNT-2026-503', 'FLT-2026-006', 3, '2026-08-15 12:15:00', 'إعادة ضبط إعدادات IP الثابت للطابعة وتحديث Firmware الخاص بوحدة الشبكة.', 'لا يوجد', 0.00, 'لاحظنا تكرار أعطال الطابعة SND-PR-103 ويوصى بجدولة صيانة وقائية شهرية لها.'),
('MNT-2026-504', 'FLT-2026-002', 2, '2026-10-19 10:45:00', 'فك الجهاز وتنظيف مروحة التبريد وتجديد المعجون الحراري، وجاري فحص سلامة قطاع الإقلاع في قرص NVMe.', 'معجون حراري احترافي Arctic MX-6', 60.00, 'الجهاز لا يزال تحت الاختبار النهائي قبل تسليمه للموظفة.');
