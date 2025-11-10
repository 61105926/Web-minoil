# Sistema de Gestión con NestJS + Vue 3 + SAP HANA

Aplicación web completa con backend NestJS conectado a SAP HANA y frontend Vue 3 con autenticación JWT.

## Características

### Backend (NestJS)
- Framework: NestJS (Node.js)
- Base de datos: SAP HANA (@sap/hana-client)
- Autenticación: JWT (JSON Web Tokens)
- Encriptación: bcryptjs para contraseñas
- Módulos:
  - DatabaseModule: Conexión a SAP HANA
  - AuthModule: Login y generación de tokens JWT
  - EmpleadosModule: Endpoint protegido para consultar empleados

### Frontend (Vue 3)
- Framework: Vue 3 + TypeScript + Vite
- Estilo: TailwindCSS
- Componentes UI: Estilo ShadCN-Vue
- Router: Vue Router con guards de autenticación
- HTTP Client: Axios
- Páginas:
  - Login: Autenticación de usuarios
  - Dashboard: Tabla de empleados protegida

## Estructura del Proyecto

```
MINOILWEB/
├── backend/
│   ├── src/
│   │   ├── auth/                # Módulo de autenticación
│   │   │   ├── guards/          # JWT Guard
│   │   │   ├── dto/             # DTOs
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   └── jwt.strategy.ts
│   │   ├── database/            # Módulo de base de datos
│   │   │   ├── database.service.ts
│   │   │   └── database.module.ts
│   │   ├── empleados/           # Módulo de empleados
│   │   │   ├── empleados.controller.ts
│   │   │   ├── empleados.service.ts
│   │   │   └── empleados.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env                     # Variables de entorno
│   ├── .env.example             # Ejemplo de variables
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── ui/              # Componentes UI
    │   ├── views/
    │   │   ├── Login.vue        # Vista de login
    │   │   └── Dashboard.vue    # Vista del dashboard
    │   ├── services/
    │   │   ├── auth.service.ts  # Servicio de autenticación
    │   │   └── empleados.service.ts
    │   ├── router/
    │   │   └── index.ts         # Configuración de rutas
    │   ├── lib/
    │   │   └── utils.ts         # Utilidades
    │   ├── App.vue
    │   ├── main.ts
    │   └── style.css
    ├── index.html
    ├── package.json
    ├── vite.config.ts           # Build output: ../backend/public
    └── tailwind.config.js
```

## Instalación

### 1. Backend

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura tus credenciales:

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
PORT=3000

# SAP HANA
HANA_HOST=tu-servidor-hana.com
HANA_PORT=30015
HANA_USER=tu_usuario
HANA_PASS=tu_contraseña

# JWT
JWT_SECRET=tu-secreto-jwt-super-seguro
```

### 3. Frontend

```bash
cd frontend
npm install
```

## Desarrollo

### Modo desarrollo (Frontend y Backend separados)

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

El backend estará disponible en `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

En modo desarrollo, Vite proxy las peticiones `/auth` y `/empleados` al backend.

## Producción

### 1. Compilar Frontend

```bash
cd frontend
npm run build
```

Esto compilará el frontend y copiará los archivos a `backend/public/`

### 2. Compilar Backend

```bash
cd backend
npm run build
```

### 3. Iniciar servidor de producción

```bash
cd backend
npm run start:prod
```

La aplicación completa estará disponible en `http://localhost:3000`

El backend servirá automáticamente los archivos del frontend compilado.

## Endpoints de la API

### Autenticación

**POST /auth/login**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

Respuesta:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

### Empleados (Requiere autenticación)

**GET /empleados**

Headers:
```
Authorization: Bearer <token>
```

Respuesta:
```json
[
  {
    "ID": 1,
    "NOMBRE": "Juan",
    "APELLIDO": "Pérez",
    "EMAIL": "juan.perez@example.com",
    "PUESTO": "Desarrollador"
  }
]
```

## Credenciales de Demo

Para pruebas sin conexión a SAP HANA, puedes usar:

- **Usuario:** admin
- **Contraseña:** admin123

## Configuración de Base de Datos

### Crear tabla de usuarios en SAP HANA

```sql
CREATE TABLE "USUARIOS" (
  "ID" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "USERNAME" NVARCHAR(50) UNIQUE NOT NULL,
  "PASSWORD_HASH" NVARCHAR(255) NOT NULL,
  "CREATED_AT" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Insertar usuario de ejemplo

```sql
-- Password hash para "admin123" usando bcryptjs
INSERT INTO "USUARIOS" ("USERNAME", "PASSWORD_HASH")
VALUES ('admin', '$2a$10$...');
```

### Crear tabla de empleados

```sql
CREATE TABLE "EMPLEADOS" (
  "ID" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "NOMBRE" NVARCHAR(100) NOT NULL,
  "APELLIDO" NVARCHAR(100) NOT NULL,
  "EMAIL" NVARCHAR(255) UNIQUE NOT NULL,
  "PUESTO" NVARCHAR(100),
  "CREATED_AT" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Seguridad

- Las contraseñas se encriptan con bcryptjs
- Los tokens JWT expiran en 24 horas
- Las rutas están protegidas con JWT Guard
- CORS está deshabilitado (solo sirve su propio frontend)
- El token se almacena en localStorage en el frontend

## Notas Técnicas

- El backend incluye un sistema de fallback: si la conexión a HANA falla, devuelve datos de ejemplo
- El frontend usa TypeScript para mayor seguridad de tipos
- Los componentes UI están inspirados en ShadCN pero adaptados para Vue 3
- El routing incluye guards para proteger rutas que requieren autenticación
- El build de frontend se integra automáticamente con el backend

## Solución de Problemas

### Error de conexión a HANA

Verifica:
- Que las credenciales en `.env` sean correctas
- Que el puerto HANA sea accesible desde tu máquina
- Que el usuario tenga permisos en las tablas requeridas

### Error de CORS

El backend está configurado para servir solo su propio frontend. Si necesitas acceder desde otro origen:

1. Habilita CORS en `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: 'http://localhost:5173', // URL de tu frontend en desarrollo
  credentials: true,
});
```

### Error al compilar frontend

Verifica que todas las dependencias estén instaladas:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Licencia

MIT
