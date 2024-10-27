import React from "react";
import { Image, StyleSheet, View, ActivityIndicator } from "react-native";

interface RemoteImageProps {
  uri: string | null;
  placeholder?: any; // Imagem padrão
  style?: object;
}

const default_placeholder = require("@/assets/images/default-user-image.jpg");

const RemoteImage: React.FC<RemoteImageProps> = ({ uri, placeholder, style }) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  return (
    <View style={[styles.container, style]}>
      {loading && <ActivityIndicator style={styles.loader} color="#666" />}
      <Image
        source={error || !uri ? (!placeholder ? default_placeholder : placeholder) : { uri }}
        style={[styles.image, style]}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </View>
  );
};

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
