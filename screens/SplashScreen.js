import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo_heroi.png')} style={styles.logo} />
      <Text style={styles.texto}>Herói das Emoções</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#98bfc9ff', // Cinza claro neutro
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: 25,
  },
  texto: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#252525ff', // Cinza escuro moderno
  },
});
