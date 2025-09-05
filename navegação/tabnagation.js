import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DiarioScreen from '../screens/DiarioScreen';
import MissoesScreen from '../screens/MissoesScreen';
import RespiracaoScreen from '../screens/RespiracaoScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Diário" component={DiarioScreen} />
      <Tab.Screen name="Missões" component={MissoesScreen} />
      <Tab.Screen name="Respiração" component={RespiracaoScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
