// utils/toast.js
import Toast from 'react-native-toast-message';

const showErrorToast = (message: string, duration = 7000) => {
  Toast.show({
    type: 'error',
    text1: 'Erro',
    text2: message,
    visibilityTime: duration, // Duração em milissegundos
    position: "bottom"
  });
};

const showSuccessToast = (message: string, duration = 7000) => {
  Toast.show({
    type: 'success',
    text1: 'Sucesso',
    text2: message,
    visibilityTime: duration, // Duração em milissegundos
    position: "bottom"
  });
};

export { showErrorToast, showSuccessToast };
