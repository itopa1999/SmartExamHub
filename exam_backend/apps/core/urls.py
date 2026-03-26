from django.urls import path, include
from .views import *

urlpatterns = [
    path(
        "admin/",
        include(
            [
                path("login/", LoginView.as_view()),
                path("profile/", GetUserProfileView.as_view()),
                path("dashboard/stats/", DashboardStatsView.as_view()),
                
                # Levels
                path("levels/", ListLevelsView.as_view()),
                
                # Exams
                path("exams/", ListExamsView.as_view()),
                path("exams/create/", CreateExamView.as_view()),
                path("exams/<int:exam_id>/", ExamDetailView.as_view()),
            ]
        )
    ),
]
