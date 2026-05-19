# Connectly Test Clone

UI clone for persona testing: sandbox chat, persona creation wizards (description, conversation, sandbox), fixtures, and a three-column test run view.

## Live demo (GitHub Pages)

After deploy:

**https://santiagosolerramos.github.io/connectly-test-clone/**

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (includes base path `/connectly-test-clone/`).

## Publish to GitHub (one command)

```bash
chmod +x scripts/publish-to-github.sh
./scripts/publish-to-github.sh
```

Requires [GitHub CLI](https://cli.github.com/) (`brew install gh`) and `gh auth login` the first time.

Manual alternative:

1. Create public repo `connectly-test-clone` under [santiagosolerramos](https://github.com/santiagosolerramos).
2. `git remote set-url origin https://github.com/santiagosolerramos/connectly-test-clone.git`
3. `git push -u origin main`
4. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**

Push to `main` runs `.github/workflows/deploy.yml` automatically.

## Sandbox testing tips

| Flow | How |
|------|-----|
| Example chat | Sandbox → **Example: Product recommendation** |
| Session ID (wizard) | `sandbox-example-product-rec`, any Sandbox session ID from **Copy Session ID**, or `demo-abc` / `prod-xyz` |
| Create persona | **Create persona from session** (stays in Sandbox, opens review overlay) |
