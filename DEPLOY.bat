@echo off
cd /d "%~dp0"
echo Iniciando deploy...
powershell.exe -ExecutionPolicy Bypass -NoExit -File "%~dp0deploy.ps1"
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Algo salio mal.
    pause
)
