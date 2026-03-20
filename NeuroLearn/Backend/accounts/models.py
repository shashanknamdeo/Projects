from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver

class CustomUser(AbstractUser):
    phone_number = models.CharField(max_length=15, unique=True)
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['username', 'email']

    def __str__(self):
        return self.phone_number or self.username or self.email

class UserProfile(models.Model):
    PACE_CHOICES = [
        ('slow', 'Slow'),
        ('medium', 'Medium'),
        ('fast', 'Fast'),
    ]

    AGE_GROUP_CHOICES = [
        ('under_18', 'Below 18'),
        ('18_22', '18–22'),
        ('23_30', '23–30'),
        ('over_30', '30+'),
    ]

    STREAM_CHOICES = [
        ('science_eng', 'Science / Engineering'),
        ('arts_humanities', 'Arts / Humanities'),
        ('commerce_finance', 'Commerce / Finance'),
        ('medical_bio', 'Medical / Biology'),
        ('other', 'Other / Not sure'),
    ]
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    learning_pace = models.CharField(max_length=10, choices=PACE_CHOICES, default='medium')
    age_group = models.CharField(max_length=20, choices=AGE_GROUP_CHOICES, null=True, blank=True)
    stream = models.CharField(max_length=20, choices=STREAM_CHOICES, null=True, blank=True)
    preferred_language = models.CharField(max_length=50, default='English')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.phone_number or self.user.username}'s Profile"

@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)

@receiver(post_save, sender=CustomUser)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()
