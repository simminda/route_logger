from django.shortcuts import render
from rest_framework import viewsets, generics
from .models import Trip, ELDLog
from .serializers import TripSerializer, ELDLogSerializer
from django.http import JsonResponse
from django.db.models import F
from collections import defaultdict

from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from .serializers import CustomUserSerializer


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


User = get_user_model()

@api_view(["POST"])
def register_user(request):
    try:
        # For debugging
        print("Request data:", request.data)
        
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