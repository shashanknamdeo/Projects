from django.contrib import admin
from .models import QuizQuestion, QuizAttempt

@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ('sub_session', 'question_text')
    search_fields = ('question_text',)

@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'question', 'is_correct', 'attempted_at')
    list_filter = ('is_correct',)
