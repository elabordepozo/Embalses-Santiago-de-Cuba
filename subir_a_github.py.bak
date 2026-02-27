import subprocess
import sys
import os
from datetime import datetime

# ─── CONFIGURACIÓN ───────────────────────────────────────────────
REPO_PATH = r"C:\Users\Eduardo Laborde\Cuadro-de-Mando-Embalses"
BRANCH = "main"
# ─────────────────────────────────────────────────────────────────

def run(command, cwd=None):
    """Ejecuta un comando y devuelve el resultado."""
    result = subprocess.run(
        command,
        cwd=cwd,
        shell=True,
        capture_output=True,
        text=True,
        encoding="utf-8"
    )
    return result

def main():
    print("=" * 55)
    print("   🚀  SUBIR PROYECTO A GITHUB")
    print("=" * 55)

    # Verificar que la carpeta existe
    if not os.path.exists(REPO_PATH):
        print(f"\n❌ No se encontró la carpeta:\n   {REPO_PATH}")
        sys.exit(1)

    print(f"\n📁 Repositorio: {REPO_PATH}")

    # Ver estado de los cambios
    status = run("git status --short", cwd=REPO_PATH)
    if status.returncode != 0:
        print(f"\n❌ Error al verificar el estado:\n   {status.stderr}")
        sys.exit(1)

    if not status.stdout.strip():
        print("\n✅ No hay cambios nuevos. El repositorio ya está actualizado.")
        sys.exit(0)

    print("\n📝 Archivos con cambios:")
    for line in status.stdout.strip().splitlines():
        print(f"   {line}")

    # Pedir mensaje de commit
    print("\n" + "-" * 55)
    commit_msg = input("💬 Mensaje del commit (Enter para usar fecha/hora): ").strip()
    if not commit_msg:
        commit_msg = f"Actualización {datetime.now().strftime('%d/%m/%Y %H:%M')}"
    print(f"   → Usando: \"{commit_msg}\"")

    # git add .
    print("\n⏳ Agregando archivos...")
    add = run("git add .", cwd=REPO_PATH)
    if add.returncode != 0:
        print(f"❌ Error en git add:\n   {add.stderr}")
        sys.exit(1)
    print("   ✅ git add completado")

    # git commit
    print("⏳ Haciendo commit...")
    commit = run(f'git commit -m "{commit_msg}"', cwd=REPO_PATH)
    if commit.returncode != 0:
        print(f"❌ Error en git commit:\n   {commit.stderr}")
        sys.exit(1)
    print("   ✅ Commit realizado")

    # git push
    print(f"⏳ Subiendo a GitHub (rama: {BRANCH})...")
    push = run(f"git push origin {BRANCH}", cwd=REPO_PATH)
    if push.returncode != 0:
        print(f"❌ Error en git push:\n   {push.stderr}")
        print("\n💡 Posibles causas:")
        print("   - Necesitas autenticarte con un Personal Access Token")
        print("   - Comprueba tu conexión a internet")
        print("   - Puede haber cambios remotos que debas hacer 'pull' primero")
        sys.exit(1)

    print("   ✅ Push completado")

    print("\n" + "=" * 55)
    print("   🎉  ¡Proyecto subido a GitHub correctamente!")
    print("=" * 55)
    print(f"\n🔗 https://github.com/elabordepozo/Embalses-SCU\n")

if __name__ == "__main__":
    main()
