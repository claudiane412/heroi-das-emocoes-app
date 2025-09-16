import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';

// Telas
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import CadastroScreen from './screens/CadastroScreen';
import DashboardScreen from './screens/DashboardScreen';
import DiarioScreen from './screens/DiarioScreen';
import ReflexaoScreen from './screens/ReflexaoScreen';
import MissoesScreen from './screens/MissoesScreen';
import PerfilScreen from './screens/PerfilScreen';

// ** Importar a nova tela EditarPerfilScreen **
import EditarPerfilScreen from './screens/EditarPerfilScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
// é isso ai 
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'home';
              break;
            case 'Diário':
              iconName = 'book';
              break;
            case 'Respiração':
              iconName = 'wind';
              break;
            case 'Missão':
              iconName = 'target';
              break;
            case 'Perfil':
              iconName = 'user';
              break;
            default:
              iconName = 'circle';
          }

          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3A6EBF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Diário" component={DiarioScreen} />
      <Tab.Screen name="Reflexão" component={ReflexaoScreen} />
      <Tab.Screen name="Missão" component={MissoesScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [pularLogin, setPularLogin] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!pularLogin ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen {...props} onSkip={() => setPularLogin(true)} />
              )}
            </Stack.Screen>
            <Stack.Screen name="Cadastro" component={CadastroScreen} />
          </>
        ) : null}

        {/* Tela principal com abas */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* Registrar a tela EditarPerfil no Stack Navigator */}
        <Stack.Screen
          name="EditarPerfil"
          component={EditarPerfilScreen}
          options={{ headerShown: true, title: 'Editar Perfil' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
