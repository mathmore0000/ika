import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import MedicationSelectionModal from "./UserMedication/MedicationSelectionModal";
import MedicationCard from "./UserMedicationStock/MedicationCard";
import styles from "@/screens/_styles/medications";
import api from "@/server/api";
import { showErrorToast } from "@/utils/toast";

const MedicationScreen = () => {
  const [userMedications, setUserMedications] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const onUserMedicationCreated = () => {
    setCurrentPage(0);
    fetchUserMedications(0); // Recarrega a lista do início
  };

   const fetchUserMedications = async (page = currentPage) => {
     if (loading || page >= totalPages) return;

    setLoading(true);
    try {
      const response = await api.get("/user-medications", {
        params: { page, size: 20, sortBy: "medication.name"},
      });
      const newUserMedications = response.data.content;

      setUserMedications((prevUserMedications) =>
        page === 0 ? newUserMedications : [...prevUserMedications, ...newUserMedications]
      );

      setTotalPages(response.data.totalPages);
      setCurrentPage(page + 1);
    } catch (error) {
      console.log(error)
      showErrorToast("Error loading medications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserMedications();
  }, []);

  const loadMoreMedications = () => {
    if (currentPage < totalPages) {
      fetchUserMedications(currentPage);
    }
  };

  return (
    <View className="flex-1 p-6">
      <View className="flex flex-row items-center justify-between">
      <Text style={styles.header}>Seus medicamentos</Text>
      <TouchableOpacity style={styles.addButton} onPress={openModal}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      </View>

      <FlatList
        data={userMedications}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No medications found.</Text>}
        renderItem={({ item }) => (
          <MedicationCard fetchUserMedications={fetchUserMedications} userMedication={item} />
        )}
        onEndReached={loadMoreMedications} // Chama quando o fim da lista é alcançado
        onEndReachedThreshold={0.5} // Controla quando carregar mais (0.5 é ao alcançar a metade do final da lista)
        ListFooterComponent={loading ? <ActivityIndicator size="small" color="#0000ff" /> : null} // Indicador de carregamento
      />

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <MedicationSelectionModal closeModal={closeModal} userMedications={userMedications} onUserMedicationCreated={onUserMedicationCreated} />
      </Modal>
    </View>
  );
};

export default MedicationScreen;