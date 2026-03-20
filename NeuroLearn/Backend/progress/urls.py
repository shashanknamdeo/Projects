from django.urls import path
from .views import UserProgressView, WeakTopicsView

urlpatterns = [
    path('', UserProgressView.as_view(), name='user_progress'),
    path('weak-topics/', WeakTopicsView.as_view(), name='weak_topics'),
]
