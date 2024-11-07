// UserVideoList.js
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Modal, Alert } from "react-native";
import api from "@/server/api";
import VideoModal from "./VideoModal";
import { useTranslation } from 'react-i18next';
import { showErrorToast, showSuccessToast } from "@/utils/toast";

const UserVideoList = () => {
  const { t } = useTranslation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchVideos(0, true);
  }, [filterStatus]);

  const fetchVideos = async (page = currentPage, reset = false) => {
    if (loading || page >= totalPages) return;
    setLoading(true);
    try {
      const response = await api.get("/usages/user", {
        params: {
          page, size: 10,
          isApproved: filterStatus,
        }
      });
      setVideos(reset ? response.data.content : [...videos, ...response.data.content]);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error(t("videos.errorFetchingUserVideos"), error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (status) => {
    if (status == filterStatus) return;
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
            <Text style={styles.videoText}>{t("videos.videoId")}: {item.id}</Text>
            <Text style={styles.videoText}>{t("videos.timestamp")}: {item.actionTmstamp}</Text>
            <Text style={styles.videoText}>{t("videos.status")}: {item.isApproved === true ? t("videos.approved") : (item.isApproved === false ? t("videos.rejected") : t("videos.pending"))}</Text>
            <TouchableOpacity onPress={() => setSelectedVideo(item)}>
              <Text style={styles.viewButton}>{t("videos.viewVideo")}</Text>
            </TouchableOpacity>
            {
              !item.isApproved &&
              <TouchableOpacity onPress={() => handleDeleteVideo(item.id)}>
                <Text style={styles.deleteButton}>{t("common.deleteVideo")}</Text>
              </TouchableOpacity>
            }
          </View>
        )}
      />

      {selectedVideo && (
        <Modal visible={true} transparent={true} animationType="slide">
          <VideoModal
            url={selectedVideo.url}
            onClose={() => setSelectedVideo(null)}
          />
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
