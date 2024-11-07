// MedicationCard.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import styles from "@/screens/_styles/medications";
import api from "@/server/api";
import StockModal from "./StockModal";
import EditUserMedicationModal from "../UserMedication/EditUserMedicationModal";
import dayjs from "dayjs";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useTranslation } from 'react-i18next';

const MedicationCard = ({ userMedication, fetchUserMedications }) => {
  const { t } = useTranslation();
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
      showErrorToast(t("medications.errorLoadingStock"));
    }
  };

  const calculateDoseTimes = () => {
    const doseTimes = [];
    let doseTime = dayjs(userMedication.firstDosageTime);
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

      showSuccessToast(
        t("medications.medicationStatusUpdated", {
          status: disabled ? t("medications.activated") : t("medications.deactivated"),
        })
      );
      fetchUserMedications(); // Refresh list
    } catch (error) {
      showErrorToast(t("medications.errorUpdatingMedicationStatus"));
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{userMedication.medication.name}</Text>
      <Text style={styles.dosageInfo}>
        {t("medications.stockAvailable")} -> {stock}
      </Text>
      <Text style={styles.dosageInfo}>
        {t("medications.active")} -> {userMedication.disabled == true ? t("common.false") : t("common.true")}
      </Text>
      <Text style={styles.dosageInfo}>{t("medications.doseTimes")}:</Text>
      {doseTimes.map((time, index) => (
        <Text key={index} style={styles.doseTime}>{time}</Text>
      ))}

      <TouchableOpacity style={styles.stockButton} onPress={() => setIsStockModalVisible(true)}>
        <Text style={styles.stockButtonText}>{t("medications.addStock")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.editButton} onPress={() => setIsEditModalVisible(true)}>
        <Text style={styles.editButtonText}>{t("common.edit")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.statusButton} onPress={toggleMedicationStatus}>
        <Text style={styles.statusButtonText}>
          {userMedication.disabled ? t("medications.activate") : t("medications.deactivate")}
        </Text>
      </TouchableOpacity>

      <Modal visible={isStockModalVisible} transparent={true} animationType="fade">
        <StockModal
          closeModal={() => setIsStockModalVisible(false)}
          fetchStock={fetchStock}
          userMedicationId={userMedication.id}
        />
      </Modal>

      <Modal visible={isEditModalVisible} transparent={true} animationType="fade">
        <EditUserMedicationModal
          closeModal={() => setIsEditModalVisible(false)}
          fetchUserMedications={fetchUserMedications}
          userMedication={userMedication}
        />
      </Modal>
    </View>
  );
};

export default MedicationCard;
