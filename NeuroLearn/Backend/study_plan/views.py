import json
import re
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import (
    StudyPlan, AIPlanVersion, AITopicPlan, 
    StudySession, SubSession, SessionContent
)
from .serializers import StudyPlanSerializer, StudyPlanDetailSerializer, SessionTimelineSerializer
from activity_log.models import ActivityLog
from ai_engine.utils import ai_engine
import threading

def run_in_background(task, *args, **kwargs):
    import sys
    if 'test' in sys.argv:
        task(*args, **kwargs)
        return
    thread = threading.Thread(target=task, args=args, kwargs=kwargs)
    thread.daemon = True
    thread.start()

class StudyPlanCreateView(generics.CreateAPIView):
    serializer_class = StudyPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        study_plan = serializer.save(user=self.request.user)
        ActivityLog.objects.create(
            user=self.request.user,
            action="Study Plan Created",
            details={
                "topic": study_plan.topic, 
                "goal": study_plan.goal_type,
                "days": study_plan.total_days
            }
        )
        self.generate_syllabus(study_plan)

    def generate_syllabus(self, study_plan):
        import logging
        logger = logging.getLogger('neurolearn')

        # STEP 1: Create the Initial Version
        plan_version = AIPlanVersion.objects.create(
            study_plan=study_plan,
            version_number=1,
            trigger_reason='initial'
        )

        # STEP 2: Generate High-Level Syllabus (Topics)
        logger.info(f"[STUDY PLAN] Generating Syllabus for '{study_plan.topic}' (Version 1)...")
        
        context = {
            "name": self.request.user.first_name or self.request.user.username,
            "topic": study_plan.topic,
            "current_level": study_plan.get_current_level_display(),
            "target_days": study_plan.total_days,
            "daily_minutes": study_plan.daily_minutes,
            "age_group": self.request.user.profile.get_age_group_display(),
            "stream": self.request.user.profile.get_stream_display(),
            "goal": study_plan.get_goal_type_display()
        }
        
        syllabus_prompt = ai_engine.load_prompt('study_plan_generation', context)
        response = ai_engine.generate_response(syllabus_prompt, require_json=True)
        
        try:
            if isinstance(response, str):
                raise ValueError(f"AI Engine failed: {response}")
                
            schedule_data = response.get('schedule', [])
            
            # VALIDATION & ADJUSTMENT: Ensure exactly one topic per day
            if len(schedule_data) != study_plan.total_days:
                logger.warning(f"[STUDY PLAN] AI generated {len(schedule_data)} topics for {study_plan.total_days} days. Adjusting...")
                
            # We will force exact day mapping
            sequence = 1
            for day_idx in range(1, study_plan.total_days + 1):
                # Try to get topic for this day, or fallback to the last/first available
                if day_idx <= len(schedule_data):
                    item = schedule_data[day_idx - 1]
                else:
                    item = schedule_data[-1] if schedule_data else {"topic_name": "Deep Dive & Review", "difficulty": 3}
                
                topic = AITopicPlan.objects.create(
                    plan_version=plan_version,
                    topic_title=item.get('topic_name', 'Untitled Topic'),
                    allocated_minutes=study_plan.daily_minutes,
                    allocated_days=1,
                    sequence_order=sequence,
                    ai_reasoning={"difficulty": item.get('difficulty', 3), "original_start_day": item.get('start_day')}
                )
                sequence += 1
                
                StudySession.objects.create(
                    plan_version=plan_version,
                    topic_plan=topic,
                    day_number=day_idx,
                    available_minutes=study_plan.daily_minutes,
                    session_status='pending',
                    generation_status='pending'
                )
                            # We no longer generate sub-sessions synchronously.
                            # They will be triggered by the frontend when needed.
            
            logger.info(f"[STUDY PLAN] Syllabus generated for {study_plan.total_days} days.")
            
        except Exception as e:
            logger.error(f"[STUDY PLAN] Syllabus Generation Failed: {str(e)}")

    def generate_sub_session_topics(self, session):
        import logging
        logger = logging.getLogger('neurolearn')
        
        # Guard: Check if sub-sessions already exist (final safety check)
        if session.sub_sessions.exists():
            if session.generation_status != 'completed':
                session.generation_status = 'completed'
                session.save()
            return

        # Calculate which day of this topic title this is
        topic_sessions = StudySession.objects.filter(
            plan_version=session.plan_version,
            topic_plan__topic_title=session.topic_plan.topic_title
        ).order_by('day_number')
        
        session_list = list(topic_sessions)
        try:
            current_day_idx = session_list.index(session) + 1
        except ValueError:
            current_day_idx = 1
            
        total_topic_days = len(session_list)
            
        context = {
            "topic_title": session.topic_plan.topic_title,
            "topic_day_number": current_day_idx,
            "total_topic_days": total_topic_days,
            "is_multi_day": total_topic_days > 1,
            "available_minutes": session.available_minutes,
            "learning_pace": self.request.user.profile.learning_pace,
            "feedback_context": "" 
        }
        
        # Generation status should already be 'generating' from view, but ensure it is
        if session.generation_status != 'generating':
            session.generation_status = 'generating'
            session.save()
        
        prompt = ai_engine.load_prompt('sub_session_topic_generation', context)
        response = ai_engine.generate_response(prompt, require_json=True)
        
        try:
            sub_sessions_data = response.get('sub_sessions', [])
            
            # VALIDATION & ADJUSTMENT: Ensure total minutes matches exactly
            if sub_sessions_data:
                current_total = sum(ss.get('allocated_minutes', 0) for ss in sub_sessions_data)
                if current_total != session.available_minutes:
                    logger.warning(f"[STUDY PLAN] Sub-session total ({current_total}) != Available ({session.available_minutes}). Adjusting last session.")
                    diff = session.available_minutes - current_total
                    sub_sessions_data[-1]['allocated_minutes'] = max(1, sub_sessions_data[-1].get('allocated_minutes', 0) + diff)

            # Final check before creation to avoid race conditions with long AI calls
            if session.sub_sessions.exists():
                return

            for ss_data in sub_sessions_data:
                SubSession.objects.get_or_create(
                    session=session,
                    title=ss_data.get('title', 'Untitled Unit'),
                    defaults={
                        'sequence_order': ss_data.get('sequence_order', 1),
                        'allocated_minutes': ss_data.get('allocated_minutes', 20),
                        'generation_status': 'pending'
                    }
                )
            session.generation_status = 'completed'
            session.save()
        except Exception as e:
            logger.error(f"[STUDY PLAN] Sub-session Generation Failed: {str(e)}")
            if not session.sub_sessions.exists():
                SubSession.objects.create(
                    session=session,
                    title=f"Introduction to {session.topic_plan.topic_title}",
                    sequence_order=1,
                    allocated_minutes=session.available_minutes,
                    generation_status='completed'
                )
            session.generation_status = 'failed'
            session.save()

