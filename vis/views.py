from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone
import numpy as np
from .models import IRR

# Create your views here.

def post_company_names(request):
    irr_obj = IRR()
    company_names = list(irr_obj.get_all_company_tickers())
    random_str = str(np.random.normal())
    company_names.append(random_str)
    return render(request, 'vis/index.html', {'company_names': company_names})

