---
name: web-preview
description: Run, drive, and screenshot the VitalOptima Expo app on the WEB target via headless Chrome + the Chrome DevTools Protocol — no Android device or emulator required. Use when asked to run/launch/preview/screenshot the app, visually verify a UI change, or capture a specific screen while developing. Verifies the JS/UI layer only; native behavior (persistence, notifications) still needs the Android dev client.
---

# VitalOptima web preview harness

Renders the real app in headless Chrome by driving the Metro **web** build over CDP.
Two facts shape how you must drive it:

1. **Onboarding gate** — every tab route redirects to `/onboarding` until onboarding
   is completed in the current page session.
2. **Web DB is non-persistent** — the expo-sqlite resilience shim makes writes
   best-effort on web, so onboarding/state does **not** survive a page reload.

⇒ You cannot deep-link to a screen. You must, in one page session: complete
onboarding, then reach screens by clicking the in-app **bottom tab bar**.

## Prerequisites
- **Metro running** (serves web on http://localhost:8081):
  `npx expo start --dev-client`
  Verify: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8081/` → `200`.
  Port 8081 busy by a stale Metro? Find/kill it: `Get-NetTCPConnection -LocalPort 8081 -State Listen`.
- **Google Chrome** at `C:\Program Files\Google\Chrome\Application\chrome.exe`
  (locate via `node_modules/.bin/print-chrome-path`).
- **Node 20+** (global `WebSocket`/`fetch`). Repo runs Node 26.

## Run it (3 steps)

```powershell
# 1. Launch headless Chrome with a CDP debug port (kills any prior one on :9222)
powershell -File scripts/vo-chrome.ps1            # prints "Chrome/NNN..." when CDP is up

# 2. Drive onboarding, then screenshot every tab into a folder
node scripts/vo-tabs.mjs "$env:TEMP"
#   -> tab_dashboard.png tab_meds.png tab_glucose.png tab_nutrition.png tab_companion.png tab_settings.png
```

Then `Read` the PNGs to view them.

## Scripts
- `scripts/vo-chrome.ps1` — launch/relaunch headless Chrome on CDP port 9222.
- `scripts/vo-tabs.mjs <outDir>` — **primary.** One session: welcome → type name →
  skip PIN → `/(tabs)`, then clicks each bottom tab and screenshots it.
- `scripts/vo-eval.mjs` — dump the current open page's interactive-element inventory
  (button/anchor counts, nested-`<button>` checks) without navigating. Handy for DOM audits.

⚠ You can't deep-link to a tab route — a fresh load redirects to `/onboarding` (web DB is
non-persistent). Always reach tab screens via `vo-tabs.mjs` (onboarding + in-app tab clicks).

## Gotchas (learned the hard way)
- **First web request is slow** — Metro compiles the ~7 MB web bundle on demand. Warm it
  once if a screenshot looks blank: `curl -s -o NUL "http://localhost:8081/node_modules/expo-router/entry.bundle?platform=web&dev=true&hot=false&lazy=true&transform.routerRoot=app"`.
- **Use classic `--headless`**, not `--headless=new`, plus an isolated `--user-data-dir`,
  or `--screenshot` silently writes nothing / attaches to your real Chrome profile.
- **Driving react-native-web:** click Pressables by dispatching `mousedown`+`mouseup`+`click`
  at the element center; set a `TextInput` via the native `HTMLInputElement` value setter +
  an `input` event (React controlled inputs ignore plain `.value =`).
- **Tab labels:** Dashboard, Meds, Glucose, Nutrition, Vita, Settings. "Glucose" also appears
  as a dashboard quick-action — for the tab, pick the **bottom-most** matching element.
- **Name field can be flaky** if set before the input mounts (you'll see "Hey, you" instead
  of the typed name) — harmless for layout shots; wait for `document.querySelector('input')`
  first if it matters.

## Scope
Confirms screens render + navigation works on web. It does **not** verify native-only
behavior: DB persistence, expo-notifications, secure PIN storage, or the EAS dev client.
