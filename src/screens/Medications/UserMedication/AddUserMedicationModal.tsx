// AddUserMedicationModal.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";
import dayjs from "dayjs"; // For date formatting

const AddUserMedicationModal = ({ closeModal, selectedMedication, onUserMedicationCreated, closeMedicationSelectionModal }) => {
  const [quantityInt, setQuantityInt] = useState(selectedMedication.quantityInt ? selectedMedication.quantityInt.toString() : "0");
  const [quantityMl, setQuantityMl] = useState(selectedMedication.quantityMl ? selectedMedication.quantityMl.toString() : "0");
  const [timeBetween, setTimeBetween] = useState("8"); // Default to 8 hours
  const [maxTakingTime, setMaxTakingTime] = useState("0.5"); // Default to 30 minutes
  const [firstDosageTime, setFirstDosageTime] = useState(new Date()); // Stores full datetime
  const [errors, setErrors] = useState({});
  const [showTimePicker, setShowTimePicker] = useState(false); // Controls time picker visibility

  const handleSave = async () => {
    const validationErrors = {};
    if (!timeBetween) validationErrors.timeBetween = "Tempo entre doses é obrigatório.";
    if (!firstDosageTime) validationErrors.firstDosageTime = "Horário da primeira dose é obrigatório.";
    if (!maxTakingTime) validationErrors.maxTakingTime = "Tempo máximo de validação é obrigatório.";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await api.post("/user-medications", {
        idMedication: selectedMedication.id,
        quantityInt: quantityInt,
        quantityMl: quantityMl,
        timeBetween: parseFloat(timeBetween),
        firstDosageTime: dayjs(firstDosageTime).format("YYYY-MM-DDTHH:mm:ss"),
        maxTakingTime: parseFloat(maxTakingTime),
      });

      showSuccessToast("Medicamento adicionado com sucesso.");
      onUserMedicationCreated();
      closeMedicationSelectionModal();
      closeModal();
    } catch (error) {
      console.log(error.response.data)
      showErrorToast("Erro ao adicionar medicamento ao usuário.");
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = dayjs(firstDosageTime) // Get current date
        .hour(selectedTime.getHours()) // Set hours
        .minute(selectedTime.getMinutes()) // Set minutes
        .toDate();
      setFirstDosageTime(newDateTime);
      setErrors((prevErrors) => ({ ...prevErrors, firstDosageTime: undefined }));
    }
  };

  const handleQuantityIntChange = (value) => {
    setQuantityInt(value);
    setQuantityMl("0"); // Reset quantityMl to 0 when quantityInt is set
  };

  const handleQuantityMlChange = (value) => {
    setQuantityMl(value);
    setQuantityInt("0"); // Reset quantityInt to 0 when quantityMl is set
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>Adicionar Medicamento ao Usuário</Text>
      <Text style={styles.subTitle}>{selectedMedication.name}</Text>

      <TextInput
        style={[styles.input, errors.quantityInt && styles.inputError]}
        placeholder="Quantidade de pilulas"
        keyboardType="numeric"
        value={quantityInt}
        onChangeText={handleQuantityIntChange}
        editable={quantityMl === "0" || quantityMl === ""} // Disable if quantityMl is not zero
      />
      {errors.quantityInt && <Text style={styles.errorText}>{errors.quantityInt}</Text>}

      <TextInput
        style={[styles.input, errors.quantityMl && styles.inputError]}
        placeholder="Quantidade de Ml"
        keyboardType="numeric"
        value={quantityMl}
        onChangeText={handleQuantityMlChange}
        editable={quantityInt === "0" || quantityInt === ""} // Disable if quantityInt is not zero
      />
      {errors.quantityMl && <Text style={styles.errorText}>{errors.quantityMl}</Text>}

      <Text style={styles.label}>Tempo entre doses: {timeBetween} horas</Text>
      <Picker
        selectedValue={timeBetween}
        onValueChange={(itemValue) => setTimeBetween(itemValue)}
        style={[styles.picker, errors.timeBetween && styles.inputError]}
      >
        <Picker.Item label="4 horas" value="4" />
        <Picker.Item label="6 horas" value="6" />
        <Picker.Item label="8 horas" value="8" />
        <Picker.Item label="12 horas" value="12" />
        <Picker.Item label="24 horas" value="24" />
        <Picker.Item label="48 horas" value="48" />
      </Picker>
      {errors.timeBetween && <Text style={styles.errorText}>{errors.timeBetween}</Text>}

      <TouchableOpacity onPress={() => setShowTimePicker(true)}>
        <Text style={[styles.datePickerText, errors.firstDosageTime && styles.inputError]}>
          Primeira Dose: {dayjs(firstDosageTime).format("HH:mm")}
        </Text>
      </TouchableOpacity>
      {errors.firstDosageTime && <Text style={styles.errorText}>{errors.firstDosageTime}</Text>}

      {showTimePicker && (
        <DateTimePicker
          value={firstDosageTime}
          mode="time" // Show only time picker
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <Text style={styles.label}>Tempo Máximo de Tomação: {maxTakingTime} hora(s)</Text>
      <Picker
        selectedValue={maxTakingTime}
        onValueChange={(itemValue) => setMaxTakingTime(itemValue)}
        style={[styles.picker, errors.maxTakingTime && styles.inputError]}
      >
        <Picker.Item label="0.5 hora (30 minutos)" value="0.5" />
        <Picker.Item label="1 hora" value="1" />
      </Picker>
      {errors.maxTakingTime && <Text style={styles.errorText}>{errors.maxTakingTime}</Text>}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddUserMedicationModal;
