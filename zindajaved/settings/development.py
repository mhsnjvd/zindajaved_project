# -*- coding: utf-8 -*-
from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True
ALLOWED_HOSTS = []

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.9/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, "static"),
)

DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': get_env_variable('DATABASE_NAME'),
            'USER': get_env_variable('DATABASE_USER'),
            'PASSWORD': get_env_variable('DATABASE_PASSWORD'),
            'HOST': '',
            'PORT': '',
            }
        }
