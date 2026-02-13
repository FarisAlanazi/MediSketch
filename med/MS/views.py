from django.shortcuts import render
from rest_framework import generics
from rest_framework.authentication import BasicAuthentication
from .models import CustomUser
from .serializers import UserSerializer, DoctorSerializer
from rest_framework.response import Response
from rest_framework.views import APIView

class UserCreate(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

class Doctor_view(generics.ListAPIView):
    queryset = CustomUser.objects.filter(user_type='Doctor')
    serializer_class = DoctorSerializer
class User_view(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer(many=True)

