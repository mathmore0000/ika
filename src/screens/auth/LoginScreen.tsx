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
import styles from "@/assets/_auth/styles-login";
import { validateEmail, validatePasswordLogin } from "@/data/validations/auth/auth";
import api from "@/server/api";
import { NavigationProps } from "@/constants/interfaces/props/DefaultNavigation";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

const Login: React.FC<NavigationProps> = ({ navigation }) => {
  const [email, onChangeEmail] = React.useState("");
  const [password, onChangePassword] = React.useState("");
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

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
      console.log(response.data);

      await SecureStore.setItemAsync("jwt", response.data.jwt);
      await SecureStore.setItemAsync("refresh-token", response.data.refreshToken);

      clearFields();
      showSuccessToast("Usuário logado com sucesso");
      navigation.navigate("Calendar");
    } catch (_err) {
      console.log(_err);
      if (_err.response && _err.response.data) {
        return showErrorToast(_err.response.data.message || "Usuário ou senha inválidos");
      }
      showErrorToast("Erro ao realizar login. Tente novamente.");
    }
  };


  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image source={require('@/assets/images/logo.png')} style={styles.logo} />

      <TextInput
        style={[
          styles.input,
          errors.email && styles.inputError,
        ]}
        placeholder="E-mail"
        placeholderTextColor="#FFF"
        value={email}
        onChangeText={(text) => {
          onChangeEmail(text);
          if (errors.email) {
            setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
          }
        }}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <TextInput
        style={[
          styles.input,
          errors.password && styles.inputError,
        ]}
        placeholder="Senha"
        placeholderTextColor="#FFF"
        secureTextEntry
        value={password}
        onChangeText={(text) => {
          onChangePassword(text);
          if (errors.password) {
            setErrors((prevErrors) => ({ ...prevErrors, password: "" }));
          }
        }}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}


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