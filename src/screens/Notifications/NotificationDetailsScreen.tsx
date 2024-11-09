import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import api from "@/server/api";

const NotificationDetails: React.FC<{ route: any }> = ({ route }) => {
  const { id, createdAt, detailedMessage, message, onSeen } = route.params;

  useEffect(() => {
    setNotificationAsSeen(id);
  }, []);

  const setNotificationAsSeen = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/seen`);
      onSeen();
    } catch (error) { }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{message}</Text>
      <Text style={styles.description}>{detailedMessage?.message}</Text>
      <Text style={styles.time}>{createdAt}</Text>
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
