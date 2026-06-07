import { useEffect } from 'react';
import { check } from '@tauri-apps/plugin-updater';

/**
 * Checks for app updates on mount (once per launch).
 *
 * If an update is available, it downloads and installs it in the background,
 * then prompts the user to restart. Pre-release users will see pre-release
 * updates; stable users only see stable releases.
 *
 * This hook is intentionally minimal -- no settings UI, no manual trigger.
 * It runs silently and only surfaces when an update is ready.
 */
export function useUpdater() {
  useEffect(() => {
    let cancelled = false;

    async function checkForUpdate() {
      try {
        const update = await check();

        if (cancelled || !update) return;

        console.log(
          `Update available: ${update.version} (current body: ${update.body})`
        );

        // Download and install. Tauri will prompt for restart.
        await update.downloadAndInstall();
      } catch (err) {
        // Silently ignore update check failures (offline, no releases yet, etc.)
        console.debug('Update check skipped:', err);
      }
    }

    checkForUpdate();

    return () => {
      cancelled = true;
    };
  }, []);
}
