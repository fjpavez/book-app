import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '@core/navigation/types';
import { useCalibreViewModel } from './useCalibreViewModel';
import { CalibreBook } from '@data/services/CalibreService';

type Props = StackScreenProps<RootStackParamList, 'Calibre'>;

export function CalibreScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const vm = useCalibreViewModel();

  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Load books automatically once connected
  useEffect(() => {
    if (vm.status === 'connected' && vm.books.length === 0) {
      vm.loadBooks();
    }
  }, [vm.status]);

  const handleConnect = () => {
    if (!url.trim()) return;
    vm.connect(url.trim(), username.trim(), password);
  };

  const renderBook = ({ item }: { item: CalibreBook }) => {
    const alreadyImported = vm.importedIds.has(item.id);
    const isImporting = vm.importingId === item.id;
    const hasFormat = item.formats.length > 0;

    return (
      <View style={styles.bookRow}>
        <Image
          source={{ uri: item.coverUrl }}
          style={styles.cover}
          resizeMode="cover"
        />
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>
            {item.authors.join(', ') || 'Autor desconocido'}
          </Text>
          <Text style={styles.bookFormats}>
            {item.formats.join(' · ') || 'Sin formato compatible'}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.importBtn,
            alreadyImported && styles.importBtnDone,
            (!hasFormat || alreadyImported) && styles.importBtnDisabled,
          ]}
          onPress={() => vm.importBook(item)}
          disabled={!hasFormat || alreadyImported || isImporting}
        >
          {isImporting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.importBtnText}>
              {alreadyImported ? '✓' : '↓'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calibre</Text>
        {vm.status === 'connected' && (
          <TouchableOpacity onPress={vm.disconnect} hitSlop={10}>
            <Text style={styles.disconnectText}>Desconectar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error banner */}
      {vm.error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText} numberOfLines={2}>{vm.error}</Text>
          <TouchableOpacity onPress={vm.clearError} hitSlop={8}>
            <Text style={styles.errorDismiss}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Connection form */}
      {vm.status !== 'connected' ? (
        <KeyboardAvoidingView
          style={styles.formWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.form}>
            <Text style={styles.formTitle}>Conectar al servidor Calibre</Text>
            <Text style={styles.formHint}>
              Activa el servidor de contenido en Calibre: Preferencias → Compartir por red.
            </Text>

            <Text style={styles.label}>URL del servidor</Text>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              placeholder="http://192.168.1.100:8080"
              placeholderTextColor="#aaa"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <Text style={styles.label}>Usuario (opcional)</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="usuario"
              placeholderTextColor="#aaa"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Contraseña (opcional)</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="contraseña"
              placeholderTextColor="#aaa"
              secureTextEntry
            />

            <TouchableOpacity
              style={[
                styles.connectBtn,
                vm.status === 'connecting' && styles.connectBtnLoading,
              ]}
              onPress={handleConnect}
              disabled={vm.status === 'connecting' || !url.trim()}
            >
              {vm.status === 'connecting' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.connectBtnText}>Conectar</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        /* Book list */
        <FlatList
          data={vm.books}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderBook}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          onEndReached={vm.loadMore}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                {vm.total} libro{vm.total !== 1 ? 's' : ''} en la biblioteca
              </Text>
            </View>
          }
          ListEmptyComponent={
            vm.loadingMore ? (
              <ActivityIndicator style={{ marginTop: 40 }} color="#2563eb" />
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No se encontraron libros compatibles.</Text>
              </View>
            )
          }
          ListFooterComponent={
            vm.loadingMore && vm.books.length > 0 ? (
              <ActivityIndicator style={{ padding: 16 }} color="#2563eb" />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  backIcon: { fontSize: 32, color: '#2563eb', lineHeight: 36, fontWeight: '300', marginRight: 4 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  disconnectText: { fontSize: 14, color: '#888' },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  errorText: { flex: 1, fontSize: 13, color: '#dc2626' },
  errorDismiss: { fontSize: 14, color: '#dc2626' },

  formWrapper: { flex: 1 },
  form: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  formTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  formHint: { fontSize: 13, color: '#888', lineHeight: 18, marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', color: '#888', letterSpacing: 0.5, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  connectBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  connectBtnLoading: { opacity: 0.7 },
  connectBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  listHeader: { paddingHorizontal: 16, paddingVertical: 12 },
  listHeaderText: { fontSize: 13, color: '#888' },

  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    padding: 12,
    gap: 12,
  },
  cover: {
    width: 52,
    height: 72,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  bookInfo: { flex: 1 },
  bookTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 3 },
  bookAuthor: { fontSize: 13, color: '#555', marginBottom: 3 },
  bookFormats: { fontSize: 12, color: '#2563eb', fontWeight: '500' },

  importBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  importBtnDone: { backgroundColor: '#16a34a' },
  importBtnDisabled: { backgroundColor: '#ccc' },
  importBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  empty: { alignItems: 'center', paddingTop: 48 },
  emptyText: { fontSize: 15, color: '#888' },
});
