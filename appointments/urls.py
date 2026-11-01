from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import auth_views
from .viewsets import DoctorViewSet, AppointmentSlotViewSet, BookingViewSet

router = DefaultRouter()
router.register(r'doctors', DoctorViewSet)
router.register(r'slots', AppointmentSlotViewSet)
router.register(r'bookings', BookingViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', auth_views.login_view, name='login'),
    path('auth/register/', auth_views.register_view, name='register'),
    path('auth/change-password/', auth_views.change_password_view, name='change-password'),
    path('auth/logout/', auth_views.logout_view, name='logout'),
]
