from rest_framework import serializers
from .models import Patient, Doctor, Clinic, Available, Appointment, Specialization, Feedback, CustomUser
import re

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password', 'phone_number', 'user_type')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_phone_number(self, value):
        if value and not re.match(r'^\+?1?\d{9,15}$', value):
            raise serializers.ValidationError("Phone number must be entered in the format: '+966500000000'")
        return value

class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(required=True)

    class Meta:
        model = Patient
        fields = '__all__'

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        # Force the user_type into the dictionary to avoid duplicate kwargs
        user_data['user_type'] = 'patient'
        user = CustomUser.objects.create_user(**user_data)
        patient = Patient.objects.create(user=user, **validated_data)
        return patient


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(required=True)
    # This allows the API to accept/return the specialization name instead of the ID
    specialization = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Specialization.objects.all()
    )

    class Meta:
        model = Doctor
        fields = '__all__'

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        # Force the user_type into the dictionary to avoid duplicate kwargs
        user_data['user_type'] = 'doctor'
        user = CustomUser.objects.create_user(**user_data)
        doctor = Doctor.objects.create(user=user, **validated_data)
        return doctor


class ClinicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinic
        fields = '__all__'

class AvailableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Available
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'

class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = '__all__'

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'