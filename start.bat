@echo off
setlocal
cd /d "%~dp0"
title Sistema Hospitalario de Rol de Turnos - Clinica San Borja
color 0b

echo ================================================================
echo   SISTEMA DE ROL DE TURNOS HOSPITALARIOS - HOSPITALIZACION 4TO PISO
echo ================================================================
echo.

:: 1. Verificar si Node.js esta instalado en la maquina
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [AVISO IMPORTANTE]
    echo Node.js no fue encontrado en esta computadora.
    echo.
    echo Para que el sistema funcione en tu PC necesitas instalar Node.js:
    echo   1. Descargalo gratis desde: https://nodejs.org
    echo   2. Instala la version recomendada (LTS) haciendo clic en Siguiente.
    echo   3. Cuando termine la instalacion, vuelve a hacer doble clic en este archivo start.bat.
    echo.
    echo Presiona cualquier tecla para abrir la pagina de descarga de Node.js...
    pause >nul
    start https://nodejs.org
    exit /b
)

:: 2. Si no existen las librerias (node_modules), instalarlas automaticamente
if not exist "node_modules\" (
    echo [PRIMERA VEZ] Instalando dependencias necesarias del sistema...
    echo Esto solo tomara un momento por unica vez. Por favor espera...
    echo.
    call npm.cmd install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Hubo un inconveniente al instalar las dependencias.
        echo Por favor revisa tu conexion a internet e intenta nuevamente.
        pause
        exit /b
    )
    echo.
    echo [OK] Dependencias instaladas con exito.
    echo.
)

:: 3. Abrir el navegador e iniciar el servidor local
echo ================================================================
echo   Iniciando el servidor de la aplicacion...
echo   Abriendo automaticamente en tu navegador: http://localhost:3000
echo ================================================================
echo.

:: Abre el navegador
start "" http://localhost:3000

:: Inicia el servidor de desarrollo Vite
call npm.cmd run dev

pause
