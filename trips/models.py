from django.db import models
from datetime import timedelta
from django.utils.timezone import now
from django.contrib.auth.models import AbstractUser
from django.conf import settings

from geopy.geocoders import Nominatim


def get_coordinates(address):
    geolocator = Nominatim(user_agent="trips")
    location = geolocator.geocode(address)
    if location:
        return location.latitude, location.longitude
    return None, None


class CustomUser(AbstractUser):
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    is_driver = models.BooleanField(default=False)  

    def __str__(self):
        return self.username


class Truck(models.Model):
    fleet_number = models.CharField(max_length=17, unique=True)
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='trucks'
    )

    def __str__(self):
        return f"Truck {self.fleet_number}"


class Trip(models.Model):
    truck = models.ForeignKey("Truck", on_delete=models.SET_NULL, null=True, blank=True)
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    pickup_lat = models.FloatField(null=True, blank=True)
    pickup_lng = models.FloatField(null=True, blank=True)
    dropoff_lat = models.FloatField(null=True, blank=True)
    dropoff_lng = models.FloatField(null=True, blank=True)
    route = models.JSONField(null=True, blank=True) 

    # Auto-calculate hours used based on the last 8 days
    current_cycle_used = models.IntegerField(default=0, editable=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def calculate_cycle_hours(self):
        from django.utils.timezone import now
        from datetime import timedelta
        
        current_date = now().date()
        
        # Look back 8 days from today for the HOS cycle calculation
        eight_days_ago = current_date - timedelta(days=8)
        
        print(f"Calculating cycle hours for truck: {self.truck}")
        print(f"Current date: {current_date}")
        print(f"Checking logs since: {eight_days_ago}")
        
        # Get all logs for this truck in the past 8 days
        logs = (
            ELDLog.objects.filter(
                trip__truck=self.truck,
                start_time__date__gte=eight_days_ago,
                start_time__date__lte=current_date
            ).order_by("start_time")
        )
        
        total_hours = 0
        
        # Process each log to calculate driving hours
        for log in logs:
            # Status code 2 or "Driving" corresponds to "Driving" in ELD logs
            if hasattr(log.status, 'lower') and log.status.lower() == "driving" or log.status == 2:
                # Calculate driving duration in hours
                driving_duration = (log.end_time - log.start_time).total_seconds() / 3600
                print(f"Adding driving hours from {log.start_time} to {log.end_time}: {driving_duration:.2f} hours")
                total_hours += driving_duration
        
        total_hours = round(total_hours, 2)
        
        print(f"Total driving hours: {total_hours}")
        
        # Ensure the total hours do not exceed the 70-hour limit
        return min(total_hours, 70)


    def save(self, *args, **kwargs):
        # Calculate cycle hours before saving the Trip
        self.current_cycle_used = self.calculate_cycle_hours()
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Trip from {self.pickup_location} to {self.dropoff_location}"


class ELDLog(models.Model):
    STATUS_CHOICES = [
        (0, "Off Duty"),
        (1, "Sleeper Berth"),
        (2, "Driving"),
        (3, "On Duty (Not Driving)"),
    ]

    trip = models.ForeignKey(Trip, on_delete=models.SET_NULL, null=True, blank=True, related_name='eld_logs')
    status = models.IntegerField(choices=STATUS_CHOICES)  
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    driver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)  # Use AUTH_USER_MODEL
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)  # Save the log first
        self.trip.current_cycle_used = self.trip.calculate_cycle_hours()
        self.trip.save(update_fields=['current_cycle_used'])  # Save only the updated field

    def __str__(self):
        if self.trip:
            return f"Trip {self.trip.id} | {self.get_status_display()} | {self.start_time.strftime('%Y-%m-%d %H:%M')} - {self.end_time.strftime('%H:%M')}"
        else:
            return "ELDLog (No Trip Assigned)"
