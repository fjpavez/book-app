import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@core/navigation/types';
import { useSyncViewModel } from './useSyncViewModel';

const ACCENT = '#2563eb';
const MUTED = '#888';
const BORDER = '#e0e0e0';
const BACKGROUND = '#f5f5f5';
const CARD = '#ffffff';
const TEXT = '#1a1a1a';

function formatDate(ts: number | null): string {
  if (!ts) return 'Nunca';
  return new Date(ts).toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const sync = useSyncViewModel();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const confirmRestore = (provider: 'iCloud' | 'Google Drive', onConfirm: () => void) => {
    Alert.alert(
      `Restaurar desde ${provider}`,
      'Los datos importados se fusionarán con los locales. Los libros actuales no se eliminarán.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Restaurar', onPress: onConfirm },
      ],
    );
  };

  const confirmDisconnect = (onConfirm: () => void) => {
    Alert.alert(
      'Desconectar Google Drive',
      '¿Deseas desconectar tu cuenta de Google? Los backups en Drive no se eliminarán.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Desconectar', style: 'destructive', onPress: onConfirm },
      ],
    );
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: BACKGROUND }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <Text style={[styles.screenTitle, { paddingTop: insets.top + 16 }]}>Ajustes</Text>

      {/* ── iCloud Drive ── */}
      <Text style={styles.sectionHeader}>iCLOUD DRIVE</Text>
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Último backup</Text>
            <Text style={styles.cardSub}>{formatDate(sync.icloudLastSync)}</Text>
          </View>
        </View>

        <View style={[styles.separator, { backgroundColor: BORDER }]} />

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: ACCENT }]}
            onPress={sync.icloudBackup}
            disabled={sync.isSyncing}
          >
            {sync.isSyncing ? (
              <ActivityIndicator color={ACCENT} size="small" />
            ) : (
              <Text style={[styles.actionBtnText, { color: ACCENT }]}>Guardar backup</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: BORDER }]}
            onPress={() => confirmRestore('iCloud', sync.icloudRestore)}
            disabled={sync.isSyncing || !sync.icloudLastSync}
          >
            <Text
              style={[
                styles.actionBtnText,
                { color: sync.icloudLastSync ? TEXT : MUTED },
              ]}
            >
              Restaurar
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          Requiere activar "iCloud Documents" en Xcode (Signing & Capabilities → iCloud).
          El archivo se sincroniza automáticamente entre dispositivos Apple.
        </Text>
      </View>

      {/* ── Google Drive ── */}
      <Text style={styles.sectionHeader}>GOOGLE DRIVE</Text>
      <View style={styles.card}>
        {sync.googleConnected ? (
          <>
            <View style={styles.cardRow}>
              <View style={styles.connectedBadge}>
                <Text style={styles.connectedText}>● Conectado</Text>
              </View>
              <TouchableOpacity
                onPress={() => confirmDisconnect(sync.googleDisconnect)}
                hitSlop={8}
              >
                <Text style={[styles.linkText, { color: MUTED }]}>Desconectar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cardRow}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Último backup</Text>
                <Text style={styles.cardSub}>{formatDate(sync.googleLastSync)}</Text>
              </View>
            </View>

            <View style={[styles.separator, { backgroundColor: BORDER }]} />

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: ACCENT }]}
                onPress={sync.googleBackup}
                disabled={sync.isSyncing}
              >
                {sync.isSyncing ? (
                  <ActivityIndicator color={ACCENT} size="small" />
                ) : (
                  <Text style={[styles.actionBtnText, { color: ACCENT }]}>Guardar backup</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: BORDER }]}
                onPress={() => confirmRestore('Google Drive', sync.googleRestore)}
                disabled={sync.isSyncing || !sync.googleLastSync}
              >
                <Text
                  style={[
                    styles.actionBtnText,
                    { color: sync.googleLastSync ? TEXT : MUTED },
                  ]}
                >
                  Restaurar
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity
            style={styles.connectBtn}
            onPress={sync.googleConnect}
            disabled={sync.isSyncing}
          >
            <Text style={styles.connectBtnText}>Conectar con Google</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.hint}>
          Los backups se guardan en la carpeta privada de la app en Google Drive
          (no visibles en "Mi unidad"). Requiere configurar EXPO_PUBLIC_GOOGLE_CLIENT_ID.
        </Text>
      </View>

      {/* Error banner */}
      {sync.error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{sync.error}</Text>
          <TouchableOpacity onPress={sync.clearError} hitSlop={8}>
            <Text style={styles.errorDismiss}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* ── Importar ── */}
      <Text style={styles.sectionHeader}>IMPORTAR</Text>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.navRow}
          onPress={() => navigation.navigate('Calibre')}
        >
          <View style={styles.navRowContent}>
            <Text style={styles.navRowIcon}>📚</Text>
            <View style={styles.navRowText}>
              <Text style={styles.cardTitle}>Calibre</Text>
              <Text style={styles.cardSub}>Importa libros desde tu biblioteca de Calibre</Text>
            </View>
          </View>
          <Text style={styles.navChevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ── Acerca de ── */}
      <Text style={styles.sectionHeader}>ACERCA DE</Text>
      <View style={styles.card}>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Versión</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: BORDER }]} />
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Código fuente</Text>
          <Text style={[styles.aboutValue, { color: ACCENT }]}>GitHub</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: BORDER }]} />
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Formatos soportados</Text>
          <Text style={styles.aboutValue}>ePub · PDF · Markdown</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: MUTED,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: CARD,
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '500', color: TEXT },
  cardSub: { fontSize: 13, color: MUTED, marginTop: 2 },
  separator: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  actionBtnText: { fontSize: 14, fontWeight: '600' },
  hint: {
    fontSize: 12,
    color: MUTED,
    paddingHorizontal: 16,
    paddingBottom: 12,
    lineHeight: 17,
  },
  connectedBadge: {
    flex: 1,
  },
  connectedText: { fontSize: 14, color: '#16a34a', fontWeight: '600' },
  linkText: { fontSize: 14 },
  connectBtn: {
    margin: 16,
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  connectBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  errorText: { flex: 1, fontSize: 13, color: '#dc2626' },
  errorDismiss: { fontSize: 14, color: '#dc2626' },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aboutLabel: { fontSize: 15, color: TEXT },
  aboutValue: { fontSize: 15, color: MUTED },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  navRowContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  navRowIcon: { fontSize: 22 },
  navRowText: { flex: 1 },
  navChevron: { fontSize: 22, color: MUTED, fontWeight: '300' },
});
