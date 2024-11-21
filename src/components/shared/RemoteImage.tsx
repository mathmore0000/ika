import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Image, StyleSheet, View, ActivityIndicator, ViewStyle, ImageStyle } from "react-native";

interface RemoteImageProps {
  uri: string | null;
  placeholder?: any; // Imagem padrão
  style?: ImageStyle | ViewStyle;
}

export interface RemoteImageRef {
  setLoading: (value: boolean) => void; // Método para recarregar a imagem
  setError: (value: boolean) => void; // Método para redefinir erros
}

const default_placeholder = require("@/assets/images/default-user-image.jpg");

const RemoteImage = forwardRef<RemoteImageRef, RemoteImageProps>(
  ({ uri, placeholder, style }, ref) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useImperativeHandle(ref, () => ({
      setLoading: setLoading,
      setError: setError,
    }));

    return (
      <View style={[styles.container, style]}>
        {loading && <ActivityIndicator style={styles.loader} color="#666" />}
        <Image
          source={error || !uri ? placeholder || default_placeholder : { uri }}
          style={[styles.image, style]}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  loader: {
    position: "absolute",
  },
});

export default RemoteImage;
