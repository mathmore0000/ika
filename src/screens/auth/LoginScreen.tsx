// Login.tsx
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Keyboard,
} from "react-native";
import styles from "@/assets/_auth/styles-login";
import {
  validateEmail,
  validatePasswordLogin,
} from "@/data/validations/auth/auth";
import api from "@/server/api";
import { NavigationProps } from "@/constants/interfaces/props/DefaultNavigation";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { checkAuth } from "@/../App.js";
import { useTranslation } from "react-i18next";

const Login: React.FC<NavigationProps> = ({ navigation }) => {
  const { t } = useTranslation();

  const [email, onChangeEmail] = React.useState(
    "matheusmoreira2004@live.com"
  );
  const [password, onChangePassword] = React.useState("password12345");
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const clearFields = () => {
    onChangeEmail("");
    onChangePassword("");
    setErrors({});
  };

  const handlePressSignUp = () => {
    navigation.navigate("SignUp");
  };

  const handlePressLogin = async () => {
    const newErrors: { [key: string]: string } = {};

    const emailError = validateEmail(email);
    if (emailError) {
      newErrors.email = emailError;
    }

    const passwordError = validatePasswordLogin(password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    } else {
      setErrors({});
    }

    try {
      const response = await api.post("/auth/login", {
        username: email,
        password: password,
      });

      await SecureStore.setItemAsync("jwt", response.data.jwt);
      await SecureStore.setItemAsync(
        "refresh-token",
        response.data.refreshToken
      );

      clearFields();
      showSuccessToast(t("auth.login.loginSuccess"));
      checkAuth();
    } catch (_err) {
      console.log(_err);
      if (_err.response && _err.response.data) {
        return showErrorToast(
          _err.response.data.message || t("auth.login.invalidCredentials")
        );
      }
      showErrorToast(t("auth.login.loginError"));
    }
  };

  return (
    <View className="flex items-center justify-between bg-primary-light flex-1">
      <StatusBar style="light" />
      <View className="flex items-center min-h-[15rem] justify-center bg-white w-full rounded-br-[20rem]">
        <Image
          className="mt-4"
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />
      </View>
      <View className="w-full items-center flex flex-col gap-10">
        <View className="w-[80%] items-center flex flex-col gap-6">
          <View className="w-full items-center flex flex-col">
            <TextInput
              className="h-14 w-full rounded-[25px] bg-white text-black px-4"
              style={[errors.email && styles.inputError]}
              placeholder={t("auth.login.email")}
              placeholderTextColor="#000"
              value={email}
              onChangeText={(text) => {
                onChangeEmail(text);
                if (errors.email) {
                  setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
                }
              }}
            />
            {errors.email && (
              <Text className="text-sm text-red-600 font-semibold">
                {errors.email}
              </Text>
            )}
          </View>
          <View className="w-full items-center flex flex-col">
            <TextInput
              className="h-14 w-full rounded-[25px] bg-white text-black px-4"
              style={[errors.password && styles.inputError]}
              placeholder={t("auth.login.password")}
              placeholderTextColor="#000"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                onChangePassword(text);
                if (errors.password) {
                  setErrors((prevErrors) => ({ ...prevErrors, password: "" }));
                }
              }}
            />
            {errors.password && (
              <Text className="text-sm text-red-600 font-semibold">
                {errors.password}
              </Text>
            )}
          </View>
        </View>
        <View className="w-[80%] flex items-center flex-col gap-6">
          <TouchableOpacity
            className="bg-white w-full flex items-center justify-center h-12 rounded-[25px]"
            onPress={handlePressLogin}
          >
            <Text className="text-black font-semibold">
              {t("auth.login.enter")}
            </Text>
          </TouchableOpacity>
          <Text
            className="text-white cursor-pointer font-semibold"
            onPress={handlePressSignUp}
          >
            {t("auth.login.noAccount")}
          </Text>
        </View>
      </View>

      {/* Condicional para exibir a View de rodapé apenas quando o teclado estiver fechado */}
      {!isKeyboardVisible && (
        <View className="flex items-center justify-center bg-white w-full rounded-t-[20rem] h-24" />
      )}
    </View>
  );
};

export default Login;
