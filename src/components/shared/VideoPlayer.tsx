import React from 'react';
import { Video } from 'expo-av';
import { View, StyleSheet } from 'react-native';

const VideoPlayer = ({ uri }) => (
    <View style={styles.container}>
        <Video
            source={{ uri }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            shouldPlay
            style={styles.video}
        />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: 300,
    },
});

export default VideoPlayer;
