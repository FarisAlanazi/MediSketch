from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('clinic', 'Clinic'),
    )
    phone_number = models.CharField(max_length=15, blank=True, null=True, unique=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='patient')

    def __str__(self):
        return self.username

class Clinic(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=100)
    phone = models.CharField(max_length=10)
    email = models.CharField(max_length=100)
    def __str__(self):
        return self.name


class Patient(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    gender = models.CharField(max_length=10)
    phone = models.CharField(max_length=10)
    email = models.CharField(max_length=100)
    def __str__(self):
        return self.name


class Specialization(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=100)
    def __str__(self):
        return self.name



class Doctor(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    gender = models.CharField(max_length=10)
    phone = models.CharField(max_length=10)
    email = models.CharField(max_length=100)
    price = models.IntegerField()
    specialization = models.ForeignKey(Specialization, on_delete=models.CASCADE)
    clinic_name = models.ForeignKey(Clinic, on_delete=models.CASCADE)
    qualification = models.CharField(max_length=100)
    Med_id = models.CharField(max_length=20)
    def __str__(self):
        return self.name


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
        return "patient:  " +self.patient.name +"       Dr:"+ self.doctor.name +"\n  " + self.date.strftime("%d/%m/%Y")

class Feedback(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    feedback = models.CharField(max_length=250)
    rating = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='rating')
    def __str__(self):
        return self.appointment.patient.name