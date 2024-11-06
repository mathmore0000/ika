import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Modal, Alert } from "react-native";
import api from "@/server/api";
import VideoModal from "./VideoModal";

const UserVideoList = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState(null); // Nova variável de filtro
    const [selectedVideo, setSelectedVideo] = useState(null);

    useEffect(() => {
        fetchVideos(0); // Carrega a primeira página ao montar o componente
    }, [filterStatus]);

    const fetchVideos = async (page = currentPage) => {
        if (loading || page >= totalPages) return;
        setLoading(true);
        try {
            const response = await api.get("/usages/user", {
                params: {
                    page, size: 10,
                    isApproved: filterStatus,
                }
            });
            setVideos((prev) => [...prev, ...response.data.content]);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching user videos:", error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = (status) => {
        if (status == filterStatus) return;
        setVideos([]); // Limpa os vídeos exibidos ao aplicar novo filtro
        setCurrentPage(0); // Reinicia a páginação
        setTotalPages(1);
        setFilterStatus(status);
    };

    const handleLoadMore = () => {
        if (currentPage + 1 < totalPages) {
            setCurrentPage((prev) => prev + 1);
            fetchVideos(currentPage + 1);
        }
    };

    const handleDeleteVideo = async (videoId) => {
        Alert.alert(
            "Confirmação de Exclusão",
            "Você tem certeza que deseja excluir este vídeo?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/usages/${videoId}`);
                            setVideos((prevVideos) => prevVideos.filter(video => video.id !== videoId));
                            Alert.alert("Sucesso", "Vídeo excluído com sucesso.");
                        } catch (error) {
                            console.log(error.response.data)
                            console.error("Erro ao excluir vídeo:", error);
                            Alert.alert("Erro", "Não foi possível excluir o vídeo.");
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => applyFilter(true)}>
                <Text style={styles.viewButton}>Filtrar por aprovados</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => applyFilter(false)}>
                <Text style={styles.viewButton}>Filtrar por reprovados</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => applyFilter(null)}>
                <Text style={styles.viewButton}>Filtrar todos</Text>
            </TouchableOpacity>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            <FlatList
                data={videos}
                keyExtractor={(item) => item.id}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                renderItem={({ item }) => (
                    <View style={styles.videoItem}>
                        <Text style={styles.videoText}>Video ID: {item.id}</Text>
                        <Text style={styles.videoText}>Timestamp: {item.actionTmstamp}</Text>
                        <Text style={styles.videoText}>Status: {item.isApproved == true ? "Aprovado" : (item.isApproved == false ? "Reprovado" : "Pendente")}</Text>
                        <TouchableOpacity onPress={() => setSelectedVideo(item)}>
                            <Text style={styles.viewButton}>Visualizar Vídeo</Text>
                        </TouchableOpacity>
                        {
                            !item.isApproved &&
                            <TouchableOpacity onPress={() => handleDeleteVideo(item.id)}>
                                <Text style={styles.deleteButton}>Excluir Vídeo</Text>
                            </TouchableOpacity>
                        }
                    </View>
                )}
            />

            {selectedVideo && (
                <Modal visible={true} transparent={true} animationType="slide">
                    <VideoModal
                        url={selectedVideo.url} // Substitua pela URL do vídeo real
                        onClose={() => setSelectedVideo(null)}
                    />
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    videoItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    videoText: {
        fontSize: 16,
    },
    viewButton: {
        color: "#1E90FF",
        marginTop: 10,
    },
    deleteButton: {
        color: "#FF4500",
        marginTop: 10,
    },
});

export default UserVideoList;
