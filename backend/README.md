# Backend - Sistema de Gestión de Torneo Vallejo

API REST robusta y escalable para la gestión completa del Torneo de Microfútbol Vallejo. Sistema desarrollado con TypeScript, Express y MongoDB, implementando arquitectura limpia, validaciones estrictas y reglas de negocio complejas.

## Características Principales

- **Gestión Completa de Torneos**: Creación y administración de torneos con múltiples fases (grupos, eliminación, liga)
- **Sistema de Equipos y Jugadores**: Registro, validación y control de elegibilidad
- **Validación de Jugadores**: Sistema complejo de aprobación con verificación de documentos y reglamento
- **Calendario Automático**: Generación inteligente de partidos por fase y jornada
- **Gestión de Partidos**: Registro de goles, tarjetas y resultados en tiempo real
- **Tabla de Posiciones**: Cálculo automático de estadísticas y clasificaciones
- **Sistema de Roles**: Administradores, delegados y control de acceso granular
- **Reglas de Negocio Complejas**: 13 tipos de jugadores con cupos y restricciones específicas
- **Seguridad Robusta**: JWT, rate limiting, validación de datos, sanitización NoSQL
- **TypeScript Strict Mode**: Código 100% tipado con máximas garantías de calidad

## Stack Tecnológico

### Core
- **Runtime**: Node.js
- **Framework**: Express.js 4.19
- **Lenguaje**: TypeScript 5.6 (strict mode)
- **Base de datos**: MongoDB 8.3 con Mongoose ODM
- **Autenticación**: JWT (jsonwebtoken + bcryptjs)

### Seguridad
- **Helmet**: Headers HTTP seguros
- **Express Rate Limit**: Protección contra abuso
- **Express Mongo Sanitize**: Prevención de NoSQL injection
- **CORS**: Control de acceso cross-origin
- **Joi**: Validación robusta de datos

### Utilidades
- **Morgan**: Logging de requests
- **Date-fns**: Manejo de fechas
- **Cloudinary**: Almacenamiento de imágenes (fotos de jugadores)
- **Multer**: Upload de archivos
- **PDFKit**: Generación de reportes PDF
- **Dotenv**: Gestión de variables de entorno

### Desarrollo
- **ts-node**: Ejecución de TypeScript en desarrollo
- **Nodemon**: Hot reload
- **tsconfig-paths**: Alias de imports (@/)
- **Docker & Docker Compose**: Contenedorización

## Arquitectura

### Patrón de Arquitectura: Feature-Based + Clean Architecture

```
src/
├── core/                    # Núcleo del sistema
│   ├── config/             # Configuraciones y constantes
│   ├── database/           # Conexión y setup de MongoDB
│   └── middlewares/        # Middlewares globales (auth, errors, validate)
├── features/               # Módulos por dominio (feature-based)
│   ├── auth/              # Autenticación
│   ├── usuarios/          # Gestión de usuarios
│   ├── equipos/           # Gestión de equipos
│   ├── jugadores/         # Gestión de jugadores
│   ├── torneos/           # Gestión de torneos y fases
│   └── partidos/          # Gestión de partidos
├── shared/                # Código compartido
│   └── types/            # Enums, interfaces, tipos globales
├── app.ts                # Configuración de Express
└── server.ts             # Entry point

Cada feature sigue:
feature/
├── controllers/          # Controladores (manejo de requests)
├── services/            # Lógica de negocio
├── models/              # Modelos Mongoose
├── routes/              # Definición de rutas
└── validations/         # Esquemas Joi de validación
```

### Principios Aplicados
- **Separación de responsabilidades**: Controllers → Services → Models
- **Tipado estricto**: TypeScript con strict mode habilitado
- **Validación en capas**: Joi schemas + Mongoose validators
- **Middleware chain**: Autenticación → Autorización → Validación → Controller
- **Error handling centralizado**: Manejo uniforme de errores
- **Alias de imports**: Uso de `@/` para importaciones limpias

## Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** >= 7.0 (o Docker)
- **Docker & Docker Compose** (opcional, recomendado)

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd torneo-vallejo/backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.development

