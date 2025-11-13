# 🏆 Proyecto Torneo Vallejo

Sistema de gestión para el Torneo Recreativo de Microfútbol - Urbanización Vallejo

## 📋 Requisitos Previos

- **Docker** y **Docker Compose** instalados
- **Node.js 20+** (solo para frontend local)
- **Git**

## 🚀 Inicio Rápido

### 1. Clonar el repositorio (si aplica)

```bash
git clone <repository-url>
cd torneo-vallejo
```

### 2. Iniciar Docker Desktop

Asegúrate de que Docker Desktop esté corriendo antes de continuar.

### 3. Levantar Backend + MongoDB

```bash
# Desde la raíz del proyecto
docker-compose up -d --build
```

Este comando levantará:
- ✅ **MongoDB** en puerto `27017`
- ✅ **Backend API** en puerto `5000`
- ✅ **Mongo Express** (Admin UI) en puerto `8081`

### 4. Verificar que todo esté funcionando

#### Opción 1: Ver logs de los contenedores

```bash
# Ver todos los logs
docker-compose logs -f

# Ver solo logs del backend
docker-compose logs -f backend

# Ver solo logs de MongoDB
docker-compose logs -f mongodb
```

#### Opción 2: Health Check

Abre tu navegador y visita:

```
http://localhost:5000/health
```

Deberías ver algo como:

```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "uptime": 10.5,
  "environment": "development",
  "database": {
    "connected": true,
    "status": "connected",
    "host": "mongodb",
    "name": "torneo_vallejo"
  },
  "memory": {
    "heapUsed": "25 MB",
    "heapTotal": "35 MB"
  }
}
```

#### Opción 3: Endpoint de prueba

```
http://localhost:5000/api/v1/test
```

### 5. Acceder a Mongo Express (opcional)

Para ver la base de datos visualmente:

```
http://localhost:8081
```

**Credenciales:**
- Usuario: `admin`
- Contraseña: `admin`

---

## 📦 Servicios Disponibles

| Servicio | Puerto | URL |
|----------|--------|-----|
| **Backend API** | 5000 | http://localhost:5000 |
| **MongoDB** | 27017 | mongodb://localhost:27017 |
| **Mongo Express** | 8081 | http://localhost:8081 |

---

## 🛠️ Comandos Útiles de Docker

### Ver estado de contenedores

```bash
docker-compose ps
```

### Detener todos los contenedores

```bash
docker-compose down
```

### Detener y eliminar volúmenes (⚠️ borra la base de datos)

```bash
docker-compose down -v
```

### Reconstruir contenedores después de cambios

```bash
docker-compose up -d --build
```

### Ejecutar comandos dentro del contenedor del backend

```bash
# Entrar al contenedor
docker exec -it torneo-vallejo-backend sh

# Ejecutar un comando específico
docker exec -it torneo-vallejo-backend npm run seed
```

### Ver logs en tiempo real

```bash
docker-compose logs -f backend
```

---

## 🗂️ Estructura del Proyecto

```
torneo-vallejo/
├── backend/              # API REST con Node.js + Express + MongoDB
│   ├── src/
│   │   ├── features/     # Módulos por funcionalidad
│   │   ├── core/         # Configuración base
│   │   └── shared/       # Código compartido
│   ├── Dockerfile        # Producción
│   ├── Dockerfile.dev    # Desarrollo
│   └── package.json
│
├── frontend/             # Next.js + React + Tailwind (próximamente)
│
└── docker-compose.yml    # Orquestación de contenedores
```

---

## 🔍 Health Checks Implementados

### Backend Health Check

El backend incluye un endpoint `/health` que verifica:

- ✅ Conexión a MongoDB
- ✅ Estado de la base de datos
- ✅ Uso de memoria
- ✅ Uptime del servidor

### MongoDB Health Check

Docker verifica automáticamente que MongoDB esté respondiendo antes de iniciar el backend.

### Verificar Health desde Docker

```bash
# Ver health del backend
docker inspect torneo-vallejo-backend | grep -A 10 Health

# Ver health de MongoDB
docker inspect torneo-vallejo-mongodb | grep -A 10 Health
```

---

## 🧪 Testing de la Configuración

### 1. Verificar que MongoDB inicializó correctamente

```bash
# Ver logs de MongoDB
docker-compose logs mongodb
```

Deberías ver:
```
✅ Base de datos inicializada correctamente
✅ Colecciones creadas: usuarios, equipos, jugadores, torneos, fases, partidos
✅ Índices creados para optimizar consultas
```

### 2. Verificar que el backend conectó a MongoDB

```bash
# Ver logs del backend
docker-compose logs backend
```

Deberías ver:
```
✅ MongoDB conectado: mongodb
📊 Base de datos: torneo_vallejo
🚀 Servidor corriendo en puerto 5000
```

### 3. Test manual con curl

```bash
# Health check
curl http://localhost:5000/health

# Endpoint de prueba
curl http://localhost:5000/api/v1/test

# Root
curl http://localhost:5000/
```

---

## 🐛 Troubleshooting

### Problema: "Cannot connect to Docker daemon"

**Solución:** Inicia Docker Desktop y espera a que esté completamente activo.

### Problema: "Port already in use"

**Solución:** Otro servicio está usando el puerto. Detén el servicio o cambia el puerto en `docker-compose.yml`.

```bash
# Ver qué está usando el puerto 5000
lsof -i :5000

# Matar el proceso
kill -9 <PID>
```

### Problema: Backend no conecta a MongoDB

**Solución:**

```bash
# Reiniciar todos los contenedores
docker-compose restart

# Ver logs de ambos servicios
docker-compose logs mongodb backend
```

### Problema: "unhealthy" en health check

**Solución:** Revisa los logs del backend:

```bash
docker-compose logs backend
```

---

## 📝 Variables de Entorno

El archivo `.env.development` ya está configurado para desarrollo local con Docker.

Para producción, copia `.env.example` a `.env.production` y modifica:

```env
NODE_ENV=production
MONGODB_URI=<tu-mongodb-uri-de-produccion>
JWT_SECRET=<tu-secreto-jwt-seguro>
CLOUDINARY_CLOUD_NAME=<tu-cloud-name>
CLOUDINARY_API_KEY=<tu-api-key>
CLOUDINARY_API_SECRET=<tu-api-secret>
```

---

## 🎯 Próximos Pasos

1. ✅ Configuración de Docker completada
2. ✅ Health checks implementados
3. ✅ Conexión a MongoDB verificada
4. ⏳ Desarrollar módulos de la API
5. ⏳ Configurar frontend

---

## 📚 Documentación Adicional

- [Documentación de Docker](https://docs.docker.com/)
- [Documentación de MongoDB](https://docs.mongodb.com/)
- [Documentación de Express](https://expressjs.com/)
- [Documentación de Mongoose](https://mongoosejs.com/)

---

## 👨‍💻 Comandos de Desarrollo

```bash
# Ver estructura de directorios
ls -R backend/src

# Verificar contenedores activos
docker ps

# Ver uso de recursos
docker stats

# Limpiar todo (contenedores, volúmenes, imágenes)
docker system prune -a --volumes
```

---

**¡Listo para codear! 🚀**
