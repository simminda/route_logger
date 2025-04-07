from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, ELDLogViewSet, trip_map, geocode_address, ELDLogListView, eld_logs_by_date, register_user, login_user, get_user_info, get_route, trip_history, get_current_trip, add_eld_log, TripCreateAPIView


# Create a router and register viewsets
router = DefaultRouter()
router.register(r'trips', TripViewSet)
router.register(r'eldlogs', ELDLogViewSet)

urlpatterns = [
    path('api/', include(router.urls)),  
    path('map/', trip_map, name='trip_map'),
    path("api/geocode/", geocode_address),
    path('api/trips/<int:trip_id>/eld_logs/', ELDLogListView.as_view(), name='eld_logs'),
    path('api/eld_logs_by_date/', eld_logs_by_date, name='eld_logs_by_date'),
    path("api/register/", register_user, name="register"),
    path("api/login/", login_user, name="login"),
    path('api/user/', get_user_info, name='user_info'),
    path("api/get-route/", get_route, name="get_route"),
    path('api/eld_logs/', add_eld_log, name='add_eld_log'),
    path('api/trip-history/', trip_history, name='trip-history'),
    path("api/current_trip/", get_current_trip, name='get_current_trip'),
    path('api/create-trip/', TripCreateAPIView.as_view(), name='create-trip'),  
]
