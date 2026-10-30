"""
مشروع التخرج: نظام "سند" (TechCare) الذكي لإدارة الأجهزة والصيانة التقنية
واجهات البرمجة الخلفية (Django Views & REST Endpoints)
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count
import json
from .models import User, Device, Fault, Maintenance


def dashboard_stats(request):
    """إرجاع إحصائيات لوحة التحكم الرئيسية وتقارير الأعطال المتكررة"""
    total_devices = Device.objects.count()
    active_devices = Device.objects.filter(Status='يعمل بكفاءة').count()
    open_faults = Fault.objects.exclude(Status='مغلق').count()
    completed_maint = Maintenance.objects.count()

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
        },
        'repeat_fault_devices': list(repeat_fault_devices),
    })
