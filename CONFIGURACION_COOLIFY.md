# 🔐 Configuración de Credenciales en Coolify

## ⚠️ IMPORTANTE: No pongas credenciales en el código

Las credenciales de producción **NUNCA** deben estar en el código fuente. Se configuran como **variables de entorno** en Coolify.

## 📋 Variables de Entorno Requeridas

Configura estas variables en la interfaz de Coolify:

### Variables de SAP HANA

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `HANA_HOST` | Dirección del servidor SAP HANA | `hana.servidor.com` o `192.168.1.100` |
| `HANA_PORT` | Puerto de SAP HANA | `30015` (por defecto) |
| `HANA_USER` | Usuario de SAP HANA | `TU_USUARIO` |
| `HANA_PASS` | Contraseña de SAP HANA | `tu_password_seguro` |

### Variables de la Aplicación

| Variable | Descripción | Valor Recomendado |
|----------|-------------|-------------------|
| `PORT` | Puerto donde corre la aplicación | `8005` |
| `NODE_ENV` | Entorno de ejecución | `production` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | `un-secreto-muy-largo-y-seguro` |

## 🎯 Cómo Configurar en Coolify

### Paso 1: Acceder a Variables de Entorno

1. Ve a tu aplicación en Coolify
2. Busca la sección **"Environment Variables"** o **"Variables de Entorno"**
3. Haz clic en **"Add Variable"** o **"Agregar Variable"**

### Paso 2: Agregar Cada Variable

Para cada variable, ingresa:
- **Key (Clave)**: El nombre de la variable (ej: `HANA_HOST`)
- **Value (Valor)**: El valor real (ej: `hana.servidor.com`)

**Ejemplo completo:**

```
Key: HANA_HOST
Value: hana.servidor.com

Key: HANA_PORT
Value: 30015

Key: HANA_USER
Value: TU_USUARIO_HANA

Key: HANA_PASS
Value: tu_password_seguro

Key: PORT
Value: 8005

Key: NODE_ENV
Value: production

Key: JWT_SECRET
Value: un-secreto-muy-largo-y-seguro-para-produccion
```

### Paso 3: Guardar y Redesplegar

1. Guarda todas las variables
2. Haz un nuevo despliegue (redeploy) de la aplicación
3. Las variables estarán disponibles para la aplicación

## 🔍 Verificación

Después de configurar las variables y redesplegar, verifica en los logs que la conexión a HANA funcione:

```
✅ Conectado a SAP HANA exitosamente
```

Si ves:
```
⚠️  Credenciales HANA no configuradas - Modo DEMO activo
```

Significa que las variables de entorno no están configuradas correctamente.

## 🔒 Seguridad

- ✅ **CORRECTO**: Variables de entorno en Coolify
- ❌ **INCORRECTO**: Credenciales en el código fuente
- ❌ **INCORRECTO**: Credenciales en archivos `.env` en el repositorio

Las variables de entorno en Coolify están encriptadas y solo son accesibles para la aplicación en tiempo de ejecución.

## 📝 Notas

- Si no configuras las credenciales de HANA, la aplicación funcionará en **modo DEMO** (sin conexión a base de datos)
- El puerto por defecto es `8005`, pero puedes cambiarlo configurando la variable `PORT`
- El `JWT_SECRET` debe ser un string largo y aleatorio para producción

