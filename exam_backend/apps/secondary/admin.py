# """
# Core App Admin Configuration
# =============================

# Django admin interface configuration for all Core app models.
# Provides user-friendly interfaces for managing:
# - Admin users
# - Students
# - Levels
# - Exam modules
# - Questions
# - Results
# - System settings
# - Bulk uploads
# """

# from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin
# from django.utils.html import format_html
# from django.urls import reverse
# from django.utils.safestring import mark_safe
# from .models import (
#      Level, Student, ExamModule, Question,
#     ExamAttempt, StudentAnswer, SystemSettings, BulkUpload
# )



# # ============================================================================
# # LEVEL ADMINISTRATION
# # ============================================================================

# @admin.register(Level)
# class LevelAdmin(admin.ModelAdmin):
#     """Admin interface for Level model"""
#     list_display = ['name', 'code', 'level_type', 'student_count_display', 'is_active', 'created_at']
#     list_filter = ['level_type', 'is_active', 'created_at']
#     search_fields = ['name', 'code']
#     ordering = ['level_type', 'name']
#     readonly_fields = ['created_at', 'updated_at']
    
#     fieldsets = (
#         ('Basic Information', {
#             'fields': ('name', 'code', 'level_type', 'description')
#         }),
#         ('Status', {
#             'fields': ('is_active',)
#         }),
#         ('Timestamps', {
#             'fields': ('created_at', 'updated_at'),
#             'classes': ('collapse',)
#         }),
#     )
    
#     def student_count_display(self, obj):
#         count = obj.student_count
#         url = reverse('admin:core_student_changelist') + f'?level__id__exact={obj.id}'
#         return format_html('<a href="{}">{} students</a>', url, count)
#     student_count_display.short_description = "Students"


# # ============================================================================
# # STUDENT ADMINISTRATION
# # ============================================================================

# @admin.register(Student)
# class StudentAdmin(admin.ModelAdmin):
#     """Admin interface for Student model"""
#     list_display = [
#         'student_id', 'full_name', 'level', 'email', 
#         'is_active', 'completed_exams_display', 'average_score_display',
#         'registration_date'
#     ]
#     list_filter = ['level', 'is_active', 'uploaded_via_bulk', 'gender', 'registration_date']
#     search_fields = ['full_name', 'student_id', 'email']
#     ordering = ['-registration_date']
#     readonly_fields = ['registration_date', 'last_login', 'created_at', 'updated_at']
#     date_hierarchy = 'registration_date'
    
#     fieldsets = (
#         ('Basic Information', {
#             'fields': ('full_name', 'student_id', 'level')
#         }),
#         ('Contact Information', {
#             'fields': ('email', 'phone_number')
#         }),
#         ('Personal Information', {
#             'fields': ('date_of_birth', 'gender'),
#             'classes': ('collapse',)
#         }),
#         ('Status & Tracking', {
#             'fields': ('is_active', 'last_login', 'uploaded_via_bulk')
#         }),
#         ('Timestamps', {
#             'fields': ('registration_date', 'created_at', 'updated_at'),
#             'classes': ('collapse',)
#         }),
#     )
    
#     actions = ['activate_students', 'deactivate_students']
    
#     def completed_exams_display(self, obj):
#         count = obj.completed_exams_count
#         return format_html('<span style="color: #00a8cc;">{}</span>', count)
#     completed_exams_display.short_description = "Completed Exams"
    
#     def average_score_display(self, obj):
#         avg = obj.average_score
#         color = '#28a745' if avg >= 60 else '#dc3545'
#         return format_html('<span style="color: {}; font-weight: bold;">{}%</span>', color, avg)
#     average_score_display.short_description = "Avg Score"
    
#     def activate_students(self, request, queryset):
#         updated = queryset.update(is_active=True)
#         self.message_user(request, f'{updated} student(s) activated successfully.')
#     activate_students.short_description = "Activate selected students"
    
