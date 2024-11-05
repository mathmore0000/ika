// MedicationCard.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import styles from "@/screens/_styles/medications";
import api from "@/server/api";
import StockModal from "./StockModal"
import EditUserMedicationModal from "../UserMedication/EditUserMedicationModal";
import dayjs from "dayjs";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

const MedicationCard = ({ userMedication, fetchUserMedications }) => {
  const [stock, setStock] = useState([]);
  const [isStockModalVisible, setIsStockModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const fetchStock = async () => {
    try {
      const response = await api.get(`/user-medication-stocks/allStock/${userMedication.medication.id}`, {
        params: { page: 0, size: 10 },
      });
      setStock(response.data.availableQuantity);
    } catch (error) {
      showErrorToast("Error loading stock.");
    }
  };

  const calculateDoseTimes = () => {
    const doseTimes = [];
    let doseTime = dayjs(userMedication.firstDosageTime);
    console.log()
    const initialDoseTimePlus1 = doseTime.add(1, "day");
    const interval = userMedication.timeBetween;

    do {
      doseTimes.push(doseTime.format("HH:mm"));
      doseTime = doseTime.add(interval, "hour");
    } while (!doseTime.isSame(initialDoseTimePlus1, "minute"));

    return doseTimes.sort();
  };

  const doseTimes = calculateDoseTimes();

  const toggleMedicationStatus = async () => {
    try {
      const disabled = !userMedication.disabled;
      await api.patch(`/user-medications/${userMedication.medication.id}/status?disabled=${disabled}`);

      showSuccessToast(`Medicamento ${disabled ? "ativado" : "inativado"} com sucesso.`);
      fetchUserMedications(); // Refresh list
    } catch (error) {
      showErrorToast("Erro ao atualizar status do medicamento.");
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{userMedication.medication.name}</Text>
      <Text style={styles.dosageInfo}>Estoque disponível -> {stock}</Text>
      <Text style={styles.dosageInfo}>Ativo -> {userMedication.disabled == true ? "false" : "true"}</Text>
      <Text style={styles.dosageInfo}>Horários das doses:</Text>
      {doseTimes.map((time, index) => (
        <Text key={index} style={styles.doseTime}>{time}</Text>
      ))}

      <TouchableOpacity style={styles.stockButton} onPress={() => setIsStockModalVisible(true)}>
        <Text style={styles.stockButtonText}>Add Stock</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.editButton} onPress={() => setIsEditModalVisible(true)}>
        <Text style={styles.editButtonText}>Editar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.statusButton} onPress={toggleMedicationStatus}>
        <Text style={styles.statusButtonText}>{userMedication.disabled ? "Ativar" : "Inativar"}</Text>
      </TouchableOpacity>

      <Modal visible={isStockModalVisible} transparent={true} animationType="fade">
        <StockModal closeModal={() => setIsStockModalVisible(false)} fetchStock={fetchStock} userMedicationId={userMedication.id} />
      </Modal>

      <Modal visible={isEditModalVisible} transparent={true} animationType="fade">
        <EditUserMedicationModal
          closeModal={() => setIsEditModalVisible(false)}
          fetchUserMedications={fetchUserMedications}
          userMedication={userMedication} // Passa o userMedication atual para edição
        />
      </Modal>
    </View>
  );
};

export default MedicationCard;
