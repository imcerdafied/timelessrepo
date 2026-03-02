#!/bin/bash
# TIMELESS MOMENT — Upload Era Music to Supabase Storage
#
# Uploads music .mp3 files from ~/timeless/era-music/ to the
# Supabase "era-audio" bucket (same bucket as ambient audio).
#
# SETUP
# 1. Set your Supabase project URL and service role key:
#    export SUPABASE_URL=https://rqhmegnxtdlvytpxamjn.supabase.co
#    export SUPABASE_SERVICE_KEY=your-service-role-key
# 2. Run docs/download-public-domain-music.sh first to get the files
# 3. Make script executable: chmod +x docs/upload-music-to-supabase.sh
# 4. Run: ./docs/upload-music-to-supabase.sh

set -e

SUPABASE_URL="${SUPABASE_URL:-https://rqhmegnxtdlvytpxamjn.supabase.co}"
SUPABASE_KEY="${SUPABASE_SERVICE_KEY}"
BUCKET="era-audio"
MUSIC_DIR="$HOME/timeless/era-music"

if [ -z "$SUPABASE_KEY" ]; then
  echo "Error: SUPABASE_SERVICE_KEY not set"
  echo "Run: export SUPABASE_SERVICE_KEY=your-service-role-key"
  exit 1
fi

if [ ! -d "$MUSIC_DIR" ]; then
  echo "Error: Directory $MUSIC_DIR not found"
  echo "Run docs/download-public-domain-music.sh first"
  exit 1
fi

FILE_COUNT=$(find "$MUSIC_DIR" -name "*.mp3" | wc -l | tr -d ' ')
if [ "$FILE_COUNT" -eq 0 ]; then
  echo "No .mp3 files found in $MUSIC_DIR"
  exit 1
fi

echo "=== Timeless Moment — Supabase Music Upload ==="
echo "Bucket: $BUCKET"
echo "Files: $FILE_COUNT .mp3 files in $MUSIC_DIR"
echo ""

UPLOADED=0
FAILED=0

for file in "$MUSIC_DIR"/*.mp3; do
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
echo "  ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/alamo-1834-music.mp3"
