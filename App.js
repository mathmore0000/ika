import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getToken, setToken } from "@/server/api";
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
import VideoFilterScreen from "@/screens/VideoFilterScreen"

let checkAuth = () => {
  console.log("checkAuth antes")};
function App() {
  const Stack = createNativeStackNavigator();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  checkAuth = async () => {
    console.log("checkAuth")
    const token = await getToken();
    setIsAuthenticated(!!token);
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