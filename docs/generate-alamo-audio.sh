#!/bin/bash
# TIMELESS MOMENT — ElevenLabs Audio Generation Script
# Generates ambient soundscapes for all Alamo eras
#
# SETUP
# 1. Get your ElevenLabs API key from elevenlabs.io/app/settings/api-keys
# 2. Set it: export ELEVENLABS_API_KEY=your_key_here
# 3. Make script executable: chmod +x generate-alamo-audio.sh
# 4. Run: ./generate-alamo-audio.sh
# 5. Upload generated .mp3 files to Supabase Storage → era-audio bucket

set -e

API_KEY="${ELEVENLABS_API_KEY}"
OUTPUT_DIR="./era-audio"
mkdir -p "$OUTPUT_DIR"

if [ -z "$API_KEY" ]; then
  echo "Error: ELEVENLABS_API_KEY not set"
  echo "Run: export ELEVENLABS_API_KEY=your_key_here"
  exit 1
fi

generate() {
  local era_id="$1"
  local prompt="$2"
  local output="$OUTPUT_DIR/${era_id}.mp3"

  if [ -f "$output" ]; then
    echo "Skipping $era_id (already exists)"
    return
  fi

  echo "Generating $era_id..."
  
  curl -s -X POST "https://api.elevenlabs.io/v1/sound-generation" \
    -H "xi-api-key: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"text\": \"$prompt\",
      \"duration_seconds\": 45,
      \"prompt_influence\": 0.3
    }" \
    --output "$output"
  
  # Check if output is valid MP3 (not an error response)
  if file "$output" | grep -q "MPEG"; then
    echo "  ✓ $era_id generated ($(du -h "$output" | cut -f1))"
  else
    echo "  ✗ $era_id failed — check API key and quota"
    cat "$output"
    rm -f "$output"
  fi
  
  # Rate limit: ElevenLabs allows ~10 requests/minute on free tier
  sleep 7
}

echo "=== Timeless Moment — Alamo Audio Generation ==="
echo "Output directory: $OUTPUT_DIR"
echo ""

generate "alamo-1500" \
  "California oak woodland valley, gentle creek flowing over smooth stones, acorns falling from oak trees, red-tailed hawk call in the distance, warm breeze through dry grass, cicadas in summer heat, occasional deer movement through brush, no human sounds, peaceful and ancient"

generate "alamo-1834" \
  "California cattle ranch, large herd of longhorn cattle lowing and moving, leather saddle creaking, vaquero whistling to the herd, horse hooves on dry earth, wind across open grassland, distant mission bell faint on the breeze, Spanish spoken quietly between two men"

generate "alamo-1856" \
  "Small American farming settlement 1850s, rooster crowing at dawn, horse-drawn wagon on dirt road, hammer striking wood as a barn is built, children playing in the distance, creek flowing nearby, wind in oak trees, dog barking, quiet agricultural morning"

generate "alamo-1900" \
  "California walnut orchard harvest, workers shaking trees and collecting nuts, the sound of walnuts falling on canvas tarps, horse-drawn harvesting equipment, women sorting nuts into baskets, distant train whistle on the valley line, warm autumn afternoon, bees in the orchard"

generate "alamo-1950" \
  "American suburb under construction 1955, bulldozer clearing land, hammer and nails framing new houses, cement mixer turning, radio playing early rock and roll faintly from a construction site, children on bicycles on a new paved street, lawn sprinkler ticking, California afternoon"

generate "alamo-1980" \
  "Affluent California suburb 1985, lawnmower in the distance, backyard pool filter humming, sprinklers turning on, someone playing tennis on a private court, garage door opening, neighborhood quiet on a weekday afternoon, a phone ringing inside a house"

generate "alamo-2001" \
  "Quiet California suburb, for sale sign swinging in wind, an empty house, distant highway traffic on 680, someone mowing lawn, mail truck stopping and moving on, a dog barking once then silence, oak trees in wind, afternoon malaise"

generate "alamo-2025" \
  "Alamo California suburb present day, morning birdsong in oak trees, Mount Diablo wind, distant BART train, someone sprinkler system running, a Tesla quietly pulling out of a driveway, hawk overhead, the persistent hum of the 680 freeway in the distance, peaceful affluent suburb morning"

generate "alamo-2075" \
  "California wildfire approaching, distant roar of fire in dry hills, embers crackling, emergency alert tone, helicopter overhead, smoke in the air giving sounds a muffled quality, wind picking up carrying ash, distant sirens, oak trees creaking in hot wind, the sound of evacuation"

echo ""
echo "=== Generation complete ==="
echo "Files saved to: $OUTPUT_DIR"
echo ""
echo "Next steps:"
echo "1. Review files — open each .mp3 and confirm it sounds right"
echo "2. Upload to Supabase: Storage → era-audio bucket"
echo "3. Files are automatically picked up by the audio player"
