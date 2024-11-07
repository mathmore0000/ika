// VideoActionsModal.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet } from "react-native";
import api from "@/server/api";
import LabelSelectionModal from "./LabelSelectionModal";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useTranslation } from 'react-i18next';

const VideoActionsModal = ({ closeModal, video, onActionComplete }) => {
  const { t } = useTranslation();
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [obs, setObs] = useState("");
  const [isLabelModalVisible, setIsLabelModalVisible] = useState(false);
  const [validationError, setValidationError] = useState(false);

  const handleAction = async (isApprove) => {
    if (!selectedLabels.length || obs === "") {
      setValidationError(true);
      return showErrorToast(t("videos.fillAllFields"));
    }

    try {
      const endpoint = `/usages/${video.id}/${isApprove ? "approve" : "reject"}`;
      await api.post(endpoint, { labels: selectedLabels.map(label => label.id), obs });
      showSuccessToast(isApprove ? t("videos.videoApproved") : t("videos.videoRejected"));
      onActionComplete();
      closeModal();
    } catch (error) {
      console.log(error.response.data);
      showErrorToast(t("videos.errorSubmittingAction"));
      console.error("Error submitting action:", error);
    }
  };

  const displaySelectedLabels = selectedLabels.map(label => label.description).join(" ///");

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>{t("videos.reviewVideo")}</Text>
      <Text>{t("videos.videoId")}: {video.id}</Text>

      <Text style={styles.modalLabel}>{t("videos.selectedLabels")}:</Text>
      <TouchableOpacity onPress={() => setIsLabelModalVisible(true)}>
        <Text style={[
          styles.selectLabelsText,
          validationError && selectedLabels.length === 0 && styles.errorBorder,
        ]}>
          {selectedLabels.length > 0
            ? displaySelectedLabels
            : t("videos.chooseLabels")}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={[
          styles.textInput,
          validationError && obs === "" && styles.errorBorder,
        ]}
        placeholder={t("videos.observation")}
        value={obs}
        onChangeText={(text) => {
          setObs(text);
          if (validationError) setValidationError(false);
        }}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => handleAction(true)} style={styles.approveButton}>
          <Text style={styles.buttonText}>{t("videos.approve")}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleAction(false)} style={styles.rejectButton}>
          <Text style={styles.buttonText}>{t("videos.reject")}</Text>
        </TouchableOpacity>
      </View>

      {/* Label Selection Modal */}
      <LabelSelectionModal
        isVisible={isLabelModalVisible}
        closeModal={() => setIsLabelModalVisible(false)}
        onLabelSelect={(selected) => setSelectedLabels(selected)}
        initialSelectedLabels={selectedLabels}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    margin: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },
  selectLabelsText: {
    color: "#4caf50",
    padding: 10,
    borderRadius: 5,
    textAlign: "center",
    backgroundColor: "#ddd",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textInput: {
    width: "100%",
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 10,
  },
  errorBorder: {
    borderColor: "red",
    borderWidth: 1.5,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  approveButton: {
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  rejectButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
  },
});

export default VideoActionsModal;
