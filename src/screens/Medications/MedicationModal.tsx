import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import RNPickerSelect from "react-native-picker-select/src/index.js";
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { validateRequiredField } from "@/data/validations/fieldValidation";
import styles from "@/screens/_styles/medications";

const MedicationModal = ({ closeModal, fetchMedications }) => {
  const [medicationId, setMedicationId] = useState("");
  const [customMedication, setCustomMedication] = useState("");
  const [errors, setErrors] = useState({});
  const [medications, setMedications] = useState([]); // Assume you fetch these from an API

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
        // Include other fields like dosage, timeBetween, etc.
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

      {/* <RNPickerSelect
        onValueChange={(value) => setMedicationId(value)}
        items={medications.map(med => ({ label: med.name, value: med.id }))}
        placeholder={{ label: "Select a medication", value: null }}
        style={{
          inputIOS: styles.picker,
          inputAndroid: styles.picker,
        }}
        value={medicationId}
      /> */}

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
