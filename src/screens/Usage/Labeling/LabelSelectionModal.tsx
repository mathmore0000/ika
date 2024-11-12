// LabelSelectionModal.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import api from "@/server/api";
import { showErrorToast } from "@/utils/toast";
import { useTranslation } from 'react-i18next';
import Toast from "react-native-toast-message";

const LabelSelectionModal = ({ isVisible, closeModal, onLabelSelect, initialSelectedLabels = [] }) => {
  const { t } = useTranslation();
  const [labels, setLabels] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState(initialSelectedLabels);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    setLoading(true);
    try {
      const response = await api.get("/labels", { params: { size: 200 } });
      setLabels(response.data.content);
    } catch (error) {
      showErrorToast(t("labels.errorLoadingLabels"));
      console.error("Error loading labels:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLabelSelection = (label) => {
    setSelectedLabels((prevSelected) => {
      if (prevSelected.some((item) => item.id === label.id)) {
        return prevSelected.filter((item) => item.id !== label.id);
      } else {
        return [...prevSelected, label];
      }
    });
  };

  const handleSaveSelection = () => {
    onLabelSelect(selectedLabels);
    closeModal();
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.title}>{t("labels.selectLabels")}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={labels}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => toggleLabelSelection(item)}>
                <Text
                  style={[
                    styles.labelItem,
                    selectedLabels.some((selected) => selected.id === item.id) && styles.selectedLabel,
                  ]}
                >
                  {item.description}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        <TouchableOpacity onPress={handleSaveSelection} className="bg-primary" style={styles.saveButton}>
          <Text style={styles.saveButtonText}>{t("labels.saveSelection")}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    marginVertical: 50,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  labelItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    color: "#333",
  },
  selectedLabel: {
    backgroundColor: "#d0e7ff",
    fontWeight: "bold",
  },
  saveButton: {
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  saveButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  cancelButton: {
    padding: 10,
    marginTop: 10,
  },
  cancelButtonText: {
    textAlign: "center",
    color: "#333",
  },
});

export default LabelSelectionModal;
