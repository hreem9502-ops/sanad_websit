/* ==========================================================================
   نظام سند (Sanad | TechCare) الذكي لإدارة الأجهزة والصيانة التقنية
   البرمجة التفاعلية الكاملة وإدارة الجداول (Users, Devices, Faults, Maintenance)
   ========================================================================== */

const STORAGE_KEY = 'sanad_techcare_db_v1';
const SCHEMA_VERSION = 2;

/* رابط النشر العام للنظام (مثل https://sanad.example.com/).
   يُستخدم داخل رموز QR حتى يفتح المسح بالجوال نموذج البلاغ مباشرة.
   إذا تُرك فارغاً يُستخدم رابط الصفحة الحالية عند تشغيلها عبر http/https. */
const PUBLIC_BASE_URL = 'https://hreem9502-ops.github.io/sanad_websit/';

/* مهلة الاستجابة (SLA) بالساعات حسب أولوية البلاغ */
const SLA_HOURS = { 'حرجة': 4, 'عالية': 24, 'متوسطة': 72, 'منخفضة': 120 };

/* الصفحات المتاحة لكل دور */
const ROLE_VIEWS = {
  Admin: ['dashboard', 'devices', 'add-device', 'report-fault', 'maintenance-requests', 'track-status', 'maintenance-log', 'reports', 'users'],
  Technician: ['dashboard', 'devices', 'report-fault', 'maintenance-requests', 'track-status', 'maintenance-log'],
  User: ['dashboard', 'devices', 'report-fault', 'track-status']
};

function hoursAgoIso(h) {
  return new Date(Date.now() - h * 3600000).toISOString();
}

const DEFAULT_DB = {
  schemaVersion: SCHEMA_VERSION,
  currentUserId: 1,
  users: [
    { User_ID: 1, Name: 'م. عبدالله المالكي', Email: 'admin@sanad.tech', Password: '••••••', Role: 'Admin', RoleAr: 'مدير النظام', Department: 'إدارة تقنية المعلومات', Phone: '0501122334' },
    { User_ID: 2, Name: 'م. فهد العتيبي', Email: 'fahad.tech@sanad.tech', Password: '••••••', Role: 'Technician', RoleAr: 'موظف الدعم الفني', Department: 'قسم الدعم الفني والصيانة', Phone: '0502233445' },
    { User_ID: 3, Name: 'م. ريان الزهراني', Email: 'rayan.tech@sanad.tech', Password: '••••••', Role: 'Technician', RoleAr: 'موظف الدعم الفني', Department: 'قسم الشبكات والأنظمة', Phone: '0503344556' },
    { User_ID: 4, Name: 'أ. سارة القحطاني', Email: 'sara@sanad.tech', Password: '••••••', Role: 'User', RoleAr: 'مستخدم', Department: 'إدارة الموارد البشرية', Phone: '0554455667' },
    { User_ID: 5, Name: 'أ. محمد الدوسري', Email: 'mohammed@sanad.tech', Password: '••••••', Role: 'User', RoleAr: 'مستخدم', Department: 'الإدارة المالية والمحاسبة', Phone: '0555566778' },
    { User_ID: 6, Name: 'د. نورة الشمري', Email: 'noura@sanad.tech', Password: '••••••', Role: 'User', RoleAr: 'مستخدم', Department: 'قسم الجودة والتطوير', Phone: '0556677889' }
  ],
  devices: [
    { Device_ID: 'SND-PC-101', Device_Name: 'HP EliteDesk 800 G8', Device_Type: 'كمبيوتر مكتبي', Serial_Number: 'SN-HP800-99214', Status: 'يعمل بكفاءة', Location: 'الإدارة المالية - مكتب 204', Purchase_Date: '2024-02-15', Specs: 'Intel Core i7-11700, 16GB RAM, 512GB NVMe' },
    { Device_ID: 'SND-LP-102', Device_Name: 'Dell Latitude 5540', Device_Type: 'لابتوب', Serial_Number: 'SN-DL5540-44812', Status: 'تحت الصيانة', Location: 'الموارد البشرية - مكتب 108', Purchase_Date: '2024-06-10', Specs: 'Intel Core i7-1355U, 16GB RAM, 512GB SSD' },
    { Device_ID: 'SND-PR-103', Device_Name: 'HP LaserJet Pro M404dn', Device_Type: 'طابعة', Serial_Number: 'SN-HPM404-77319', Status: 'معطل', Location: 'قسم الجودة - قاعة الطباعة المركزية', Purchase_Date: '2023-05-20', Specs: 'طابعة ليزر شبكية مزدوجة الوجهين' },
    { Device_ID: 'SND-MN-104', Device_Name: 'Dell UltraSharp 27" U2723QE', Device_Type: 'شاشة', Serial_Number: 'SN-DLU27-33108', Status: 'يعمل بكفاءة', Location: 'إدارة تقنية المعلومات - مكتب 301', Purchase_Date: '2024-09-01', Specs: '4K UHD IPS Black, USB-C Hub 90W' },
    { Device_ID: 'SND-SV-105', Device_Name: 'Dell PowerEdge R750', Device_Type: 'خادم (Server)', Serial_Number: 'SN-DLR750-10092', Status: 'يعمل بكفاءة', Location: 'غرفة الخوادم الرئيسية - الدور 3', Purchase_Date: '2023-11-12', Specs: 'Dual Xeon Silver, 128GB ECC RAM, 8TB RAID10' },
    { Device_ID: 'SND-LP-106', Device_Name: 'Lenovo ThinkPad X1 Carbon G11', Device_Type: 'لابتوب', Serial_Number: 'SN-LNX1C-88401', Status: 'يعمل بكفاءة', Location: 'مكتب المدير التنفيذي - الدور 4', Purchase_Date: '2025-01-18', Specs: 'Intel Core i7, 32GB RAM, 1TB SSD' },
    { Device_ID: 'SND-NW-107', Device_Name: 'Cisco Catalyst 9200L Switch', Device_Type: 'أجهزة شبكات', Serial_Number: 'SN-CSC92-55902', Status: 'تحت الصيانة', Location: 'كبينة الاتصالات الفرعية - الدور 2', Purchase_Date: '2023-08-05', Specs: '48-Port PoE+ Managed Network Switch' },
    { Device_ID: 'SND-PC-108', Device_Name: 'Lenovo ThinkCentre M90t', Device_Type: 'كمبيوتر مكتبي', Serial_Number: 'SN-LNM90-66230', Status: 'خارج الخدمة', Location: 'المستودع التقني - الدور الأرضي', Purchase_Date: '2021-03-14', Specs: 'Intel Core i5-10500, 8GB RAM, 256GB SSD' }
  ],
  faults: [
    { Fault_ID: 'FLT-2026-001', Device_ID: 'SND-PR-103', User_ID: 6, Assigned_Tech_ID: 2, Fault_Category: 'عطل ميكانيكي / سحب ورق', Priority: 'عالية', Fault_Description: 'الطابعة تتوقف عن سحب الورق وتظهر رسالة خطأ Paper Jam متكررة مع صوت احتكاك في البكرات الداخلية.', Report_Date: hoursAgoIso(6).slice(0, 10), Reported_At: hoursAgoIso(6), Status: 'جديد' },
    { Fault_ID: 'FLT-2026-002', Device_ID: 'SND-LP-102', User_ID: 4, Assigned_Tech_ID: 2, Fault_Category: 'عطل نظام التشغيل والحرارة', Priority: 'عالية', Fault_Description: 'ارتفاع شديد في حرارة اللابتوب وانطفاء مفاجئ عند تشغيل برامج قواعد البيانات مع بطء ملحوظ في الإقلاع.', Report_Date: hoursAgoIso(30).slice(0, 10), Reported_At: hoursAgoIso(30), Status: 'قيد المعالجة' },
    { Fault_ID: 'FLT-2026-003', Device_ID: 'SND-NW-107', User_ID: 1, Assigned_Tech_ID: 3, Fault_Category: 'انقطاع منافذ الشبكة PoE', Priority: 'حرجة', Fault_Description: 'توقف 6 منافذ تغذية PoE عن العمل في السويتش الفرعي بالدور الثاني مما أثر على هواتف IP في القسم.', Report_Date: hoursAgoIso(3.2).slice(0, 10), Reported_At: hoursAgoIso(3.2), Status: 'قيد المعالجة' },
    { Fault_ID: 'FLT-2026-004', Device_ID: 'SND-PC-101', User_ID: 5, Assigned_Tech_ID: 2, Fault_Category: 'مشكلة اتصال بالشبكة والنظام المالي', Priority: 'متوسطة', Fault_Description: 'انقطاع متكرر في كرت الشبكة الداخلي وتأخر في مزامنة ملفات النظام المحاسبي.', Report_Date: '2026-10-10', Reported_At: '2026-10-10T09:30:00', Closed_At: '2026-10-11T13:00:00', Status: 'مغلق', Rating: 5, Rating_Comment: 'تم الحل بسرعة وبشكل احترافي، شكراً.', Rated_At: '2026-10-11T15:20:00' },
    { Fault_ID: 'FLT-2026-005', Device_ID: 'SND-PR-103', User_ID: 4, Assigned_Tech_ID: 2, Fault_Category: 'ضعف جودة الطباعة', Priority: 'منخفضة', Fault_Description: 'بهتان في النصوص المطبوعة وظهور خطوط طولية باهتة على الورق.', Report_Date: '2026-09-22', Reported_At: '2026-09-22T10:00:00', Closed_At: '2026-09-23T12:00:00', Status: 'مغلق' },
    { Fault_ID: 'FLT-2026-006', Device_ID: 'SND-PR-103', User_ID: 5, Assigned_Tech_ID: 3, Fault_Category: 'تعطل وحدة الشبكة في الطابعة', Priority: 'متوسطة', Fault_Description: 'عدم ظهور الطابعة على الشبكة المحلية للموظفين في قسم المحاسبة.', Report_Date: '2026-08-14', Reported_At: '2026-08-14T09:00:00', Closed_At: '2026-08-18T11:00:00', Status: 'مغلق', Rating: 3, Rating_Comment: 'تم الإصلاح لكن الانتظار كان أطول من المتوقع.', Rated_At: '2026-08-18T14:00:00' }
  ],
  maintenance: [
    { Maintenance_ID: 'MNT-2026-501', Fault_ID: 'FLT-2026-004', Technician_ID: 2, Maintenance_Date: '2026-10-11', Action_Taken: 'تحديث تعريف كرت الشبكة Intel Ethernet إلى آخر إصدار واستبدال كيبل الشبكة بكيبل Cat6A معتمد.', Parts_Replaced: 'كيبل شبكة Cat6A بطول 5 متر', Cost: 45, Notes: 'تم اختبار سرعة واستقرار الاتصال لمدة ساعتين ويعمل الجهاز بكفاءة تامة.' },
    { Maintenance_ID: 'MNT-2026-502', Fault_ID: 'FLT-2026-005', Technician_ID: 2, Maintenance_Date: '2026-09-23', Action_Taken: 'تنظيف وحدة الدرام الليزري واستبدال خرطوشة الحبر الأصلية HP 59A وإجراء معايرة كاملة.', Parts_Replaced: 'خرطوشة حبر HP 59A', Cost: 320, Notes: 'يُنصح باستخدام ورق 80 جرام لتقليل تآكل الدرام.' },
    { Maintenance_ID: 'MNT-2026-503', Fault_ID: 'FLT-2026-006', Technician_ID: 3, Maintenance_Date: '2026-08-15', Action_Taken: 'إعادة ضبط إعدادات IP الثابت للطابعة وتحديث Firmware الخاص بوحدة الشبكة.', Parts_Replaced: 'لا يوجد', Cost: 0, Notes: 'تكرار أعطال الطابعة SND-PR-103؛ يوصى بجدولة صيانة وقائية شهرية لها.' },
    { Maintenance_ID: 'MNT-2026-504', Fault_ID: 'FLT-2026-002', Technician_ID: 2, Maintenance_Date: '2026-10-19', Action_Taken: 'فك الجهاز وتنظيف مروحة التبريد وتجديد المعجون الحراري، وجاري فحص سلامة قطاع الإقلاع.', Parts_Replaced: 'معجون حراري احترافي Arctic MX-6', Cost: 60, Notes: 'الجهاز قيد الاختبار النهائي قبل إغلاق البلاغ.' }
  ]
};

