// MedicationCard.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, Switch, Dimensions } from "react-native";
import styles from "@/screens/_styles/medications";
import api from "@/server/api";
import StockModal from "./StockModal";
import EditUserMedicationModal from "../UserMedication/EditUserMedicationModal";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useTranslation } from 'react-i18next';
import Toast from "react-native-toast-message";

const MedicationCard = ({ userMedication, onUserMedicationEdited, calculateDoseTimes }) => {
  const { t } = useTranslation();
  const [stock, setStock] = useState([]);
  const [isStockModalVisible, setIsStockModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const { width, height } = Dimensions.get("screen")

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

  const doseTimes = calculateDoseTimes(userMedication);

  const toggleMedicationStatus = async () => {
    try {
      const disabled = !userMedication.disabled;
      await api.patch(`/user-medications/${userMedication.medication.id}/status?disabled=${disabled}`);

      showSuccessToast(
        t("medications.medicationStatusUpdated", {
          status: disabled ? t("medications.activated") : t("medications.deactivated"),
        })
      );
      console.log(disabled ? "desabilitado" : "habilitado")
      onUserMedicationEdited({ ...userMedication, disabled }); // Refresh list
    } catch (error) {
      showErrorToast(t("medications.errorUpdatingMedicationStatus"));
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  return (
    <View className="flex-1 flex flex-col gap-4 py-3">
      <View className="flex flex-col bg-white shadow-black rounded-lg border border-gray-300">
        <View className="flex flex-row justify-between items-center h-14 bg-primary p-4 rounded-t-lg">
          <Text className="font-bold text-lg text-white">{userMedication.medication.name} - {userMedication.disabled ? "true" : "false"}</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={!userMedication.disabled ? '#f4f3f4' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleMedicationStatus}
            value={!userMedication.disabled}
          />
        </View>
        <View className="p-4 flex flex-col gap-2">
          <View className="flex flex-row">
            <Text className="font-semibold mr-2">{t("medications.doseTimes")}</Text>
            {doseTimes.map((time, index) => (
              <Text key={index} style={styles.doseTime}> {index != 0 && "|"} {time}</Text>
            ))}
          </View>
          <Text style={styles.dosageInfo}>
            {t("medications.stockAvailable")}: {stock}
          </Text>

          <View className="flex flex-row gap-2 justify-between">
            <TouchableOpacity style={styles.stockButton} onPress={() => setIsStockModalVisible(true)}>
              <Text style={styles.stockButtonText}>{t("medications.addStock")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditModalVisible(true)}>
              <Text style={styles.editButtonText}>{t("common.edit")}</Text>
            </TouchableOpacity>
          </View>
          <Modal visible={isStockModalVisible} transparent={true} animationType="fade">
            <View className="flex-1 bg-[rgba(0,0,0,0.5)] flex justify-center items-center">
              <View className="w-4/5 p-5 bg-white rounded-xl">
                <StockModal
                  closeModal={() => setIsStockModalVisible(false)}
                  fetchStock={fetchStock}
                  userMedicationId={userMedication.id}
                />
              </View>
            </View>
            <Toast />
          </Modal>

          <Modal visible={isEditModalVisible} transparent={true} animationType="fade">
            <View className="flex-1 bg-[rgba(0,0,0,0.5)] flex justify-center items-center">
              <View className="w-4/5 p-5 bg-white rounded-xl">
                <EditUserMedicationModal
                  closeModal={() => setIsEditModalVisible(false)}
                  onUserMedicationEdited={onUserMedicationEdited}
                  userMedication={userMedication}
                />
                <Toast />
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </View>
  );
};

export default MedicationCard;
