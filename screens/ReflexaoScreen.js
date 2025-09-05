import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

// Componente auxiliar para estilização de cards
const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

// Opções de humor para a barra de emojis
const opcoesHumor = ['😄', '😊', '🙂', '😐', '😞', '😰', '😡'];
// Opções de desconforto com ícones
const opcoesDesconforto = [
  { label: 'Ansiedade', icon: 'zap' },
  { label: 'Tristeza', icon: 'cloud-snow' },
  { label: 'Raiva', icon: 'moon' },
  { label: 'Medo', icon: 'shield' },
  { label: 'Cansaço', icon: 'coffee' },
];

// Sugestões de dicas baseadas no desconforto
const sugestoes = {
  Ansiedade: 'Respire fundo por 1 minuto, concentre-se no ar que entra e sai.',
  Tristeza: 'Escreva algo que te fez sorrir hoje.',
  Raiva: 'Tente fazer 10 segundos de respiração consciente.',
  Medo: 'Relembre uma situação em que você teve coragem.',
  Cansaço: 'Feche os olhos por 30 segundos e apenas respire.',
};

export default function MensagemGratidaoScreen({ navigation }) {
  const [gratidao, setGratidao] = useState('');
  const [teveDesconforto, setTeveDesconforto] = useState(null);
  const [opcaoDesconforto, setOpcaoDesconforto] = useState('');
  const [descricaoRuim, setDescricaoRuim] = useState('');
  const [solucaoAutomatica, setSolucaoAutomatica] = useState('');
  const [humorAtual, setHumorAtual] = useState('');
  const [reflexaoSalva, setReflexaoSalva] = useState(false);

  // Função para salvar a reflexão
  const salvarReflexao = () => {
    if (!gratidao || !humorAtual) {
      Alert.alert('Ops!', 'Por favor, selecione seu humor e escreva algo sobre gratidão.');
      return;
    }

    const reflexao = {
      data: new Date().toLocaleDateString(),
      gratidao,
      desconforto: teveDesconforto ? (opcaoDesconforto || descricaoRuim) : 'Nenhum',
      solucao: solucaoAutomatica,
      humor: humorAtual,
    };

    // Aqui você enviaria a reflexão para um banco de dados, por exemplo
    console.log('Reflexão registrada:', reflexao);
    
    // Mostra a confirmação visual na tela
    setReflexaoSalva(true);
    // Limpa os campos depois de salvar
    setGratidao('');
    setHumorAtual('');
    setTeveDesconforto(null);
    setOpcaoDesconforto('');
    setDescricaoRuim('');
    setSolucaoAutomatica('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Jornada de Gratidão ✍️</Text>
      <Text style={styles.subtitulo}>Acalme a mente e encontre sua paz.</Text>

      {/* Card para seleção de humor */}
      <Card>
        <Text style={styles.label}>Como você está se sentindo agora?</Text>
        <View style={styles.humorContainer}>
          {opcoesHumor.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.emojiBtn,
                humorAtual === emoji && styles.emojiSelecionado,
              ]}
              onPress={() => setHumorAtual(emoji)}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Card para o diário de gratidão */}
      <Card>
        <Text style={styles.label}>Escreva algo pelo qual você é grato hoje:</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          multiline
          placeholder="Ex: A conversa que tive com um amigo..."
          placeholderTextColor="#999"
          value={gratidao}
          onChangeText={setGratidao}
        />
      </Card>

      {/* Card para desconforto */}
      <Card>
        <Text style={styles.label}>Você sentiu algum desconforto hoje?</Text>
        <View style={styles.opcoesBtnRow}>
          <TouchableOpacity
            style={[
              styles.opcaoBtn,
              teveDesconforto === true && styles.opcaoSelecionada,
            ]}
            onPress={() => {
              setTeveDesconforto(true);
              setSolucaoAutomatica('');
            }}
          >
            <Text style={styles.opcaoText}>Sim</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.opcaoBtn,
              teveDesconforto === false && styles.opcaoSelecionada,
            ]}
            onPress={() => {
              setTeveDesconforto(false);
              setOpcaoDesconforto('');
              setDescricaoRuim('');
              setSolucaoAutomatica('');
            }}
          >
            <Text style={styles.opcaoText}>Não</Text>
          </TouchableOpacity>
        </View>

        {/* Condicional para mostrar opções de desconforto */}
        {teveDesconforto && (
          <View style={styles.innerSection}>
            <Text style={styles.label}>O que você sentiu?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
              {opcoesDesconforto.map((opcao, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.chipBtn,
                    opcaoDesconforto === opcao.label && styles.chipSelecionado,
                  ]}
                  onPress={() => {
                    setOpcaoDesconforto(opcao.label);
                    setSolucaoAutomatica(sugestoes[opcao.label]);
                    setDescricaoRuim('');
                  }}
                >
                  <Feather name={opcao.icon} size={16} color={opcaoDesconforto === opcao.label ? '#fff' : '#4a2c94'} />
                  <Text style={[styles.chipText, opcaoDesconforto === opcao.label && styles.chipTextSelecionado]}>{opcao.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Ou descreva com suas palavras:</Text>
            <TextInput
              style={styles.input}
              multiline
              placeholder="Escreva aqui..."
              placeholderTextColor="#999"
              value={descricaoRuim}
              onChangeText={(texto) => {
                setDescricaoRuim(texto);
                setOpcaoDesconforto('');
                setSolucaoAutomatica('');
              }}
            />

            {solucaoAutomatica ? (
              <View style={styles.sugestaoBox}>
                <Feather name="lightbulb" size={20} color="#ffb347" />
                <Text style={styles.sugestao}>Dica: {solucaoAutomatica}</Text>
              </View>
            ) : null}
          </View>
        )}
      </Card>

      {/* Botão para salvar */}
      <TouchableOpacity style={styles.botaoSalvar} onPress={salvarReflexao}>
        <Text style={styles.textoBotao}>Salvar Reflexão</Text>
      </TouchableOpacity>

      {/* Confirmação de sucesso */}
      {reflexaoSalva && (
        <View style={styles.resultado}>
          <Text style={styles.resultadoTexto}>
            🎉 Reflexão registrada!
          </Text>
          <Text style={styles.resultadoTexto}>
            Você cultivou a sua mente com gratidão hoje!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F7F2E8', // Cor de fundo mais suave
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A2C94', // Roxo profundo
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: '#6A5ACD', // Roxo claro
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A2C94',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 12,
    padding: 15,
    marginTop: 8,
    backgroundColor: '#F9F9F9',
    color: '#333',
    textAlignVertical: 'top',
  },
  humorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  emojiBtn: {
    padding: 12,
    borderRadius: 50,
    backgroundColor: '#E6E6FA',
  },
  emoji: {
    fontSize: 32,
  },
  emojiSelecionado: {
    backgroundColor: '#C8A2C8', // Roxo pastel
    transform: [{ scale: 1.1 }],
    shadowColor: '#4A2C94',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  opcoesBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
  },
  opcaoBtn: {
    backgroundColor: '#EAEAEA',
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginRight: 10,
    borderRadius: 10,
  },
  opcaoSelecionada: {
    backgroundColor: '#F08080', // Coral suave
    shadowColor: '#F08080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  opcaoText: {
    fontWeight: '600',
    color: '#333',
  },
  innerSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6E6FA',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  chipSelecionado: {
    backgroundColor: '#4A2C94',
  },
  chipText: {
    marginLeft: 5,
    color: '#4A2C94',
    fontWeight: '600',
  },
  chipTextSelecionado: {
    color: '#fff',
  },
  sugestaoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbe6',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
  },
  sugestao: {
    marginLeft: 10,
    fontStyle: 'italic',
    color: '#7C6702',
    flexShrink: 1,
  },
  botaoSalvar: {
    backgroundColor: '#6A5ACD',
    padding: 18,
    marginTop: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6A5ACD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  textoBotao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultado: {
    marginTop: 20,
    backgroundColor: '#e6ffe6',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cce6cc',
  },
  resultadoTexto: {
    fontSize: 16,
    textAlign: 'center',
    color: '#336633',
    lineHeight: 24,
  },
});
