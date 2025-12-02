# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sistema de gestión para el Torneo Recreativo de Microfútbol - Urbanización Vallejo. Backend API REST con Node.js + Express + TypeScript + MongoDB, containerizado con Docker.

## Development Environment

**All development happens inside Docker containers.** The backend runs with hot-reloading via nodemon and ts-node.

### Starting Development

```bash
# Start all services (MongoDB + Backend + Mongo Express)
docker-compose up -d --build

# View backend logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Running Commands Inside Docker

**IMPORTANT:** Always run npm commands inside the Docker container, not locally:

```bash
# Install new dependencies
docker-compose exec backend npm install <package-name>

# Run TypeScript compilation
docker-compose exec backend npm run build

# Seed database
docker-compose exec backend npm run seed

# Access container shell
docker exec -it torneo-vallejo-backend sh
```

### Available Services

- **Backend API**: http://localhost:5001
- **MongoDB**: mongodb://localhost:27017
- **Mongo Express**: http://localhost:8081 (admin/admin)
- **Health Check**: http://localhost:5001/health

## Architecture

### Feature-Based Modular Structure

The codebase follows a **feature-based architecture** where each domain (auth, usuarios, equipos, jugadores, torneos, fases, partidos, reportes, upload) is self-contained:

```
backend/src/
├── features/              # Domain modules (one per business entity)
│   ├── auth/             # Authentication & authorization
│   ├── usuarios/         # User management
│   ├── equipos/          # Team management
│   ├── jugadores/        # Player management with validation workflow
│   ├── torneos/          # Tournament management
│   ├── fases/            # Tournament phases (grupos, eliminatorias)
│   ├── partidos/         # Match management & results
│   ├── reportes/         # PDF generation (credentials, lineups, standings, match reports)
│   └── upload/           # File upload handling (Multer + local filesystem)
│
├── core/                 # Shared infrastructure
│   ├── config/          # Constants, environment config, Multer, PDF
│   ├── database/        # MongoDB connection
│   ├── middlewares/     # Auth, validation, error handling, upload
│   └── utils/           # PDF generation, API errors, async handlers
│
└── shared/              # Shared domain logic
    └── types/           # Enums (TipoJugador, Rol, EstadoPartido, etc.)
```

### Each Feature Module Contains

```
features/<domain>/
├── models/              # Mongoose schemas with business logic methods
├── services/            # Business logic (validations, calculations)
├── controllers/         # HTTP request handlers (thin, delegate to services)
├── routes/              # Express routes with middleware chains
└── validations/         # Joi schemas for request validation
```

## Path Aliases (tsconfig.json)

Use these imports throughout the codebase:

```typescript
import { Model } from '@/features/<domain>/models/model';
import { middleware } from '@/core/middlewares/middleware';
import { TipoJugador } from '@/shared/types/enums';
```

## TypeScript Configuration

**Strict mode is ENABLED** (`strict: true` in tsconfig.json). The codebase enforces:

- `noUnusedLocals: true` - Remove unused variables or prefix with `_`
- `noUnusedParameters: true` - Prefix unused parameters with `_`
- `noImplicitReturns: true` - All code paths must return
- `noUncheckedIndexedAccess: true` - Array access returns `T | undefined`

**When fixing TypeScript errors:**
1. Use non-null assertions (`!`) only when you're certain the value exists
2. Prefix unused variables with `_` (e.g., `_unused`)
3. Use `as any` sparingly for type assertions with complex types
4. For PDFKit types, use `type PDFDoc = PDFGenerator['doc']` pattern

## Authentication & Authorization

### JWT-Based Authentication

All routes (except `/auth/login` and `/auth/register`) require authentication:

```typescript
import { protect } from '@/core/middlewares/auth.middleware';
import { adminOnly, adminOrDelegado } from '@/core/middlewares/authorize.middleware';

router.use(protect);  // Requires JWT token
router.post('/', adminOnly, controller.create);  // Admin only
router.put('/', adminOrDelegado, controller.update);  // Admin or Delegado
```

### User Roles

- `ADMIN` - Full access
- `DELEGADO` - Team delegate (manage own team's players)
- `ARBITRO` - Referee (update match results)
- `USUARIO` - Basic user (read-only access)

## Business Domain Rules

### Jugadores (Players) - Complex Validation Workflow

Players have a **validation state machine**:
- `PENDIENTE` → Initial state after creation
- `VALIDADO` → Admin approved (can play)
- `RECHAZADO` → Admin rejected

**Tournament Rules** (defined in `/backend/src/core/config/constants.ts`):
- Max 16 players per team
- Max 3 foreign players (must be 26+ years old)
- Max 2 teachers from I.E. El Dorado
- Max 2 teachers/workers/parents from Fundación Vallejo
- Age range: 16-60 years
- Jersey numbers: 1-20 (unique per team)

**When modifying jugadores logic:**
- Check `validarReglamentoJugador()` service method
- Respect `estadoValidacion` workflow
- Use `calcularEdad()` for age validation

### Torneos & Fases (Tournaments & Phases)

Tournaments have multiple phases:
- **GRUPOS** - Round-robin group stage
- **OCTAVOS** - Round of 16
- **CUARTOS** - Quarter-finals
- **SEMIFINAL** - Semi-finals
- **FINAL** - Final match
- **TERCER_LUGAR** - Third place match

Each `Fase` has:
- `calcularTablaPosiciones()` - Computes standings
- `generarCalendario()` - Auto-generates match fixtures
- `avanzarEquipos()` - Promotes teams to next phase

### Partidos (Matches)

Match states:
- `PROGRAMADO` → Initial state
- `EN_CURSO` → Match started
- `FINALIZADO` → Match ended (triggers standings update)
- `SUSPENDIDO` → Match suspended
- `CANCELADO` → Match cancelled

**Match results tracking:**
- Goals: `{ jugador, equipo, minuto, esAutogol, esPenal }`
- Cards: `{ jugador, equipo, minuto, tipo: 'AMARILLA' | 'ROJA' }`

## File Uploads (Multer)

Files are stored in **local filesystem** (`/backend/uploads/`), not cloud storage:

```typescript
// Upload configuration in core/config/multer.config.ts
export enum UploadType {
  FOTO_JUGADOR = 'fotos-jugadores',
  DOCUMENTO_JUGADOR = 'documentos-jugadores',
  ESCUDO_EQUIPO = 'escudos-equipos',
}

