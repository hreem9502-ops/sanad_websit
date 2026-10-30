"""
مشروع التخرج: نظام "سند" (TechCare) الذكي لإدارة الأجهزة والصيانة التقنية
ملف نماذج قاعدة البيانات (Django Models) متوافق مع MySQL
"""
from django.db import models


class User(models.Model):
    ROLE_CHOICES = [
        ('Admin', 'مدير النظام'),
        ('Technician', 'موظف الدعم الفني'),
        ('User', 'مستخدم'),
    ]
    User_ID = models.AutoField(primary_key=True, verbose_name="رقم المستخدم")
    Name = models.CharField(max_length=120, verbose_name="اسم المستخدم")
    Email = models.EmailField(unique=True, verbose_name="البريد الإلكتروني")
    Password = models.CharField(max_length=255, verbose_name="كلمة المرور")
    Role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='User', verbose_name="نوع المستخدم")
    RoleAr = models.CharField(max_length=50, default='مستخدم', verbose_name="المسمى الوظيفي")
    Department = models.CharField(max_length=100, default='الإدارة العامة', verbose_name="القسم")
    Phone = models.CharField(max_length=30, blank=True, null=True, verbose_name="رقم التواصل")

    class Meta:
        db_table = 'Users'
        verbose_name = 'مستخدم'
        verbose_name_plural = 'المستخدمون'

    def __str__(self):
        return f"{self.Name} ({self.get_Role_display()})"


class Device(models.Model):
    STATUS_CHOICES = [
        ('يعمل بكفاءة', 'يعمل بكفاءة'),
        ('تحت الصيانة', 'تحت الصيانة'),
        ('معطل', 'معطل'),
        ('خارج الخدمة', 'خارج الخدمة'),
    ]
    Device_ID = models.CharField(max_length=30, primary_key=True, verbose_name="رقم الجهاز")
    Device_Name = models.CharField(max_length=150, verbose_name="اسم الجهاز")
    Device_Type = models.CharField(max_length=60, verbose_name="نوع الجهاز")
    Serial_Number = models.CharField(max_length=100, unique=True, verbose_name="الرقم التسلسلي")
    Status = models.CharField(max_length=40, choices=STATUS_CHOICES, default='يعمل بكفاءة', verbose_name="حالة الجهاز")
    Location = models.CharField(max_length=150, verbose_name="موقع الجهاز")
    Purchase_Date = models.DateField(verbose_name="تاريخ الشراء")
    Specs = models.CharField(max_length=255, blank=True, null=True, verbose_name="المواصفات")

    class Meta:
        db_table = 'Devices'
        verbose_name = 'جهاز تقني'
        verbose_name_plural = 'الأجهزة التقنية'

    def __str__(self):
        return f"{self.Device_ID} - {self.Device_Name}"


class Fault(models.Model):
    STATUS_CHOICES = [
        ('جديد', 'جديد'),
        ('قيد المعالجة', 'قيد المعالجة'),
        ('مغلق', 'مغلق'),
    ]
    Fault_ID = models.CharField(max_length=30, primary_key=True, verbose_name="رقم العطل")
    Device_ID = models.ForeignKey(Device, on_delete=models.CASCADE, db_column='Device_ID', related_name='faults', verbose_name="الجهاز")
    User_ID = models.ForeignKey(User, on_delete=models.PROTECT, db_column='User_ID', related_name='reported_faults', verbose_name="المبلّغ")
    Assigned_Tech = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_column='Assigned_Tech_ID', related_name='assigned_faults', verbose_name="الفني المسؤول")
    Fault_Category = models.CharField(max_length=100, default='عطل عتاد', verbose_name="تصنيف العطل")
    Priority = models.CharField(max_length=20, default='متوسطة', verbose_name="الأولوية")
    Fault_Description = models.TextField(verbose_name="وصف المشكلة")
    Report_Date = models.DateField(auto_now_add=True, verbose_name="تاريخ الإبلاغ")
    Reported_At = models.DateTimeField(auto_now_add=True, verbose_name="وقت الإبلاغ (SLA)")
    Closed_At = models.DateTimeField(null=True, blank=True, verbose_name="وقت الإغلاق")
    Status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='جديد', verbose_name="حالة العطل")
    Rating = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="تقييم الخدمة (1-5)")
    Rating_Comment = models.CharField(max_length=500, null=True, blank=True, verbose_name="تعليق التقييم")
    Rated_At = models.DateTimeField(null=True, blank=True, verbose_name="وقت التقييم")

    class Meta:
        db_table = 'Faults'
        verbose_name = 'بلاغ عطل'
        verbose_name_plural = 'بلاغات الأعطال'


class Maintenance(models.Model):
    Maintenance_ID = models.CharField(max_length=30, primary_key=True, verbose_name="رقم الصيانة")
    Fault_ID = models.ForeignKey(Fault, on_delete=models.CASCADE, db_column='Fault_ID', related_name='maintenance_logs', verbose_name="رقم العطل")
    Technician_ID = models.ForeignKey(User, on_delete=models.PROTECT, db_column='Technician_ID', related_name='maintenance_actions', verbose_name="رقم الفني")
    Maintenance_Date = models.DateField(auto_now_add=True, verbose_name="تاريخ الصيانة")
    Action_Taken = models.TextField(verbose_name="الإجراء المتخذ")
    Parts_Replaced = models.CharField(max_length=255, default='لا يوجد', verbose_name="قطع الغيار")
    Cost = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="التكلفة")
    Notes = models.TextField(blank=True, null=True, verbose_name="الملاحظات")

    class Meta:
        db_table = 'Maintenance'
        verbose_name = 'سجل صيانة'
        verbose_name_plural = 'سجلات الصيانة'
