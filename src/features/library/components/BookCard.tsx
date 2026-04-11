import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Book } from '@domain/models';

interface Props {
  book: Book;
  mode: 'grid' | 'list';
  onPress: (book: Book) => void;
  onLongPress: (book: Book) => void;
}

const FORMAT_LABEL: Record<string, string> = { epub: 'EPUB', pdf: 'PDF', md: 'MD' };

export function BookCard({ book, mode, onPress, onLongPress }: Props) {
  if (mode === 'list') {
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => onPress(book)}
        onLongPress={() => onLongPress(book)}
        activeOpacity={0.7}
      >
        <CoverThumb book={book} size={52} />
        <View style={styles.listMeta}>
          <Text style={styles.listTitle} numberOfLines={2}>{book.title}</Text>
          <Text style={styles.listAuthor} numberOfLines={1}>{book.author}</Text>
        </View>
        <Text style={styles.formatBadge}>{FORMAT_LABEL[book.format]}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.gridCard}
      onPress={() => onPress(book)}
      onLongPress={() => onLongPress(book)}
      activeOpacity={0.7}
    >
      <CoverThumb book={book} size={120} />
      <Text style={styles.gridTitle} numberOfLines={2}>{book.title}</Text>
      <Text style={styles.gridAuthor} numberOfLines={1}>{book.author}</Text>
    </TouchableOpacity>
  );
}

function CoverThumb({ book, size }: { book: Book; size: number }) {
  if (book.coverPath) {
    return (
      <Image
        source={{ uri: book.coverPath }}
        style={[styles.cover, { width: size, height: size * 1.4 }]}
        resizeMode="cover"
      />
    );
  }
  return (
    <View style={[styles.coverPlaceholder, { width: size, height: size * 1.4 }]}>
      <Text style={styles.coverPlaceholderText}>{FORMAT_LABEL[book.format]}</Text>
    </View>
  );
}

export function showBookActions(
  book: Book,
  onChangeStatus: (bookId: string, status: import('@domain/models').ReadingStatus) => void,
  onDelete: (book: Book) => void,
) {
  Alert.alert(book.title, undefined, [
    { text: 'Leyendo ahora', onPress: () => onChangeStatus(book.id, 'reading') },
    { text: 'Por leer', onPress: () => onChangeStatus(book.id, 'to_read') },
    { text: 'Terminado', onPress: () => onChangeStatus(book.id, 'finished') },
    {
      text: 'Eliminar',
      style: 'destructive',
      onPress: () =>
        Alert.alert('Eliminar libro', `¿Eliminar "${book.title}"?`, [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(book) },
        ]),
    },
    { text: 'Cancelar', style: 'cancel' },
  ]);
}

const styles = StyleSheet.create({
  // Grid
  gridCard: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
    maxWidth: '45%',
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
    color: '#1a1a1a',
  },
  gridAuthor: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  // List
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  listMeta: {
    flex: 1,
    marginLeft: 12,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  listAuthor: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  formatBadge: {
    fontSize: 11,
    color: '#888',
    fontWeight: '500',
    marginLeft: 8,
  },
  // Cover
  cover: {
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  coverPlaceholder: {
    borderRadius: 4,
    backgroundColor: '#d8d8d8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
  },
});