class StartSessionView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, plan_id):
        import logging
        from quiz.models import QuizQuestion
        logger = logging.getLogger('neurolearn')

        try:
            study_plan = StudyPlan.objects.get(id=plan_id, user=request.user)
            active_version = AIPlanVersion.objects.get(study_plan=study_plan, is_active=True)
            
            session_id = request.data.get('session_id')
            if session_id:
                session = StudySession.objects.get(id=session_id, plan_version=active_version)
            else:
                session = StudySession.objects.filter(plan_version=active_version, session_status='pending').first()
                
            if not session:
                return Response({"message": "No session found"}, status=status.HTTP_404_NOT_FOUND)

            # Non-blocking StartSessionView:
            # We no longer generate content here. Content is generated on-demand
            # via TriggerSubSessionContentView or just-in-time in the background.
            # But we can trigger content generation for all pending sub-sessions in background.
            for sub_session in session.sub_sessions.filter(generation_status='pending'):
                run_in_background(self.generate_learning_unit, sub_session, request.user)

            return Response({
                "session_id": session.id,
                "day_number": session.day_number,
                "topic": session.topic_plan.topic_title,
                "sub_sessions_count": session.sub_sessions.count()
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"[STUDY SESSION] Start Error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def generate_learning_unit(self, sub_session, user):
        import logging
        from quiz.models import QuizQuestion
        logger = logging.getLogger('neurolearn')
        study_plan = sub_session.session.plan_version.study_plan

        context = {
            "name": user.username,
            "topic": study_plan.topic,
            "sub_topic": sub_session.title,
            "age_group": user.profile.get_age_group_display(),
            "stream": user.profile.get_stream_display(),
            "current_level": study_plan.get_current_level_display(),
            "goal": study_plan.get_goal_type_display()
        }

        if sub_session.generation_status == 'completed' and hasattr(sub_session, 'content'):
            return

        sub_session.generation_status = 'generating'
        sub_session.save()

        prompt = ai_engine.load_prompt('lesson_generation', context)
        response = ai_engine.generate_response(prompt, require_json=True)

        try:
            content_md = response.get('content_md', '')
            # Strip redundant title (first line if it's a markdown header)
            content_md = re.sub(r'^#+.*?\n', '', content_md, count=1).strip()

            explanation_md = response.get('explanation_md', '')
            # Strip redundant title from explanation as well if it exists
            explanation_md = re.sub(r'^#+.*?\n', '', explanation_md, count=1).strip()

            # 1. Create Content
            SessionContent.objects.create(
                sub_session=sub_session,
                content_md=content_md,
                ai_model='nvidia/nemotron-3-nano-30b-a3b:free'
            )

            # 2. Update SubSession with explanation
            sub_session.ai_generated_explanation = explanation_md
            sub_session.save()

            # 3. Create Quiz Question
            quiz_data = response.get('quiz', {})
            QuizQuestion.objects.create(
                sub_session=sub_session,
                question_text=quiz_data.get('question_text', ''),
                options=quiz_data.get('options', []),
                correct_answers=quiz_data.get('correct_answers', []),
                difficulty=quiz_data.get('difficulty', 'medium')
            )
            
            sub_session.generation_status = 'completed'
            sub_session.save()

            logger.info(f"[STUDY SESSION] Generated Learning Unit for {sub_session.title}")
        except Exception as e:
            logger.error(f"[STUDY SESSION] Learning Unit Generation Failed: {str(e)}")
            sub_session.generation_status = 'failed'
            sub_session.save()

class StudyPlanDetailView(generics.RetrieveAPIView):
    serializer_class = StudyPlanDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return StudyPlan.objects.get(id=self.kwargs['plan_id'], user=self.request.user)

class StudySessionDetailView(generics.RetrieveAPIView):
    serializer_class = SessionTimelineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return StudySession.objects.get(id=self.kwargs['session_id'], plan_version__study_plan__user=self.request.user)

class UnlockSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, session_id):
        from django.utils import timezone
        session = StudySession.objects.get(id=session_id, plan_version__study_plan__user=request.user)
        session.unlocked_at = timezone.now()
        session.save()
        
        ActivityLog.objects.create(
            user=request.user,
            action="Session Unlocked Early",
            details={"session_id": session_id, "day": session.day_number}
        )
        
        return Response({"message": "Session unlocked successfully"}, status=status.HTTP_200_OK)

class StudyPlanListView(generics.ListAPIView):
    serializer_class = StudyPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudyPlan.objects.filter(user=self.request.user)

class StudyPlanDeleteView(generics.DestroyAPIView):
    serializer_class = StudyPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudyPlan.objects.filter(user=self.request.user)

class SubSessionFeedbackView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, sub_session_id):
        from django.shortcuts import get_object_or_404
        sub_session = get_object_or_404(SubSession, id=sub_session_id, session__plan_version__study_plan__user=request.user)
        
        from activity_log.models import ActivityLog
        ActivityLog.objects.create(
            user=request.user,
            action="Sub-Session Feedback",
            details={
                "sub_session_id": sub_session_id,
                "feedback": request.data
            }
        )
        return Response({"status": "success"})

class TriggerSessionTopicsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, session_id):
        from django.shortcuts import get_object_or_404
        session = get_object_or_404(StudySession, id=session_id, plan_version__study_plan__user=request.user)
        
        # Atomic update to prevent multiple workers starting for the same session
        updated = StudySession.objects.filter(id=session_id, generation_status='pending').update(generation_status='generating')
        
        if updated:
            session.refresh_from_db()
            from .views import StudyPlanCreateView
            creator = StudyPlanCreateView()
            creator.request = request 
            run_in_background(creator.generate_sub_session_topics, session)
            return Response({"status": "generating"}, status=status.HTTP_202_ACCEPTED)
        
        return Response({"status": session.generation_status})

class TriggerSubSessionContentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, sub_session_id):
        from django.shortcuts import get_object_or_404
        sub_session = get_object_or_404(SubSession, id=sub_session_id, session__plan_version__study_plan__user=request.user)
        
        # Atomic update to prevent multiple content generations
        updated = SubSession.objects.filter(id=sub_session_id, generation_status='pending').update(generation_status='generating')

        if updated:
            sub_session.refresh_from_db()
            from .views import StartSessionView
            starter = StartSessionView()
            run_in_background(starter.generate_learning_unit, sub_session, request.user)
            return Response({"status": "generating"}, status=status.HTTP_202_ACCEPTED)
        
        return Response({"status": sub_session.generation_status})
