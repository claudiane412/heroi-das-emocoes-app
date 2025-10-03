// EsqueceuSenhaScreen.js (React Native)

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';

export default function EsqueceuSenhaScreen({ navigation }) {
    // ⚠️ MUDANÇA AQUI: Usar 'celular' em vez de 'usuario'/'email'
    const [celular, setCelular] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function solicitarRecuperacao() {
        // ⚠️ MUDANÇA AQUI: Validação para 'celular'
        if (!celular.trim()) {
            Alert.alert('Erro', 'Por favor, insira seu número de celular.');
            return;
        }

        setCarregando(true);
        try {
            const resposta = await fetch('http://10.0.2.15:3000/solicitar-token-senha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // ⚠️ MUDANÇA AQUI: Envia o campo 'celular'
                body: JSON.stringify({ celular: celular.trim() }), 
            });

            const data = await resposta.json();
            
            if (resposta.ok && data.token) {
                // SUCESSO! 
                Alert.alert(
                    'Token Gerado!', 
                    `Seu token de redefinição (simulando SMS) é: ${data.token}. Copie-o para a próxima tela!`
                );
                
                // Navega para a tela de redefinição, passando o token
                navigation.replace('RedefinirSenha', { token: data.token }); 

            } else {
                Alert.alert('Erro', data.message || 'Número não encontrado ou erro ao gerar token.');
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
                Informe seu número de celular para receber um token de redefinição.
            </Text>

            <TextInput
                style={styles.input}
                // ⚠️ MUDANÇA AQUI: Placeholder e Teclado
                placeholder="Seu Número de Celular (Ex: 99999-9999)"
                placeholderTextColor="#777"
                value={celular}
                onChangeText={setCelular}
                autoCapitalize="none"
                keyboardType="phone-pad" // Teclado numérico/telefone
            />

            <TouchableOpacity 
                style={styles.botao} 
                onPress={solicitarRecuperacao} 
                disabled={carregando}
            >
                {carregando ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.botaoTexto}>Gerar Token e Redefinir</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.link}>Voltar para o Login</Text>
            </TouchableOpacity>
        </View>
    );
}

// Os estilos (styles) podem permanecer os mesmos do seu código original
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