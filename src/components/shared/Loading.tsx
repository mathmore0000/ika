import React from 'react';
import { ActivityIndicator, StyleSheet, View, Modal } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/main';

const Loading: React.FC = () => {
  const isLoading = useSelector((state: RootState) => state.loading.isLoading);

  return (
    <Modal visible={isLoading} transparent={true} animationType="fade">
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default Loading;
