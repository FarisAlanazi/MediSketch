from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'users', User_view, basename='user')
router.register(r'doctors', Doctor_view, basename='doctor')
router.register(r'patients', Patient_view, basename='patient')
router.register(r'feedbacks', Feedback_view, basename='feedback')
router.register(r'specializations', Specialization_view, basename='specialization')

urlpatterns = [
    path('', include(router.urls)),
    # Anyone can access this view to get the CSRF cookie
    path('csrf/', GetCSRFToken.as_view(), name='api_csrf'),
    # Authentication views for login and logout
    path('login/', LoginView.as_view(), name='api_login'),
    path('logout/', LogoutView.as_view(), name='api_logout'),
]