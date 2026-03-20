from rest_framework import serializers
from .models import StudyPlan, AIPlanVersion, StudySession, AITopicPlan, SubSession, SessionContent

class SessionContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionContent
        fields = ('content_md', 'ai_model', 'generated_at')

class SubSessionSerializer(serializers.ModelSerializer):
    content = SessionContentSerializer(read_only=True)
    
    class Meta:
        model = SubSession
        fields = ('id', 'title', 'sequence_order', 'allocated_minutes', 'generation_status', 'ai_generated_explanation', 'content')

class SessionTimelineSerializer(serializers.ModelSerializer):
    is_available = serializers.BooleanField(read_only=True)
    topic_title = serializers.CharField(source='topic_plan.topic_title', read_only=True)
    date = serializers.SerializerMethodField()
    sub_sessions = SubSessionSerializer(many=True, read_only=True)
    
    class Meta:
        model = StudySession
        fields = ('id', 'day_number', 'topic_title', 'date', 'session_status', 'generation_status', 'is_available', 'unlocked_at', 'sub_sessions')

    def get_date(self, obj):
        start_date = obj.plan_version.study_plan.start_date
        import datetime
        return start_date + datetime.timedelta(days=obj.day_number - 1)

class StudyPlanDetailSerializer(serializers.ModelSerializer):
    topics = serializers.SerializerMethodField()
    sessions = serializers.SerializerMethodField()
    
    class Meta:
        model = StudyPlan
        fields = ('id', 'topic', 'goal_type', 'current_level', 'daily_minutes', 'total_days', 'start_date', 'status', 'topics', 'sessions')
        
    def get_topics(self, obj):
        active_version = AIPlanVersion.objects.filter(study_plan=obj, is_active=True).first()
        if not active_version:
            return []
        topics = AITopicPlan.objects.filter(plan_version=active_version).order_by('sequence_order')
        return [{
            "id": t.id,
            "title": t.topic_title,
            "order": t.sequence_order,
            "minutes": t.allocated_minutes
        } for t in topics]

    def get_sessions(self, obj):
        active_version = AIPlanVersion.objects.filter(study_plan=obj, is_active=True).first()
        if not active_version:
            return []
        sessions = StudySession.objects.filter(plan_version=active_version).order_by('day_number')
        return SessionTimelineSerializer(sessions, many=True).data

class StudyPlanSerializer(serializers.ModelSerializer):
    next_session_id = serializers.SerializerMethodField()

    class Meta:
        model = StudyPlan
        fields = ('id', 'topic', 'goal_type', 'current_level', 'total_days', 'daily_minutes', 'start_date', 'status', 'created_at', 'next_session_id')
        read_only_fields = ('user', 'status')

    def get_next_session_id(self, obj):
        active_version = obj.versions.filter(is_active=True).first()
        if not active_version:
            return None
        next_session = StudySession.objects.filter(plan_version=active_version, session_status='pending').order_by('day_number').first()
        return next_session.id if next_session else None
