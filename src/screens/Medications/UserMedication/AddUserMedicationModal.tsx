// AddUserMedicationModal.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";
import { convertDateToLocalTimezone } from "@/utils/date";
import { useTranslation } from "react-i18next";

const AddUserMedicationModal = ({
  closeModal,
  selectedMedication,
  onUserMedicationCreated,
  closeMedicationSelectionModal,
}) => {
  const { t } = useTranslation();
  const [quantityInt, setQuantityInt] = useState(
    selectedMedication.quantityInt ? selectedMedication.quantityInt.toString() : "0"
  );
  const [quantityMl, setQuantityMl] = useState(
    selectedMedication.quantityMl ? selectedMedication.quantityMl.toString() : "0"
  );
  const [timeBetween, setTimeBetween] = useState("8");
  const [maxTakingTime, setMaxTakingTime] = useState("0.5");
  const [firstDosageTime, setFirstDosageTime] = useState(new Date());
  const [errors, setErrors] = useState({});
  const [showTimePicker, setShowTimePicker] = useState(false);

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
      await api.post("/user-medications", {
        idMedication: selectedMedication.id,
        quantityInt: quantityInt,
        quantityMl: quantityMl,
        timeBetween: parseFloat(timeBetween),
        firstDosageTime: firstDosageTimeISO,
        maxTakingTime: parseFloat(maxTakingTime),
      });

      showSuccessToast(t("medications.medicationAddedToUserSuccess"));
      onUserMedicationCreated();
      closeMedicationSelectionModal();
      closeModal();
    } catch (error) {
      console.log(error.response.data);
      showErrorToast(t("medications.errorAddingMedicationToUser"));
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const updatedFirstDosageTime = new Date(firstDosageTime);
      updatedFirstDosageTime.setHours(selectedTime.getHours());
      updatedFirstDosageTime.setMinutes(selectedTime.getMinutes());
      updatedFirstDosageTime.setSeconds(0);
      updatedFirstDosageTime.setMilliseconds(0);

      setFirstDosageTime(updatedFirstDosageTime);
      setErrors((prevErrors) => ({ ...prevErrors, firstDosageTime: undefined }));
    }
  };

  const handleQuantityIntChange = (value) => {
    setQuantityInt(value);
    setQuantityMl("0");
  };

  const handleQuantityMlChange = (value) => {
    setQuantityMl(value);
    setQuantityInt("0");
  };

  const formatTimeForDisplay = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>{t("medications.addToInventory")}</Text>
      <Text style={styles.subTitle}>{selectedMedication.name}</Text>

      <TextInput
        style={[styles.input, errors.quantityInt && styles.inputError]}
        placeholder={t("medications.quantityPills")}
        keyboardType="numeric"
        value={quantityInt}
        onChangeText={handleQuantityIntChange}
        editable={quantityMl === "0" || quantityMl === ""}
      />
      {errors.quantityInt && <Text style={styles.errorText}>{errors.quantityInt}</Text>}

      <TextInput
        style={[styles.input, errors.quantityMl && styles.inputError]}
        placeholder={t("medications.quantityMl")}
        keyboardType="numeric"
        value={quantityMl}
        onChangeText={handleQuantityMlChange}
        editable={quantityInt === "0" || quantityInt === ""}
      />
      {errors.quantityMl && <Text style={styles.errorText}>{errors.quantityMl}</Text>}

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
          {t("medications.firstDose")}: {formatTimeForDisplay(firstDosageTime)}
        </Text>
      </TouchableOpacity>
      {errors.firstDosageTime && <Text style={styles.errorText}>{errors.firstDosageTime}</Text>}

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

export default AddUserMedicationModal;
