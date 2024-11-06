import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, StyleSheet } from "react-native";
import api from "@/server/api";
import VideoModal from "./VideoModal";
import VideoActionsModal from "./VideoActionsModal";
import RemoteImage from "@/components/shared/RemoteImage";

const ResponsibleVideoList = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null); // Nova variável de filtro

    useEffect(() => {
        fetchVideos(0, true); // Carrega a primeira página ao montar o componente
    }, [filterStatus]); // Atualiza ao mudar o filtro

    const fetchVideos = async (page = currentPage, reset = false) => {
        if (loading || page >= totalPages) return;
        setLoading(true);

        try {
            const response = await api.get("/usages/responsible", {
                params: {
                    page,
                    size: 10,
                    isApproved: filterStatus,
                },
            });
            setVideos(reset ? response.data.content : [...videos, ...response.data.content]);
            setTotalPages(response.data.totalPages);
            setCurrentPage(page);
        } catch (error) {
            console.error("Erro ao carregar vídeos:", error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = (status) => {
        if (status == filterStatus) return;
        setFilterStatus(status);
        setVideos([]); // Limpa os vídeos exibidos ao aplicar novo filtro
        setTotalPages(1);
        setCurrentPage(0); // Reinicia a páginação
    };

    const handleLoadMore = () => {
        if (currentPage + 1 < totalPages) {
            fetchVideos(currentPage + 1);
        }
    };

    return (
        <View style={styles.container}>
            {/* Filtros */}
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
                        <RemoteImage uri={item.user.avatar_url} style={styles.profileImage} />
                        <Text style={styles.videoText}>Usuário: {item.user.displayName}</Text>
                        <Text style={styles.videoText}>E-mail: {item.user.email}</Text>
                        <Text style={styles.videoText}>Video ID: {item.id}</Text>
                        <Text style={styles.videoText}>Timestamp: {item.actionTmstamp}</Text>
                        <TouchableOpacity onPress={() => setSelectedVideo(item)}>
                            <Text style={styles.viewButton}>{item.isApproved == null ? "Classificar" : (item.isApproved ? "Reprovar" : "Aprovar")}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            {/* Modal para visualização e ações de aprovação/rejeição */}
            {selectedVideo && (
                <Modal visible={true} transparent={true} animationType="slide">
                    <View style={styles.modalBackground}>
                        <VideoModal videoUri={selectedVideo.url} onClose={() => setSelectedVideo(null)} />
                        <VideoActionsModal
                            closeModal={() => setSelectedVideo(null)}
                            video={selectedVideo}
                            onActionComplete={() => {
                                setVideos([]); setCurrentPage(0); fetchVideos(0, true);
                            }}
                        />
                    </View>
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
    filterContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 10,
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
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
});

export default ResponsibleVideoList;
