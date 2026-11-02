from django.contrib.auth.models import User, Group
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Doctor, AppointmentSlot, Booking
from .serializers import (
    DoctorSerializer,
    AppointmentSlotSerializer,
    BookingSerializer, UserSerializer, GroupSerializer
)
class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = super().get_queryset()
        group = self.request.query_params.get('group')
        if group:
            queryset = queryset.filter(groups__name=group)
        return queryset

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        print("=== User destroy called ===", instance.username)

        now = timezone.now()

        # check the future booking if the patient is related
        patient_bookings = Booking.objects.filter(
            patient=instance,
            slot__date__gte=now.date()
        ).exclude(
            slot__date=now.date(),
            slot__time__lt=now.time()
        )

        # check the future booking if the doctor is related
        doctor_bookings = Booking.objects.none()
        if hasattr(instance, 'doctor'):
            doctor_bookings = Booking.objects.filter(
                slot__doctor=instance.doctor,
                slot__date__gte=now.date()
            ).exclude(
                slot__date=now.date(),
                slot__time__lt=now.time()
            )

        total_future = patient_bookings.count() + doctor_bookings.count()
        print("Future bookings:", total_future)

        if total_future > 0:
            return Response(
                {'detail': 'Cannot delete user with upcoming bookings.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAdminUser]

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all().order_by('id')
    serializer_class = DoctorSerializer
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def destroy(self, request, *args, **kwargs):
        print("=== Doctor destroy called ===")
        instance = self.get_object()

        now = timezone.now()
        future_bookings = Booking.objects.filter(
            slot__doctor=instance,
            slot__date__gte=now.date()
        ).exclude(
            slot__date=now.date(),
            slot__time__lt=now.time()
        )
        print("Future bookings count:", future_bookings.count())
        if future_bookings.exists():
            return Response(
                {'detail': 'Cannot delete doctor with upcoming bookings.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        print("Allowed deletion")
        # delete if no bookings is active
        if instance.user:
            instance.user.delete()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AppointmentSlotViewSet(viewsets.ModelViewSet):
    queryset = AppointmentSlot.objects.all()
    serializer_class = AppointmentSlotSerializer
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        # admin only do create, update, delete
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        queryset = super().get_queryset()
        doctor_id = self.request.query_params.get('doctor')
        date = self.request.query_params.get('date')
        is_booked = self.request.query_params.get('is_booked')

        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)
        if date:
            queryset = queryset.filter(date=date)
        if is_booked is not None:
            queryset = queryset.filter(is_booked=is_booked.lower() == 'true')
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
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        try:
            slot = serializer.validated_data['slot']
            slot.is_booked = True
            slot.save()

            patient_id = self.request.data.get('patient')
            if patient_id:
                patient = User.objects.get(id=patient_id)
                serializer.save(patient=patient)
            else:
                serializer.save(patient=self.request.user)
        except Exception as e:
            import traceback
            print("Error in perform_create:", str(e))
            traceback.print_exc()
            raise

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or hasattr(user, 'doctor'):
            return Booking.objects.all()
        return Booking.objects.filter(patient=user)