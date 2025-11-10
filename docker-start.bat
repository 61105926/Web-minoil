@echo off
echo Verificando Docker Desktop...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Docker Desktop no esta corriendo!
    echo.
    echo Por favor:
    echo 1. Abre Docker Desktop desde el menu de inicio
    echo 2. Espera a que aparezca "Docker Desktop is running"
    echo 3. Ejecuta este script nuevamente
    echo.
    pause
    exit /b 1
)

echo ✅ Docker Desktop esta corriendo!
echo.
echo 🔨 Construyendo y ejecutando la aplicacion...
echo.

docker-compose up --build

pause