# Editar con tus valores
nano .env.development
```

### 4. Iniciar con Docker (Recomendado)

```bash
# Iniciar todos los servicios (API + MongoDB + Mongo Express)
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Detener
docker-compose down
```

### 5. Iniciar sin Docker

```bash
# Asegurarse de tener MongoDB corriendo localmente
mongod

# Desarrollo con hot reload
npm run dev

# Producción
npm run build
npm start
```

## Variables de Entorno

| Variable | Descripción | Ejemplo | Requerida |
|----------|-------------|---------|-----------|
| `NODE_ENV` | Entorno de ejecución | `development` / `production` | Sí |
| `PORT` | Puerto del servidor | `5000` | Sí |
| `MONGODB_URI` | URI de conexión a MongoDB | `mongodb://localhost:27017/torneo_vallejo` | Sí |
| `JWT_SECRET` | Secret para firmar tokens (min 32 caracteres) | `your_super_secret_key_min_32_chars` | Sí |
| `JWT_EXPIRE` | Tiempo de expiración del token | `7d` | Sí |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud de Cloudinary | `your_cloud_name` | No |
| `CLOUDINARY_API_KEY` | API key de Cloudinary | `123456789012345` | No |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary | `your_api_secret` | No |
| `CORS_ORIGIN` | Origen permitido para CORS | `http://localhost:3000` | Sí |
| `RATE_LIMIT_WINDOW_MS` | Ventana de rate limiting (ms) | `900000` (15 min) | No |
| `RATE_LIMIT_MAX_REQUESTS` | Máximo de requests por ventana | `100` | No |

## Esquema de Base de Datos

### Colecciones Principales

#### 1. **Usuarios** (`usuarios`)
Gestión de usuarios del sistema con diferentes roles.

```typescript
{
  email: string;              // Único, lowercase
  password: string;           // Hasheado con bcrypt
  nombre: string;
  apellido: string;
  rol: 'ADMIN' | 'DELEGADO';
  equipoId?: ObjectId;        // Solo si es DELEGADO
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  createdAt: Date;
  updatedAt: Date;
}
```

**Índices**: `email`, `rol`, `equipoId`

#### 2. **Torneos** (`torneos`)
Configuración y gestión de torneos.

