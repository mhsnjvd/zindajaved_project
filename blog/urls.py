from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^blog', views.blog, name='blog'),
]
