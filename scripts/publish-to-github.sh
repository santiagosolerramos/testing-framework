#!/usr/bin/env bash
# Publica el repo en GitHub y despliega en GitHub Pages.
# Uso: ./scripts/publish-to-github.sh

set -euo pipefail

GITHUB_USER="santiagosolerramos"
REPO_NAME="testing-framework"
REPO_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
PAGES_URL="https://${GITHUB_USER}.github.io/${REPO_NAME}/"

cd "$(dirname "$0")/.."

echo "→ Remote: ${REPO_URL}"
git remote set-url origin "${REPO_URL}" 2>/dev/null || git remote add origin "${REPO_URL}"

if command -v gh >/dev/null 2>&1; then
  if ! gh auth status >/dev/null 2>&1; then
    echo "Iniciá sesión en GitHub CLI:"
    gh auth login
  fi
  if ! gh repo view "${GITHUB_USER}/${REPO_NAME}" >/dev/null 2>&1; then
    echo "→ Creando repo público ${GITHUB_USER}/${REPO_NAME}..."
    gh repo create "${REPO_NAME}" --public --source=. --remote=origin --push
  else
    echo "→ Repo ya existe, haciendo push..."
    git push -u origin main
  fi
  echo ""
  echo "→ Activá Pages: GitHub → Settings → Pages → Source: GitHub Actions"
  echo "   (si no está ya activado)"
  echo ""
  echo "→ Cuando el workflow termine (Actions), la app estará en:"
  echo "   ${PAGES_URL}"
else
  echo "GitHub CLI (gh) no está instalado — usá el flujo manual abajo."
  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "  PASO 1 — Crear repo en el navegador"
  echo "════════════════════════════════════════════════════════════"
  echo "  https://github.com/new"
  echo "  • Repository name: ${REPO_NAME}"
  echo "  • Public"
  echo "  • NO marques Add a README / .gitignore / license"
  echo "  • Create repository"
  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "  PASO 2 — Subir código (en esta carpeta)"
  echo "════════════════════════════════════════════════════════════"
  echo "  git push -u origin main"
  echo ""
  echo "  Si pide usuario/contraseña:"
  echo "  • Username: ${GITHUB_USER}"
  echo "  • Password: un Personal Access Token (NO tu contraseña de GitHub)"
  echo "  • Crear token: https://github.com/settings/tokens/new"
  echo "    Scope: repo (marcar todo el grupo repo)"
  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "  PASO 3 — Activar GitHub Pages"
  echo "════════════════════════════════════════════════════════════"
  echo "  https://github.com/${GITHUB_USER}/${REPO_NAME}/settings/pages"
  echo "  • Source: GitHub Actions"
  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "  PASO 4 — URL pública (tras ~3 min en Actions)"
  echo "════════════════════════════════════════════════════════════"
  echo "  ${PAGES_URL}"
  echo ""
  read -r -p "¿Ya creaste el repo en github.com/new? [y/N] " created
  if [[ "${created}" =~ ^[yY] ]]; then
    echo "→ Ejecutando git push..."
    git push -u origin main
    echo ""
    echo "Listo. Activá Pages (Paso 3) y revisá Actions en el repo."
  else
    echo "Creá el repo primero (Paso 1), luego: git push -u origin main"
    exit 0
  fi
fi