```typescript
{
  nombre: string;
  descripcion?: string;
  año: number;
  fechaInicio: Date;
  fechaFin: Date;
  estado: 'CONFIGURACION' | 'REGISTRO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';
  equipos: ObjectId[];        // Ref: Equipo
  fases: ObjectId[];          // Ref: Fase
  estadisticas: {
    totalEquipos: number;
    totalJugadores: number;
    totalPartidos: number;
    golesAnotados: number;
    tarjetasAmarillas: number;
    tarjetasRojas: number;
  };
  premios?: {
    primerLugar: number;
    segundoLugar: number;
    tercerLugar: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Virtuals**: `numeroEquipos`, `numeroFases`

#### 3. **Equipos** (`equipos`)
Información de equipos participantes.

```typescript
{
  nombre: string;             // Único
  delegadoId: ObjectId;       // Ref: Usuario
  torneoId: ObjectId;         // Ref: Torneo
  jugadores: ObjectId[];      // Ref: Jugador
  colores: {
    principal: string;
    secundario: string;
  };
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'ELIMINADO';
  createdAt: Date;
  updatedAt: Date;
}
```

**Virtuals**: `numeroJugadores`
**Métodos**: `calcularEstadisticas()`, `puedeAgregarJugador(tipo)`

#### 4. **Jugadores** (`jugadores`)
Registro de jugadores con validación compleja.

```typescript
{
  // Datos personales
  nombre: string;
  apellido: string;
  cedula: string;             // Único, 6-15 dígitos
  fechaNacimiento: Date;      // Edad: 16-60 años
  telefono: string;
  email?: string;
  direccion: string;
  foto?: string;              // URL Cloudinary

  // Datos deportivos
  posicion: 'PORTERO' | 'DEFENSA' | 'VOLANTE' | 'DELANTERO';
  numeroCamiseta: number;     // 1-20, único por equipo
  tipo: TipoJugador;          // Ver tipos abajo

  // Relación
  equipoId: ObjectId;         // Ref: Equipo

  // Documentos
  documentos: [{
    tipo: TipoDocumento;
    url: string;
    nombreArchivo: string;
    uploadedAt: Date;
  }];

  // Validación
  estadoValidacion: 'PENDIENTE' | 'VALIDADO' | 'RECHAZADO';
  observaciones?: string;
  validadoPor?: ObjectId;     // Ref: Usuario
  fechaValidacion?: Date;

  createdAt: Date;
  updatedAt: Date;
}
```

**13 Tipos de Jugador**:
1. `HABITANTE_PROPIETARIO` - Habitante propietario
2. `HABITANTE_HIJO` - Hijo de habitante
3. `HABITANTE_ARRENDATARIO` - Habitante arrendatario
4. `DOCENTE_ELDORADO` - Docente I.E. El Dorado
5. `TRABAJADOR_ELDORADO` - Trabajador I.E. El Dorado
6. `ESTUDIANTE_ELDORADO` - Estudiante I.E. El Dorado
7. `PADRE_ELDORADO` - Padre de familia I.E. El Dorado
8. `DOCENTE_FUNDACION` - Docente Fundación Vallejo
9. `TRABAJADOR_FUNDACION` - Trabajador Fundación Vallejo
10. `PADRE_FUNDACION` - Padre de familia Fundación Vallejo
11. `EXTRANJERO_HABITANTE` - Extranjero con aval de habitante
12. `EXTRANJERO_ELDORADO` - Extranjero con aval de I.E. El Dorado
13. `EXTRANJERO_FUNDACION` - Extranjero con aval de Fundación

**Virtuals**: `edad`, `nombreCompleto`
**Métodos**: `calcularEdad()`, `esExtranjero()`, `validarReglamento()`

#### 5. **Fases** (`fases`)
Fases del torneo (grupos, eliminación, etc).

```typescript
{
  nombre: string;
  torneoId: ObjectId;         // Ref: Torneo
  formato: 'GRUPOS' | 'ELIMINACION_DIRECTA' | 'LIGA';
  orden: number;
  equiposParticipantes: ObjectId[];  // Ref: Equipo
  partidos: ObjectId[];       // Ref: Partido
  configuracion: {
    // Para GRUPOS
    numeroGrupos?: number;
    equiposPorGrupo?: number;
    clasificanPorGrupo?: number;
    eliminanPorGrupo?: number;
    partidoIdaVuelta?: boolean;

    // Común
    puntosVictoria?: number;
    puntosEmpate?: number;
    puntosDerrota?: number;
    criteriosDesempate?: string[];
  };
  estado: 'CONFIGURACION' | 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA';
  fechaInicio?: Date;
  fechaFin?: Date;
  clasificados: ObjectId[];   // Ref: Equipo
  createdAt: Date;
  updatedAt: Date;
}
```

**Virtuals**: `numeroEquipos`, `numeroPartidos`
**Métodos**: `calcularTablaPosiciones()`, `getClasificados()`

#### 6. **Partidos** (`partidos`)
Registro de partidos y resultados.

```typescript
{
  faseId: ObjectId;           // Ref: Fase
  jornada: number;
  grupo?: string;             // 'A', 'B', etc.
  equipoLocal: ObjectId;      // Ref: Equipo
  equipoVisitante: ObjectId;  // Ref: Equipo
  fecha: Date;
  cancha: string;

  // Resultado
  golesLocal: number;
  golesVisitante: number;
  estado: 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO' | 'APLAZADO';

  // Eventos
  goles: [{
    jugadorId: ObjectId;      // Ref: Jugador
    equipoId: ObjectId;       // Ref: Equipo
    minuto: number;
    tipo: 'NORMAL' | 'PENAL' | 'AUTOGOL';
  }];

  tarjetas: [{
    jugadorId: ObjectId;      // Ref: Jugador
    equipoId: ObjectId;       // Ref: Equipo
    tipo: 'AMARILLA' | 'ROJA';
    minuto: number;
    motivo?: string;
  }];

  observaciones?: string;
  arbitro?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Índices**: `faseId`, `equipoLocal`, `equipoVisitante`, `estado`, `fecha`

## Reglas de Negocio del Torneo

### Reglamento General

```typescript
const REGLAMENTO = {
  // Composición de equipos
  MAX_JUGADORES_POR_EQUIPO: 16,
  MIN_JUGADORES_POR_EQUIPO: 11,

  // Cupos especiales
  MAX_EXTRANJEROS: 3,
  MAX_DOCENTES_EL_DORADO: 2,
  MAX_DOCENTES_FUNDACION: 2,

  // Restricciones de edad
  EDAD_MINIMA_GENERAL: 16,
  EDAD_MAXIMA_GENERAL: 60,
  EDAD_MINIMA_EXTRANJEROS: 26,

  // Números de camiseta
  NUMERO_CAMISETA_MIN: 1,
  NUMERO_CAMISETA_MAX: 20,

  // Bonificaciones
  BONIFICACION_PRIMER_LUGAR: 0.75,
  BONIFICACION_SEGUNDO_LUGAR: 0.50,
};
```

### Tipos de Jugadores y Cupos

1. **Jugadores Extranjeros** (máx 3 por equipo, edad mín 26 años):
   - Extranjero con aval de habitante
   - Extranjero con aval de I.E. El Dorado
   - Extranjero con aval de Fundación

2. **Jugadores I.E. El Dorado** (máx 2 por equipo):
   - Docentes El Dorado
   - Trabajadores El Dorado
   - Estudiantes y padres El Dorado (sin límite)

3. **Jugadores Fundación Vallejo** (máx 2 por equipo):
   - Docentes Fundación
   - Trabajadores Fundación
   - Padres Fundación

4. **Jugadores Habilitados** (sin límite):
   - Habitantes propietarios
   - Hijos de habitantes
   - Habitantes arrendatarios

### Validaciones Automáticas

El sistema valida automáticamente:
- ✅ Edad del jugador (16-60 años, 26+ para extranjeros)
- ✅ Número de camiseta único por equipo (1-20)
- ✅ Cupos de extranjeros no excedidos
- ✅ Cupos de docentes/trabajadores no excedidos
- ✅ Máximo de jugadores por equipo (16)
- ✅ Documentación requerida según tipo de jugador

## API Endpoints

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Autenticación

Todos los endpoints (excepto `/auth/login` y `/auth/register`) requieren autenticación JWT.

**Header requerido**:
```
Authorization: Bearer <token>
```

---

### 🔐 Auth (`/api/auth`)

#### POST `/auth/register`
Registrar nuevo usuario.

**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "rol": "DELEGADO"
}
```

#### POST `/auth/login`
Iniciar sesión.

**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": { /* datos usuario */ }
  }
}
```

