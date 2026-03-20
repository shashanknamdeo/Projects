from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()
from .serializers import RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer, UserProfileUpdateSerializer
from activity_log.models import ActivityLog

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        ActivityLog.objects.create(
            user=user,
            action="User Registered",
            details={"phone_number": user.phone_number, "email": user.email}
        )

from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        login_id = request.data.get('username') or request.data.get('phone_number')
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == status.HTTP_200_OK:
            # We need to find the user again to log the activity
            user = User.objects.filter(Q(phone_number=login_id) | Q(email=login_id)).first()
            if user:
                ActivityLog.objects.create(
                    user=user,
                    action="User Logged In",
                    details={"login_id": login_id}
                )
        return response

class ProfileView(generics.RetrieveUpdateAPIView):
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserProfileUpdateSerializer
        return UserSerializer
    
    def get_object(self):
        # The UserSerializer and UserProfileUpdateSerializer both reach different models.
        # Profile update needs the UserProfile instance.
        if self.request.method in ['PUT', 'PATCH']:
            return self.request.user.profile
        return self.request.user
