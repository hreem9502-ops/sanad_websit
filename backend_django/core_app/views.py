"""
مشروع التخرج: نظام "سند" (TechCare) الذكي لإدارة الأجهزة والصيانة التقنية
واجهات البرمجة الخلفية (Django Views & REST Endpoints)
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count, Avg
from django.utils import timezone
import json
from .models import User, Device, Fault, Maintenance


def bootstrap_data(request):
    """جلب كامل بيانات الجداول الأربعة للواجهة الأمامية"""
    users = list(User.objects.values(
        'User_ID', 'Name', 'Email', 'Password', 'Role', 'RoleAr', 'Department', 'Phone'
    ))
    devices = list(Device.objects.values(
        'Device_ID', 'Device_Name', 'Device_Type', 'Serial_Number',
        'Status', 'Location', 'Purchase_Date', 'Specs'
    ))
    faults = list(Fault.objects.values(
        'Fault_ID', 'Device_ID_id', 'User_ID_id', 'Assigned_Tech_id',
        'Fault_Category', 'Priority', 'Fault_Description',
        'Report_Date', 'Reported_At', 'Closed_At', 'Status',
        'Rating', 'Rating_Comment', 'Rated_At'
    ))
    maintenance = list(Maintenance.objects.values(
        'Maintenance_ID', 'Fault_ID_id', 'Technician_ID_id',
        'Maintenance_Date', 'Action_Taken', 'Parts_Replaced', 'Cost', 'Notes'
    ))
    return JsonResponse({
        'schemaVersion': 2,
        'currentUserId': 1,
        'users': users,
        'devices': devices,
        'faults': faults,
        'maintenance': maintenance,
    })


def dashboard_stats(request):
    """إرجاع إحصائيات لوحة التحكم الرئيسية ومؤشرات SLA وتقارير الأعطال المتكررة"""
    total_devices = Device.objects.count()
    active_devices = Device.objects.filter(Status='يعمل بكفاءة').count()
    open_faults = Fault.objects.exclude(Status='مغلق').count()
    completed_maint = Maintenance.objects.count()
    avg_rating = Fault.objects.filter(Rating__isnull=False).aggregate(avg=Avg('Rating'))['avg']

    repeat_fault_devices = (
        Device.objects.annotate(fault_count=Count('faults'))
        .filter(fault_count__gte=2)
        .values('Device_ID', 'Device_Name', 'Location', 'fault_count')
    )

    return JsonResponse({
        'system': 'سند - نظام ذكي لإدارة الأجهزة والصيانة التقنية',
        'kpis': {
            'total_devices': total_devices,
            'active_devices': active_devices,
            'open_faults': open_faults,
            'completed_maintenance': completed_maint,
            'avg_rating': round(avg_rating, 1) if avg_rating else None,
        },
        'repeat_fault_devices': list(repeat_fault_devices),
    })


@csrf_exempt
def submit_fault_rating(request, fault_id):
    """حفظ تقييم المبلّغ (1-5 نجوم) بعد إغلاق البلاغ"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    payload = json.loads(request.body or '{}')
    Fault.objects.filter(Fault_ID=fault_id).update(
        Rating=int(payload.get('Rating', 5)),
        Rating_Comment=payload.get('Rating_Comment', ''),
        Rated_At=timezone.now(),
    )
    return JsonResponse({'ok': True, 'Fault_ID': fault_id})
