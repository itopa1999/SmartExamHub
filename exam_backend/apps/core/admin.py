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
    ExamAttempt, Level, Student, ExamModule, Question, StudentAnswer, SystemSettings, BulkUpload
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
            'classes': ('collapse',)
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


# # ============================================================================
# # QUESTION ADMINISTRATION
# # ============================================================================

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    """Admin interface for Question model"""
    list_display = [
        'id', 'question_preview', 'exam_module', 'correct_answer',
        'difficulty', 'marks', 'is_active'
    ]
    list_filter = ['exam_module', 'difficulty', 'is_active', 'created_at']
    search_fields = ['question_text', 'category']
    ordering = ['exam_module', 'order', 'created_at']
    readonly_fields = ['created_at', 'modified_at', 'deleted_at', 'created_by', 'modified_by', 'deleted_by']
    
    fieldsets = (
        ('Question', {
            'fields': ('exam_module', 'question_text', 'order')
        }),
        ('Options', {
            'fields': ('option_a', 'option_b', 'option_c', 'option_d', 'correct_answer')
        }),
        ('Metadata', {
            'fields': ('difficulty', 'category', 'marks', 'explanation')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'modified_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_questions', 'deactivate_questions']
    
    def question_preview(self, obj):
        preview = obj.question_text[:60] + "..." if len(obj.question_text) > 60 else obj.question_text
        return preview
    question_preview.short_description = "Question"
    
    def activate_questions(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} question(s) activated successfully.')
    activate_questions.short_description = "Activate selected questions"
    
    def deactivate_questions(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} question(s) deactivated successfully.')
    deactivate_questions.short_description = "Deactivate selected questions"


# ============================================================================
# EXAM ATTEMPT ADMINISTRATION
# ============================================================================

@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    """Admin interface for ExamAttempt model"""
    list_display = [
        'id', 'student', 'exam_module', 'attempt_number',
        'status', 'score_display', 'grade_display', 'passed',
        'start_time'
    ]
    list_filter = ['status', 'passed', 'exam_module', 'start_time']
    search_fields = ['student__full_name', 'student__student_id', 'exam_module__title']
    ordering = ['-start_time']
    readonly_fields = ['created_at', 'modified_at', 'deleted_at', 'created_by', 'modified_by', 'deleted_by',
        'start_time', 'end_time', 'time_taken_seconds', 'grade_display'
    ]
    date_hierarchy = 'start_time'
    
    fieldsets = (
        ('Exam Information', {
            'fields': ('student', 'exam_module', 'attempt_number', 'status')
        }),
        ('Time Tracking', {
            'fields': ('start_time', 'end_time', 'time_taken_seconds')
        }),
        ('Results', {
            'fields': (
                'score', 'grade_display', 'passed',
                'total_questions', 'correct_answers',
                'wrong_answers', 'unanswered'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'modified_at'),
            'classes': ('collapse',)
        }),
    )
    
    def score_display(self, obj):
        if obj.score is None:
            return "-"
        color = '#28a745' if obj.passed else '#dc3545'
        return format_html('<span style="color: {}; font-weight: bold;">{}%</span>', color, obj.score)
    score_display.short_description = "Score"
    
    def grade_display(self, obj):
        grade = obj.grade
        color_map = {
            'A+': '#28a745', 'A': '#28a745', 'B': '#17a2b8',
            'C': '#ffc107', 'D': '#fd7e14', 'F': '#dc3545', 'N/A': '#6c757d'
        }
        color = color_map.get(grade, '#6c757d')
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, grade)
    grade_display.short_description = "Grade"


# ============================================================================
# STUDENT ANSWER ADMINISTRATION
# ============================================================================

@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    """Admin interface for StudentAnswer model"""
    list_display = [
        'id', 'exam_attempt', 'question_preview',
        'selected_answer', 'is_correct_display', 'answered_at'
    ]
    list_filter = ['is_correct', 'answered_at', 'exam_attempt__exam_module']
    search_fields = ['exam_attempt__student__full_name', 'question__question_text']
    ordering = ['-answered_at']
    readonly_fields = ['created_at', 'modified_at', 'deleted_at', 'created_by', 'modified_by', 'deleted_by', 'answered_at']
    
    def question_preview(self, obj):
        preview = obj.question.question_text[:50] + "..."
        return preview
    question_preview.short_description = "Question"
    
    def is_correct_display(self, obj):
        if obj.is_correct:
            return format_html('<span style="color: #28a745;">✓ Correct</span>')
        return format_html('<span style="color: #dc3545;">✗ Wrong</span>')
    is_correct_display.short_description = "Result"




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


# ============================================================================
# BULK UPLOAD ADMINISTRATION
# ============================================================================

@admin.register(BulkUpload)
class BulkUploadAdmin(admin.ModelAdmin):
    """Admin interface for BulkUpload model"""
    list_display = [
        'id', 'upload_type', 'uploaded_by', 'status',
        'total_records', 'successful_records', 'failed_records',
        'success_rate_display', 'created_at'
    ]
    list_filter = ['upload_type', 'status', 'created_at']
    search_fields = ['uploaded_by__username', 'error_log']
    ordering = ['-created_at']
    readonly_fields = [
        'created_at', 'modified_at', 'deleted_at', 'created_by', 'modified_by', 'deleted_by',
        'uploaded_by', 'total_records', 'successful_records', 'failed_records',
        'status', 'error_log', 'success_rate_display'
    ]
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Upload Information', {
            'fields': ('upload_type', 'file', 'uploaded_by')
        }),
        ('Processing Stats', {
            'fields': (
                'status', 'total_records', 'successful_records',
                'failed_records', 'success_rate_display'
            )
        }),
        ('Error Details', {
            'fields': ('error_log',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'modified_at'),
            'classes': ('collapse',)
        }),
    )
    
    def success_rate_display(self, obj):
        rate = obj.success_rate
        if rate >= 90:
            color = '#28a745'
        elif rate >= 70:
            color = '#ffc107'
        else:
            color = '#dc3545'
        return format_html('<span style="color: {}; font-weight: bold;">{}%</span>', color, rate)
    success_rate_display.short_description = "Success Rate"
    
    def has_add_permission(self, request):
        # Prevent manual creation via admin
        return False