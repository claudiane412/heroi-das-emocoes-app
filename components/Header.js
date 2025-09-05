import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';

export default function Header({ titulo }) {
  const { setUsuario } = useContext(AuthContext);

  const logout = () => {
    setUsuario(null); // volta para tela de login
  };

  return (
    <View style={styles.header}>
      <Text style={styles.texto}>{titulo}</Text>
      <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
        <Ionicons name="log-out-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  texto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutBtn: {
    padding: 6,
  },
});
