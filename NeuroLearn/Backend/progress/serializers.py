from rest_framework import serializers
from .models import UserProgress

class UserProgressSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    age_group = serializers.CharField(source='user.profile.age_group', read_only=True)
    stream = serializers.CharField(source='user.profile.stream', read_only=True)

    class Meta:
        model = UserProgress
        fields = ('id', 'user_name', 'topic', 'confidence_score', 'consistency_score', 'mastery_level', 'last_updated', 'age_group', 'stream')
        read_only_fields = ('user',)

    def get_user_name(self, obj):
        user = obj.user
        if user.first_name:
            return f"{user.first_name} {user.last_name}".strip()
        return user.phone_number or user.username or "User"