#### GET `/auth/profile`
Obtener perfil del usuario autenticado. 🔒 Private

#### GET `/auth/verify`
Verificar validez del token JWT.

#### PUT `/auth/change-password`
Cambiar contraseña. 🔒 Private

---

### 👥 Usuarios (`/api/usuarios`) 🔒 Admin Only

#### GET `/usuarios`
Listar todos los usuarios.

#### GET `/usuarios/rol?rol=DELEGADO`
Filtrar usuarios por rol.

#### GET `/usuarios/:id`
Obtener usuario por ID.

#### POST `/usuarios`
Crear nuevo usuario.

#### PUT `/usuarios/:id`
Actualizar usuario.

#### DELETE `/usuarios/:id`
Eliminar usuario.

#### PATCH `/usuarios/:id/toggle-estado`
Activar/desactivar usuario.

---

### ⚽ Equipos (`/api/equipos`)

#### GET `/equipos`
Listar todos los equipos. 🔒 Private

#### GET `/equipos/activos`
Obtener equipos activos (aprobados). 🔒 Private

#### GET `/equipos/torneo/:torneoId`
Filtrar equipos por torneo. 🔒 Private

#### GET `/equipos/delegado/:delegadoId`
Obtener equipo de un delegado. 🔒 Private

#### GET `/equipos/:id`
Obtener equipo por ID. 🔒 Private

