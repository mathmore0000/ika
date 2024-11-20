import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Platform, Alert } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getToken } from "@/server/api";
import { navigationRef, setCurrentScreen } from "@/navigation/RootNavigation";
import "./src/assets/styles/global.css";
import { getUser, setToken, updateUserNotificationToken } from "@/contexts/AuthContext";
import i18n from "@/i18n";
import Toast from "react-native-toast-message";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import NetInfo from "@react-native-community/netinfo";
import Constants from "expo-constants";
import { useTranslation } from 'react-i18next';

import SettingsScreen from "@/screens/SettingsScreen";
import CalendarScreen from "@/screens/CalendarScreen";
import NotificationsScreen from "@/screens/Notifications/NotificationsScreen";
import NotificationDetailsScreen from "@/screens/Notifications/NotificationDetailsScreen";
import ResponsiblesScreen from "@/screens/Responsibles/ResponsiblesScreen";
import MedicationsScreen from "@/screens/Medications/MedicationsScreen";
import LoginScreen from "@/screens/auth/LoginScreen";
import SignUpScreen from "@/screens/auth/SignUpScreen";
import LoadingScreen from "@/screens/_aux/LoadingScreen";
import VideoFilterScreen from "@/screens/VideoFilterScreen";
import AccountScreen from "@/screens/Settings/AccountScreen";
import NoInternetScreen from "@/screens/NoInternetScreen";

let checkAuth = () => { };

function App() {
  const Stack = createNativeStackNavigator();
  const [isConnected, setIsConnected] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  checkAuth = async () => {
    const token = await getToken();
    if (!!token) {
      const user = getUser();
      const language = user.locale;
      i18n.changeLanguage(language);
    }
    setIsAuthenticated(!!token);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const registerForPushNotifications = async () => {
    let token;
    if (!Device.isDevice) {
      return;
    }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      })
    ).data;
    await updateUserNotificationToken(token);

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        sound: true,
      });
    }
  };

  const onLoginSuccess = async (token, refreshToken) => {
    await setToken(token, refreshToken);
    await registerForPushNotifications();
    await checkAuth();
  };

  function AuthStack() {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login" options={{ headerShown: false }}>
          {(props) => <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />}
        </Stack.Screen>
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  function MainStack() {
    const { t } = useTranslation();
    return (
      <Stack.Navigator>
        <Stack.Screen name="Calendar" options={{ headerShown: false }} component={CalendarScreen} />
        <Stack.Screen name="Settings" options={{ headerShown: false }} component={SettingsScreen} />
        <Stack.Screen name="Notifications" options={{ headerShown: false }} component={NotificationsScreen} />
        <Stack.Screen name="NotificationDetails"
          options={({ route }) => ({ title: t(`title.${route.name.toLowerCase()}`) })} component={NotificationDetailsScreen} />
        <Stack.Screen name="Responsibles"
          options={({ route }) => ({ title: t(`title.${route.name.toLowerCase()}`) })} component={ResponsiblesScreen} />
        <Stack.Screen name="Medications" options={{ headerShown: false }} component={MedicationsScreen} />
        <Stack.Screen name="Videos" options={{ headerShown: false }} component={VideoFilterScreen} />
        <Stack.Screen name="Account"
          options={({ route }) => ({ title: t(`title.${route.name.toLowerCase()}`) })} component={AccountScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <>
      <NavigationContainer
        ref={navigationRef}
        onStateChange={() => {
          const currentRoute = navigationRef.getCurrentRoute();
          if (currentRoute) {
            setCurrentScreen(currentRoute.name);
          }
        }}
      >
        {!isConnected ? (
          <NoInternetScreen />
        ) : isAuthenticated === null ? (
          <LoadingScreen />
        ) : isAuthenticated ? (
          <MainStack />
        ) : (
          <AuthStack />
        )}
      </NavigationContainer>
      <Toast />
    </>
  );
}

export { checkAuth };
export default App;
