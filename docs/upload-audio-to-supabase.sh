#!/bin/bash
# TIMELESS MOMENT — Upload Era Audio to Supabase Storage
#
# Uploads .mp3 files from a local directory to the Supabase "era-audio" bucket.
#
# SETUP
# 1. Set your Supabase project URL and service role key:
#    export SUPABASE_URL=https://your-project.supabase.co
#    export SUPABASE_SERVICE_KEY=your-service-role-key
# 2. Place your .mp3 files in the ./era-audio directory
# 3. Make script executable: chmod +x upload-audio-to-supabase.sh
# 4. Run: ./upload-audio-to-supabase.sh

set -e

SUPABASE_URL="${SUPABASE_URL}"
SUPABASE_KEY="${SUPABASE_SERVICE_KEY}"
BUCKET="era-audio"
AUDIO_DIR="./era-audio"

if [ -z "$SUPABASE_URL" ]; then
  echo "Error: SUPABASE_URL not set"
  echo "Run: export SUPABASE_URL=https://your-project.supabase.co"
  exit 1
fi

if [ -z "$SUPABASE_KEY" ]; then
  echo "Error: SUPABASE_SERVICE_KEY not set"
  echo "Run: export SUPABASE_SERVICE_KEY=your-service-role-key"
  exit 1
fi

if [ ! -d "$AUDIO_DIR" ]; then
  echo "Error: Directory $AUDIO_DIR not found"
  echo "Place your .mp3 files in $AUDIO_DIR first"
  exit 1
fi

FILE_COUNT=$(find "$AUDIO_DIR" -name "*.mp3" | wc -l | tr -d ' ')
if [ "$FILE_COUNT" -eq 0 ]; then
  echo "No .mp3 files found in $AUDIO_DIR"
  exit 1
fi

echo "=== Timeless Moment — Supabase Audio Upload ==="
echo "Bucket: $BUCKET"
echo "Files: $FILE_COUNT .mp3 files in $AUDIO_DIR"
echo ""

UPLOADED=0
FAILED=0

for file in "$AUDIO_DIR"/*.mp3; do
  filename=$(basename "$file")
  filesize=$(du -h "$file" | cut -f1)
  echo -n "Uploading $filename ($filesize)... "

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    "${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: audio/mpeg" \
    -H "x-upsert: true" \
    --data-binary @"$file")

  if [ "$HTTP_CODE" -eq 200 ]; then
    echo "done"
    UPLOADED=$((UPLOADED + 1))
  else
    echo "FAILED (HTTP $HTTP_CODE)"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "=== Upload complete ==="
echo "Uploaded: $UPLOADED"
echo "Failed: $FAILED"
echo ""
echo "Public URLs follow this pattern:"
echo "  ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/alamo-1500.mp3"
