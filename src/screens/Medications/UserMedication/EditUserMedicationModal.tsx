// EditUserMedicationModal.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/AntDesign";
import DropdownComponent from "@/components/forms/Dropdown";
import InputButtonComponent from "@/components/forms/InputButton";
import { useDispatch } from 'react-redux';
import { setLoading } from '@/store/loaderSlice';

const EditUserMedicationModal = ({ closeModal, userMedication, onUserMedicationEdited }) => {
  const { t } = useTranslation();
  const [timeBetween, setTimeBetween] = useState(userMedication.timeBetween?.toString() || "8");
  const [maxTakingTime, setMaxTakingTime] = useState(userMedication.maxTakingTime?.toString() || "0.5");
  const [firstDosageTime, setFirstDosageTime] = useState(new Date(userMedication.firstDosageTime));
  const [errors, setErrors] = useState({});
  const [showTimePicker, setShowTimePicker] = useState(false);
  const dispatch = useDispatch();

  const padZero = (num) => num.toString().padStart(2, '0');
  const formatTime = (date) => {
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());
    return `${hours}:${minutes}`;
  };

  const hours = [
    { label: "4 horas", value: "4" },
    { label: "6 horas", value: "6" },
    { label: "8 horas", value: "8" },
    { label: "12 horas", value: "12" },
    { label: "24 horas", value: "24" },
  ]

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
      dispatch(setLoading(true))
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
      onUserMedicationEdited({
        ...userMedication,
        timeBetween: parseFloat(timeBetween),
        firstDosageTime: firstDosageTimeISO,
        maxTakingTime: parseFloat(maxTakingTime),
      });
      closeModal();
    } catch (error) {
      console.log(error.response.data);
      showErrorToast(t("medications.errorUpdatingMedication"));
    }
    finally{
      dispatch(setLoading(false))
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
    <View className="flex flex-col gap-2">
      <View className="flex flex-row items-center justify-between mb-2">
        <View className="flex flex-col items-start justify-between">
          <Text className="font-bold text-xl">{t("medications.editUserMedication")}</Text>
          <Text>{userMedication.medication.name}</Text>
        </View>
        <Icon name="close" size={20} onPress={closeModal} />
      </View>

      <View className="contanier-input">
        <DropdownComponent
          data={hours}
          label={t("medications.timeBetweenDoses", { hours: timeBetween })}
          value={timeBetween}
          setValue={setTimeBetween}
          isInvalid={!!errors.timeBetween}
          navigation={null}
        />
        {errors.timeBetween && <Text style={styles.errorText}>{errors.timeBetween}</Text>}
      </View>
      <View className="contanier-input">
        <InputButtonComponent
          onPress={() => setShowTimePicker(true)}
          label={t("medications.firstDose")}
          value={formatTime(firstDosageTime)}
          isInvalid={!!errors.firstDosageTime}
          setValue={setFirstDosageTime}
          navigation={null}
        />
        {errors.firstDosageTime && <Text style={styles.errorText}>{errors.firstDosageTime}</Text>}
        {showTimePicker && (
          <DateTimePicker
            value={firstDosageTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>

      <View className="contanier-input">
        <DropdownComponent
          data={[
            { label: "0.5 hora (30 minutos)", value: "0.5" },
            { label: "1 hora", value: "1" },
          ]}
          label={t("medications.maxTakingTime", { time: maxTakingTime })}
          value={maxTakingTime}
          setValue={(itemValue) => setMaxTakingTime(itemValue)}
          isInvalid={!!errors.maxTakingTime}
          navigation={null}
        />
        {errors.maxTakingTime && <Text style={styles.errorText}>{errors.maxTakingTime}</Text>}
      </View>

      <View className="flex flex-row mt-2 gap-2">
        <TouchableOpacity className="button-cancel w-1/2" onPress={closeModal}>
          <Text className="font-semibold text-primary text-lg">{t("common.cancel")}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="button-confirm w-1/2" onPress={handleSave}>
          <Text className="text-white font-semibold text-lg">{t("common.save")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditUserMedicationModal;
