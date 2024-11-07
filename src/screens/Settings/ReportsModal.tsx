// ReportsModal.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import api from "@/server/api";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next';

interface ReportsModalProps {
  visible: boolean;
  onClose: () => void;
}

const ReportsModal: React.FC<ReportsModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async (reportType: 'user' | 'supervised') => {
    setLoading(true);
    try {
      // Envie a requisição para gerar o PDF
      const response = await api.post('/reports/generate', { type: reportType }, {
        responseType: 'arraybuffer', // Use 'arraybuffer' para receber dados binários
      });

      // Crie um URI para salvar o arquivo
      const uri = FileSystem.cacheDirectory + `report_${reportType}.pdf`;

      // Escreva o arquivo no sistema de arquivos
      await FileSystem.writeAsStringAsync(uri, Buffer.from(response.data, 'binary').toString('base64'), {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Compartilhe o arquivo
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
      console.error('Erro ao gerar relatório:', error);
      showErrorToast(t('reports.downloadError'));
    } finally {
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
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{t('reports.selectReport')}</Text>
          
          <TouchableOpacity 
            style={styles.reportButton} 
            onPress={() => handleGenerateReport('user')}
            disabled={loading}
          >
            <Text style={styles.reportButtonText}>{t('reports.userReport')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.reportButton} 
            onPress={() => handleGenerateReport('supervised')}
            disabled={loading}
          >
            <Text style={styles.reportButtonText}>{t('reports.supervisedReport')}</Text>
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
    flex:1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent:'center',
    alignItems:'center',
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
