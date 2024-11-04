import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from "react-native";
import { medicationType, medicationErrorType, activeIngredientType, categoryType } from "@/constants/interfaces/Entities"
import api from "@/server/api";
import { Picker } from "@react-native-picker/picker";
import ActiveIngredientSelectionModal from "./ActiveIngredient/ActiveIngredientSelectionModal"
import CategorySelectionModal from "./Category/CategorySelectionModal"
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";

interface NewMedicationModalProps {
  closeModal: () => void;
  onMedicationCreated: () => void; // Assume que recebe uma string e retorna void
}

const NewMedicationModal: React.FC<NewMedicationModalProps> = ({ closeModal, onMedicationCreated }) => {// Dentro do NewMedicationModal.js
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isIngredientModalVisible, setIsIngredientModalVisible] = useState(false);
  const [bands] = useState<string[]>([
    "Sem tarja",
    "Tarja vermelha (sem retenção)",
    "Tarja vermelha (com retenção)",
    "Tarja preta",
    "Tarja amarela"]
  );

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
    setErrors((prevErrors) => ({ ...prevErrors, [Object.keys(updatedFields)[0]]: null })); // Define o erro do campo específico como null
  };


  const handleSave = async () => {
    let validationErrors: medicationErrorType = {};
    if (!customMedication.name) validationErrors.name = "Nome é obrigatório.";
    if (!customMedication.category.id) validationErrors.category = "Categoria é obrigatória.";
    if (!customMedication.dosage) validationErrors.dosage = "Dosagem é obrigatória.";
    if (!customMedication.activeIngredient.id) validationErrors.activeIngredient = "Ingrediente ativo é obrigatório.";
    if (!customMedication.maxTakingTime) validationErrors.maxTakingTime = "Tempo máximo de validação é obrigatório.";
    if (!customMedication.timeBetween) validationErrors.timeBetween = "Tempo entre doses é obrigatório.";
    if (!customMedication.band) validationErrors.band = "Tarja é obrigatória.";
    if (!customMedication.quantityInt && !customMedication.quantityMl) validationErrors.quantityInt = "Quantidade inteira ou ml é obrigatório";

    console.log(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await api.post("/medications", { ...customMedication, categoryId: customMedication.category.id, activeIngredientId: customMedication.activeIngredient.id });
      showSuccessToast("Medicamento criado com sucesso.");
      await onMedicationCreated();
      closeModal();
    } catch (error) {
      console.log(error.response.data)
      showErrorToast("Erro ao criar medicamento.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.modalContainer}>
      <Text style={styles.title}>Novo Medicamento</Text>

      <TextInput
        style={[styles.input, errors.name && styles.inputError]}
        placeholder="Nome do medicamento"
        value={customMedication.name}
        onChangeText={(value) => updateCustomMedication({ name: value })}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <Text style={styles.buttonText}>Categoria selecionada: {customMedication.category.description} </Text>
      <TouchableOpacity onPress={openCategoryModal}>
        <Text style={styles.buttonText}>Selecionar Categoria {customMedication.category.description}</Text>
      </TouchableOpacity>
      {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

      <Text></Text>
      <Text style={styles.buttonText}>Quantidade de pilulas </Text>
      <TextInput
        style={[styles.input, errors.quantityInt && styles.inputError]}
        placeholder="Quantidade (unidades inteiras)"
        keyboardType="numeric"
        editable={customMedication.quantityMl === 0 || customMedication.quantityMl === null}
        value={customMedication.quantityInt.toString()}
        onChangeText={(value) => handleQuantityIntChange(parseInt(value, 10))}
      />

      <Text style={styles.buttonText}>Quantidade em ML </Text>
      <TextInput
        style={[styles.input, errors.quantityMl && styles.inputError]}
        placeholder="Quantidade (ml)"
        keyboardType="numeric"
        editable={customMedication.quantityInt === 0 || customMedication.quantityInt === null}
        value={customMedication.quantityMl.toString()}
        onChangeText={(value) => handleQuantityMlChange(parseInt(value, 10))}
      />
      {errors.quantityInt && <Text style={styles.errorText}>{errors.quantityInt}</Text>}

      <Text>Dosagem (em mg): </Text>
      <TextInput
        style={[styles.input, errors.dosage && styles.inputError]}
        placeholder="Dosagem"
        keyboardType="numeric"
        value={customMedication.dosage}
        onChangeText={(value) => updateCustomMedication({ dosage: value })}
      />
      {errors.dosage && <Text style={styles.errorText}>{errors.dosage}</Text>}

      <Text style={styles.buttonText}>Ingrediente ativo selecionado: {customMedication.activeIngredient.description} </Text>
      <TouchableOpacity onPress={openIngredientModal}>
        <Text style={styles.buttonText}>Selecionar Ingrediente Ativo</Text>
      </TouchableOpacity>
      {errors.activeIngredient && <Text style={styles.errorText}>{errors.activeIngredient}</Text>}

      <Text style={styles.label}>Tempo Máximo de Tomação: {customMedication.maxTakingTime} hora(s)</Text>
      <Picker
        selectedValue={customMedication.maxTakingTime}
        onValueChange={(value) => updateCustomMedication({ maxTakingTime: value })}
        style={[styles.picker, errors.maxTakingTime && styles.inputError]}
      >
        <Picker.Item label="0.5 hora (30 minutos)" value="0.5" />
        <Picker.Item label="1 hora" value="1" />
      </Picker>
      {errors.maxTakingTime && <Text style={styles.errorText}>{errors.maxTakingTime}</Text>}

      <Text style={styles.label}>Tempo entre doses: {customMedication.timeBetween} horas</Text>
      <Picker
        selectedValue={customMedication.timeBetween}
        onValueChange={(value: number) => { updateCustomMedication({ timeBetween: value }) }}
        style={[styles.picker, errors.timeBetween && styles.inputError]}
      >
        <Picker.Item label="4 horas" value="4" />
        <Picker.Item label="6 horas" value="6" />
        <Picker.Item label="8 horas" value="8" />
        <Picker.Item label="12 horas" value="12" />
        <Picker.Item label="24 horas" value="24" />
      </Picker>
      {errors.timeBetween && <Text style={styles.errorText}>{errors.timeBetween}</Text>}


      <Text>Tarja: {bands[customMedication.band - 1]}</Text>
      <Picker
        selectedValue={customMedication.band}
        onValueChange={(value) => { console.log(value); updateCustomMedication({ band: value }) }}
        style={[styles.picker, errors.band && styles.inputError]}
      >
        {bands.map((band: string, i: number) => {
          return (
            <Picker.Item label={band} value={String(i + 1)} key={i} />
          )
        }
        )}
      </Picker>
      {errors.band && <Text style={styles.errorText}>{errors.band}</Text>}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
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
