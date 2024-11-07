// NewMedicationModal.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from "react-native";
import { medicationType, medicationErrorType, activeIngredientType, categoryType } from "@/constants/interfaces/Entities";
import api from "@/server/api";
import { Picker } from "@react-native-picker/picker";
import ActiveIngredientSelectionModal from "./ActiveIngredient/ActiveIngredientSelectionModal";
import CategorySelectionModal from "./Category/CategorySelectionModal";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";
import { useTranslation } from 'react-i18next';

interface NewMedicationModalProps {
  closeModal: () => void;
  onMedicationCreated: () => void;
}

const NewMedicationModal: React.FC<NewMedicationModalProps> = ({ closeModal, onMedicationCreated }) => {
  const { t } = useTranslation();
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isIngredientModalVisible, setIsIngredientModalVisible] = useState(false);

  const bands = [
    t("medications.bandNone"),
    t("medications.bandRedNoRetention"),
    t("medications.bandRedWithRetention"),
    t("medications.bandBlack"),
    t("medications.bandYellow")
  ];

  const openCategoryModal = () => setIsCategoryModalVisible(true);
  const closeCategoryModal = () => setIsCategoryModalVisible(false);

  const openIngredientModal = () => setIsIngredientModalVisible(true);
  const closeIngredientModal = () => setIsIngredientModalVisible(false);

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
      await api.post("/medications", { ...customMedication, categoryId: customMedication.category.id, activeIngredientId: customMedication.activeIngredient.id });
      showSuccessToast(t("medications.medicationCreated"));
      await onMedicationCreated();
      closeModal();
    } catch (error) {
      console.log(error.response.data)
      showErrorToast(t("medications.errorCreatingMedication"));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.modalContainer}>
      <Text style={styles.title}>{t("medications.newMedication")}</Text>

      <TextInput
        style={[styles.input, errors.name && styles.inputError]}
        placeholder={t("medications.medicationName")}
        value={customMedication.name}
        onChangeText={(value) => updateCustomMedication({ name: value })}
      />
      {errors.name && <Text style={styles.errorText}>{t(errors.name)}</Text>}

      <Text style={styles.buttonText}>{t("medications.selectedCategory", { category: customMedication.category.description })}</Text>
      <TouchableOpacity onPress={openCategoryModal}>
        <Text style={styles.buttonText}>{t("medications.selectCategoryButton")}</Text>
      </TouchableOpacity>
      {errors.category && <Text style={styles.errorText}>{t(errors.category)}</Text>}

      <Text></Text>
      <Text style={styles.buttonText}>{t("medications.quantityPills")}</Text>
      <TextInput
        style={[styles.input, errors.quantityInt && styles.inputError]}
        placeholder={t("medications.quantityInt")}
        keyboardType="numeric"
        editable={customMedication.quantityMl === 0 || customMedication.quantityMl === null}
        value={customMedication.quantityInt.toString()}
        onChangeText={(value) => handleQuantityIntChange(parseInt(value, 10))}
      />

      <Text style={styles.buttonText}>{t("medications.quantityMl")}</Text>
      <TextInput
        style={[styles.input, errors.quantityMl && styles.inputError]}
        placeholder={t("medications.quantityMlPlaceholder")}
        keyboardType="numeric"
        editable={customMedication.quantityInt === 0 || customMedication.quantityInt === null}
        value={customMedication.quantityMl.toString()}
        onChangeText={(value) => handleQuantityMlChange(parseInt(value, 10))}
      />
      {errors.quantityInt && <Text style={styles.errorText}>{t(errors.quantityInt)}</Text>}

      <Text>{t("medications.dosageMg")}</Text>
      <TextInput
        style={[styles.input, errors.dosage && styles.inputError]}
        placeholder={t("medications.dosage")}
        keyboardType="numeric"
        value={customMedication.dosage}
        onChangeText={(value) => updateCustomMedication({ dosage: value })}
      />
      {errors.dosage && <Text style={styles.errorText}>{t(errors.dosage)}</Text>}

      <Text style={styles.buttonText}>{t("medications.selectedActiveIngredient", { ingredient: customMedication.activeIngredient.description })}</Text>
      <TouchableOpacity onPress={openIngredientModal}>
        <Text style={styles.buttonText}>{t("medications.selectActiveIngredientButton")}</Text>
      </TouchableOpacity>
      {errors.activeIngredient && <Text style={styles.errorText}>{t(errors.activeIngredient)}</Text>}

      <Text style={styles.label}>{t("medications.maxTakingTime", { time: customMedication.maxTakingTime })}</Text>
      <Picker
        selectedValue={customMedication.maxTakingTime}
        onValueChange={(value) => updateCustomMedication({ maxTakingTime: value })}
        style={[styles.picker, errors.maxTakingTime && styles.inputError]}
      >
        <Picker.Item label={t("medications.halfHour")} value="0.5" />
        <Picker.Item label={t("medications.oneHour")} value="1" />
      </Picker>
      {errors.maxTakingTime && <Text style={styles.errorText}>{t(errors.maxTakingTime)}</Text>}

      <Text style={styles.label}>{t("medications.timeBetweenDoses", { hours: customMedication.timeBetween })}</Text>
      <Picker
        selectedValue={customMedication.timeBetween}
        onValueChange={(value: number) => { updateCustomMedication({ timeBetween: value }) }}
        style={[styles.picker, errors.timeBetween && styles.inputError]}
      >
        <Picker.Item label={t("medications.fourHours")} value="4" />
        <Picker.Item label={t("medications.sixHours")} value="6" />
        <Picker.Item label={t("medications.eightHours")} value="8" />
        <Picker.Item label={t("medications.twelveHours")} value="12" />
        <Picker.Item label={t("medications.twentyFourHours")} value="24" />
      </Picker>
      {errors.timeBetween && <Text style={styles.errorText}>{t(errors.timeBetween)}</Text>}

      <Text>{t("medications.band", { band: bands[customMedication.band - 1] })}</Text>
      <Picker
        selectedValue={customMedication.band}
        onValueChange={(value) => { console.log(value); updateCustomMedication({ band: value }) }}
        style={[styles.picker, errors.band && styles.inputError]}
      >
        {bands.map((band: string, i: number) => (
          <Picker.Item label={band} value={String(i + 1)} key={i} />
        ))}
      </Picker>
      {errors.band && <Text style={styles.errorText}>{t(errors.band)}</Text>}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{t("common.save")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
        <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
      </TouchableOpacity>

      <Modal visible={isCategoryModalVisible} transparent={true} animationType="fade">
        <CategorySelectionModal closeModal={closeCategoryModal} onCategorySelected={handleCategorySelected} />
      </Modal>

      <Modal visible={isIngredientModalVisible} transparent={true} animationType="fade">
        <ActiveIngredientSelectionModal closeModal={closeIngredientModal} onActiveIngredientSelected={handleActiveIngredientSelected} />
      </Modal>
    </ScrollView>
  );
};

export default NewMedicationModal;
