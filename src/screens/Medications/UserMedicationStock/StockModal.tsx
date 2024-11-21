// StockModal.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Dimensions } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";
import { useTranslation } from 'react-i18next';
import Icon from "react-native-vector-icons/AntDesign";
import InputButtonComponent from "@/components/forms/InputButton";
import TextInputComponent from "@/components/forms/TextInput";
import { useDispatch } from 'react-redux';
import { setLoading } from '@/store/loaderSlice';

const StockModal = ({ closeModal, userMedicationId, fetchStock }) => {
  const { t } = useTranslation();
  const [quantityStocked, setQuantityStocked] = useState("");
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dispatch = useDispatch();

  const handleSaveStock = async () => {
    const newErrors = {};
    if (!quantityStocked) newErrors.quantityStocked = t("medications.validationErrors.stockQuantityRequired");
    if (!expirationDate) newErrors.expirationDate = t("medications.validationErrors.expirationDateRequired");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      dispatch(setLoading(true))
      await api.post("/user-medication-stocks", {
        userMedicationId: userMedicationId,
        quantityStocked: parseInt(quantityStocked),
        expirationDate: expirationDate.toISOString(),
      });
      showSuccessToast(t("medications.stockAddedSuccessfully"));
      fetchStock(userMedicationId);
      closeModal();
    } catch (error) {
      showErrorToast(t("medications.errorAddingStock"));
    }
    finally{
      dispatch(setLoading(false))
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
    <View className="flex flex-col gap-2">
      <View className="flex flex-row items-center justify-between">
        <Text className="font-bold text-xl">{t("medications.addStock")}</Text>
        <Icon name="close" size={20} onPress={closeModal} />
      </View>
      <View className="contanier-input">
        <TextInputComponent
          label={t("medications.quantity")}
          placeholder="0"
          keyboardType="numeric"
          value={quantityStocked}
          isInvalid={!!errors.quantityStocked}
          setValue={setQuantityStocked}
          navigation={null}
        />
        {errors.quantityStocked && <Text style={styles.errorText}>{errors.quantityStocked}</Text>}
      </View>

      <View className="contanier-input">
        <InputButtonComponent          
          onPress={() =>setShowDatePicker(true)}
          label="Data"//traduzir
          value={expirationDate.toLocaleDateString()}
          isInvalid={!!errors.expirationDate}
          navigation={null}
        />
        {errors.expirationDate && <Text style={styles.errorText}>{errors.expirationDate}</Text>}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={expirationDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}
      <View className="flex flex-row mt-2 gap-2">
        <TouchableOpacity className="button-cancel w-1/2" onPress={closeModal}>
          <Text className="font-semibold text-primary text-lg">{t("common.cancel")}</Text>
        </TouchableOpacity>

        <TouchableOpacity className="button-confirm w-1/2" onPress={handleSaveStock}>
          <Text className="text-white font-semibold text-lg">{t("common.save")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StockModal;