#     def deactivate_students(self, request, queryset):
#         updated = queryset.update(is_active=False)
#         self.message_user(request, f'{updated} student(s) deactivated successfully.')
#     deactivate_students.short_description = "Deactivate selected students"


# # ============================================================================
# # EXAM MODULE ADMINISTRATION
# # ============================================================================

# @admin.register(ExamModule)
# class ExamModuleAdmin(admin.ModelAdmin):
#     """Admin interface for ExamModule model"""
#     list_display = [
#         'code', 'title', 'level', 'duration_minutes',
#         'passing_score', 'questions_display', 'attempts_display',
#         'is_active', 'availability_status'
#     ]
#     list_filter = ['level', 'is_active', 'created_at', 'randomize_questions']
#     search_fields = ['title', 'code', 'description']
#     ordering = ['-created_at']
#     readonly_fields = ['created_at', 'updated_at', 'questions_summary', 'attempts_summary']
#     date_hierarchy = 'created_at'
    
#     fieldsets = (
#         ('Basic Information', {
#             'fields': ('title', 'code', 'description', 'level')
#         }),
#         ('Exam Settings', {
#             'fields': (
#                 'duration_minutes', 'passing_score', 'max_attempts',
#                 'randomize_questions', 'show_correct_answers'
#             )
#         }),
#         ('Availability', {
#             'fields': ('is_active', 'start_date', 'end_date')
#         }),
#         ('Administration', {
#             'fields': ('created_by',)
#         }),
#         ('Statistics', {
#             'fields': ('questions_summary', 'attempts_summary'),
#             'classes': ('collapse',)
#         }),
#         ('Timestamps', {
#             'fields': ('created_at', 'updated_at'),
#             'classes': ('collapse',)
#         }),
#     )
    
#     actions = ['activate_exams', 'deactivate_exams']
    
#     def questions_display(self, obj):
#         count = obj.total_questions
#         marks = obj.total_marks
#         url = reverse('admin:core_question_changelist') + f'?exam_module__id__exact={obj.id}'
#         return format_html('<a href="{}">{} questions ({} marks)</a>', url, count, marks)
#     questions_display.short_description = "Questions"
    
#     def attempts_display(self, obj):
#         count = obj.attempts_count
#         url = reverse('admin:core_examattempt_changelist') + f'?exam_module__id__exact={obj.id}'
#         return format_html('<a href="{}">{} attempts</a>', url, count)
#     attempts_display.short_description = "Attempts"
    
#     def availability_status(self, obj):
#         if obj.is_available:
#             return format_html('<span style="color: #28a745;">● Available</span>')
#         return format_html('<span style="color: #dc3545;">● Unavailable</span>')
#     availability_status.short_description = "Status"
    
#     def questions_summary(self, obj):
#         return f"Total: {obj.total_questions} questions | Total Marks: {obj.total_marks}"
#     questions_summary.short_description = "Questions Summary"
    
#     def attempts_summary(self, obj):
#         return f"Total Attempts: {obj.attempts_count}"
#     attempts_summary.short_description = "Attempts Summary"
    
#     def activate_exams(self, request, queryset):
#         updated = queryset.update(is_active=True)
#         self.message_user(request, f'{updated} exam(s) activated successfully.')
#     activate_exams.short_description = "Activate selected exams"
    
#     def deactivate_exams(self, request, queryset):
#         updated = queryset.update(is_active=False)
#         self.message_user(request, f'{updated} exam(s) deactivated successfully.')
#     deactivate_exams.short_description = "Deactivate selected exams"


# # ============================================================================
# # QUESTION ADMINISTRATION
# # ============================================================================

# @admin.register(Question)
# class QuestionAdmin(admin.ModelAdmin):
#     """Admin interface for Question model"""
#     list_display = [
#         'id', 'question_preview', 'exam_module', 'correct_answer',
#         'difficulty', 'marks', 'is_active'
#     ]
#     list_filter = ['exam_module', 'difficulty', 'is_active', 'created_at']
#     search_fields = ['question_text', 'category']
#     ordering = ['exam_module', 'order', 'created_at']
#     readonly_fields = ['created_at', 'updated_at']
    
