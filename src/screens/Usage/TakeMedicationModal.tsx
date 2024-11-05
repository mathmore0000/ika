// TakeMedicationModal.js
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import api from "@/server/api";
import styles from "@/screens/_styles/medications";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

const TakeMedicationModal = ({ isVisible, closeModal, medicationId, fetchUserMedications }) => {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [video, setVideo] = useState(null);

  // Fetch medication stocks
  useEffect(() => {
    if (isVisible) fetchStocks();
  }, [isVisible]);

  const fetchStocks = async () => {
    try {
      const response = await api.get(`/user-medication-stocks/${medicationId}`, {
        params: { page: 0, size: 10 },
      });
      console.log(response.data)
      setStocks(response.data.content);
    } catch (error) {
      console.error("Erro ao carregar estoques:", error);
    }
  };

  const handleStockChange = (stock) => {
    setSelectedStock(stock);
    setQuantity(""); // Reset quantity if stock changes
  };

  const handleQuantityChange = (value) => setQuantity(value);

  // Open camera to record video
  const pickVideo = async () => {
    let result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos });
    if (!result.cancelled) setVideo(result.uri);
  };

  const handleSave = async () => {
    if (!selectedStock || !quantity || !video) {
      showErrorToast("Preencha todas as informações e grave o vídeo.");
      return;
    }

    const usageRequest = {
      actionTmstamp: new Date().toISOString(), // Current timestamp
      medications: [
        {
          medicationStockId: selectedStock.id,
          quantityInt: selectedStock.quantityInt ? parseInt(quantity) : null,
          quantityMl: selectedStock.quantityMl ? parseFloat(quantity) : null,
        },
      ],
    };

    const formData = new FormData();
    formData.append("file", {
      uri: video,
      name: "medication_video.mp4",
      type: "video/mp4",
    });
    formData.append("usageRequest", JSON.stringify(usageRequest));

    try {
      await api.post("/usages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showSuccessToast("Uso registrado com sucesso.");
      fetchUserMedications(); // Refresh medications after saving
      closeModal();
    } catch (error) {
      console.error("Erro ao registrar uso:", error);
      showErrorToast("Erro ao registrar uso.");
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Tomar Medicamento</Text>

        {/* Stock Selection */}
        <Picker selectedValue={selectedStock} onValueChange={(itemValue) => handleStockChange(itemValue)}>
          <Picker.Item label="Selecione um estoque" value={null} />
          {stocks.map((stock) => (
            <Picker.Item key={stock.id} label={`Estoque - Expira: ${stock.expirationDate}`} value={stock} />
          ))}
        </Picker>

        {/* Quantity Input */}
        {selectedStock && (
          <TextInput
            style={styles.input}
            placeholder={`Quantidade (${selectedStock.quantityMl ? "ml" : "unidades"})`}
            keyboardType="numeric"
            value={quantity}
            onChangeText={handleQuantityChange}
          />
        )}

        {/* Video Recording */}
        <TouchableOpacity onPress={pickVideo}>
          <Text style={styles.buttonText}>{video ? "Vídeo gravado" : "Gravar Vídeo"}</Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default TakeMedicationModal;
