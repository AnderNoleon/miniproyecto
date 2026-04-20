# backend/tasks/serializers.py

from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

    def validate_title(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Título muy corto")
        return value
