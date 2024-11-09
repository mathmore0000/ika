import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import AppLayout from "@/components/shared/AppLayout";
import api from "@/server/api";
import notificationsData from "@/assets/mock/NotificationsMock.json"; // Importa os dados mockados
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { NotificationsProps } from "@/constants/interfaces/props/Notifications";

const Notifications: React.FC<NotificationsProps> = ({ navigation, local = "Notifications" }) => {

  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications(0);
  }, []);

  const loadMoreNotifications = () => {
    if (currentPage < totalPages) {
      fetchNotifications(currentPage);
    }
  };

  const fetchNotifications = async (page = currentPage) => {
    if (loading || page >= totalPages) return;

    setLoading(true);
    try {
      const response = await api.get("/notifications", {
        params: { page, size: 10 },
      });
      const newNotifications = response.data.content;

      setNotifications((prevNotifications) =>
        page === 0 ? newNotifications : [...prevNotifications, ...newNotifications]
      );

      setTotalPages(response.data.totalPages);
      setCurrentPage(page + 1);
    } catch (error) {
      console.log(error)
      showErrorToast("Error loading medications.");
    } finally {
      setLoading(false);
    }
  };

  const setNotificationAsSeen = (idNotification: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === idNotification ? { ...notification, seen: true } : notification
      )
    );
  };


  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.notificationCard}
      onPress={() =>
        navigation.navigate("NotificationDetails", {
          createdAt: item.createdAt,
          detailedMessage: JSON.parse(item.detailedMessage),
          id: item.id,
          seen: item.seen,
          seenAt: item.seenAt,
          message: item.message,
          onSeen() { setNotificationAsSeen(item.id) }
        })
      }
    >
      <Text style={styles.title}>{item.message} - {item.seen ? "Visualizado" : "Não visualizado"}</Text>
      <Text style={styles.description}>{JSON.parse(item.detailedMessage)?.message}</Text>
      <Text style={styles.time}>{item.createdAt}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        onEndReached={loadMoreNotifications}
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color="#0000ff" /> : null} // Indicador de carregamento
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
