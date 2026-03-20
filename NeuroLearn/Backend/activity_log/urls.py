from django.urls import path
from .views import ActivityLogCreateView, ActivityLogListView

urlpatterns = [
    path('log/', ActivityLogCreateView.as_view(), name='activity_log_create'),
    path('list/', ActivityLogListView.as_view(), name='activity_log_list'),
]
