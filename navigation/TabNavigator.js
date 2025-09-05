// navigation/TabNavigator.js (vazio para exemplo)
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DiarioScreen from '../screens/DiarioScreen';
import MissoesScreen from '../screens/MissoesScreen';
import ReflexaoScreen from '../screens/ReflexaoScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Diário" component={DiarioScreen} />
      <Tab.Screen name="Missões" component={MissoesScreen} />
      <Tab.Screen name="Reflexao" component={ReflexaoScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
