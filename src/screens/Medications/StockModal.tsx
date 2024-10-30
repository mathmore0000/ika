// StockModal.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, DatePickerAndroid } from "react-native";
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";

const StockModal = ({ closeModal, userMedicationId }) => {
  const [quantityStocked, setQuantityStocked] = useState("");
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [errors, setErrors] = useState({});

  const handleSaveStock = async () => {
    const newErrors = {};
    if (!quantityStocked) newErrors.quantityStocked = "Stock quantity is required.";
    if (!expirationDate) newErrors.expirationDate = "Expiration date is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await api.post("/v1/user-medication-stocks", {
        userMedicationId: userMedicationId,
        quantityStocked,
        expirationDate,
      });
      showSuccessToast("Stock added successfully.");
      closeModal();
    } catch (error) {
      showErrorToast("Error adding stock.");
    }
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>Add Stock</Text>

      <TextInput
        style={[styles.input, errors.quantityStocked && styles.inputError]}
        placeholder="Quantity"
        value={quantityStocked}
        onChangeText={setQuantityStocked}
      />
      {errors.quantityStocked && <Text style={styles.errorText}>{errors.quantityStocked}</Text>}

      <TouchableOpacity onPress={() => DatePickerAndroid.open({ date: expirationDate })}>
        <Text style={styles.datePickerText}>{expirationDate.toLocaleDateString()}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveStock}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StockModal;
