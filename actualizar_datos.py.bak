import subprocess
import sys
import os
from datetime import datetime

# ─── CONFIGURACION ───────────────────────────────────────────────
REPO_PATH  = r"C:\Users\Eduardo Laborde\Cuadro-de-Mando-Embalses"
GITHUB_USER = "elabordepozo"
REPO_NAME  = "Embalses-Santiago-de-Cuba"
BRANCH     = "main"
DATA_PATH  = os.path.join(REPO_PATH, "public", "data")
# ─────────────────────────────────────────────────────────────────

def run(command, cwd=None):
    result = subprocess.run(
        command, cwd=cwd, shell=True,
        capture_output=True, text=True, encoding="utf-8"
    )
    return result

def run_live(command, cwd=None):
    process = subprocess.Popen(
        command, cwd=cwd, shell=True,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, encoding="utf-8"
    )
    for line in process.stdout:
        print("   " + line, end="")
    process.wait()
    return process.returncode

def main():
    print("=" * 60)
    print("   ACTUALIZAR DATOS - EMBALSES SANTIAGO DE CUBA")
    print("=" * 60)

    # Pedir token de forma segura (no se guarda en el codigo)
    print("\nIntroduce tu GitHub Personal Access Token:")
    print("(no se guarda, solo se usa para este push)\n")
    token = input("   Token: ").strip()
    if not token:
        print("ERROR: Token vacio.")
        sys.exit(1)

    remote_url = "https://" + token + "@github.com/" + GITHUB_USER + "/" + REPO_NAME + ".git"

    # Mostrar archivos CSV
    print("\nArchivos CSV en public/data/:")
    for f in os.listdir(DATA_PATH):
        if f.endswith(".csv"):
            full_path = os.path.join(DATA_PATH, f)
            size = os.path.getsize(full_path)
            modified = datetime.fromtimestamp(os.path.getmtime(full_path))
            print("   " + f + "  (" + str(size) + " bytes)  Modificado: " + modified.strftime("%d/%m/%Y %H:%M"))

    # Verificar cambios
    print("\n" + "-" * 60)
    print("Verificando cambios...")
    print("-" * 60)

    status = run("git status --short", cwd=REPO_PATH)
    if not status.stdout.strip():
        print("\n  No hay cambios pendientes.")
        return

    print("\nArchivos modificados:")
    for line in status.stdout.strip().splitlines():
        print("   " + line)

    respuesta = input("\nContinuar con build y deploy? (s/n): ").strip().lower()
    if respuesta != "s":
        print("Operacion cancelada.")
        return

    # PASO 1: Build
    print("\n" + "-" * 60)
    print("PASO 1: Compilando con Vite...")
    print("-" * 60)
    code = run_live("npm run build", cwd=REPO_PATH)
    if code != 0:
        print("\nERROR durante el build.")
        sys.exit(1)
    print("\n   OK Build completado")

    # PASO 2: Commit y push
    print("\n" + "-" * 60)
    print("PASO 2: Subiendo cambios a GitHub...")
    print("-" * 60)

    fecha = datetime.now().strftime("%d/%m/%Y %H:%M")
    commit_msg = input("\n   Descripcion del cambio (Enter para usar fecha): ").strip()
    if not commit_msg:
        commit_msg = "Actualizacion de datos - " + fecha

    run("git remote set-url origin " + remote_url, cwd=REPO_PATH)
    run("git add .", cwd=REPO_PATH)
    run('git commit -m "' + commit_msg + '"', cwd=REPO_PATH)
    push = run("git push origin " + BRANCH, cwd=REPO_PATH)
    if push.returncode != 0:
        print("ERROR en git push:\n" + push.stderr)
        sys.exit(1)
    print("   OK Codigo subido a GitHub")

    # PASO 3: Deploy a GitHub Pages
    print("\n" + "-" * 60)
    print("PASO 3: Publicando en GitHub Pages...")
    print("-" * 60)
    code = run_live('npx gh-pages -d dist -m "Actualizacion de datos"', cwd=REPO_PATH)
    if code != 0:
        print("\nERROR al publicar.")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("   DATOS ACTUALIZADOS CORRECTAMENTE")
    print("=" * 60)
    print("\nWeb: https://" + GITHUB_USER + ".github.io/" + REPO_NAME + "/")
    print("Los cambios pueden tardar 1-2 minutos en verse.\n")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("\nError inesperado: " + str(e))
    finally:
        input("\nPresiona ENTER para cerrar...")
