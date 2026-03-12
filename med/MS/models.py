from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('clinic', 'Clinic'),
    )
    phone_number = models.CharField(max_length=15, blank=True, null=True, unique=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='patient')

    def __str__(self):
        return self.username

class Clinic(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=100)
    phone = models.CharField(max_length=10)
    email = models.EmailField(max_length=100) # Updated to EmailField

    def __str__(self):
        return self.name

class Specialization(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Patient(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='patient_profile')
    age = models.IntegerField(null=True, blank=True)
    gender_choices = [('male', 'Male'), ('female', 'Female')]
    gender = models.CharField(max_length=10, choices=gender_choices, null=True, blank=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"

class Doctor(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='doctor_profile')
    age = models.IntegerField(null=True, blank=True)
    gender_choices = [('male', 'Male'), ('female', 'Female')]
    gender = models.CharField(max_length=10, choices=gender_choices, null=True, blank=True)
    price = models.IntegerField(null=True, blank=True)
    specialization = models.ForeignKey(Specialization, on_delete=models.CASCADE, related_name='doctors', null=True, blank=True)
    clinic_name = models.CharField(max_length=250 ,null=True, blank=True)
    qualification = models.CharField(max_length=100, null=True, blank=True)
    Med_id = models.CharField(max_length=20, null=True, blank=True)
    about_me = models.TextField(max_length=250, null=True, blank=True)
    years_of_experience = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"Dr. {self.user.first_name} {self.user.last_name}"

class Available(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    status = models.BooleanField()


class Appointment(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    status = models.BooleanField()
    def __str__(self):
        return "patient:  " +self.patient.first_name +"       Dr:"+ self.doctor.first_name +"\n  " + self.date.strftime("%d/%m/%Y")

class Feedback(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    feedback = models.CharField(max_length=250)
    rating = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='rating')
    def __str__(self):
        return self.appointment.patient.first_name

@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.user_type == 'doctor':
            Doctor.objects.create(user=instance)
        elif instance.user_type == 'patient':
            Patient.objects.create(user=instance)

