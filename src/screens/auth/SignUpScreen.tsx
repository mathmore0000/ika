import React from "react";
import { StatusBar } from "expo-status-bar";

import { Image, TouchableOpacity, Text, View, TextInput, Button } from "react-native";
import {
  isEmailValid,
  isPasswordValid,
  isUsernameValid,
} from "@/data/validations/auth/auth";
import styles from "@/assets/_auth/styles";
import api from "@/server/api";
import { NavigationProps } from "@/constants/interfaces/props/DefaultNavigation";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

const SignUp: React.FC<NavigationProps> = ({ navigation }) => {
  const [name, onChangeName] = React.useState("");
  const [email, onChangeEmail] = React.useState("");
  const [password, onChangePassword] = React.useState("");

  const clearFields = () => {
    onChangeName("");
    onChangeEmail("");
    onChangePassword("");
  };

  const handlePressSignUp = async () => {
    if (
      !isEmailValid(email) ||
      !isPasswordValid(password) ||
      !isUsernameValid(name)
    )
      return showErrorToast("Usuário ou senha inválidos");
    // notify error
    try {
      await api.post("/user/create", {
        username: name,
        email: email,
        password: password,
      });

      clearFields();
      showSuccessToast("Usuário criado com sucesso");
      navigation.navigate("Login");
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
        placeholder="Nome"
        placeholderTextColor="#FFF"
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#FFF"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#FFF"
        secureTextEntry
      />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Cadastrar-se</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUp;
