// EsqueceuSenhaScreen.js (React Native - FLUXO DIRETO)
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';

export default function EsqueceuSenhaScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [carregando, setCarregando] = useState(false);
    
    // ** ATENÇÃO: Ajuste este IP se for diferente no seu ambiente! **
    const API_URL = 'http://10.0.2.15:3000';

    async function solicitarRecuperacao() {
        if (!email.trim()) {
            Alert.alert('Erro', 'Por favor, insira seu endereço de e-mail.');
            return;
        }

        setCarregando(true);
        try {
            // Chama a rota de validação de e-mail
            const resposta = await fetch(`${API_URL}/EsqueceuSenha`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }), 
            });

            const data = await resposta.json();
            
            // Se o e-mail for encontrado, o backend retorna o usuario_id (Fluxo Direto)
            if (resposta.ok && data.success && data.usuario_id) {
                
                Alert.alert('E-mail Validado!', data.message);
                
                // REDIRECIONAMENTO IMEDIATO: 
                // Navega para a tela de nova senha, passando o ID do usuário.
                navigation.replace('RedefinirSenha', { usuarioId: data.usuario_id }); 

            } else {
                // Mostra a mensagem de erro (ex: Usuário não encontrado)
                Alert.alert('Erro', data.message || 'Erro ao processar sua solicitação.');
            }

        } catch (erro) {
            console.error('Erro na solicitação de recuperação:', erro);
            Alert.alert('Erro', 'Não foi possível conectar ao servidor. Verifique sua conexão.');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Recuperar Senha</Text>
            <Text style={styles.subtitulo}>
                Informe seu e-mail para validar seu cadastro e definir a nova senha.
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Seu E-mail"
                placeholderTextColor="#777"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TouchableOpacity 
                style={styles.botao} 
                onPress={solicitarRecuperacao} 
                disabled={carregando}
            >
                {carregando ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.botaoTexto}>Validar E-mail e Redefinir</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.link}>Voltar para o Login</Text>
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