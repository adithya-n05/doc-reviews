#!/usr/bin/env bash
set -euo pipefail

RUN_NAME="${1:-}"
if [[ -z "$RUN_NAME" ]]; then
  echo "usage: $0 <run-name>" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TARGET_DIR="$ROOT_DIR/logs/local-artifacts/$RUN_NAME"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$TARGET_DIR"

move_if_exists() {
  local source_path="$1"
  local target_name="$2"

  if [[ -d "$source_path" ]]; then
    mv "$source_path" "$TARGET_DIR/${target_name}-${TIMESTAMP}"
    echo "moved:$source_path -> $TARGET_DIR/${target_name}-${TIMESTAMP}"
  else
    echo "skip:$source_path (not found)"
  fi
}

move_if_exists "$ROOT_DIR/.playwright-cli" "playwright-cli"
move_if_exists "$ROOT_DIR/output/playwright" "playwright-output"

if [[ -d "$ROOT_DIR/output" ]] && [[ -z "$(ls -A "$ROOT_DIR/output")" ]]; then
  rmdir "$ROOT_DIR/output"
fi

echo "done"
