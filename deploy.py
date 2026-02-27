import subprocess
import sys
import os
from datetime import datetime

# ─── CONFIGURACION ───────────────────────────────────────────────
REPO_PATH   = r"C:\Users\Eduardo Laborde\Cuadro-de-Mando-Embalses"
GITHUB_USER = "elabordepozo"
REPO_NAME   = "Embalses-Santiago-de-Cuba"
BRANCH      = "main"
# ─────────────────────────────────────────────────────────────────

def run(command, cwd=None):
    return subprocess.run(
        command, cwd=cwd, shell=True,
        capture_output=True, text=True, encoding="utf-8"
    )

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

def separador():
    print("-" * 55)

def main():
    print("=" * 55)
    print("   EMBALSES SANTIAGO DE CUBA - DEPLOY")
    print("=" * 55)

    # Pedir token (no se guarda en el codigo)
    print("\nGitHub Personal Access Token:")
    token = input("   > ").strip()
    if not token:
        print("ERROR: Token vacio.")
        sys.exit(1)

    remote_url = "https://" + token + "@github.com/" + GITHUB_USER + "/" + REPO_NAME + ".git"
    repo_url   = "https://github.com/" + GITHUB_USER + "/" + REPO_NAME

    # ── Verificar cambios ────────────────────────────────────────
    print("\n")
    separador()
    print("Cambios detectados:")
    separador()

    status = run("git status --short", cwd=REPO_PATH)
    if not status.stdout.strip():
        print("  No hay cambios pendientes.")
        print("  Modifica los CSV en public/data/ y vuelve a ejecutar.")
        return

    for line in status.stdout.strip().splitlines():
        print("   " + line)

    print()
    respuesta = input("Continuar con build y deploy? (s/n): ").strip().lower()
    if respuesta != "s":
        print("Cancelado.")
        return

    # ── PASO 1: Build ────────────────────────────────────────────
    print("\n")
    separador()
    print("PASO 1: Compilando proyecto (npm run build)...")
    separador()

    code = run_live("npm run build", cwd=REPO_PATH)
    if code != 0:
        print("\nERROR en el build. Revisa los mensajes de arriba.")
        sys.exit(1)
    print("\n   OK - dist/ generado correctamente")

    # ── PASO 2: Commit y push codigo fuente ──────────────────────
    print("\n")
    separador()
    print("PASO 2: Subiendo codigo fuente a GitHub...")
    separador()

    fecha = datetime.now().strftime("%d/%m/%Y %H:%M")
    msg = input("\n   Descripcion del cambio (Enter = fecha actual): ").strip()
    if not msg:
        msg = "Actualizacion - " + fecha

    run("git remote set-url origin " + remote_url, cwd=REPO_PATH)
    run("git add .", cwd=REPO_PATH)
    commit = run('git commit -m "' + msg + '"', cwd=REPO_PATH)
    if commit.returncode != 0 and "nothing to commit" not in commit.stdout:
        print("ERROR en commit:\n" + commit.stderr)
        sys.exit(1)

    push = run("git push origin " + BRANCH, cwd=REPO_PATH)
    if push.returncode != 0:
        print("ERROR en push:\n" + push.stderr)
        sys.exit(1)
    print("   OK - Codigo subido a " + repo_url)

    # ── PASO 3: Deploy GitHub Pages ──────────────────────────────
    print("\n")
    separador()
    print("PASO 3: Publicando en GitHub Pages...")
    separador()

    code = run_live('npx gh-pages -d dist -m "' + msg + '"', cwd=REPO_PATH)
    if code != 0:
        print("\nERROR al publicar en GitHub Pages.")
        sys.exit(1)

    # ── Resumen ──────────────────────────────────────────────────
    print("\n" + "=" * 55)
    print("   LISTO - WEB ACTUALIZADA")
    print("=" * 55)
    print("\nRepositorio : " + repo_url)
    print("Web         : https://" + GITHUB_USER + ".github.io/" + REPO_NAME + "/")
    print("\nLos cambios pueden tardar 1-2 minutos en verse.\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nOperacion cancelada.")
    except Exception as e:
        print("\nError inesperado: " + str(e))
    finally:
        input("\nPresiona ENTER para cerrar...")
