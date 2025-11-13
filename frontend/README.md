# Torneo Vallejo - Frontend

Frontend para la Plataforma Web de Gestión del Torneo Recreativo de Microfútbol Urbanización Vallejo.

## Stack Tecnológico

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Estilos**: Tailwind CSS
- **HTTP Client**: Axios
- **Formularios**: React Hook Form + Zod
- **Routing**: React Router
- **UI Components**: Lucide React (iconos)
- **Notificaciones**: Sonner

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── features/          # Módulos por funcionalidad
│   │   ├── auth/         # Autenticación
│   │   ├── usuarios/     # Gestión de usuarios
│   │   ├── equipos/      # Gestión de equipos
│   │   ├── jugadores/    # Gestión de jugadores
│   │   ├── torneo/       # Configuración de torneos
│   │   └── public-view/  # Vistas públicas
│   ├── shared/           # Componentes compartidos
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Utilidades
│   ├── lib/              # Configuraciones
│   ├── types/            # Tipos globales
│   └── styles/           # Estilos globales
└── public/               # Archivos estáticos
```

## Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview

# Lint
npm run lint
```

## Variables de Entorno

Copiar `.env.example` a `.env.local` y configurar:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Torneo Vallejo
VITE_MAX_FILE_SIZE=5242880
```

## Módulos Principales

### Módulo 1: Gestión de Usuarios y Roles
- Sistema de login
- Roles: Admin, Delegado
- Control de permisos

### Módulo 2: Gestión de Equipos y Jugadores
- Delegados crean equipos (máximo 16 jugadores)
- Formulario de inscripción con validaciones
- Carga de documentos probatorios
- Administradores validan jugadores

### Módulo 5: Gestión del Torneo
- Crear torneos
- Crear fases con diferentes formatos
- Generar calendario automático

### Módulo 8: Vista Pública
- Equipos inscritos
- Calendario completo
- Tablas de posiciones
- Llaves de eliminación

## Desarrollo

El proyecto utiliza Vite con hot-reload. Asegúrate de tener el backend corriendo en `http://localhost:5000`.
