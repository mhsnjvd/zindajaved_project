# -*- coding: utf-8 -*-
from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ['www.zindajaved.com']


SSL_CLASS = ['sslify.middleware.SSLifyMiddleware'];
MIDDLEWARE_CLASSES = SSL_CLASS + MIDDLEWARE_CLASSES;


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.9/howto/static-files/

STATIC_URL = '/static/'

# pythonanywher requires STATIC_ROOT to be set and 
# STATICFILES_DIRS to be unset
STATIC_ROOT = os.path.join(BASE_DIR, "static")
# STATICFILES_DIRS = (
#     os.path.join(BASE_DIR, "static"),
# )

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
