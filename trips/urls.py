from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, ELDLogViewSet, trip_map, ELDLogListView, eld_logs_by_date, register_user, login_user, get_user_info


# Create a router and register viewsets
router = DefaultRouter()
router.register(r'trips', TripViewSet)
router.register(r'eldlogs', ELDLogViewSet)

urlpatterns = [
    path('api/', include(router.urls)),  # API endpoints
    path('map/', trip_map, name='trip_map'),
    path('api/trips/<int:trip_id>/eld_logs/', ELDLogListView.as_view(), name='eld_logs'),
    path('api/trips/<int:trip_id>/eld_logs_by_date/', eld_logs_by_date, name='eld_logs_by_date'),
    path("api/register/", register_user, name="register"),
    path("api/login/", login_user, name="login"),
    path('api/user/', get_user_info, name='user_info'),
]
