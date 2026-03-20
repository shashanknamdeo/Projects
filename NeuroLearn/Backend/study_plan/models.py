import datetime
from django.db import models
from django.conf import settings
from django.utils import timezone

class StudyPlan(models.Model):
    GENERATION_STATUS = [
        ('pending', 'Pending'),
        ('generating', 'Generating'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
    ]
    GOAL_CHOICES = [
        ('job', 'Job (Interviews, Practical skills)'),
        ('exam', 'Exam Preparation (Theory, Syllabus)'),
        ('career_switch', 'Career Switch (Extra basics)'),
        ('skill_upgrade', 'Skill Upgrade (More depth)'),
        ('curiosity', 'Curiosity (Exploratory)'),
        ('clarity', 'Conceptual Clarity'),
    ]

    LEVEL_CHOICES = [
        ('beginner', 'Beginner (Starting from zero)'),
        ('intermediate', 'Intermediate (Know basics)'),
        ('advanced', 'Advanced (Deep understanding)'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='study_plans')
    topic = models.CharField(max_length=255) # Subject
    goal_type = models.CharField(max_length=20, choices=GOAL_CHOICES, default='job')
    current_level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    total_days = models.PositiveIntegerField(default=3) 
    daily_minutes = models.PositiveIntegerField(default=60)
    start_date = models.DateField(default=datetime.date.today)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.topic}"

class AIPlanVersion(models.Model):
    TRIGGER_CHOICES = [
        ('initial', 'Initial Generation'),
        ('missed_days', 'Missed Days Catch-up'),
        ('low_performance', 'Low Performance Adjustment'),
        ('user_request', 'User Requested Change'),
    ]
    
    study_plan = models.ForeignKey(StudyPlan, on_delete=models.CASCADE, related_name='versions')
    version_number = models.PositiveIntegerField(default=1)
    trigger_reason = models.CharField(max_length=20, choices=TRIGGER_CHOICES, default='initial')
    ai_model = models.CharField(max_length=100, default='nvidia/nemotron-3-nano-30b-a3b:free')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-version_number']

class AITopicPlan(models.Model):
    plan_version = models.ForeignKey(AIPlanVersion, on_delete=models.CASCADE, related_name='topic_plans')
    topic_title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    sequence_order = models.PositiveIntegerField()
    allocated_days = models.PositiveIntegerField(default=1)
    allocated_minutes = models.PositiveIntegerField()
    ai_reasoning = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['sequence_order']

class StudySession(models.Model):
    SESSION_STATUS = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
    ]
    
    plan_version = models.ForeignKey(AIPlanVersion, on_delete=models.CASCADE, related_name='sessions')
    topic_plan = models.ForeignKey(AITopicPlan, on_delete=models.CASCADE, related_name='sessions')
    day_number = models.PositiveIntegerField()
    available_minutes = models.PositiveIntegerField()
    actual_minutes_spent = models.PositiveIntegerField(default=0)
    session_status = models.CharField(max_length=20, choices=SESSION_STATUS, default='pending')
    generation_status = models.CharField(max_length=20, choices=StudyPlan.GENERATION_STATUS, default='pending')
    unlocked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_available(self):
        """Checks if the session is available to start."""
        if self.unlocked_at:
            return True
        
        start_date = self.plan_version.study_plan.start_date
        expected_date = start_date + datetime.timedelta(days=self.day_number - 1)
        return timezone.now().date() >= expected_date

    def __str__(self):
        return f"Day {self.day_number} - {self.topic_plan.topic_title} ({self.plan_version.study_plan.user.username})"

class SubSession(models.Model):
    session = models.ForeignKey(StudySession, on_delete=models.CASCADE, related_name='sub_sessions')
    title = models.CharField(max_length=255)
    sequence_order = models.PositiveIntegerField()
    allocated_minutes = models.PositiveIntegerField(default=20)
    generation_status = models.CharField(max_length=20, choices=StudyPlan.GENERATION_STATUS, default='pending')
    ai_generated_explanation = models.TextField(null=True, blank=True) # Added this field based on the instruction's `sub_session.ai_generated_explanation`
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sequence_order']

class SessionContent(models.Model):
    sub_session = models.OneToOneField(SubSession, on_delete=models.CASCADE, related_name='content')
    content_md = models.TextField()
    ai_model = models.CharField(max_length=100)
    generated_at = models.DateTimeField(auto_now_add=True)
