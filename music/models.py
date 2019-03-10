from django.db import models

# Create your models here.

from django.utils import timezone


class Raag(models.Model):
    title = models.CharField(max_length=1000)
    composer = models.CharField(max_length=1000)
    mood = models.CharField(max_length=1000)
    that = models.CharField(max_length=1000)
    samay = models.CharField(max_length=1000)
    aroh = models.CharField(max_length=1000)
    avaroh = models.CharField(max_length=1000)
    subtitle = models.CharField(blank=True, null=True, max_length=1000)
    
    description = models.TextField()
    entry_creation_date = models.DateTimeField(default=timezone.now)
    entry_publish_date = models.DateTimeField(blank=True, null=True)
    entry_creator = models.ForeignKey('auth.User', on_delete=models.CASCADE)

    def publish(self):
        self.entry_publish_date = timezone.now()
        self.save()

    def __str__(self):
        return self.title
