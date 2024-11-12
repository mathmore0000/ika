// VideoModal.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import { showErrorToast } from "@/utils/toast";
import { useTranslation } from 'react-i18next';

const VideoModal = ({ url, onClose }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.modalContainer}>
      <View style={styles.header}>

        <Text style={styles.title}>{t("videos.videoViewer")}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
      </View>
      <Video
        source={{ uri: url }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="contain"
        shouldPlay
        style={styles.video}
        useNativeControls
        onError={(error) => { showErrorToast(t("videos.errorLoadingVideo")); console.log("Video Load Error:", error) }}

      />
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#ff5c5c',
    borderRadius: 5,
    padding: 5,
    width: 26,   
    alignItems: 'center', 
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  video: {
    width: '100%',
    height: 300,
  },
});

export default VideoModal
