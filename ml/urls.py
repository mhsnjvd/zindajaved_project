from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^list', views.problem_list, name='problem_list'),
]
