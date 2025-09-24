import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AVATARES = [
  { id: 1, uri: 'https://i.pravatar.cc/150?img=12', nome: 'Herói Azul' },
  { id: 2, uri: 'https://i.pravatar.cc/150?img=5', nome: 'Herói Verde' },
  { id: 3, uri: 'https://i.pravatar.cc/150?img=15', nome: 'Herói Laranja' },
  { id: 4, uri: 'https://i.pravatar.cc/150?img=20', nome: 'Herói Roxo' },
];

const HUMORES = [
  { emoji: '😊', frase: 'Feliz e cheio de energia' },
  { emoji: '😌', frase: 'Calmo e tranquilo' },
  { emoji: '😔', frase: 'Um pouco triste' },
  { emoji: '😠', frase: 'Com raiva, tentando me acalmar' },
];

export default function EditarPerfilScreen({ navigation, route }) {
  const params = route.params || {};

  const {
    nomeAtual = '',
    emailAtual = '',
    nivelAtual = 0.35,
    avatarIdAtual = 1,
    humorIndexAtual = 0,
  } = params;

  const [nome, setNome] = useState(nomeAtual);
  const [email, setEmail] = useState(emailAtual);
  const [nivelHeroi, setNivelHeroi] = useState(nivelAtual);
  const [avatarId, setAvatarId] = useState(avatarIdAtual);
  const [humorIndex, setHumorIndex] = useState(humorIndexAtual);

  function validarEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert('Erro', 'O nome não pode ficar vazio.');
      return;
    }
    if (!validarEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um e-mail válido.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert('Erro', 'Não foi possível autenticar. Faça o login novamente.');
        return;
      }

      const humorSelecionado = HUMORES[humorIndex]?.frase;

      const response = await fetch("http://10.0.2.15:3000/usuario/atualizar", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim(), // ✅ Agora o email é enviado
          nivel_heroi: nivelHeroi,
          avatar_id: avatarId,
          humor_atual: humorSelecionado,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar perfil.');
      }

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      navigation.goBack();

    } catch (error) {
      console.error('Erro ao salvar o perfil:', error);
      Alert.alert('Erro', error.message || 'Não foi possível salvar o perfil. Tente novamente.');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.titulo}>Editar Perfil</Text>
      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Digite seu nome"
        placeholderTextColor="#999"
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Digite seu e-mail"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={styles.label}>Escolha seu Avatar</Text>
      <View style={styles.avatarsContainer}>
        {AVATARES.map(({ id, uri, nome }) => (
          <TouchableOpacity
            key={id}
            style={[styles.avatarOption, avatarId === id && styles.avatarSelecionado]}
            onPress={() => setAvatarId(id)}
          >
            <Image source={{ uri }} style={styles.avatarImagem} />
            <Text style={styles.avatarNome}>{nome}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Humor do Dia</Text>
      <View style={styles.humoresContainer}>
        {HUMORES.map(({ emoji, frase }, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.humorOption, humorIndex === index && styles.humorSelecionado]}
            onPress={() => setHumorIndex(index)}
          >
            <Text style={styles.humorEmoji}>{emoji}</Text>
            <Text style={styles.humorFrase}>{frase}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Nível do Herói: {Math.round(nivelHeroi * 100)}%</Text>
      <Slider
        minimumValue={0}
        maximumValue={1}
        value={nivelHeroi}
        onValueChange={setNivelHeroi}
        minimumTrackTintColor="#3A6EBF"
        maximumTrackTintColor="#ccc"
        step={0.01}
        style={{ marginBottom: 20 }}
      />
      <TouchableOpacity style={styles.botao} onPress={salvar}>
        <Text style={styles.textoBotao}>Salvar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.botao, styles.botaoCancelar]}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.textoBotao, styles.textoCancelar]}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F5FA',
    flex: 1,
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#395B8A',
    marginBottom: 25,
    alignSelf: 'center',
  },
  label: {
    fontSize: 16,
    color: '#3B4E76',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    color: '#1e293b',
  },
  avatarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  avatarOption: {
    alignItems: 'center',
    borderRadius: 10,
    padding: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarSelecionado: {
    borderColor: '#3A6EBF',
  },
  avatarImagem: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarNome: {
    marginTop: 5,
    fontSize: 12,
    color: '#395B8A',
    fontWeight: '600',
    textAlign: 'center',
  },
  humoresContainer: {
    marginBottom: 25,
  },
  humorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 12,
  },
  humorSelecionado: {
    borderColor: '#3A6EBF',
    backgroundColor: '#D6E0F5',
  },
  humorEmoji: {
    fontSize: 30,
    marginRight: 12,
  },
  humorFrase: {
    fontSize: 16,
    color: '#395B8A',
    fontWeight: '600',
  },
  botao: {
    backgroundColor: '#3A6EBF',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  botaoCancelar: {
    backgroundColor: '#cbd5e1',
  },
  textoBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  textoCancelar: {
    color: '#3A6EBF',
  },
});