// Usage in routes
import { uploadFotoJugador } from '@/core/config/multer.config';
import { setUploadType, handleMulterError, validateFileRequired } from '@/core/middlewares/upload.middleware';

router.post(
  '/:id/foto',
  adminOrDelegado,
  validate(jugadorIdSchema),
  setUploadType(UploadType.FOTO_JUGADOR),
  uploadFotoJugador.single('foto'),
  handleMulterError,
  validateFileRequired('foto'),
  controller.uploadFotoJugador
);
```

Files are served statically via `/uploads` route.

## PDF Generation (PDFKit)

Located in `core/utils/pdf/`:

```
pdf/
├── pdfGenerator.ts      # Base class with common PDF logic
├── pdfStyles.ts         # Colors, fonts, text styles
├── pdfHelpers.ts        # Reusable drawing functions
├── pdf.config.ts        # Page size, margins, dimensions
└── templates/
    ├── credencial.ts    # Player ID card
    ├── planilla.ts      # Match lineup sheet
    ├── tabla.ts         # Standings table
    └── acta.ts          # Match report
```

**PDF Template Pattern:**
```typescript
export class MyTemplate extends PDFGenerator {
  constructor(data: MyData) {
    super({ title: 'My PDF', subject: 'Report' });
    this.data = data;
  }

  async generate(): Promise<Buffer> {
    this.drawContent();
    return this.toBuffer();
  }

  private drawContent(): void {
    const doc = this.doc;  // Access PDFKit document
    // Use helpers from pdfHelpers.ts
    drawHeader(doc, 'Title', 'Subtitle');
    // Draw content...
  }
}
```

**Type issue with PDFKit:** Use `type PDFDoc = PDFGenerator['doc']` to reference the document type in helpers.

## API Endpoints

All endpoints are prefixed with `/api`:

```
/api/auth              # Authentication (login, register)
/api/usuarios          # User management
/api/equipos           # Teams
/api/jugadores         # Players
/api/torneos           # Tournaments
/api/torneos/:id/fases # Tournament phases
/api/partidos          # Matches
/api/reportes          # PDF reports
  ├── /credencial/:id  # Player credential
  ├── /planilla/:id    # Match lineup
  ├── /tabla/:id       # Standings (by faseId)
  └── /acta/:id        # Match report
```

## Database Seeding

```bash
docker-compose exec backend npm run seed
```

Seeds database with:
- Admin user (admin@torneo.com / Admin123!)
- Sample tournament with phases
- Teams and players
- Match fixtures

## Common TypeScript Patterns in This Codebase

### Mongoose Models with Business Logic

```typescript
// Define instance methods on schema
jugadorSchema.methods.calcularEdad = function(): number {
  // Business logic here
};

// Use in services
const edad = jugador.calcularEdad();
```

### Service Layer Pattern

```typescript
// services/jugador.service.ts
export const createJugador = async (data: CreateJugadorDto) => {
  // 1. Validate business rules
  await validarReglamentoJugador(data.equipoId, data.tipo);

  // 2. Create entity
  const jugador = await Jugador.create(data);

  // 3. Return
  return jugador;
};
```

### Controller Pattern (Thin Controllers)

```typescript
// controllers/jugador.controller.ts
export const createJugador = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const jugador = await jugadorService.createJugador(req.body);
    res.status(201).json({ success: true, data: jugador });
  }
);
```

### Request Validation (Joi)

```typescript
// validations/jugador.validation.ts
export const createJugadorSchema = {
  body: Joi.object({
    nombre: Joi.string().min(2).max(50).required(),
    cedula: Joi.string().pattern(/^[0-9]{6,15}$/).required(),
    // ... more fields
  }),
};

// In routes
router.post('/', validate(createJugadorSchema), controller.create);
```

## Error Handling

All errors use `ApiError` class:

```typescript
import { ApiError } from '@/core/utils/ApiError';

// In services
if (!jugador) {
  throw ApiError.notFound('Jugador no encontrado');
}

if (edad < 16) {
  throw ApiError.badRequest('Edad mínima es 16 años');
}
```

Global error handler catches all errors and formats responses.

## CORS Configuration

Configured to allow:
- `http://localhost:4200` (Angular frontend)
- `http://localhost:3000` (Alternative frontend port)

Supports credentials and standard HTTP methods.

## Troubleshooting

### TypeScript Compilation Errors in Docker

If you see TypeScript errors after modifying code:
1. Check that all imports use path aliases correctly
2. Ensure unused variables are prefixed with `_`
3. Verify non-null assertions (`!`) are used appropriately
4. For PDFKit issues, check the type alias pattern in pdfHelpers.ts

### MongoDB Connection Issues

```bash
# Restart containers
docker-compose restart

# Check logs
docker-compose logs mongodb backend
```

### Port Already in Use

```bash
# Find process using port 5001
lsof -i :5001

# Kill process
kill -9 <PID>
```

## Testing Strategy

Currently no automated tests. Manual testing via:
1. `/health` endpoint for service health
2. Postman/Thunder Client for API testing
3. Mongo Express for database inspection
