from django.urls import path
from . import views

urlpatterns = [
            path('<company_ticker>', views.post_company_data, name='company_data_view'),
            path('', views.post_company_tickers, name='index'),
            ]

        
