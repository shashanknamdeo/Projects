from django.contrib import admin
from .models import ActivityLog

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'timestamp')
    list_filter = ('action', 'timestamp', 'user')
    search_fields = ('action', 'user__username', 'details')
    readonly_fields = ('timestamp',)
