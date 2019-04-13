from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone
import numpy as np
from .models import IRR, Company

# Create your views here.

def post_company_data(request, company_ticker='FB'):
    irr_obj = IRR()

    # Get all valid tickers and solve their irrs
    # [TODO] this must be cached or made static to 
    # avoid multiple needless computation
    tickers_irrs = irr_obj.get_tickers_and_valid_irrs()
    company_tickers = sorted(list(tickers_irrs.keys()))

    
    # Construct the company in question
    c = irr_obj.get_company_object(company_ticker)
    data = c.get_residual_frame()


    # Filter irrs for the sector that the company belongs to
    sector_tickers = irr_obj.get_sector_tickers(company_ticker)
    data['sector_irr'] = {tkr: tickers_irrs[tkr] for tkr in sector_tickers if tkr in tickers_irrs.keys()}


    # Pack this all into a context
    context = {
                'company_tickers': company_tickers,
                'data': data,
            }

    # Render the html!
    return render(request, 'vis/company_visualization.html', context)

def post_company_tickers(request):
    # Default view, which selects FaceBook as a company!
    return post_company_data(request, 'FB')


def show_svd(request, matrix=np.array([[1.0, 2.0], [3.0, 4.0]])):
    A = np.random.rand(2,2)
    m = A.shape[0]
    n = A.shape[1]
    U, S, Vh = np.linalg.svd(A)
    context = {'singular_values': list(S)}
    return render(request, 'vis/svd_visualization.html', context)


