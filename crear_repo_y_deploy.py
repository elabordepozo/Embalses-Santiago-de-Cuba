import subprocess
import sys
import os
import re
import json
import urllib.request
import urllib.error
from datetime import datetime

# ─── CONFIGURACION ───────────────────────────────────────────────
REPO_PATH    = r"C:\Users\Eduardo Laborde\Cuadro-de-Mando-Embalses"
GITHUB_USER  = "elabordepozo"
GITHUB_TOKEN = "TU_TOKEN_AQUI"
REPO_NAME    = "Embalses-Santiago-de-Cuba"
REPO_DESC    = "Cuadro de Mando Hidrologico - Embalses de Santiago de Cuba"
BRANCH       = "main"
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

def create_github_repo():
    url = "https://api.github.com/user/repos"
    payload = json.dumps({
        "name": REPO_NAME,
        "description": REPO_DESC,
        "private": False,
        "auto_init": False
    }).encode("utf-8")

    req = urllib.request.Request(url, data=payload, method="POST")
    req.add_header("Authorization", "token " + GITHUB_TOKEN)
    req.add_header("Accept", "application/vnd.github.v3+json")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            return True, data.get("html_url", "")
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode())
        msg = body.get("message", str(e))
        if "already exists" in msg or e.code == 422:
            return "exists", "https://github.com/" + GITHUB_USER + "/" + REPO_NAME
        return False, msg

def activate_github_pages():
    url = "https://api.github.com/repos/" + GITHUB_USER + "/" + REPO_NAME + "/pages"
    payload = json.dumps({
        "source": {"branch": "gh-pages", "path": "/"}
    }).encode("utf-8")
    req = urllib.request.Request(url, data=payload, method="POST")
    req.add_header("Authorization", "token " + GITHUB_TOKEN)
    req.add_header("Accept", "application/vnd.github.v3+json")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req):
            print("   OK GitHub Pages activado")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        if "already enabled" in body or e.code in (409, 422):
            print("   GitHub Pages ya estaba activado")
        else:
            print("   Activalo manualmente: Settings -> Pages -> gh-pages / root")

def main():
    print("=" * 60)
    print("   CREAR REPO + BUILD + DEPLOY A GITHUB PAGES")
    print("=" * 60)

    if not os.path.exists(REPO_PATH):
        print("\nERROR: No se encontro la carpeta: " + REPO_PATH)
        sys.exit(1)

    # PASO 1: Crear repositorio en GitHub
    print("\n" + "-" * 60)
    print("PASO 1: Creando repositorio en GitHub...")
    print("-" * 60)

    status, repo_url_result = create_github_repo()
    if status is False:
        print("ERROR al crear el repositorio: " + repo_url_result)
        sys.exit(1)
    elif status == "exists":
        print("   El repositorio ya existe, continuando...")
    else:
        print("   OK Repositorio creado: " + repo_url_result)

    repo_url   = "https://github.com/" + GITHUB_USER + "/" + REPO_NAME
    remote_url = "https://" + GITHUB_TOKEN + "@github.com/" + GITHUB_USER + "/" + REPO_NAME + ".git"

    # PASO 2: Configurar git local
    print("\n" + "-" * 60)
    print("PASO 2: Configurando git local...")
    print("-" * 60)

    if not os.path.exists(os.path.join(REPO_PATH, ".git")):
        run("git init", cwd=REPO_PATH)
        run("git branch -M " + BRANCH, cwd=REPO_PATH)
        print("   OK Repositorio git inicializado")

    remotes = run("git remote", cwd=REPO_PATH)
    if "origin" in remotes.stdout:
        run("git remote set-url origin " + remote_url, cwd=REPO_PATH)
        print("   OK Remote actualizado -> " + repo_url)
    else:
        run("git remote add origin " + remote_url, cwd=REPO_PATH)
        print("   OK Remote añadido -> " + repo_url)

    # PASO 3: Actualizar vite.config.ts
    print("\n" + "-" * 60)
    print("PASO 3: Actualizando vite.config.ts...")
    print("-" * 60)

    vite_config_path = os.path.join(REPO_PATH, "vite.config.ts")
    if os.path.exists(vite_config_path):
        with open(vite_config_path, "r", encoding="utf-8") as f:
            content = f.read()
        new_base = "base: '/" + REPO_NAME + "',"
        if re.search(r"base:\s*'[^']*'", content):
            content = re.sub(r"base:\s*'[^']*',?", new_base, content)
        else:
            content = content.replace("server: {", new_base + "\n      server: {")
        with open(vite_config_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("   OK vite.config.ts actualizado con base '/" + REPO_NAME + "/'")

    # PASO 4: Build con Vite
    print("\n" + "-" * 60)
    print("PASO 4: Compilando con Vite (npm run build)...")
    print("-" * 60)
    code = run_live("npm run build", cwd=REPO_PATH)
    if code != 0:
        print("\nERROR durante el build.")
        sys.exit(1)
    print("\n   OK Build completado - carpeta dist/ generada")

    # PASO 5: Commit y push del codigo fuente
    print("\n" + "-" * 60)
    print("PASO 5: Commit y push del codigo fuente...")
    print("-" * 60)

    git_status = run("git status --short", cwd=REPO_PATH)
    if git_status.stdout.strip():
        commit_msg = "Proyecto inicial - " + datetime.now().strftime("%d/%m/%Y %H:%M")
        run("git add .", cwd=REPO_PATH)
        commit = run('git commit -m "' + commit_msg + '"', cwd=REPO_PATH)
        if commit.returncode != 0 and "nothing to commit" not in commit.stdout:
            print("ERROR en commit:\n" + commit.stderr)
            sys.exit(1)
        print("   OK Commit: " + commit_msg)
    else:
        print("   Sin cambios nuevos en el codigo fuente")

    push = run("git push -u origin " + BRANCH, cwd=REPO_PATH)
    if push.returncode != 0:
        print("ERROR en git push:\n" + push.stderr)
        sys.exit(1)
    print("   OK Codigo fuente subido a rama '" + BRANCH + "'")

    # PASO 6: Deploy a GitHub Pages
    print("\n" + "-" * 60)
    print("PASO 6: Desplegando en GitHub Pages (rama gh-pages)...")
    print("-" * 60)

    code = run_live(
        'npx gh-pages -d dist -m "Deploy GitHub Pages"',
        cwd=REPO_PATH
    )
    if code != 0:
        print("\nERROR al desplegar.")
        print("Ve a GitHub -> Settings -> Pages -> Source -> gh-pages / root")
        sys.exit(1)

    # PASO 7: Activar GitHub Pages via API
    print("\n" + "-" * 60)
    print("PASO 7: Activando GitHub Pages via API...")
    print("-" * 60)
    activate_github_pages()

    # RESUMEN
    print("\n" + "=" * 60)
    print("   TODO LISTO!")
    print("=" * 60)
    print("\nRepositorio : " + repo_url)
    print("GitHub Pages: https://" + GITHUB_USER + ".github.io/" + REPO_NAME + "/")
    print("\nLa web puede tardar 1-2 minutos en estar disponible.\n")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("\nError inesperado: " + str(e))
    finally:
        input("\nPresiona ENTER para cerrar...")
