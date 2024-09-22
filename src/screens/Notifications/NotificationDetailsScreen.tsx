import React from "react";
import { View, Text, StyleSheet } from "react-native";

const NotificationDetails: React.FC<{ route: any }> = ({ route }) => {
  const { title, description, time } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.time}>{time}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F2EDE9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    color: "#555",
    marginBottom: 10,
  },
  time: {
    fontSize: 16,
    color: "#999",
  },
});

export default NotificationDetails;
