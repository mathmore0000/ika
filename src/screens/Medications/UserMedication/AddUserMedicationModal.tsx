// AddUserMedicationModal.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";
import { convertDateToLocalTimezone } from "@/utils/date";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/Ionicons";
import DropdownComponent from '@/components/forms/Dropdown';
import TextInputComponent from '@/components/forms/TextInput';
import InputButtonComponent from '@/components/forms/InputButton';

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
  const timeBetweenOptions = [
    { label: "4 horas", value: "4" },
    { label: "6 horas", value: "6" },
    { label: "8 horas", value: "8" },
    { label: "12 horas", value: "12" },
    { label: "24 horas", value: "24" },
  ];

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
      const response = await api.post("/user-medications", {
        idMedication: selectedMedication.id,
        quantityInt: quantityInt,
        quantityMl: quantityMl,
        timeBetween: parseFloat(timeBetween),
        firstDosageTime: firstDosageTimeISO,
        maxTakingTime: parseFloat(maxTakingTime),
      });

      showSuccessToast(t("medications.medicationAddedToUserSuccess"));
      await onUserMedicationCreated(response.data);
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
    <View className="flex-1 px-5 pt-5 w-full">
      <View className="flex flex-row items-center justify-between pb-4">
        <View className="flex flex-col items-start justify-between">
          <Text className="font-bold text-xl">{t("medications.addToInventory")}</Text>
          <Text>{selectedMedication.name}</Text>
        </View>
        <TouchableOpacity
          onPress={closeModal}
        >
          <Icon name="return-up-back-outline" size={25} color="#000" />
        </TouchableOpacity>
      </View>
      <ScrollView className="flex pt-5">
        <View className="flex-1 flex flex-col gap-3 w-full">
          <View className="contanier-input">
            <TextInputComponent
              navigation={null}
              isInvalid={errors.quantityInt}
              label={t("medications.quantityPills")}
              keyboardType="numeric"
              value={quantityInt}
              setValue={handleQuantityIntChange}
              editable={quantityMl === "0" || quantityMl === ""}
            />
            {errors.quantityInt && <Text style={styles.errorText}>{errors.quantityInt}</Text>}
          </View>
          <View className="contanier-input">
            <TextInputComponent
              label={t("medications.quantityMl")}
              keyboardType="numeric"
              navigation={null}
              value={quantityMl}
              setValue={handleQuantityMlChange}
              editable={quantityInt === "0" || quantityInt === ""}
            />
            {errors.quantityMl && <Text style={styles.errorText}>{errors.quantityMl}</Text>}
          </View>
          <View className="contanier-input">
            <DropdownComponent
              data={timeBetweenOptions}
              label={t("medications.timeBetweenDoses", { hours: timeBetween })}
              navigation={null}
              value={timeBetween}
              setValue={setTimeBetween}
              isInvalid={errors.timeBetween}
            />
            {errors.timeBetween && <Text style={styles.errorText}>{errors.timeBetween}</Text>}
          </View>

          <View className="contanier-input">
            <InputButtonComponent
              label={t("medications.firstDose")}
              value={formatTimeForDisplay(firstDosageTime)}
              onPress={() => setShowTimePicker(true)}
              isInvalid={errors.firstDosageTime}
            />
            {showTimePicker && (
              <DateTimePicker
                value={firstDosageTime}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
            {errors.firstDosageTime && <Text style={styles.errorText}>{errors.firstDosageTime}</Text>}
          </View>

          <View className="contanier-input">
            <DropdownComponent
              data={[
                { label: "0.5 hora (30 minutos)", value: "0.5" },
                { label: "1 hora", value: "1" },
              ]}
              label={t("medications.maxTakingTime", { time: maxTakingTime })}
              navigation={null}
              value={maxTakingTime}
              setValue={setMaxTakingTime}
              isInvalid={errors.maxTakingTime}
            />
            {errors.maxTakingTime && <Text style={styles.errorText}>{errors.maxTakingTime}</Text>}

          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{t("common.save")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddUserMedicationModal;
