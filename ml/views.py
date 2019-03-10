# Create your views here.
from django.shortcuts import render, get_object_or_404
from django.shortcuts import redirect
from django.utils import timezone
from .models import Problem



def problem_list(request):
    problems = Problem.objects.filter(published_date__isnull=True).order_by('created_date')
    return render(request, 'ml/problems.html', {'problems': poroblems})
