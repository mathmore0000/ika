import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import { getToken } from "@/server/api"
import { jwtDecode } from "jwt-decode";
import { navigationRef, setCurrentScreen } from "@/navigation/RootNavigation";

import SettingsScreen from "@/screens/SettingsScreen";
import CalendarScreen from "@/screens/CalendarScreen";
import NotificationsScreen from "@/screens/Notifications/NotificationsScreen";
import NotificationDetailsScreen from "@/screens/Notifications/NotificationDetailsScreen";
import ResponsiblesScreen from "@/screens/Responsibles/ResponsiblesScreen";
import MedicationsScreen from "@/screens/Medications/MedicationsScreen";
import LoginScreen from "@/screens/auth/LoginScreen";
import SignUpScreen from "@/screens/auth/SignUpScreen";
import LoadingScreen from "@/screens/_aux/LoadingScreen";

export default function App() {
  const Stack = createNativeStackNavigator();
  const [isAuthenticated, setIsAuthenticated] = React.useState(null); // null para indicar estado de carregamento

  React.useEffect(() => {
    const checkAuth = async () => {
      const token = getToken()

      if (token) {
        return setIsAuthenticated(true);
      }
      setIsAuthenticated(false);

    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // Tela de carregamento enquanto verifica o token
    return <LoadingScreen />;
  }

  function AuthStack() {
    setCurrentScreen("Login");
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
      </Stack.Navigator>
    );
  }

  function MainStack() {
    setCurrentScreen("Calendar");
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
    <NavigationContainer
      ref={navigationRef}
      onStateChange={() => {
        const currentRoute = navigationRef.getCurrentRoute();
        if (currentRoute) {
          setCurrentScreen(currentRoute.name);
        }
      }}>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
