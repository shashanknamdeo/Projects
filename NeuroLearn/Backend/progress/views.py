from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import UserProgress
from .serializers import UserProgressSerializer
from quiz.models import QuizAttempt
from django.db.models import Count, Q

class UserProgressView(generics.RetrieveAPIView):
    serializer_class = UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj, created = UserProgress.objects.get_or_create(user=self.request.user)
        self.calculate_metrics(obj)
        return obj

    def calculate_metrics(self, progress):
        # Calculate concept clarity based on quiz attempts
        total_attempts = QuizAttempt.objects.filter(user=progress.user).count()
        correct_attempts = QuizAttempt.objects.filter(user=progress.user, is_correct=True).count()
        
        if total_attempts > 0:
            progress.confidence_score = (correct_attempts / total_attempts) * 100
        
        # Mastery level logic
        if progress.confidence_score > 90:
            progress.mastery_level = "Expert"
        elif progress.confidence_score > 70:
            progress.mastery_level = "Intermediate"
        else:
            progress.mastery_level = "Beginner"
            
        progress.save()

class WeakTopicsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from study_plan.models import StudySession
        
        # Identify topics (sub-sessions) with high failure rate
        weak_sessions = QuizAttempt.objects.filter(user=request.user, is_correct=False) \
            .values('question__sub_session__title', 'question__sub_session__id', 'question__sub_session__session_id') \
            .annotate(fail_count=Count('id')) \
            .order_by('-fail_count')[:5]
            
        results = []
        for ws in weak_sessions:
            results.append({
                'topic_title': ws['question__sub_session__title'],
                'sub_session_id': ws['question__sub_session__id'],
                'session_id': ws['question__sub_session__session_id'],
                'fail_count': ws['fail_count']
            })
            
        return Response(results)
