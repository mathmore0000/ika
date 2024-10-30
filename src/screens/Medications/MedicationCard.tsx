// MedicationCard.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import styles from "@/screens/_styles/medications";
import api from "@/server/api";
import StockModal from "./StockModal";
import dayjs from "dayjs"; // Biblioteca para manipulação de datas
import { showErrorToast } from "@/utils/toast";

const MedicationCard = ({ userMedication, fetchMedications }) => {
  const [stock, setStock] = useState([]);
  const [isStockModalVisible, setIsStockModalVisible] = useState(false);

  // 
  const fetchStock = async (id: String) => {
    try {
      const response = await api.get(`/user-medication-stocks/allStock/${id}`, {
        params: { page: 0, size: 10 },
      });
      setStock(response.data.availableQuantity);
    } catch (error) {
      showErrorToast("Error loading medications.");
    }
  };

  // Calcular horários de doses com base em firstDosageTime e timeBetween
  const calculateDoseTimes = () => {
    const doseTimes = [];
    let doseTime = dayjs(userMedication.firstDosageTime);
    const initialDoseTimePlus1 = doseTime.add(1, "day");
    const interval = userMedication.timeBetween;

    do {
      doseTimes.push(doseTime.format("HH:mm")); // Formata a hora para "HH:mm"
      doseTime = doseTime.add(interval, "hour"); // Incrementa pelo intervalo
    } while (!doseTime.isSame(initialDoseTimePlus1, "minute")); // Continua até o horário inicial

    return doseTimes.sort();
  };

  const doseTimes = calculateDoseTimes();

  const openStockModal = () => setIsStockModalVisible(true);
  const closeStockModal = () => setIsStockModalVisible(false);

  useEffect(() => {
    fetchStock(userMedication.medication.id);
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{userMedication.medication.name}</Text>
      <Text style={styles.dosageInfo}>Estoque disponível -> {stock}</Text>
      <Text style={styles.dosageInfo}>Horários das doses:</Text>
      {doseTimes.map((time, index) => (
        <Text key={index} style={styles.doseTime}>{time}</Text>
      ))}
      <TouchableOpacity style={styles.stockButton} onPress={openStockModal}>
        <Text style={styles.stockButtonText}>Add Stock</Text>
      </TouchableOpacity>

      <Modal visible={isStockModalVisible} transparent={true} animationType="fade">
        <StockModal closeModal={closeStockModal} userMedicationId={userMedication.id} />
      </Modal>
    </View>
  );
};

export default MedicationCard;
