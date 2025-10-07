// RedefinirSenhaDiretaScreen.js (React Native - FLUXO DIRETO)

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';

export default function RedefinirSenhaScreen({ navigation, route }) {
    // Pega o ID do usuário da rota
    const usuarioId = route.params?.usuarioId; 
    
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function RedefinirSenha() {
        if (!usuarioId) {
            Alert.alert('Erro Crítico', 'ID de usuário não encontrado. Tente validar seu e-mail novamente.');
            navigation.replace('Login'); 
            return;
        }

        if (novaSenha.length < 6) {
            Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }

        setCarregando(true);
        try {
            // Chama a rota de redefinição direta
            const resposta = await fetch('http://10.0.2.15:3000/RedefinirSenha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Envia o ID e a nova senha
                body: JSON.stringify({ usuario_id: usuarioId, nova_senha: novaSenha }), 
            });

            const data = await resposta.json();

            if (resposta.ok) {
                Alert.alert('Sucesso!', 'Sua senha foi redefinida com sucesso!');
                navigation.replace('Login'); // Redireciona para o login
            } else {
                Alert.alert('Erro', data.message || 'Erro ao redefinir a senha.');
            }

        } catch (erro) {
            console.error('Erro na redefinição:', erro);
            Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Definir Nova Senha</Text>
            <Text style={styles.subtitulo}>
                Defina e confirme a sua nova senha.
            </Text>
            
            {/* Campos da Nova Senha */}
            <TextInput
                style={styles.input}
                placeholder="Nova Senha (mínimo 6 caracteres)"
                placeholderTextColor="#777"
                value={novaSenha}
                onChangeText={setNovaSenha}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Confirme a Nova Senha"
                placeholderTextColor="#777"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
            />

            <TouchableOpacity 
                style={styles.botao} 
                onPress={redefinirSenha} 
                disabled={carregando}
            >
                {carregando ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.botaoTexto}>Redefinir Senha</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.replace('Login')}>
                <Text style={styles.link}>Cancelar e Voltar para o Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EDEDED',
        padding: 20,
        justifyContent: 'center',
    },
    titulo: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
        marginBottom: 10,
    },
    subtitulo: {
        fontSize: 16,
        textAlign: 'center',
        color: '#555',
        marginBottom: 30,
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
        marginTop: 25,
        fontSize: 16,
    },
});



