"""
Core App Models - SmartExam System
====================================

This module contains core models for the admin functionality including:
- Admin User Management
- Student Management (Secondary & Tertiary)
- Level/Class Management  
- Exam Module Management
- Question Bank Management
- Result Tracking
- System Settings

These models support:
1. Admin authentication and authorization
2. Student registration (single & bulk upload)
3. Exam creation with file upload (Excel/CSV)
4. Question management with multiple choice options
5. Result generation and reporting
6. System configuration settings
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from utils.base_model import BaseModel
from utils.enums import LevelType
from django.conf import settings
# ============================================================================
# LEVEL & STUDENT MANAGEMENT
# ============================================================================

class Level(BaseModel):
    """
    Academic Level/Class Model
    
    Represents different educational levels (Grade 1-12, Undergraduate, etc.)
    Used for categorizing students and exams.
    
    Examples:
    - Primary: Grade 1, Grade 2, ..., Grade 6
    - Secondary: Grade 7, Grade 8, ..., Grade 12
    - Tertiary: Undergraduate Year 1, Year 2, etc.
    """
    
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Name of the level (e.g., 'Grade 10', 'Year 1')"
    )
    level_type = models.CharField(
        max_length=20,
        choices=LevelType.choices(),
        help_text="Type of educational level"
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        help_text="Unique code for the level (e.g., 'G10', 'UG1')"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Optional description of the level"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this level is currently active"
    )
    
    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.name[:3].upper()
        super().save(*args, **kwargs)

    
    class Meta:
        verbose_name = "Academic Level"
        verbose_name_plural = "Academic Levels"
        ordering = ['level_type', 'name']  # Default ordering
        indexes = [
            models.Index(fields=['name']),        # Optimize searches by name
            models.Index(fields=['level_type']),  # Optimize filtering by level_type
            models.Index(fields=['is_active']),   # Optimize filtering active levels
        ]
    
    def __str__(self):
        return f"{self.name.capitalize()} ({self.get_level_type_display()})"
    
    @property
    def student_count(self):
        """Returns the number of students in this level"""
        return self.students.count()


class Student(BaseModel):
    """
    Student Model
    
    Stores student information for both Secondary and Tertiary levels.
    Supports both single and bulk registration from Excel/CSV files.
    
    Key Features:
    - Unique student ID for login authentication
    - Level/class assignment
    - Profile information
    - Registration tracking
    """
    
    full_name = models.CharField(
        max_length=200,
        help_text="Student's full name"
    )
    student_id = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        help_text="Unique student identifier used for login",
        null=True,
        blank=True
    )
    level = models.ForeignKey(
        Level,
        on_delete=models.PROTECT,
        related_name='students',
        help_text="Student's current academic level"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether the student account is active"
    )
    uploaded_via_bulk = models.BooleanField(
        default=False,
        help_text="True if student was added via bulk upload"
    )
    
    
    def save(self, *args, **kwargs):
        if not self.student_id:
            prefix = self.level.code.upper()
            
            count = Student.objects.filter(level=self.level).count() + 1
            self.student_id = f"{prefix}{str(count).zfill(3)}"
        
        super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = "Student"
        verbose_name_plural = "Students"
        ordering = ['level', 'full_name']  # Default ordering
        indexes = [
            models.Index(fields=['student_id']),
            models.Index(fields=['level', 'is_active']),
            models.Index(fields=['full_name']),
        ]
    
    def __str__(self):
        return f"{self.full_name} ({self.student_id})"
    
    @property
    def completed_exams_count(self):
        """Returns the number of exams completed by this student"""
        return self.exam_attempts.filter(status='completed').count()
    
    @property
    def average_score(self):
        """Calculates the student's average score across all completed exams"""
        from django.db.models import Avg
        avg = self.exam_attempts.filter(
            status='completed'
        ).aggregate(avg_score=Avg('score'))
        return round(avg['avg_score'] or 0, 2)


# ============================================================================
# EXAM MODULE MANAGEMENT
# ============================================================================

