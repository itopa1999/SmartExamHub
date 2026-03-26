from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ExamModule, Question, Level, BulkUpload

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    
    
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']


class LevelSerializer(serializers.ModelSerializer):
    """Serializer for Level model"""
    student_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Level
        fields = ['id', 'name', 'level_type', 'code', 'description', 'is_active', 'student_count']
        read_only_fields = ['id', 'student_count']


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for Question model"""
    options = serializers.ReadOnlyField()
    
    class Meta:
        model = Question
        fields = [
            'id', 'exam_module', 'question_text', 'option_a', 'option_b', 
            'option_c', 'option_d', 'correct_answer', 'difficulty', 'category',
            'marks', 'explanation', 'order', 'is_active', 'options'
        ]
        read_only_fields = ['id', 'options']


class ExamModuleSerializer(serializers.ModelSerializer):
    """Serializer for ExamModule model"""
    level_name = serializers.CharField(source='level.name', read_only=True)
    total_questions = serializers.ReadOnlyField()
    total_marks = serializers.ReadOnlyField()
    attempts_count = serializers.ReadOnlyField()
    
    class Meta:
        model = ExamModule
        fields = [
            'id', 'title', 'description', 'code', 'level', 'level_name',
            'duration_minutes', 'passing_score', 'max_attempts',
            'randomize_questions', 'show_correct_answers', 'is_active',
            'total_questions', 'total_marks', 'attempts_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'level_name', 'total_questions', 'total_marks', 'attempts_count']


class ExamCreationSerializer(serializers.Serializer):
    """Serializer for creating exam with questions via file upload"""
    title = serializers.CharField(max_length=300, required=True)
    description = serializers.CharField(required=False, allow_blank=True)
    code = serializers.CharField(max_length=50, required=True)
    level_id = serializers.IntegerField(required=True)
    duration_minutes = serializers.IntegerField(default=60, min_value=1, max_value=300)
    passing_score = serializers.IntegerField(default=60, min_value=0, max_value=100)
    max_attempts = serializers.IntegerField(default=1, min_value=1, max_value=10)
    randomize_questions = serializers.BooleanField(default=True)
    show_correct_answers = serializers.BooleanField(default=True)
    is_active = serializers.BooleanField(default=False)
    file = serializers.FileField(required=True)
    
    def validate_level_id(self, value):
        """Check if level exists"""
        try:
            Level.objects.get(id=value, is_active=True)
        except Level.DoesNotExist:
            raise serializers.ValidationError("Invalid level ID or level is not active")
        return value
    
    def validate_code(self, value):
        """Check if code is unique"""
        if ExamModule.objects.filter(code=value).exists():
            raise serializers.ValidationError("Exam code already exists")
        return value
    
    def validate_file(self, value):
        """Validate uploaded file"""
        allowed_extensions = ['.xlsx', '.xls', '.csv']
        file_name = value.name.lower()
        
        if not any(file_name.endswith(ext) for ext in allowed_extensions):
            raise serializers.ValidationError(
                "Invalid file type. Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed."
            )
        
        # Check file size (max 5MB)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size must not exceed 5MB")
        
        return value


class BulkUploadSerializer(serializers.ModelSerializer):
    """Serializer for BulkUpload model"""
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    
    class Meta:
        model = BulkUpload
        fields = [
            'id', 'upload_type', 'file', 'uploaded_by', 'uploaded_by_name',
            'total_records', 'successful_records', 'failed_records',
            'status', 'error_log', 'created_at'
        ]
        read_only_fields = ['id', 'uploaded_by_name', 'created_at']
    