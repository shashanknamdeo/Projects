from django.urls import path
from .views import QuizQuestionListView, QuizSubmitView

urlpatterns = [
    path('questions/', QuizQuestionListView.as_view(), name='quiz_questions'),
    path('submit/', QuizSubmitView.as_view(), name='quiz_submit'),
]
