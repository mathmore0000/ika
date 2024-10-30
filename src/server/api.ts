import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { navigate, isCurrentScreenInAuth } from "@/navigation/RootNavigation"; // Configuração global de navegação, se ainda não tiver

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// Função para verificar se o token está expirado
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  const { exp } = jwtDecode<{ exp: number }>(token); // Decodifica o token e extrai o campo 'exp'
  return Date.now() >= exp * 1000; // Verifica se a data atual é maior ou igual à expiração
};

// Função para obter um novo JWT usando o refreshToken
const refreshAccessToken = async () => {
  try {
    console.log("getRefreshToken")
    const refreshToken = await SecureStore.getItemAsync("refresh-token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    console.log("pegando o novo token...");
    const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh-token`, {
      refreshToken,
    });
    console.log("recebi refresh-token", response)
    const { jwt, refreshToken: newRefreshToken } = response.data;

    // Armazena o novo JWT e o novo refreshToken
    await SecureStore.setItemAsync("jwt", jwt);
    await SecureStore.setItemAsync("refresh-token", newRefreshToken);

    return jwt;
  } catch (error) {
    console.error("Erro ao renovar o token:", error);
    return null;
  }
};

export async function getToken() {
  let token = await SecureStore.getItemAsync("jwt");

  if (isTokenExpired(token)) {
    console.log("token está expirado")

    return await refreshAccessToken();
  }
  return token

}

// Interceptor de requisição para adicionar o JWT e renovar se necessário
api.interceptors.request.use(
  async (config) => {
    // console.log("token", token)
    // Verifique se o token está expirado
    if (isCurrentScreenInAuth()) {
      return config;
    }
    const token = await getToken();
    // Se a renovação falhar, redirecione para o login
    if (!token) {

      navigate("Login"); // Redireciona o usuário para a tela de login
      return Promise.reject(new Error("Sessão expirada"));
    }
    // Adiciona o token ao cabeçalho da requisição
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
