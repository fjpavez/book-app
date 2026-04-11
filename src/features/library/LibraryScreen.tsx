import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function LibraryScreen() {
  return (
    <View style={styles.container}>
      <Text>Biblioteca</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
