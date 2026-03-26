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



# # ============================================================================
# # QUESTION MANAGEMENT
# # ============================================================================

class Question(BaseModel):
    """
    Question Model
    
    Stores individual exam questions with multiple choice options.
    Questions can be added manually or via bulk upload (Excel/CSV).
    
    Features:
    - Multiple choice format (4 options: A, B, C, D)
    - Difficulty levels
    - Categorization
    - Mark allocation
    - Correct answer tracking
    """
    
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    exam_module = models.ForeignKey(
        ExamModule,
        on_delete=models.CASCADE,
        related_name='questions',
        help_text="Exam this question belongs to"
    )
    question_text = models.TextField(
        help_text="The question text"
    )
    option_a = models.CharField(
        max_length=500,
        help_text="Option A"
    )
    option_b = models.CharField(
        max_length=500,
        help_text="Option B"
    )
    option_c = models.CharField(
        max_length=500,
        help_text="Option C"
    )
    option_d = models.CharField(
        max_length=500,
        help_text="Option D"
    )
    correct_answer = models.CharField(
        max_length=1,
        choices=[('A', 'Option A'), ('B', 'Option B'), ('C', 'Option C'), ('D', 'Option D')],
        help_text="The correct answer option"
    )
    difficulty = models.CharField(
        max_length=10,
        choices=DIFFICULTY_CHOICES,
        default='medium',
        help_text="Question difficulty level"
    )
    category = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Question category or topic (optional)"
    )
    marks = models.IntegerField(
        validators=[MinValueValidator(1)],
        default=1,
        help_text="Marks allocated to this question"
    )
    explanation = models.TextField(
        blank=True,
        null=True,
        help_text="Explanation for the correct answer (optional)"
    )
    order = models.IntegerField(
        default=0,
        help_text="Display order (0 for default ordering)"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this question is active"
    )
    
    class Meta:
        verbose_name = "Question"
        verbose_name_plural = "Questions"
        ordering = ['exam_module', 'order', 'created_at']
        indexes = [
            models.Index(fields=['exam_module', 'is_active']),
        ]
    
    def __str__(self):
        return f"Q{self.id}: {self.question_text[:50]}..."
    
    @property
    def options(self):
        """Returns all options as a dictionary"""
        return {
            'A': self.option_a,
            'B': self.option_b,
            'C': self.option_c,
            'D': self.option_d,
        }


# ============================================================================
# EXAM ATTEMPTS & RESULTS
# ============================================================================