#     fieldsets = (
#         ('Question', {
#             'fields': ('exam_module', 'question_text', 'order')
#         }),
#         ('Options', {
#             'fields': ('option_a', 'option_b', 'option_c', 'option_d', 'correct_answer')
#         }),
#         ('Metadata', {
#             'fields': ('difficulty', 'category', 'marks', 'explanation')
#         }),
#         ('Status', {
#             'fields': ('is_active',)
#         }),
#         ('Timestamps', {
#             'fields': ('created_at', 'updated_at'),
#             'classes': ('collapse',)
#         }),
#     )
    
#     actions = ['activate_questions', 'deactivate_questions']
    
#     def question_preview(self, obj):
#         preview = obj.question_text[:60] + "..." if len(obj.question_text) > 60 else obj.question_text
#         return preview
#     question_preview.short_description = "Question"
    
#     def activate_questions(self, request, queryset):
#         updated = queryset.update(is_active=True)
#         self.message_user(request, f'{updated} question(s) activated successfully.')
#     activate_questions.short_description = "Activate selected questions"
    
#     def deactivate_questions(self, request, queryset):
#         updated = queryset.update(is_active=False)
#         self.message_user(request, f'{updated} question(s) deactivated successfully.')
#     deactivate_questions.short_description = "Deactivate selected questions"


# # ============================================================================
# # EXAM ATTEMPT ADMINISTRATION
# # ============================================================================

# @admin.register(ExamAttempt)
# class ExamAttemptAdmin(admin.ModelAdmin):
#     """Admin interface for ExamAttempt model"""
#     list_display = [
#         'id', 'student', 'exam_module', 'attempt_number',
#         'status', 'score_display', 'grade_display', 'passed',
#         'start_time'
#     ]
#     list_filter = ['status', 'passed', 'exam_module', 'start_time']
#     search_fields = ['student__full_name', 'student__student_id', 'exam_module__title']
#     ordering = ['-start_time']
#     readonly_fields = [
#         'start_time', 'end_time', 'time_taken_seconds',
#         'created_at', 'updated_at', 'grade_display'
#     ]
#     date_hierarchy = 'start_time'
    
#     fieldsets = (
#         ('Exam Information', {
#             'fields': ('student', 'exam_module', 'attempt_number', 'status')
#         }),
#         ('Time Tracking', {
#             'fields': ('start_time', 'end_time', 'time_taken_seconds')
#         }),
#         ('Results', {
#             'fields': (
#                 'score', 'grade_display', 'passed',
#                 'total_questions', 'correct_answers',
#                 'wrong_answers', 'unanswered'
#             )
#         }),
#         ('Timestamps', {
#             'fields': ('created_at', 'updated_at'),
#             'classes': ('collapse',)
#         }),
#     )
    
#     def score_display(self, obj):
#         if obj.score is None:
#             return "-"
#         color = '#28a745' if obj.passed else '#dc3545'
#         return format_html('<span style="color: {}; font-weight: bold;">{}%</span>', color, obj.score)
#     score_display.short_description = "Score"
    
#     def grade_display(self, obj):
#         grade = obj.grade
#         color_map = {
#             'A+': '#28a745', 'A': '#28a745', 'B': '#17a2b8',
#             'C': '#ffc107', 'D': '#fd7e14', 'F': '#dc3545', 'N/A': '#6c757d'
#         }
#         color = color_map.get(grade, '#6c757d')
#         return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, grade)
#     grade_display.short_description = "Grade"


# # ============================================================================
# # STUDENT ANSWER ADMINISTRATION
# # ============================================================================

# @admin.register(StudentAnswer)
# class StudentAnswerAdmin(admin.ModelAdmin):
#     """Admin interface for StudentAnswer model"""
#     list_display = [
#         'id', 'exam_attempt', 'question_preview',
#         'selected_answer', 'is_correct_display', 'answered_at'
#     ]
#     list_filter = ['is_correct', 'answered_at', 'exam_attempt__exam_module']
#     search_fields = ['exam_attempt__student__full_name', 'question__question_text']
#     ordering = ['-answered_at']
#     readonly_fields = ['answered_at', 'created_at', 'updated_at']
    
