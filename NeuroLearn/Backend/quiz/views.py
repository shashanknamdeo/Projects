import json
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import QuizQuestion, QuizAttempt, AIExplanation
from .serializers import QuizQuestionSerializer, QuizAttemptSerializer
from study_plan.models import SubSession

class QuizQuestionListView(generics.ListAPIView):
    serializer_class = QuizQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        sub_session_id = self.request.query_params.get('sub_session_id')
        session_id = self.request.query_params.get('session_id')
        if sub_session_id:
            return QuizQuestion.objects.filter(sub_session_id=sub_session_id)
        if session_id:
            return QuizQuestion.objects.filter(sub_session__session_id=session_id)
        return QuizQuestion.objects.none()

class QuizSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        question_id = request.data.get('question_id')
        selected_answers = request.data.get('selected_answers', [])
        
        try:
            question = QuizQuestion.objects.get(id=question_id)
            
            # Robust comparison for multiple answers
            import re
            prefix_re = re.compile(r'^([A-D])[\s.)-]+\s*', re.I)
            
            def normalize(val, options):
                val_str = str(val).strip()
                # Check if it's a single letter label (A, B, C, D)
                if len(val_str) == 1 and val_str.lower() in "abcd":
                    idx = ord(val_str.lower()) - ord('a')
                    if idx < len(options):
                        # Use the text of that option
                        return prefix_re.sub('', str(options[idx])).strip().lower()
                # Otherwise treat as text, strip prefix if present
                return prefix_re.sub('', val_str).strip().lower()

            options = question.options
            sel_norm = set([normalize(a, options) for a in selected_answers])
            cor_norm = set([normalize(a, options) for a in question.correct_answers])
            
            is_correct = (sel_norm == cor_norm) and len(sel_norm) > 0
            
            attempt = QuizAttempt.objects.create(
                user=request.user,
                question=question,
                selected_answers=selected_answers,
                is_correct=is_correct
            )
            
            # Attach AI Explanation (using the pre-generated one from SubSession or creating a new attempt link)
            explanation_text = question.sub_session.ai_generated_explanation or "No explanation available."
            
            AIExplanation.objects.create(
                quiz_attempt=attempt,
                explanation_md=explanation_text,
                ai_model='nvidia/nemotron-3-nano-30b-a3b:free'
            )
            
            serializer = QuizAttemptSerializer(attempt)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except QuizQuestion.DoesNotExist:
            return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
