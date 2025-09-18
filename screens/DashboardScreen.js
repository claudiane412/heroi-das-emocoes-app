import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

// Componente para um card reutilizável
const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

export default function DashboardScreen({ navigation }) {
  // Informações fictícias para um visual mais completo
  const dadosDashboard = {
    emocaoHoje: '😀 Empolgado',
    nivelHeroi: 25,
    progressoDiario: 4,
    fraseMotivacional: 'A cada passo, uma nova aventura te espera!',
    historicoEmocoes: [3, 5, 4, 5, 6, 7, 6],
    labelsGrafico: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
    emocoesRecentes: ['Empolgado 😀', 'Criativo 💡', 'Calmo 😌'],
    conquistas: [
      'Desbloqueei a Força Interior',
      'Criei meu Espaço Zen',
      'Superei um Desafio',
    ],
    habilidades: [
      { nome: 'Inteligência Emocional', icone: 'brain', tipo: 'MaterialCommunityIcons' },
      { nome: 'Foco e Concentração', icone: 'target-account', tipo: 'MaterialCommunityIcons' },
      { nome: 'Pensamento Positivo', icone: 'lightbulb-on', tipo: 'MaterialCommunityIcons' },
    ],
  };

  const {
    emocaoHoje,
    nivelHeroi,
    progressoDiario,
    fraseMotivacional,
    historicoEmocoes,
    labelsGrafico,
    conquistas,
    habilidades,
  } = dadosDashboard;

  const dadosGraficos = {
    labels: labelsGrafico,
    datasets: [
      {
        data: historicoEmocoes,
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(255, 140, 0, ${opacity})`, // Laranja vibrante
      },
    ],
  };

  function renderIcon(habilidade) {
    const props = { size: 24, color: '#4b0082', style: styles.iconeHabilidade }; // Roxo escuro
    if (habilidade.tipo === 'FontAwesome5') {
      return <FontAwesome5 name={habilidade.icone} {...props} />;
    }
    if (habilidade.tipo === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={habilidade.icone} {...props} />;
    }
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header com foto de perfil e título */}
      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>Olá, Aventureiro!</Text>
          <Text style={styles.subtitulo}>{fraseMotivacional}</Text>
        </View>
        <Image
          source={{ uri: 'https://i.pravatar.cc/100?u=avatar2' }} // Imagem de perfil neutra
          style={styles.profileImage}
        />
      </View>

      {/* Seção de Resumo Rápido */}
      <View style={styles.resumoContainer}>
        <Card style={[styles.resumoCard, { backgroundColor: '#ffe6e6' }]}>
          <Text style={styles.resumoTitulo}>Nível</Text>
          <Text style={styles.resumoValor}>{nivelHeroi} ✨</Text>
        </Card>
        <Card style={[styles.resumoCard, { backgroundColor: '#e6ffe6' }]}>
          <Text style={styles.resumoTitulo}>Emoção</Text>
          <Text style={styles.resumoValor}>{emocaoHoje}</Text>
        </Card>
      </View>

      {/* Progresso Diário */}
      <Card>
        <Text style={styles.cardTitulo}>Progresso Diário</Text>
        <Text style={styles.cardTexto}>
          {progressoDiario} de 5 missões concluídas
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${(progressoDiario / 5) * 100}%` }]} />
        </View>
      </Card>

      {/* Gráfico de Emoções */}
      <Card>
        <Text style={styles.cardTitulo}>Meu Mapa Emocional</Text>
        <LineChart
          data={dadosGraficos}
          width={screenWidth * 0.85}
          height={180}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#fdfd96', // Amarelo pastel
            backgroundGradientTo: '#ffb347', // Laranja suave
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(205, 92, 92, ${opacity})`, // Rosa escuro
            labelColor: () => '#4b0082',
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ff8c00', // Laranja forte
            },
          }}
          bezier
          style={styles.grafico}
        />
      </Card>

      {/* Habilidades e Conquistas */}
      <View style={styles.gridContainer}>
        <Card style={styles.gridCard}>
          <Text style={styles.cardTitulo}>Habilidades</Text>
          {habilidades.map((hab, i) => (
            <View key={i} style={styles.habilidadeContainer}>
              {renderIcon(hab)}
              <Text style={styles.habilidadeNome}>{hab.nome}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.gridCard}>
          <Text style={styles.cardTitulo}>Conquistas</Text>
          {conquistas.map((c, i) => (
            <Text key={i} style={styles.conquistaItem}>
              🏅 {c}
            </Text>
          ))}
        </Card>
      </View>

      /*{/* Botões de Navegação */}
      {/*
      <View style={styles.botoesNavegacao}>
        <TouchableOpacity style={styles.botao} onPress={() => navigation.navigate('Diario')}>
          <MaterialCommunityIcons name="notebook-outline" size={30} color="#fff" />
          <Text style={styles.botaoTexto}>Diário</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botao} onPress={() => navigation.navigate('Missao')}>
          <MaterialCommunityIcons name="star-outline" size={30} color="#fff" />
          <Text style={styles.botaoTexto}>Missões</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botao} onPress={() => navigation.navigate('Historico')}>
          <MaterialCommunityIcons name="chart-bar" size={30} color="#fff" />
          <Text style={styles.botaoTexto}>Histórico</Text>
        </TouchableOpacity>
      </View>
        */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5eefc', // Fundo em lavanda pastel
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#b39cd0', // Roxo pastel
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#4b0082',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4b0082',
  },
  subtitulo: {
    fontSize: 16,
    color: '#4b0082',
    marginTop: 6,
    fontStyle: 'italic',
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#ff69b4', // Rosa choque
  },
  resumoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    marginTop: 25,
  },
  resumoCard: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  resumoTitulo: {
    fontSize: 15,
    color: '#4b0082',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  resumoValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4b0082',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    padding: 25,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#4b0082',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  cardTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4b0082',
    marginBottom: 15,
  },
  cardTexto: {
    fontSize: 16,
    color: '#6a0dad',
  },
  progressBar: {
    height: 14,
    backgroundColor: '#e6e6fa', // Roxo pastel claro
    borderRadius: 7,
    marginTop: 15,
  },
  progress: {
    height: 14,
    backgroundColor: '#ff1493', // Rosa vibrante
    borderRadius: 7,
  },
  grafico: {
    borderRadius: 20,
    marginTop: 20,
    elevation: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginBottom: 25,
  },
  gridCard: {
    flex: 1,
    marginHorizontal: 10,
    padding: 20,
    backgroundColor: '#f8f4ff',
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#4b0082',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  habilidadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconeHabilidade: {
    marginRight: 15,
  },
  habilidadeNome: {
    fontSize: 16,
    color: '#4b0082',
    fontWeight: '500',
  },
  conquistaItem: {
    fontSize: 16,
    color: '#4b0082',
    marginBottom: 12,
    fontWeight: '500',
  },
  botoesNavegacao: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ff69b4', // Rosa choque
    paddingVertical: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 10,
  },
  botao: {
    alignItems: 'center',
  },
  botaoTexto: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
    fontWeight: 'bold',
  },
});