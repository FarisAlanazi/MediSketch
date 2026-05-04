from rest_framework import serializers
from .models import Patient, Doctor, Clinic, Available, Appointment, Specialization, Feedback, CustomUser, ClinicInvitation
import re
from django.db.models import Avg

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

class ClinicSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Clinic
        fields = '__all__'


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    specialization = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Specialization.objects.all(),
        allow_null=True,
        required=False
    )

    # ADDED: These calculate the data for your frontend star ratings and availability pills
    rating = serializers.SerializerMethodField()
    available_days = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        # ADDED: 'clinic', 'city', 'profile_image', 'rating', 'available_days' to the explicit list
        fields = [
            'id', 'user', 'clinic', 'city', 'profile_image',
            'age', 'gender', 'price', 'specialization',
            'clinic_name', 'qualification', 'Med_id', 'about_me',
            'years_of_experience', 'is_visible', 'latitude', 'longitude',
            'rating', 'available_days'
        ]

    def get_rating(self, obj):
        # Safely calculates the average rating from the related Feedback model
        aggregated_rating = obj.feedback_set.aggregate(value=Avg("rating"))["value"]
        if aggregated_rating is None:
            return None
        return round(float(aggregated_rating), 1)

    def get_available_days(self, obj):
        # Builds the unique list of available days for the frontend cards
        day_names = []
        for available_slot in obj.available_set.filter(status=True).order_by("date", "time"):
            day_name = available_slot.date.strftime("%A")
            if day_name not in day_names:
                day_names.append(day_name)
        return day_names

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'user' in self.fields:
            if 'phone_number' in self.fields['user'].fields:
                self.fields['user'].fields['phone_number'].validators = []
            if 'email' in self.fields['user'].fields:
                self.fields['user'].fields['email'].validators = []

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        instance = super().update(instance, validated_data)

        if user_data:
            user_instance = instance.user
            for attr, value in user_data.items():
                setattr(user_instance, attr, value)
            user_instance.save()

        return instance

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


    def to_representation(self, instance):
        response = super().to_representation(instance)
        # Expands the ID into full objects so React can read the names
        response['doctor'] = DoctorSerializer(instance.doctor).data
        response['patient'] = PatientSerializer(instance.patient).data
        return response

class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = '__all__'

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'

class ClinicInvitationSerializer(serializers.ModelSerializer):
    clinic_name = serializers.ReadOnlyField(source='clinic.name')

    class Meta:
        model = ClinicInvitation
        fields = ['id', 'status', 'created_at', 'clinic', 'doctor', 'clinic_name']