let db = JSON.parse(JSON.stringify(DEFAULT_DB));
let activeView = 'dashboard';
let selectedTrackingFaultId = 'FLT-2026-002';
let activeDbTab = 'Devices';
let chartInstances = {};

/* ---------- الربط التلقائي بالباك إند (Python Flask / Django REST API) ---------- */
let activeApiBase = null;
let backendConnected = false;
let syncTimer = null;

function getApiCandidates() {
  const list = [];
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    if (!location.hostname.endsWith('github.io')) {
      list.push(`${location.origin}/api`);
    }
  }
  list.push('http://127.0.0.1:5000/api');
  return [...new Set(list)];
}

function updateBackendStatusUi(connected, engineLabel) {
  backendConnected = connected;
  const dot = document.getElementById('backend-status-dot');
  const label = document.getElementById('backend-status-label');
  if (dot) {
    dot.className = connected
      ? 'w-2 h-2 rounded-full bg-[var(--ok)]'
      : 'w-2 h-2 rounded-full bg-[var(--ink-4)]';
  }
  if (label) {
    label.textContent = connected
      ? `متصل بالخادم · ${engineLabel || 'SQL'}`
      : 'تخزين محلي · المتصفح';
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 1500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function initBackendConnection() {
  const candidates = getApiCandidates();
  for (const base of candidates) {
    try {
      const res = await fetchWithTimeout(`${base}/bootstrap`, { method: 'GET' }, 1500);
      if (res.ok) {
        const remoteDb = await res.json();
        if (remoteDb && Array.isArray(remoteDb.devices) && Array.isArray(remoteDb.faults)) {
          activeApiBase = base;
          db = remoteDb;
          migrateDb();
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
          } catch (e) { /* ignore */ }
          const engine = (remoteDb.backend && remoteDb.backend.engine) || 'SQLite';
          updateBackendStatusUi(true, engine);
          renderAll();
          return true;
        }
      }
    } catch (e) {
      // Try next candidate or stay in local mode
    }
  }
  updateBackendStatusUi(false);
  return false;
}

function syncToBackend() {
  if (!activeApiBase) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    try {
      const res = await fetchWithTimeout(`${activeApiBase}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(db)
      }, 3000);
      if (res.ok) {
        updateBackendStatusUi(true, (db.backend && db.backend.engine) || 'SQLite');
      }
    } catch (e) {
      updateBackendStatusUi(false);
    }
  }, 80);
}

function loadDb() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.devices) && Array.isArray(parsed.faults)) {
        db = parsed;
        migrateDb();
      }
    }
  } catch (e) {
    // Fallback to in-memory DEFAULT_DB
  }
}

function saveDb() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    // Ignore storage quota / sandbox restrictions
  }
  syncToBackend();
}

async function resetDemoData() {
  if (activeApiBase) {
    try {
      const res = await fetchWithTimeout(`${activeApiBase}/reset`, { method: 'POST' }, 3000);
      if (res.ok) {
        db = await res.json();
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch (e) { /* ignore */ }
        renderAll();
        showToast('تمت استعادة البيانات الافتراضية في قاعدة البيانات بنجاح', 'success');
        return;
      }
    } catch (e) {
      // Fall back to local reset
    }
  }
  db = JSON.parse(JSON.stringify(DEFAULT_DB));
  saveDb();
  renderAll();
  showToast('تمت استعادة البيانات الافتراضية للنظام بنجاح', 'success');
}

function getCurrentUser() {
  return db.users.find(u => u.User_ID === Number(db.currentUserId)) || db.users[0];
}

function getUserById(id) {
  return db.users.find(u => u.User_ID === Number(id)) || { Name: 'غير محدد', RoleAr: '-', Department: '-' };
}

function getDeviceById(id) {
  return db.devices.find(d => d.Device_ID === id) || { Device_ID: id, Device_Name: 'جهاز غير معروف', Device_Type: '-', Location: '-' };
}

function getDeviceFaultCount(deviceId) {
  return db.faults.filter(f => f.Device_ID === deviceId).length;
}

/* ---------- Data migration (adds SLA timestamps & ratings to older saved data) ---------- */
function migrateDb() {
  if ((db.schemaVersion || 1) >= SCHEMA_VERSION) return;
  const seedById = {};
  DEFAULT_DB.faults.forEach(f => { seedById[f.Fault_ID] = f; });

  db.faults.forEach(f => {
    if (!f.Reported_At) f.Reported_At = `${f.Report_Date}T09:00:00`;
    if (f.Status === 'مغلق' && !f.Closed_At) {
      const seed = seedById[f.Fault_ID];
      const log = (db.maintenance || []).find(m => m.Fault_ID === f.Fault_ID);
      f.Closed_At = (seed && seed.Closed_At) || (log ? `${log.Maintenance_Date}T15:00:00` : `${f.Report_Date}T17:00:00`);
    }
    const seed = seedById[f.Fault_ID];
    if (seed && seed.Rating && !f.Rating && f.Status === 'مغلق') {
      f.Rating = seed.Rating;
      f.Rating_Comment = seed.Rating_Comment;
      f.Rated_At = seed.Rated_At;
    }
  });
  db.schemaVersion = SCHEMA_VERSION;
  saveDb();
}

/* ---------- Roles & permissions ---------- */
function canAccessView(viewId, user) {
  if (viewId === 'login') return true;
  const u = user || getCurrentUser();
  return (ROLE_VIEWS[u.Role] || ROLE_VIEWS.User).includes(viewId);
}

function isStaff(user) {
  const u = user || getCurrentUser();
  return u.Role === 'Admin' || u.Role === 'Technician';
}

function getVisibleFaults() {
  const u = getCurrentUser();
  return isStaff(u) ? db.faults : db.faults.filter(f => Number(f.User_ID) === u.User_ID);
}

function applyRoleVisibility() {
  const role = getCurrentUser().Role;
  document.querySelectorAll('[data-roles]').forEach(el => {
    const allowed = el.getAttribute('data-roles').split(',').map(s => s.trim());
    el.classList.toggle('role-hidden', !allowed.includes(role));
  });
}

/* ---------- SLA (response time) ---------- */
function getReportedAt(f) {
  return new Date(f.Reported_At || `${f.Report_Date}T09:00:00`);
}

function getClosedAt(f) {
  if (f.Status !== 'مغلق') return null;
  return new Date(f.Closed_At || `${f.Report_Date}T17:00:00`);
}

function getSla(f) {
  const hours = SLA_HOURS[f.Priority] || SLA_HOURS['متوسطة'];
  const start = getReportedAt(f);
  const deadline = new Date(start.getTime() + hours * 3600000);
  const closedAt = getClosedAt(f);
  if (closedAt) {
    const met = closedAt <= deadline;
    return { hours, deadline, closedAt, state: met ? 'met' : 'breached', durationMs: closedAt - start };
  }
  const remaining = deadline - Date.now();
  let state = 'on-track';
  if (remaining < 0) state = 'overdue';
  else if (remaining < hours * 3600000 * 0.25) state = 'at-risk';
  return { hours, deadline, closedAt: null, state, remainingMs: remaining };
}

function formatDuration(ms) {
  const totalMin = Math.max(0, Math.round(Math.abs(ms) / 60000));
  if (totalMin < 60) return `${totalMin} دقيقة`;
  const totalH = Math.round(totalMin / 60);
  if (totalH < 48) return `${totalH} ساعة`;
  return `${Math.round(totalH / 24)} يوم`;
}

function formatDateTime(d) {
  if (!d) return '—';
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Date-time wrapped for correct ordering inside RTL text
function dtHtml(d) {
  return `<span dir="ltr" class="num inline-block">${formatDateTime(d)}</span>`;
}

function renderSlaBadge(f) {
  const s = getSla(f);
  const map = {
    'on-track': ['badge-muted', `متبقٍ ${formatDuration(s.remainingMs)}`],
    'at-risk': ['badge-warn', `متبقٍ ${formatDuration(s.remainingMs)}`],
    'overdue': ['badge-bad', `متأخر ${formatDuration(s.remainingMs)}`],
    'met': ['badge-ok', 'ضمن المهلة'],
    'breached': ['badge-warn', 'بعد المهلة']
  };
  const [cls, label] = map[s.state];
  return `<span class="badge ${cls}" title="المهلة: ${s.hours} ساعة · الاستحقاق ${formatDateTime(s.deadline)}"><i data-lucide="clock" class="!w-3 !h-3"></i>${label}</span>`;
}

function computeServiceStats(faults) {
  const list = faults || db.faults;
  const closed = list.filter(f => f.Status === 'مغلق');
  const met = closed.filter(f => getSla(f).state === 'met').length;
  const durations = closed.map(f => getSla(f).durationMs).filter(ms => ms > 0);
  const rated = closed.filter(f => Number(f.Rating) > 0);
  const overdueOpen = list.filter(f => f.Status !== 'مغلق' && getSla(f).state === 'overdue').length;
  return {
    closedCount: closed.length,
    compliance: closed.length ? Math.round((met / closed.length) * 100) : null,
    avgDurationMs: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null,
    avgRating: rated.length ? rated.reduce((a, f) => a + Number(f.Rating), 0) / rated.length : null,
    ratedCount: rated.length,
    overdueOpen
  };
}

/* ---------- Ratings ---------- */
const STAR_POINTS = '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2';

function renderStars(value, size) {
  const sz = size || 16;
  let html = '<span class="stars" aria-label="' + value + ' من 5">';
  for (let i = 1; i <= 5; i++) {
    html += `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" class="star ${i <= Math.round(value) ? 'is-on' : ''}"><polygon points="${STAR_POINTS}"/></svg>`;
  }
  return html + '</span>';
}

function getPendingRatings() {
  const u = getCurrentUser();
  return db.faults.filter(f => f.Status === 'مغلق' && !f.Rating && Number(f.User_ID) === u.User_ID);
}

function refreshIcons() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

function getInitials(name) {
  const clean = String(name || '').replace(/^(م\.|أ\.|د\.)\s*/, '').trim();
  return clean.charAt(0) || '؟';
}

function renderAvatar(name, size) {
  const sz = size || 32;
  return `<span class="inline-flex items-center justify-center rounded-full bg-[var(--brand-50)] text-[var(--brand)] border border-[var(--brand-100)] font-semibold flex-shrink-0" style="width:${sz}px;height:${sz}px;font-size:${Math.round(sz * 0.4)}px">${getInitials(name)}</span>`;
}

const DEVICE_TYPE_ICONS = {
  'كمبيوتر مكتبي': 'monitor',
  'لابتوب': 'laptop',
  'طابعة': 'printer',
  'شاشة': 'monitor',
  'خادم (Server)': 'server',
  'أجهزة شبكات': 'network'
};

function deviceTypeLabel(type) {
  return type === 'خادم (Server)' ? 'خادم' : type;
}

function renderDeviceIcon(type) {
  return `<span class="icon-tile !w-8 !h-8 !bg-[#f2f4f7] !text-[var(--ink-3)]"><i data-lucide="${DEVICE_TYPE_ICONS[type] || 'cpu'}" class="!w-4 !h-4"></i></span>`;
}

function showToast(message, type) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const variants = {
    success: { icon: 'circle-check', color: 'var(--ok)' },
    warning: { icon: 'triangle-alert', color: '#dc6803' },
    error: { icon: 'circle-x', color: 'var(--bad)' },
    info: { icon: 'info', color: 'var(--info)' }
  };
  const v = variants[type] || variants.info;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i data-lucide="${v.icon}" style="color:${v.color}"></i><span class="flex-1 leading-relaxed">${message}</span>`;
  container.appendChild(toast);
  refreshIcons();
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// Status Badge Helpers
function renderDeviceStatusBadge(status) {
  const map = {
    'يعمل بكفاءة': 'badge-ok',
    'تحت الصيانة': 'badge-warn',
    'معطل': 'badge-bad',
    'خارج الخدمة': 'badge-muted'
  };
  return `<span class="badge ${map[status] || 'badge-muted'}"><span class="dot"></span>${status}</span>`;
}

function renderFaultStatusBadge(status) {
  const map = {
    'جديد': 'badge-info',
    'قيد المعالجة': 'badge-warn',
    'مغلق': 'badge-ok'
  };
  return `<span class="badge ${map[status] || 'badge-info'}">${status}</span>`;
}

function renderPriorityBadge(priority) {
  const map = {
    'حرجة': 'prio-critical',
    'عالية': 'prio-high',
    'متوسطة': 'prio-mid',
    'منخفضة': 'prio-low'
  };
  return `<span class="prio ${map[priority] || 'prio-mid'}"><span class="prio-bars"><i></i><i></i><i></i></span>${priority}</span>`;
}

// QR content for a device: a deep link that opens the fault form pre-filled with this device
function getDeviceQrPayload(deviceId) {
  let base = PUBLIC_BASE_URL;
  if (!base && /^https?:$/.test(location.protocol)) {
    base = location.origin + location.pathname;
  }
  if (!base) return deviceId; // Local file: encode the device code only
  return `${base.split('#')[0]}#report-fault?device=${encodeURIComponent(deviceId)}`;
}

function qrPayloadIsLink(payload) {
  return /^https?:\/\//.test(payload);
}

// Real, scannable QR code (qrcode-generator library) rendered as crisp SVG
function generateQrSvg(codeText, size) {
  const sz = size || 130;
  if (typeof qrcode === 'function') {
    try {
      const qr = qrcode(0, 'M');
      qr.addData(codeText);
      qr.make();
      const count = qr.getModuleCount();
      const quiet = 2;
      const total = count + quiet * 2;
      let path = '';
      for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
          if (qr.isDark(r, c)) path += `M${c + quiet},${r + quiet}h1v1h-1z`;
        }
      }
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${sz}" height="${sz}" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges" class="mx-auto bg-white rounded-lg border border-[var(--line)]" role="img" aria-label="QR ${codeText}"><path d="${path}" fill="#101828"/></svg>`;
    } catch (e) {
      // Fall through to placeholder
    }
  }
  return generateQrPlaceholder(codeText, sz);
}

// Fallback pattern used only if the QR library failed to load (offline)
function generateQrPlaceholder(codeText, size) {
  const sz = size || 130;
  let hash = 0;
  for (let i = 0; i < codeText.length; i++) {
    hash = ((hash << 5) - hash) + codeText.charCodeAt(i);
    hash |= 0;
  }
  const grid = 13;
  const cell = sz / grid;
  let rects = '';
  const isFinder = (r, c) => (r < 3 && c < 3) || (r < 3 && c >= grid - 3) || (r >= grid - 3 && c < 3);
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      let fill = false;
      if (isFinder(r, c)) {
        fill = true;
      } else {
        const bit = Math.abs((hash ^ (r * 31 + c * 17)) % 7);
        fill = bit < 3;
      }
      if (fill) {
        rects += `<rect x="${(c * cell).toFixed(1)}" y="${(r * cell).toFixed(1)}" width="${(cell - 0.6).toFixed(1)}" height="${(cell - 0.6).toFixed(1)}" rx="0.8" fill="#101828"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" class="mx-auto bg-white p-1.5 rounded-lg border border-[var(--line)]">${rects}</svg>`;
}

// Navigation & View Switching
const SESSION_KEY = 'sanad_session_active';

function isLoggedIn() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch (e) {
    return window.__sanadLoggedIn === true;
  }
}

