/**
 * Google Drive sync using the App Data folder (private, hidden from user).
 * Requires a Google Cloud Console project with:
 *   - OAuth 2.0 Client ID for iOS (bundle ID must match)
 *   - Scopes: https://www.googleapis.com/auth/drive.appdata
 *
 * Set GOOGLE_CLIENT_ID in your app config or environment before use.
 */

import * as SecureStore from 'expo-secure-store';

const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const SYNC_FILENAME = 'book-app-sync.json';
const TOKEN_KEY = 'google_drive_access_token';
const TOKEN_EXPIRY_KEY = 'google_drive_token_expiry';

export const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/drive.appdata'];

export const GoogleDriveService = {
  async saveToken(accessToken: string, expiresIn: number): Promise<void> {
    const expiry = Date.now() + expiresIn * 1000;
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, String(expiry));
  },

  async getToken(): Promise<string | null> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const expiryStr = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);
    if (!token || !expiryStr) return null;
    if (Date.now() > parseInt(expiryStr, 10)) return null; // expired
    return token;
  },

  async clearToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(TOKEN_EXPIRY_KEY);
  },

  async isConnected(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  },

  /** Find the sync file in App Data folder. Returns file id or null. */
  async findSyncFile(accessToken: string): Promise<string | null> {
    const url =
      `${DRIVE_FILES_URL}?spaces=appDataFolder` +
      `&q=name='${SYNC_FILENAME}'` +
      `&fields=files(id,name,modifiedTime)` +
      `&pageSize=1`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error(`Drive list error: ${res.status}`);
    const data = (await res.json()) as { files: Array<{ id: string }> };
    return data.files[0]?.id ?? null;
  },

  /** Upload (create or update) the sync JSON in App Data folder. */
  async backup(accessToken: string, json: string): Promise<void> {
    const existingId = await this.findSyncFile(accessToken);

    const metadata = JSON.stringify({
      name: SYNC_FILENAME,
      parents: existingId ? undefined : ['appDataFolder'],
    });

    const body = new FormData();
    body.append('metadata', new Blob([metadata], { type: 'application/json' }));
    body.append('file', new Blob([json], { type: 'application/json' }));

    const url = existingId
      ? `${DRIVE_UPLOAD_URL}/${existingId}?uploadType=multipart`
      : `${DRIVE_UPLOAD_URL}?uploadType=multipart`;

    const method = existingId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${accessToken}` },
      body,
    });

    if (!res.ok) throw new Error(`Drive upload error: ${res.status}`);
  },

  /** Download the sync JSON from App Data folder. */
  async restore(accessToken: string): Promise<string | null> {
    const fileId = await this.findSyncFile(accessToken);
    if (!fileId) return null;

    const res = await fetch(`${DRIVE_FILES_URL}/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error(`Drive download error: ${res.status}`);
    return res.text();
  },

  /** Returns the modifiedTime of the sync file, or null if not found. */
  async peekDate(accessToken: string): Promise<number | null> {
    const url =
      `${DRIVE_FILES_URL}?spaces=appDataFolder` +
      `&q=name='${SYNC_FILENAME}'` +
      `&fields=files(modifiedTime)` +
      `&pageSize=1`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) return null;
    const data = (await res.json()) as { files: Array<{ modifiedTime: string }> };
    const modifiedTime = data.files[0]?.modifiedTime;
    return modifiedTime ? new Date(modifiedTime).getTime() : null;
  },
};
