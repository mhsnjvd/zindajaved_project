from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone
import numpy as np
from .models import IRR, Company

# Create your views here.

def post_company_data(request, company_ticker='FB'):
    irr_obj = IRR()
    company_tickers = list(irr_obj.get_all_company_tickers())
    random_str = str(np.random.normal())
    company_tickers.append(random_str)
    c = irr_obj.get_company_object(company_ticker)
    data = c.get_residual_frame()
    context = {
                'company_tickers': company_tickers,
                'data': data,
            }
    return render(request, 'vis/company_visualization.html', context)

def post_company_tickers(request):
    return post_company_data(request, 'FB')

