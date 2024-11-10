// TakeMedicationModal.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "@/server/api";
import SelectStockModal from "./SelectStockModal"; // Import the new modal component
import styles from "@/screens/_styles/medications";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useTranslation } from "react-i18next";

const TakeMedicationModal = ({ isVisible, closeModal, dose, handleMedicationTaken }) => {
  const { t } = useTranslation();

  const [stocks, setStocks] = useState([]);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [video, setVideo] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSelectStockModalVisible, setIsSelectStockModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // Adicionado

  const onRefresh = () => { // Adicionado
    setRefreshing(true);
    resetStocks();
    fetchStocks(0).finally(() => setRefreshing(false));
  };

  // Fetch medication stocks with pagination
  useEffect(() => {
    if (isVisible) {
      resetStocks();
      fetchStocks(0); // Fetch initial stocks
    }
  }, [isVisible]);

  const resetStocks = () => {
    setStocks([]);
    setCurrentPage(0);
    setTotalPages(1);
  };

  const fetchStocks = async (page = currentPage, size = 10) => {
    if (loading || page >= totalPages) return;

    setLoading(true);
    try {
      const response = await api.get(`/user-medication-stocks/valid/${dose.medication.id}`, { params: { page, size } });
      setStocks((prevStocks) => [...prevStocks, ...response.data.content]);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error(t("medications.errorLoadingStocks"), error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = (stock, quantity) => {
    setStocks((prevStocks) =>
      prevStocks.map((s) =>
        s.id === stock.id ? { ...s, quantityStocked: s.quantityStocked - quantity } : s
      )
    );
    setSelectedStocks((prev) => [...prev, { stock, quantity: parseFloat(quantity) }]);
  };

  const handleRemoveStock = (index) => {
    const removedStock = selectedStocks[index];
    setStocks((prevStocks) =>
      prevStocks.map((s) =>
        s.id === removedStock.stock.id ? { ...s, quantityStocked: s.quantityStocked + removedStock.quantity } : s
      )
    );
    setSelectedStocks((prev) => prev.filter((_, i) => i !== index));
  };

  const pickVideoFromCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos });
    if (!result.cancelled) setVideo(result.uri);
  };

  const pickVideoFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos });
    if (!result.canceled) setVideo(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!selectedStocks.length || !video) {
      showErrorToast(t("medications.selectStockAndVideo"));
      return;
    }

    const usageRequest = {
      actionTmstamp: new Date().toISOString(),
      medications: selectedStocks.map(({ stock, quantity }) => ({
        medicationStockId: stock.id,
        quantityInt: quantity ? parseInt(quantity) : null,
        quantityMl: quantity ? parseFloat(quantity) : null,
      })),
    };

    const formData = new FormData();

    // Append the video file
    formData.append("file", {
      uri: video,
      name: "medication_video.mp4",
      type: "video/mp4",
    });

    formData.append("usageRequest", {
      string: JSON.stringify(usageRequest),
      type: "application/json",
    });

    try {
      // Send the form data through the api instance with the correct headers
      await api.post("/usages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });
      showSuccessToast(t("medications.usageRegisteredSuccess"));
      setVideo(null);
      setSelectedStocks([]);
      closeModal();
      handleMedicationTaken(
        dose.medication.id,
        dose.datetime);
    } catch (error) {
      console.error(t("medications.errorRegisteringUsage"), error?.response?.data);
      showErrorToast(t("medications.errorRegisteringUsage"));
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.title}>{t("medications.takeMedication")}</Text>

        <FlatList
          data={selectedStocks}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.stockItem}>
              <Text>
                {t("medications.stockExpiresIn", { date: item.stock.expirationDate })},{" "}
                {t("medications.quantity")}: {item.quantity}
              </Text>
              <TouchableOpacity onPress={() => handleRemoveStock(index)}>
                <Text style={styles.removeText}>{t("common.remove")}</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <TouchableOpacity onPress={() => setIsSelectStockModalVisible(true)}>
          <Text style={styles.addButtonText}>{t("medications.selectStock")}</Text>
        </TouchableOpacity>

        {/* Buttons for selecting video source */}
        <TouchableOpacity onPress={pickVideoFromCamera}>
          <Text style={styles.addButtonText}>{t("medications.recordVideo")}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={pickVideoFromGallery}>
          <Text style={styles.addButtonText}>{t("medications.chooseVideoFromGallery")}</Text>
        </TouchableOpacity>

        {video && <Text>{t("medications.videoSelected")}</Text>}

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>{t("common.save")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
          <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
        </TouchableOpacity>

        <SelectStockModal
          isVisible={isSelectStockModalVisible}
          closeModal={() => setIsSelectStockModalVisible(false)}
          stocks={stocks}
          onAddStock={handleAddStock}
          fetchStocks={fetchStocks}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          loading={loading}
          refreshing={refreshing} // Adicionado
          onRefresh={onRefresh} // Adicionado
        />
      </View>
    </Modal>
  );
};

export default TakeMedicationModal;
