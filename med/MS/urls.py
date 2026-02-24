from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'users', User_view, basename='user')
router.register(r'doctors', Doctor_view, basename='doctor')
router.register(r'patients', Patient_view, basename='patient')
router.register(r'feedbacks', Feedback_view, basename='feedback')

urlpatterns = [
    path('', include(router.urls)),
    path('api-token-auth/', CustomAuthToken.as_view(), name='api_token_auth'),
]