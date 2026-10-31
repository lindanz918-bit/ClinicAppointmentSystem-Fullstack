from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Doctor, AppointmentSlot, Booking
from .serializers import (
    DoctorSerializer,
    AppointmentSlotSerializer,
    BookingSerializer
)


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class AppointmentSlotViewSet(viewsets.ModelViewSet):
    queryset = AppointmentSlot.objects.all()
    serializer_class = AppointmentSlotSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        doctor_id = self.request.query_params.get('doctor')
        date = self.request.query_params.get('date')
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)
        if date:
            queryset = queryset.filter(date=date)
        return queryset


# class BookingViewSet(viewsets.ModelViewSet):
#     queryset = Booking.objects.all()
#     serializer_class = BookingSerializer
#     permission_classes = [permissions.IsAuthenticatedOrReadOnly]
#     # permission_classes = [permissions.IsAuthenticated]
#
#     def perform_create(self, serializer):
#         slot = serializer.validated_data['slot']
#         slot.is_booked = True
#         slot.save()
#         serializer.save(patient=self.request.user)
#
#     def get_queryset(self):
#         user = self.request.user
#         if user.is_staff or hasattr(user, 'doctor'):
#             return Booking.objects.all()
#         return Booking.objects.filter(patient=user)

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]