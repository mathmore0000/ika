// StockModal.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";
import { useTranslation } from 'react-i18next';

const StockModal = ({ closeModal, userMedicationId, fetchStock }) => {
  const { t } = useTranslation();
  const [quantityStocked, setQuantityStocked] = useState("");
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSaveStock = async () => {
    const newErrors = {};
    if (!quantityStocked) newErrors.quantityStocked = t("medications.validationErrors.stockQuantityRequired");
    if (!expirationDate) newErrors.expirationDate = t("medications.validationErrors.expirationDateRequired");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await api.post("/user-medication-stocks", {
        userMedicationId: userMedicationId,
        quantityStocked: parseInt(quantityStocked),
        expirationDate: expirationDate.toISOString(),
      });
      showSuccessToast(t("medications.stockAddedSuccessfully"));
      fetchStock(userMedicationId);
      closeModal();
    } catch (error) {
      showErrorToast(t("medications.errorAddingStock"));
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExpirationDate(selectedDate);
      setErrors((prevErrors) => ({ ...prevErrors, expirationDate: undefined }));
    }
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>{t("medications.addStock")}</Text>

      <TextInput
        style={[styles.input, errors.quantityStocked && styles.inputError]}
        placeholder={t("medications.quantity")}
        keyboardType="numeric"
        value={quantityStocked}
        onChangeText={setQuantityStocked}
      />
      {errors.quantityStocked && <Text style={styles.errorText}>{errors.quantityStocked}</Text>}

      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text style={[styles.datePickerText, errors.expirationDate && styles.inputError]}>
          {expirationDate.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      {errors.expirationDate && <Text style={styles.errorText}>{errors.expirationDate}</Text>}

      {showDatePicker && (
        <DateTimePicker
          value={expirationDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveStock}>
        <Text style={styles.saveButtonText}>{t("common.save")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
        <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StockModal;