function setLoggedIn(value) {
  window.__sanadLoggedIn = value;
  try {
    if (value) sessionStorage.setItem(SESSION_KEY, '1');
    else sessionStorage.removeItem(SESSION_KEY);
  } catch (e) {
    // sessionStorage unavailable — in-memory flag is used instead
  }
}

// Route requested before login (e.g. scanned device QR) — opened right after signing in
let pendingRoute = null;

function parseRouteFromUrl() {
  const raw = (location.hash || '').replace(/^#/, '');
  const [view, qs] = raw.split('?');
  const params = new URLSearchParams(qs || location.search.replace(/^\?/, ''));
  const device = params.get('device');
  if (device) return { view: 'report-fault', device };
  if (view && view !== 'login' && document.getElementById(`view-${view}`)) return { view };
  return null;
}

function openRoute(route) {
  if (route && route.device) {
    openReportFaultForDevice(route.device);
  } else {
    switchView(route && route.view ? route.view : 'dashboard');
  }
}

function continueAfterLogin() {
  const route = pendingRoute;
  pendingRoute = null;
  openRoute(route);
}

function switchView(viewId) {
  // Login is the entry point: going to "login" signs out, other views require a session
  if (viewId === 'login') {
    setLoggedIn(false);
  } else if (!isLoggedIn()) {
    viewId = 'login';
  } else if (!canAccessView(viewId)) {
    showToast('هذه الصفحة غير متاحة لصلاحيات حسابك الحالي', 'warning');
    viewId = 'dashboard';
  }
  activeView = viewId;
  if (location.hash.replace('#', '') !== viewId) {
    try {
      history.replaceState(null, '', viewId === 'dashboard' ? location.pathname : `#${viewId}`);
    } catch (e) {
      // Ignore (some file:// contexts block history updates)
    }
  }
  const views = [
    'login', 'dashboard', 'devices', 'add-device', 'report-fault',
    'maintenance-requests', 'track-status', 'maintenance-log', 'reports', 'users'
  ];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) {
      if (v === viewId) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
    const navBtn = document.getElementById(`nav-btn-${v}`);
    if (navBtn) {
      if (v === viewId) navBtn.classList.add('active');
      else navBtn.classList.remove('active');
    }
  });

  const titles = {
    'login': 'تسجيل الدخول',
    'dashboard': 'لوحة التحكم',
    'devices': 'سجل الأجهزة',
    'add-device': 'إضافة جهاز',
    'report-fault': 'بلاغ عطل جديد',
    'maintenance-requests': 'طلبات الصيانة',
    'track-status': 'متابعة الطلبات',
    'maintenance-log': 'سجل الصيانة',
    'reports': 'التقارير',
    'users': 'المستخدمون'
  };
  const headerTitle = document.getElementById('page-header-title');
  if (headerTitle) headerTitle.textContent = titles[viewId] || 'سند';
  document.title = `${titles[viewId] || 'سند'} — سند`;

  // Login takes the full viewport (no sidebar / header)
  document.body.classList.toggle('is-auth', viewId === 'login');

  // Close mobile sidebar if open
  if (window.innerWidth < 1024) {
    setMobileSidebar(false);
  }

  window.scrollTo({ top: 0 });
  renderAll();
}

