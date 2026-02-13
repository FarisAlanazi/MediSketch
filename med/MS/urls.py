from django.urls import path
from .views import UserCreate, Doctor_view, User_view

urlpatterns = [
    path('signup/', UserCreate.as_view(), name='signup'),
    path('Doctor/', Doctor_view.as_view(), name='Doctor'),
    path('userview/', User_view.as_view(), name='userview')
]