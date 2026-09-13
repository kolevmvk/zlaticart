#!/usr/bin/env bash
# Skriveni unos PIN-a za import-seed.cjs; PIN ide samo u okruženje Node procesa.
set -euo pipefail
read -rsp "PIN (6 cifara): " PIN; echo
ZLATICART_PIN="$PIN" node "$(dirname "$0")/import-seed.cjs" "${1:-https://www.zlaticart.com}"