function setMobileSidebar(open) {
  const sidebar = document.getElementById('main-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.toggle('hidden', !open);
  if (backdrop) backdrop.classList.toggle('hidden', !open);
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('main-sidebar');
  if (sidebar) {
    setMobileSidebar(sidebar.classList.contains('hidden'));
  }
}

// Role Switching & Login
function switchRoleByUserId(userId) {
  db.currentUserId = Number(userId);
  saveDb();
  const user = getCurrentUser();
  showToast(`تم التبديل إلى حساب: ${user.Name} (${user.RoleAr})`, 'info');
  if (!canAccessView(activeView, user)) {
    switchView('dashboard');
    return;
  }
  renderAll();
}

function handleLoginSubmit(event) {
  if (event) event.preventDefault();
  const emailInput = document.getElementById('login-email-input');
  const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
  const found = db.users.find(u => u.Email.toLowerCase() === email);
  if (found) {
    db.currentUserId = found.User_ID;
    saveDb();
    setLoggedIn(true);
    showToast(`مرحباً بك ${found.Name} (${found.RoleAr}) في نظام سند`, 'success');
    continueAfterLogin();
  } else {
    showToast('البريد الإلكتروني غير مسجل، يمكنك اختيار أحد الحسابات التجريبية بالأسفل', 'warning');
  }
}

function quickDemoLogin(userId) {
  db.currentUserId = Number(userId);
  saveDb();
  setLoggedIn(true);
  const user = getCurrentUser();
  showToast(`تم تسجيل الدخول بنجاح كـ ${user.RoleAr}: ${user.Name}`, 'success');
  continueAfterLogin();
}

function renderLoginNotice() {
  const note = document.getElementById('login-pending-note');
  if (!note) return;
  if (pendingRoute && pendingRoute.device) {
    const dev = getDeviceById(pendingRoute.device);
    note.innerHTML = `<i data-lucide="qr-code"></i><span>سجّل الدخول لإرسال بلاغ عن الجهاز <strong class="font-mono">${dev.Device_ID}</strong>${dev.Device_Name !== 'جهاز غير معروف' ? ` — ${dev.Device_Name}` : ''}</span>`;
    note.classList.remove('hidden');
  } else {
    note.classList.add('hidden');
  }
}

// Render Header & Role Banner
function renderHeaderAndRole() {
  const user = getCurrentUser();
  const nameEl = document.getElementById('current-user-name');
  const roleEl = document.getElementById('current-user-role');
  const selectEl = document.getElementById('header-role-select');

  if (nameEl) nameEl.textContent = user.Name;
  if (roleEl) {
    roleEl.textContent = user.RoleAr;
    roleEl.title = user.Department;
  }
  const avatarEl = document.getElementById('current-user-avatar');
  if (avatarEl) avatarEl.textContent = getInitials(user.Name);
  if (selectEl) {
    selectEl.innerHTML = db.users.map(u =>
      `<option value="${u.User_ID}" ${u.User_ID === user.User_ID ? 'selected' : ''}>${u.Name} — ${u.RoleAr}</option>`
    ).join('');
  }

  // Dashboard greeting
  const greetEl = document.getElementById('dash-greeting');
  if (greetEl) {
    const hour = new Date().getHours();
    const salute = hour < 12 ? 'صباح الخير' : 'مساء الخير';
    greetEl.textContent = `${salute}، ${user.Name}`;
  }
  const dateEl = document.getElementById('dash-date');
  if (dateEl) {
    let dateStr = '';
    try {
      dateStr = new Date().toLocaleDateString('ar-SA-u-ca-gregory', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      dateStr = new Date().toISOString().slice(0, 10);
    }
    dateEl.textContent = `${dateStr} · نظرة عامة على الأجهزة وطلبات الصيانة`;
  }

  // Update badge counts in sidebar
  const openFaultsCount = db.faults.filter(f => f.Status !== 'مغلق').length;
  const badgeFaults = document.getElementById('nav-badge-faults');
  if (badgeFaults) badgeFaults.textContent = openFaultsCount;
  const badgeDevices = document.getElementById('nav-badge-devices');
  if (badgeDevices) badgeDevices.textContent = db.devices.length;
  const badgeTrack = document.getElementById('nav-badge-track');
  if (badgeTrack) {
    const pending = getPendingRatings().length;
    badgeTrack.textContent = pending;
    badgeTrack.classList.toggle('role-hidden', pending === 0);
  }

  applyRoleVisibility();
  renderLoginNotice();
}

// 1. Render Dashboard
function renderDashboard() {
  const totalDevices = db.devices.length;
  const activeDevices = db.devices.filter(d => d.Status === 'يعمل بكفاءة').length;
  const openFaults = db.faults.filter(f => f.Status === 'جديد').length;
  const inProgressFaults = db.faults.filter(f => f.Status === 'قيد المعالجة').length;
  const repeatFaultDevices = db.devices.filter(d => getDeviceFaultCount(d.Device_ID) >= 2).length;

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setTxt('kpi-total-devices', totalDevices);
  setTxt('kpi-active-devices', activeDevices);
  setTxt('kpi-open-faults', openFaults + inProgressFaults);
  setTxt('kpi-inprogress-faults', inProgressFaults);
  setTxt('kpi-completed-maint', db.maintenance.length);
  setTxt('kpi-repeat-devices', repeatFaultDevices);

  // Service performance (SLA + ratings)
  const stats = computeServiceStats();
  setTxt('svc-compliance', stats.compliance === null ? '—' : `${stats.compliance}%`);
  setTxt('svc-compliance-sub', `من ${stats.closedCount} طلب مغلق`);
  setTxt('svc-avg-time', stats.avgDurationMs === null ? '—' : formatDuration(stats.avgDurationMs));
  setTxt('svc-overdue', stats.overdueOpen);
  const overdueSub = document.getElementById('svc-overdue-sub');
  if (overdueSub) {
    overdueSub.textContent = stats.overdueOpen ? 'تجاوزت مهلة الاستجابة' : 'لا يوجد تأخير';
    overdueSub.className = `text-[12px] mt-1 ${stats.overdueOpen ? 'text-[var(--bad)]' : 'text-[var(--ink-4)]'}`;
  }
  setTxt('svc-rating', stats.avgRating === null ? '—' : stats.avgRating.toFixed(1));
  const ratingStars = document.getElementById('svc-rating-stars');
  if (ratingStars) ratingStars.innerHTML = `${renderStars(stats.avgRating || 0, 14)}<span class="text-[12px] text-[var(--ink-4)] ms-1.5">${stats.ratedCount} تقييم</span>`;

  // Pending ratings banner (for the reporter)
  const banner = document.getElementById('dash-rating-banner');
  if (banner) {
    const pending = getPendingRatings();
    if (pending.length) {
      banner.classList.remove('hidden');
      banner.innerHTML = `
        <div class="flex items-center gap-3 min-w-0">
          <span class="icon-tile !bg-[var(--warn-bg)] !text-[#dc6803]"><i data-lucide="star"></i></span>
          <div class="min-w-0">
            <div class="text-[13.5px] font-semibold text-[var(--ink)]">${pending.length === 1 ? 'لديك طلب مغلق بانتظار تقييمك' : `لديك ${pending.length} طلبات مغلقة بانتظار تقييمك`}</div>
            <div class="text-[12.5px] text-[var(--ink-3)]">رأيك يساعد فريق الدعم الفني على تحسين الخدمة.</div>
          </div>
        </div>
        <button onclick="inspectTicketProgress('${pending[0].Fault_ID}')" class="btn btn-secondary btn-sm flex-shrink-0">قيّم الآن</button>`;
    } else {
      banner.classList.add('hidden');
      banner.innerHTML = '';
    }
  }

  // Recent Faults Table on Dashboard (staff see all, employees see their own)
  const tbody = document.getElementById('dashboard-recent-faults-tbody');
  if (tbody) {
    const recent = getVisibleFaults().slice(0, 5);
    tbody.innerHTML = recent.length === 0
      ? `<tr><td colspan="6"><div class="empty-state"><i data-lucide="inbox"></i>لا توجد بلاغات بعد</div></td></tr>`
      : recent.map(f => {
      const dev = getDeviceById(f.Device_ID);
      const usr = getUserById(f.User_ID);
      return `<tr>
        <td><span class="id-chip">${f.Fault_ID}</span></td>
        <td>
          <div class="cell-title">${dev.Device_Name}</div>
          <div class="cell-sub">${dev.Location}</div>
        </td>
        <td class="whitespace-nowrap">${usr.Name}</td>
        <td>${renderPriorityBadge(f.Priority)}</td>
        <td>${renderFaultStatusBadge(f.Status)}</td>
        <td class="text-left">
          <button onclick="inspectTicketProgress('${f.Fault_ID}')" class="btn btn-ghost btn-sm">متابعة</button>
        </td>
      </tr>`;
    }).join('');
  }

  renderDashboardCharts();
}

function renderDashboardCharts() {
  if (typeof Chart === 'undefined') return;

  Chart.defaults.font.family = "'IBM Plex Sans Arabic', system-ui, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = '#667085';
  const legendOpts = {
    position: 'bottom',
    rtl: true,
    labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 8, boxHeight: 8, padding: 16, font: { size: 12 } }
  };
  const tooltipOpts = {
    rtl: true,
    backgroundColor: '#101828',
    padding: 10,
    cornerRadius: 6,
    titleFont: { weight: '600' },
    boxPadding: 4
  };

  // Chart 1: Device Status Distribution
  const ctxStatus = document.getElementById('chart-device-status');
  if (ctxStatus) {
    if (chartInstances.deviceStatus) chartInstances.deviceStatus.destroy();
    const counts = {
      active: db.devices.filter(d => d.Status === 'يعمل بكفاءة').length,
      maint: db.devices.filter(d => d.Status === 'تحت الصيانة').length,
      faulty: db.devices.filter(d => d.Status === 'معطل').length,
      retired: db.devices.filter(d => d.Status === 'خارج الخدمة').length
    };
    chartInstances.deviceStatus = new Chart(ctxStatus, {
      type: 'doughnut',
      data: {
        labels: ['يعمل بكفاءة', 'تحت الصيانة', 'معطل', 'خارج الخدمة'],
        datasets: [{
          data: [counts.active, counts.maint, counts.faulty, counts.retired],
          backgroundColor: ['#17b26a', '#f79009', '#f04438', '#d0d5dd'],
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverOffset: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: legendOpts, tooltip: tooltipOpts },
        cutout: '72%'
      }
    });
  }

  // Chart 2: Devices by Type & Faults Count
  const ctxTypes = document.getElementById('chart-device-types');
  if (ctxTypes) {
    if (chartInstances.deviceTypes) chartInstances.deviceTypes.destroy();
    const types = ['كمبيوتر مكتبي', 'لابتوب', 'طابعة', 'شاشة', 'خادم (Server)', 'أجهزة شبكات'];
    const devCounts = types.map(t => db.devices.filter(d => d.Device_Type === t).length);
    const faultCounts = types.map(t => {
      const devIds = db.devices.filter(d => d.Device_Type === t).map(d => d.Device_ID);
      return db.faults.filter(f => devIds.includes(f.Device_ID)).length;
    });
    chartInstances.deviceTypes = new Chart(ctxTypes, {
      type: 'bar',
      data: {
        labels: types.map(deviceTypeLabel),
        datasets: [
          {
            label: 'الأجهزة',
            data: devCounts,
            backgroundColor: '#1e3a5f',
            borderRadius: 4,
            maxBarThickness: 22
          },
          {
            label: 'البلاغات',
            data: faultCounts,
            backgroundColor: '#b8c7da',
            borderRadius: 4,
            maxBarThickness: 22
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f2f4f7' }, border: { display: false } },
          x: { reverse: true, grid: { display: false }, border: { color: '#e5e7eb' } }
        },
        plugins: { legend: legendOpts, tooltip: tooltipOpts }
      }
    });
  }
}

// 2. Render Devices Management Page
function renderDevicesTable() {
  const searchEl = document.getElementById('device-search-input');
  const typeEl = document.getElementById('device-filter-type');
  const statusEl = document.getElementById('device-filter-status');

  const q = searchEl ? searchEl.value.trim().toLowerCase() : '';
  const typeFilter = typeEl ? typeEl.value : 'ALL';
  const statusFilter = statusEl ? statusEl.value : 'ALL';

  const filtered = db.devices.filter(d => {
    const matchQ = !q ||
      d.Device_ID.toLowerCase().includes(q) ||
      d.Device_Name.toLowerCase().includes(q) ||
      d.Serial_Number.toLowerCase().includes(q) ||
      d.Location.toLowerCase().includes(q);
    const matchType = typeFilter === 'ALL' || d.Device_Type === typeFilter;
    const matchStatus = statusFilter === 'ALL' || d.Status === statusFilter;
    return matchQ && matchType && matchStatus;
  });

  const countLabel = document.getElementById('devices-filtered-count');
  if (countLabel) countLabel.textContent = `${filtered.length} من ${db.devices.length}`;

  const tbody = document.getElementById('devices-table-tbody');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i data-lucide="search-x"></i><div class="font-medium text-[var(--ink-2)]">لا توجد نتائج</div><div class="mt-1">جرّب تعديل كلمات البحث أو عوامل التصفية.</div></div></td></tr>`;
    refreshIcons();
    return;
  }

  const isAdminUser = getCurrentUser().Role === 'Admin';
  tbody.innerHTML = filtered.map(d => {
    const faultCount = getDeviceFaultCount(d.Device_ID);
    const repeatBadge = faultCount >= 2
      ? `<span class="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--bad)]" title="جهاز متكرر الأعطال"><i data-lucide="repeat" class="!w-3.5 !h-3.5"></i>${faultCount} أعطال</span>`
      : `<span class="text-[12px] text-[var(--ink-4)]">${faultCount === 0 ? 'لا أعطال' : 'عطل واحد'}</span>`;

    return `<tr>
      <td>
        <span class="id-chip">${d.Device_ID}</span>
        <div class="cell-sub font-mono whitespace-nowrap mt-1">${d.Serial_Number}</div>
      </td>
      <td>
        <div class="flex items-center gap-3" title="${deviceTypeLabel(d.Device_Type)}">
          ${renderDeviceIcon(d.Device_Type)}
          <div class="min-w-0">
            <div class="cell-title">${d.Device_Name}</div>
            <div class="cell-sub truncate max-w-[260px]">${deviceTypeLabel(d.Device_Type)} · ${d.Specs || '—'}</div>
          </div>
        </div>
      </td>
      <td>${renderDeviceStatusBadge(d.Status)}</td>
      <td class="min-w-[160px]">${d.Location}</td>
      <td class="whitespace-nowrap"><div class="num">${d.Purchase_Date}</div><div class="mt-0.5">${repeatBadge}</div></td>
      <td>
        <div class="flex items-center gap-0.5 justify-end">
          <button onclick="openDeviceQrModal('${d.Device_ID}')" class="btn btn-ghost btn-icon" title="بطاقة الجهاز ورمز QR"><i data-lucide="qr-code"></i></button>
          <button onclick="openReportFaultForDevice('${d.Device_ID}')" class="btn btn-ghost btn-icon" title="بلاغ عطل لهذا الجهاز"><i data-lucide="triangle-alert"></i></button>
          ${isAdminUser ? `<button onclick="openEditDeviceModal('${d.Device_ID}')" class="btn btn-ghost btn-icon" title="تعديل"><i data-lucide="pencil"></i></button>
          <button onclick="openDeleteDeviceModal('${d.Device_ID}')" class="btn btn-ghost-danger btn-icon" title="حذف"><i data-lucide="trash-2"></i></button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
  refreshIcons();
}

// 3. Add New Device Form & Live Asset Tag Preview
function updateNewDevicePreview() {
  const idEl = document.getElementById('new-dev-id');
  const nameEl = document.getElementById('new-dev-name');
  const typeEl = document.getElementById('new-dev-type');
  const serialEl = document.getElementById('new-dev-serial');
  const locEl = document.getElementById('new-dev-location');

  const devId = (idEl && idEl.value.trim()) || 'SND-PC-109';
  const devName = (nameEl && nameEl.value.trim()) || 'اسم وموديل الجهاز';
  const devType = (typeEl && typeEl.value) || 'كمبيوتر مكتبي';
  const devSerial = (serialEl && serialEl.value.trim()) || 'SN-XXXX-2026';
  const devLoc = (locEl && locEl.value.trim()) || 'القسم / المكتب';

  const pId = document.getElementById('preview-tag-id');
  const pName = document.getElementById('preview-tag-name');
  const pType = document.getElementById('preview-tag-type');
  const pSerial = document.getElementById('preview-tag-serial');
  const pLoc = document.getElementById('preview-tag-loc');
  const pQr = document.getElementById('preview-tag-qr');

  if (pId) pId.textContent = devId;
  if (pName) pName.textContent = devName;
  if (pType) pType.textContent = deviceTypeLabel(devType);
  if (pSerial) pSerial.textContent = devSerial;
  if (pLoc) pLoc.textContent = devLoc;
  if (pQr) pQr.innerHTML = generateQrSvg(getDeviceQrPayload(devId), 92);
}

function generateRandomDeviceCode() {
  const num = 100 + db.devices.length + 1;
  const rand = Math.floor(10000 + Math.random() * 89999);
  const idEl = document.getElementById('new-dev-id');
  const serialEl = document.getElementById('new-dev-serial');
  if (idEl) idEl.value = `SND-DV-${num}`;
  if (serialEl) serialEl.value = `SN-SND-${rand}`;
  updateNewDevicePreview();
}

function handleAddDeviceSubmit(event) {
  if (event) event.preventDefault();
  const user = getCurrentUser();
  if (user.Role !== 'Admin') {
    showToast('تنبيه صلاحيات: إضافة الأجهزة متاحة لمدير النظام فقط (يمكنك التبديل لمدير النظام من الشريط العلوي)', 'warning');
    return;
  }

  const devId = document.getElementById('new-dev-id').value.trim();
  const devName = document.getElementById('new-dev-name').value.trim();
  const devType = document.getElementById('new-dev-type').value;
  const devSerial = document.getElementById('new-dev-serial').value.trim();
  const devStatus = document.getElementById('new-dev-status').value;
  const devLocation = document.getElementById('new-dev-location').value.trim();
  const devDate = document.getElementById('new-dev-date').value || '2026-10-20';
  const devSpecs = document.getElementById('new-dev-specs').value.trim() || 'مواصفات قياسية معتمدة';

  if (!devId || !devName || !devSerial || !devLocation) {
    showToast('يرجى تعبئة جميع الحقول الأساسية للجهاز', 'error');
    return;
  }

  if (db.devices.some(d => d.Device_ID.toLowerCase() === devId.toLowerCase())) {
    showToast('رمز الجهاز مسجل مسبقاً، يرجى توليد رمز جديد', 'error');
    return;
  }

  db.devices.unshift({
    Device_ID: devId,
    Device_Name: devName,
    Device_Type: devType,
    Serial_Number: devSerial,
    Status: devStatus,
    Location: devLocation,
    Purchase_Date: devDate,
    Specs: devSpecs
  });

  saveDb();
  showToast(`تم تسجيل الجهاز ${devName} (${devId}) في قاعدة البيانات بنجاح`, 'success');
  document.getElementById('form-add-device').reset();
  generateRandomDeviceCode();
  switchView('devices');
}

// 4. Report Fault Page
function populateFaultFormDropdowns() {
  const devSelect = document.getElementById('fault-device-select');
  if (devSelect) {
    const currentVal = devSelect.value;
    devSelect.innerHTML = db.devices.map(d =>
      `<option value="${d.Device_ID}">${d.Device_ID} · ${d.Device_Name} — ${d.Location}</option>`
    ).join('');
    if (currentVal && db.devices.some(d => d.Device_ID === currentVal)) {
      devSelect.value = currentVal;
    }
  }
  const userSelect = document.getElementById('fault-user-select');
  if (userSelect) {
    const currentUser = getCurrentUser();
    // Employees report on their own behalf; staff can log a fault for any user
    const reporters = isStaff(currentUser) ? db.users : [currentUser];
    userSelect.innerHTML = reporters.map(u =>
      `<option value="${u.User_ID}" ${u.User_ID === currentUser.User_ID ? 'selected' : ''}>${u.Name} — ${u.Department}</option>`
    ).join('');
    userSelect.disabled = !isStaff(currentUser);
  }
  updateFaultSlaHint();
}

function updateFaultSlaHint() {
  const hint = document.getElementById('fault-sla-hint');
  const prio = document.getElementById('fault-priority-select');
  if (!hint || !prio) return;
  const hours = SLA_HOURS[prio.value] || SLA_HOURS['متوسطة'];
  hint.textContent = `مهلة الاستجابة المستهدفة: ${hours < 48 ? `${hours} ساعة` : `${hours / 24} أيام`}`;
}

function openReportFaultForDevice(deviceId) {
  switchView('report-fault');
  if (activeView !== 'report-fault') return;
  const exists = db.devices.some(d => d.Device_ID === deviceId);
  if (!exists) {
    showToast(`الجهاز ${deviceId} غير مسجّل في النظام`, 'warning');
    return;
  }
  const devSelect = document.getElementById('fault-device-select');
  if (devSelect) devSelect.value = deviceId;
  showToast(`تم اختيار الجهاز ${deviceId} لتسجيل بلاغ عطل`, 'info');
  const desc = document.getElementById('fault-desc-input');
  if (desc) desc.focus();
}

function handleReportFaultSubmit(event) {
  if (event) event.preventDefault();
  const devId = document.getElementById('fault-device-select').value;
  const userId = Number(document.getElementById('fault-user-select').value);
  const category = document.getElementById('fault-category-select').value;
  const priority = document.getElementById('fault-priority-select').value;
  const desc = document.getElementById('fault-desc-input').value.trim();

  if (!devId || !desc) {
    showToast('يرجى اختيار الجهاز وكتابة وصف واضح للمشكلة التقنية', 'error');
    return;
  }

  let nextNum = 100 + db.faults.length + 1;
  while (db.faults.some(f => f.Fault_ID === `FLT-2026-${nextNum}`)) nextNum++;
  const newFaultId = `FLT-2026-${nextNum}`;
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  db.faults.unshift({
    Fault_ID: newFaultId,
    Device_ID: devId,
    User_ID: userId,
    Assigned_Tech_ID: 2,
    Fault_Category: category,
    Priority: priority,
    Fault_Description: desc,
    Report_Date: today,
    Reported_At: now.toISOString(),
    Status: 'جديد'
  });

  // Automatically mark device status as faulty or under maintenance
  const dev = db.devices.find(d => d.Device_ID === devId);
  if (dev) {
    dev.Status = priority === 'حرجة' || priority === 'عالية' ? 'معطل' : 'تحت الصيانة';
  }

  selectedTrackingFaultId = newFaultId;
  saveDb();
  document.getElementById('fault-desc-input').value = '';
  showToast(`تم إرسال بلاغ العطل رقم ${newFaultId} وتوجيهه للدعم الفني بنجاح`, 'success');
  switchView('track-status');
}

// 5. Maintenance Requests (Technician Workspace)
let currentMaintFilter = 'ALL';
function filterMaintenanceRequests(status) {
  currentMaintFilter = status;
  ['ALL', 'جديد', 'قيد المعالجة', 'مغلق', 'OVERDUE'].forEach(st => {
    const btn = document.getElementById(`maint-filter-${st}`);
    if (btn) {
      btn.classList.toggle('is-active', st === status);
    }
  });
  renderMaintenanceRequests();
}

function renderMaintenanceRequests() {
  const container = document.getElementById('maintenance-requests-tbody');
  if (!container) return;

  const overdueCount = db.faults.filter(f => f.Status !== 'مغلق' && getSla(f).state === 'overdue').length;
  const overdueCountEl = document.getElementById('maint-overdue-count');
  if (overdueCountEl) {
    overdueCountEl.textContent = overdueCount;
    overdueCountEl.classList.toggle('role-hidden', overdueCount === 0);
  }

  const list = db.faults.filter(f => {
    if (currentMaintFilter === 'ALL') return true;
    if (currentMaintFilter === 'OVERDUE') return f.Status !== 'مغلق' && getSla(f).state === 'overdue';
    return f.Status === currentMaintFilter;
  });
  if (list.length === 0) {
    container.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i data-lucide="inbox"></i><div class="font-medium text-[var(--ink-2)]">لا توجد طلبات</div><div class="mt-1">لا توجد طلبات صيانة بهذه الحالة حالياً.</div></div></td></tr>`;
    refreshIcons();
    return;
  }

  container.innerHTML = list.map(f => {
    const dev = getDeviceById(f.Device_ID);
    const reporter = getUserById(f.User_ID);
    const tech = getUserById(f.Assigned_Tech_ID);
    return `<tr>
      <td><span class="id-chip">${f.Fault_ID}</span></td>
      <td>
        <div class="cell-title">${dev.Device_Name}</div>
        <div class="cell-sub">${dev.Location}</div>
      </td>
      <td>
        <div class="font-medium text-[var(--ink)]">${f.Fault_Category}</div>
        <div class="cell-sub line-clamp-1 max-w-xs">${f.Fault_Description}</div>
      </td>
      <td class="whitespace-nowrap">${reporter.Name}<div class="cell-sub num">${f.Report_Date}</div></td>
      <td class="whitespace-nowrap">${tech.Name}</td>
      <td>${renderPriorityBadge(f.Priority)}</td>
      <td><div class="flex flex-col items-start gap-1.5">${renderFaultStatusBadge(f.Status)}${renderSlaBadge(f)}</div></td>
      <td>
        <div class="flex items-center gap-1 justify-end">
          <button onclick="inspectTicketProgress('${f.Fault_ID}')" class="btn btn-ghost btn-sm">التفاصيل</button>
          <button onclick="openProcessTicketModal('${f.Fault_ID}')" class="btn btn-secondary btn-sm">معالجة</button>
        </div>
      </td>
    </tr>`;
  }).join('');
  refreshIcons();
}

// Process Ticket Modal (Update Status & Log Maintenance Action)
function openProcessTicketModal(faultId) {
  const fault = db.faults.find(f => f.Fault_ID === faultId);
  if (!fault) return;
  const dev = getDeviceById(fault.Device_ID);

  document.getElementById('modal-ticket-fault-id').value = fault.Fault_ID;
  document.getElementById('modal-ticket-title').textContent = `معالجة الطلب ${fault.Fault_ID}`;
  document.getElementById('modal-ticket-desc').textContent = fault.Fault_Description;
  document.getElementById('modal-ticket-status').value = fault.Status === 'جديد' ? 'قيد المعالجة' : 'مغلق';

  const techSelect = document.getElementById('modal-ticket-tech');
  const technicians = db.users.filter(u => u.Role === 'Technician' || u.Role === 'Admin');
  techSelect.innerHTML = technicians.map(t =>
    `<option value="${t.User_ID}" ${t.User_ID === fault.Assigned_Tech_ID ? 'selected' : ''}>${t.Name} (${t.RoleAr})</option>`
  ).join('');

  document.getElementById('modal-ticket-action').value = '';
  document.getElementById('modal-ticket-parts').value = 'لا يوجد';
  document.getElementById('modal-ticket-cost').value = '0';
  document.getElementById('modal-ticket-notes').value = '';

  document.getElementById('modal-process-ticket').classList.remove('hidden');
}

function closeProcessTicketModal() {
  document.getElementById('modal-process-ticket').classList.add('hidden');
}

function handleProcessTicketSubmit(event) {
  if (event) event.preventDefault();
  const user = getCurrentUser();
  if (user.Role === 'User') {
    showToast('تنبيه صلاحيات: معالجة الصيانة متاحة لموظف الدعم الفني أو مدير النظام فقط', 'warning');
    return;
  }

  const faultId = document.getElementById('modal-ticket-fault-id').value;
  const newStatus = document.getElementById('modal-ticket-status').value;
  const techId = Number(document.getElementById('modal-ticket-tech').value);
  const actionTaken = document.getElementById('modal-ticket-action').value.trim();
  const parts = document.getElementById('modal-ticket-parts').value.trim() || 'لا يوجد';
  const cost = Number(document.getElementById('modal-ticket-cost').value) || 0;
  const notes = document.getElementById('modal-ticket-notes').value.trim() || 'تم الفحص والتوثيق بنجاح.';

  const fault = db.faults.find(f => f.Fault_ID === faultId);
  if (!fault) return;

  const wasClosed = fault.Status === 'مغلق';
  fault.Status = newStatus;
  fault.Assigned_Tech_ID = techId;

  // SLA timestamps: record closing time; reopening clears it (and any rating)
  if (newStatus === 'مغلق' && !wasClosed) {
    fault.Closed_At = new Date().toISOString();
  } else if (newStatus !== 'مغلق' && wasClosed) {
    delete fault.Closed_At;
    delete fault.Rating;
    delete fault.Rating_Comment;
    delete fault.Rated_At;
  }

  const dev = db.devices.find(d => d.Device_ID === fault.Device_ID);
  if (dev) {
    if (newStatus === 'مغلق') {
      dev.Status = 'يعمل بكفاءة';
    } else if (newStatus === 'قيد المعالجة') {
      dev.Status = 'تحت الصيانة';
    }
  }

  if (actionTaken) {
    const nextMaintNum = 500 + db.maintenance.length + 1;
    const today = new Date().toISOString().slice(0, 10);
    db.maintenance.unshift({
      Maintenance_ID: `MNT-2026-${nextMaintNum}`,
      Fault_ID: faultId,
      Technician_ID: techId,
      Maintenance_Date: today,
      Action_Taken: actionTaken,
      Parts_Replaced: parts,
      Cost: cost,
      Notes: notes
    });
  }

  saveDb();
  closeProcessTicketModal();
  renderAll();
  showToast(`تم تحديث حالة الطلب ${faultId} إلى (${newStatus}) وحفظ سجل الصيانة`, 'success');
}

// 6. Track Request Status Page
function inspectTicketProgress(faultId) {
  selectedTrackingFaultId = faultId;
  switchView('track-status');
}

function renderTrackStatusPage() {
  const searchInput = document.getElementById('track-search-input');
  const q = searchInput ? searchInput.value.trim().toLowerCase() : '';

  const visible = getVisibleFaults();
  if (!visible.some(f => f.Fault_ID === selectedTrackingFaultId)) {
    selectedTrackingFaultId = visible.length ? visible[0].Fault_ID : null;
  }
  const currentUserId = getCurrentUser().User_ID;

  const chipsContainer = document.getElementById('track-tickets-list');
  if (chipsContainer) {
    const matches = visible.filter(f =>
      !q || f.Fault_ID.toLowerCase().includes(q) || f.Device_ID.toLowerCase().includes(q) || f.Fault_Description.toLowerCase().includes(q)
    );
    chipsContainer.innerHTML = matches.length === 0
      ? `<div class="empty-state card"><i data-lucide="search-x"></i>${visible.length ? 'لا توجد بلاغات مطابقة' : 'لم ترفع أي بلاغ بعد'}</div>`
      : matches.map(f => {
      const dev = getDeviceById(f.Device_ID);
      const isSelected = f.Fault_ID === selectedTrackingFaultId;
      let footer = '';
      if (f.Status !== 'مغلق') footer = renderSlaBadge(f);
      else if (f.Rating) footer = renderStars(f.Rating, 13);
      else if (Number(f.User_ID) === currentUserId) footer = '<span class="badge badge-warn">بانتظار تقييمك</span>';
      return `<button onclick="selectTicketForTracking('${f.Fault_ID}')" class="ticket-item ${isSelected ? 'is-selected' : ''}">
        <div class="flex items-center justify-between gap-2">
          <span class="font-mono text-[12px] text-[var(--ink-3)]">${f.Fault_ID}</span>
          ${renderFaultStatusBadge(f.Status)}
        </div>
        <div class="text-[13.5px] font-semibold text-[var(--ink)] mt-1.5">${dev.Device_Name}</div>
        <div class="text-[12px] text-[var(--ink-3)] mt-0.5 line-clamp-1">${f.Fault_Category}</div>
        <div class="flex items-center justify-between gap-2 mt-2">
          <span class="text-[11.5px] text-[var(--ink-4)] num">${f.Report_Date}</span>
          ${footer}
        </div>
      </button>`;
    }).join('');
  }

  const fault = visible.find(f => f.Fault_ID === selectedTrackingFaultId);
  const detailBox = document.getElementById('track-ticket-detail-box');
  if (!detailBox) return;
  if (!fault) {
    detailBox.innerHTML = `<div class="empty-state"><i data-lucide="inbox"></i>لا توجد بلاغات لعرضها</div>`;
    refreshIcons();
    return;
  }

  const dev = getDeviceById(fault.Device_ID);
  const reporter = getUserById(fault.User_ID);
  const tech = getUserById(fault.Assigned_Tech_ID);
  const logs = db.maintenance.filter(m => m.Fault_ID === fault.Fault_ID);

  const step2Done = fault.Status === 'قيد المعالجة' || fault.Status === 'مغلق';
  const step3Done = fault.Status === 'مغلق';
  const stepCls = (done, current) => done ? 'is-done' : (current ? 'is-current' : '');
  const sla = getSla(fault);
  const slaText = sla.closedAt
    ? `أُغلق خلال ${formatDuration(sla.durationMs)} (المهلة ${sla.hours} ساعة)`
    : `الاستحقاق ${dtHtml(sla.deadline)}`;

  detailBox.innerHTML = `
    <div class="card-header items-start">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <span class="id-chip">${fault.Fault_ID}</span>
          ${renderFaultStatusBadge(fault.Status)}
          ${renderPriorityBadge(fault.Priority)}
        </div>
        <h3 class="text-[17px] font-semibold text-[var(--ink)] mt-2.5">${fault.Fault_Category}</h3>
      </div>
      ${isStaff() ? `<button onclick="openProcessTicketModal('${fault.Fault_ID}')" class="btn btn-primary btn-sm flex-shrink-0"><i data-lucide="pencil"></i>تحديث الحالة</button>` : ''}
    </div>

    <div class="card-body space-y-6">
      <dl class="dl">
        <div><dt>الجهاز</dt><dd>${dev.Device_Name}</dd></div>
        <div><dt>رمز الجهاز</dt><dd class="font-mono">${dev.Device_ID}</dd></div>
        <div><dt>الموقع</dt><dd>${dev.Location}</dd></div>
        <div><dt>وقت البلاغ</dt><dd>${dtHtml(getReportedAt(fault))}</dd></div>
      </dl>

      <div class="flex flex-wrap items-center justify-between gap-3 p-4 rounded-[8px] border border-[var(--line)]">
        <div class="flex items-center gap-3">
          <span class="icon-tile !w-8 !h-8"><i data-lucide="timer"></i></span>
          <div>
            <div class="text-[13px] font-semibold text-[var(--ink)]">مهلة الاستجابة</div>
            <div class="text-[12.5px] text-[var(--ink-3)] num">${slaText}</div>
          </div>
        </div>
        ${renderSlaBadge(fault)}
      </div>

      <div>
        <div class="text-[12px] text-[var(--ink-3)] mb-1.5">وصف المشكلة</div>
        <p class="text-[13.5px] text-[var(--ink-2)] leading-7 p-4 rounded-[8px] bg-[var(--subtle)] border border-[var(--line)]">${fault.Fault_Description}</p>
      </div>

      <div>
        <div class="text-[13px] font-semibold text-[var(--ink)] mb-4">مراحل الطلب</div>
        <ol class="timeline">
          <li class="tl-step is-done">
            <span class="tl-icon"><i data-lucide="check"></i></span>
            <div>
              <div class="text-[13.5px] font-semibold text-[var(--ink)]">تم استلام البلاغ</div>
              <div class="text-[12.5px] text-[var(--ink-3)]">بواسطة ${reporter.Name} · <span class="num">${fault.Report_Date}</span></div>
            </div>
          </li>
          <li class="tl-step ${stepCls(step2Done, !step2Done)}">
            <span class="tl-icon"><i data-lucide="${step2Done ? 'check' : 'wrench'}"></i></span>
            <div>
              <div class="text-[13.5px] font-semibold ${step2Done ? 'text-[var(--ink)]' : 'text-[var(--ink-2)]'}">الفحص والمعالجة</div>
              <div class="text-[12.5px] text-[var(--ink-3)]">الفني المسؤول: ${tech.Name}</div>
            </div>
          </li>
          <li class="tl-step ${stepCls(step3Done, step2Done && !step3Done)}">
            <span class="tl-icon"><i data-lucide="${step3Done ? 'check' : 'flag'}"></i></span>
            <div>
              <div class="text-[13.5px] font-semibold ${step3Done ? 'text-[var(--ink)]' : 'text-[var(--ink-2)]'}">إغلاق الطلب</div>
              <div class="text-[12.5px] text-[var(--ink-3)]">${step3Done ? 'تم إصلاح العطل وعاد الجهاز إلى الخدمة.' : 'بانتظار استكمال الإجراء الفني.'}</div>
            </div>
          </li>
        </ol>
      </div>

      ${renderRatingSection(fault, reporter)}

      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="text-[13px] font-semibold text-[var(--ink)]">الإجراءات المنفّذة</div>
          <span class="text-[12px] text-[var(--ink-3)]">${logs.length} إجراء</span>
        </div>
        ${logs.length === 0 ? `
          <div class="p-6 rounded-[8px] border border-dashed border-[var(--line-strong)] text-center text-[13px] text-[var(--ink-3)]">
            لم يُسجَّل أي إجراء صيانة على هذا البلاغ بعد.
          </div>
        ` : `<div class="border border-[var(--line)] rounded-[8px] divide-y divide-[var(--line)]">${logs.map(m => {
          const mTech = getUserById(m.Technician_ID);
          return `<div class="p-4">
            <div class="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[var(--ink-3)]">
              <span class="font-mono">${m.Maintenance_ID}</span>
              <span>${mTech.Name} · <span class="num">${m.Maintenance_Date}</span></span>
            </div>
            <p class="text-[13.5px] text-[var(--ink)] mt-2 leading-7">${m.Action_Taken}</p>
            <div class="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-[12.5px] text-[var(--ink-3)]">
              <span>قطع الغيار: <span class="text-[var(--ink-2)]">${m.Parts_Replaced}</span></span>
              <span>التكلفة: <span class="text-[var(--ink-2)] num">${m.Cost} ر.س</span></span>
            </div>
            ${m.Notes ? `<div class="mt-3 text-[12.5px] text-[var(--ink-2)] border-r-2 border-[var(--line-strong)] pr-3">${m.Notes}</div>` : ''}
          </div>`;
        }).join('')}</div>`}
      </div>
    </div>
  `;
  refreshIcons();
}

function selectTicketForTracking(faultId) {
  selectedTrackingFaultId = faultId;
  ratingDraft = { faultId: null, value: 0 };
  renderTrackStatusPage();
}

/* ---------- Service rating (after a request is closed) ---------- */
let ratingDraft = { faultId: null, value: 0 };
const RATING_LABELS = ['', 'سيئة', 'مقبولة', 'جيدة', 'جيدة جداً', 'ممتازة'];

function renderRatingSection(fault, reporter) {
  if (fault.Status !== 'مغلق') return '';

  // Already rated → read-only summary
  if (fault.Rating) {
    return `
      <div class="p-4 rounded-[8px] border border-[var(--line)]">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="text-[13px] font-semibold text-[var(--ink)]">تقييم الخدمة</div>
          <span class="text-[12px] text-[var(--ink-4)]">${dtHtml(new Date(fault.Rated_At || fault.Closed_At))}</span>
        </div>
        <div class="flex items-center gap-2 mt-2">
          ${renderStars(fault.Rating, 18)}
          <span class="text-[13px] font-medium text-[var(--ink-2)]">${RATING_LABELS[fault.Rating] || ''}</span>
        </div>
        ${fault.Rating_Comment ? `<p class="text-[13px] text-[var(--ink-2)] mt-2 leading-7">“${fault.Rating_Comment}”</p>` : ''}
        <div class="text-[12px] text-[var(--ink-3)] mt-1">— ${reporter.Name}</div>
      </div>`;
  }

  // Not rated yet: only the reporter can rate
  const isReporter = Number(fault.User_ID) === getCurrentUser().User_ID;
  if (!isReporter) {
    return `
      <div class="p-4 rounded-[8px] border border-dashed border-[var(--line-strong)] text-[13px] text-[var(--ink-3)] flex items-center gap-2">
        <i data-lucide="star" class="!w-4 !h-4"></i>بانتظار تقييم ${reporter.Name} للخدمة.
      </div>`;
  }

  if (ratingDraft.faultId !== fault.Fault_ID) ratingDraft = { faultId: fault.Fault_ID, value: 0 };
  return `
    <div class="p-4 rounded-[8px] border border-[var(--brand-100)] bg-[var(--brand-50)]">
      <div class="text-[13.5px] font-semibold text-[var(--ink)]">كيف كانت تجربتك مع هذا الطلب؟</div>
      <div class="text-[12.5px] text-[var(--ink-3)] mt-0.5">تقييمك يظهر لفريق الدعم الفني ويُحتسب في مؤشرات أداء الخدمة.</div>
      <div class="flex items-center gap-3 mt-3">
        <div id="rating-input" class="stars stars-input" role="radiogroup" aria-label="التقييم">${renderRatingInput()}</div>
        <span id="rating-label" class="text-[13px] font-medium text-[var(--ink-2)]">${RATING_LABELS[ratingDraft.value] || 'اختر عدد النجوم'}</span>
      </div>
      <textarea id="rating-comment" rows="2" class="input mt-3 !bg-white" placeholder="ملاحظة اختيارية (مثال: سرعة الاستجابة، جودة الإصلاح)"></textarea>
      <div class="flex justify-end mt-3">
        <button onclick="submitRating('${fault.Fault_ID}')" class="btn btn-primary btn-sm">إرسال التقييم</button>
      </div>
    </div>`;
}

function renderRatingInput() {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<button type="button" onclick="setRatingValue(${i})" class="star-btn" role="radio" aria-checked="${i === ratingDraft.value}" title="${RATING_LABELS[i]}">
      <svg width="26" height="26" viewBox="0 0 24 24" class="star ${i <= ratingDraft.value ? 'is-on' : ''}"><polygon points="${STAR_POINTS}"/></svg>
    </button>`;
  }
  return html;
}

function setRatingValue(value) {
  ratingDraft.value = value;
  const wrap = document.getElementById('rating-input');
  if (wrap) wrap.innerHTML = renderRatingInput();
  const label = document.getElementById('rating-label');
  if (label) label.textContent = RATING_LABELS[value];
}

function submitRating(faultId) {
  const fault = db.faults.find(f => f.Fault_ID === faultId);
  if (!fault || fault.Status !== 'مغلق') return;
  if (Number(fault.User_ID) !== getCurrentUser().User_ID) {
    showToast('التقييم متاح لصاحب البلاغ فقط', 'warning');
    return;
  }
  if (!ratingDraft.value) {
    showToast('اختر عدد النجوم أولاً', 'warning');
    return;
  }
  const commentEl = document.getElementById('rating-comment');
  fault.Rating = ratingDraft.value;
  fault.Rating_Comment = commentEl ? commentEl.value.trim() : '';
  fault.Rated_At = new Date().toISOString();
  ratingDraft = { faultId: null, value: 0 };
  saveDb();
  renderAll();
  showToast('شكراً لك، تم حفظ تقييمك', 'success');
}

// 7. Maintenance History Log & Repeat-Fault Radar
function renderMaintenanceLogPage() {
  const searchEl = document.getElementById('maint-log-search');
  const q = searchEl ? searchEl.value.trim().toLowerCase() : '';

  // Repeat-fault radar cards
  const radarContainer = document.getElementById('repeat-fault-devices-grid');
  if (radarContainer) {
    const repeatList = db.devices
      .map(d => ({ ...d, faultCount: getDeviceFaultCount(d.Device_ID) }))
      .filter(d => d.faultCount >= 2)
      .sort((a, b) => b.faultCount - a.faultCount);

    radarContainer.innerHTML = repeatList.length === 0
      ? `<div class="md:col-span-2 text-[13px] text-[var(--ink-3)] text-center py-6">لا توجد أجهزة متكررة الأعطال حالياً.</div>`
      : repeatList.map(d => `
      <div class="p-4 rounded-[8px] border border-[var(--line)] flex items-center gap-4">
        ${renderDeviceIcon(d.Device_Type)}
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-[13.5px] font-semibold text-[var(--ink)] truncate">${d.Device_Name}</span>
            <span class="badge badge-bad">${d.faultCount} أعطال</span>
          </div>
          <div class="text-[12px] text-[var(--ink-3)] mt-0.5 truncate"><span class="font-mono">${d.Device_ID}</span> · ${d.Location}</div>
        </div>
        <button onclick="openDeviceQrModal('${d.Device_ID}')" class="btn btn-secondary btn-sm flex-shrink-0">السجل</button>
      </div>
    `).join('');
  }

  const tbody = document.getElementById('maintenance-log-tbody');
  if (!tbody) return;

  const filtered = db.maintenance.filter(m => {
    const fault = db.faults.find(f => f.Fault_ID === m.Fault_ID) || {};
    const dev = getDeviceById(fault.Device_ID);
    const tech = getUserById(m.Technician_ID);
    return !q ||
      m.Maintenance_ID.toLowerCase().includes(q) ||
      m.Fault_ID.toLowerCase().includes(q) ||
      dev.Device_Name.toLowerCase().includes(q) ||
      dev.Device_ID.toLowerCase().includes(q) ||
      tech.Name.toLowerCase().includes(q) ||
      m.Action_Taken.toLowerCase().includes(q);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i data-lucide="search-x"></i>لا توجد سجلات مطابقة</div></td></tr>`;
    refreshIcons();
    return;
  }

  tbody.innerHTML = filtered.map(m => {
    const fault = db.faults.find(f => f.Fault_ID === m.Fault_ID) || { Device_ID: '-' };
    const dev = getDeviceById(fault.Device_ID);
    const tech = getUserById(m.Technician_ID);
    return `<tr>
      <td><span class="id-chip">${m.Maintenance_ID}</span></td>
      <td><button onclick="inspectTicketProgress('${m.Fault_ID}')" class="font-mono text-[12px] text-[var(--brand)] hover:underline whitespace-nowrap">${m.Fault_ID}</button></td>
      <td>
        <div class="cell-title whitespace-nowrap">${dev.Device_Name}</div>
        <div class="cell-sub font-mono">${dev.Device_ID}</div>
      </td>
      <td class="whitespace-nowrap">${tech.Name}</td>
      <td class="whitespace-nowrap num">${m.Maintenance_Date}</td>
      <td class="min-w-[240px] max-w-sm leading-6">${m.Action_Taken}</td>
      <td class="min-w-[120px]">${m.Parts_Replaced}</td>
      <td class="min-w-[200px] text-[var(--ink-3)] leading-6">${m.Notes || '—'}</td>
    </tr>`;
  }).join('');
  refreshIcons();
}

// 8. Reports & Analytics + MySQL Database Explorer
function renderTechPerformance() {
  const tbody = document.getElementById('tech-performance-tbody');
  if (!tbody) return;
  const techs = db.users.filter(u => u.Role === 'Technician' || db.faults.some(f => Number(f.Assigned_Tech_ID) === u.User_ID));
  const rows = techs.map(t => {
    const assigned = db.faults.filter(f => Number(f.Assigned_Tech_ID) === t.User_ID);
    return { t, assigned, stats: computeServiceStats(assigned), open: assigned.filter(f => f.Status !== 'مغلق').length };
  }).filter(r => r.assigned.length > 0);

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">لا توجد طلبات مسندة بعد</div></td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(({ t, stats, open }) => {
    const c = stats.compliance;
    const barColor = c === null ? 'var(--line-strong)' : c >= 80 ? 'var(--ok)' : c >= 50 ? '#dc6803' : 'var(--bad)';
    return `<tr>
      <td><div class="flex items-center gap-3">${renderAvatar(t.Name, 30)}<div><div class="cell-title whitespace-nowrap">${t.Name}</div><div class="cell-sub">${t.Department}</div></div></div></td>
      <td class="num">${stats.closedCount}</td>
      <td class="num">${open}${stats.overdueOpen ? ` <span class="text-[12px] text-[var(--bad)]">(${stats.overdueOpen} متأخر)</span>` : ''}</td>
      <td class="min-w-[150px]">
        <div class="flex items-center gap-2">
          <div class="flex-1 h-1.5 rounded-full bg-[#f2f4f7] overflow-hidden"><div class="h-full rounded-full" style="width:${c || 0}%;background:${barColor}"></div></div>
          <span class="num text-[12.5px] w-10 text-left">${c === null ? '—' : c + '%'}</span>
        </div>
      </td>
      <td class="whitespace-nowrap">${stats.avgDurationMs === null ? '—' : formatDuration(stats.avgDurationMs)}</td>
      <td class="whitespace-nowrap">${stats.avgRating === null ? '<span class="text-[var(--ink-4)]">لا تقييمات</span>' : `<div class="flex items-center gap-1.5">${renderStars(stats.avgRating, 13)}<span class="num text-[12.5px]">${stats.avgRating.toFixed(1)}</span></div>`}</td>
    </tr>`;
  }).join('');
}

