// NewMedicationModal.js
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Dimensions, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { medicationType, medicationErrorType, activeIngredientType, categoryType } from "@/constants/interfaces/Entities";
import api from "@/server/api";
import { Picker } from "@react-native-picker/picker";
import ActiveIngredientSelectionModal from "./ActiveIngredient/ActiveIngredientSelectionModal";
import CategorySelectionModal from "./Category/CategorySelectionModal";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";
import { useTranslation } from 'react-i18next';
import Icon from "react-native-vector-icons/Ionicons";
//import DropDownPicker from "react-native-dropdown-picker";
import DropdownComponent from '@/components/forms/Dropdown';
import TextInputComponent from '@/components/forms/TextInput';
import InputButtonComponent from '@/components/forms/InputButton';
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { setLoading } from '@/store/loaderSlice';

interface NewMedicationModalProps {
  closeModal: () => void;
  onMedicationCreated: () => void;
}

const NewMedicationModal: React.FC<NewMedicationModalProps> = ({ closeModal, onMedicationCreated }) => {
  const { t } = useTranslation();
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isIngredientModalVisible, setIsIngredientModalVisible] = useState(false);
  const dispatch = useDispatch();


  const openCategoryModal = () => setIsCategoryModalVisible(true);
  const closeCategoryModal = () => setIsCategoryModalVisible(false);

  const openIngredientModal = () => setIsIngredientModalVisible(true);
  const closeIngredientModal = () => setIsIngredientModalVisible(false);
  const { width, height } = Dimensions.get("window"); // Obtém a largura e altura da tela
  const insets = useSafeAreaInsets(); // Obter as margens seguras do dispositivo

  const handleCategorySelected = (category: categoryType) => {
    updateCustomMedication({ category: category });
    closeCategoryModal();
  };

  const handleActiveIngredientSelected = (ingredient: activeIngredientType) => {
    updateCustomMedication({ activeIngredient: ingredient });
    closeIngredientModal();
  };

  const handleQuantityIntChange = (value: number) => {
    if (Number.isNaN(value)) {
      return handleQuantityIntChange(0);
    }
    updateCustomMedication({ quantityInt: value });
    updateCustomMedication({ quantityMl: 0 });
  };

  const handleQuantityMlChange = (value: number) => {
    if (Number.isNaN(value)) {
      return handleQuantityMlChange(0);
    }
    updateCustomMedication({ quantityMl: value });
    updateCustomMedication({ quantityInt: 0 });
  };

  const [customMedication, setCustomMedication] = useState<medicationType>({
    name: "",
    category: { id: "", description: "" },
    dosage: 0,
    activeIngredient: { id: "", description: "" },
    maxTakingTime: 1,
    timeBetween: 8,
    band: 1,
    quantityInt: 0,
    quantityMl: 0
  });
  const [errors, setErrors] = useState<medicationErrorType>({});

  const updateCustomMedication = (updatedFields: Partial<medicationType>) => {
    setCustomMedication((prev) => ({ ...prev, ...updatedFields }));
    setErrors((prevErrors) => ({ ...prevErrors, [Object.keys(updatedFields)[0]]: null }));
  };

  // Configurações do Dropdown para "Tarja"
  const itemsBands = [
    { label: t("medications.bandNone"), value: 1 },
    { label: t("medications.bandRedNoRetention"), value: 2 },
    { label: t("medications.bandRedWithRetention"), value: 3 },
    { label: t("medications.bandBlack"), value: 4 },
    { label: t("medications.bandYellow"), value: 5 }
  ];

  // Configurações do Dropdown para "maxTakingTime"
  const itemsMaxTakingTime = [
    { label: t("medications.halfHour"), value: 0.5 },
    { label: t("medications.oneHour"), value: 1 },
  ];

  // Configurações do Dropdown para "timeBetween"
  const itemsTimeBetween = [
    { label: t("medications.fourHours"), value: 4 },
    { label: t("medications.sixHours"), value: 6 },
    { label: t("medications.eightHours"), value: 8 },
    { label: t("medications.twelveHours"), value: 12 },
    { label: t("medications.twentyFourHours"), value: 24 },
  ];

  const handleSave = async () => {
    let validationErrors: medicationErrorType = {};
    if (!customMedication.name) validationErrors.name = "auth.validationErrors.nameRequired";
    if (!customMedication.category.id) validationErrors.category = "medications.validationErrors.categoryRequired";
    if (!customMedication.dosage) validationErrors.dosage = "medications.validationErrors.dosageRequired";
    if (!customMedication.activeIngredient.id) validationErrors.activeIngredient = "medications.validationErrors.activeIngredientRequired";
    if (!customMedication.maxTakingTime) validationErrors.maxTakingTime = "medications.validationErrors.maxTakingTimeRequired";
    if (!customMedication.timeBetween) validationErrors.timeBetween = "medications.validationErrors.timeBetweenRequired";
    if (!customMedication.band) validationErrors.band = "medications.validationErrors.bandRequired";
    if (!customMedication.quantityInt && !customMedication.quantityMl) validationErrors.quantityInt = "medications.validationErrors.quantityRequired";

    console.log(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      dispatch(setLoading(true))
      await api.post("/medications", { ...customMedication, categoryId: customMedication.category.id, activeIngredientId: customMedication.activeIngredient.id });
      showSuccessToast(t("medications.medicationCreated"));
      await onMedicationCreated();
      closeModal();
    } catch (error) {
      console.log(error.response.data)
      showErrorToast(t("medications.errorCreatingMedication"));
    }
    finally{
      dispatch(setLoading(false))
    }
  };

  //teste

  return (
    <SafeAreaView>
      <View className="flex-1 px-5 pt-5 w-full">
        <View className="flex w-full flex-row items-center justify-between pb-4">
          <Text className="font-bold text-xl">{t("medications.newMedication")}</Text>
          <TouchableOpacity
            onPress={closeModal}
          >
            <Icon name="return-up-back-outline" size={25} color="#000" />
          </TouchableOpacity>
        </View>
        <ScrollView className="flex">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View className="flex-1 pb-5 flex flex-col gap-3 w-full">
              <View className="contanier-input">
                <TextInputComponent
                  label={t("medications.medicationName")}
                  isInvalid={!!errors.name}
                  navigation={null}
                  setValue={(value) => updateCustomMedication({ name: value })}
                  value={customMedication.name}
                />
                {errors.name && <Text style={styles.errorText}>{t(errors.name)}</Text>}
              </View>

              <View className="contanier-input">
                <InputButtonComponent
                  navigation={null}
                  onPress={openCategoryModal}
                  label="Categoria" //traduzir
                  value={customMedication.category.description/*traduzir*/}
                  isInvalid={!!errors.category}
                />
                {errors.category && <Text style={styles.errorText}>{t(errors.category)}</Text>}
              </View>
              <View className="contanier-input">
                <TextInputComponent
                  navigation={null}
                  label={t("medications.quantityPills")}
                  isInvalid={!!errors.quantityInt}
                  placeholder={t("medications.quantityInt")}
                  keyboardType="numeric"
                  editable={customMedication.quantityMl === 0 || customMedication.quantityMl === null}
                  value={customMedication.quantityInt.toString()}
                  setValue={(value) => handleQuantityIntChange(parseInt(value, 10))}
                />
              </View>
              <View className="contanier-input">
                <TextInputComponent
                  navigation={null}
                  isInvalid={!!errors.quantityInt}
                  label={t("medications.quantityMl")}
                  placeholder={t("medications.quantityMlPlaceholder")}
                  keyboardType="numeric"
                  editable={customMedication.quantityInt === 0 || customMedication.quantityInt === null}
                  value={customMedication.quantityMl.toString()}
                  setValue={(value) => handleQuantityMlChange(parseInt(value, 10))}
                />
                {errors.quantityInt && <Text style={styles.errorText}>{t(errors.quantityInt)}</Text>}
              </View>
              <View className="contanier-input">
                <TextInputComponent
                  navigation={null}
                  isInvalid={!!errors.dosage}
                  label={t("medications.dosageMg")}
                  setValue={(value) => updateCustomMedication({ dosage: value })}
                  keyboardType="numeric"
                  value={customMedication.dosage}
                />
                {errors.dosage && <Text style={styles.errorText}>{t(errors.dosage)}</Text>}
              </View>
              <View className="contanier-input">
                <InputButtonComponent
                  navigation={null}
                  onPress={openIngredientModal}
                  label="Ingrediente ativo" //traduzir
                  value={customMedication.activeIngredient.description/*traduzir*/}
                  isInvalid={!!errors.activeIngredient}
                />
                {errors.activeIngredient && <Text style={styles.errorText}>{t(errors.activeIngredient)}</Text>}
              </View>
              <View className="container-input">
                <DropdownComponent
                  navigation={null}
                  label={t("medications.maxTakingTime", { time: customMedication.maxTakingTime })}
                  value={customMedication.maxTakingTime}
                  data={itemsMaxTakingTime}
                  setValue={(value) => updateCustomMedication({ maxTakingTime: value })}
                  isInvalid={!!errors.maxTakingTime}
                />
                {errors.maxTakingTime && <Text style={styles.errorText}>{t(errors.maxTakingTime)}</Text>}
              </View>

              <View className="container-input">
                <DropdownComponent
                  navigation={null}
                  label={t("medications.timeBetweenDoses", { hours: customMedication.timeBetween })}
                  value={customMedication.timeBetween}
                  data={itemsTimeBetween}
                  setValue={(value) => updateCustomMedication({ timeBetween: value })}
                  isInvalid={!!errors.timeBetween}
                />
                {errors.timeBetween && <Text style={styles.errorText}>{t(errors.timeBetween)}</Text>}
              </View>

              <View className={`container-input`}>
                <DropdownComponent
                  navigation={null}
                  label="Tarja"
                  value={customMedication.band}
                  data={itemsBands}
                  setValue={(value) => updateCustomMedication({ band: value })}
                  isInvalid={!!errors.band}
                />
                {errors.band && <Text style={styles.errorText}>{t(errors.band)}</Text>}
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{t("common.save")}</Text>
              </TouchableOpacity>

              <Toast />
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
        <Modal visible={isCategoryModalVisible} transparent={true} animationType="fade">
          <View className="flex-1 w-full flex justify-end items-center bg-[rgba(0,0,0,0.5)]">
            <View className="bg-white w-full rounded-t-lg flex items-center justify-center" style={{
              width: width, // 80% da largura da tela
              height: height * 0.8, // 80% da altura da tela
            }}>
              <CategorySelectionModal closeModal={closeCategoryModal} onCategorySelected={handleCategorySelected} />
              <Toast />
            </View>
          </View>
        </Modal>
        <Modal visible={isIngredientModalVisible} transparent={true} animationType="fade">
          <View className="flex-1 w-full flex justify-end items-center bg-[rgba(0,0,0,0.5)]">
            <View className="bg-white w-full rounded-t-lg flex items-center justify-center" style={{
              width: width, // 80% da largura da tela
              height: height * 0.8, // 80% da altura da tela
            }}>
              <ActiveIngredientSelectionModal closeModal={closeIngredientModal} onActiveIngredientSelected={handleActiveIngredientSelected} />
            </View>
          </View>
          <Toast />
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default NewMedicationModal;
