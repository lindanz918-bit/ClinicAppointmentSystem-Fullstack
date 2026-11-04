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
    # permission_classes = [permissions.IsAdminUser]
    permission_classes = [permissions.AllowAny]

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
    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        user = self.get_object()
        now = timezone.now()

        # check future bookings
        future_bookings = Booking.objects.filter(
            slot__doctor=user.doctor if hasattr(user, 'doctor') else None,
            slot__date__gte=now.date()
        ).exclude(
            slot__date=now.date(),
            slot__time__lt=now.time()
        ) if hasattr(user, 'doctor') else Booking.objects.none()

        if future_bookings.exists():
            return Response(
                {'detail': 'Cannot suspend doctor with upcoming bookings.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.is_active = False
        user.save()
        return Response({'detail': 'User suspended successfully.'})

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()

        # suspend user（is_active=False）
        if 'is_active' in request.data and request.data['is_active'] is False:
            now = timezone.now()

            # check if there are future bookings
            future_bookings = Booking.objects.none()
            if hasattr(instance, 'doctor'):
                future_bookings = Booking.objects.filter(
                    slot__doctor=instance.doctor,
                    slot__date__gte=now.date()
                ).exclude(
                    slot__date=now.date(),
                    slot__time__lt=now.time()
                )

            if future_bookings.exists():
                return Response(
                    {'detail': 'Cannot suspend doctor with upcoming bookings.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return super().partial_update(request, *args, **kwargs)


class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    # permission_classes = [permissions.IsAdminUser]
    permission_classes = [permissions.AllowAny]


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all().order_by('id')
    serializer_class = DoctorSerializer
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'me']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        if hasattr(request.user, 'doctor'):
            serializer = self.get_serializer(request.user.doctor)
            return Response(serializer.data)
        return Response({'detail': 'Not a doctor'}, status=status.HTTP_404_NOT_FOUND)

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

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # release slot
        slot = instance.slot
        slot.is_booked = False
        slot.save()
        # delete booking
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

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
        queryset = super().get_queryset().order_by('slot__date', 'slot__time')

        mine = self.request.query_params.get('mine')

        # The doctor only see the slots of their own
        if hasattr(user, 'doctor') and not user.is_staff:
            return queryset.filter(slot__doctor=user.doctor)

        # The patient only see the slots of their own
        if mine == 'patient' or (not user.is_staff and not hasattr(user, 'doctor')):
            return queryset.filter(patient=user)

        # The admin see all the slots
        if user.is_staff or user.is_superuser:
            return queryset

        return queryset.filter(patient=user)


    def partial_update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()

            # process doctor comments
            if 'doctor_comments' in request.data:
                instance.doctor_comments = request.data.get('doctor_comments', '')
                instance.save()
                serializer = self.get_serializer(instance)
                return Response(serializer.data)

            # process slot change
            new_slot_id = request.data.get('slot_id')
            if new_slot_id and int(new_slot_id) != instance.slot.id:
                old_slot = instance.slot
                new_slot = AppointmentSlot.objects.get(id=new_slot_id)

                if Booking.objects.filter(slot=new_slot).exists():
                    return Response(
                        {'detail': 'This slot is already booked by another appointment.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                patient = instance.patient
                comments = instance.doctor_comments

                old_slot.is_booked = False
                old_slot.save()
                instance.delete()

                new_slot.is_booked = True
                new_slot.save()

                new_booking = Booking.objects.create(
                    patient=patient,
                    slot=new_slot,
                    doctor_comments=comments
                )

                print("=== Changing slot ===")
                print("Old slot id:", old_slot.id, "is_booked:", old_slot.is_booked)
                print("New slot id:", new_slot.id, "is_booked before:", new_slot.is_booked)
                # ... 释放和占用的代码 ...
                print("Old slot is_booked after:", old_slot.is_booked)
                print("New slot is_booked after:", new_slot.is_booked)

                serializer = self.get_serializer(new_booking)
                return Response(serializer.data)

            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            import traceback
            print("=== Error in partial_update ===")
            print(str(e))
            traceback.print_exc()
            raise