function renderReportsPage() {
  renderTechPerformance();
  if (typeof Chart !== 'undefined') {
    const ctxFaultStatus = document.getElementById('chart-reports-faults');
    if (ctxFaultStatus) {
      if (chartInstances.reportsFaults) chartInstances.reportsFaults.destroy();
      const cNew = db.faults.filter(f => f.Status === 'جديد').length;
      const cProg = db.faults.filter(f => f.Status === 'قيد المعالجة').length;
      const cClosed = db.faults.filter(f => f.Status === 'مغلق').length;
      chartInstances.reportsFaults = new Chart(ctxFaultStatus, {
        type: 'pie',
        data: {
          labels: ['بلاغات جديدة', 'قيد المعالجة', 'تم الحل والإغلاق'],
          datasets: [{
            data: [cNew, cProg, cClosed],
            backgroundColor: ['#2e90fa', '#f79009', '#17b26a'],
            borderWidth: 3,
            borderColor: '#ffffff',
            hoverOffset: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: { position: 'bottom', rtl: true, labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 8, boxHeight: 8, padding: 16 } },
            tooltip: { rtl: true, backgroundColor: '#101828', padding: 10, cornerRadius: 6 }
          }
        }
      });
    }
  }

  renderDatabaseExplorerTable(activeDbTab);
}

