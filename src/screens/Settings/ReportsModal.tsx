// ReportsModal.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import api from "@/server/api";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next';
import { encode as btoa } from 'base-64';
import { Picker } from '@react-native-picker/picker';

interface ReportsModalProps {
    visible: boolean;
    onClose: () => void;
}

const ReportsModal: React.FC<ReportsModalProps> = ({ visible, onClose }) => {
    const { t } = useTranslation();
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // Mês atual
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()); // Ano atual
    const [loading, setLoading] = useState(false);

    const months = [
        { label: 'Janeiro', value: 1 },
        { label: 'Fevereiro', value: 2 },
        { label: 'Março', value: 3 },
        { label: 'Abril', value: 4 },
        { label: 'Maio', value: 5 },
        { label: 'Junho', value: 6 },
        { label: 'Julho', value: 7 },
        { label: 'Agosto', value: 8 },
        { label: 'Setembro', value: 9 },
        { label: 'Outubro', value: 10 },
        { label: 'Novembro', value: 11 },
        { label: 'Dezembro', value: 12 },
    ];

    const years = Array.from({ length: 2 }, (_, i) => new Date().getFullYear() - 0 + i); // De 5 anos atrás até 5 anos no futuro    

    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };


    const handleGenerateUserReport = async () => {
        setLoading(true);
        // Envie a requisição para gerar o PDF
        try {
            const response = await api.get('/reports/user', {
                responseType: 'arraybuffer',
                params: {
                    month: selectedMonth,
                    year: selectedYear,
                }
            });

            const base64 = arrayBufferToBase64(response.data);

            // Salve o PDF no sistema de arquivos
            const uri = FileSystem.documentDirectory + 'user_report.pdf';
            await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });

            // Compartilhe o PDF
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Compartilhar Relatório',
                });
            } else {
                showErrorToast('Compartilhamento não está disponível no seu dispositivo.');
            }
            showSuccessToast(t('reports.downloadSuccess'));
            onClose();
        } catch (error) {
            if (error.response.data == "No data found on user") {
                return showErrorToast(t('reports.NoDataOnUser'))
            }
            if (error.response.data == "Wrong year or month value") {
                return showErrorToast(t('reports.WrongDate'))
            }
            console.log("Erro: ", error)
        }
        finally {
            setLoading(false);
        }

    };

    const handleGenerateResponsibleReport = async () => {
        setLoading(true);
        // Envie a requisição para gerar o PDF
        try {
            const response = await api.get('/reports/responsible', {
                responseType: 'arraybuffer',
                params: {
                    month: selectedMonth,
                    year: selectedYear,
                }
            });

            const base64 = arrayBufferToBase64(response.data);

            // Salve o PDF no sistema de arquivos
            const uri = FileSystem.documentDirectory + 'responsible_report.pdf';
            await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });

            // Compartilhe o PDF
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Compartilhar Relatório',
                });
            } else {
                showErrorToast('Compartilhamento não está disponível no seu dispositivo.');
            }
            showSuccessToast(t('reports.downloadSuccess'));
            onClose();
        } catch (error) {
            if (error.response.data == "No data found on responsible") {
                return showErrorToast(t('reports.NoDataOnResponsible'))
            }
            if (error.response.data == "Wrong year or month value") {
                return showErrorToast(t('reports.WrongDate'))
            }
            console.log("Erro: ", error)
        }
        finally {
            setLoading(false);
        }

    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}><View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>{t('reports.selectMonth')}</Text>
                    <Picker
                        selectedValue={selectedMonth}
                        style={styles.picker}
                        onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                    >
                        {months.map((month) => (
                            <Picker.Item key={month.value} label={month.label} value={month.value} />
                        ))}
                    </Picker>
                </View>

                    <View style={styles.pickerContainer}>
                        <Text style={styles.pickerLabel}>{t('reports.selectYear')}</Text>
                        <Picker
                            selectedValue={selectedYear}
                            style={styles.picker}
                            onValueChange={(itemValue) => setSelectedYear(itemValue)}
                        >
                            {years.map((year) => (
                                <Picker.Item key={year} label={year.toString()} value={year} />
                            ))}
                        </Picker>
                    </View>

                    <Text style={styles.modalTitle}>{t('reports.selectReport')}</Text>

                    <TouchableOpacity
                        style={styles.reportButton}
                        onPress={handleGenerateUserReport}
                        disabled={loading}
                    >
                        <Text style={styles.reportButtonText}>{t('reports.userReport')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.reportButton}
                        onPress={handleGenerateResponsibleReport}
                        disabled={loading}
                    >
                        <Text style={styles.reportButtonText}>{t('reports.responsibleReport')}</Text>
                    </TouchableOpacity>

                    {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 10 }} />}

                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>{t('common.cancel')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    reportButton: {
        width: '100%',
        backgroundColor: '#483DF7',
        padding: 15,
        borderRadius: 5,
        marginVertical: 5,
        alignItems: 'center',
    },
    reportButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        marginTop: 20,
    },
    closeButtonText: {
        color: '#FF6347',
        fontSize: 16,
    },
});

export default ReportsModal;
