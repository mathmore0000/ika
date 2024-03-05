import React from "react";
import { StatusBar } from "expo-status-bar";

import { StyleSheet, Text, View, TextInput, Button } from "react-native";
import {
  isEmailValid,
  isPasswordValid,
  isUsernameValid,
} from "@/data/validations/auth/auth";
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
      <Text>SignUp</Text>
      <TextInput
        style={styles.input}
        onChangeText={onChangeName}
        value={name}
        placeholder="John Doe"
      />
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
        onPress={handlePressSignUp}
        title="SignUp"
        accessibilityLabel="Sign up into your account"
      />

      <StatusBar style="auto" />
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

export default SignUp;
