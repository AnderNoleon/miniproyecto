# backend/tasks/views.py

from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    """
    ViewSet profesional — solo expone los endpoints necesarios:

      GET    /api/tasks/                          → lista tareas del usuario
      GET    /api/tasks/?completed=true           → filtra por estado
      GET    /api/tasks/?search=texto             → busca en el título
      GET    /api/tasks/?page=2                   → navega entre páginas
      GET    /api/tasks/?completed=false&page=1   → combina filtros
      POST   /api/tasks/                          → crea una tarea
      DELETE /api/tasks/{id}/                     → elimina una tarea
    """
    serializer_class   = TaskSerializer
    permission_classes = [IsAuthenticated]

    # Filtrado y búsqueda
    filter_backends  = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['completed']
    search_fields    = ['title']

    def get_queryset(self):
        """Cada usuario solo ve sus propias tareas."""
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Asigna automáticamente el usuario autenticado al crear."""
        serializer.save(user=self.request.user)
