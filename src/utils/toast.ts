import Toast from 'react-native-simple-toast';

const showErrorToast = (
  message: string,
  duration: number = Toast.LONG
) => {
  Toast.show(message, duration,
    {
      backgroundColor: 'blue',
      tapToDismissEnabled: true,
    });
};

const showSuccessToast = (
  message: string,
  duration: number = Toast.LONG
) => {
  Toast.show(message, 
    duration,
    {
    backgroundColor: "green",
    tapToDismissEnabled: true,
  });
};

export { showErrorToast, showSuccessToast };
