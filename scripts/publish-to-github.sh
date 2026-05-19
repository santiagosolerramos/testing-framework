#!/usr/bin/env bash
# Publica el repo en GitHub y despliega en GitHub Pages.
# Uso: ./scripts/publish-to-github.sh

set -euo pipefail

GITHUB_USER="santiagosolerramos"
REPO_NAME="connectly-test-clone"
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
  echo "GitHub CLI (gh) no está instalado."
  echo ""
  echo "Opción A — instalar gh y volver a correr este script:"
  echo "  brew install gh"
  echo "  ./scripts/publish-to-github.sh"
  echo ""
  echo "Opción B — manual:"
  echo "  1. Creá el repo vacío: https://github.com/new"
  echo "     Nombre: ${REPO_NAME} | Public | sin README"
  echo "  2. git push -u origin main"
  echo "  3. Settings → Pages → Source: GitHub Actions"
  echo "  4. URL: ${PAGES_URL}"
  exit 1
fi
