from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Trip, ELDLog

User = get_user_model()  

class ELDLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ELDLog
        fields = ['status', 'start_time', 'end_time', 'trip']


class TripSerializer(serializers.ModelSerializer):
    available_drive_time = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = [
            "id",
            "truck",
            "current_location",
            "pickup_location",
            "dropoff_location",
            "current_cycle_used",
            "available_drive_time",
            "created_at",
        ]

    def get_available_drive_time(self, obj):
        return max(0, 70 - obj.calculate_cycle_hours())
    
    



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
