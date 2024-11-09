// ResponsiblesScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal } from "react-native";
import styles from "@/screens/_styles/responsibles";
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { ResponsiblesProps } from "@/constants/interfaces/props/Responsibles";
import RemoteImage from "@/components/shared/RemoteImage";
import AddNewResponsibleScreen from './AddNewResponsibleScreen';
import { useTranslation } from 'react-i18next';

const ResponsiblesScreen: React.FC<ResponsiblesProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const BASE_URL = "/responsibles";
  const [pendingResponsibles, setPendingResponsibles] = useState([]);
  const [supervisedUsers, setSupervisedUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  useEffect(() => {
    fetchResponsibles();
    fetchSupervisedUsers();
  }, []);

  const fetchSupervisedUsers = async () => {
    try {
      const response = await api.get(`${BASE_URL}/responsible`, {
        params: { page: 0, size: 10 }
      });
      setSupervisedUsers(response.data.content);
    } catch (error) {
      showErrorToast(t("responsibles.errorFetchingPendingResponsibles"));
    }
  };

  const fetchResponsibles = async () => {
    try {
      const response = await api.get(`${BASE_URL}/user`, {
        params: { page: 0, size: 10 }
      });
      setPendingResponsibles(response.data.content);
    } catch (error) {
      console.log(Object.keys(error));
      showErrorToast(t("responsibles.errorFetchingSupervisedUsers"));
    }
  };

  const handleAcceptRequest = async (userId: string) => {
    console.log("aceitando..", userId)
    try {
      await api.put(`${BASE_URL}/accept`, null, {
        params: { idUser: userId },
      });
      console.log("aceito")
      showSuccessToast(t("responsibles.responsibleAccepted"));
      fetchResponsibles();
      fetchSupervisedUsers();
    } catch (error) {
      console.log("error", error.response)
      showErrorToast(t("responsibles.errorAcceptingResponsible"));
    }
  };

  const handleRemoveUser = async (id: string, type: "responsible" | "user") => {
    try {
      console.log(type, id);
      await api.delete(`${BASE_URL}/by-${type}`, {
        params: { [type === "responsible" ? "idResponsible" : "idUser"]: id },
      });
      showSuccessToast(t("responsibles.userRemoved"));
      fetchResponsibles();
      fetchSupervisedUsers();
    } catch (error) {
      console.log(error.response.data);
      showErrorToast(t("responsibles.errorRemovingUser"));
    }
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AddNewResponsibleScreen
              BASE_URL={BASE_URL}
              fetchResponsibles={fetchResponsibles}
              fetchSupervisedUsers={fetchSupervisedUsers}
              closeModal={closeModal}
            />
          </View>
        </View>
      </Modal>
      <Text style={styles.header}>{t("responsibles.supervisedUsers")}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={openModal}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <FlatList
        data={supervisedUsers}
        ListEmptyComponent={<Text style={styles.emptyText}>{t("responsibles.noSupervisedUsersFound")}</Text>}
        keyExtractor={(user) => user.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <RemoteImage
              uri={item.user.avatarUrl}
              style={styles.profileImage}
            />
            <Text style={styles.nameText}>{item.user.displayName}</Text>
            {!item.accepted && (
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptRequest(item.user.id)}
              >
                <Text style={styles.buttonText}>{t("common.accept")}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveUser(item.user.id, "user")}
            >
              <Text style={styles.buttonText}>{t("common.remove")}</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Text style={styles.header}>{t("responsibles.responsibles")}</Text>
      <FlatList
        data={pendingResponsibles}
        ListEmptyComponent={<Text style={styles.emptyText}>{t("responsibles.noResponsiblesFound")}</Text>}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <RemoteImage
              uri={item.responsible.avatarUrl}
              style={styles.profileImage}
            />
            <Text style={styles.nameText}>{item.responsible.displayName}</Text>
            <Text style={styles.nameText}>
              {item.accepted == true ? t("responsibles.accepted") : t("responsibles.notAccepted")}
            </Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveUser(item.responsible.id, "responsible")}
            >
              <Text style={styles.buttonText}>{t("common.remove")}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default ResponsiblesScreen;
