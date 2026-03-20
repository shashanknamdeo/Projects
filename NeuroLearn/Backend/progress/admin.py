from django.contrib import admin
from .models import UserProgress

@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'topic', 'confidence_score', 'consistency_score', 'mastery_level')
    search_fields = ('user__username', 'topic')
