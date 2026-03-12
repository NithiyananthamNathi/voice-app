#!/bin/bash
NEXT_BIN="$(find /home/nathi/voice-app/node_modules -path "*/next/dist/bin/next" | head -1)"
PATH="/home/nathi/bin:$PATH" /snap/node/current/bin/node "$NEXT_BIN" dev
