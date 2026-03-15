#!/bin/bash
# Run this from inside your timelessrepo clone on your Mac:
#   cd ~/timelessrepo
#   bash /path/to/deploy-bundle/DEPLOY.sh /path/to/deploy-bundle
#
# It copies all files into the right places, commits, and pushes.

BUNDLE_DIR="${1:-.}"

echo "Copying files from $BUNDLE_DIR into repo..."

# Copy everything, preserving directory structure
cp -R "$BUNDLE_DIR/scenes" .
cp -R "$BUNDLE_DIR/docs" .
cp -R "$BUNDLE_DIR/scripts" .
cp "$BUNDLE_DIR/apps/backend/server.js" apps/backend/
cp "$BUNDLE_DIR/apps/backend/src/services/hedraService.js" apps/backend/src/services/
cp "$BUNDLE_DIR/apps/backend/src/services/sceneService.js" apps/backend/src/services/
cp "$BUNDLE_DIR/apps/backend/src/routes/scene.js" apps/backend/src/routes/
cp "$BUNDLE_DIR/apps/frontend/src/components/ExperienceWindow.jsx" apps/frontend/src/components/
cp "$BUNDLE_DIR/apps/frontend/src/components/ScenePlayer.jsx" apps/frontend/src/components/
cp "$BUNDLE_DIR/apps/frontend/src/components/SceneSelector.jsx" apps/frontend/src/components/
cp "$BUNDLE_DIR/apps/frontend/src/services/sceneService.js" apps/frontend/src/services/

echo "Staging files..."
git add scenes/ docs/ scripts/ \
  apps/backend/server.js \
  apps/backend/src/services/hedraService.js \
  apps/backend/src/services/sceneService.js \
  apps/backend/src/routes/scene.js \
  apps/frontend/src/components/ExperienceWindow.jsx \
  apps/frontend/src/components/ScenePlayer.jsx \
  apps/frontend/src/components/SceneSelector.jsx \
  apps/frontend/src/services/sceneService.js

echo "Committing..."
git commit -m "feat: AI-generated scene system with 3 rendering modes

Add complete scene pipeline: Claude writes dialogue, ElevenLabs voices
characters, and three playback modes let users experience 1906 SF earthquake
through Rosa Castellano and Arnold Genthe across one day.

Episode 1 (video) - Episode 2 (audio+portrait) - Episode 3 (cinematic)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

echo "Pushing..."
git push origin main

echo "Done! Railway should auto-deploy."
