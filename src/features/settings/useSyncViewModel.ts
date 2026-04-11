import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useAppStore } from '@core/store';
import { SyncService, SyncPayload } from '@data/services/SyncService';
import { ICloudService } from '@data/services/ICloudService';
import { GoogleDriveService, GOOGLE_SCOPES } from '@data/services/GoogleDriveService';

WebBrowser.maybeCompleteAuthSession();

// Replace with your Google Cloud OAuth 2.0 iOS client ID
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export type SyncProvider = 'icloud' | 'google';

interface SyncState {
  isSyncing: boolean;
  error: string | null;
  icloudLastSync: number | null;
  googleLastSync: number | null;
  googleConnected: boolean;
}

export function useSyncViewModel() {
  const { settings, setBooks, updateSettings } = useAppStore();

  const [state, setState] = useState<SyncState>({
    isSyncing: false,
    error: null,
    icloudLastSync: null,
    googleLastSync: null,
    googleConnected: false,
  });

  // Google OAuth discovery
  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');

  const [googleRequest, googleResponse, promptGoogleAuth] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: GOOGLE_SCOPES,
      responseType: AuthSession.ResponseType.Token,
      redirectUri: AuthSession.makeRedirectUri({ scheme: 'book-app' }),
    },
    discovery,
  );

  // Handle Google OAuth response
  useEffect(() => {
    if (googleResponse?.type !== 'success') return;
    const { access_token, expires_in } = googleResponse.params as {
      access_token: string;
      expires_in: string;
    };
    GoogleDriveService.saveToken(access_token, parseInt(expires_in, 10))
      .then(() => setState((s) => ({ ...s, googleConnected: true, error: null })))
      .catch((e) => setState((s) => ({ ...s, error: String(e) })));
  }, [googleResponse]);

  // Load initial state
  useEffect(() => {
    ICloudService.peekDate().then((date) =>
      setState((s) => ({ ...s, icloudLastSync: date })),
    );
    GoogleDriveService.isConnected().then(async (connected) => {
      if (!connected) return;
      const token = await GoogleDriveService.getToken();
      const date = token ? await GoogleDriveService.peekDate(token) : null;
      setState((s) => ({ ...s, googleConnected: true, googleLastSync: date }));
    });
  }, []);

  const setError = (e: unknown) =>
    setState((s) => ({ ...s, error: e instanceof Error ? e.message : String(e), isSyncing: false }));

  // iCloud backup
  const icloudBackup = useCallback(async () => {
    setState((s) => ({ ...s, isSyncing: true, error: null }));
    try {
      const json = await SyncService.export(settings);
      await ICloudService.backup(json);
      const date = Date.now();
      setState((s) => ({ ...s, isSyncing: false, icloudLastSync: date }));
    } catch (e) {
      setError(e);
    }
  }, [settings]);

  // iCloud restore
  const icloudRestore = useCallback(async () => {
    setState((s) => ({ ...s, isSyncing: true, error: null }));
    try {
      const json = await ICloudService.restore();
      if (!json) {
        Alert.alert('iCloud', 'No se encontró ningún backup en iCloud.');
        setState((s) => ({ ...s, isSyncing: false }));
        return;
      }
      const payload = SyncService.parse(json);
      const result = await SyncService.apply(payload);
      // Refresh books in store
      const { bookRepository } = await import('@data/repositories/bookRepository');
      const books = await bookRepository.getAll();
      setBooks(books);
      if (payload.settings) updateSettings(payload.settings);
      setState((s) => ({ ...s, isSyncing: false, icloudLastSync: payload.exportedAt }));
      Alert.alert(
        'Restaurado',
        `${result.books} libros · ${result.annotations} anotaciones · ${result.bookmarks} marcadores importados.`,
      );
    } catch (e) {
      setError(e);
    }
  }, [setBooks, updateSettings]);

  // Google Drive connect
  const googleConnect = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      Alert.alert('Configuración', 'EXPO_PUBLIC_GOOGLE_CLIENT_ID no está configurado.');
      return;
    }
    promptGoogleAuth();
  }, [promptGoogleAuth]);

  // Google Drive disconnect
  const googleDisconnect = useCallback(async () => {
    await GoogleDriveService.clearToken();
    setState((s) => ({ ...s, googleConnected: false, googleLastSync: null }));
  }, []);

  // Google Drive backup
  const googleBackup = useCallback(async () => {
    setState((s) => ({ ...s, isSyncing: true, error: null }));
    try {
      const token = await GoogleDriveService.getToken();
      if (!token) throw new Error('Sesión expirada. Vuelve a conectar Google Drive.');
      const json = await SyncService.export(settings);
      await GoogleDriveService.backup(token, json);
      const date = Date.now();
      setState((s) => ({ ...s, isSyncing: false, googleLastSync: date }));
    } catch (e) {
      setError(e);
    }
  }, [settings]);

  // Google Drive restore
  const googleRestore = useCallback(async () => {
    setState((s) => ({ ...s, isSyncing: true, error: null }));
    try {
      const token = await GoogleDriveService.getToken();
      if (!token) throw new Error('Sesión expirada. Vuelve a conectar Google Drive.');
      const json = await GoogleDriveService.restore(token);
      if (!json) {
        Alert.alert('Google Drive', 'No se encontró ningún backup en Google Drive.');
        setState((s) => ({ ...s, isSyncing: false }));
        return;
      }
      const payload = SyncService.parse(json);
      const result = await SyncService.apply(payload);
      const { bookRepository } = await import('@data/repositories/bookRepository');
      const books = await bookRepository.getAll();
      setBooks(books);
      if (payload.settings) updateSettings(payload.settings);
      setState((s) => ({ ...s, isSyncing: false, googleLastSync: payload.exportedAt }));
      Alert.alert(
        'Restaurado',
        `${result.books} libros · ${result.annotations} anotaciones · ${result.bookmarks} marcadores importados.`,
      );
    } catch (e) {
      setError(e);
    }
  }, [setBooks, updateSettings]);

  return {
    ...state,
    googleRequestReady: !!googleRequest,
    icloudBackup,
    icloudRestore,
    googleConnect,
    googleDisconnect,
    googleBackup,
    googleRestore,
    clearError: () => setState((s) => ({ ...s, error: null })),
  };
}
