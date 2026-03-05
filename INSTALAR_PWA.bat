@echo off
echo ============================================
echo  Instalando todas las dependencias...
echo  (incluye Tailwind compilado y PWA)
echo ============================================
 call npm install

echo.
echo ============================================
echo  Generando iconos PNG...
echo ============================================
call npx sharp-cli --input public/icons/icon.svg --output public/icons/icon-192.png resize 192 192 2>nul
call npx sharp-cli --input public/icons/icon.svg --output public/icons/icon-512.png resize 512 512 2>nul

IF NOT EXIST "public\icons\icon-192.png" (
    echo Intentando con otro metodo...
    call npx svgexport public/icons/icon.svg public/icons/icon-192.png 192:192 2>nul
    call npx svgexport public/icons/icon.svg public/icons/icon-512.png 512:512 2>nul
)

IF NOT EXIST "public\icons\icon-192.png" (
    echo.
    echo AVISO: No se pudieron generar los iconos automaticamente.
    echo Por favor, convierte manualmente el archivo:
    echo   public\icons\icon.svg
    echo a dos PNG llamados:
    echo   public\icons\icon-192.png  (192x192 pixeles)
    echo   public\icons\icon-512.png  (512x512 pixeles)
    echo Puedes usar: https://cloudconvert.com/svg-to-png
    echo.
) ELSE (
    echo Iconos generados correctamente.
)

echo.
echo ============================================
echo  Construyendo la app con soporte PWA...
echo ============================================
call npm run build

echo.
echo ============================================
echo  Listo! Ahora ejecuta deploy.bat o deploy.py
echo  para publicar en GitHub Pages.
echo ============================================
pause