#### GET `/equipos/:id/estadisticas`
Obtener estadísticas detalladas del equipo (jugadores validados/pendientes, extranjeros, etc). 🔒 Private

#### GET `/equipos/:id/can-add-jugador`
Verificar si el equipo puede agregar más jugadores. 🔒 Private

#### POST `/equipos`
Crear nuevo equipo. 🔒 Admin

**Body**:
```json
{
  "nombre": "Los Tigres",
  "delegadoId": "507f1f77bcf86cd799439011",
  "torneoId": "507f1f77bcf86cd799439012",
  "colores": {
    "principal": "Naranja",
    "secundario": "Blanco"
  }
}
```

#### PUT `/equipos/:id`
Actualizar equipo. 🔒 Admin

#### DELETE `/equipos/:id`
Eliminar equipo. 🔒 Admin

---

### 👤 Jugadores (`/api/jugadores`)

#### GET `/jugadores`
Listar todos los jugadores. 🔒 Private

#### GET `/jugadores/pendientes`
Obtener jugadores pendientes de validación. 🔒 Private

**Response**:
```json
{
  "success": true,
  "count": 2,
  "data": [/* jugadores pendientes */]
}
```

#### GET `/jugadores/equipo/:equipoId`
Obtener jugadores de un equipo. 🔒 Private

#### GET `/jugadores/equipo/:equipoId/validados`
Obtener jugadores validados de un equipo. 🔒 Private

#### GET `/jugadores/cedula/:cedula`
Buscar jugador por cédula. 🔒 Private

#### GET `/jugadores/:id`
Obtener jugador por ID. 🔒 Private

#### GET `/jugadores/:id/validar-reglamento`
Validar si un jugador cumple el reglamento. 🔒 Private

**Response**:
```json
{
  "success": true,
  "data": {
    "valido": false,
    "errores": [
      "Se alcanzó el máximo de extranjeros (3)"
    ]
  }
}
```

#### POST `/jugadores`
Crear nuevo jugador. 🔒 Admin/Delegado

**Body**:
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "cedula": "1122334455",
  "fechaNacimiento": "2005-05-15",
  "telefono": "3001112233",
  "direccion": "Calle 123 # 45-67",
  "posicion": "DELANTERO",
  "numeroCamiseta": 10,
  "tipo": "HABITANTE_HIJO",
  "equipoId": "507f1f77bcf86cd799439011"
}
```

#### PUT `/jugadores/:id`
Actualizar jugador. 🔒 Admin/Delegado

#### POST `/jugadores/:id/documentos`
Agregar documento a jugador. 🔒 Admin/Delegado

#### PATCH `/jugadores/:id/validar`
Validar o rechazar jugador. 🔒 Admin

**Body**:
```json
{
  "estadoValidacion": "VALIDADO",
  "observaciones": "Documentos completos"
}
```

#### DELETE `/jugadores/:id`
Eliminar jugador. 🔒 Admin

---

### 🏆 Torneos (`/api/torneos`)

#### GET `/torneos`
Listar todos los torneos. 🔒 Private

#### GET `/torneos/actual`
Obtener torneo activo actual. 🔒 Private

#### GET `/torneos/año/:año`
Filtrar torneos por año. 🔒 Private

#### GET `/torneos/:id`
Obtener torneo por ID. 🔒 Private

#### GET `/torneos/:torneoId/fases`
Obtener fases de un torneo. 🔒 Private

#### POST `/torneos`
Crear nuevo torneo. 🔒 Admin

**Body**:
```json
{
  "nombre": "Torneo Vallejo 2024",
  "descripcion": "Torneo de microfútbol",
  "año": 2024,
  "fechaInicio": "2024-01-15",
  "fechaFin": "2024-12-15",
  "premios": {
    "primerLugar": 1500000,
    "segundoLugar": 1000000,
    "tercerLugar": 500000
  }
}
```

#### PUT `/torneos/:id`
Actualizar torneo. 🔒 Admin

#### DELETE `/torneos/:id`
Eliminar torneo. 🔒 Admin

#### POST `/torneos/:id/equipos`
Agregar equipo al torneo. 🔒 Admin

**Body**:
```json
{
  "equipoId": "507f1f77bcf86cd799439011"
}
```

#### DELETE `/torneos/:id/equipos/:equipoId`
Remover equipo del torneo. 🔒 Admin

#### PATCH `/torneos/:id/iniciar`
Iniciar torneo (cambia estado a EN_CURSO). 🔒 Admin

#### PATCH `/torneos/:id/finalizar`
Finalizar torneo. 🔒 Admin

#### PATCH `/torneos/:id/actualizar-estadisticas`
Recalcular estadísticas del torneo. 🔒 Admin

---

### 📊 Fases (`/api/torneos/fases`)

#### GET `/fases/:id`
Obtener fase por ID. 🔒 Private

#### GET `/fases/:faseId/tabla`
Calcular tabla de posiciones de una fase. 🔒 Private

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "equipo": { "_id": "...", "nombre": "Los Tigres" },
      "puntos": 3,
      "jugados": 1,
      "ganados": 1,
      "empatados": 0,
      "perdidos": 0,
      "golesFavor": 2,
      "golesContra": 0,
      "diferencia": 2,
      "posicion": 1
    }
  ]
}
```

