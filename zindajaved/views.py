# -*- coding: utf-8 -*-
from django.shortcuts import render

def home(request):
    return render(request, "zindajaved/index.html", {})

def thesis(request):
    return render(request, "zindajaved/thesis.html", {})
