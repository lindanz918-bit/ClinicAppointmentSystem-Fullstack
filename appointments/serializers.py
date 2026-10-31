from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Doctor, AppointmentSlot, Booking


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Doctor
        fields = '__all__'


class AppointmentSlotSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(), source='doctor', write_only=True
    )

    class Meta:
        model = AppointmentSlot
        fields = ['id', 'doctor', 'doctor_id', 'date', 'time', 'is_booked']


class BookingSerializer(serializers.ModelSerializer):
    patient = UserSerializer(read_only=True)
    slot = AppointmentSlotSerializer(read_only=True)
    slot_id = serializers.PrimaryKeyRelatedField(
        queryset=AppointmentSlot.objects.filter(is_booked=False),
        source='slot', write_only=True
    )

    class Meta:
        model = Booking
        fields = ['id', 'patient', 'slot', 'slot_id', 'created_at', 'doctor_comments']
        read_only_fields = ['created_at']