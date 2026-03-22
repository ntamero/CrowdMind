#!/bin/bash
# Fix missing images by fetching from Pexels via curl and updating DB

PEXELS_KEY="BfFTWoN8xvMWRzJJmEsTrack7aZ9ANbmjMtKxWqezHgCfNwiXKUsvpQhS0"
DB="postgresql://wisery:wisery2026@127.0.0.1:5432/wisery_db"

declare -A SEARCH_TERMS
SEARCH_TERMS["Will Bitcoin close"]="bitcoin"
SEARCH_TERMS["Which team will dominate"]="basketball"
SEARCH_TERMS["Will Apple announce"]="apple+technology"
SEARCH_TERMS["Which movie will top"]="cinema+movie"
SEARCH_TERMS["Will the S&P 500"]="stock+market"
SEARCH_TERMS["Will GPT-5"]="artificial+intelligence"
SEARCH_TERMS["Will Ethereum break"]="ethereum"
SEARCH_TERMS["Will any country officially"]="government+politics"
SEARCH_TERMS["Will a major mRNA"]="medical+laboratory"
SEARCH_TERMS["Will a tech company"]="technology+office"

# Get questions without images
IDS=$(psql "$DB" -t -A -c "SELECT id || '|' || title FROM \"Question\" WHERE \"imageUrl\" IS NULL")

while IFS= read -r line; do
  [ -z "$line" ] && continue
  ID="${line%%|*}"
  TITLE="${line#*|}"

  # Find matching search term
  QUERY="technology"
  for prefix in "${!SEARCH_TERMS[@]}"; do
    if [[ "$TITLE" == "$prefix"* ]]; then
      QUERY="${SEARCH_TERMS[$prefix]}"
      break
    fi
  done

  echo "Fetching image for: $TITLE (query: $QUERY)"

  # Get image URL from Pexels
  IMG=$(curl -s -H "Authorization: $PEXELS_KEY" \
    "https://api.pexels.com/v1/search?query=$QUERY&per_page=3" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['photos'][0]['src']['large'] if d.get('photos') else '')" 2>/dev/null)

  if [ -n "$IMG" ]; then
    psql "$DB" -c "UPDATE \"Question\" SET \"imageUrl\" = '$IMG' WHERE id = '$ID'"
    echo "  ✓ Updated"
  else
    echo "  ✗ No image found"
  fi
done <<< "$IDS"

echo "Done!"
