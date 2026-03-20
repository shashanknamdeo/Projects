from django.test import TestCase
from django.contrib.auth import get_user_model
from study_plan.models import StudyPlan, AIPlanVersion, AITopicPlan, StudySession, SubSession
from quiz.models import QuizQuestion, QuizAttempt, AIExplanation
from rest_framework.test import APIClient

User = get_user_model()

class QuizV2Tests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='quizuser', password='password123')
        self.client.force_authenticate(user=self.user)
        
        # Setup hierarchy
        self.plan = StudyPlan.objects.create(user=self.user, topic="Testing", total_days=1)
        self.version = AIPlanVersion.objects.create(study_plan=self.plan, version_number=1, is_active=True)
        self.topic = AITopicPlan.objects.create(plan_version=self.version, topic_title="Unit Tests", sequence_order=1, allocated_minutes=60)
        self.session = StudySession.objects.create(plan_version=self.version, topic_plan=self.topic, day_number=1, available_minutes=60)
        self.sub_session = SubSession.objects.create(session=self.session, title="Asserts", sequence_order=1)
        
        # Create Question
        self.question = QuizQuestion.objects.create(
            sub_session=self.sub_session,
            question_text="Is assert used for testing?",
            options=["Yes", "No"],
            correct_answers=["Yes"],
            difficulty="easy"
        )
        self.sub_session.ai_generated_explanation = "Assert is a keyword used to check conditions."
        self.sub_session.save()

    def test_quiz_submission_correct(self):
        data = {
            "question_id": self.question.id,
            "selected_answers": ["Yes"]
        }
        response = self.client.post('/api/quiz/submit/', data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['is_correct'])
        
        attempt = QuizAttempt.objects.get(question=self.question, user=self.user)
        self.assertTrue(attempt.is_correct)
        self.assertTrue(AIExplanation.objects.filter(quiz_attempt=attempt).exists())

    def test_quiz_submission_incorrect(self):
        data = {
            "question_id": self.question.id,
            "selected_answers": ["No"]
        }
        response = self.client.post('/api/quiz/submit/', data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertFalse(response.data['is_correct'])
        
        attempt = QuizAttempt.objects.get(question=self.question, user=self.user)
        self.assertFalse(attempt.is_correct)
        self.assertEqual(attempt.explanation.explanation_md, self.sub_session.ai_generated_explanation)
