import Toast from "react-native-root-toast";

const showErrorToast = (
  message: string,
  duration: number = Toast.durations.LONG
) => {
  Toast.show(message, {
    duration: duration,
    backgroundColor: "red",
    shadow: true,
    animation: true,
    hideOnPress: true,
  });
};

const showSuccessToast = (
  message: string,
  duration: number = Toast.durations.LONG
) => {
  Toast.show(message, {
    duration: duration,
    backgroundColor: "green",
    shadow: true,
    animation: true,
    hideOnPress: true,
  });
};

export { showErrorToast, showSuccessToast };
