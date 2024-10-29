import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

import SettingsScreen from "@/screens/SettingsScreen";
import CalendarScreen from "@/screens/CalendarScreen";
import NotificationsScreen from "@/screens/Notifications/NotificationsScreen";
import NotificationDetailsScreen from "@/screens/Notifications/NotificationDetailsScreen";
import ResponsiblesScreen from "@/screens/Responsibles/ResponsiblesScreen";
import MedicationsScreen from "@/screens/MedicationsScreen";
import LoginScreen from "@/screens/auth/LoginScreen";
import SignUpScreen from "@/screens/auth/SignUpScreen";
import LoadingScreen from "@/screens/_aux/LoadingScreen";
import "./src/assets/styles/global.css";

export default function App() {
  const Stack = createNativeStackNavigator();
  const [isAuthenticated, setIsAuthenticated] = React.useState(null); // null para indicar estado de carregamento

  React.useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync("jwt");
      console.log("Token:", token);

      if (token) {
        try {
          const { exp } = jwtDecode(token);
          console.log("Expiração do token:", exp);

          // Verifique se o token não está expirado
          if (Date.now() < exp * 1000) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Erro ao decodificar o token:", error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // Tela de carregamento enquanto verifica o token
    return <LoadingScreen />;
  }

  function AuthStack() {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}}/>
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{headerShown: false}}/>
      </Stack.Navigator>
    );
  }

  function MainStack() {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="NotificationDetails" component={NotificationDetailsScreen} />
        <Stack.Screen name="Responsibles" component={ResponsiblesScreen} />
        <Stack.Screen name="Medications" component={MedicationsScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
