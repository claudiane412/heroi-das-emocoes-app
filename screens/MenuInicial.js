// screens/MenuScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function MenuScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 Herói das Emoções</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Floresta')}
      >
        <Text style={styles.buttonText}>🌳 Floresta da Ansiedade</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Labirinto')}
      >
        <Text style={styles.buttonText}>🌀 Labirinto da Ansiedade</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1e2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    color: '#d8b48e',
    fontWeight: 'bold',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#d8b48e',
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 15,
    marginVertical: 15,
    width: '80%',
  },
  buttonText: {
    fontSize: 22,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
