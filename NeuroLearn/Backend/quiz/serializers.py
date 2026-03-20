from rest_framework import serializers
from .models import QuizQuestion, QuizAttempt, AIExplanation

class AIExplanationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIExplanation
        fields = '__all__'

class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ('id', 'sub_session', 'question_text', 'options', 'correct_answers', 'difficulty')

class QuizAttemptSerializer(serializers.ModelSerializer):
    explanation = AIExplanationSerializer(read_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = ('id', 'user', 'question', 'selected_answers', 'is_correct', 'attempted_at', 'explanation')
        read_only_fields = ('user', 'is_correct')
