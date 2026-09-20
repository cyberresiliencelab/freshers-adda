#!/usr/bin/env bash
# Freshers Adda — one-shot deploy.
# Prereqs (once): install GitHub CLI  ->  https://cli.github.com  , then:  gh auth login
# Usage:  ./deploy.sh                 (repo name defaults to "freshers-adda")
#         ./deploy.sh my-repo-name
set -euo pipefail

REPO="${1:-freshers-adda}"

echo "==> Preparing repo '$REPO'"
git init -b main
git add .
git commit -m "Freshers Adda: initial deploy"

echo "==> Creating PRIVATE GitHub repo and pushing"
gh repo create "$REPO" --private --source=. --remote=origin --push

echo
echo "==> Almost done. Two clicks left in the browser:"
echo "    1) Settings -> Pages -> 'Build and deployment' -> Source: GitHub Actions"
echo "       (the included workflow then publishes on every push)"
echo "    2) Settings -> Collaborators -> invite your group by username"
echo
echo "Note: GitHub Pages on a PRIVATE repo needs a paid GitHub plan (Pro/Team)."
echo "On the free plan, either make the repo public (the passphrase still gates entry),"
echo "or deploy to Netlify / Cloudflare Pages with password protection instead."
