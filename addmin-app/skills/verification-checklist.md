# Android verification checklist

Read `addmin-app/docs/11-LIVE_PLAN.md` and the latest STATUS.md before verification. Paths here are repository-relative. Apply checks relevant to the changed behavior; a documentation-only edit does not require an APK build.

## Code and integration

- Run mobile typecheck/lint after mobile code changes; relevant server checks when routes change.
- Distinguish typecheck, Metro start, native build and device testing in the report. None substitutes for the others.
- Run a native build when native dependencies/configuration change, and a standalone release build before release acceptance.
- Test combined changes after integrating parallel branches. Coordinator alone updates shared plan/status.

## Repeatable Android interaction

- Prefer stable testID/resource/accessibility selectors using available Android automation. Accessibility labels describe the control, not an opaque test identifier.
- If only coordinate control is available, inspect the current hierarchy/screenshot and resolve bounds again after scrolling, keyboard or picker transitions. Do not replay stale coordinates.
- Record device/emulator, Android version, app commit/version, debug or release, API environment and steps. Exclude PINs/tokens and private message contents from artifacts.
- Capture relevant before/after screenshots from the actual app. Inspect narrow screens, larger system text, keyboard open/closed and navigation insets for changed forms.

## Screen states

- Loading, empty, error with retry, successful result and feedback.
- Buttons expose roles/states; status is understandable without color alone.
- Android Back and app navigation handle unsaved input; keyboard does not hide required controls.
- Gallery/camera selection, permission denial, cancellation, large image, uploading and upload failure.
- Use real progress only when measured; do not claim offline support from an in-memory form surviving a retry.

## End-to-end flow for affected mutations

Login → list → new/edit work → select image → save draft → reload and verify fields → preview → publish → verify public page → reopen and edit. Also cover editing a published work without premature public changes. Verify alt-only edits, cleared references and invalid publication when those paths change.

Test failure behavior relevant to the change: disconnect, timeout, session expiry, retry and duplicate taps. Confirm protected routes reject missing/invalid sessions. Test records must be distinguishable and cleanup limited to records/assets created for this test; avoid mutating real artwork to obtain screenshots.

## Release gate

Use a physical Android device for final acceptance. Install a standalone APK, stop development services, test Wi-Fi and mobile internet, restart app and verify upgrade from the supported prior version. Check signing transition explicitly; do not uninstall an existing app merely to make an upgrade test pass. If device or production access is unavailable, record the exact unverified gate and continue independent checks.

## Evidence and handoff

For each affected plan ID record: PASS / FAIL / NOT RUN, command or reproducible steps, environment, artifact location, actual result and remaining issue. A curl pass does not prove a UI button works; a screenshot does not prove persistence. Do not mark REALIZOVANO while its required acceptance test is NOT RUN.

Workers return evidence to the coordinator. Coordinator updates `addmin-app/docs/11-LIVE_PLAN.md` and appends a dated entry in `addmin-app/STATUS.md` with changed behavior, verified checks, next step and real blockers. Multiple bounded verified steps per session are allowed; do not bypass dependencies.
