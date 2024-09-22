import React from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import AppLayout from "@/components/shared/AppLayout";
import notificationsData from "@/assets/mock/NotificationsMock.json"; // Importa os dados mockados
import { NotificationsProps } from "@/constants/interfaces/props/Notifications";

const Notifications: React.FC<NotificationsProps> = ({ navigation, local = "Notifications" }) => {
  
  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.notificationCard}
      onPress={() =>
        navigation.navigate("NotificationDetails", {
          title: item.title,
          description: item.description,
          time: item.time,
        })
      }
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.time}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notificationsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />
      <AppLayout navigation={navigation} local={local} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EDE9",
  },
  list: {
    padding: 10,
  },
  notificationCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#777",
  },
  time: {
    fontSize: 12,
    color: "#aaa",
    textAlign: "right",
    marginTop: 5,
  },
});

export default Notifications;
