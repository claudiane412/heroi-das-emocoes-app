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
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL do seu servidor. Certifique-se de que o servidor está rodando em Node.js
// Use o IP que o seu servidor fornece no terminal (ex: http://10.0.2.15:3000)
const API_URL = 'http://10.0.2.15:3000';

// Componente auxiliar para estilização de cards
const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

// Opções de humor para a barra de emojis
const opcoesHumor = ['😄', '😊', '🥳', '🤩', '🙂', '😐', '😞', '😭', '😰', '😡', '😴'];
// Opções de desconforto com ícones
const opcoesDesconforto = [
  { label: 'Ansiedade', icon: 'zap' },
  { label: 'Tristeza', icon: 'cloud-snow' },
  { label: 'Raiva', icon: 'moon' },
  { label: 'Medo', icon: 'shield' },
  { label: 'Cansaço', icon: 'coffee' },
];

// Sugestões de dicas baseadas no desconforto (com mensagens mais instrutivas)
const sugestoes = {
  Ansiedade: [
    'A ansiedade é um eco do futuro. Respire fundo, volte para o presente e lembre-se: você só precisa lidar com o agora. Um passo de cada vez.',
    'Se a ansiedade apertar, tente focar nos seus cinco sentidos: o que você vê, ouve, sente, cheira e saboreia? Isso ajuda a ancorar você no momento e a acalmar a mente.',
    'Sua mente pode estar tentando resolver mil problemas de uma vez. Dê a ela um descanso. Por um minuto, apenas respire e sinta a paz que existe em não fazer nada.',
    'A ansiedade não é quem você é. Ela é apenas uma nuvem passageira em seu céu. Observe-a, mas não se torne ela. O sol continua a brilhar por trás.',
    'Sua mente merece paz. Feche os olhos e imagine um lugar calmo. Permita-se sentir essa tranquilidade. Não há nada mais importante agora do que o seu bem-estar.',
    'Em momentos de ansiedade, lembre-se de que a sua força interior é maior do que qualquer preocupação. Você já superou desafios antes e pode fazer isso de novo.',
  ],
  Tristeza: [
    'Permita-se sentir. Está tudo bem não estar bem o tempo todo. Abrace suas emoções e lembre-se de que a tempestade vai passar. Você é forte o suficiente para superar isso.',
    'A tristeza, assim como a felicidade, é uma parte da jornada. Não lute contra ela. Apenas a acolha, cuide de si e saiba que, como as ondas do mar, ela vai e volta.',
    'Está tudo bem em não estar bem. A tristeza é como uma visita: ela chega, mas não precisa de moradia. Dê espaço a ela, mas lembre-se de que ela não é permanente.',
    'A dor não é para sempre. Dê tempo ao tempo. Em breve, a luz de um novo dia irá iluminar seu caminho. Sinta, mas não se apegue.',
    'Cada lágrima que cai é um passo para a cura. Não tenha medo de chorar. É um sinal de que você está se permitindo sentir, e isso é um ato de coragem.',
  ],
  Raiva: [
    'A raiva é uma energia que precisa ser liberada de forma saudável. Tente dar uma breve caminhada ou apertar e soltar os punhos para dissipar a tensão acumulada.',
    'Antes de reagir, respire. A raiva é um sinal de que algo te machucou, mas a resposta calma é a sua maior força. Entenda a causa antes de reagir ao efeito.',
    'A raiva é como um veneno que você bebe esperando que o outro sinta a dor. Deixe ir. Libere a tensão com exercícios ou escrevendo sobre o que te incomodou.',
    'Sua paz é mais valiosa que a opinião dos outros. Deixe que a raiva seja uma motivação para a mudança, e não um motivo para a destruição.',
    'O descontrole não é a sua resposta. Encontre algo que te acalme, seja ouvir música, escrever ou apenas ficar em silêncio. A calma é sua melhor aliada.',
  ],
  Medo: [
    'O medo é a prova de que você está crescendo e se aventurando em algo novo. Lembre-se de uma vez que você superou um desafio e use essa força para enfrentar o momento atual.',
    'Não deixe o medo ser um muro, mas sim um trampolim. Ele indica que algo grandioso está do outro lado. Seja corajoso e lembre-se: o medo não define seu futuro.',
    'A maior conquista na vida é enfrentar o medo. Não fuja dele. Olhe-o nos olhos, respire fundo e siga em frente. Você é mais forte do que imagina.',
    'O medo é apenas um sentimento, não uma realidade. Acredite na sua capacidade e saiba que, mesmo que algo dê errado, você tem a força para se reerguer.',
    'Encare o medo como um amigo. Ele quer te proteger, mas você pode mostrar a ele que o caminho a seguir é seguro. A coragem não é a ausência de medo, mas a ação apesar dele.',
  ],
  Cansaço: [
    'O cansaço do dia a dia é real. Permita-se fazer uma pausa sem culpa. Você não precisa estar produtivo o tempo todo. Descanse. Recarregar as energias é uma forma de progresso.',
    'O descanso é tão importante quanto o trabalho. Dê ao seu corpo e mente o que eles precisam. Desconectar é essencial para se reconectar com a sua essência.',
    'Seu corpo está te pedindo uma pausa. Não ignore. Tire um tempo para si, descanse, e volte com a mente renovada. Você merece esse cuidado.',
    'Você está em uma maratona, não em uma corrida. Não se cobre tanto. Pare, respire e lembre-se que o cansaço é um sinal de que você está dando o seu melhor.',
    'O cansaço mental é invisível, mas real. Dê a si mesmo a permissão de parar. Ler um livro, ouvir música ou simplesmente não fazer nada pode ser o que você mais precisa.',
  ],
  Geral: [
    'Saber que algo não vai bem é o primeiro passo para a mudança. Você é forte e capaz de superar isso. Lembre-se, mesmo os dias mais cinzentos têm um fim.',
    'O que você está sentindo é válido. Não o ignore. Cuide-se com carinho e permita-se processar. Você tem todo o direito de buscar a sua paz.',
    'Lembre-se que você está no controle da sua jornada. Pequenas escolhas diárias podem levar a grandes transformações. Confie no processo.',
    'Cada passo que você dá é um ato de coragem. Não subestime a sua força. Você está no caminho certo para a cura e o crescimento.',
  ],
  SemGratidao: [
    'A gratidão pode ser um desafio, mas mesmo nos dias ruins, sempre há algo a ser grato. Apenas o fato de respirar é um grande presente.',
    'Não é a alegria que nos torna gratos, é a gratidão que nos deixa alegres. Tente encontrar um pequeno milagre no seu dia, por menor que seja.',
    'A gratidão não é apenas a maior das virtudes, ela é a mãe de todas as outras. Olhe ao seu redor e descubra as pequenas coisas que te fazem bem.',
    'O simples ato de agradecer pode ter o poder de mudar sua perspectiva. Comece com algo simples, como o ar que você respira, e sua visão do mundo se transformará.',
    'A gratidão desbloqueia a abundância da vida. Ela transforma o que temos em suficiente e o caos em ordem. Que tal pensar em uma pequena coisa boa que aconteceu hoje?',
    'A felicidade não é ter uma vida perfeita, mas sim ser grato pelo que se tem. Agradecer pelas pequenas coisas é o segredo para uma vida mais leve e positiva.',
    'Mesmo nos dias mais difíceis, há sempre algo a agradecer. Tente anotar três coisas simples pelas quais você é grato, como o sabor do seu café ou a brisa da manhã. Essa prática transforma a alma.',
  ],
};

