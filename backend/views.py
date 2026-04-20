# backend/tasks/views.py

from rest_framework import viewsets, mixins
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    """
    ViewSet profesional:
      GET    /api/tasks/      → lista todas las tareas
      POST   /api/tasks/      → crea una tarea
      DELETE /api/tasks/{id}/ → elimina una tarea
    Solo expone los endpoints necesarios usando Mixins.
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
