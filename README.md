# ToDoIt

Aplicación de gestión de tareas con soporte para listas personalizadas, prioridades, fechas límite y estadísticas. Diseñada con una identidad visual propia: tipografía Plus Jakarta Sans, paleta teal y modo oscuro incluido.

## Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Base de datos:** SQLite gestionada con Prisma ORM
- **Contenedores:** Docker + Docker Compose

---

## Ejecución en desarrollo

Requiere Docker y Docker Compose instalados.

```bash
git clone https://github.com/ghosthvj/myToDo.git
cd myToDo
docker compose up --build
```

La app queda disponible en:

- Frontend → http://localhost:5173
- Backend API → http://localhost:3000

El código fuente se monta como volumen, por lo que los cambios en `frontend/src` y `backend/src` se reflejan en tiempo real sin reconstruir la imagen.

---

## Ejecución en producción

Las imágenes Docker se publican automáticamente en GitHub Container Registry tras cada commit en `main`. Para desplegar en cualquier servidor con Docker:

```bash
docker compose -f docker-compose.prod.yml up -d
```

La app queda disponible en el puerto **80**. Los datos de SQLite se persisten en un volumen Docker llamado `sqlite_data`.

Para usar una versión específica en lugar de `latest`:

```bash
IMAGE_TAG=sha-a1b2c3d docker compose -f docker-compose.prod.yml up -d
```

### Imágenes disponibles

| Servicio  | Imagen                              |
|-----------|-------------------------------------|
| Backend   | `ghcr.io/ghosthvj/todo-backend`     |
| Frontend  | `ghcr.io/ghosthvj/todo-webui`       |

Ambas imágenes son públicas y no requieren autenticación para descargarse.

---

## Comandos útiles

```bash
docker compose logs -f          # Ver logs en tiempo real (desarrollo)
docker compose down             # Detener y limpiar contenedores
docker compose up --build       # Reconstruir imágenes y levantar
```
