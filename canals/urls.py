from django.conf.urls import url
from . import views

urlpatterns = [
        url(r'^$', views.main_display, name='main_display'),
        url(r'^hakra', views, hakra, name= 'hakra'),
    ]

