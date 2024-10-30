// MedicationModal.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Picker, Modal } from "react-native";
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { validateRequiredField } from "@/data/validations/fieldValidation";
import styles from "@/screens/_styles/medications";

const MedicationModal = ({ closeModal, fetchMedications }) => {
  const [medicationId, setMedicationId] = useState("");
  const [customMedication, setCustomMedication] = useState("");
  const [errors, setErrors] = useState({});
  
  // Add additional fields as necessary for custom medication details.
  const handleSave = async () => {
    const validationErrors = {};
    if (!medicationId && !customMedication) validationErrors.medication = "Please select or enter a medication.";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await api.post("/v1/user-medications", {
        idMedication: medicationId || customMedication,
        // include other fields like dosage, timeBetween, etc.
      });
      showSuccessToast("Medication added successfully.");
      fetchMedications();
      closeModal();
    } catch (error) {
      showErrorToast("Error adding medication.");
    }
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>Add Medication</Text>

      <TextInput
        style={[styles.input, errors.medication && styles.inputError]}
        placeholder="Enter new medication name"
        value={customMedication}
        onChangeText={setCustomMedication}
      />
      {errors.medication && <Text style={styles.errorText}>{errors.medication}</Text>}

      <Picker selectedValue={medicationId} onValueChange={setMedicationId}>
        {/* Populate with medication options */}
      </Picker>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MedicationModal;
