from django.shortcuts import render

from django.views.decorators import gzip
from django.http import StreamingHttpResponse
import cv2
import threading


def index(request):
    return render(request, 'index.html')

def main(request):
    return render(request,'home.html')

def about(request):
    return render(request,'about_us.html')