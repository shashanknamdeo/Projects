from django.db import models
from django.conf import settings

class UserProgress(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress')
    topic = models.CharField(max_length=255)
    confidence_score = models.FloatField(default=0.0)
    consistency_score = models.FloatField(default=0.0)
    mastery_level = models.CharField(max_length=50, default='Beginner')
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Progress for {self.user.phone_number or self.user.username}"
