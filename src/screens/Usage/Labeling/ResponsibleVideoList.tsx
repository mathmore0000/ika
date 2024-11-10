import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, StyleSheet, RefreshControl } from "react-native";
import api from "@/server/api";
import VideoModal from "./VideoModal";
import VideoActionsModal from "./VideoActionsModal";
import RemoteImage from "@/components/shared/RemoteImage";
import { useTranslation } from 'react-i18next';

const ResponsibleVideoList = () => {
  const { t } = useTranslation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // Estado para o refresh
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  useEffect(() => {
    fetchVideos(0, true);
  }, [filterStatus]);

  const fetchVideos = async (page = 0, reset = false, isRefreshing = false) => {
    if (loading || page >= totalPages) return;

    isRefreshing ? setRefreshing(true) : setLoading(true);
    try {
      const response = await api.get("/usages/responsible", {
        params: {
          page,
          size: 10,
          isApproved: filterStatus,
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
    <View style={styles.container}>
      {/* Filtros */}
      <TouchableOpacity onPress={() => applyFilter(true)}>
        <Text style={styles.viewButton}>{t("videos.filterApproved")}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => applyFilter(false)}>
        <Text style={styles.viewButton}>{t("videos.filterRejected")}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => applyFilter(null)}>
        <Text style={styles.viewButton}>{t("videos.filterAll")}</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <View style={styles.videoItem}>
            <RemoteImage uri={item.user.avatarUrl} style={styles.profileImage} />
            <Text style={styles.videoText}>{t("videos.user")}: {item.user.displayName}</Text>
            <Text style={styles.videoText}>{t("videos.email")}: {item.user.email}</Text>
            <Text style={styles.videoText}>{t("videos.videoId")}: {item.id}</Text>
            <Text style={styles.videoText}>{t("videos.timestamp")}: {item.actionTmstamp}</Text>
            <TouchableOpacity onPress={() => setSelectedVideo(item)}>
              <Text style={styles.viewButton}>
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
