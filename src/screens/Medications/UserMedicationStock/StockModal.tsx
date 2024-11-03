import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";

const StockModal = ({ closeModal, userMedicationId, fetchStock }) => {
  const [quantityStocked, setQuantityStocked] = useState("");
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSaveStock = async () => {
    const newErrors = {};
    if (!quantityStocked) newErrors.quantityStocked = "Stock quantity is required.";
    if (!expirationDate) newErrors.expirationDate = "Expiration date is required.";

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
      showSuccessToast("Stock added successfully.");
      fetchStock(userMedicationId);
      closeModal(); // Notifica o fechamento bem-sucedido
    } catch (error) {
      showErrorToast("Error adding stock.");
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
      <Text style={styles.title}>Add Stock</Text>

      <TextInput
        style={[styles.input, errors.quantityStocked && styles.inputError]}
        placeholder="Quantity"
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
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StockModal;
