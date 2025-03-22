from django.db import models
from datetime import timedelta
from django.utils.timezone import now


class Truck(models.Model):
    fleet_number = models.CharField(max_length=17, unique=True)

    def __str__(self):
        return f"Truck {self.fleet_number}"


class Trip(models.Model):
    truck = models.ForeignKey("Truck", on_delete=models.SET_NULL, null=True, blank=True)
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)

    # Auto-calculate hours used based on the last 8 days
    current_cycle_used = models.IntegerField(default=0, editable=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def calculate_cycle_hours(self):
        """Calculate the total driving hours in the last 8 days, reset if a 34-hour break is found."""
        from .models import ELDLog

        eight_days_ago = now().date() - timedelta(days=8)
        logs = (
            ELDLog.objects.filter(
                trip__truck=self.truck,
                start_time__gte=eight_days_ago
            ).order_by("start_time")
        )

        total_hours = 0
        last_off_duty = None

        for log in logs:
            if log.status == 0:  # Off Duty
                if last_off_duty:
                    # Check if the break is 34+ hours
                    if (log.start_time - last_off_duty).total_seconds() / 3600 >= 34:
                        return 0  # Reset cycle to 0
                last_off_duty = log.end_time
            elif log.status == 2:  # Driving
                total_hours += (log.end_time - log.start_time).total_seconds() / 3600

        return min(total_hours, 70)  # Max 70 hours

    def save(self, *args, **kwargs):
        self.current_cycle_used = self.calculate_cycle_hours()  # Auto-calculate hours
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

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='eld_logs')
    status = models.IntegerField(choices=STATUS_CHOICES)  
    start_time = models.DateTimeField()  # When this status started
    end_time = models.DateTimeField()    # When this status ended
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Trip {self.trip.id} | {self.get_status_display()} | {self.start_time.strftime('%Y-%m-%d %H:%M')} - {self.end_time.strftime('%H:%M')}"
