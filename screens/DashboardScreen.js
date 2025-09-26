import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator, // Importar para o estado de carregamento
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importar AsyncStorage

const screenWidth = Dimensions.get('window').width;

// URL do seu servidor.
const API_URL = 'http://10.0.2.15:3000';

// Componente para um card reutilizável
const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

// Mapeamento de humor para pontuação (copiado do diario.js para consistência)
const opcoesEmocoes = [
  { label: 'Feliz', emoji: '😊', value: 'Feliz 😊', pontuacao: 5 },
  { label: 'Triste', emoji: '😔', value: 'Triste 😔', pontuacao: 1 },
  { label: 'Calmo', emoji: '😌', value: 'Calmo 😌', pontuacao: 4 },
  { label: 'Ansioso', emoji: '😟', value: 'Ansioso 😟', pontuacao: 2 },
  { label: 'Bravo', emoji: '😠', value: 'Bravo 😠', pontuacao: 1 },
  { label: 'Surpreso', emoji: '😲', value: 'Surpreso 😲', pontuacao: 3 },
  { label: 'Cansado', emoji: '😴', value: 'Cansado 😴', pontuacao: 2 },
  { label: 'Confuso', emoji: '😕', value: 'Confuso 😕', pontuacao: 2 },
  // Adicione pontuações para os humores da tela de Reflexão (opcional)
  { label: 'Muito feliz', emoji: '😄', pontuacao: 5 },
  { label: 'Animado', emoji: '🥳', pontuacao: 5 },
  { label: 'Empolgado', emoji: '🤩', pontuacao: 5 },
  { label: 'Bem', emoji: '🙂', pontuacao: 4 },
  { label: 'Neutro', emoji: '😐', pontuacao: 3 },
  { label: 'Chorando', emoji: '😭', pontuacao: 1 },
  { label: 'Com raiva', emoji: '😡', pontuacao: 1 },
];

// Função para buscar o emoji correspondente
const getEmocaoInfo = (label) => {
    const info = opcoesEmocoes.find(e => e.label === label);
    return info ? { label: info.label, emoji: info.emoji, pontuacao: info.pontuacao } : { label: label, emoji: '❓', pontuacao: 0 };
};

// Função para processar os dados e gerar o histórico
const processarDadosParaGrafico = (entradas) => {
    // Pega as 7 últimas entradas e inverte a ordem (para que o gráfico comece do mais antigo)
    const ultimas7Entradas = entradas.slice(0, 7).reverse();

    const labels = ultimas7Entradas.map((e) => {
        const dataObj = new Date(e.data);
        return `${String(dataObj.getDate()).padStart(2, '0')}/${String(dataObj.getMonth() + 1).padStart(2, '0')}`;
    });

    const data = ultimas7Entradas.map((e) => {
        const emocao = getEmocaoInfo(e.humor);
        return emocao.pontuacao;
    });

    return { labels, data };
};

// Função para calcular o resumo e nível (simulação básica)
const calcularResumo = (entradas) => {
    const emocaoHojeLabel = entradas.length > 0 ? entradas[0].humor : 'Neutro';
    const emocaoHojeInfo = getEmocaoInfo(emocaoHojeLabel);
    const emocaoHoje = `${emocaoHojeInfo.emoji} ${emocaoHojeInfo.label}`;

    // Simulação de Nível (baseado no total de entradas e pontuação)
    const totalPontuacao = entradas.reduce((acc, e) => {
        const emocao = getEmocaoInfo(e.humor);
        return acc + emocao.pontuacao;
    }, 0);
    const nivelHeroi = 1 + Math.floor(totalPontuacao / 10); // +1 nível a cada 10 pontos

    // Simulação de Progresso Diário (baseado no número de entradas de hoje)
    const hoje = new Date().toISOString().split('T')[0];
    const entradasHoje = entradas.filter(e => e.data.startsWith(hoje));
    const progressoDiario = entradasHoje.length > 5 ? 5 : entradasHoje.length;

    return { emocaoHoje, nivelHeroi, progressoDiario };
};


