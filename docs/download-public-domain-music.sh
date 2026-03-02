#!/bin/bash
# TIMELESS MOMENT — Download Public Domain Era Music
#
# Downloads royalty-free/public domain music from Internet Archive
# for historical eras. Files are saved to ~/timeless/era-music/
# with filenames matching era IDs.
#
# Usage:
#   chmod +x docs/download-public-domain-music.sh
#   ./docs/download-public-domain-music.sh

set -e

OUTPUT_DIR="$HOME/timeless/era-music"
mkdir -p "$OUTPUT_DIR"

echo "=== Timeless Moment — Public Domain Music Download ==="
echo "Output directory: $OUTPUT_DIR"
echo ""

download() {
  local url="$1"
  local filename="$2"
  local description="$3"
  local output="$OUTPUT_DIR/$filename"

  if [ -f "$output" ]; then
    echo "Skipping $filename (already exists)"
    return
  fi

  echo -n "Downloading $filename ($description)... "
  if curl -L -s -f "$url" -o "$output"; then
    local size
    size=$(du -h "$output" | cut -f1)
    echo "done ($size)"
  else
    echo "FAILED"
    rm -f "$output"
  fi
}

# 1834 Spanish California
download \
  "https://archive.org/download/78_la-paloma_don-juan-jose-rodriguez/La%20Paloma.mp3" \
  "alamo-1834-music.mp3" \
  "La Paloma, Spanish California"

# 1856 Gold Rush era
download \
  "https://archive.org/download/78_oh-susanna_stephen-foster/Oh%20Susanna.mp3" \
  "alamo-1856-music.mp3" \
  "Oh Susanna, Stephen Foster"

# 1900 Ragtime
download \
  "https://archive.org/download/MapleLeafRag/MapleLeafRag.mp3" \
  "alamo-1900-music.mp3" \
  "Maple Leaf Rag, Scott Joplin"

# 1920s Jazz
download \
  "https://archive.org/download/78_st-louis-blues_bessie-smith/St.%20Louis%20Blues.mp3" \
  "alamo-1925-music.mp3" \
  "St. Louis Blues, Bessie Smith"

# 1930s Depression era
download \
  "https://archive.org/download/78_brother-can-you-spare-a-dime/Brother%20Can%20You%20Spare%20A%20Dime.mp3" \
  "nyc-wall-street-1929-music.mp3" \
  "Brother Can You Spare a Dime"

# 1940s WWII
download \
  "https://archive.org/download/78_boogie-woogie-bugle-boy/Boogie%20Woogie%20Bugle%20Boy.mp3" \
  "london-whitechapel-1940-music.mp3" \
  "Boogie Woogie Bugle Boy"

# 1950s
download \
  "https://archive.org/download/78_rock-around-the-clock/Rock%20Around%20The%20Clock.mp3" \
  "alamo-1950-music.mp3" \
  "Rock Around the Clock"

# 1960s
download \
  "https://archive.org/download/CcMixter-expos-60732/BobDylanTimes.mp3" \
  "alamo-1969-music.mp3" \
  "The Times They Are A-Changin"

echo ""
echo "=== Download complete ==="
echo "Files saved to: $OUTPUT_DIR"
echo ""
echo "Next steps:"
echo "1. Review each .mp3 file for quality"
echo "2. Run docs/upload-music-to-supabase.sh to upload to Supabase"
