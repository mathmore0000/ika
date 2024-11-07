// MedicationSelectionModal.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Modal } from "react-native";
import api from "@/server/api";
import { showErrorToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";
import NewMedicationModal from "./Medication/NewMedicationModal";
import UserMedicationModal from "./AddUserMedicationModal";
import { medicationType } from "@/constants/interfaces/Entities";
import { useTranslation } from "react-i18next";

const MedicationSelectionModal = ({ closeModal, userMedications, onUserMedicationCreated }) => {
  const { t } = useTranslation();
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
      setFilteredMedications(filterMedications(updatedMedications, searchText));
      setTotalPages(response.data.totalPages);
    } catch (error) {
      showErrorToast(t("medications.errorLoadingMedications"));
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
      return showErrorToast(t("medications.chooseMedication"));
    }
    openNewUserMedicationModal();
  };

  const handleSearch = (text) => {
    setSearchText(text);
    setFilteredMedications(filterMedications(medications, text));
  };

  const handleSelect = (medication) => {
    setSelectedMedication(medication);
  };

  const loadMore = () => {
    if (currentPage + 1 < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>{t("medications.selectMedication")}</Text>

      <TextInput
        style={styles.searchInput}
        placeholder={t("medications.searchMedication")}
        value={searchText}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredMedications}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>{t("medications.noMedicationsFound")}</Text>}
        renderItem={({ item }) => (
          <View style={item.id === selectedMedication.id ? styles.medicationItemSelected : styles.medicationItem}>
            <Text style={styles.medicationName}>
              {t("medications.medicationNameDosage", { name: item.name, dosage: item.dosage })}
            </Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.selectButtonText}>{t("common.select")}</Text>
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
        <Text style={styles.toggleText}>{t("medications.addToInventory")}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={openIsNewMedicationModal}>
        <Text style={styles.toggleText}>{t("medications.addMedicationButton")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
        <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MedicationSelectionModal;
