"""zindajaved URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
import django.contrib.auth.views


from django.contrib import admin
admin.autodiscover()
from .views import home, thesis

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^thesis$', thesis, name='thesis'),
    url(r'^karaye_daar$', thesis, name='karaye_daar'),
    url(r'^accounts/login/$', django.contrib.auth.views.LoginView.as_view(), name='login'),
    url(r'^accounts/logout/$', django.contrib.auth.views.LogoutView.as_view(), name='logout', kwargs={'next_page': '/blog/list'}),
    url(r'^$', home, name='home'),
    url(r'^blog/', include('blog.urls')),
    url(r'^vis', include('vis.urls')),
    url(r'^vis/', include('vis.urls')),
    #url(r'^ml/', include('ml.urls')),
    #url(r'^canals/', include('canals.urls')),
    url(r'^music/', include('music.urls')),

]