#### GET `/fases/:faseId/clasificados`
Obtener equipos clasificados de una fase. 🔒 Private

#### POST `/fases`
Crear nueva fase. 🔒 Admin

**Body (Fase de Grupos)**:
```json
{
  "nombre": "Fase de Grupos",
  "torneoId": "507f1f77bcf86cd799439011",
  "formato": "GRUPOS",
  "orden": 1,
  "equiposParticipantes": ["...", "...", "...", "..."],
  "configuracion": {
    "numeroGrupos": 2,
    "equiposPorGrupo": 2,
    "clasificanPorGrupo": 1,
    "partidoIdaVuelta": false,
    "puntosVictoria": 3,
    "puntosEmpate": 1,
    "puntosDerrota": 0
  }
}
```

#### POST `/fases/:faseId/generar-calendario`
Generar calendario de partidos de una fase. 🔒 Admin

**Body**:
```json
{
  "fechaInicio": "2024-01-20",
  "cancha": "Cancha Principal"
}
```

#### PATCH `/fases/:faseId/finalizar`
Finalizar fase. 🔒 Admin

---

### ⚽ Partidos (`/api/partidos`)

#### GET `/partidos`
Listar todos los partidos. 🔒 Private

#### GET `/partidos/proximos`
Obtener próximos partidos (programados, ordenados por fecha). 🔒 Private

#### GET `/partidos/fase/:faseId`
Obtener partidos de una fase. 🔒 Private

#### GET `/partidos/equipo/:equipoId`
Obtener partidos de un equipo. 🔒 Private

#### GET `/partidos/fase/:faseId/jornada/:jornada`
Filtrar partidos por jornada. 🔒 Private

#### GET `/partidos/fase/:faseId/grupo/:grupo`
Filtrar partidos por grupo (ej: "A", "B"). 🔒 Private

#### GET `/partidos/:id`
Obtener partido por ID. 🔒 Private

#### POST `/partidos`
Crear nuevo partido manualmente. 🔒 Admin

#### PUT `/partidos/:id`
Actualizar partido. 🔒 Admin

#### DELETE `/partidos/:id`
Eliminar partido. 🔒 Admin

#### PATCH `/partidos/:id/iniciar`
Iniciar partido (cambia estado a EN_CURSO). 🔒 Admin

#### POST `/partidos/:id/goles`
Registrar gol. 🔒 Admin

**Body**:
```json
{
  "jugadorId": "507f1f77bcf86cd799439011",
  "equipoId": "507f1f77bcf86cd799439012",
  "minuto": 15,
  "tipo": "NORMAL"
}
```

#### POST `/partidos/:id/tarjetas`
Registrar tarjeta. 🔒 Admin

**Body**:
```json
{
  "jugadorId": "507f1f77bcf86cd799439011",
  "equipoId": "507f1f77bcf86cd799439012",
  "tipo": "AMARILLA",
  "minuto": 23,
  "motivo": "Falta antideportiva"
}
```

