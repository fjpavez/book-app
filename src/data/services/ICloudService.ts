import { File, Paths } from 'expo-file-system';

/**
 * iCloud Drive sync via the app's Documents directory.
 *
 * iOS automatically syncs the Documents directory to iCloud Drive when the
 * "iCloud Documents" capability is enabled in the Xcode project
 * (Signing & Capabilities → iCloud → iCloud Documents).
 * No additional packages or authentication are required.
 *
 * The sync file is also accessible in the iOS Files app under the app name.
 */

const SYNC_FILENAME = 'book-app-sync.json';

export const ICloudService = {
  async backup(json: string): Promise<void> {
    const file = new File(Paths.document, SYNC_FILENAME);
    file.write(json);
  },

  async restore(): Promise<string | null> {
    const file = new File(Paths.document, SYNC_FILENAME);
    if (!file.exists) return null;
    return file.text();
  },

  exists(): boolean {
    const file = new File(Paths.document, SYNC_FILENAME);
    return file.exists;
  },

  /**
   * Returns exportedAt timestamp from the sync file without applying it,
   * so the UI can show "Last backup: ..." before the user taps Restore.
   */
  async peekDate(): Promise<number | null> {
    try {
      const json = await this.restore();
      if (!json) return null;
      const parsed = JSON.parse(json) as { exportedAt?: number };
      return parsed.exportedAt ?? null;
    } catch {
      return null;
    }
  },
};
