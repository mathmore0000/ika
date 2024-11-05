import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "@/server/api";
import SelectStockModal from "./SelectStockModal"; // Import the new modal component
import styles from "@/screens/_styles/medications";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

const TakeMedicationModal = ({ isVisible, closeModal, medicationId, fetchUserMedications }) => {
    const [stocks, setStocks] = useState([]);
    const [selectedStocks, setSelectedStocks] = useState([]);
    const [video, setVideo] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isSelectStockModalVisible, setIsSelectStockModalVisible] = useState(false);

    // Fetch medication stocks with pagination
    useEffect(() => {
        if (isVisible) {
            resetStocks();
            fetchStocks(0); // Fetch initial stocks
        }
    }, [isVisible]);

    const resetStocks = () => {
        setStocks([]);
        setCurrentPage(0);
        setTotalPages(1);
    };

    const fetchStocks = async (page = currentPage, size = 10) => {
        if (loading || page >= totalPages) return;

        setLoading(true);
        try {
            const response = await api.get(`/user-medication-stocks/valid/${medicationId}`, { params: { page, size } });
            setStocks((prevStocks) => [...prevStocks, ...response.data.content]);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Erro ao carregar estoques:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStock = (stock, quantity) => {
        setStocks((prevStocks) =>
            prevStocks.map((s) =>
                s.id === stock.id ? { ...s, quantityStocked: s.quantityStocked - quantity } : s
            )
        );
        setSelectedStocks((prev) => [...prev, { stock, quantity: parseFloat(quantity) }]);
    };

    const handleRemoveStock = (index) => {
        const removedStock = selectedStocks[index];
        setStocks((prevStocks) =>
            prevStocks.map((s) =>
                s.id === removedStock.stock.id ? { ...s, quantityStocked: s.quantityStocked + removedStock.quantity } : s
            )
        );
        setSelectedStocks((prev) => prev.filter((_, i) => i !== index));
    };

    const pickVideoFromCamera = async () => {
        let result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos });
        if (!result.cancelled) setVideo(result.uri);
    };

    const pickVideoFromGallery = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos });
        if (!result.canceled) setVideo(result.assets[0].uri);
    };

    const handleSave = async () => {
        if (!selectedStocks.length || !video) {
            showErrorToast("Selecione pelo menos um estoque e grave/escolha o vídeo.");
            return;
        }

        const usageRequest = {
            actionTmstamp: new Date().toISOString(),
            medications: selectedStocks.map(({ stock, quantity }) => ({
                medicationStockId: stock.id,
                quantityInt: quantity ? parseInt(quantity) : null,
                quantityMl: quantity ? parseFloat(quantity) : null,
            })),
        };

        const formData = new FormData();

        // Append the video file
        formData.append("file", {
            uri: video,
            name: "medication_video.mp4",
            type: "video/mp4"
        });

        formData.append("usageRequest", {
            string: JSON.stringify(usageRequest),
            type: "application/json",
        });

        try {
            // Send the form data through the api instance with the correct headers
            await api.post("/usages", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Accept": "application/json", // Define que esperamos um JSON de resposta
                },
            });
            showSuccessToast("Uso registrado com sucesso.");
            setVideo(null)
            setSelectedStocks([])
            closeModal();
            fetchUserMedications();
            // Additional actions such as refreshing data can go here
        } catch (error) {
            console.error("Erro ao registrar uso:", error?.response?.data);
            showErrorToast("Erro ao registrar uso.");
        }
    };

    return (
        <Modal visible={isVisible} transparent animationType="slide">
            <View style={styles.modalContainer}>
                <Text style={styles.title}>Tomar Medicamento</Text>

                <FlatList
                    data={selectedStocks}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <View style={styles.stockItem}>
                            <Text>
                                Estoque: Expira em {item.stock.expirationDate}, Quantidade: {item.quantity}
                            </Text>
                            <TouchableOpacity onPress={() => handleRemoveStock(index)}>
                                <Text style={styles.removeText}>Remover</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />

                <TouchableOpacity onPress={() => setIsSelectStockModalVisible(true)}>
                    <Text style={styles.addButtonText}>Selecionar Estoque</Text>
                </TouchableOpacity>

                {/* Button for selecting video source */}
                <TouchableOpacity onPress={pickVideoFromCamera}>
                    <Text style={styles.addButtonText}>Gravar Vídeo</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={pickVideoFromGallery}>
                    <Text style={styles.addButtonText}>Escolher Vídeo da Galeria</Text>
                </TouchableOpacity>

                {video && (
                    <Text>Vídeo Selecionado</Text>
                )}

                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <SelectStockModal
                    isVisible={isSelectStockModalVisible}
                    closeModal={() => setIsSelectStockModalVisible(false)}
                    stocks={stocks}
                    onAddStock={handleAddStock}
                    fetchStocks={fetchStocks}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                    loading={loading}
                />
            </View>
        </Modal>
    );
};

export default TakeMedicationModal;
