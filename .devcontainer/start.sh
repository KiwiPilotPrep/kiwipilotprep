#!/usr/bin/env bash
#
# Runs on EVERY codespace start (creation, and each resume after it sleeps).
# Starts the built app in the background — this hook must not block, or the
# codespace never finishes reporting itself as ready.
set -uo pipefail

PORT=3100
LOG=/tmp/kiwipilotprep.log

if (exec 3<>/dev/tcp/localhost/"${PORT}") 2>/dev/null; then
  exec 3<&- 2>/dev/null || true
  echo "▶ Already listening on ${PORT} — leaving it alone."
else
  echo "▶ Starting the app on ${PORT} (log: ${LOG})"
  nohup npx next start -p "${PORT}" >"${LOG}" 2>&1 &
fi

# A forwarded port is private by default: only the codespace owner, signed in,
# can open it. Anyone else gets a sign-in wall rather than the site. This flips
# it to public so the link can be shared. It needs a token carrying the
# `codespace` scope, which is not guaranteed, so a failure here is not fatal —
# the Ports panel does the same thing in two clicks.
if [ -n "${CODESPACE_NAME:-}" ]; then
  if gh codespace ports visibility "${PORT}:public" -c "${CODESPACE_NAME}" >/dev/null 2>&1; then
    echo "▶ Port ${PORT} is now PUBLIC."
  else
    echo "▶ Could not set port visibility automatically."
    echo "  Open the PORTS panel, right-click ${PORT} → Port Visibility → Public."
  fi

  echo
  echo "  ➜  https://${CODESPACE_NAME}-${PORT}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
  echo
fi
