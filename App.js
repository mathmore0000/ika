import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getToken, setToken } from "@/server/api";
import { navigationRef, setCurrentScreen } from "@/navigation/RootNavigation";
import { decode as atob } from 'base-64';
import i18n from '@/i18n';

import SettingsScreen from "@/screens/SettingsScreen";
import CalendarScreen from "@/screens/CalendarScreen";
import NotificationsScreen from "@/screens/Notifications/NotificationsScreen";
import NotificationDetailsScreen from "@/screens/Notifications/NotificationDetailsScreen";
import ResponsiblesScreen from "@/screens/Responsibles/ResponsiblesScreen";
import MedicationsScreen from "@/screens/Medications/MedicationsScreen";
import LoginScreen from "@/screens/auth/LoginScreen";
import SignUpScreen from "@/screens/auth/SignUpScreen";
import LoadingScreen from "@/screens/_aux/LoadingScreen";
import VideoFilterScreen from "@/screens/VideoFilterScreen"

let checkAuth = () => { };

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  // Adiciona padding se necessário
  while (base64.length % 4) {
    base64 += '=';
  }
  const jsonPayload = atob(base64);
  return JSON.parse(jsonPayload); null;
}

function App() {
  const Stack = createNativeStackNavigator();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  checkAuth = async () => {
    const token = await getToken();
    setIsAuthenticated(!!token);
    if (!!token == true) {
      const language = parseJwt(token).locale

      i18n.changeLanguage(language);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  const onLoginSuccess = async (token) => {
    await setToken(token);
    setIsAuthenticated(true);
  };

  function AuthStack() {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />}
        </Stack.Screen>
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
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
        <Stack.Screen name="Videos" component={VideoFilterScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export { checkAuth }
export default App;