from django.shortcuts import render
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import update_last_login
from .models import Trip, ELDLog, Truck
from .serializers import TripSerializer, ELDLogSerializer, CustomUserSerializer
from django.http import JsonResponse
from collections import defaultdict

from rest_framework.views import APIView
from rest_framework import viewsets, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

import requests
import os


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
    

def geocode_address(request):
    address = request.GET.get("address")
    if not address:
        return JsonResponse({"error": "Address required"}, status=400)

    api_key = os.getenv("ORS_API_KEY")
    url = f"https://api.openrouteservice.org/geocode/search?api_key={api_key}&text={address}"
    response = requests.get(url)

    return JsonResponse(response.json())
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def eld_logs_by_date(request):
    logs = ELDLog.objects.filter(driver=request.user).order_by("start_time")

    logs_by_date = defaultdict(list)

    for log in logs:
        # Log's start date
        start_date = log.start_time.date().isoformat()
        logs_by_date[start_date].append({
            "status": log.get_status_display(),
            "start_time": log.start_time.strftime("%H:%M"),
            "end_time": log.end_time.strftime("%H:%M"),
        })

        # If the log continues past midnight, add it to the next day's logs
        if log.end_time.date() > log.start_time.date():
            next_date = log.end_time.date().isoformat()
            logs_by_date[next_date].append({
                "status": log.get_status_display(),
                "start_time": "00:00",  # Midnight carryover
                "end_time": log.end_time.strftime("%H:%M"),
            })

    return JsonResponse(logs_by_date)


User = get_user_model()

@api_view(["POST"])
def register_user(request):
    '''
    try:     
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
            except Exception as e:
                print(f"Error saving user: {e}")
                import traceback
                traceback.print_exc()
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            print("Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        '''
    return Response(
        {"detail": "User registration is currently disabled."},
        status=status.HTTP_403_FORBIDDEN
    )


@api_view(["POST"])
def login_user(request):
    """
    Log in an existing user.
    """
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user is not None:
        token, created = Token.objects.get_or_create(user=user)
        update_last_login(None, user)
        return Response({"token": token.key, "user": CustomUserSerializer(user).data}, status=status.HTTP_200_OK)
    
    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def get_user_info(request):
    """
    Get information about the currently authenticated user.
    """
    if request.user.is_authenticated:
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)
    return Response({"detail": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)


def get_route(request):
    api_key = "5b3ce3597851110001cf6248afcd075e3a5b41f4830fe420af3ea3d0"
    start = request.GET.get("start")  # Expecting lat,lon
    end = request.GET.get("end")  # Expecting lat,lon

    if not start or not end:
        return JsonResponse({"error": "Missing parameters"}, status=400)

    try:
        # Ensure coordinates are in lon,lat format
        start_lat, start_lon = start.split(",")  # Given as lat,lon
        end_lat, end_lon = end.split(",")  # Given as lat,lon

        correct_start = f"{start_lon},{start_lat}"  # Convert to lon,lat
        correct_end = f"{end_lon},{end_lat}"  # Convert to lon,lat

        url = "https://api.openrouteservice.org/v2/directions/driving-car"
        params = {
            "api_key": api_key,
            "start": correct_start,
            "end": correct_end,
            "radiuses": "1000,1000"  # Increases search range for road snapping
        }

        response = requests.get(url, params=params)

        if response.status_code == 200:
            return JsonResponse(response.json())
        else:
            return JsonResponse({"error": "Failed to fetch route", "details": response.json()}, status=response.status_code)

    except Exception as e:
        return JsonResponse({"error": f"Invalid coordinate format: {str(e)}"}, status=400)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trip_history(request):
    try:
        search_query = request.query_params.get('search', '')  # Get search term from query params
        trips = Trip.objects.all()

        # Filter trips based on the search query in pickup_location or dropoff_location
        if search_query:
            trips = trips.filter(
                pickup_location__icontains=search_query
            ) | trips.filter(dropoff_location__icontains=search_query)

        serializer = TripSerializer(trips, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_trip(request):
    try:
        # Same order as trips/ endpoint (oldest → newest), so latest = last
        trips = Trip.objects.filter(truck__driver=request.user).order_by("-created_at")
        
        if not trips.exists():
            return Response({"detail": "No trips found for this user."}, status=404)
        
        trip = trips.first()

        
        return Response({
            "id": trip.id,
            "pickup_location": trip.pickup_location,
            "dropoff_location": trip.dropoff_location,
            "start_time": trip.route[0]["timestamp"] if trip.route else None
        })

    except Exception as e:
        print("Error in get_current_trip:", e)
        return Response({"detail": "Something went wrong."}, status=500)



from rest_framework.exceptions import ValidationError

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_eld_log(request):
    """
    Handle adding a new ELD log entry.
    """
    print("Received data:", request.data)  # Log the incoming request data

    serializer = ELDLogSerializer(data=request.data)

    if serializer.is_valid():
        eld_log = serializer.save(driver=request.user)
        
        # Calculate the available drive time by checking all logs
        all_logs = ELDLog.objects.filter(driver=request.user).order_by("start_time")
        available_drive_time = 70  # hours

        # Calculate total time used from the existing logs and the new one
        total_used_time = sum(
            [(log.end_time - log.start_time).total_seconds() / 3600 for log in all_logs]
        )
        
        available_drive_time -= total_used_time

        return Response({
            "message": "Log added successfully",
            "available_drive_time": available_drive_time
        }, status=status.HTTP_201_CREATED)
    
    else:
        print("Validation errors:", serializer.errors)  
        raise ValidationError(serializer.errors) 


class TripCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        
        try:
            truck = Truck.objects.get(driver=user)
        except Truck.DoesNotExist:
            return Response({"detail": "You do not have a truck associated with your account."}, status=status.HTTP_400_BAD_REQUEST)

        # Add the truck ID to the data before passing it to the serializer
        data = request.data
        data['truck'] = truck.id  # Set the truck field explicitly
        
        serializer = TripSerializer(data=data)
        if serializer.is_valid():
            # Save the trip with the associated truck
            trip = serializer.save(truck=truck)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_truck(request):
    """Return the truck assigned to the current user"""
    user = request.user
    try:
        truck = user.trucks.first()  # Get the first truck assigned to the user
        if truck:
            return Response({
                'truck': {
                    'id': truck.id,
                    'fleet_number': truck.fleet_number
                }
            })
        else:
            return Response({'message': 'No truck assigned to user'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

