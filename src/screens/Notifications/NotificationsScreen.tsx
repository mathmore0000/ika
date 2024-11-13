import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import AppLayout from "@/components/shared/AppLayout";
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { NotificationsProps } from "@/constants/interfaces/props/Notifications";
import { formatNotificationDate } from "@/utils/date";

const Notifications: React.FC<NotificationsProps> = ({ navigation, local = "Notifications" }) => {
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications(0);
  }, []);

  const loadMoreNotifications = () => {
    if (currentPage < totalPages) {
      fetchNotifications(currentPage);
    }
  };

  const fetchNotifications = async (page = currentPage, isRefreshing = false) => {
    if (loading || page >= totalPages) return;

    if (isRefreshing) {
      setRefreshing(true);
      page = 0; // Reinicia a paginação ao fazer refresh
    } else {
      setLoading(true);
    }

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
      console.log(error);
      showErrorToast("Error loading notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchNotifications(0, true); // Chama a função de fetch com o parâmetro isRefreshing
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
      <Text style={styles.time}>{formatNotificationDate(new Date(item.createdAt))}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        onEndReached={loadMoreNotifications}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color="#0000ff" /> : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
