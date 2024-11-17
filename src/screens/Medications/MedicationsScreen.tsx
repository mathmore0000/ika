import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, ActivityIndicator, RefreshControl, Dimensions } from "react-native";
import MedicationSelectionModal from "./UserMedication/MedicationSelectionModal";
import MedicationCard from "./UserMedicationStock/MedicationCard";
import styles from "@/screens/_styles/medications";
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import AppLayout from "@/components/shared/AppLayout";
import { useTranslation } from 'react-i18next';
import Toast from "react-native-toast-message";
import { scheduleIntrusiveMedicationReminders, deleteAllReminders, showAllAlarmsCount } from "@/utils/alarm"
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get("window");

const MedicationScreen = ({ navigation, local = "Medications" }) => {
  const { t } = useTranslation();
  const [userMedications, setUserMedications] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const minutesTimeBetweenRelation = { 0.5: 30, 1: 60 };
  const insets = useSafeAreaInsets(); // Obter as margens seguras do dispositivo

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const onUserMedicationCreated = async (medication) => {
    setUserMedications([]);
    setCurrentPage(0);
    fetchUserMedications(0);
    scheduleAllMedicationAlarms(medication, "insert"); // Configura alarmes para o novo medicamento
  };

  const fetchUserMedications = async (page = 0, isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);

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
      setRefreshing(false);
    }
    return userMedications
  };

  const onRefresh = () => {
    setUserMedications([]);
    setCurrentPage(0);
    fetchUserMedications(0, true);
  };

  useEffect(() => {
    fetchUserMedications();
  }, []);

  const loadMoreMedications = () => {
    if (currentPage < totalPages) {
      fetchUserMedications(currentPage);
    }
  };

  // Função chamada ao editar um medicamento
  const onUserMedicationUpdated = (userMedication) => {
    scheduleAllMedicationAlarms(userMedication); // Agenda novos alarmes com os horários atualizados
    fetchUserMedications(0); // Recarrega a lista do início
  };

  const scheduleAllMedicationAlarms = async (userMedication, action = "update") => {
    // Cancela os alarmes antigos
    await deleteAllReminders();

    let newUserMedications = []
    // Atualiza o medicamento na lista `ums`
    if (action == "update") {
      newUserMedications = userMedications.map((med) =>
        med.id === userMedication.id ? userMedication : med
      );
    }
    else {
      newUserMedications.push(...userMedications);
      newUserMedications.push(userMedication)
    }
    newUserMedications = newUserMedications.filter((med) =>
      !med.disabled
    );

    // Itera pelos medicamentos e agenda os alarmes para cada dose
    for (const med of newUserMedications) {
      const doseTimes = calculateDoseTimes(med);
      for (const time of doseTimes) {
        const [hour, minute] = time.split(":").map(Number);
        await scheduleIntrusiveMedicationReminders(
          hour,
          minute,
          med.medication.id,
          `Hora de tomar ${med.medication.name}`,
          minutesTimeBetweenRelation[med.maxTakingTime]
        );
      }
    }
  };

  const calculateDoseTimes = (userMedication) => {
    const doseTimes = [];
    const intervalInMilliseconds = userMedication.timeBetween * 60 * 60 * 1000; // Intervalo em milissegundos

    // Configura o horário inicial da primeira dose
    let doseTime = new Date(userMedication.firstDosageTime);
    const initialDoseTimePlus1 = new Date(doseTime.getTime() + 24 * 60 * 60 * 1000); // Mesmo horário no próximo dia

    // Repetir até alcançar o mesmo horário no dia seguinte
    while (doseTime < initialDoseTimePlus1) {
      // Formata a hora e minuto no fuso horário do usuário
      const formattedTime = doseTime.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // Formato 24 horas
      });

      doseTimes.push(formattedTime);

      // Incrementa a doseTime pelo intervalo
      doseTime = new Date(doseTime.getTime() + intervalInMilliseconds);
    }

    return doseTimes.sort();
  };


  return (
    <View className="flex-1 p-3 flex flex-col gap-2" style={{paddingBottom: insets.bottom + (height * 0.07)}}>
      <View className="flex flex-row items-center justify-end">
        {/* <Text style={styles.header}>{t('medications.medicationList')}</Text> */}
        <TouchableOpacity style={styles.addButton} onPress={openModal}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={userMedications}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('medications.noMedicationsFound')}</Text>}
        renderItem={({ item }) => (
          <MedicationCard
            calculateDoseTimes={calculateDoseTimes}
            onUserMedicationEdited={onUserMedicationUpdated}
            userMedication={item}
          />
        )}
        onEndReached={loadMoreMedications}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color="#0000ff" /> : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        removeClippedSubviews={true}
        initialNumToRender={10}
      />

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View className="flex-1 flex justify-end items-center bg-[rgba(0,0,0,0.5)]">
          <View className="bg-white rounded-t-lg flex items-center justify-center" style={{
            width: width,
            height: height * 0.9,
          }}>
            <MedicationSelectionModal closeModal={closeModal} userMedications={userMedications} onUserMedicationCreated={onUserMedicationCreated} />
          </View>
        </View>
        <Toast />
      </Modal>
      <AppLayout navigation={navigation} local={local} />
    </View>
  );
};

export default MedicationScreen;
