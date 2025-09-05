import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ IMPORT CORRETO

export default function LoginScreen({ navigation, onSkip }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    try {
      setCarregando(true);

      const resposta = await fetch('http://10.0.2.15:3000/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await resposta.json();

      if (resposta.ok) {
        await AsyncStorage.setItem('token', data.token); // ✅ SALVAR TOKEN

        Alert.alert('Bem-vindo!', 'Login realizado com sucesso!');
        navigation.replace('MainTabs'); // Vai para o app principal
      } else {
        Alert.alert('Erro ao entrar', data.message || 'Verifique seus dados');
      }
    } catch (erro) {
      console.error('Erro no login:', erro);
      Alert.alert('Erro de conexão', 'Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo_heroi.png')} style={styles.logo} />
      <Text style={styles.titulo}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#777"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#777"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TouchableOpacity style={styles.botao} onPress={entrar} disabled={carregando}>
        <Text style={styles.botaoTexto}>{carregando ? 'Entrando...' : 'Entrar'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.link}>Criar conta</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onSkip}>
        <Text style={styles.link}>Pular login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEDED',
    padding: 20,
    justifyContent: 'center',
  },
  logo: {
    width: 110,
    height: 110,
    alignSelf: 'center',
    marginBottom: 25,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  botao: {
    backgroundColor: '#4C8BF5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  botaoTexto: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    color: '#4C8BF5',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
  },
});
