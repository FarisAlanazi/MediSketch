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
    permission_classes = [IsAuthenticated]


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