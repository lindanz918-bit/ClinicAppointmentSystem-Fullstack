from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import Doctor, AppointmentSlot, Booking




class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)
    group = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(), write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'is_active', 'is_staff', 'date_joined', 'groups', 'group'
        ]
        read_only_fields = ['date_joined']

    def create(self, validated_data):
        group = validated_data.pop('group', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password='123456',  # 默认密码
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        if group:
            user.groups.add(group)
            if group.name == 'Doctor':
                self._create_or_update_doctor(user)
        else:
            patient_group, _ = Group.objects.get_or_create(name='Patient')
            user.groups.add(patient_group)
        return user

    def update(self, instance, validated_data):
        print("validated_data:", validated_data)
        try:
            group = validated_data.pop('group', None)
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            # update Group
            instance.groups.clear()
            if group:
                instance.groups.add(group)
                if group.name == 'Doctor':
                    self._create_or_update_doctor(instance)
            return instance
        except Exception as e:
            print("Error in update:", str(e))
            import traceback
            traceback.print_exc()
            raise

    def _create_or_update_doctor(self, user):
        doc_email = user.email
        if Doctor.objects.filter(email=doc_email).exclude(username=user.username).exists():
            doc_email = f"{user.username}_{user.email}"

        doctor, created = Doctor.objects.get_or_create(
            user=user,
            defaults={
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': doc_email,
                'specialization': 'General',
                'phone': 'N/A',
            }
        )
        if not created:
            doctor.username = user.username
            doctor.first_name = user.first_name
            doctor.last_name = user.last_name
            doctor.email = doc_email
            doctor.save()

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class DoctorSerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer(read_only=True)

    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'username', 'first_name', 'last_name',
            'specialization', 'email', 'phone', 'experience'
        ]

    def create(self, validated_data):
        # create doctor user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password='123456',  # default password
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        # add to the doctor group
        doctor_group, _ = Group.objects.get_or_create(name='Doctor')
        user.groups.add(doctor_group)

        # create doctor and related user
        doctor = Doctor.objects.create(user=user, **validated_data)
        return doctor

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        if instance.user:
            user = instance.user
            user.username = instance.username
            user.first_name = instance.first_name
            user.last_name = instance.last_name
            user.email = instance.email
            user.save()
        return instance

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