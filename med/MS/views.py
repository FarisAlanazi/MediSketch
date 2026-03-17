from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .serializers import UserSerializer, DoctorSerializer, PatientSerializer, FeedbackSerializer, \
    SpecializationSerializer
from .models import CustomUser, Doctor, Patient, Feedback, Specialization


# frontend call to get the CSRF cookie
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
            # secure session and sets the HttpOnly cookie
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

    def post(self, request):
        #deletes the session from the database and clears the cookie
        logout(request)
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)




class User_view(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        # Allow anyone to register (create)
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]


class Doctor_view(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "user_id": user.id,
            "username": user.username,
            "user_type": user.user_type,

        })


class CurrentUserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        age = None
        gender = None

        if user.user_type == 'patient' and hasattr(user, 'patient_profile'):
            age = user.patient_profile.age
            gender = user.patient_profile.gender

        elif user.user_type == 'doctor' and hasattr(user, 'doctor_profile'):
            age = user.doctor_profile.age
            gender = user.doctor_profile.gender

        return Response({
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "user_type": user.user_type,
            "age": age,
            "gender": gender,
        })

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


class CurrentUserProfileView(APIView):#WRITTEN BY HAMZAH, ALLOW THE FRONT END TO GET USER'S INFO {API > /profile/me/}
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        age = None
        gender = None

        if user.user_type == 'patient' and hasattr(user, 'patient_profile'):
            age = user.patient_profile.age
            gender = user.patient_profile.gender

        elif user.user_type == 'doctor' and hasattr(user, 'doctor_profile'):
            age = user.doctor_profile.age
            gender = user.doctor_profile.gender

        return Response({
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "user_type": user.user_type,
            "age": age,
            "gender": gender,
        })

    def patch(self, request): #ADDED BY HAMZAH {ALLOW THE FRONT END TO UPDATE USERS' INFO} {API (push) > /profile/me/}
        user = request.user
        data = request.data

        if "first_name" in data:
            user.first_name = data.get("first_name")

        if "last_name" in data:
            user.last_name = data.get("last_name")

        if "email" in data:
            user.email = data.get("email")

        if "phone_number" in data:
            user.phone_number = data.get("phone_number")

        user.save()

        if user.user_type == 'patient' and hasattr(user, 'patient_profile'):
            profile = user.patient_profile

            if "age" in data:
                profile.age = data.get("age")

            if "gender" in data:
                profile.gender = data.get("gender")

            profile.save()

        elif user.user_type == 'doctor' and hasattr(user, 'doctor_profile'):
            profile = user.doctor_profile

            if "age" in data:
                profile.age = data.get("age")

            if "gender" in data:
                profile.gender = data.get("gender")

            profile.save()

        age = None
        gender = None

        if user.user_type == 'patient' and hasattr(user, 'patient_profile'):
            age = user.patient_profile.age
            gender = user.patient_profile.gender

        elif user.user_type == 'doctor' and hasattr(user, 'doctor_profile'):
            age = user.doctor_profile.age
            gender = user.doctor_profile.gender

        return Response({
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "user_type": user.user_type,
            "age": age,
            "gender": gender,
        }, status=status.HTTP_200_OK)

    def put(self, request):
        return self.patch(request)

class Patient_view(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]



class Feedback_view(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]


class Specialization_view(viewsets.ModelViewSet):
    queryset = Specialization.objects.all()
    serializer_class = SpecializationSerializer
    permission_classes = [IsAuthenticated]