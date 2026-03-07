
from django.urls import path
from .views import RegisterView
from .views import TestAuthView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('test-auth/', TestAuthView.as_view()),
]