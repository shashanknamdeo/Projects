from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db.models import Q

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    age_group = serializers.CharField(source='profile.age_group', read_only=True)
    stream = serializers.CharField(source='profile.stream', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'phone_number', 'email', 'first_name', 'last_name', 'age_group', 'stream')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('phone_number', 'password', 'email', 'first_name', 'last_name')

    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            phone_number=validated_data['phone_number'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            username=validated_data.get('phone_number') # Use phone as default username
        )
        return user

from .models import UserProfile

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('age_group', 'stream', 'learning_pace', 'preferred_language')

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # SimpleJWT explicitly requires the USERNAME_FIELD in the data.
        # If the frontend sent 'username', we need to add 'phone_number' to the initial data
        # so that the built-in validation doesn't fail with a 400 Bad Request.
        if 'username' in self.initial_data and 'phone_number' not in self.initial_data:
            self.initial_data['phone_number'] = self.initial_data['username']

    def validate(self, attrs):
        # We now know 'phone_number' is definitely in attrs (mapped from username if needed)
        identifier = attrs.get("phone_number")

        if identifier:
            user = User.objects.filter(Q(phone_number=identifier) | Q(email=identifier)).first()
            if user:
                # Set the actual phone number for SimpleJWT to authenticate against
                attrs[User.USERNAME_FIELD] = user.phone_number
        
        return super().validate(attrs)
