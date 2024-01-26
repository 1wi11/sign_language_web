from django.db import models

class CameraImage(models.Model):
    image = models.ImageField(upload_to="image")
    timestamp = models.DateTimeField(auto_now_add=True)