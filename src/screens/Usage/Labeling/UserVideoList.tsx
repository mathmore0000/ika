import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Modal, Alert, RefreshControl, Button } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "@/server/api";
import VideoModal from "./VideoModal";
import { useTranslation } from 'react-i18next';
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import Toast from "react-native-toast-message";

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
    <View style={styles.container}>
      {/* Botões para filtro de status */}
      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => applyFilter(true)}>
          <Text style={styles.viewButton}>{t("videos.filterApproved")}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => applyFilter(false)}>
          <Text style={styles.viewButton}>{t("videos.filterRejected")}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => applyFilter(null)}>
          <Text style={styles.viewButton}>{t("videos.filterAll")}</Text>
        </TouchableOpacity>
      </View>

      {/* Botões para filtro de datas */}
      <View style={styles.dateFilterContainer}>
        <Button title={t("videos.fromDate")} onPress={() => setShowFromDatePicker(true)} />
        <Button title={t("videos.toDate")} onPress={() => setShowToDatePicker(true)} />
      </View>
      <Text>
        Filtro de data:
        De: {fromDate && fromDate.toISOString()}
        Até: {toDate && toDate.toISOString()}
      </Text>

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
          <View style={styles.videoItem}>
            <Text style={styles.videoText}>{t("videos.videoId")}: {item.id}</Text>
            <Text style={styles.videoText}>{t("videos.timestamp")}: {item.actionTmstamp}</Text>
            <Text style={styles.videoText}>{t("videos.status")}: {item.isApproved === true ? t("videos.approved") : (item.isApproved === false ? t("videos.rejected") : t("videos.pending"))}</Text>
            <TouchableOpacity onPress={() => setSelectedVideo(item)}>
              <Text style={styles.viewButton}>{t("videos.viewVideo")}</Text>
            </TouchableOpacity>
            {!item.isApproved && (
              <TouchableOpacity onPress={() => handleDeleteVideo(item.id)}>
                <Text style={styles.deleteButton}>{t("common.deleteVideo")}</Text>
              </TouchableOpacity>
            )}
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
  deleteButton: {
    color: "#FF4500",
    marginTop: 10,
  },
});

export default UserVideoList;
