import { StyleSheet, Text, View } from "react-native";

const Chat = () => {
  return (
    <View style={styles.container}>
      <Text>User</Text>
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
});

export default Chat;
