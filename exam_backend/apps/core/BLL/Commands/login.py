from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User

from utils.base_result import BaseResultWithData


class LoginCommand:
    @staticmethod
    def execute(username, password):
        if not username or not password:
            return BaseResultWithData(
                status_code=400,
                message="Username and password are required",
                data={}
            )
        if User.objects.filter(username=username, is_active=True).exists() is False:
            return BaseResultWithData(
                status_code=400,
                message="User not found",
                data={}
            )
        user = authenticate(username=username, password=password)
        if user is None:
            return BaseResultWithData(
                status_code=400,
                message="Invalid credentials",
                data={}
            )
        
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        return BaseResultWithData(
            status_code=200,
            message="Login successful",
            data={
                "access_token": access_token,
                "refresh_token": refresh_token,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "username": user.username,
                "email": user.email,
            }
        )