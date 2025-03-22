from django.shortcuts import render
from rest_framework import viewsets, generics
from .models import Trip, ELDLog
from .serializers import TripSerializer, ELDLogSerializer
from django.http import JsonResponse
from django.db.models import F
from collections import defaultdict


class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

class ELDLogViewSet(viewsets.ModelViewSet):
    queryset = ELDLog.objects.all()
    serializer_class = ELDLogSerializer

    
def trip_map(request):
    return render(request, 'trips/map.html')


class ELDLogListView(generics.ListAPIView):
    serializer_class = ELDLogSerializer

    def get_queryset(self):
        trip_id = self.kwargs['trip_id']
        return ELDLog.objects.filter(trip_id=trip_id)
    

def eld_logs_by_date(request, trip_id):
    logs = ELDLog.objects.filter(trip_id=trip_id).order_by("start_time")

    logs_by_date = defaultdict(list)
    for log in logs:
        date_str = log.start_time.date().isoformat()  # Extract only the date
        logs_by_date[date_str].append({
            "status": log.status,
            "start_time": log.start_time.strftime("%H:%M"),
            "end_time": log.end_time.strftime("%H:%M"),
        })

    return JsonResponse(logs_by_date)