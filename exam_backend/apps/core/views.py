from rest_framework import generics
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from apps.core.BLL.Commands.profile import GetUserProfileCommand
from apps.core.BLL.Commands.dashboard_stats import DashboardStatsCommand
from apps.core.BLL.Commands.create_exam import CreateExamCommand
from apps.core.BLL.Commands.edit_exam import EditExamCommand
from .serializers import (
    LoginSerializer, 
    UserProfileSerializer, 
    ExamCreationSerializer,
    ExamModuleSerializer,
    LevelSerializer
)
from rest_framework.permissions import AllowAny as allow_any
from rest_framework.permissions import IsAuthenticated

from apps.core.BLL.Commands.login import LoginCommand
from utils.permissions import IsAdminPermission
from apps.core.models import ExamModule, Level
# Create your views here.


class LoginView(generics.GenericAPIView):
    authentication_classes = []
    permission_classes = [allow_any]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        result = LoginCommand.execute(username, password)
        return Response(data=result.to_dict(), status=result.status_code)
    
    

class GetUserProfileView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminPermission]
    serializer_class = UserProfileSerializer
    def get(self, request, *args, **kwargs):        
        user = request.user
        
        result = GetUserProfileCommand.get(user)
        return Response(data=result.to_dict(), status=result.status_code)


class DashboardStatsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminPermission]
    
    def get(self, request, *args, **kwargs):
        result = DashboardStatsCommand.execute()
        return Response(data=result.to_dict(), status=result.status_code)


class ListLevelsView(generics.GenericAPIView):
    """
    GET: List all active academic levels
    """
    permission_classes = [IsAuthenticated, IsAdminPermission]
    serializer_class = LevelSerializer
    
    def get(self, request, *args, **kwargs):
        levels = Level.objects.filter(is_active=True).order_by('level_type', 'name')
        serializer = self.get_serializer(levels, many=True)
        return Response({
            'success': True,
            'message': 'Levels retrieved successfully',
            'data': serializer.data
        }, status=200)


class CreateExamView(generics.GenericAPIView):
    """
    POST: Create new exam with questions via file upload
    
    Expected file format (Excel/CSV):
    - Required columns: question_text, option_a, option_b, option_c, option_d, correct_answer
    - Optional columns: difficulty, category, marks, explanation, order
    """
    permission_classes = [IsAuthenticated, IsAdminPermission]
    serializer_class = ExamCreationSerializer
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Extract validated data
            validated_data = serializer.validated_data
            file = validated_data.pop('file')
            
            # Execute command
            command = CreateExamCommand(
                data=validated_data,
                file=file,
                user=request.user
            )
            result = command.execute()
            
            return Response(data=result.to_dict(), status=result.status_code)
        except Exception as e:
            # Log the error for debugging
            import traceback
            traceback.print_exc()
            
            return Response({
                'success': False,
                'message': f'Server error: {str(e)}',
                'error': str(e)
            }, status=500)


class ListExamsView(generics.GenericAPIView):
    """
    GET: List all exams
    """
    permission_classes = [IsAuthenticated, IsAdminPermission]
    serializer_class = ExamModuleSerializer
    
    def get(self, request, *args, **kwargs):
        exams = ExamModule.objects.all().order_by('-created_at')
        serializer = self.get_serializer(exams, many=True)
        return Response({
            'success': True,
            'message': 'Exams retrieved successfully',
            'data': serializer.data
        }, status=200)


class ExamDetailView(generics.GenericAPIView):
    """
    GET: Get exam details
    PUT/PATCH: Update exam details (with optional file upload to add/replace questions)
    DELETE: Delete exam
    """
    permission_classes = [IsAuthenticated, IsAdminPermission]
    serializer_class = ExamModuleSerializer
    parser_classes = [MultiPartParser, FormParser]
    
    def get(self, request, exam_id, *args, **kwargs):
        try:
            exam = ExamModule.objects.get(id=exam_id)
            serializer = self.get_serializer(exam)
            
            # Also include questions
            questions = exam.questions.all().values(
                'id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d',
                'correct_answer', 'difficulty', 'category', 'marks', 'explanation', 'order'
            )
            
            response_data = serializer.data
            response_data['questions'] = list(questions)
            
            return Response({
                'success': True,
                'message': 'Exam retrieved successfully',
                'data': response_data
            }, status=200)
        except ExamModule.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Exam not found'
            }, status=404)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'message': f'Error: {str(e)}'
            }, status=500)
    
    def put(self, request, exam_id, *args, **kwargs):
        """Update exam - can include file to add/replace questions"""
        try:
            # Get mode from request (update or replace)
            mode = request.data.get('mode', 'update')  # 'update' = add new, 'replace' = delete all + add new
            
            # Extract file if present
            file = request.FILES.get('file')
            
            # Get exam data
            exam_data = {}
            for key in ['title', 'description', 'level_id', 'duration_minutes', 
                       'passing_score', 'max_attempts', 'randomize_questions', 
                       'show_correct_answers', 'is_active']:
                if key in request.data:
                    exam_data[key] = request.data[key]
            
            # Execute edit command
            command = EditExamCommand(
                exam_id=exam_id,
                data=exam_data,
                file=file,
                user=request.user,
                mode=mode
            )
            result = command.execute()
            
            return Response(data=result.to_dict(), status=result.status_code)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'message': f'Error updating exam: {str(e)}'
            }, status=500)
    
    def delete(self, request, exam_id, *args, **kwargs):
        """Delete exam"""
        try:
            exam = ExamModule.objects.get(id=exam_id)
            exam_title = exam.title
            exam.delete()
            
            return Response({
                'success': True,
                'message': f'Exam "{exam_title}" deleted successfully'
            }, status=200)
        except ExamModule.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Exam not found'
            }, status=404)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'message': f'Error deleting exam: {str(e)}'
            }, status=500)
        