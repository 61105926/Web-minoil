# 🚀 CÓMO INICIAR TU PROYECTO

## Opción 1: Inicio Rápido (Recomendado)

Abre tu terminal y ejecuta:

```bash
cd /Users/user/Desktop/MINOILWEB/backend
npm run start:dev
```

**Espera 20-30 segundos** hasta que veas:
```
Aplicación corriendo en http://localhost:3000
```

Luego abre tu navegador en: **http://localhost:3000**

---

## Opción 2: Si hay problemas de puerto

Si ves un error de que el puerto 3000 está ocupado:

```bash
# Detener procesos en puerto 3000
lsof -ti:3000 | xargs kill -9

# Luego reiniciar
cd /Users/user/Desktop/MINOILWEB/backend
npm run start:dev
```

---

## 🔐 Credenciales de Login

- **Usuario:** `admin`
- **Contraseña:** `admin123`

---

## 📝 Lo que tienes

✅ **Frontend Vue 3** compilado en `/backend/public`
✅ **Backend NestJS** con:
  - Conexión a SAP HANA
  - Autenticación JWT
  - Login endpoint: `POST /auth/login`
  - Empleados endpoint: `GET /empleados` (protegido)

---

## 🛠️ Configurar SAP HANA

Edita el archivo `/backend/.env`:

```env
PORT=3000

HANA_HOST=tu-servidor-hana.com
HANA_PORT=30015
HANA_USER=tu_usuario
HANA_PASS=tu_contraseña

JWT_SECRET=tu-secreto-jwt
```

---

## ❓ Solución de Problemas

### El servidor no inicia
```bash
# Verificar que las dependencias estén instaladas
cd /Users/user/Desktop/MINOILWEB/backend
npm install

# Reintentar
npm run start:dev
```

### Error de TypeScript
El servidor usa `ts-node` que compila en tiempo real. Es normal que tarde 20-30 segundos en iniciar.

### No se conecta a HANA
El sistema tiene un modo DEMO que funciona sin HANA. Usa las credenciales `admin/admin123` para probar sin base de datos.

---

## 📦 Estructura del Proyecto

```
backend/
├── public/              ← Frontend compilado
│   ├── index.html
│   └── assets/
├── src/
│   ├── auth/           ← Login y JWT
│   ├── database/       ← Conexión HANA
│   ├── empleados/      ← API empleados
│   └── main.ts
├── .env                ← Configuración
└── package.json

frontend/
├── src/                ← Código fuente Vue 3
└── vite.config.ts      ← Build output: ../backend/public
```

---

## 🎯 Próximos Pasos

1. Inicia el servidor: `npm run start:dev`
2. Abre http://localhost:3000
3. Login con `admin / admin123`
4. Verás el dashboard con la tabla de empleados
5. Configura tu conexión a HANA en `.env`
6. Personaliza las tablas y queries en `src/`

---

¡Todo listo! 🎉
