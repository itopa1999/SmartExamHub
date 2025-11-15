"""
Core App Admin Configuration
=============================

Django admin interface configuration for all Core app models.
Provides user-friendly interfaces for managing:
- Admin users
- Students
- Levels
- Exam modules
- Questions
- Results
- System settings
- Bulk uploads
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import (
    Level, Student, ExamModule, SystemSettings
)

# ============================================================================

# LEVEL ADMINISTRATION
# ============================================================================

@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'level_type', 'student_count_display', 'is_active']
    list_filter = ['level_type', 'is_active', 'created_at']
    search_fields = ['name', 'code']
    ordering = ['level_type', 'name']
    readonly_fields = ['created_at', 'modified_at', 'deleted_at', 'created_by', 'modified_by', 'deleted_by']

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'level_type', 'description')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Base Model Info', {
            'fields': ('created_at', 'modified_at', 'deleted_at', 'created_by', 'modified_by', 'deleted_by'),
            'classes': ('collapse',)
        }),
    )

    def student_count_display(self, obj):
        count = obj.student_count
        url = reverse('admin:core_student_changelist') + f'?level__id__exact={obj.id}'
        return format_html('<a href="{}">{} students</a>', url, count)
    student_count_display.short_description = "Students"


# ============================================================================

# STUDENT ADMINISTRATION
# ============================================================================

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['student_id', 'full_name', 'level', 'is_active', 'completed_exams_display', 'average_score_display']
    list_filter = ['level', 'is_active', 'uploaded_via_bulk']
    search_fields = ['full_name', 'student_id']
    ordering = ['level', 'full_name']
    readonly_fields = ['created_at', 'modified_at', 'deleted_at', 'created_by', 'modified_by', 'deleted_by']

    fieldsets = (
        ('Basic Information', {
            'fields': ('full_name', 'student_id', 'level')
        }),
        ('Status & Tracking', {
            'fields': ('is_active', 'uploaded_via_bulk')
        }),
        ('Base Model Info', {
            'fields': ('created_at', 'modified_at', 'deleted_at', 'created_by', 'modified_by', 'deleted_by'),
            'classes': ('collapse',)  # Collapsible accordion
        }),
    )

    actions = ['activate_students', 'deactivate_students']

    def completed_exams_display(self, obj):
        return obj.completed_exams_count
    completed_exams_display.short_description = "Completed Exams"

    def average_score_display(self, obj):
        return f"{obj.average_score}%"
    average_score_display.short_description = "Average Score"

    def activate_students(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} student(s) activated.")
    activate_students.short_description = "Activate selected students"

    def deactivate_students(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} student(s) deactivated.")
    deactivate_students.short_description = "Deactivate selected students"


# ============================================================================

# EXAM MODULE ADMINISTRATION
# ============================================================================

@admin.register(ExamModule)
class ExamModuleAdmin(admin.ModelAdmin):
    list_display = ['code', 'title', 'level', 'duration_minutes', 'passing_score', 'is_active']
    list_filter = ['level', 'is_active']
    search_fields = ['title', 'code']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'modified_at', 'deleted_at', 'created_by', 'modified_by', 'deleted_by']

    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'code', 'description', 'level')
        }),
        ('Exam Settings', {
            'fields': ('duration_minutes', 'passing_score', 'max_attempts', 'randomize_questions', 'show_correct_answers')
        }),
        ('Availability', {
            'fields': ('is_active',)
        }),
        ('Base Model Info', {
            'fields': ('created_at', 'modified_at', 'deleted_at', 'created_by', 'modified_by', 'deleted_by'),
            'classes': ('collapse',)
        }),
    )


# ============================================================================

# SYSTEM SETTINGS ADMINISTRATION
# ============================================================================

@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    readonly_fields = ['created_at', 'modified_at', 'deleted_at', 'created_by', 'modified_by', 'deleted_by']
    fieldsets = (
        ('Branding', {'fields': ('institution_name', 'system_title', 'logo')}),
        ('Contact', {'fields': ('admin_email', 'support_email', 'contact_phone')}),
        ('Exam Defaults', {'fields': ('default_exam_duration', 'default_passing_percentage', 'default_max_attempts')}),
        ('Security & Options', {'fields': ('randomize_questions_default', 'show_correct_answers_default', 'allow_question_review', 'commence_exam_immediately')}),
        ('Base Model Info', {
            'fields': ('created_at', 'modified_at', 'deleted_at', 'created_by', 'modified_by', 'deleted_by'),
            'classes': ('collapse',)
        }),
    )

    def has_add_permission(self, request):
        return not SystemSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False