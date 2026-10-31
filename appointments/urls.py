from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import DoctorViewSet, AppointmentSlotViewSet, BookingViewSet

router = DefaultRouter()
router.register(r'doctors', DoctorViewSet)
router.register(r'slots', AppointmentSlotViewSet)
router.register(r'bookings', BookingViewSet)

urlpatterns = [
    path('', include(router.urls)),
]