#     def question_preview(self, obj):
#         preview = obj.question.question_text[:50] + "..."
#         return preview
#     question_preview.short_description = "Question"
    
#     def is_correct_display(self, obj):
#         if obj.is_correct:
#             return format_html('<span style="color: #28a745;">✓ Correct</span>')
#         return format_html('<span style="color: #dc3545;">✗ Wrong</span>')
#     is_correct_display.short_description = "Result"


# # ============================================================================
# # SYSTEM SETTINGS ADMINISTRATION
# # ============================================================================

# @admin.register(SystemSettings)
# class SystemSettingsAdmin(admin.ModelAdmin):
#     """Admin interface for SystemSettings model (Singleton)"""
#     list_display = ['institution_name', 'system_title', 'admin_email']
#     readonly_fields = ['created_at', 'updated_at']
    
#     fieldsets = (
#         ('Branding & General', {
#             'fields': ('institution_name', 'system_title', 'logo')
#         }),
#         ('Contact Information', {
#             'fields': ('admin_email', 'support_email', 'contact_phone')
#         }),
#         ('Default Exam Settings', {
#             'fields': (
#                 'default_exam_duration', 'default_passing_percentage',
#                 'default_max_attempts'
#             )
#         }),
#         ('Question Settings', {
#             'fields': (
#                 'randomize_questions_default', 'show_correct_answers_default',
#                 'allow_question_review', 'commence_exam_immediately'
#             )
#         }),
#         ('Security Settings', {
#             'fields': (
#                 'browser_restrictions', 'fullscreen_enforcement',
#                 'copy_paste_prevention', 'right_click_disabled',
#                 'keyboard_shortcuts_disabled'
#             )
#         }),
#         ('Timestamps', {
#             'fields': ('created_at', 'updated_at'),
#             'classes': ('collapse',)
#         }),
#     )
    
#     def has_add_permission(self, request):
#         # Only allow one instance
#         return not SystemSettings.objects.exists()
    
#     def has_delete_permission(self, request, obj=None):
#         # Don't allow deletion of settings
#         return False


# # ============================================================================
# # BULK UPLOAD ADMINISTRATION
# # ============================================================================

# @admin.register(BulkUpload)
# class BulkUploadAdmin(admin.ModelAdmin):
#     """Admin interface for BulkUpload model"""
#     list_display = [
#         'id', 'upload_type', 'uploaded_by', 'status',
#         'success_rate_display', 'total_rows', 'successful_rows',
#         'failed_rows', 'created_at'
#     ]
#     list_filter = ['upload_type', 'status', 'created_at']
#     search_fields = ['uploaded_by__username']
#     ordering = ['-created_at']
#     readonly_fields = ['created_at', 'updated_at', 'processed_at', 'success_rate_display']
#     date_hierarchy = 'created_at'
    
#     fieldsets = (
#         ('Upload Information', {
#             'fields': ('upload_type', 'file', 'exam_module', 'level', 'uploaded_by')
#         }),
#         ('Processing Status', {
#             'fields': ('status', 'total_rows', 'successful_rows', 'failed_rows', 'success_rate_display')
#         }),
#         ('Error Details', {
#             'fields': ('error_log',),
#             'classes': ('collapse',)
#         }),
#         ('Timestamps', {
#             'fields': ('created_at', 'processed_at', 'updated_at'),
#             'classes': ('collapse',)
#         }),
#     )
    
#     def success_rate_display(self, obj):
#         rate = obj.success_rate
#         color = '#28a745' if rate >= 90 else '#ffc107' if rate >= 70 else '#dc3545'
#         return format_html('<span style="color: {}; font-weight: bold;">{}%</span>', color, rate)
#     success_rate_display.short_description = "Success Rate"
