from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.raag_list, name='raag_list'),
    url(r'^list', views.raag_list, name='raag_list'),
    url(r'^raag/(?P<pk>\d+)/$', views.raag_detail, name='raag_detail'),
    url(r'^raag/new/$', views.add_new_raag, name='raag_new'),
    url(r'^raag/(?P<pk>\d+)/edit/$', views.edit_raag, name='edit_raag'),
    url(r'^raag/(?P<pk>\d+)/publish/$', views.publish_raag, name='publish_raag'),
]
