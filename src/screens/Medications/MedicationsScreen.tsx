// MedicationScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal } from "react-native";
import MedicationModal from "./MedicationModal";
import MedicationCard from "./MedicationCard"
import styles from "@/screens/_styles/medications";
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

const BASE_URL = "/user-medications"
const MedicationScreen = () => {
  const [medications, setMedications] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const fetchMedications = async () => {
    try {
      const response = await api.get(BASE_URL, {
        params: { page: 0, size: 10 },
      });
      setMedications(response.data.content);
    } catch (error) {
      showErrorToast("Error loading medications.");
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Medications</Text>
      <TouchableOpacity style={styles.addButton} onPress={openModal}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No medications found.</Text>}
        renderItem={({ item }) => (
          <MedicationCard userMedication={item} fetchMedications={fetchMedications} />
        )}
      />

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <MedicationModal closeModal={closeModal} fetchMedications={fetchMedications} />
      </Modal>
    </View>
  );
};

export default MedicationScreen;
