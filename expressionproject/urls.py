from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("", views.main, name="main"),
    path("", views.about, name="about"),
]