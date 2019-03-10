from django.shortcuts import render, get_object_or_404
from django.shortcuts import redirect
from django.utils import timezone
from .models import Canal_Data, Hakra

# Create your views here.
def main_display(request):
    canal_data = Canal_Data.objects.filter(start_time__lte=timezone.now()).order_by('start_time')
    return render(request, 'canals/main_display.html', {'data': data})


def (request):
    canal_data = Canal_Data.objects.filter(start_time__lte=timezone.now()).order_by('start_time')
    return render(request, 'canals/main_display.html', {'data': data})
