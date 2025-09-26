import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DiarioScreen from '../screens/DiarioScreen';
import MissoesScreen from '../screens/MissoesScreen';
import ReflexaoScreen from '../screens/ReflexaoScreen';
import PerfilScreen from '../screens/PerfilScreen';

// Importe a biblioteca de ícones
import Feather from 'react-native-vector-icons/Feather';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Define a cor dos ícones para as abas ativas e inativas
        tabBarActiveTintColor: '#6A5ACD',
        tabBarInactiveTintColor: '#999',
        tabBarIcon: ({ color, size }) => {
          let iconName;

          // Lógica para definir o ícone de acordo com o nome da rota (tela)
          if (route.name === 'Diário') {
            iconName = 'book-open';
          } else if (route.name === 'Missões') {
            iconName = 'flag';
          } else if (route.name === 'Reflexao') {
            iconName = 'lightbulb';
          } else if (route.name === 'Perfil') {
            iconName = 'user';
          }
          // Retorna o componente do ícone com a cor e o tamanho definidos
          return <Feather name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Diário" component={DiarioScreen} />
      <Tab.Screen name="Missões" component={MissoesScreen} />
      <Tab.Screen name="Reflexao" component={ReflexaoScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}