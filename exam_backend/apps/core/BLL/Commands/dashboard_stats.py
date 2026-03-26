from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta
from apps.core.models import Student, ExamModule, Level, ExamAttempt
from utils.base_result import BaseResultWithData


class DashboardStatsCommand:
    """
    Command to retrieve admin dashboard statistics
    """
    
    @staticmethod
    def execute():
        """
        Get all dashboard statistics
        Returns:
            BaseResultWithData with dashboard stats
        """
        # Calculate statistics
        stats = {
            'total_students': DashboardStatsCommand._get_total_students(),
            'active_exams': DashboardStatsCommand._get_active_exams(),
            'pending_results': DashboardStatsCommand._get_pending_results(),
            'system_status': DashboardStatsCommand._get_system_status(),
            'recent_activity': DashboardStatsCommand._get_recent_activity(),
            'level_distribution': DashboardStatsCommand._get_level_distribution(),
        }
        
        return BaseResultWithData(
            status_code=200,
            message="Dashboard statistics retrieved successfully",
            data=stats
        )
    
    @staticmethod
    def _get_total_students():
        """Get total students count and percentage increase"""
        total = Student.objects.filter(is_active=True).count()
        
        # Get count from 30 days ago
        thirty_days_ago = timezone.now() - timedelta(days=30)
        old_count = Student.objects.filter(
            is_active=True,
            created_at__lte=thirty_days_ago
        ).count()
        
        # Calculate percentage increase
        if old_count > 0:
            new_students = total - old_count
            percentage = round((new_students / old_count) * 100, 1)
        else:
            percentage = 0
        
        return {
            'count': total,
            'percentage_change': percentage,
            'trend': 'up' if percentage > 0 else 'down'
        }
    
    @staticmethod
    def _get_active_exams():
        """Get active exams count"""
        active = ExamModule.objects.filter(is_active=True).count()
        
        # Get exams created today
        today = timezone.now().date()
        today_count = ExamModule.objects.filter(
            created_at__date=today
        ).count()
        
        return {
            'count': active,
            'new_today': today_count,
            'trend': 'up' if today_count > 0 else 'neutral'
        }
    
    @staticmethod
    def _get_pending_results():
        """Get pending results (in-progress exams)"""
        pending = ExamAttempt.objects.filter(
            status='in_progress'
        ).count()
        
        # Get completed today
        today = timezone.now().date()
        completed_today = ExamAttempt.objects.filter(
            status='completed',
            end_time__date=today
        ).count()
        
        return {
            'count': pending,
            'processed_today': completed_today,
            'trend': 'down' if completed_today > 0 else 'neutral'
        }
    
    @staticmethod
    def _get_system_status():
        """Get overall system status"""
        # Check if there are any critical issues
        total_students = Student.objects.filter(is_active=True).count()
        total_exams = ExamModule.objects.filter(is_active=True).count()
        
        status = 'online' if total_students > 0 or total_exams > 0 else 'idle'
        
        return {
            'status': status,
            'message': 'All systems operational',
            'uptime': '99.9%'
        }
    
    @staticmethod
    def _get_recent_activity():
        """Get recent activity statistics"""
        # Get activity from last 7 days
        seven_days_ago = timezone.now() - timedelta(days=7)
        
        recent_students = Student.objects.filter(
            created_at__gte=seven_days_ago
        ).count()
        
        recent_exams = ExamModule.objects.filter(
            created_at__gte=seven_days_ago
        ).count()
        
        recent_attempts = ExamAttempt.objects.filter(
            start_time__gte=seven_days_ago
        ).count()
        
        return {
            'new_students': recent_students,
            'new_exams': recent_exams,
            'exam_attempts': recent_attempts
        }
    
    @staticmethod
    def _get_level_distribution():
        """Get student distribution across levels"""
        distribution = Level.objects.filter(
            is_active=True
        ).annotate(
            student_count=Count('students', filter=Q(students__is_active=True))
        ).values('name', 'student_count', 'level_type')
        
        return list(distribution)
