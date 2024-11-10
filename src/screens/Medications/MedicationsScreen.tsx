import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, ActivityIndicator, Dimensions } from "react-native";
import MedicationSelectionModal from "./UserMedication/MedicationSelectionModal";
import MedicationCard from "./UserMedicationStock/MedicationCard";
import styles from "@/screens/_styles/medications";
import api from "@/server/api";
import { showErrorToast } from "@/utils/toast";
import AppLayout from "@/components/shared/AppLayout";
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get("window"); // Obtém a largura e altura da tela

const MedicationScreen = ({ navigation, local = "Medications" }) => {
  const { t } = useTranslation();
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
        params: { page, size: 20, sortBy: "medication.name" },
      });
      const newUserMedications = response.data.content;

      setUserMedications((prevUserMedications) =>
        page === 0 ? newUserMedications : [...prevUserMedications, ...newUserMedications]
      );

      setTotalPages(response.data.totalPages);
      setCurrentPage(page + 1);
    } catch (error) {
      console.log(error);
      showErrorToast(t('calendar.errorLoadingMedications'));
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
    <View className="flex-1 p-6 flex flex-col gap-2">
      <View className="flex flex-row items-center justify-between">
        <Text style={styles.header}>{t('medications.medicationList')}</Text>
        <TouchableOpacity style={styles.addButton} onPress={openModal}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={userMedications}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('medications.noMedicationsFound')}</Text>}
        renderItem={({ item }) => (
          <MedicationCard fetchUserMedications={fetchUserMedications} userMedication={item} />
        )}
        onEndReached={loadMoreMedications} // Chama quando o fim da lista é alcançado
        onEndReachedThreshold={0.5} // Controla quando carregar mais (0.5 é ao alcançar a metade do final da lista)
        ListFooterComponent={loading ? <ActivityIndicator size="small" color="#0000ff" /> : null} // Indicador de carregamento
      />

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View className="flex-1 flex justify-end items-center bg-[rgba(0,0,0,0.5)]">
          <View className="bg-white rounded-t-lg flex items-center justify-center" style={{
            width: width, // 80% da largura da tela
            height: height * 0.9, // 80% da altura da tela
          }}>
            <MedicationSelectionModal closeModal={closeModal} userMedications={userMedications} onUserMedicationCreated={onUserMedicationCreated} />
          </View>
        </View>
      </Modal>
      <AppLayout navigation={navigation} local={local} />
    </View>
  );
};


export default MedicationScreen;
