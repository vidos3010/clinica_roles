@echo off
setlocal
title Sistema Hospitalario de Rol de Turnos - Clinica San Borja
color 0b

echo ================================================================
echo   SISTEMA DE ROL DE TURNOS HOSPITALARIOS - HOSPITALIZACION 4TO PISO
echo ================================================================
echo.

:: 1. Verificar si Node.js esta instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ALERTA] Node.js no fue encontrado en esta computadora.
    echo.
    echo Para ejecutar el sistema localmente necesitas instalar Node.js:
    echo   1. Descargalo gratis desde: https://nodejs.org
    echo   2. Instala la version LTS (siguiente, siguiente, finalizar)
    echo   3. Vuelve a hacer doble clic en este archivo start.bat
    echo.
    pause
    exit /b
)

:: 2. Si no existen las librerias (node_modules), instalarlas automaticamente
if not exist "node_modules\" (
    echo [PRIMERA EJECUCION] Instalando dependencias del sistema...
    echo Esto solo tomara un momento la primera vez. Por favor espera...
    echo.
    call npm.cmd install
    if %errorlevel% neq 0 (
        echo [ERROR] Hubo un problema al instalar las dependencias.
        pause
        exit /b
    )
    echo.
    echo [OK] Instalacion completada con exito.
    echo.
)

:: 3. Abrir el navegador e iniciar el servidor
echo ================================================================
echo   Iniciando el servidor...
echo   Abriendo en tu navegador: http://localhost:3000
echo ================================================================
echo.

start http://localhost:3000
call npm.cmd run dev

pause
