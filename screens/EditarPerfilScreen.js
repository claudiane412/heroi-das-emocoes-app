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
import { MaterialIcons } from '@expo/vector-icons'; // 👈 NOVO: Importe para usar o ícone
import * as ImagePicker from 'expo-image-picker'; // 👈 NOVO: Importe o Image Picker

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
        // NOVO: Recebe a URI da foto da galeria
        fotoGaleriaUriAtual = null, 
    } = params;

    const [nome, setNome] = useState(nomeAtual);
    const [email, setEmail] = useState(emailAtual);
    const [nivelHeroi, setNivelHeroi] = useState(nivelAtual);
    const [avatarId, setAvatarId] = useState(avatarIdAtual);
    const [humorIndex, setHumorIndex] = useState(humorIndexAtual);
    // NOVO: Estado para gerenciar a foto da galeria
    const [fotoGaleriaUri, setFotoGaleriaUri] = useState(fotoGaleriaUriAtual); 

    function validarEmail(email) {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
    
    // NOVO: Função para selecionar imagem da galeria
    async function pickImage() {
        // 1. Pedir permissão
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permissão Necessária',
                'É preciso permitir o acesso à galeria de fotos para escolher uma imagem de perfil.'
            );
            return;
        }

        // 2. Abrir a galeria
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Corte 1:1 para foto de perfil
            quality: 1,
        });

        // 3. Processar o resultado
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setFotoGaleriaUri(uri); // Define a nova URI
            setAvatarId(null); // Desmarca o avatar pré-definido
            Alert.alert('Foto Selecionada', 'Lembre-se de salvar para aplicar a alteração.');

            // Em um ambiente de produção, o UPLOAD para o servidor DEVE ocorrer aqui
            // para obter uma URL pública/permanente antes de salvar.
        }
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

            // NOVO: Objeto de dados dinâmico
            const dadosAtualizacao = {
                nome: nome.trim(),
                email: email.trim(), 
                nivel_heroi: nivelHeroi,
                humor_atual: humorSelecionado,
            };

            if (fotoGaleriaUri) {
                // Se o usuário selecionou uma foto da galeria, enviamos a URI
                // e garantimos que o avatarId seja nulo.
                dadosAtualizacao.foto_perfil_uri = fotoGaleriaUri;
                dadosAtualizacao.avatar_id = null;
            } else {
                // Caso contrário, enviamos o avatarId selecionado
                dadosAtualizacao.avatar_id = avatarId;
                dadosAtualizacao.foto_perfil_uri = null; // Limpa a foto da galeria no servidor
            }
            
            const response = await fetch("http://10.0.2.15:3000/usuario/atualizar", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(dadosAtualizacao), // Usa o objeto de dados atualizado
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
    
    // NOVO: Determina qual URI exibir para a pré-visualização principal
    const currentAvatarSource = fotoGaleriaUri 
        ? { uri: fotoGaleriaUri } 
        : { uri: AVATARES.find(a => a.id === avatarId)?.uri || AVATARES[0].uri };


    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.titulo}>Editar Perfil</Text>
            
            {/* NOVO: Pré-visualização do Avatar/Foto de Perfil */}
            <View style={styles.currentAvatarContainer}>
                <Image
                    source={currentAvatarSource}
                    style={styles.currentAvatarImage}
                />
            </View>

            {/* NOVO: Botão para abrir a Galeria */}
            <TouchableOpacity 
                style={[styles.botaoGaleria, fotoGaleriaUri && styles.botaoGaleriaSelecionado]} 
                onPress={pickImage}
            >
                <MaterialIcons name="photo-library" size={24} color={fotoGaleriaUri ? '#fff' : '#3A6EBF'} />
                <Text style={[styles.textoBotaoGaleria, fotoGaleriaUri && { color: '#fff' }]}>
                    {fotoGaleriaUri ? 'Mudar Foto da Galeria' : 'Escolher da Galeria'}
                </Text>
            </TouchableOpacity>
            
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
            
            <Text style={styles.label}>Escolha seu Avatar (ou use a foto da galeria)</Text>
            
            {/* Avatares Pré-definidos */}
            <View style={styles.avatarsContainer}>
                {AVATARES.map(({ id, uri, nome }) => (
                    <TouchableOpacity
                        key={id}
                        style={[
                            styles.avatarOption, 
                            avatarId === id && styles.avatarSelecionado,
                            // NOVO: Desabilita se houver foto da galeria selecionada
                            fotoGaleriaUri && styles.avatarDesabilitado 
                        ]}
                        onPress={() => {
                            setAvatarId(id);
                            setFotoGaleriaUri(null); // Limpa a foto da galeria
                        }}
                        disabled={!!fotoGaleriaUri} // Desabilita o toque
                    >
                        <Image source={{ uri }} style={styles.avatarImagem} />
                        <Text style={styles.avatarNome}>{nome}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            
            {/* ... (Restante do formulário) ... */}
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
    // NOVOS ESTILOS PARA AVATAR/GALERIA
    currentAvatarContainer: { 
        alignItems: 'center',
        marginBottom: 20,
    },
    currentAvatarImage: { 
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#3A6EBF',
    },
    botaoGaleria: { 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E6E9F0',
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#E6E9F0',
    },
    botaoGaleriaSelecionado: {
        backgroundColor: '#3A6EBF',
        borderColor: '#3A6EBF',
    },
    textoBotaoGaleria: { 
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '700',
        color: '#3A6EBF',
    },
    // FIM DOS NOVOS ESTILOS
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
    avatarDesabilitado: { // Estilo para avatares quando a foto da galeria está ativa
        opacity: 0.4,
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