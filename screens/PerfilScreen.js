import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Lista de avatares com URLs fictícias
const AVATARES = [
    { id: 1, uri: 'https://i.pravatar.cc/150?img=12' },
    { id: 2, uri: 'https://i.pravatar.cc/150?img=5' },
    { id: 3, uri: 'https://i.pravatar.cc/150?img=15' },
    { id: 4, uri: 'https://i.pravatar.cc/150?img=20' },
];

// Emojis e frases para o humor do dia
const HUMORES = [
    { emoji: '😊', frase: 'Feliz e cheio de energia' },
    { emoji: '😌', frase: 'Calmo e tranquilo' },
    { emoji: '😔', frase: 'Um pouco triste' },
    { emoji: '😠', frase: 'Com raiva, tentando me acalmar' },
];

// Componente principal da tela de perfil
export default function PerfilScreen({ navigation, route }) {
    const [nome, setNome] = useState('Herói Desconhecido');
    const [email, setEmail] = useState('heroi@emocao.com');
    const [nivelHeroi, setNivelHeroi] = useState(0.35);
    const [avatarId, setAvatarId] = useState(1);
    const [humorIndex, setHumorIndex] = useState(0);

    // Usa useFocusEffect para carregar os dados sempre que a tela estiver em foco
    useFocusEffect(
        React.useCallback(() => {
            async function carregarPerfil() {
                try {
                    const token = await AsyncStorage.getItem("token");
                    if (!token) {
                        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
                        return;
                    }

                    const response = await fetch("http://10.0.2.15:3000/usuario/me", {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (!response.ok) throw new Error("Erro ao buscar perfil");
                    const data = await response.json();

                    setNome(data.nome);
                    setEmail(data.email);
                    setNivelHeroi(data.nivel_heroi || 0);
                    setAvatarId(data.avatar_id || 1);

                    const humorIndexServidor = HUMORES.findIndex(h =>
                        h.emoji === data.humor_atual || h.frase === data.humor_atual
                    );
                    setHumorIndex(humorIndexServidor >= 0 ? humorIndexServidor : 0);

                } catch (error) {
                    console.error("Erro ao carregar perfil:", error);
                }
            }

            carregarPerfil();
        }, [navigation])
    );

    function handleLogout() {
        Alert.alert(
            'Sair da Conta',
            'Você tem certeza que deseja sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem("token");
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    },
                },
            ]
        );
    }

    function handleEditProfile() {
        navigation.navigate('EditarPerfil', {
            nomeAtual: nome,
            emailAtual: email,
            nivelAtual: nivelHeroi,
            avatarIdAtual: avatarId,
            humorIndexAtual: humorIndex,
        });
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Seu Perfil de Herói</Text>

            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: AVATARES.find(a => a.id === avatarId)?.uri || AVATARES[0].uri }}
                    style={styles.avatar}
                />
                <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
                    <MaterialIcons name="edit" size={20} color="#4b0082" />
                    <Text style={styles.editButtonText}>Editar Perfil</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <View style={styles.infoContainer}>
                    <MaterialIcons name="person" size={24} color="#521566" />
                    <View style={styles.textContainer}>
                        <Text style={styles.label}>Nome</Text>
                        <Text style={styles.info}>{nome}</Text>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <MaterialIcons name="email" size={24} color="#521566" />
                    <View style={styles.textContainer}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.info}>{email}</Text>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <MaterialIcons name="star" size={24} color="#521566" />
                    <View style={styles.textContainer}>
                        <Text style={styles.label}>Nível de Força Interior</Text>
                        <Text style={styles.info}>{Math.round(nivelHeroi * 100)}% de maestria</Text>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={{ fontSize: 24, marginRight: 10 }}>
                        {HUMORES[humorIndex]?.emoji || '🙂'}
                    </Text>
                    <View style={styles.textContainer}>
                        <Text style={styles.label}>Seu Humor do Dia</Text>
                        <Text style={styles.info}>{HUMORES[humorIndex]?.frase || 'Sem humor definido'}</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.botao} onPress={handleLogout} activeOpacity={0.7}>
                <Text style={styles.textoBotao}>Sair da Conta</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f4ff',
        padding: 25
    },
    titulo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4b0082',
        marginBottom: 25,
        alignSelf: 'center'
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 35
    },
    avatar: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 4,
        borderColor: '#6a0dad',
        marginBottom: 15,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E6E6FA',
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 25,
        shadowColor: '#a9a9a9',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
    },
    editButtonText: {
        color: '#4b0082',
        fontWeight: '600',
        marginLeft: 8,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 30,
        paddingHorizontal: 25,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 6,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    textContainer: {
        marginLeft: 20,
        flexShrink: 1,
    },
    label: {
        fontSize: 16,
        color: '#3B4E76',
        fontWeight: '600',
    },
    info: {
        fontSize: 18,
        color: '#5579A1',
        marginTop: 5,
    },
    botao: {
        marginTop: 40,
        backgroundColor: '#ff69b4',
        paddingVertical: 18,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: '#ff69b4',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    textoBotao: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});