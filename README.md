# Connectly Test Clone

UI clone for persona testing: sandbox chat, persona creation wizards (description, conversation, sandbox), fixtures, and a three-column test run view.

## Live demo (GitHub Pages)

After deploy:

**https://santiagosolerramos.github.io/testing-framework/**

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (includes base path `/testing-framework/`).

## Publish to GitHub (one command)

```bash
chmod +x scripts/publish-to-github.sh
./scripts/publish-to-github.sh
```

Requires [GitHub CLI](https://cli.github.com/) (`brew install gh`) and `gh auth login` the first time.

Manual alternative:

1. Repo: [santiagosolerramos/testing-framework](https://github.com/santiagosolerramos/testing-framework)
2. `git remote set-url origin https://github.com/santiagosolerramos/testing-framework.git`
3. `git push -u origin main`
4. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**

Push to `main` runs `.github/workflows/deploy.yml` automatically.

## Sandbox testing tips

| Flow | How |
|------|-----|
| Example chat | Sandbox → **Example: Product recommendation** |
| Session ID (wizard) | `sandbox-example-product-rec`, any Sandbox session ID from **Copy Session ID**, or `demo-abc` / `prod-xyz` |
| Create persona | **Create persona from session** (stays in Sandbox, opens review overlay) |
