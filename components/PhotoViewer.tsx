import React from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface PhotoViewerProps {
  visible: boolean;
  uri: string | null;
  onClose: () => void;
}

export default function PhotoViewer({ visible, uri, onClose }: PhotoViewerProps) {
  if (!uri) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>X</Text>
        </TouchableOpacity>
        <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 16,
  },
});
