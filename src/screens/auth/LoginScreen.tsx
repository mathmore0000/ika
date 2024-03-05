import React from "react";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Button,
  Alert,
} from "react-native";
import { isEmailValid, isPasswordValid } from "@/data/validations/auth/auth";
import api from "@/server/api";
import { NavigationProps } from "@/constants/interfaces/props/DefaultNavigation";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

const Login: React.FC<NavigationProps> = ({ navigation }) => {
  const [email, onChangeEmail] = React.useState("");
  const [password, onChangePassword] = React.useState("");

  const clearFields = () => {
    onChangeEmail("");
    onChangePassword("");
  };

  const handlePressSignUp = () => {
    navigation.navigate("SignUp");
  };

  const handlePressLogin = async () => {
    if (!isEmailValid(email) || !isPasswordValid(password))
      return showErrorToast("Usuário ou senha inválidos");

    // notify error
    try {
      const response = await api.post("/user/login", {
        email: email,
        password: password,
      });

      await SecureStore.setItemAsync("token", response.data.token);
      console.log(response.data);

      navigation.navigate("Home");
      clearFields();
      showSuccessToast("Usuário logado com sucesso");
    } catch (_err) {
      console.log(_err);
      showErrorToast("Usuário ou senha inválidos");
    }
  };
  return (
    <View style={styles.container}>
      <Text>Login</Text>
      <TextInput
        style={styles.input}
        onChangeText={onChangeEmail}
        value={email}
        placeholder="john@gmail.com"
      />
      <TextInput
        style={styles.input}
        onChangeText={onChangePassword}
        value={password}
        secureTextEntry={true}
        placeholder="********"
      />
      <Button
        onPress={handlePressLogin}
        title="Login"
        accessibilityLabel="Login into your account"
      />

      <StatusBar style="auto" />
      <TouchableOpacity onPress={handlePressSignUp}>
        <Text>Criar conta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export default Login;
