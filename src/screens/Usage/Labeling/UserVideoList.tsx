import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Modal, Alert, RefreshControl, Button } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "@/server/api";
import VideoModal from "./VideoModal";
import { useTranslation } from 'react-i18next';
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/AntDesign";
import { getDateAndHour } from "@/utils/date";
import { formatNotificationDate } from "@/utils/date";

const UserVideoList = () => {
  const { t } = useTranslation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Novos estados para o filtro de datas
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  useEffect(() => {
    fetchVideos(0, true);
  }, [filterStatus, fromDate, toDate]);

  const fetchVideos = async (page = 0, reset = false, isRefreshing = false) => {
    if (loading || (page >= totalPages && totalPages > 0)) return;

    isRefreshing ? setRefreshing(true) : setLoading(true);
    try {
      const response = await api.get("/usages/user", {
        params: {
          page,
          size: 10,
          isApproved: filterStatus,
          fromDate: fromDate ? fromDate.toISOString() : null,
          toDate: toDate ? toDate.toISOString() : null,
        },
      });
      const newVideos = response.data.content;
      setVideos(reset ? newVideos : [...videos, ...newVideos]);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error(t("videos.errorFetchingUserVideos"), error);
      showErrorToast(t("videos.errorFetchingUserVideos"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (status) => {
    if (status === filterStatus) return;
    setVideos([]);
    setCurrentPage(0);
    setTotalPages(1);
    setFilterStatus(status);
  };

  const handleLoadMore = () => {
    if (currentPage + 1 < totalPages) {
      fetchVideos(currentPage + 1);
    }
  };

  const onRefresh = () => {
    setCurrentPage(0);
    fetchVideos(0, true, true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case true:
        return {
          icon: "check",
          color: "green",
          hexadecimal: "#166534",
        }
      case false:
        return {
          icon: "close",
          color: "red",
          hexadecimal: "#991b1b",
        };
      default:
        return {
          icon: "ellipsis1",
          color: "yellow",
          hexadecimal: "#a16207",
        };
    }
  }

  const getStatusStyles = (status) => {
    const { icon, color, hexadecimal } = getStatusColor(status);
    return {
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 2,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderColor: hexadecimal,
        borderWidth: 1,
        gap: 2
      },
      text: {
        fontSize: 14,
        fontWeight: 'bold',
        color: hexadecimal,
      },
      iconColor: hexadecimal,
      iconName: icon,
    };
  };

  const handleDeleteVideo = async (videoId) => {
    Alert.alert(
      t("videos.deleteConfirmation"),
      t("videos.deleteConfirmationMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/usages/${videoId}`);
              setVideos((prevVideos) => prevVideos.filter(video => video.id !== videoId));
              showSuccessToast(t("videos.videoDeletedSuccess"));
            } catch (error) {
              console.error(t("videos.errorDeletingVideo"), error);
              showErrorToast(t("videos.errorDeletingVideo"));
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 px-5">
      {/* Botões para filtro de status */}
      <View className="flex flex-wrap w-full gap-2">
        <View className="flex flex-row gap-2 w-full">
          <TouchableOpacity className="bg-gray-200 rounded-lg flex flex-row flex-1 items-center justify-between p-2" onPress={() => applyFilter(true)}>
            <Text className="text-gray-600 text-xs">{t("videos.filterApproved")}</Text>
            <Icon name="check" size={15} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-gray-200 rounded-lg flex flex-row flex-1 items-center justify-between p-2" onPress={() => applyFilter(false)}>
            <Text className="text-gray-600 text-xs">{t("videos.filterRejected")}</Text>
            <Icon name="close" size={15} color="#666666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="bg-gray-200 rounded-lg flex flex-row items-center justify-between p-2 w-full" onPress={() => applyFilter(null)}>
          <Text className="text-gray-600 text-xs">{t("videos.filterAll")}</Text>
          <Icon name="bars" size={15} color="#666666" />
        </TouchableOpacity>

        {/* Botões para filtro de datas */}
        <View className="flex flex-row gap-2 w-full">
          <TouchableOpacity className="bg-gray-200 rounded-lg flex-1 flex flex-row items-center justify-between p-2" onPress={() => setShowFromDatePicker(true)}>
            <Text className="text-black text-xs">De: {fromDate && fromDate.toLocaleDateString("pt-BR")}</Text>
            <Icon name="calendar" size={15} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-gray-200 rounded-lg flex-1 flex flex-row items-center justify-between p-2" onPress={() => setShowToDatePicker(true)}>
            <Text className="text-black text-xs">Até: {toDate && toDate.toLocaleDateString("pt-BR")}</Text>
            <Icon name="calendar" size={15} color="#666666" />
          </TouchableOpacity>
        </View>
      </View>


      {/* Pickers de data */}
      {showFromDatePicker && (
        <DateTimePicker
          value={fromDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowFromDatePicker(false);
            if (selectedDate) setFromDate(selectedDate);
          }}
        />
      )}
      {showToDatePicker && (
        <DateTimePicker
          value={toDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowToDatePicker(false);
            if (selectedDate) setToDate(selectedDate);
          }}
        />
      )}

      {/* Loader */}
      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {/* Lista de vídeos */}
      <FlatList
        className="pt-4"
        data={videos}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <View style={styles.videoItem}>
            {/* <Text style={styles.videoText}>{t("videos.videoId")}: {item.id}</Text> */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>{getDateAndHour(new Date(item.actionTmstamp))}</Text>
              <View style={getStatusStyles().container}>
                <Icon name={getStatusStyles().iconName} size={15} color={getStatusStyles().iconColor} />
                <Text style={getStatusStyles().text}>
                  {item.isApproved === true ? t("videos.approved") : (item.isApproved === false ? t("videos.rejected") : t("videos.pending"))}
                </Text>
              </View>
            </View>

            <View className="flex flex-1 gap-2 flex-row justify-between">
              <TouchableOpacity className="w-1/2 button-icon bg-gray-500" onPress={() => setSelectedVideo(item)}>
                <Icon name="play" size={18} color="#fff" />
                <Text className="text-white font-semibold">{t("videos.viewVideo")}</Text>
              </TouchableOpacity>
              <TouchableOpacity className="w-1/2 button-icon border border-gray-500" disabled={item.isApproved} onPress={() => handleDeleteVideo(item.id)}>
                <Icon name="delete" size={18} color="#6b7280" />
                <Text className="text-gray-500 font-semibold">{t("common.deleteVideo")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      {/* Modal de vídeo */}
      {selectedVideo && (
        <Modal visible={true} transparent={true} animationType="slide">
          <VideoModal url={selectedVideo.url} onClose={() => setSelectedVideo(null)} />
          <Toast />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  dateFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  videoItem: {
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#ccc",
    gap: 20,
  },
  videoText: {
    fontSize: 16,
  },
  viewButton: {
    color: "#1E90FF",
    marginTop: 10,
  },
  deleteButton: {
    color: "#FF4500",
    marginTop: 10,
  },
});

export default UserVideoList;
