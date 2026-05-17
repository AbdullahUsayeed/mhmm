import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import GlobeView from '../components/GlobeView';
import PhotoViewer from '../components/PhotoViewer';
import { usePhotos } from '../hooks/usePhotos';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function GlobeScreen() {
  const { photos, loading, addPhoto, removePhoto } = usePhotos();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);

  const handlePhotoTap = useCallback((id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (photo) {
      setSelectedPhoto(photo.uri);
      setViewerVisible(true);
    }
  }, [photos]);

  const handleAddPhoto = useCallback(() => {
    Alert.alert('Add a Memory', 'How would you like to add a photo?', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) {
            Alert.alert('Permission needed', 'Camera permission is required to take photos.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
            base64: true,
            allowsEditing: true,
            aspect: [1, 1],
          });
          if (!result.canceled && result.assets[0].base64) {
            const resized = await manipulateAsync(
              result.assets[0].uri,
              [{ resize: { width: 300 } }],
              { compress: 0.7, format: SaveFormat.JPEG, base64: true }
            );
            addPhoto(`data:image/jpeg;base64,${resized.base64}`);
          }
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            Alert.alert('Permission needed', 'Gallery permission is required to choose photos.');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            quality: 0.8,
            base64: true,
            allowsEditing: true,
            aspect: [1, 1],
          });
          if (!result.canceled && result.assets[0].base64) {
            const resized = await manipulateAsync(
              result.assets[0].uri,
              [{ resize: { width: 300 } }],
              { compress: 0.7, format: SaveFormat.JPEG, base64: true }
            );
            addPhoto(`data:image/jpeg;base64,${resized.base64}`);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [addPhoto]);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your world...</Text>
        </View>
      ) : (
        <GlobeView photos={photos} onPhotoTap={handlePhotoTap} />
      )}

      <View style={styles.topBar}>
        <Text style={styles.title}>Raisa's World</Text>
        <Text style={styles.subtitle}>
          {photos.length} {photos.length === 1 ? 'memory' : 'memories'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddPhoto}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <PhotoViewer
        visible={viewerVisible}
        uri={selectedPhoto}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a001a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a001a',
  },
  loadingText: {
    color: COLORS.primaryLight,
    fontSize: 16,
    marginTop: 16,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 2,
    textShadowColor: 'rgba(255,105,180,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.primaryLight,
    marginTop: 4,
    letterSpacing: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  fabText: {
    fontSize: 32,
    color: COLORS.white,
    lineHeight: 34,
    fontWeight: '300',
  },
});
