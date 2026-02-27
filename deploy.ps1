# ─── CONFIGURACION ───────────────────────────────────────────────
$REPO_PATH   = "C:\Users\Eduardo Laborde\Cuadro-de-Mando-Embalses"
$GITHUB_USER = "elabordepozo"
$REPO_NAME   = "Embalses-Santiago-de-Cuba"
$BRANCH      = "main"
# ─────────────────────────────────────────────────────────────────

Set-Location $REPO_PATH

function Separador { Write-Host "-------------------------------------------------------" }

Clear-Host
Write-Host "======================================================="
Write-Host "   EMBALSES SANTIAGO DE CUBA - DEPLOY"
Write-Host "======================================================="

# Pedir token
Write-Host ""
Write-Host "GitHub Personal Access Token:"
$token = Read-Host "   >"
if (-not $token) {
    Write-Host "ERROR: Token vacio." -ForegroundColor Red
    Read-Host "Presiona ENTER para cerrar"
    exit 1
}

$remoteUrl = "https://$token@github.com/$GITHUB_USER/$REPO_NAME.git"
$repoUrl   = "https://github.com/$GITHUB_USER/$REPO_NAME"

# Verificar cambios
Write-Host ""
Separador
Write-Host "Cambios detectados:"
Separador

$status = git status --short
if (-not $status) {
    Write-Host "  No hay cambios pendientes." -ForegroundColor Yellow
    Write-Host "  Modifica los CSV en public/data/ y vuelve a ejecutar."
    Read-Host "Presiona ENTER para cerrar"
    exit 0
}

foreach ($line in $status) {
    Write-Host "   $line" -ForegroundColor Cyan
}

Write-Host ""
$respuesta = Read-Host "Continuar con build y deploy? (s/n)"
if ($respuesta -ne "s") {
    Write-Host "Cancelado." -ForegroundColor Yellow
    Read-Host "Presiona ENTER para cerrar"
    exit 0
}

# PASO 1: Build
Write-Host ""
Separador
Write-Host "PASO 1: Compilando proyecto..."
Separador

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR en el build." -ForegroundColor Red
    Read-Host "Presiona ENTER para cerrar"
    exit 1
}
Write-Host "   OK - dist/ generado correctamente" -ForegroundColor Green

# PASO 2: Commit y push
Write-Host ""
Separador
Write-Host "PASO 2: Subiendo codigo a GitHub..."
Separador

$fecha = Get-Date -Format "dd/MM/yyyy HH:mm"
$msg = Read-Host "`n   Descripcion del cambio (Enter = fecha actual)"
if (-not $msg) {
    $msg = "Actualizacion - $fecha"
}

git remote set-url origin $remoteUrl
git add .
git commit -m "$msg"
git push origin $BRANCH

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR en git push." -ForegroundColor Red
    Read-Host "Presiona ENTER para cerrar"
    exit 1
}
Write-Host "   OK - Codigo subido correctamente" -ForegroundColor Green

# PASO 3: Deploy GitHub Pages
Write-Host ""
Separador
Write-Host "PASO 3: Publicando en GitHub Pages..."
Separador

npx gh-pages -d dist -m "$msg"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al publicar." -ForegroundColor Red
    Read-Host "Presiona ENTER para cerrar"
    exit 1
}

# Resumen
Write-Host ""
Write-Host "======================================================="
Write-Host "   LISTO - WEB ACTUALIZADA" -ForegroundColor Green
Write-Host "======================================================="
Write-Host ""
Write-Host "Repositorio : $repoUrl"
Write-Host "Web         : https://$GITHUB_USER.github.io/$REPO_NAME/"
Write-Host ""
Write-Host "Los cambios pueden tardar 1-2 minutos en verse." -ForegroundColor Yellow
Write-Host ""
Read-Host "Presiona ENTER para cerrar"
