#!/bin/bash
set -e

echo "Building Tempo..."
npm run build

echo "Deploying to gh-pages..."
cd dist
git init
git add -A
git commit -m "Deploy $(date)"
git push -f https://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@github.com/FreeHeelRN/tempo.git master:gh-pages

echo "✅ Deployed successfully!"
