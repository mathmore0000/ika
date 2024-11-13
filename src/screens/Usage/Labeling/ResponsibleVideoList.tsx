import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, StyleSheet, RefreshControl, Button } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "@/server/api";
import VideoModal from "./VideoModal";
import VideoActionsModal from "./VideoActionsModal";
import RemoteImage from "@/components/shared/RemoteImage";
import { useTranslation } from 'react-i18next';
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/AntDesign";
import { getDateAndHour } from "@/utils/date";

const ResponsibleVideoList = () => {
  const { t } = useTranslation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  // Estados para filtros de data
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
      const response = await api.get("/usages/responsible", {
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
      console.error(t("videos.errorLoadingVideos"), error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setCurrentPage(0);
    fetchVideos(0, true, true); // Passa `isRefreshing` como true para o refresh
  };


  const applyFilter = (status) => {
    if (status === filterStatus) return;
    setFilterStatus(status);
    setVideos([]);
    setTotalPages(1);
    setCurrentPage(0);
  };

  const handleLoadMore = () => {
    if (currentPage + 1 < totalPages) {
      fetchVideos(currentPage + 1);
    }
  };

  return (
    <View className="flex-1 px-5">
      {/* Filtros de status */}
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
        data={videos}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <View className="flex p-6 flex-col gap-2 border rounded-md border-[#d0d0d0]">
            <View className="flex flex-row gap-2">
              <RemoteImage uri={item.user.avatarUrl} style={styles.profileImage} />
              <View className="flex flex-col gap-1">
                <Text className="text-base">{t("videos.user")}: {item.user.displayName}</Text>
                <Text className="text-base">{t("videos.email")}: {item.user.email}</Text>
                {/* <Text className="text-base">{t("videos.videoId")}: {item.id}</Text> */}
                <Text className="text-base">{t("videos.timestamp")}: {getDateAndHour(new Date(item.actionTmstamp))}</Text>
              </View>
            </View>
            <TouchableOpacity style={{borderColor: item.isApproved == null ? "#ca8a04" :  item.isApproved ? "#991b1b" : "#166534"}} className="rounded-md border p-1 flex items-center" onPress={() => setSelectedVideo(item)}>
              <Text style={{color: item.isApproved == null ? "#ca8a04" :  item.isApproved ? "#991b1b" : "#166534"}}  className="text-lg text-white">
                {item.isApproved == null ? t("videos.classify") : (item.isApproved ? t("videos.reject") : t("videos.approve"))}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Modal para visualização e ações de aprovação/rejeição */}
      {selectedVideo && (
        <Modal transparent={true} animationType="slide">
          <View style={styles.modalBackground}>
            <VideoModal url={selectedVideo.url} onClose={() => setSelectedVideo(null)} />
            <VideoActionsModal
              closeModal={() => setSelectedVideo(null)}
              video={selectedVideo}
              onActionComplete={() => {
                setVideos([]); setCurrentPage(0); fetchVideos(0, true);
              }}
            />
          </View>
          <Toast />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  profileImage:{
    maxWidth: 70,
    maxHeight: 70,
    borderRadius: 50,
  },
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
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  videoText: {
    fontSize: 16,
  },
  viewButton: {
    color: "#1E90FF",
    marginTop: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});

export default ResponsibleVideoList;