#### PATCH `/partidos/:id/finalizar`
Finalizar partido. 🔒 Admin

**Body**:
```json
{
  "observaciones": "Partido bien jugado"
}
```

#### PATCH `/partidos/:id/cancelar`
Cancelar partido. 🔒 Admin

**Body**:
```json
{
  "motivo": "Lluvia"
}
```

---

## Respuestas de la API

### Formato de Éxito
```json
{
  "success": true,
  "data": { /* resultado */ },
  "count": 10,  // Solo en listados
  "message": "Operación exitosa"
}
```

### Formato de Error
```json
{
  "success": false,
  "error": "Mensaje de error descriptivo",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

### Códigos de Estado HTTP
- `200` - OK
- `201` - Created
- `400` - Bad Request (validación falló)
- `401` - Unauthorized (no autenticado)
- `403` - Forbidden (sin permisos)
- `404` - Not Found
- `409` - Conflict (duplicado)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

## Scripts NPM

```bash
# Desarrollo
npm run dev              # Servidor con hot reload

# Producción
npm run build            # Compilar TypeScript
npm start                # Ejecutar versión compilada

# Utilidades
npm run seed             # Poblar BD con datos de prueba
npm run backup           # Crear backup de MongoDB

# Build continuo
npm run build:watch      # Compilar en modo watch
```

## Docker

### Servicios Incluidos

```yaml
services:
  - api (Node.js + TypeScript)    # Puerto 5000
  - mongodb (MongoDB 7.0)          # Puerto 27017
  - mongo-express (Admin UI)       # Puerto 8081
```

### Comandos Docker

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f api
docker-compose logs -f mongodb

# Detener servicios
docker-compose down

# Reconstruir imágenes
docker-compose up -d --build

# Limpiar volúmenes (⚠️ borra datos)
docker-compose down -v

# Acceder a contenedor
docker exec -it torneo-vallejo-api sh
docker exec -it torneo-vallejo-mongodb mongosh
```

### Acceso a Mongo Express
```
URL: http://localhost:8081
Usuario: admin
Password: admin
```

## Estructura del Proyecto

```
backend/
├── src/
│   ├── core/
│   │   ├── config/
│   │   │   ├── constants.ts           # Reglamento y constantes
│   │   │   └── environment.ts         # Variables de entorno
│   │   ├── database/
│   │   │   └── connection.ts          # Setup de MongoDB
│   │   └── middlewares/
│   │       ├── auth.middleware.ts     # Autenticación JWT
│   │       ├── authorize.middleware.ts # Control de roles
│   │       ├── errorHandler.middleware.ts
│   │       └── validate.middleware.ts  # Validación Joi
│   ├── features/
│   │   ├── auth/                      # Autenticación
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   └── validations/
│   │   ├── usuarios/                  # Gestión de usuarios
│   │   ├── equipos/                   # Gestión de equipos
│   │   ├── jugadores/                 # Gestión de jugadores
│   │   ├── torneos/                   # Torneos y fases
│   │   └── partidos/                  # Partidos
│   ├── shared/
│   │   └── types/
│   │       ├── enums.ts               # Enums globales
│   │       ├── interfaces.ts          # Interfaces compartidas
│   │       └── request.ts             # Tipos de Request
│   ├── app.ts                         # Configuración Express
│   └── server.ts                      # Entry point
├── scripts/
│   ├── seed.ts                        # Seed de datos
│   └── backup.ts                      # Backup automático
├── tests/                             # Tests (TODO)
├── .env.example                       # Template de variables
├── .env.development                   # Variables desarrollo
├── docker-compose.yml                 # Orquestación Docker
├── Dockerfile                         # Imagen producción
├── Dockerfile.dev                     # Imagen desarrollo
├── tsconfig.json                      # Config TypeScript
└── package.json                       # Dependencias
```

## Desarrollo

### TypeScript Strict Mode

El proyecto usa TypeScript en modo estricto con las siguientes reglas:
- ✅ `strict: true`
- ✅ `noImplicitAny: true`
- ✅ `strictNullChecks: true`
- ✅ `strictFunctionTypes: true`
- ✅ `noUnusedLocals: true`
- ✅ `noUnusedParameters: true`

