from django.db import models
from django.conf import settings
from study_plan.models import SubSession

class QuizQuestion(models.Model):
    sub_session = models.ForeignKey(SubSession, on_delete=models.CASCADE, related_name='quiz_questions')
    question_text = models.TextField()
    options = models.JSONField()  # Store options as a list/dict
    correct_answers = models.JSONField() # Store list of correct answers
    difficulty = models.CharField(max_length=20, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Quiz for {self.sub_session.title}"

class QuizAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quiz_attempts')
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE)
    selected_answers = models.JSONField()
    is_correct = models.BooleanField()
    attempted_at = models.DateTimeField(auto_now_add=True)

class AIExplanation(models.Model):
    quiz_attempt = models.OneToOneField(QuizAttempt, on_delete=models.CASCADE, related_name='explanation')
    explanation_md = models.TextField()
    ai_model = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