// --- ALTERAÇÃO 1: Adição do mapa para traduzir o humor ---
// Esse objeto traduz o emoji selecionado para uma palavra, que o banco de dados consegue salvar.
const mapaHumor = {
  '😄': 'Muito feliz',
  '😊': 'Feliz',
  '🥳': 'Animado',
  '🤩': 'Empolgado',
  '🙂': 'Bem',
  '😐': 'Neutro',
  '😞': 'Triste',
  '😭': 'Chorando',
  '😰': 'Ansioso',
  '😡': 'Com raiva',
  '😴': 'Cansado',
};
// --- FIM DA ALTERAÇÃO 1 ---


export default function MensagemGratidaoScreen({ navigation }) {
  const [gratidao, setGratidao] = useState('');
  const [teveDesconforto, setTeveDesconforto] = useState(null);
  const [opcaoDesconforto, setOpcaoDesconforto] = useState('');
  const [descricaoRuim, setDescricaoRuim] = useState('');
  const [solucaoAutomatica, setSolucaoAutomatica] = useState('');
  const [mensagemGratidao, setMensagemGratidao] = useState('');
  const [humorAtual, setHumorAtual] = useState('');
  const [reflexaoSalva, setReflexaoSalva] = useState(false);

  // Função para salvar a reflexão
  const salvarReflexao = async () => {
    const isGratidaoFilled = !!gratidao;
    const isHumorFilled = !!humorAtual;
    const isDesconfortoFilled = teveDesconforto && (!!opcaoDesconforto || !!descricaoRuim);

    if (!isGratidaoFilled && !isHumorFilled && !isDesconfortoFilled) {
      Alert.alert('Ops!', 'Por favor, preencha pelo menos um campo para registrar sua reflexão.');
      return;
    }

    // Lógica para a mensagem de gratidão
    if (isGratidaoFilled) {
      setMensagemGratidao('Você cultivou a sua mente com gratidão hoje!');
    } else {
      const mensagens = sugestoes['SemGratidao'];
      setMensagemGratidao(mensagens[Math.floor(Math.random() * mensagens.length)]);
    }

    // Lógica de seleção da mensagem para desconforto
    let solucaoGerada = '';
    if (teveDesconforto && opcaoDesconforto) {
      const mensagens = sugestoes[opcaoDesconforto];
      solucaoGerada = mensagens[Math.floor(Math.random() * mensagens.length)];
    } else if (teveDesconforto && descricaoRuim) {
      const mensagens = sugestoes['Geral'];
      solucaoGerada = mensagens[Math.floor(Math.random() * mensagens.length)];
    }
    
    setSolucaoAutomatica(solucaoGerada);

    // Cria o objeto com os dados para enviar à API
    const dadosReflexao = {
      gratidao: gratidao,
      desconforto: teveDesconforto ? (opcaoDesconforto || descricaoRuim) : null,
      solucao: solucaoGerada, 
      // --- ALTERAÇÃO 2: Substituição do humor pelo valor traduzido do mapa ---
      humor: mapaHumor[humorAtual] || 'Não informado',
      // --- FIM DA ALTERAÇÃO 2 ---
    };
    
    try {
      // 1. Pega o token de autenticação que foi salvo no login
      const token = await AsyncStorage.getItem('token');
      
      if (token) {
        // 2. Envia os dados para a sua API
        const resposta = await fetch(`${API_URL}/salvar_reflexao`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(dadosReflexao),
        });

        if (!resposta.ok) {
          const erro = await resposta.json();
          throw new Error(erro.message || 'Erro ao salvar a reflexão na API.');
        }

        const resultado = await resposta.json();
        console.log('Resposta da API:', resultado);
        Alert.alert('Sucesso!', 'Reflexão salva no banco de dados!');
        
      } else {
        Alert.alert('Erro', 'Token de autenticação não encontrado. Faça o login novamente.');
      }

      setReflexaoSalva(true);
      setGratidao('');
      setHumorAtual('');
      setTeveDesconforto(null);
      setOpcaoDesconforto('');
      setDescricaoRuim('');

    } catch (error) {
      console.error('Erro no processo de salvamento:', error);
      Alert.alert('Erro', error.message || 'Ocorreu um erro ao salvar sua reflexão.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Jornada de Gratidão ✍️</Text>
      <Text style={styles.subtitulo}>Acalme a mente e encontre sua paz.</Text>

      {/* Card para seleção de humor */}
      <Card>
        <Text style={styles.label}>Como você está se sentindo agora?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.humorScrollView}>
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
        </ScrollView>
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
              }}
            />
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
            {mensagemGratidao}
          </Text>
          
          {/* Exibe a sugestão motivacional aqui, após salvar */}
          {solucaoAutomatica ? (
            <View style={styles.sugestaoBox}>
              <Feather name="lightbulb" size={20} color="#ffb347" />
              <Text style={styles.sugestao}>{solucaoAutomatica}</Text>
            </View>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F7F2E8',
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
    color: '#4A2C94',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: '#6A5ACD',
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
  humorScrollView: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  emojiBtn: {
    padding: 12,
    borderRadius: 50,
    backgroundColor: '#E6E6FA',
    marginHorizontal: 5,
  },
  emoji: {
    fontSize: 32,
  },
  emojiSelecionado: {
    backgroundColor: '#C8A2C8',
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
    backgroundColor: '#F08080',
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