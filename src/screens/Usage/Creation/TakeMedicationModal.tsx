// TakeMedicationModal.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "@/server/api";
import SelectStockModal from "./SelectStockModal"; // Import the new modal component
import styles from "@/screens/_styles/medications";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { cancelMedicationRemindersForNextHour } from "@/utils/alarm"
import IconM from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/AntDesign';
import { getDateAndHour } from "@/utils/date";

const minutesTimeBetweenRelation = { 0.5: 30, 1: 60 };
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
      showErrorToast(t("user.userReportError"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = (stock, quantity) => {
    setStocks((prevStocks) =>
      prevStocks.map((s) =>
        s.id === stock.id ? { ...s, availableQuantity: s.availableQuantity - quantity } : s
      )
    );
    setSelectedStocks((prev) => [...prev, { stock, quantity: parseFloat(quantity) }]);
  };

  const handleRemoveStock = (index) => {
    const removedStock = selectedStocks[index];
    setStocks((prevStocks) =>
      prevStocks.map((s) =>
        s.id === removedStock.stock.id ? { ...s, availableQuantity: s.availableQuantity + removedStock.quantity } : s
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
      const doseTimeSplit = dose.time.split(":")
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
      cancelMedicationRemindersForNextHour(dose.medication.id, Number(doseTimeSplit[0]), Number(doseTimeSplit[1].split(" ")[0]), `Hora de tomar ${dose.medication.name}`, minutesTimeBetweenRelation[dose.maxTakingTime])
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
      <View className="flex-1 bg-[rgba(0,0,0,0.5)] flex justify-center items-center">
        <View className="w-4/5 p-5 gap-3 bg-white rounded-xl">
          <View className="flex flex-row items-center justify-between">
            <Text className="font-bold text-xl">{t('medications.takeMedication')}</Text>
            <Icon name="close" size={20} onPress={closeModal} />
          </View>
          <View className="flex flex-col gap-2 mt-4">

            {/* Buttons for selecting video source */}            
            <TouchableOpacity className="button-icon bg-primary" onPress={pickVideoFromGallery}>
              <IconM name="camera-burst" color="#fff" size={20} />
              <Text className="text-white font-semibold">{t("medications.chooseVideoFromGallery")}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="button-icon bg-primary" onPress={pickVideoFromCamera}>
              <IconM name="camera-outline" color="#fff" size={20} />
              <Text className="text-white font-semibold">{t("medications.recordVideo")}</Text>
            </TouchableOpacity>
            {video && <Text className="text-primary font-bold text-center">{t("medications.videoSelected")}</Text>}

            <TouchableOpacity className="button-icon border border-primary mt-4" onPress={() => setIsSelectStockModalVisible(true)}>
              <IconM name="menu" color="#23527c" size={20} />
              <Text className="text-primary font-semibold">{t("medications.selectStock")}</Text>
            </TouchableOpacity>

          </View>

          <FlatList
            data={selectedStocks}
            ListHeaderComponent={
              selectedStocks.length > 0 ? (
                <View className="flex flex-row justify-between my-2">
                  <Text className="font-bold">{t("medications.expirationDate")}</Text>
                  <Text className="font-bold">{t("medications.quantity")}</Text>
                  <Text className="font-bold">{t("common.remove")}</Text>
                </View>
              ) : null
            }
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View className="p-2 border mb-2 border-slate-200 rounded-md bg-slate-100 flex flex-row justify-between">
                <Text>{getDateAndHour(new Date(item.stock.expirationDate)).split(",")[0]}</Text>
                <Text>{item.quantity}</Text>
                <TouchableOpacity onPress={() => handleRemoveStock(index)}>
                  <IconM name="trash-can-outline" color="red" size={20} />
                </TouchableOpacity>
              </View>
            )}
          />

          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>{t("common.save")}</Text>
          </TouchableOpacity>
        </View>
      </View>



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
      <Toast />
    </Modal>
  );
};

export default TakeMedicationModal;
