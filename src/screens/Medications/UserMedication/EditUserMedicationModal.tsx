// EditUserMedicationModal.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";
import { useTranslation } from "react-i18next";

const EditUserMedicationModal = ({ closeModal, userMedication, fetchUserMedications }) => {
  const { t } = useTranslation();
  const [timeBetween, setTimeBetween] = useState(userMedication.timeBetween?.toString() || "8");
  const [maxTakingTime, setMaxTakingTime] = useState(userMedication.maxTakingTime?.toString() || "0.5");
  const [firstDosageTime, setFirstDosageTime] = useState(new Date(userMedication.firstDosageTime));
  const [errors, setErrors] = useState({});
  const [showTimePicker, setShowTimePicker] = useState(false);

  const padZero = (num) => num.toString().padStart(2, '0');
  const formatTime = (date) => {
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());
    return `${hours}:${minutes}`;
  };

  const handleSave = async () => {
    const validationErrors = {};
    if (!timeBetween) validationErrors.timeBetween = t("medications.validationErrors.timeBetweenRequired");
    if (!firstDosageTime) validationErrors.firstDosageTime = t("medications.validationErrors.firstDosageTimeRequired");
    if (!maxTakingTime) validationErrors.maxTakingTime = t("medications.validationErrors.maxTakingTimeRequired");

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const firstDosageTimeISO = firstDosageTime.toISOString();
      await api.put(`/user-medications/${userMedication.medication.id}`, {
        idMedication: userMedication.medication.id,
        quantityInt: userMedication.quantityInt?.toString() || "0",
        quantityMl: userMedication.quantityMl?.toString() || "0",
        timeBetween: parseFloat(timeBetween),
        firstDosageTime: firstDosageTimeISO,
        maxTakingTime: parseFloat(maxTakingTime),
      });

      showSuccessToast(t("medications.medicationUpdated"));
      fetchUserMedications();
      closeModal();
    } catch (error) {
      console.log(error.response.data);
      showErrorToast(t("medications.errorUpdatingMedication"));
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = new Date(firstDosageTime);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      newDateTime.setSeconds(0);
      newDateTime.setMilliseconds(0);
      setFirstDosageTime(newDateTime);
      setErrors((prevErrors) => ({ ...prevErrors, firstDosageTime: undefined }));
    }
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>{t("medications.editUserMedication")}</Text>
      <Text style={styles.subTitle}>{userMedication.medication.name}</Text>

      <Text style={styles.label}>{t("medications.timeBetweenDoses", { hours: timeBetween })}</Text>
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
          {t("medications.firstDose")}: {formatTime(firstDosageTime)}
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

      <Text style={styles.label}>{t("medications.maxTakingTime", { time: maxTakingTime })}</Text>
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
        <Text style={styles.saveButtonText}>{t("common.save")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
        <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditUserMedicationModal;
