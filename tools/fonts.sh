#!/usr/bin/env bash
# Writes public/_site/fonts/*.woff2: Latin subsets of the IBM Plex files the app bundles,
# read from a release tag so the page uses the same fonts as the build. Needs uv.
#   tools/fonts.sh v26.1029.2229-nightly
set -euo pipefail
tag=${1:?usage: tools/fonts.sh <app release tag>}
repo=${PUTGD_REPO:-/home/patrick/work/put.gd}
out=$(cd "$(dirname "$0")/.." && pwd)/public/_site/fonts
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
mkdir -p "$out"
# Basic Latin, Latin-1, general punctuation, arrows and the multiplication sign.
unicodes="U+0020-007E,U+00A0-00FF,U+2010-2027,U+2030-203A,U+2190-2193,U+2212,U+00D7"
for f in IBMPlexSans-Regular IBMPlexSans-SemiBold IBMPlexMono-Regular; do
  git -C "$repo" show "$tag:src/ui/fonts/$f.ttf" > "$tmp/$f.ttf"
  uv run -q --with fonttools --with brotli pyftsubset "$tmp/$f.ttf" \
    --unicodes="$unicodes" --layout-features='kern,liga,calt,tnum,case' \
    --flavor=woff2 --no-hinting --desubroutinize --output-file="$out/$f.woff2"
done
git -C "$repo" show "$tag:src/ui/fonts/OFL-sans.txt" > "$out/OFL.txt"
ls -l "$out"
