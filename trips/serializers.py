from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Trip, ELDLog

User = get_user_model()  

class ELDLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ELDLog
        fields = "__all__"

class TripSerializer(serializers.ModelSerializer):
    eld_logs = ELDLogSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = "__all__"

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User  # No need to reference CustomUser separately
        fields = ["id", "username", "email", "password", "is_driver", "profile_picture"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)  # Ensures password is hashed
        user.save()
        return user
