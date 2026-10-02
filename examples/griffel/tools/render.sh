#!/usr/bin/env bash
# Render the film. Every path captures lossless PNGs (draft: HyperFrames; final: tools/capture_seq.mjs) and encodes them with tools/encode_seq.py
# (explicit BT.709 matrix, limited range, 16-bit blur, 1 LSB dither, tagged), so the brand green and
# white survive the encode. Check a result with tools/check_encode.py.
#
#   tools/render.sh 169 draft    -> renders/film-169-draft.mp4   (60 fps, no blur, x264 medium)
#   tools/render.sh 45  final    -> renders/film-45-final.mp4    (60 fps, 8-subframe motion blur)
#   tools/render.sh 169 final renders/audio/mix.wav   -> also muxes the soundtrack
#   VARIANT=vraag tools/render.sh 169 final          -> index-vraag.html / portrait-vraag.html
#                                                       -> renders/film-169-vraag-final.mp4
#
# Length: the video runs T.OUT_DURATION = T.DURATION x T.SCALE output seconds (src/timeline.js;
# 52.8 s at SCALE 1.1). Both paths take it from the page itself (HyperFrames reads the root's
# data-duration, which Film.boot sets; capture_seq.mjs reads window.T.OUT_DURATION).
# VARIANT=<name> renders index-<name>.html (16:9) or portrait-<name>.html (4:5) and puts the name
# in every output and sequence path; without it the original pages and names are used.
#
# Motion blur (final): FINAL_FPS x SUB capture frames per second (default 60 x 8 = 480 fps,
# captured directly by tools/capture_seq.mjs) are averaged SUB at a time (tmix, 360-degree
# shutter). FINAL_FPS=30 SUB=8 captures 240 fps (half the render time, 30 fps delivery).
# Disk: about 170 KB per captured frame (16:9), so ~4.5 GB per format at 480 fps; the sequences
# are deleted after the encode unless KEEP_SEQ=1.
set -euo pipefail
cd "$(dirname "$0")/.."
export HYPERFRAMES_NO_TELEMETRY=1
FMT="${1:-169}"; MODE="${2:-draft}"; AUDIO="${3:-}"
VARIANT="${VARIANT:-}"
BASE=index; [ "$FMT" = "45" ] && BASE=portrait
TAG="$FMT"; PAGE="${BASE}.html"
if [ -n "$VARIANT" ]; then TAG="${FMT}-${VARIANT}"; PAGE="${BASE}-${VARIANT}.html"; fi
[ -f "$PAGE" ] || { echo "render.sh: page $PAGE not found" >&2; exit 1; }
mkdir -p renders
OUT="renders/film-${TAG}-${MODE}.mp4"
MAXCAP="${MAXCAP:-240}"   # HyperFrames caps --fps at 240; override only to test the multi-pass path cheaply

if [ "$MODE" = "draft" ]; then
  SEQ="renders/seq-${TAG}-draft"
  rm -rf "$SEQ"
  npx hyperframes render . -c "$PAGE" -o "$SEQ" --format png-sequence --fps 60 -w 2 --quiet
  python tools/encode_seq.py "$SEQ" "$OUT" --in-fps 60 --sub 1 --preset medium
  [ "${KEEP_SEQ:-0}" = "1" ] || rm -rf "$SEQ"
else
  # Final: capture FINAL_FPS x SUB frames per second with tools/capture_seq.mjs (direct
  # window.__seek capture, one Chrome per worker; HyperFrames' disk pre-check refuses a 480 fps
  # png-sequence on this machine), then 8-subframe blur + colour-managed encode.
  FINAL_FPS="${FINAL_FPS:-60}"; SUB="${SUB:-8}"; WORKERS="${WORKERS:-4}"
  CAP=$((FINAL_FPS * SUB))
  SEQ="renders/seq-${TAG}-${CAP}"
  [ "${RESUME:-0}" = "1" ] || rm -rf "$SEQ"
  RES=""; [ "${RESUME:-0}" = "1" ] && RES="--resume"
  node tools/capture_seq.mjs --page "$PAGE" --fps "$CAP" --workers "$WORKERS" --out "$SEQ" $RES
  python tools/encode_seq.py "$SEQ" "$OUT" --in-fps "$CAP" --sub "$SUB"
  [ "${KEEP_SEQ:-0}" = "1" ] || rm -rf "$SEQ"
fi
if [ -n "$AUDIO" ]; then
  MUX="${OUT%.mp4}-audio.mp4"
  ffmpeg -v error -y -i "$OUT" -i "$AUDIO" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$MUX"
  echo "$MUX"
fi
echo "$OUT"
