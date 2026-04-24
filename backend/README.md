# Taskboard — Django REST + React

Proyecto completo de gestión de tareas con autenticación JWT, filtrado, búsqueda y paginación.

---

## Estructura

```
backend/
  requirements.txt
  settings.py
  urls.py
  tasks/
    models.py
    serializers.py
    views.py

frontend/
  src/
    api.js
    App.jsx
```

---

## Backend — Instalación

```bash
# 1. Crear y activar entorno virtual
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Crear el proyecto Django (si es nuevo)
django-admin startproject backend
cd backend
python manage.py startapp tasks

# 4. Copiar los archivos:
#    settings.py  → backend/settings.py
#    urls.py      → backend/urls.py
#    models.py    → backend/tasks/models.py
#    serializers.py → backend/tasks/serializers.py
#    views.py     → backend/tasks/views.py

# 5. Migraciones
python manage.py makemigrations
python manage.py migrate

# 6. Crear superusuario (para login en el frontend)
python manage.py createsuperuser

# 7. Correr el servidor
python manage.py runserver
```

El backend queda disponible en: http://localhost:8000

---

## Endpoints disponibles

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | /api/token/ | Obtener token JWT |
| POST | /api/token/refresh/ | Refrescar token |
| GET | /api/tasks/ | Listar tareas |
| GET | /api/tasks/?search=texto | Buscar por título |
| GET | /api/tasks/?completed=true | Filtrar por estado |
| GET | /api/tasks/?page=2 | Paginación |
| POST | /api/tasks/ | Crear tarea |
| DELETE | /api/tasks/{id}/ | Eliminar tarea |

---

## Frontend — Instalación

```bash
# 1. Crear proyecto React (si es nuevo)
npx create-react-app frontend
cd frontend

# 2. Instalar Axios
npm install axios

# 3. Copiar los archivos:
#    api.js  → src/api.js
#    App.jsx → src/App.jsx

# 4. Correr el servidor de desarrollo
npm start
```

El frontend queda disponible en: http://localhost:3000

---

## Funcionalidades implementadas

- **Autenticación JWT** — Login con usuario/contraseña, token en localStorage
- **Crear tareas** — Con validación (mínimo 3 caracteres)
- **Eliminar tareas** — Solo las propias del usuario autenticado
- **Filtrar por estado** — Completadas / Pendientes / Todas
- **Búsqueda por título** — Búsqueda en tiempo real
- **Paginación** — 5 tareas por página con navegación
- **Aislamiento por usuario** — Cada usuario solo ve sus tareas
