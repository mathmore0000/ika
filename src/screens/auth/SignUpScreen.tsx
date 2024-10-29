import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Image, TouchableOpacity, Text, View, TextInput, Keyboard } from "react-native";
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
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const clearFields = () => {
    onChangeName("");
    onChangeEmail("");
    onChangePassword("");
    setErrors({});
  };
  
  const handlePressLogin = () => {
    navigation.navigate("Login");
  };

  const handlePressSignUp = async () => {
    const newErrors: { [key: string]: string } = {};
    const nameError = validateName(name);
    if (nameError) newErrors.name = nameError;
    
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    } else {
      setErrors({});
    }

    try {
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
        console.log("Erro de resposta:", err.response.data);
        if (err.response.data === "Email already in use") {
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
    <View className="flex items-center justify-between bg-primary-light flex-1">
      <StatusBar style="light" />
      <View className="flex items-center min-h-[15rem] justify-center bg-white w-full rounded-br-[20rem]">
        <Image className="mt-4" source={require('@/assets/images/logo.png')} style={styles.logo} />
      </View>
      <View className="w-full items-center flex flex-col gap-10">
        <View className="w-full items-center flex flex-col gap-6" >
          <View className="w-full items-center flex flex-col">
            <TextInput
              className="h-14 w-[80%] rounded-[25px] bg-white text-black px-4"
              style={[errors.name && styles.inputError]}
              placeholder="Nome"
              placeholderTextColor="#000"
              value={name}
              onChangeText={(text) => {
                onChangeName(text);
                if (errors.name) {
                  setErrors((prevErrors) => ({ ...prevErrors, name: "" }));
                }
              }}
            />
            {errors.name && <Text className="text-sm text-red-600 font-semibold">{errors.name}</Text>}
          </View>

          <View className="w-full items-center flex flex-col">
            <TextInput
              className="h-14 w-[80%] rounded-[25px] bg-white text-black px-4"
              style={[errors.email && styles.inputError]}
              placeholder="E-mail"
              placeholderTextColor="#000"
              value={email}
              onChangeText={(text) => {
                onChangeEmail(text);
                if (errors.email) {
                  setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
                }
              }}
            />
            {errors.email && <Text className="text-sm text-red-600 font-semibold">{errors.email}</Text>}
          </View>

          <View className="w-full items-center flex flex-col">
            <TextInput
              className="h-14 w-[80%] rounded-[25px] bg-white text-black px-4"
              style={[errors.password && styles.inputError]}
              placeholder="Senha"
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
            {errors.password && <Text className="text-sm text-red-600 font-semibold">{errors.password}</Text>}
          </View>
        </View>
        <View className="w-full flex items-center flex-col gap-6">
          <TouchableOpacity className="bg-white w-[80%] flex items-center justify-center h-12 rounded-[25px]" onPress={handlePressSignUp}>
            <Text style={styles.buttonText}>Cadastrar-se</Text>
          </TouchableOpacity>
          <Text className="text-white cursor-pointer font-semibold" onPress={handlePressLogin}>Já possui conta? Entre!</Text>
        </View>
      </View>
      
      {!isKeyboardVisible && (
        <View className="flex items-center justify-center bg-white w-full rounded-t-[20rem] h-24" />
      )}
    </View>
  );
};

export default SignUp;
