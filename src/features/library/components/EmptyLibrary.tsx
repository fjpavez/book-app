import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  isFiltered: boolean;
}

export function EmptyLibrary({ isFiltered }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📚</Text>
      <Text style={styles.title}>
        {isFiltered ? 'Sin libros en esta categoría' : 'Tu biblioteca está vacía'}
      </Text>
      <Text style={styles.subtitle}>
        {isFiltered
          ? 'Cambia el filtro o importa más libros'
          : 'Toca + para importar tu primer libro'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 52,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
});