class ExamModule(BaseModel):
    """
    Exam Module Model
    
    Represents an exam/test module with associated questions.
    Created by admins and can be assigned to specific levels.
    
    Features:
    - Title and description
    - Level assignment (who can take this exam)
    - Time limits
    - Pass/fail thresholds
    - Activation controls
    - Question management
    """
    
    title = models.CharField(
        max_length=300,
        help_text="Exam title/name/subject (e.g., 'Mathematics Grade 10')"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Detailed description of the exam"
    )
    code = models.CharField(
        max_length=50,
        unique=True,
        help_text="Unique exam code (e.g., 'MATH101', 'ENG201')"
    )
    level = models.ForeignKey(
        Level,
        on_delete=models.PROTECT,
        related_name='exam_modules',
        help_text="Academic level this exam is for"
    )
    duration_minutes = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(300)],
        default=60,
        help_text="Exam duration in minutes"
    )
    passing_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=60,
        help_text="Minimum score percentage to pass (0-100)"
    )
    max_attempts = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        default=1,
        help_text="Maximum number of attempts allowed per student"
    )
    randomize_questions = models.BooleanField(
        default=True,
        help_text="Shuffle questions for each student"
    )
    show_correct_answers = models.BooleanField(
        default=True,
        help_text="Show correct answers after exam completion"
    )
    is_active = models.BooleanField(
        default=False,
        help_text="Whether this exam is currently available to students"
    )
    class Meta:
        verbose_name = "Exam Module"
        verbose_name_plural = "Exam Modules"
        ordering = ['-created_at']  # Newest first
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['level', 'is_active']),
            models.Index(fields=['title']),
        ]
        constraints = [
            models.UniqueConstraint(fields=['title', 'level'], name='unique_exam_per_level')
        ]
    
    def __str__(self):
        return f"{self.title} ({self.code})"
    
    @property
    def total_questions(self):
        """Returns the total number of questions in this exam"""
        return self.questions.count()
    
    @property
    def total_marks(self):
        """Returns the total marks for this exam"""
        from django.db.models import Sum
        total = self.questions.aggregate(total=Sum('marks'))
        return total['total'] or 0
    
    @property
    def attempts_count(self):
        """Returns the number of attempts made for this exam"""
        return self.exam_attempts.count()




# ============================================================================
# SYSTEM SETTINGS
# ============================================================================

class SystemSettings(BaseModel):
    """
    System Settings Model
    
    Stores global system configuration and preferences.
    Singleton model - only one instance should exist.
    
    Features:
    - Institution branding
    - Contact information
    - Default exam settings
    - Security settings
    - Feature toggles
    """
    
    # Branding & General
    institution_name = models.CharField(
        max_length=200,
        default="SmartExams University",
        help_text="Institution name displayed throughout the system"
    )
    system_title = models.CharField(
        max_length=200,
        default="SmartExam Portal",
        help_text="System title displayed in header"
    )
    logo = models.ImageField(
        upload_to='system/logos/',
        blank=True,
        null=True,
        help_text="System logo image"
    )
    
    # Contact Information
    admin_email = models.EmailField(
        default="admin@smartexams.edu",
        help_text="Primary admin email for notifications"
    )
    support_email = models.EmailField(
        default="support@smartexams.edu",
        help_text="Support email for user inquiries"
    )
    contact_phone = models.CharField(
        max_length=20,
        default="+1 (555) 123-4567",
        help_text="Contact phone number"
    )
    
    # Default Exam Settings
    default_exam_duration = models.IntegerField(
        default=60,
        validators=[MinValueValidator(5), MaxValueValidator(300)],
        help_text="Default exam duration in minutes"
    )
    default_passing_percentage = models.IntegerField(
        default=60,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Default passing percentage threshold"
    )
    default_max_attempts = models.IntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Default maximum attempts allowed"
    )
    
    # Question Settings
    randomize_questions_default = models.BooleanField(
        default=True,
        help_text="Default: Randomize question order"
    )
    show_correct_answers_default = models.BooleanField(
        default=True,
        help_text="Default: Show correct answers after exam"
    )
    allow_question_review = models.BooleanField(
        default=True,
        help_text="Allow students to review questions before submitting"
    )
    commence_exam_immediately = models.BooleanField(
        default=False,
        help_text="Start exam immediately or allow manual start"
    )
    
    # Security Settings
    browser_restrictions = models.BooleanField(
        default=True,
        help_text="Enable browser restrictions during exams"
    )
    fullscreen_enforcement = models.BooleanField(
        default=True,
        help_text="Force full-screen mode during exams"
    )
    copy_paste_prevention = models.BooleanField(
        default=True,
        help_text="Disable copy-paste during exams"
    )
    right_click_disabled = models.BooleanField(
        default=True,
        help_text="Disable right-click menu during exams"
    )
    keyboard_shortcuts_disabled = models.BooleanField(
        default=False,
        help_text="Prevent keyboard shortcuts during exams"
    )
    
    class Meta:
        verbose_name = "System Settings"
        verbose_name_plural = "System Settings"
        indexes = [
            models.Index(fields=['institution_name']),
            models.Index(fields=['system_title']),
        ]
    
    def __str__(self):
        return f"System Settings - {self.institution_name}"
    
    def save(self, *args, **kwargs):
        """Ensure only one instance exists (Singleton pattern)"""
        self.pk = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def load(cls):
        """Load the singleton instance, create if doesn't exist"""
        obj, created = cls.objects.get_or_create(pk=1)
        return obj