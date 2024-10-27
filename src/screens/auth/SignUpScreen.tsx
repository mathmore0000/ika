import React from "react";
import { StatusBar } from "expo-status-bar";
import { Image, TouchableOpacity, Text, View, TextInput } from "react-native";
import {
  validateName,
  validateEmail,
  validatePassword,
} from "@/data/validations/auth/auth";
import styles from "@/assets/_auth/styles-signup";
import api from "@/server/api";
import { NavigationProps } from "@/constants/interfaces/props/DefaultNavigation";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

const SignUp: React.FC<NavigationProps> = ({ navigation }) => {
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  const [name, onChangeName] = React.useState("");
  const [email, onChangeEmail] = React.useState("");
  const [password, onChangePassword] = React.useState("");

  const clearFields = () => {
    onChangeName("");
    onChangeEmail("");
    onChangePassword("");
    setErrors({});
  };

  const handlePressSignUp = async () => {
    const newErrors: { [key: string]: string } = {};

    const nameError = validateName(name);
    if (nameError) {
      newErrors.name = nameError;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      newErrors.email = emailError;
    }

    const passwordError = validatePassword(password);
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
      // Chamada à API
      await api.post("/auth/signup", {
        displayName: name,
        email: email,
        locale: "pt",
        password: password,
      });

      clearFields();
      showSuccessToast("Usuário criado com sucesso");
      navigation.navigate("Login");
    } catch (err: any) {
      if (err.response) {
        // Erro da API
        console.log("Erro de resposta:", err.response.data);
        if (err.response.data == "Email already in use") {
          const errorMessage = "E-mail já está em uso.";
          newErrors.email = errorMessage;
          setErrors(newErrors);
          return showErrorToast(errorMessage);

        }
        return showErrorToast("Erro ao criar usuário.");
      }
      if (err.request) {
        console.log("Nenhuma resposta recebida:", err.request);
        return showErrorToast("Sem resposta do servidor. Verifique sua conexão.");
      }
      console.log("Erro inesperado:", err);
      return showErrorToast("Erro inesperado. Tente novamente.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image source={require('@/../assets/logo.png')} style={styles.logo} />

      <TextInput
        style={[
          styles.input,
          errors.name && styles.inputError,
        ]}
        placeholder="Nome"
        placeholderTextColor="#FFF"
        value={name}
        onChangeText={(text) => {
          onChangeName(text);
          if (errors.name) {
            setErrors((prevErrors) => ({ ...prevErrors, name: "" }));
          }
        }}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

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

      <TouchableOpacity style={styles.button} onPress={handlePressSignUp}>
        <Text style={styles.buttonText}>Cadastrar-se</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUp;
