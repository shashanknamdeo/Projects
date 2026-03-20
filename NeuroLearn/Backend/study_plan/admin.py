from django.contrib import admin
from .models import StudyPlan, AIPlanVersion, AITopicPlan, StudySession, SubSession, SessionContent

@admin.register(StudyPlan)
class StudyPlanAdmin(admin.ModelAdmin):
    list_display = ('user', 'topic', 'total_days', 'created_at')
    search_fields = ('topic', 'user__username')

@admin.register(AIPlanVersion)
class AIPlanVersionAdmin(admin.ModelAdmin):
    list_display = ('study_plan', 'version_number', 'is_active', 'created_at')

@admin.register(AITopicPlan)
class AITopicPlanAdmin(admin.ModelAdmin):
    list_display = ('topic_title', 'plan_version', 'sequence_order')

@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ('day_number', 'topic_plan', 'session_status')

@admin.register(SubSession)
class SubSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'session', 'sequence_order')

@admin.register(SessionContent)
class SessionContentAdmin(admin.ModelAdmin):
    list_display = ('sub_session', 'ai_model', 'generated_at')