function switchDatabaseTab(tableName) {
  activeDbTab = tableName;
  ['Users', 'Devices', 'Faults', 'Maintenance'].forEach(t => {
    const btn = document.getElementById(`db-tab-${t}`);
    if (btn) {
      btn.classList.toggle('is-active', t === tableName);
    }
  });
  renderDatabaseExplorerTable(tableName);
}

function renderDatabaseExplorerTable(tableName) {
  const headEl = document.getElementById('db-explorer-thead');
  const bodyEl = document.getElementById('db-explorer-tbody');
  if (!headEl || !bodyEl) return;

  const th = (label, key) => `<th class="font-mono" dir="ltr" style="text-align:right">${label}${key ? ` <span class="text-[10.5px] text-[var(--ink-4)]">${key}</span>` : ''}</th>`;
  const tdMono = (v) => `<td class="font-mono text-[12px] whitespace-nowrap">${v}</td>`;

  if (tableName === 'Users') {
    headEl.innerHTML = `<tr>${th('User_ID', 'PK')}${th('Name')}${th('Email')}${th('Password')}${th('Role')}</tr>`;
    bodyEl.innerHTML = db.users.map(u => `<tr>${tdMono(u.User_ID)}<td class="cell-title whitespace-nowrap">${u.Name}</td>${tdMono(u.Email)}<td class="font-mono text-[12px] text-[var(--ink-4)]">••••••••</td>${tdMono(u.Role)}</tr>`).join('');
  } else if (tableName === 'Devices') {
    headEl.innerHTML = `<tr>${th('Device_ID', 'PK')}${th('Device_Name')}${th('Device_Type')}${th('Serial_Number')}${th('Status')}${th('Location')}${th('Purchase_Date')}</tr>`;
    bodyEl.innerHTML = db.devices.map(d => `<tr>${tdMono(d.Device_ID)}<td class="cell-title whitespace-nowrap">${d.Device_Name}</td><td class="whitespace-nowrap">${d.Device_Type}</td>${tdMono(d.Serial_Number)}<td>${renderDeviceStatusBadge(d.Status)}</td><td class="min-w-[180px]">${d.Location}</td>${tdMono(d.Purchase_Date)}</tr>`).join('');
  } else if (tableName === 'Faults') {
    headEl.innerHTML = `<tr>${th('Fault_ID', 'PK')}${th('Device_ID', 'FK')}${th('User_ID', 'FK')}${th('Fault_Description')}${th('Report_Date')}${th('Status')}</tr>`;
    bodyEl.innerHTML = db.faults.map(f => `<tr>${tdMono(f.Fault_ID)}${tdMono(f.Device_ID)}${tdMono(f.User_ID)}<td class="min-w-[280px] max-w-md leading-6">${f.Fault_Description}</td>${tdMono(f.Report_Date)}<td>${renderFaultStatusBadge(f.Status)}</td></tr>`).join('');
  } else if (tableName === 'Maintenance') {
    headEl.innerHTML = `<tr>${th('Maintenance_ID', 'PK')}${th('Fault_ID', 'FK')}${th('Technician_ID', 'FK')}${th('Maintenance_Date')}${th('Action_Taken')}${th('Notes')}</tr>`;
    bodyEl.innerHTML = db.maintenance.map(m => `<tr>${tdMono(m.Maintenance_ID)}${tdMono(m.Fault_ID)}${tdMono(m.Technician_ID)}${tdMono(m.Maintenance_Date)}<td class="min-w-[260px] leading-6">${m.Action_Taken}</td><td class="min-w-[220px] leading-6 text-[var(--ink-3)]">${m.Notes}</td></tr>`).join('');
  }
}

