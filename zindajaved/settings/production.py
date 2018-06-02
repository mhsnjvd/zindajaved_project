# -*- coding: utf-8 -*-
from .base import *

# SECURITY WARNING: don't run with debug turned on in production!

try:
    get_env_variable('RUNNING_LOCAL')
    RUNNING_LOCAL = True
except ImproperlyConfigured:
    RUNNING_LOCAL = False

if RUNNING_LOCAL:
    DEBUG = True
    ALLOWED_HOSTS = ['localhost']
    # STATICFILES_DIRS should be set for local use
    STATICFILES_DIRS = (
        os.path.join(BASE_DIR, "static"),
    )
else:
    DEBUG = False
    ALLOWED_HOSTS = ['www.zindajaved.com']
    SSL_CLASS = ['sslify.middleware.SSLifyMiddleware']
    MIDDLEWARE_CLASSES = SSL_CLASS + MIDDLEWARE_CLASSES
    SECURE_SSL_REDIRECT = True
    # pythonanywher requires STATIC_ROOT to be set and 
    STATIC_ROOT = os.path.join(BASE_DIR, "static")


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.9/howto/static-files/

STATIC_URL = '/static/'


DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': get_env_variable('DATABASE_NAME'),
            'TEST_NAME': get_env_variable('TEST_DATABASE_NAME'),
            'TEST': { 'NAME': get_env_variable('TEST_DATABASE_NAME'), },
            'USER': get_env_variable('DATABASE_USER'),
            'PASSWORD': get_env_variable('DATABASE_PASSWORD'),
            'HOST': get_env_variable('DATABASE_HOSTNAME'),
            'PORT': '',
            }
        }
