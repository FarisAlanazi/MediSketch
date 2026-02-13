from django.contrib import admin
from .models import  Patient, Specialization, Doctor, Available, Appointment, Clinic, CustomUser

admin.site.register(Patient)
admin.site.register(Specialization)
admin.site.register(Doctor)
admin.site.register(Available)
admin.site.register(Appointment)
admin.site.register(Clinic)
admin.site.register(CustomUser)
