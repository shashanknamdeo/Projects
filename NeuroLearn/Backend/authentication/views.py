# from django.shortcuts import render

# Addition
from rest_framework import generics
from django.contrib.auth.models import User
from .serializers import RegisterSerializer
from rest_framework.permissions import AllowAny

class RegisterView(generics.CreateAPIView):
    """
    internal flow:
        RegisterView
            CreateAPIView (Final Layer)
                CreateModelMixin
                    GenericAPIView
                        APIView (Base Layer)
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class TestAuthView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "message": "You are authenticated"
        })