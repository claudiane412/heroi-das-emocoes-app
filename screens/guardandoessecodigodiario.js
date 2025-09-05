import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

// Componente auxiliar para o estilo de cartão
const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

// Opções de emoções com pontuações
const opcoesEmocoes = [
  { label: 'Feliz', emoji: '😊', value: 'Feliz 😊', pontuacao: 5 },
  { label: 'Triste', emoji: '😔', value: 'Triste 😔', pontuacao: 1 },
  { label: 'Calmo', emoji: '😌', value: 'Calmo 😌', pontuacao: 4 },
  { label: 'Ansioso', emoji: '😟', value: 'Ansioso 😟', pontuacao: 2 },
  { label: 'Bravo', emoji: '😠', value: 'Bravo 😠', pontuacao: 1 },
  { label: 'Surpreso', emoji: '😲', value: 'Surpreso 😲', pontuacao: 3 },
  { label: 'Cansado', emoji: '😴', value: 'Cansado 😴', pontuacao: 2 },
  { label: 'Confuso', emoji: '😕', value: 'Confuso 😕', pontuacao: 2 },
];

// Renderiza um item da lista
const renderItem = ({ item }) => (
  <Card style={styles.entrada}>
    <Text style={styles.data}>{item.data}</Text>
    <Text style={styles.emocao}>{item.emocao}</Text>
    <Text style={styles.descricao}>{item.descricao}</Text>
  </Card>
);

