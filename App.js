import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// Importação do componente Image
import { Image } from 'react-native';

// Telas
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import CadastroScreen from './screens/CadastroScreen';
import DashboardScreen from './screens/DashboardScreen';
import DiarioScreen from './screens/DiarioScreen';
import ReflexaoScreen from './screens/ReflexaoScreen';
import MissoesScreen from './screens/MissoesScreen';
import PerfilScreen from './screens/PerfilScreen';
import EditarPerfilScreen from './screens/EditarPerfilScreen';

// ----------------------------------------------------
// Passo 1: Importe seus ícones personalizados aqui
// ----------------------------------------------------
// Certifique-se de que os caminhos e nomes dos arquivos estão corretos
import DashboardIcon from './assets/dashboard1.png';
import DiarioIcon from './assets/livro.png';
import ReflexaoIcon from './assets/bubble.png';
import MissaoIcon from './assets/game.png';
import PerfilIcon from './assets/perfiil.png';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // ------------------------------------------------------------------
        // Passo 2: Altere a lógica do ícone para usar o componente Image
        // ------------------------------------------------------------------
        tabBarIcon: ({ focused, color, size }) => {
          let iconSource;
          let tintColor = focused ? '#3A6EBF' : 'gray';

          switch (route.name) {
            case 'Dashboard':
              iconSource = DashboardIcon;
              break;
            case 'Diário':
              iconSource = DiarioIcon;
              break;
            case 'Reflexão':
              iconSource = ReflexaoIcon;
              break;
            case 'Missão':
              iconSource = MissaoIcon;
              break;
            case 'Perfil':
              iconSource = PerfilIcon;
              break;
            default:
              // Ícone padrão caso nenhum seja encontrado
              iconSource = DashboardIcon;
          }

          // Retorna o componente de imagem personalizado
          return (
            <Image
              source={iconSource}
              style={{ width: size, height: size, tintColor: tintColor }}
            />
          );
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
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="EditarPerfil"
          component={EditarPerfilScreen}
          options={{ headerShown: true, title: 'Editar Perfil' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}