from django.contrib import admin
from .models import Trip, ELDLog, Truck


admin.site.register(Truck)


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ("pickup_location", "dropoff_location", "current_cycle_used", "created_at")
    search_fields = ("pickup_location", "dropoff_location")


@admin.register(ELDLog)
class ELDLogAdmin(admin.ModelAdmin):
    list_display = ("trip", "status", "start_time", "end_time")
    list_filter = ("status", "trip")  # Filter logs by status & trip
    search_fields = ("trip__id", "trip__pickup_location", "trip__dropoff_location")
    ordering = ("-start_time",)  # Order logs by most recent first
