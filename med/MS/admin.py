from django.contrib import admin
from .models import CustomUser, Clinic, Patient, Specialization, Doctor, Available, Appointment, Feedback

admin.site.register(CustomUser)
admin.site.register(Clinic)
admin.site.register(Patient)
admin.site.register(Specialization)
admin.site.register(Doctor)
admin.site.register(Available)