function exportReportCsv() {
  const headers = ['Device_ID', 'Device_Name', 'Device_Type', 'Serial_Number', 'Status', 'Location', 'Purchase_Date', 'Total_Faults'];
  const rows = db.devices.map(d => [
    d.Device_ID,
    `"${d.Device_Name}"`,
    `"${d.Device_Type}"`,
    d.Serial_Number,
    `"${d.Status}"`,
    `"${d.Location}"`,
    d.Purchase_Date,
    getDeviceFaultCount(d.Device_ID)
  ]);
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Sanad_Devices_And_Maintenance_Report.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('تم تصدير تقرير الأجهزة والصيانة بصيغة CSV بنجاح', 'success');
}

// 9. Users Management Page
function renderUsersPage() {
  const tbody = document.getElementById('users-table-tbody');
  if (!tbody) return;

  const roleBadge = (role, roleAr) => {
    const map = {
      'Admin': 'badge-brand',
      'Technician': 'badge-info',
      'User': 'badge-muted'
    };
    return `<span class="badge ${map[role] || 'badge-muted'}">${roleAr}</span>`;
  };

  const current = getCurrentUser();
  tbody.innerHTML = db.users.map(u => {
    const isCurrent = u.User_ID === current.User_ID;
    return `
    <tr>
      <td>
        <div class="flex items-center gap-3">
          ${renderAvatar(u.Name, 34)}
          <div class="min-w-0">
            <div class="cell-title whitespace-nowrap">${u.Name}</div>
            <div class="cell-sub font-mono" dir="ltr" style="text-align:right">${u.Email}</div>
          </div>
        </div>
      </td>
      <td class="min-w-[160px]">${u.Department}</td>
      <td>${roleBadge(u.Role, u.RoleAr)}</td>
      <td class="text-left">
        ${isCurrent
          ? `<span class="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--ok)] font-medium whitespace-nowrap"><i data-lucide="circle-check" class="!w-4 !h-4"></i>الحساب الحالي</span>`
          : `<button onclick="switchRoleByUserId(${u.User_ID})" class="btn btn-ghost btn-sm whitespace-nowrap">التبديل إليه</button>`}
      </td>
    </tr>`;
  }).join('');

  // Permissions matrix
  const permBody = document.getElementById('permissions-matrix-tbody');
  if (permBody) {
    const perms = [
      ['عرض الأجهزة المسجّلة', 1, 1, 1],
      ['إرسال بلاغ عطل (يدوياً أو بمسح رمز QR)', 1, 1, 1],
      ['متابعة البلاغات التي رفعها', 1, 1, 1],
      ['تقييم الخدمة بعد إغلاق بلاغه', 1, 1, 1],
      ['مشاهدة جميع الأعطال المسجّلة', 0, 1, 1],
      ['تحديث حالة طلب الصيانة', 0, 1, 1],
      ['تسجيل الإجراءات المنفّذة وإغلاق الطلب', 0, 1, 1],
      ['سجل الصيانة والأجهزة متكررة الأعطال', 0, 1, 1],
      ['إضافة الأجهزة وتعديلها وحذفها', 0, 0, 1],
      ['إدارة المستخدمين والصلاحيات', 0, 0, 1],
      ['التقارير ومؤشرات أداء الخدمة', 0, 0, 1]
    ];
    const mark = (v) => v
      ? '<i data-lucide="check" class="!w-4 !h-4 mx-auto text-[var(--brand)]" style="stroke-width:2.25"></i>'
      : '<span class="block w-3 h-px bg-[var(--line-strong)] mx-auto"></span>';
    permBody.innerHTML = perms.map(p => `<tr><td class="text-[var(--ink)]">${p[0]}</td><td class="text-center">${mark(p[1])}</td><td class="text-center">${mark(p[2])}</td><td class="text-center">${mark(p[3])}</td></tr>`).join('');
  }
}

