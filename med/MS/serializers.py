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

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user


class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Patient
        fields = '__all__'


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    specialization = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Specialization.objects.all(),
        allow_null=True,
        required=False
    )

    class Meta:
        model = Doctor
        fields = '__all__'

    # 1. ADD THIS TO FIX THE PHONE/EMAIL ALREADY EXISTS ERROR
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove the unique validators from the nested user fields
        # so Django doesn't block the update when the user keeps their current info
        if 'user' in self.fields:
            if 'phone_number' in self.fields['user'].fields:
                self.fields['user'].fields['phone_number'].validators = []
            if 'email' in self.fields['user'].fields:
                self.fields['user'].fields['email'].validators = []
            # If username also throws this error later, uncomment the line below:
            # self.fields['user'].fields['username'].validators = []

    # 2. Keep the update method we added previously
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)

        instance = super().update(instance, validated_data)

        if user_data:
            user_instance = instance.user
            for attr, value in user_data.items():
                setattr(user_instance, attr, value)
            user_instance.save()

        return instance


class ClinicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinic
        fields = '__all__'


class AvailableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Available
        fields = '__all__'
        read_only_fields = ['doctor']


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['patient']


class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = '__all__'


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'