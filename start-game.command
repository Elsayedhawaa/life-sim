#!/bin/zsh
# Start World Life through HTTP (required for JavaScript ES modules).
cd "$(dirname "$0")"
PORT=8765
URL="http://127.0.0.1:${PORT}/"

# Reuse an already-running copy if the port is occupied by this game.
if ! /usr/bin/curl -fsS "$URL" >/dev/null 2>&1; then
  /usr/bin/python3 serve.py "$PORT" >/tmp/world-life-server.log 2>&1 &
  SERVER_PID=$!

  # Wait for the local server to become ready before opening Chrome/Safari.
  READY=0
  for i in {1..40}; do
    if /usr/bin/curl -fsS "$URL" >/dev/null 2>&1; then
      READY=1
      break
    fi
    /bin/sleep 0.25
  done

  if [[ "$READY" -ne 1 ]]; then
    echo "World Life could not start. Details:"
    /bin/cat /tmp/world-life-server.log
    echo
    echo "Press Enter to close this window."
    read
    kill "$SERVER_PID" 2>/dev/null
    exit 1
  fi
fi

/usr/bin/open "$URL"
echo "World Life is running at $URL"
echo "Keep this Terminal window open while playing. Press Control+C to stop the server."
if [[ -n "${SERVER_PID:-}" ]]; then
  wait "$SERVER_PID"
fi
