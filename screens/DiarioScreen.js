import React, { useState, useEffect } from 'react'; // Adicionado useEffect para buscar os dados
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
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

// Helper component for a reusable card style
const Card = ({ children, style }) => (
    <View style={[styles.card, style]}>
        {children}
    </View>
);

// Emotion options with corresponding point values
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

// Dados fictícios removidos. A lista agora é populada pelo banco de dados.
// const dadosFicticios = [...];

// Renders a single journal entry item for the FlatList
const renderItem = ({ item }) => (
    <Card style={styles.entrada}>
        {/* Ajustado para usar o campo 'data' do banco de dados, que é uma string. */}
        <Text style={styles.data}>{item.data ? new Date(item.data).toLocaleDateString('pt-BR') : 'Data não disponível'}</Text>
        <Text style={styles.emocao}>{item.titulo} {opcoesEmocoes.find(e => e.label === item.humor)?.emoji}</Text>
        <Text style={styles.descricao}>{item.mensagem}</Text>
    </Card>
);

export default function DiarioScreen({ navigation }) {
    // Alterado para um array vazio, os dados serão carregados do banco.
    const [entradas, setEntradas] = useState([]);
    const [nivel, setNivel] = useState(18);
    const [conquistas, setConquistas] = useState([
        'Dominei a Ansiedade',
        'Celebrei a Alegria do Presente',
        'Cultivei a Calma Interior',
        'Transformei a Raiva em Força',
    ]);

    const [novaEmocao, setNovaEmocao] = useState(opcoesEmocoes[0].value);
    const [novaDescricao, setNovaDescricao] = useState('');
    const [reflexao, setReflexao] = useState('Continue registrando suas emoções para evoluir!');

    // NOVO BLOCO: Função para buscar as entradas do diário do backend
    const fetchEntradas = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('ERRO: Token de autenticação não encontrado no AsyncStorage.');
                return;
            }

            const response = await fetch('http://10.0.2.15:3000/diario', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                const data = await response.json();
                setEntradas(data); // Atualiza o estado com as entradas do banco
            } else {
                console.error('Erro ao buscar entradas:', await response.text());
            }
        } catch (error) {
            console.error('Erro de conexão ao buscar entradas:', error);
        }
    };
    
    // NOVO BLOCO: Hook useEffect para buscar as entradas quando a tela for montada
    useEffect(() => {
        fetchEntradas();
    }, []);

    // Função para adicionar uma nova entrada, ajustada para salvar no banco
    async function adicionarEntrada() {
        if (!novaDescricao.trim()) {
            Alert.alert('Erro', 'Por favor, escreva uma descrição para a entrada.');
            return;
        }

        const emocaoInfo = opcoesEmocoes.find((e) => e.value === novaEmocao);
        const dadosParaBackend = {
            titulo: emocaoInfo.label,
            mensagem: novaDescricao.trim(),
            humor: emocaoInfo.label,
        };

        const token = await AsyncStorage.getItem('token');
        if (!token) {
            console.error('ERRO: Token de autenticação não encontrado no AsyncStorage.');
            Alert.alert('Erro de Autenticação', 'Você precisa fazer login novamente para salvar no diário.');
            return;
        }

        console.log('Token encontrado:', token);

        try {
            const response = await fetch('http://10.0.2.15:3000/diario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(dadosParaBackend),
            });

            if (response.status === 201) {
                Alert.alert('Entrada Salva!', 'Sua reflexão foi registrada no Diário do Herói.');
                setNovaDescricao(''); // Limpa o campo de texto
                fetchEntradas(); // Chama a função para recarregar os dados da tela após o sucesso
            } else {
                const errorData = await response.json();
                Alert.alert('Erro', `Não foi possível salvar a entrada: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Erro na requisição da API:', error);
            Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
        }
    }

    // Function to generate a new achievement based on emotion
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

    // Graph data based on the last 7 entries
    const dadosGrafico = {
        // Agora os dados do gráfico são populados dinamicamente das entradas buscadas do banco
        labels: entradas.slice(0, 7).map((e) => new Date(e.data).toLocaleDateString('pt-BR')).reverse(),
        datasets: [
            {
                // A pontuação agora é baseada no humor retornado do banco
                data: entradas
                    .slice(0, 7)
                    .map((e) => {
                        const emocao = opcoesEmocoes.find(op => op.label === e.humor);
                        return emocao ? emocao.pontuacao : 0; // Pega a pontuação correta
                    })
                    .reverse(),
            },
        ],
    };

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.titulo}>Diário do Aventureiro</Text>

            {/* Hero Level Card */}
            <Card style={styles.levelCard}>
                <View style={styles.levelInfo}>
                    <Feather name="bar-chart-2" size={24} color="#521566" />
                    <Text style={styles.nivel}>Nível de Equilíbrio: {nivel} 🌟</Text>
                </View>
                <Text style={styles.reflexao}>{reflexao}</Text>
            </Card>

            {/* Graph of weekly moods */}
            <Card style={styles.graphCard}>
                <Text style={styles.cardTitulo}>Meu Mapa Emocional</Text>
                {entradas.length > 0 && (
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
                )}
            </Card>

            {/* Achievements Section */}
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

            {/* Form to add a new entry */}
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

            {/* List of past entries */}
            <Text style={styles.historiaTitulo}>Sua História de Heroísmo</Text>
            {/* O FlatList agora renderiza as entradas do banco de dados */}
            <FlatList
                data={entradas}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                scrollEnabled={false}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f4ff', // Light lavender
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