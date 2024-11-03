import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Dimensions, Modal } from "react-native";
import api from "@/server/api";
import { showErrorToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";
import NewMedicationModal from "./Medication/NewMedicationModal";
import UserMedicationModal from "./AddUserMedicationModal"
import { medicationType } from "@/constants/interfaces/Entities";

const MedicationSelectionModal = ({ closeModal, userMedications, onUserMedicationCreated }) => {
  const [medications, setMedications] = useState<medicationType[]>([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [selectedMedication, setSelectedMedication] = useState<medicationType>([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isNewMedicationModalVisible, setIsNewMedicationModalVisible] = useState(false);
  const [isNewUserMedicationModal, setIsNewUserMedicationModal] = useState(false);

  const openIsNewMedicationModal = () => setIsNewMedicationModalVisible(true);
  const closeIsNewMedicationModal = () => setIsNewMedicationModalVisible(false);

  const openNewUserMedicationModal = () => setIsNewUserMedicationModal(true);
  const closeNewUserMedicationModal = () => setIsNewUserMedicationModal(false);

  useEffect(() => {
    fetchMedications();
  }, [currentPage]);

  const onMedicationCreated = async () => {
    await setMedications([]);
    await setCurrentPage(0);
    await fetchMedications(0);
  };

  const fetchMedications = async (page = currentPage, size = 50) => {
    if (loading || page >= totalPages) return;

    setLoading(true);
    try {
      const response = await api.get("/medications", { params: { page, size } });
      const newMedications = filterOutUserMedications(response.data.content);
      const updatedMedications: medicationType[] = page === 0 ? newMedications : [...medications, ...newMedications];
      
      setMedications(updatedMedications);
      setFilteredMedications(filterMedications(updatedMedications, searchText)); // Filtra imediatamente após carregar mais itens
      setTotalPages(response.data.totalPages);
    } catch (error) {
      showErrorToast("Erro ao carregar medicamentos.");
    } finally {
      setLoading(false);
    }
  };

  const filterOutUserMedications = (allMedications) => {
    const userMedicationIds = userMedications.map((userMed) => userMed.medication.id);
    return allMedications.filter((med) => !userMedicationIds.includes(med.id));
  };

  const filterMedications = (medications, text) => {
    return medications.filter((med) =>
      med.name.toLowerCase().includes(text.toLowerCase())
    );
  };

  const handleNewUserMedicationModal = async () => {
    if (selectedMedication.id == null) {
      return showErrorToast("Escolha um medicamento!");
    }
    openNewUserMedicationModal();
  };

  const handleSearch = (text) => {
    setSearchText(text);
    setFilteredMedications(filterMedications(medications, text)); // Atualiza a lista filtrada
  };

  const handleSelect = (medication) => {
    console.log(medication)
    setSelectedMedication(medication);
  };

  const loadMore = () => {
    if (currentPage + 1 < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>Selecione um Medicamento</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar medicamento..."
        value={searchText}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredMedications}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum medicamento encontrado.</Text>}
        renderItem={({ item }) => (
          <View style={item.id === selectedMedication.id ? styles.medicationItemSelected : styles.medicationItem}>
            <Text style={styles.medicationName}>Nome: {item.name} | Dosagem: {item.dosage}</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.selectButtonText}>Selecionar</Text>
            </TouchableOpacity>
            <Text></Text>
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color="#0000ff" /> : null}
      />

      <Modal visible={isNewMedicationModalVisible} transparent={true} animationType="fade">
        <NewMedicationModal
          closeModal={closeIsNewMedicationModal}
          onMedicationCreated={onMedicationCreated}
        />
      </Modal>

      <Modal visible={isNewUserMedicationModal} transparent={true} animationType="fade">
        <UserMedicationModal
          closeModal={closeNewUserMedicationModal}
          closeMedicationSelectionModal={closeModal}
          onUserMedicationCreated={onUserMedicationCreated}
          selectedMedication={selectedMedication}
        />
      </Modal>

      <TouchableOpacity onPress={handleNewUserMedicationModal}>
        <Text style={styles.toggleText}>Adicionar Medicamento Ao Inventário</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={openIsNewMedicationModal}>
        <Text style={styles.toggleText}>Adicionar Medicamento</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MedicationSelectionModal;
