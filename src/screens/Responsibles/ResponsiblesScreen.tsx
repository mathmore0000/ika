// ResponsiblesScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, Dimensions } from "react-native";
import styles from "@/screens/_styles/responsibles";
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { ResponsiblesProps } from "@/constants/interfaces/props/Responsibles";
import RemoteImage from "@/components/shared/RemoteImage";
import AddNewResponsibleScreen from './AddNewResponsibleScreen';
import { useTranslation } from 'react-i18next';
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/AntDesign";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ResponsiblesScreen: React.FC<ResponsiblesProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const BASE_URL = "/responsibles";
  const [pendingResponsibles, setPendingResponsibles] = useState([]);
  const [supervisedUsers, setSupervisedUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isResonsibleView, setIsResonsibleView] = useState(false);
  const { height } = Dimensions.get("window");

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);
  const insets = useSafeAreaInsets(); // Obter as margens seguras do dispositivo

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
    <View style={[styles.container, { paddingBottom: insets.bottom + (height * 0.03) }]}>
      <View className="flex flex-row justify-end items-center py-3">
        <TouchableOpacity
          className="bg-primary flex flex-row items-center justify-center gap-2 p-2 rounded-md"
          onPress={openModal}
        >
          <Icon name="plus" size={18} color="#fff" />
          <Text className="text-white font-semibold">Adicionar</Text>
        </TouchableOpacity>
      </View>

      {/* Toggle Button */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !isResonsibleView && styles.activeButton]}
          onPress={() => setIsResonsibleView(false)}
        >
          <Text style={[styles.buttonText, !isResonsibleView && styles.activeButtonText]}>
            {t("responsibles.responsibles")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, isResonsibleView && styles.activeButton]}
          onPress={() => setIsResonsibleView(true)}
        >
          <Text style={[styles.buttonText, isResonsibleView && styles.activeButtonText]}>
            {t("responsibles.supervisedUsers")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Video List */}

      <View style={[styles.listContainer]} className="flex-1">
        {isResonsibleView ? (<FlatList
          data={supervisedUsers}
          ListHeaderComponent={
            supervisedUsers?.length &&
            <View className="flex-col px-2">
              <View className="flex w-full flex-row py-3 items-center justify-between">
                <View className="flex-row gap-2">
                  <Text className="ml-1 text-sm font-semibold">{t("responsibles.picture")}</Text>
                  <Text className="text-sm font-semibold">{t("responsibles.name")}</Text>
                </View>
                <View className="flex-row gap-2">
                  <Text className="text-sm font-semibold">{t("responsibles.accept")}</Text>
                  <Text className="text-sm font-semibold">{t("responsibles.remove")}</Text>
                </View>
              </View>
              <View className="border-b w-full border-gray-300" />
            </View>
          }
          ListEmptyComponent={<Text className="text-center" style={styles.emptyText}>{t("responsibles.noSupervisedUsersFound")}</Text>}
          keyExtractor={(user) => user.id}
          renderItem={({ item }) => (
            <View className="flex flex-col gap-2 px-2 py-3">
              <View className="flex flex-row gap-2 justify-between items-center">
                <View className="flex flex-row items-center gap-2">
                  <RemoteImage
                    uri={item.user.avatarUrl}
                    style={styles.profileImage}
                  />
                  <Text>{item.user.displayName}</Text>
                </View>

                <View className="flex flex-row items-center">
                  {!item.accepted && (
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptRequest(item.user.id)}
                    >
                      <Icon name="checkcircleo" size={20} color="#fff" />
                      {/* <Text style={styles.buttonText}>{t("common.accept")}</Text> */}
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveUser(item.user.id, "user")}
                  >
                    <Icon name="closecircleo" size={20} color="#fff" />
                    {/* <Text style={styles.buttonText}>{t("common.remove")}</Text> */}
                  </TouchableOpacity>
                </View>
              </View>
              <View className="border-b w-full border-gray-300" />
            </View>
          )}
        />) : (<FlatList
          data={pendingResponsibles}
          ListHeaderComponent={
            pendingResponsibles?.length && <View className="flex-col px-2">
              <View className="flex w-full flex-row py-3 items-center justify-between">
                <View className="flex-row gap-2">
                  <Text className="ml-1 text-sm font-semibold">{t("responsibles.picture")}</Text>
                  <Text className="text-sm font-semibold">{t("responsibles.name")}</Text>
                </View>
                <View className="flex-row gap-2">
                  <Text className="text-sm font-semibold">{t("responsibles.remove")}</Text>
                </View>
              </View>
              <View className="border-b w-full border-gray-300" />
            </View>
          }
          ListEmptyComponent={<Text className="text-center mt-4" style={styles.emptyText}>{t("responsibles.noResponsiblesFound")}</Text>}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="flex flex-col gap-2 px-2 py-3">
              <View className="flex flex-row gap-2 justify-between items-center">
                <View className="flex flex-row items-center gap-2">
                  <RemoteImage
                    uri={item.responsible.avatarUrl}
                    style={styles.profileImage}
                  />
                  <Text >{item.responsible.displayName}</Text>
                </View>
                <Text>
                  {item.accepted == true ? t("responsibles.accepted") : t("responsibles.notAccepted")}
                </Text>
                <View className="flex flex-row items-center">
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveUser(item.responsible.id, "responsible")}
                  >
                    <Icon name="closecircleo" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
              <View className="border-b w-full border-gray-300" />
            </View>
          )}
        />)}
      </View>
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View className="pop-up">
            <AddNewResponsibleScreen
              BASE_URL={BASE_URL}
              fetchResponsibles={fetchResponsibles}
              fetchSupervisedUsers={fetchSupervisedUsers}
              closeModal={closeModal}
            />
          </View>
        </View>
        <Toast />
      </Modal>
    </View>
  );
};

export default ResponsiblesScreen;
