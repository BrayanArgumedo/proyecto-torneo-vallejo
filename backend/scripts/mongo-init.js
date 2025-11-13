// Script de inicialización de MongoDB
// Este script se ejecuta automáticamente cuando el contenedor de MongoDB se crea por primera vez

db = db.getSiblingDB('torneo_vallejo');

print('🚀 Inicializando base de datos torneo_vallejo...');

// Crear colecciones con validación de esquema
print('📦 Creando colección: usuarios');
db.createCollection('usuarios', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'nombre', 'apellido', 'rol'],
      properties: {
        email: {
          bsonType: 'string',
          description: 'Email debe ser un string y es requerido'
        },
        password: {
          bsonType: 'string',
          description: 'Password debe ser un string y es requerido'
        },
        nombre: { bsonType: 'string' },
        apellido: { bsonType: 'string' },
        rol: {
          enum: ['ADMIN', 'DELEGADO'],
          description: 'Rol debe ser ADMIN o DELEGADO'
        }
      }
    }
  }
});

print('📦 Creando colección: equipos');
db.createCollection('equipos');

print('📦 Creando colección: jugadores');
db.createCollection('jugadores');

print('📦 Creando colección: torneos');
db.createCollection('torneos');

print('📦 Creando colección: fases');
db.createCollection('fases');

print('📦 Creando colección: partidos');
db.createCollection('partidos');

// Crear índices para optimizar consultas
print('🔍 Creando índices...');

// Usuarios
db.usuarios.createIndex({ email: 1 }, { unique: true, name: 'idx_usuarios_email' });
db.usuarios.createIndex({ rol: 1 }, { name: 'idx_usuarios_rol' });

// Jugadores
db.jugadores.createIndex({ cedula: 1 }, { unique: true, name: 'idx_jugadores_cedula' });
db.jugadores.createIndex({ equipoId: 1 }, { name: 'idx_jugadores_equipo' });
db.jugadores.createIndex({ equipoId: 1, estadoValidacion: 1 }, { name: 'idx_jugadores_equipo_estado' });
db.jugadores.createIndex({ estadoValidacion: 1 }, { name: 'idx_jugadores_estado' });
db.jugadores.createIndex({ tipoJugador: 1 }, { name: 'idx_jugadores_tipo' });

// Equipos
db.equipos.createIndex({ delegadoId: 1 }, { name: 'idx_equipos_delegado' });
db.equipos.createIndex({ nombre: 1 }, { unique: true, name: 'idx_equipos_nombre' });
db.equipos.createIndex({ estado: 1 }, { name: 'idx_equipos_estado' });

// Torneos
db.torneos.createIndex({ estado: 1 }, { name: 'idx_torneos_estado' });
db.torneos.createIndex({ fechaInicio: -1 }, { name: 'idx_torneos_fecha' });

// Fases
db.fases.createIndex({ torneoId: 1 }, { name: 'idx_fases_torneo' });
db.fases.createIndex({ torneoId: 1, orden: 1 }, { name: 'idx_fases_torneo_orden' });

// Partidos
db.partidos.createIndex({ faseId: 1 }, { name: 'idx_partidos_fase' });
db.partidos.createIndex({ faseId: 1, fecha: 1 }, { name: 'idx_partidos_fase_fecha' });
db.partidos.createIndex({ equipoLocal: 1 }, { name: 'idx_partidos_local' });
db.partidos.createIndex({ equipoVisitante: 1 }, { name: 'idx_partidos_visitante' });

print('✅ Base de datos inicializada correctamente');
print('✅ Colecciones creadas: usuarios, equipos, jugadores, torneos, fases, partidos');
print('✅ Índices creados para optimizar consultas');