function handleAddUserSubmit(event) {
  if (event) event.preventDefault();
  const user = getCurrentUser();
  if (user.Role !== 'Admin') {
    showToast('إضافة المستخدمين متاحة لمدير النظام فقط', 'warning');
    return;
  }

  const name = document.getElementById('new-user-name').value.trim();
  const email = document.getElementById('new-user-email').value.trim();
  const role = document.getElementById('new-user-role').value;
  const dept = document.getElementById('new-user-dept').value.trim() || 'الإدارة العامة';

  if (!name || !email) {
    showToast('يرجى إدخال اسم المستخدم والبريد الإلكتروني', 'error');
    return;
  }

  const roleArMap = { 'Admin': 'مدير النظام', 'Technician': 'موظف الدعم الفني', 'User': 'مستخدم' };
  const nextId = db.users.reduce((max, u) => Math.max(max, u.User_ID), 0) + 1;

  db.users.push({
    User_ID: nextId,
    Name: name,
    Email: email,
    Password: '••••••',
    Role: role,
    RoleAr: roleArMap[role] || 'مستخدم',
    Department: dept,
    Phone: '0500000000'
  });

  saveDb();
  document.getElementById('form-add-user').reset();
  renderAll();
  showToast(`تمت إضافة المستخدم ${name} (${roleArMap[role]}) بنجاح`, 'success');
}

// Modals: Device QR & History, Edit Device, Delete Device
function openDeviceQrModal(deviceId) {
  const dev = getDeviceById(deviceId);
  const devFaults = getVisibleFaults().filter(f => f.Device_ID === deviceId);
  const modal = document.getElementById('modal-device-qr');
  const body = document.getElementById('modal-device-qr-body');
  if (!modal || !body) return;

  const qrPayload = getDeviceQrPayload(dev.Device_ID);
  const qrIsLink = qrPayloadIsLink(qrPayload);
  body.innerHTML = `
    <div class="flex items-center gap-4 pb-4">
      <div class="flex-shrink-0">${generateQrSvg(qrPayload, 112)}</div>
      <div class="min-w-0 space-y-1.5">
        <span class="id-chip">${dev.Device_ID}</span>
        <div class="text-[15px] font-semibold text-[var(--ink)]">${dev.Device_Name}</div>
        <div class="text-[12.5px] text-[var(--ink-3)]">${deviceTypeLabel(dev.Device_Type)} · <span class="font-mono">${dev.Serial_Number}</span></div>
        <div>${renderDeviceStatusBadge(dev.Status)}</div>
      </div>
    </div>
    <div class="flex items-start gap-2 p-3 rounded-[8px] bg-[var(--subtle)] border border-[var(--line)] text-[12.5px] text-[var(--ink-3)] leading-6 mb-5">
      <i data-lucide="${qrIsLink ? 'scan-line' : 'info'}" class="!w-4 !h-4 mt-1 flex-shrink-0"></i>
      <span>${qrIsLink
        ? 'امسح الرمز بكاميرا الجوال لفتح نموذج البلاغ مع تحديد هذا الجهاز تلقائياً.'
        : 'الرمز يحتوي حالياً على رمز الجهاز فقط. عند نشر النظام على رابط (http/https) أو ضبط PUBLIC_BASE_URL سيفتح المسح نموذج البلاغ مباشرة.'}</span>
    </div>
    <div class="pt-5 border-t border-[var(--line)]">
      <div class="flex items-center justify-between mb-3">
        <div class="text-[13px] font-semibold text-[var(--ink)]">سجل الأعطال</div>
        <span class="text-[12px] text-[var(--ink-3)]">${devFaults.length} بلاغ</span>
      </div>
      ${devFaults.length === 0 ? `<p class="text-[13px] text-[var(--ink-3)] text-center py-4">لا توجد أعطال مسجّلة لهذا الجهاز.</p>` :
        `<div class="border border-[var(--line)] rounded-[8px] divide-y divide-[var(--line)]">${devFaults.map(f => `
          <button onclick="closeDeviceQrModal(); inspectTicketProgress('${f.Fault_ID}')" class="w-full text-right px-3.5 py-3 flex items-center justify-between gap-3 hover:bg-[var(--subtle)] transition">
            <div class="min-w-0">
              <div class="text-[13px] font-medium text-[var(--ink)] truncate">${f.Fault_Category}</div>
              <div class="text-[11.5px] text-[var(--ink-3)] mt-0.5"><span class="font-mono">${f.Fault_ID}</span> · <span class="num">${f.Report_Date}</span></div>
            </div>
            ${renderFaultStatusBadge(f.Status)}
          </button>`).join('')}</div>`}
    </div>
  `;
  modal.classList.remove('hidden');
  refreshIcons();
}

function closeDeviceQrModal() {
  document.getElementById('modal-device-qr').classList.add('hidden');
}

function openEditDeviceModal(deviceId) {
  const user = getCurrentUser();
  if (user.Role !== 'Admin') {
    showToast('تنبيه صلاحيات: تعديل بيانات الأجهزة متاح لمدير النظام فقط', 'warning');
    return;
  }
  const dev = db.devices.find(d => d.Device_ID === deviceId);
  if (!dev) return;

  document.getElementById('edit-dev-id').value = dev.Device_ID;
  document.getElementById('edit-dev-name').value = dev.Device_Name;
  document.getElementById('edit-dev-type').value = dev.Device_Type;
  document.getElementById('edit-dev-status').value = dev.Status;
  document.getElementById('edit-dev-location').value = dev.Location;
  document.getElementById('modal-edit-device').classList.remove('hidden');
}

function closeEditDeviceModal() {
  document.getElementById('modal-edit-device').classList.add('hidden');
}

function handleEditDeviceSubmit(event) {
  if (event) event.preventDefault();
  const id = document.getElementById('edit-dev-id').value;
  const dev = db.devices.find(d => d.Device_ID === id);
  if (!dev) return;

  dev.Device_Name = document.getElementById('edit-dev-name').value.trim();
  dev.Device_Type = document.getElementById('edit-dev-type').value;
  dev.Status = document.getElementById('edit-dev-status').value;
  dev.Location = document.getElementById('edit-dev-location').value.trim();

  saveDb();
  closeEditDeviceModal();
  renderAll();
  showToast(`تم تحديث بيانات الجهاز ${id} بنجاح`, 'success');
}

let pendingDeleteDeviceId = null;
function openDeleteDeviceModal(deviceId) {
  const user = getCurrentUser();
  if (user.Role !== 'Admin') {
    showToast('تنبيه صلاحيات: حذف الأجهزة متاح لمدير النظام فقط', 'warning');
    return;
  }
  pendingDeleteDeviceId = deviceId;
  const dev = getDeviceById(deviceId);
  document.getElementById('delete-device-name-label').textContent = `${dev.Device_Name} (${dev.Device_ID})`;
  document.getElementById('modal-delete-device').classList.remove('hidden');
}

function closeDeleteDeviceModal() {
  pendingDeleteDeviceId = null;
  document.getElementById('modal-delete-device').classList.add('hidden');
}

function confirmDeleteDevice() {
  if (!pendingDeleteDeviceId) return;
  db.devices = db.devices.filter(d => d.Device_ID !== pendingDeleteDeviceId);
  db.faults = db.faults.filter(f => f.Device_ID !== pendingDeleteDeviceId);
  saveDb();
  closeDeleteDeviceModal();
  renderAll();
  showToast('تم حذف الجهاز وسجلاته المرتبطة من النظام', 'info');
}

function renderAll() {
  renderHeaderAndRole();
  renderDashboard();
  renderDevicesTable();
  updateNewDevicePreview();
  populateFaultFormDropdowns();
  renderMaintenanceRequests();
  renderTrackStatusPage();
  renderMaintenanceLogPage();
  renderReportsPage();
  renderUsersPage();
  refreshIcons();
}

window.addEventListener('DOMContentLoaded', () => {
  loadDb();
  generateRandomDeviceCode();
  const route = parseRouteFromUrl();
  if (!isLoggedIn()) {
    // Remember where the user was heading (e.g. scanned QR) and continue after login
    pendingRoute = route;
    switchView('login');
  } else {
    openRoute(route);
  }
  refreshIcons();
  initBackendConnection();
});
