from django.urls import path
from .views import LessonDetailView, LessonStartView

urlpatterns = [
    path('<int:pk>/', LessonDetailView.as_view(), name='lesson_detail'),
    path('<int:pk>/start/', LessonStartView.as_view(), name='lesson_start'),
]
