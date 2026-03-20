from django.test import TestCase
from django.contrib.auth import get_user_model
from study_plan.models import StudyPlan, AIPlanVersion, AITopicPlan, StudySession, SubSession
from accounts.models import UserProfile
from rest_framework.test import APIClient
from unittest.mock import patch, MagicMock

User = get_user_model()

class NeuroLearnV2HierarchyTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.profile = self.user.profile
        self.profile.age_group = 'adult'
        self.profile.stream = 'tech'
        self.profile.learning_pace = 'fast'
        self.profile.save()
        self.client.force_authenticate(user=self.user)

    @patch('ai_engine.utils.OpenRouterEngine.generate_response')
    def test_study_plan_generation_creates_hierarchy(self, mock_generate):
        # Mock responses for Topic generation and Sub-Session generation
        mock_generate.side_effect = [
            # 1. Syllabus (Topics)
            {
                "schedule": [
                    {"topic_name": "Python Basics", "start_day": 1, "end_day": 1, "difficulty": 2},
                    {"topic_name": "Advanced Python", "start_day": 2, "end_day": 3, "difficulty": 4}
                ]
            },
            # 2. Sub-sessions for Day 1
            {
                "sub_sessions": [
                    {"title": "Variables", "sequence_order": 1, "allocated_minutes": 30},
                    {"title": "Data Types", "sequence_order": 2, "allocated_minutes": 30}
                ]
            },
            # 3. Sub-sessions for Day 2
            {
                "sub_sessions": [
                    {"title": "Decorators", "sequence_order": 1, "allocated_minutes": 60}
                ]
            },
            # 4. Sub-sessions for Day 3
            {
                "sub_sessions": [
                    {"title": "Metaclasses", "sequence_order": 1, "allocated_minutes": 60}
                ]
            }
        ]

        data = {
            "topic": "Python Programming",
            "goal_type": "job",
            "current_level": "beginner",
            "total_days": 3,
            "daily_minutes": 60
        }

        response = self.client.post('/api/study-plan/create/', data)
        self.assertEqual(response.status_code, 201)
        
        # Verify Hierarchy
        plan = StudyPlan.objects.get(topic="Python Programming")
        self.assertEqual(plan.versions.count(), 1)
        
        active_version = plan.versions.get(is_active=True)
        self.assertEqual(active_version.topic_plans.count(), 2)
        self.assertEqual(active_version.sessions.count(), 3)
        
        # Check Sub-sessions for Day 1
        day1_session = active_version.sessions.get(day_number=1)
        self.assertEqual(day1_session.sub_sessions.count(), 2)
        self.assertEqual(day1_session.sub_sessions.first().title, "Variables")

    @patch('ai_engine.utils.OpenRouterEngine.generate_response')
    def test_start_session_triggers_content_generation(self, mock_generate):
        # Setup existing plan with one sub-session
        plan = StudyPlan.objects.create(user=self.user, topic="FastAPI", total_days=1)
        version = AIPlanVersion.objects.create(study_plan=plan, version_number=1, is_active=True)
        topic = AITopicPlan.objects.create(plan_version=version, topic_title="Basics", sequence_order=1, allocated_minutes=60)
        session = StudySession.objects.create(plan_version=version, topic_plan=topic, day_number=1, available_minutes=60)
        sub_session = SubSession.objects.create(session=session, title="Intro", sequence_order=1)

        # Mock Learning Unit Generation with redundant titles
        mock_generate.return_value = {
            "content_md": "## FastAPI Intro Header\nWelcome to FastAPI.",
            "quiz": {
                "question_text": "What is FastAPI?",
                "options": ["A framework", "A library"],
                "correct_answers": ["A framework"],
                "difficulty": "easy"
            },
            "explanation_md": "# Why FastAPI?\nFastAPI is a modern web framework."
        }

        response = self.client.post(f'/api/study-plan/{plan.id}/start-session/')
        self.assertEqual(response.status_code, 200)
        
        # Verify Content and Quiz created, and titles are stripped
        sub_session.refresh_from_db()
        self.assertTrue(hasattr(sub_session, 'content'))
        # The header "## FastAPI Intro Header\n" should be stripped
        self.assertEqual(sub_session.content.content_md, "Welcome to FastAPI.")
        self.assertEqual(sub_session.quiz_questions.count(), 1)
        # The header "# Why FastAPI?\n" should be stripped
        self.assertEqual(sub_session.ai_generated_explanation, "FastAPI is a modern web framework.")
