
from apps.core.serializers import UserProfileSerializer
from utils.base_result import BaseResultWithData


class GetUserProfileCommand:
    @staticmethod
    def get(user):
        profile_data = {
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
        serializer = UserProfileSerializer(instance=profile_data)
        return BaseResultWithData(
            status_code=200,
            message="User profile retrieved successfully",
            data=serializer.data
        )