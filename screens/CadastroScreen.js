import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator, 
} from 'react-native';

export default function CadastroScreen({ navigation }) {
  
  // =================================================================
  // 1. ESTADOS (HOOKS)
  // =================================================================
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState(''); 
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  // =================================================================
  // 2. FUNÇÕES DE FILTRAGEM DE INPUT (LÓGICA DE UI)
  // =================================================================

  /**
   * Filtra o texto de entrada do e-mail.
   * 1. Remove caracteres não permitidos (exceto @, ., _, -).
   * 2. Impede a escrita após a primeira ocorrência de ".com".
   */
  const handleEmailChange = (text) => {
    // 1. Permite letras, números, @, . (ponto) e hífen/underline
    const filteredText = text.replace(/[^a-zA-Z0-9@._-]/g, '');

    // 2. Lógica para cortar após o ".com"
    const comIndex = filteredText.toLowerCase().indexOf('.com');

    if (comIndex !== -1 && filteredText.length > comIndex + 4) {
      // Corta a string para manter apenas o texto até o final de ".com"
      const finalEmail = filteredText.substring(0, comIndex + 4);
      setEmail(finalEmail);
    } else {
      setEmail(filteredText);
    }
  };


  /**
   * Filtra o texto de entrada do celular (apenas números).
   * Esta função é chamada diretamente no onChangeText do TextInput.
   */
  const handleCelularChange = (text) => {
    // Remove qualquer caractere que não seja um dígito de 0 a 9
    setCelular(text.replace(/[^0-9]/g, ''));
  };

  // =================================================================
  // 3. FUNÇÃO PRINCIPAL DE CADASTRO (LÓGICA DE NEGÓCIO E VALIDAÇÃO)
  // =================================================================

  async function cadastrar() {
    
    // 3.1. Validação de Campos Vazios
    if (!nome || !email || !celular || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    // 3.2. Validação Rígida de E-mail (força a terminação em .com e único @)
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, insira um e-mail válido que termine exatamente em ".com".');
      return;
    }

    // 3.3. Validação Rígida de Celular (garante que contém APENAS números)
    const celularNumerosRegex = /^\d+$/;
    if (!celularNumerosRegex.test(celular.trim())) {
      Alert.alert('Erro', 'O campo Celular deve conter apenas números.');
      return;
    }
    
    // 3.4. Validação de Tamanho da Senha
    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    // 3.5. Validação de Tamanho Mínimo do Celular (exemplo)
    if (celular.length < 8) {
      Alert.alert('Erro', 'Por favor, insira um número de celular válido.');
      return;
    }

    // 3.6. Conexão com o Backend
    try {
      setCarregando(true);

      const resposta = await fetch('http://10.0.2.15:3000/cadastrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          email,
          celular: celular.trim(), // Limpa espaços em branco
          senha,
          avatar_id: 1, 
        }),
      });

      console.log('Status da resposta:', resposta.status);
      const data = await resposta.json();
      console.log('Dados da resposta:', data);  


      if (resposta.ok) {
        Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
        navigation.replace('Login');
      } else {
        Alert.alert('Erro ao cadastrar', data.message || 'Ocorreu um erro inesperado. Tente novamente mais tarde.');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      Alert.alert('Erro de conexão', 'Não foi possível conectar ao servidor. Verifique sua conexão ou tente mais tarde.');
    } finally {
      setCarregando(false);
    }
  }

  // =================================================================
  // 4. RENDERIZAÇÃO (JSX)
  // =================================================================

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo_heroi.png')} style={styles.logo} />
      <Text style={styles.titulo}>Cadastro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#777"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail (apenas @ e termina em .com)"
        placeholderTextColor="#777"
        value={email}
        onChangeText={handleEmailChange} // <-- Utiliza a função de filtro de e-mail
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Celular (Apenas números)"
        placeholderTextColor="#777"
        value={celular}
        onChangeText={handleCelularChange} // <-- Utiliza a função de filtro de celular
        keyboardType="numeric" 
        maxLength={11} 
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#777"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TouchableOpacity style={styles.botao} onPress={cadastrar} disabled={carregando}>
        {carregando ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.botaoTexto}>Cadastrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

// =================================================================
// 5. ESTILOS (STYLESHEET)
// =================================================================

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