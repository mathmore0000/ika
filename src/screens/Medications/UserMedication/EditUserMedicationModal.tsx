// EditUserMedicationModal.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";
import dayjs from "dayjs";

const EditUserMedicationModal = ({ closeModal, userMedication, fetchUserMedications }) => {
  const [timeBetween, setTimeBetween] = useState(userMedication.timeBetween?.toString() || "8");
  const [maxTakingTime, setMaxTakingTime] = useState(userMedication.maxTakingTime?.toString() || "0.5");
  const [firstDosageTime, setFirstDosageTime] = useState(new Date(userMedication.firstDosageTime));
  const [errors, setErrors] = useState({});
  const [showTimePicker, setShowTimePicker] = useState(false);

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
      await api.put(`/user-medications/${userMedication.medication.id}`, {
        idMedication: userMedication.medication.id,
        quantityInt: userMedication.quantityInt?.toString() || "0",
        quantityMl: userMedication.quantityMl?.toString() || "0",
        timeBetween: parseFloat(timeBetween),
        firstDosageTime: dayjs(firstDosageTime).format("YYYY-MM-DDTHH:mm:ss"),
        maxTakingTime: parseFloat(maxTakingTime),
      });

      showSuccessToast("Medicamento atualizado com sucesso.");
      fetchUserMedications();
      closeModal();
    } catch (error) {
      console.log(error.response.data);
      showErrorToast("Erro ao atualizar medicamento.");
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = dayjs(firstDosageTime)
        .hour(selectedTime.getHours())
        .minute(selectedTime.getMinutes())
        .toDate();
      setFirstDosageTime(newDateTime);
      setErrors((prevErrors) => ({ ...prevErrors, firstDosageTime: undefined }));
    }
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>Editar Medicamento do Usuário</Text>
      <Text style={styles.subTitle}>{userMedication.medication.name}</Text>

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
      </Picker>
      {errors.timeBetween && <Text style={styles.errorText}>{errors.timeBetween}</Text>}

      <TouchableOpacity onPress={() => setShowTimePicker(true)}>
        <Text style={[styles.datePickerText, errors.firstDosageTime && styles.inputError]}>
          Primeira Dose: {dayjs(firstDosageTime).format("HH:mm")}
        </Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={firstDosageTime}
          mode="time"
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

export default EditUserMedicationModal;