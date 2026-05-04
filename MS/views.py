from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from .serializers import UserSerializer, DoctorSerializer, PatientSerializer, FeedbackSerializer, \
    SpecializationSerializer, AvailableSerializer, AppointmentSerializer, ClinicSerializer, ClinicInvitationSerializer
from .models import CustomUser, Doctor, Patient, Feedback, Specialization, Available, Appointment, Clinic, ClinicInvitation
from rest_framework.decorators import action



@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFToken(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'success': 'CSRF cookie set'})


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({
                "detail": "Successfully logged in.",
                "user_id": user.pk,
                "user_type": user.user_type,
                "username": user.username
            }, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logout(request)
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)


class User_view(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]


class Clinic_view(viewsets.ModelViewSet):
    queryset = Clinic.objects.all()
    serializer_class = ClinicSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class Doctor_view(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    lookup_field = 'user'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class Patient_view(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    lookup_field = 'user'
    permission_classes = [IsAuthenticated]


class Feedback_view(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class Specialization_view(viewsets.ModelViewSet):
    queryset = Specialization.objects.all()
    serializer_class = SpecializationSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class CheckSessionView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "user_type": request.user.user_type,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "email": request.user.email,
            "phone_number": request.user.phone_number,
        })

    def patch(self, request):
        user = request.user
        data = request.data

        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.phone_number = data.get('phone_number', user.phone_number)
        user.save()

        if user.user_type == 'patient' and hasattr(user, 'patient_profile'):
            patient = user.patient_profile
            age_data = data.get('age')
            patient.age = age_data if age_data not in ["", None] else patient.age
            patient.gender = data.get('gender', patient.gender)
            patient.save()

        elif user.user_type == 'doctor' and hasattr(user, 'doctor_profile'):
            doctor = user.doctor_profile

            def get_int(val, default):
                return val if val not in ["", None] else default

            doctor.age = get_int(data.get('age'), doctor.age)
            doctor.price = get_int(data.get('price'), doctor.price)
            doctor.years_of_experience = get_int(data.get('years_of_experience'), doctor.years_of_experience)

            doctor.gender = data.get('gender', doctor.gender)
            doctor.about_me = data.get('about_me', doctor.about_me)
            doctor.clinic_name = data.get('clinic_name', doctor.clinic_name)
            doctor.Med_id = data.get('medical_id', doctor.Med_id)  # Frontend sends 'medical_id'
            doctor.city = data.get('city', doctor.city)
            doctor.latitude = data.get('latitude', doctor.latitude)
            doctor.longitude = data.get('longitude', doctor.longitude)
            spec_id = data.get('specialization')
            if spec_id:
                if spec_id == "empty":
                    doctor.specialization = None
                else:
                    spec_obj = (Specialization.objects.filter(id=spec_id).first() or
                                Specialization.objects.filter(name=spec_id).first())
                    if spec_obj:
                        doctor.specialization = spec_obj

            doctor.save()
        return Response(self.get(request).data, status=status.HTTP_200_OK)

class Available_view(viewsets.ModelViewSet):
    serializer_class = AvailableSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'doctor':
            return Available.objects.filter(doctor__user=user)
        elif user.user_type == 'patient':
            return Available.objects.filter(status=True)
        return Available.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.user_type != 'doctor':
            raise PermissionDenied("Only doctors can create available times.")
        doctor_profile = user.doctor_profile
        serializer.save(doctor=doctor_profile)


class Appointment_view(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'patient':
            return Appointment.objects.filter(patient__user=user)
        elif user.user_type == 'doctor':
            return Appointment.objects.filter(doctor__user=user)
        elif user.user_type == 'clinic':
            # 1. Get the clinic profile for the logged-in user
            clinic = getattr(user, 'clinic_profile', None)
            if clinic:
                # 2. Return appointments for doctors linked to THIS clinic
                return Appointment.objects.filter(doctor__clinic=clinic)
        return Appointment.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        # CRITICAL CHECK: Ensure user is a patient and has a profile
        if user.user_type != 'patient':
            raise PermissionDenied("Only patients can book appointments.")

        patient_profile = getattr(user, 'patient_profile', None)
        if not patient_profile:
            raise ValidationError({"detail": "Patient profile not found for this account."})

        doctor = serializer.validated_data.get('doctor')
        date = serializer.validated_data.get('date')
        time = serializer.validated_data.get('time')

        available_slot = Available.objects.filter(
            doctor=doctor, date=date, time=time, status=True
        ).first()

        if not available_slot:
            raise ValidationError({"detail": "This time slot is not available."})

        available_slot.status = False
        available_slot.save()

        serializer.save(patient=patient_profile, status='pending')

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user

        is_doctor = (user.user_type == 'doctor' and instance.doctor.user == user)

        # Consistent clinic check
        clinic = getattr(user, 'clinic_profile', None)
        is_clinic = (user.user_type == 'clinic' and instance.doctor.clinic == clinic)

        if not (is_doctor or is_clinic):
            raise PermissionDenied("You do not have permission to update this appointment.")

        status_update = request.data.get('status')

        # Handle both boolean and string status from frontend
        if status_update in [False, 'declined', 'Reject', 'reject']:
            instance.status = 'declined'
            available_slot = Available.objects.filter(
                doctor=instance.doctor, date=instance.date, time=instance.time
            ).first()
            if available_slot:
                available_slot.status = True
                available_slot.save()
        elif status_update in [True, 'accepted', 'Approve', 'approve']:
            instance.status = 'accepted'

        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class ClinicInvitationViewSet(viewsets.ModelViewSet):
    queryset = ClinicInvitation.objects.all()
    serializer_class = ClinicInvitationSerializer

    def create(self, request, *args, **kwargs):
        clinic = getattr(request.user, 'clinic_profile', None)
        if not clinic:
            raise PermissionDenied("Only clinics can send invitations.")

        doctor_id = request.data.get('doctor_id')
        if not doctor_id:
            raise ValidationError({"doctor_id": ["Doctor ID is required."]})

        doctor = Doctor.objects.filter(id=doctor_id).first()
        if not doctor:
            raise ValidationError({"doctor_id": ["Doctor not found."]})

        invitation = ClinicInvitation.objects.filter(clinic=clinic, doctor=doctor, status='pending').first()
        if not invitation:
            invitation = ClinicInvitation.objects.create(
                clinic=clinic,
                doctor=doctor,
                status='pending'
            )

        return Response(self.get_serializer(invitation).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'])
    def accept(self, request, pk=None):
        invitation = self.get_object()
        invitation.status = 'accepted'
        invitation.save()
        doctor = invitation.doctor
        doctor.clinic = invitation.clinic
        doctor.save()
        return Response({"status": "accepted"})

    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        invitation = self.get_object()
        invitation.status = 'declined'
        invitation.save()
        return Response({"status": "declined"})


class ClinicDashboardDoctorsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Ensure the logged-in user is actually a clinic
        if request.user.user_type != 'clinic':
            raise PermissionDenied("Only clinics can access this dashboard.")

        clinic = getattr(request.user, 'clinic_profile', None)
        if not clinic:
            return Response({"detail": "Clinic profile not found."}, status=404)

        # This finds all doctors whose 'clinic' field matches this clinic
        doctors = Doctor.objects.filter(clinic=clinic)

        serializer = DoctorSerializer(doctors, many=True)
        return Response(serializer.data)


class ClinicDashboardDoctorDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, doctor_id):
        clinic = request.user.clinic_profile
        doctor = Doctor.objects.filter(id=doctor_id, clinic=clinic).first()
        if doctor:
            # Unlink the doctor from the clinic
            doctor.clinic = None
            doctor.save()
        return Response({"detail": "Doctor removed from clinic."})


class ClinicDashboardAvailabilityView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, doctor_id):
        clinic = request.user.clinic_profile
        doctor = Doctor.objects.filter(id=doctor_id, clinic=clinic).first()
        if not doctor:
            raise PermissionDenied("Doctor not linked to your clinic.")

        slot = Available.objects.create(
            doctor=doctor,
            date=request.data['date'],
            time=request.data['time'],
            status=request.data.get('status', True)
        )
        return Response(AvailableSerializer(slot).data)


class ClinicDashboardAvailabilityDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, doctor_id, slot_id):
        clinic = request.user.clinic_profile
        doctor = Doctor.objects.filter(id=doctor_id, clinic=clinic).first()
        slot = Available.objects.filter(id=slot_id, doctor=doctor).first()

        if not slot:
            raise ValidationError({"detail": "Slot not found."})

        slot.date = request.data.get('date', slot.date)
        slot.time = request.data.get('time', slot.time)
        slot.status = request.data.get('status', slot.status)
        slot.save()

        return Response(AvailableSerializer(slot).data)