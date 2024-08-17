import React from "react";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";

import {
  Image,
  Text,
  TouchableOpacity,
  View,
  TextInput
} from "react-native";
import styles from "@/assets/_auth/styles";  // Importando os estilos do arquivo separado
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
    return;
  };

  const handlePressLogin = async () => {
    navigation.navigate("Home");
    return;
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
      <StatusBar style="light" />
      <Image source={require('@/../assets/logo.png')} style={styles.logo} />

      <TextInput
        style={styles.input}
        placeholder="User"
        placeholderTextColor="#FFF"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#FFF"
        secureTextEntry
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePressSignUp}
        >
          <Text style={styles.buttonText}>Cadastrar-se</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handlePressLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;