### Path Aliases

Se usa `@/` como alias para importaciones absolutas:
```typescript
// ❌ Evitar
import { Usuario } from '../../../features/usuarios/models/usuario.model';

// ✅ Usar
import { Usuario } from '@/features/usuarios/models/usuario.model';
```

### Convenciones de Código

- **Nombres de archivos**: kebab-case (ej: `auth.controller.ts`)
- **Nombres de clases/interfaces**: PascalCase (ej: `IUsuarioDocument`)
- **Nombres de funciones/variables**: camelCase (ej: `getAllUsuarios`)
- **Nombres de constantes**: UPPER_SNAKE_CASE (ej: `MAX_JUGADORES`)
- **Prefijos de interfaces**: `I` (ej: `IUsuario`)
- **Sufijos de documentos Mongoose**: `Document` (ej: `IUsuarioDocument`)
- **Sufijos de modelos Mongoose**: `Model` (ej: `IUsuarioModel`)

### Manejo de Errores

```typescript
// Usar el wrapper asyncHandler en controllers
export const getUsuarios = asyncHandler(async (req, res) => {
  const usuarios = await usuariosService.getAllUsuarios();
  res.json({ success: true, data: usuarios });
});

// Los errores se capturan automáticamente y se envían al errorHandler
```

## Testing

```bash
# TODO: Implementar tests
npm test
```

## Seguridad

### Medidas Implementadas

1. **Autenticación JWT**: Tokens seguros con expiración configurable
2. **Password Hashing**: bcrypt con salt rounds = 10
3. **Rate Limiting**: Máximo 100 requests por 15 minutos por IP
4. **Helmet**: Headers HTTP seguros (XSS, clickjacking, etc)
5. **CORS**: Control de orígenes permitidos
6. **NoSQL Injection Prevention**: Sanitización con express-mongo-sanitize
7. **Input Validation**: Validación estricta con Joi en todas las rutas
8. **Environment Variables**: Secrets nunca en código
9. **TypeScript Strict**: Prevención de errores en tiempo de compilación

### Recomendaciones

- ✅ Usar HTTPS en producción
- ✅ Configurar firewall en servidor
- ✅ Mantener dependencias actualizadas
- ✅ Implementar logs de auditoría
- ✅ Configurar backups automáticos de BD
- ✅ Usar secrets manager (AWS Secrets, Vault, etc) en producción

## Roadmap

### Funcionalidades Pendientes

- [ ] Tests unitarios y de integración
- [ ] Generación de PDFs (credenciales, reportes)
- [ ] Upload de fotos de jugadores a Cloudinary
- [ ] Sistema de notificaciones (email/SMS)
- [ ] Dashboard de estadísticas en tiempo real
- [ ] API de fixtures y calendario público
- [ ] Integración con sistemas de pago
- [ ] App móvil (Flutter/React Native)

### Mejoras Técnicas

- [ ] Implementar cache con Redis
- [ ] Agregar WebSockets para updates en vivo
- [ ] Implementar búsqueda full-text con Elasticsearch
- [ ] CI/CD con GitHub Actions
- [ ] Monitoreo con Prometheus + Grafana
- [ ] Logs centralizados con ELK Stack

## Deployment

### Variables de Entorno Producción

Configurar las siguientes variables en el servidor:
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/torneo_vallejo
JWT_SECRET=<generar_secret_seguro_min_32_caracteres>
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-frontend-domain.com
```

### Build para Producción

```bash
# Compilar
npm run build

# El código compilado estará en dist/
# Ejecutar
npm start
```

### Deploy con Docker

```bash
# Build de imagen producción
docker build -t torneo-vallejo-api .

# Run
docker run -d -p 5000:5000 \
  --env-file .env.production \
  --name torneo-api \
  torneo-vallejo-api
```

## Soporte

Para reportar bugs o solicitar features, crear un issue en el repositorio.

## Licencia

ISC

---

**Desarrollado con TypeScript + Express + MongoDB**
**Sistema de Gestión de Torneo Vallejo - v1.0.0**
