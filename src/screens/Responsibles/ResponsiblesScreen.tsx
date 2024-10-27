import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal } from "react-native";
import styles from "@/screens/_styles/responsibles"
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { ResponsiblesProps } from "@/constants/interfaces/props/Responsibles";
import RemoteImage from "@/components/shared/RemoteImage";
import AddNewResponsibleScreen from './AddNewResponsibleScreen';

const ResponsiblesScreen: React.FC<ResponsiblesProps> = ({ navigation }) => {
  const BASE_URL = "/responsibles"
  const [pendingResponsibles, setPendingResponsibles] = useState([]);
  const [supervisedUsers, setSupervisedUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  // Fetch Responsibles Data
  useEffect(() => {
    fetchResponsibles();
    fetchSupervisedUsers();
  }, []);

  // Função para buscar responsáveis pendentes
  const fetchSupervisedUsers = async () => {
    try {
      const response = await api.get(`${BASE_URL}/responsible`, {
        params: { page: 0, size: 10 }
      });
      setSupervisedUsers(response.data.content);

    } catch (error) {
      showErrorToast("Erro ao buscar responsáveis pendentes.");
    }
  };

  // Função para buscar supervisionados aceitos
  const fetchResponsibles = async () => {
    try {
      const response = await api.get(`${BASE_URL}/user`, {
        params: { page: 0, size: 10 }
      });
      setPendingResponsibles(response.data.content);
    } catch (error) {
      console.log(Object.keys(error))
      showErrorToast("Erro ao buscar supervisionados.");
    }
  };

  // Função para aceitar uma solicitação de responsabilidade
  const handleAcceptRequest = async (userId: string) => {
    try {
      await api.put(`${BASE_URL}/accept`, null, {
        params: { idUser: userId },
      });
      showSuccessToast("Responsável aceito.");
      fetchResponsibles();
      fetchSupervisedUsers();
    } catch (error) {
      showErrorToast("Erro ao aceitar o responsável.");
    }
  };

  // Função para remover um responsável ou supervisionado
  const handleRemoveUser = async (id: string, type: "responsible" | "user") => {
    try {
      console.log(type, id)
      await api.delete(`${BASE_URL}/by-${type}`, {
        params: { [type === "responsible" ? "idResponsible" : "idUser"]: id },
      });
      showSuccessToast("Usuário removido.");
      fetchResponsibles();
      fetchSupervisedUsers();
    } catch (error) {
      console.log(error.response.data)
      showErrorToast("Erro ao remover o usuário.");
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
            <AddNewResponsibleScreen BASE_URL={BASE_URL} fetchResponsibles={fetchResponsibles} fetchSupervisedUsers={fetchSupervisedUsers} closeModal={closeModal} />
          </View>
        </View>
      </Modal>
      <Text style={styles.header}>Supervisionados</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={openModal}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <FlatList
        data={supervisedUsers}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum supervisionado encontrado.</Text>}
        keyExtractor={(user) => user.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <RemoteImage
              uri={item.user.avatar_url} // Ou uma URL válida
              style={styles.profileImage}
            />
            <Text style={styles.nameText}>{item.user.displayName}</Text>
            {!item.accepted && (
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptRequest(item.user.id)}
              >
                <Text style={styles.buttonText}>Aceitar</Text>
              </TouchableOpacity>)}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveUser(item.user.id, "user")}
            >
              <Text style={styles.buttonText}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Text style={styles.header}>Responsáveis</Text>
      <FlatList
        data={pendingResponsibles}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum responsável encontrado.</Text>}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <RemoteImage
              uri={item.responsible.avatar_url} // Ou uma URL válida
              style={styles.profileImage}
            />
            <Text style={styles.nameText}>{item.responsible.displayName}</Text>
            <Text style={styles.nameText}>{item.accepted == false ? "não aceito" : "aceito"}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveUser(item.responsible.id, "responsible")}
            >
              <Text style={styles.buttonText}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default ResponsiblesScreen;
