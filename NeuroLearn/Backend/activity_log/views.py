from rest_framework import generics, permissions
from .models import ActivityLog
from .serializers import ActivityLogSerializer

import logging
logger = logging.getLogger('neurolearn')

class ActivityLogCreateView(generics.CreateAPIView):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save(user=self.request.user)
        logger.info(f"[FRONTEND] User {instance.user.username}: {instance.action} | {instance.details}")

class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ActivityLog.objects.filter(user=self.request.user).order_by('-timestamp')[:20]
