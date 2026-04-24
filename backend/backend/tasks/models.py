# backend/tasks/models.py

from django.db import models
from django.contrib.auth.models import User


class Task(models.Model):
    user      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title     = models.CharField(max_length=100)
    completed = models.BooleanField(default=False)
    created   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created']

    def __str__(self):
        return self.title