export default function DashboardScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [historicoEmocoes, setHistoricoEmocoes] = useState([]);
    const [labelsGrafico, setLabelsGrafico] = useState([]);
    const [resumo, setResumo] = useState({
        emocaoHoje: '❓ Sem Dados',
        nivelHeroi: 1,
        progressoDiario: 0,
    });
    // Manter dados estáticos por simplicidade, ou buscar de outra API
    const fraseMotivacional = 'A cada passo, uma nova aventura te espera!';
    const conquistas = [
        'Desbloqueei a Força Interior',
        'Criei meu Espaço Zen',
        'Superei um Desafio',
    ];
    const habilidades = [
        { nome: 'Inteligência Emocional', icone: 'brain', tipo: 'MaterialCommunityIcons' },
        { nome: 'Foco e Concentração', icone: 'target-account', tipo: 'MaterialCommunityIcons' },
        { nome: 'Pensamento Positivo', icone: 'lightbulb-on', tipo: 'MaterialCommunityIcons' },
    ];


    // NOVO: Função para buscar o histórico do diário
    const fetchDadosEmocionais = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.warn('Token não encontrado. Redirecionar para login?');
                setLoading(false);
                return;
            }

            // 1. Buscar entradas do diário
            const response = await fetch(`${API_URL}/diario`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const entradas = await response.json();
                
                // 2. Processar dados para o gráfico
                const { labels, data } = processarDadosParaGrafico(entradas);
                setLabelsGrafico(labels);
                setHistoricoEmocoes(data);

                // 3. Calcular resumo
                setResumo(calcularResumo(entradas));
                
            } else {
                console.error('Erro ao buscar dados do diário:', await response.text());
            }

        } catch (error) {
            console.error('Erro de conexão ao buscar dados emocionais:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // NOVO: Hook useEffect para buscar os dados ao carregar a tela
    useEffect(() => {
        fetchDadosEmocionais();
    }, []);

    const { emocaoHoje, nivelHeroi, progressoDiario } = resumo;

    // Dados do gráfico (usando os estados reais)
    const dadosGraficos = {
        labels: labelsGrafico,
        datasets: [
            {
                data: historicoEmocoes.length > 0 ? historicoEmocoes : [0, 0, 0, 0, 0, 0, 0], // Evita erro se o array estiver vazio
                strokeWidth: 3,
                color: (opacity = 1) => `rgba(255, 140, 0, ${opacity})`, // Laranja vibrante
            },
        ],
    };

    function renderIcon(habilidade) {
        // ... (função renderIcon sem alterações)
        const props = { size: 24, color: '#4b0082', style: styles.iconeHabilidade }; // Roxo escuro
        if (habilidade.tipo === 'FontAwesome5') {
            return <FontAwesome5 name={habilidade.icone} {...props} />;
        }
        if (habilidade.tipo === 'MaterialCommunityIcons') {
            return <MaterialCommunityIcons name={habilidade.icone} {...props} />;
        }
        return null;
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4b0082" />
                <Text style={styles.loadingText}>Carregando sua jornada de herói...</Text>
            </View>
        );
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
                    source={{ uri: 'https://i.pravatar.cc/100?u=avatar3' }} // Imagem de perfil neutra
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
                    {progressoDiario} de 5 missões concluídas (Entradas de Diário)
                </Text>
                <View style={styles.progressBar}>
                    <View style={[styles.progress, { width: `${(progressoDiario / 5) * 100}%` }]} />
                </View>
            </Card>

            {/* Gráfico de Emoções */}
            <Card>
                <Text style={styles.cardTitulo}>Meu grafico Emocional</Text>
                {historicoEmocoes.length > 0 ? (
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
                ) : (
                    <Text style={styles.nenhumDado}>Sem dados suficientes para o gráfico. Faça seu primeiro registro!</Text>
                )}
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

            {/* Botões de Navegação (MANTIDOS COMENTADOS) */}
            
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    // ... (Mantenha o styles sem alterações, exceto se quiser adicionar o estilo para o loading)
    container: {
        flex: 1,
        backgroundColor: '#f5eefc', // Fundo em lavanda pastel
    },
    // NOVO: Estilos para o estado de carregamento
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5eefc',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#4b0082',
    },
    nenhumDado: {
        textAlign: 'center',
        paddingVertical: 20,
        color: '#6a0dad',
        fontStyle: 'italic',
    },
    // ... (restante dos estilos)
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
});