#!/usr/bin/env bash
# Stops the frontend and backend dev servers (if running) and restarts them.
# PIDs and logs are kept in .run/ at the repo root.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUN_DIR="$ROOT_DIR/.run"
mkdir -p "$RUN_DIR"

# System node is v18; the project needs Node 22 from nvm
export PATH="$HOME/.nvm/versions/node/v22.22.3/bin:$PATH"

stop_app() {
  local name="$1"
  local pid_file="$RUN_DIR/$name.pid"

  if [[ -f "$pid_file" ]]; then
    local pid
    pid="$(cat "$pid_file")"
    if kill -0 "$pid" 2>/dev/null; then
      echo "Stopping $name (pid $pid)..."
      # Kill the whole process group so child processes (e.g. vite) die too
      kill -- -"$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true
      # Wait up to 5s for graceful shutdown, then force kill
      for _ in $(seq 1 10); do
        kill -0 "$pid" 2>/dev/null || break
        sleep 0.5
      done
      kill -0 "$pid" 2>/dev/null && kill -9 -- -"$pid" 2>/dev/null || true
    else
      echo "$name not running (stale pid file)."
    fi
    rm -f "$pid_file"
  else
    echo "$name not running."
  fi
}

start_frontend() {
  echo "Starting frontend..."
  cd "$ROOT_DIR/frontend"
  setsid npm run dev >"$RUN_DIR/frontend.log" 2>&1 &
  echo $! >"$RUN_DIR/frontend.pid"
  echo "Frontend started (pid $(cat "$RUN_DIR/frontend.pid")). Logs: .run/frontend.log"
}

start_backend() {
  # TODO: backend does not exist yet — replace this with the real start
  # command once it does, e.g.:
  #   cd "$ROOT_DIR/backend"
  #   setsid npm run dev >"$RUN_DIR/backend.log" 2>&1 &
  #   echo $! >"$RUN_DIR/backend.pid"
  echo "Backend: placeholder — nothing to start yet."
}

stop_app frontend
stop_app backend
start_frontend
start_backend

echo "Done."