class ExamAttempt(BaseModel):
    """
    Exam Attempt Model
    
    Tracks individual student attempts at exams.
    Records answers, scores, and timing information.
    
    Features:
    - Attempt tracking (1st, 2nd, 3rd attempt)
    - Answer recording
    - Auto-scoring
    - Time tracking
    - Status management
    """
    
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    ]
    
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='exam_attempts',
        help_text="Student taking the exam"
    )
    exam_module = models.ForeignKey(
        ExamModule,
        on_delete=models.CASCADE,
        related_name='exam_attempts',
        help_text="Exam being attempted"
    )
    attempt_number = models.IntegerField(
        default=1,
        help_text="Attempt number (1, 2, 3, etc.)"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='in_progress',
        help_text="Current status of the attempt"
    )
    start_time = models.DateTimeField(
        auto_now_add=True,
        help_text="When the exam was started"
    )
    end_time = models.DateTimeField(
        blank=True,
        null=True,
        help_text="When the exam was completed"
    )
    time_taken_seconds = models.IntegerField(
        blank=True,
        null=True,
        help_text="Total time taken in seconds"
    )
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Final score percentage (0-100)"
    )
    total_questions = models.IntegerField(
        default=0,
        help_text="Total number of questions in the exam"
    )
    correct_answers = models.IntegerField(
        default=0,
        help_text="Number of correct answers"
    )
    wrong_answers = models.IntegerField(
        default=0,
        help_text="Number of wrong answers"
    )
    unanswered = models.IntegerField(
        default=0,
        help_text="Number of unanswered questions"
    )
    passed = models.BooleanField(
        default=False,
        help_text="Whether the student passed the exam"
    )
    
    class Meta:
        verbose_name = "Exam Attempt"
        verbose_name_plural = "Exam Attempts"
        ordering = ['-start_time']
        unique_together = ['student', 'exam_module', 'attempt_number']
        indexes = [
            models.Index(fields=['student', 'exam_module']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.student.full_name} - {self.exam_module.title} (Attempt {self.attempt_number})"
    
    @property
    def grade(self):
        """Calculate letter grade based on score"""
        if self.score is None:
            return 'N/A'
        
        score = float(self.score)
        if score >= 90:
            return 'A+'
        elif score >= 80:
            return 'A'
        elif score >= 70:
            return 'B'
        elif score >= 60:
            return 'C'
        elif score >= 50:
            return 'D'
        else:
            return 'F'
    
    def calculate_score(self):
        """Calculate and update the score based on answers"""
        answers = self.student_answers.all()
        total = answers.count()
        correct = answers.filter(is_correct=True).count()
        
        self.total_questions = total
        self.correct_answers = correct
        self.wrong_answers = total - correct
        
        if total > 0:
            self.score = (correct / total) * 100
            self.passed = self.score >= self.exam_module.passing_score
        
        self.save()


class StudentAnswer(BaseModel):
    """
    Student Answer Model
    
    Records individual answers for each question in an exam attempt.
    Links student responses to questions and tracks correctness.
    
    Features:
    - Question-answer linking
    - Automatic correctness checking
    - Answer timestamp
    """
    
    exam_attempt = models.ForeignKey(
        ExamAttempt,
        on_delete=models.CASCADE,
        related_name='student_answers',
        help_text="The exam attempt this answer belongs to"
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='student_answers',
        help_text="The question being answered"
    )
    selected_answer = models.CharField(
        max_length=1,
        choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')],
        blank=True,
        null=True,
        help_text="Student's selected answer"
    )
    is_correct = models.BooleanField(
        default=False,
        help_text="Whether the answer is correct"
    )
    answered_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the answer was submitted"
    )
    
    class Meta:
        verbose_name = "Student Answer"
        verbose_name_plural = "Student Answers"
        unique_together = ['exam_attempt', 'question']
        ordering = ['question__order']
    
    def __str__(self):
        return f"{self.exam_attempt.student.full_name} - Q{self.question.id}"
    
    def save(self, *args, **kwargs):
        """Override save to automatically check if answer is correct"""
        if self.selected_answer:
            self.is_correct = (self.selected_answer == self.question.correct_answer)
        super().save(*args, **kwargs)



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


# ============================================================================
# BULK UPLOAD TRACKING
# ============================================================================

class BulkUpload(BaseModel):
    """
    Bulk Upload Model
    
    Tracks bulk uploads of students, questions, and other data via Excel/CSV files.
    
    Features:
    - Upload history tracking
    - Success/failure metrics
    - Error logging
    - File archiving
    """
    
    UPLOAD_TYPE_CHOICES = [
        ('students', 'Students'),
        ('questions', 'Questions'),
        ('exams', 'Exams'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    upload_type = models.CharField(
        max_length=20,
        choices=UPLOAD_TYPE_CHOICES,
        help_text="Type of data being uploaded"
    )
    file = models.FileField(
        upload_to='bulk_uploads/%Y/%m/',
        help_text="Uploaded file"
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='bulk_uploads',
        help_text="Admin user who uploaded the file"
    )
    total_records = models.IntegerField(
        default=0,
        help_text="Total number of records in the file"
    )
    successful_records = models.IntegerField(
        default=0,
        help_text="Number of successfully processed records"
    )
    failed_records = models.IntegerField(
        default=0,
        help_text="Number of failed records"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="Current processing status"
    )
    error_log = models.TextField(
        blank=True,
        null=True,
        help_text="Error details and messages"
    )
    
    class Meta:
        verbose_name = "Bulk Upload"
        verbose_name_plural = "Bulk Uploads"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['upload_type', 'status']),
            models.Index(fields=['uploaded_by']),
        ]
    
    def __str__(self):
        return f"{self.get_upload_type_display()} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    @property
    def success_rate(self):
        """Calculate success rate percentage"""
        if self.total_records == 0:
            return 0
        return round((self.successful_records / self.total_records) * 100, 2)