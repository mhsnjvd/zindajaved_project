from django.db import models

# Create your models here.

from django.utils import timezone


class Problem(models.Model):
    author = models.ForeignKey('auth.User')
    title = models.CharField(max_length=1000)
    subtitle = models.CharField(blank=True, null=True, max_length=1000)
    text = models.TextField()
    created_date = models.DateTimeField(default=timezone.now)
    published_date = models.DateTimeField(blank=True, null=True)

    def publish(self):
        self.published_date = timezone.now()
        self.save()

    def __str__(self):
        return self.title
