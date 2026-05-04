from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'users', User_view, basename='user')
router.register(r'clinics', Clinic_view, basename='clinic')
router.register(r'doctors', Doctor_view, basename='doctor')
router.register(r'patients', Patient_view, basename='patient')
router.register(r'feedbacks', Feedback_view, basename='feedback')
router.register(r'specializations', Specialization_view, basename='specialization')
router.register(r'available', Available_view, basename='available')
router.register(r'appointments', Appointment_view, basename='appointment')
router.register(r'clinic-requests', ClinicInvitationViewSet, basename='clinic-invitation')

urlpatterns = [
    # 1. SPECIFIC PATHS FIRST (To prevent 404s)
    path('clinic-requests/doctor/', ClinicInvitationViewSet.as_view({'get': 'list'}), name='clinic-requests-doctor'),
    path('clinic-requests/clinic/', ClinicInvitationViewSet.as_view({'get': 'list'}), name='clinic-requests-clinic'),

    # 2. ROUTER PATHS SECOND
    path('', include(router.urls)),

    # 3. OTHER PATHS
    path('csrf/', GetCSRFToken.as_view(), name='api_csrf'),
    path('login/', LoginView.as_view(), name='api_login'),
    path('logout/', LogoutView.as_view(), name='api_logout'),
    path('me/', CheckSessionView.as_view(), name='check_session'),

    # Actions for accept/reject
    path('clinic-requests/<int:pk>/accept/', ClinicInvitationViewSet.as_view({'patch': 'accept'}),
         name='clinic-requests-accept'),
    path('clinic-requests/<int:pk>/reject/', ClinicInvitationViewSet.as_view({'patch': 'reject'}),
         name='clinic-requests-reject'),

    # Clinic Dashboard
    path('clinic/doctors/', ClinicDashboardDoctorsView.as_view(), name='clinic-dashboard-doctors'),
    path('clinic/doctors/<int:doctor_id>/', ClinicDashboardDoctorDetailView.as_view(),
         name='clinic-dashboard-doctor-detail'),
    path('clinic/doctors/<int:doctor_id>/availability/', ClinicDashboardAvailabilityView.as_view(),
         name='clinic-dashboard-avail-create'),
    path('clinic/doctors/<int:doctor_id>/availability/<int:slot_id>/', ClinicDashboardAvailabilityDetailView.as_view(),
         name='clinic-dashboard-avail-update'),
    path('clinic/profile/', CheckSessionView.as_view(), name='clinic-profile'),
]