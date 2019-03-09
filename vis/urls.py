from django.urls import path
from . import views

urlpatterns = [
            path('', views.post_company_names, name='index'),
            ]
