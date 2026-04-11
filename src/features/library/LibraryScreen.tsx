import React from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ReadingStatus } from '@domain/models';
import { RootStackParamList } from '@core/navigation/types';
import { useLibraryViewModel, SortKey, ViewMode } from './useLibraryViewModel';
import { BookCard, showBookActions } from './components/BookCard';
import { EmptyLibrary } from './components/EmptyLibrary';

type NavProp = StackNavigationProp<RootStackParamList>;

const FILTERS: { label: string; value: ReadingStatus | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Leyendo', value: 'reading' },
  { label: 'Por leer', value: 'to_read' },
  { label: 'Terminados', value: 'finished' },
  { label: 'Sin clasificar', value: 'unorganized' },
];

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: 'Reciente', value: 'date' },
  { label: 'Título', value: 'title' },
  { label: 'Autor', value: 'author' },
];

export function LibraryScreen() {
  const vm = useLibraryViewModel();
  const navigation = useNavigation<NavProp>();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Biblioteca</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => vm.setViewMode(vm.viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Text style={styles.iconBtnText}>{vm.viewMode === 'grid' ? '☰' : '⊞'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.importBtn, vm.isImporting && styles.importBtnDisabled]}
            onPress={vm.importBooks}
            disabled={vm.isImporting}
          >
            {vm.isImporting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.importBtnText}>+</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, vm.activeFilter === f.value && styles.filterChipActive]}
            onPress={() => vm.setActiveFilter(f.value)}
          >
            <Text
              style={[styles.filterChipText, vm.activeFilter === f.value && styles.filterChipTextActive]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort row */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Ordenar:</Text>
        {SORT_OPTIONS.map((s) => (
          <TouchableOpacity key={s.value} onPress={() => vm.setSortKey(s.value)}>
            <Text style={[styles.sortOption, vm.sortKey === s.value && styles.sortOptionActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.bookCount}>{vm.books.length} libro{vm.books.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Book list / grid */}
      {vm.books.length === 0 ? (
        <EmptyLibrary isFiltered={vm.activeFilter !== 'all'} />
      ) : vm.viewMode === 'grid' ? (
        <FlatList
          data={vm.books}
          keyExtractor={(b) => b.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              mode="grid"
              onPress={(book) => navigation.navigate('Reader', { bookId: book.id })}
              onLongPress={() =>
                showBookActions(item, vm.changeStatus, vm.deleteBook)
              }
            />
          )}
        />
      ) : (
        <FlatList
          data={vm.books}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              mode="list"
              onPress={(book) => navigation.navigate('Reader', { bookId: book.id })}
              onLongPress={() =>
                showBookActions(item, vm.changeStatus, vm.deleteBook)
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: {
    fontSize: 20,
    color: '#555',
  },
  importBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  importBtnDisabled: {
    backgroundColor: '#93c5fd',
  },
  importBtnText: {
    fontSize: 24,
    color: '#fff',
    lineHeight: 28,
  },
  // Filters
  filterScroll: {
    maxHeight: 44,
  },
  filterRow: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
  },
  filterChipText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  // Sort
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  sortLabel: {
    fontSize: 13,
    color: '#888',
  },
  sortOption: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  sortOptionActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  bookCount: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#aaa',
  },
  // Grid
  gridContent: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
});
