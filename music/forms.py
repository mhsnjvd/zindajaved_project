from django import forms
from .models import Raag

class PostForm(forms.ModelForm):

    class Meta:
        model = Raag
        fields = ('title', 'description')