export default function DiarioScreen({ navigation }) {
  const [entradas, setEntradas] = useState([]);
  const [nivel, setNivel] = useState(0);
  const [conquistas, setConquistas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [novaEmocao, setNovaEmocao] = useState(opcoesEmocoes[0].value);
  const [novaDescricao, setNovaDescricao] = useState('');
  const [reflexao, setReflexao] = useState('Continue registrando suas emoções para evoluir!');

  // Hook useEffect para carregar os dados ao iniciar a tela
  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        // TODO: Substitua 'SUA_URL_DA_API/dados' pela URL do seu endpoint de busca.
        // const response = await fetch('SUA_URL_DA_API/dados');
        // const dadosDoBanco = await response.json();

        // TODO: Atualize os estados com os dados reais do banco.
        // setEntradas(dadosDoBanco.entradas);
        // setNivel(dadosDoBanco.nivel);
        // setConquistas(dadosDoBanco.conquistas);

      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os dados. Verifique sua conexão.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  // Função para adicionar uma nova entrada
  async function adicionarEntrada() {
    if (!novaDescricao.trim()) {
      Alert.alert('Erro', 'Por favor, escreva uma descrição para a entrada.');
      return;
    }

    const dataHoje = new Date().toLocaleDateString('pt-BR');
    const emocaoInfo = opcoesEmocoes.find((e) => e.value === novaEmocao);
    const novaEntrada = {
      data: dataHoje,
      emocao: emocaoInfo.value,
      descricao: novaDescricao.trim(),
      pontuacao: emocaoInfo.pontuacao,
    };

    try {
      // TODO: Substitua 'SUA_URL_DA_API/entradas' pela URL de criação de entrada.
      // const response = await fetch('SUA_URL_DA_API/entradas', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(novaEntrada),
      // });
      // const entradaSalva = await response.json();

      // Atualiza o estado da lista com a nova entrada (com o ID do banco)
      // setEntradas([entradaSalva, ...entradas]);
      setEntradas([novaEntrada, ...entradas]); // Usado para demonstração sem API

      setNovaDescricao('');

      const novaPontuacao = nivel + emocaoInfo.pontuacao;
      // TODO: Atualize o nível no banco.
      // await fetch('SUA_URL_DA_API/nivel', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ novoNivel: novaPontuacao }),
      // });
      setNivel(novaPontuacao);

      const conquista = gerarConquista(emocaoInfo.label);
      if (conquista && !conquistas.includes(conquista)) {
        // TODO: Adicione a conquista no banco.
        // await fetch('SUA_URL_DA_API/conquistas', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ novaConquista: conquista }),
        // });
        setConquistas((prev) => [...prev, conquista]);
      }

      setReflexao(`Hoje você enfrentou a emoção "${emocaoInfo.label}" com coragem. Continue assim!`);
      Alert.alert('Entrada Salva!', 'Sua reflexão foi registrada.');

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a entrada. Tente novamente.');
      console.error(error);
    }
  }

  // Função para gerar uma conquista com base na emoção
  function gerarConquista(emocao) {
    switch (emocao) {
      case 'Triste':
        return 'Encarei a Tristeza com Coragem';
      case 'Ansioso':
        return 'Dominei a Ansiedade';
      case 'Bravo':
        return 'Transformei a Raiva em Força';
      case 'Feliz':
        return 'Celebrei a Alegria do Presente';
      case 'Calmo':
        return 'Cultivei a Calma Interior';
      default:
        return null;
    }
  }

  // Dados para o gráfico (com base nas últimas 7 entradas)
  const dadosGrafico = {
    labels: entradas.slice(0, 7).map((e) => e.data).reverse(),
    datasets: [
      {
        data: entradas.slice(0, 7).map((e) => e.pontuacao).reverse(),
      },
    ],
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.titulo}>Diário do Aventureiro</Text>

      {/* Cartão de Nível */}
      <Card style={styles.levelCard}>
        <View style={styles.levelInfo}>
          <Feather name="bar-chart-2" size={24} color="#521566" />
          <Text style={styles.nivel}>Nível de Equilíbrio: {nivel} 🌟</Text>
        </View>
        <Text style={styles.reflexao}>{reflexao}</Text>
      </Card>
      
      {/* Gráfico de humor semanal */}
      <Card style={styles.graphCard}>
        <Text style={styles.cardTitulo}>Meu Mapa Emocional</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#4b0082" />
        ) : (
          entradas.length > 0 ? (
            <LineChart
              data={dadosGrafico}
              width={screenWidth * 0.8}
              height={200}
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#ffc3a0',
                backgroundGradientTo: '#ffb347',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(220, 20, 60, ${opacity})`,
                labelColor: () => '#4b0082',
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#ff69b4',
                },
              }}
              bezier
              style={{ borderRadius: 16 }}
            />
          ) : (
            <Text style={{ textAlign: 'center' }}>Adicione sua primeira entrada para ver o gráfico!</Text>
          )
        )}
      </Card>

      {/* Seção de Conquistas */}
      {conquistas.length > 0 && (
        <Card style={styles.conquistasBox}>
          <Text style={styles.cardTitulo}>Conquistas Emocionais</Text>
          {conquistas.map((c, i) => (
            <View key={i} style={styles.conquistaItem}>
              <Feather name="award" size={18} color="#FFD700" style={{ marginRight: 10 }} />
              <Text style={styles.conquistaTexto}>{c}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Formulário para adicionar uma nova entrada */}
      <Card style={styles.form}>
        <Text style={styles.label}>Como você está se sentindo hoje?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emocaoScroll}>
          {opcoesEmocoes.map((opcao) => (
            <TouchableOpacity
              key={opcao.value}
              style={[
                styles.emocaoBotao,
                novaEmocao === opcao.value && styles.emocaoBotaoSelecionado,
              ]}
              onPress={() => setNovaEmocao(opcao.value)}
            >
              <Text
                style={[
                  styles.emocaoTexto,
                  novaEmocao === opcao.value && styles.emocaoTextoSelecionado,
                ]}
              >
                {opcao.emoji} {opcao.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TextInput
          style={styles.input}
          placeholder="Escreva aqui como foi seu dia..."
          multiline
          value={novaDescricao}
          onChangeText={setNovaDescricao}
        />

        <TouchableOpacity style={styles.botaoAdicionar} onPress={adicionarEntrada}>
          <Text style={styles.botaoTexto}>Adicionar Entrada</Text>
        </TouchableOpacity>
      </Card>

      {/* Lista de entradas anteriores */}
      <Text style={styles.historiaTitulo}>Sua História de Heroísmo</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4b0082" style={{ marginTop: 20 }} />
      ) : (
        entradas.length > 0 ? (
          <FlatList
            data={entradas}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Nenhuma entrada encontrada. Comece a registrar!</Text>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4ff',
    padding: 20
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#a9a9a9',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4b0082',
    marginBottom: 25,
    alignSelf: 'center'
  },
  levelCard: {
    padding: 22,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  nivel: {
    fontSize: 20,
    color: '#4b0082',
    fontWeight: '700',
    marginLeft: 10
  },
  reflexao: {
    fontSize: 16,
    color: '#6a0dad',
    fontStyle: 'italic',
  },
  graphCard: {
    alignItems: 'center',
    padding: 10
  },
  cardTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4b0082',
    marginBottom: 15,
  },
  conquistasBox: {
    padding: 22,
    borderWidth: 1,
    borderColor: '#ff69b4',
  },
  conquistaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  conquistaTexto: {
    fontSize: 16,
    color: '#6a0dad',
    fontWeight: '500',
  },
  entrada: {
    backgroundColor: '#FFFBE6',
    borderLeftWidth: 6,
    borderLeftColor: '#F9C621',
  },
  data: {
    fontWeight: '700',
    color: '#F97316',
    marginBottom: 6
  },
  emocao: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E0115F',
    marginBottom: 10
  },
  descricao: {
    fontSize: 17,
    color: '#4B5563'
  },
  form: {
    backgroundColor: '#E6E6FA',
    padding: 25,
  },
  label: {
    fontSize: 20,
    color: '#4b0082',
    fontWeight: '600'
  },
  emocaoScroll: {
    marginVertical: 15
  },
  emocaoBotao: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#4b0082',
    marginRight: 15,
  },
  emocaoBotaoSelecionado: {
    backgroundColor: '#4b0082'
  },
  emocaoTexto: {
    color: '#4b0082',
    fontSize: 18,
    fontWeight: '700'
  },
  emocaoTextoSelecionado: {
    color: '#FFF'
  },
  input: {
    borderColor: '#b39cd0',
    borderWidth: 2,
    borderRadius: 15,
    height: 120,
    padding: 15,
    fontSize: 16,
    marginTop: 15,
    textAlignVertical: 'top',
    color: '#4b0082',
    backgroundColor: '#FFF',
  },
  botaoAdicionar: {
    backgroundColor: '#ff69b4',
    paddingVertical: 18,
    borderRadius: 15,
    marginTop: 25,
    alignItems: 'center',
    shadowColor: '#ff69b4',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  botaoTexto: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold'
  },
  historiaTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4b0082',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  }
});