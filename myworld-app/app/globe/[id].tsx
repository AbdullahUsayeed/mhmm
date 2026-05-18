import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/contexts/AuthContext';
import { getTheme } from '../../src/lib/themes';
import GlobeView from '../../src/components/GlobeView';

const { width } = Dimensions.get('window');
const CONTINENTS = [
  { name:'North America', lat:[35,60], lng:[-125,-70] }, { name:'South America', lat:[-25,10], lng:[-80,-35] },
  { name:'Europe', lat:[38,65], lng:[-10,40] }, { name:'Africa', lat:[-20,35], lng:[-15,50] },
  { name:'Asia', lat:[15,65], lng:[60,145] }, { name:'Australia', lat:[-35,-10], lng:[115,155] },
];
function randPos() { const c=CONTINENTS[Math.floor(Math.random()*CONTINENTS.length)]; return { lat:c.lat[0]+Math.random()*(c.lat[1]-c.lat[0]), lng:c.lng[0]+Math.random()*(c.lng[1]-c.lng[0]), continent:c.name }; }

export default function GlobeManageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [globe, setGlobe] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [yearKey, setYearKey] = useState('');

  useEffect(() => {
    if (!id || !user) return;
    loadGlobe();
  }, [id, user]);

  async function loadGlobe() {
    setLoading(true);
    const { data: g } = await supabase.from('globes').select('*').eq('id', id).eq('creator_id', user?.id).single();
    if (!g) { Alert.alert('Not Found', 'Globe not found'); router.back(); return; }
    setGlobe(g);
    const age = new Date().getFullYear() - g.birth_year;
    const key = `${age}-${age + 1}`;
    setYearKey(key);
    const { data: p } = await supabase.from('photos').select('*').eq('globe_id', id).eq('year_key', key).order('added_at', { ascending: false });
    setPhotos(p || []);
    setLoading(false);
  }

  async function loadPhotos(key: string) {
    const { data } = await supabase.from('photos').select('*').eq('globe_id', id).eq('year_key', key).order('added_at', { ascending: false });
    setPhotos(data || []);
  }

  const handleAddPhoto = useCallback(() => {
    Alert.alert('Add Photo', 'Choose source', [
      { text: 'Camera', onPress: async () => {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return Alert.alert('Permission needed');
        const result = await ImagePicker.launchCameraAsync({ quality: 0.8, base64: true, allowsEditing: true, aspect: [1, 1] });
        if (!result.canceled && result.assets[0].base64) await savePhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }},
      { text: 'Gallery', onPress: async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return Alert.alert('Permission needed');
        const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, base64: true, allowsEditing: true, aspect: [1, 1] });
        if (!result.canceled && result.assets[0].base64) {
          const resized = await manipulateAsync(result.assets[0].uri, [{ resize: { width: 300 } }], { compress: 0.7, format: SaveFormat.JPEG, base64: true });
          await savePhoto(`data:image/jpeg;base64,${resized.base64}`);
        }
      }},
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [id, yearKey]);

  async function savePhoto(dataUrl: string) {
    const pos = randPos();
    const photo = { id: Date.now().toString(), globe_id: id, data_url: dataUrl, lat: pos.lat, lng: pos.lng, year_key: yearKey, continent: pos.continent, added_at: new Date().toISOString() };
    const { error } = await supabase.from('photos').insert(photo);
    if (error) return Alert.alert('Error', 'Failed to save photo');
    await loadPhotos(yearKey);
  }

  if (loading || !globe) {
    return <View style={styles.container}><Text style={styles.loading}>Loading...</Text></View>;
  }

  const theme = getTheme(globe.theme);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <GlobeView photos={photos} theme={theme} partnerName={globe.partner_name} onPhotoTap={(photoId) => setSelectedPhoto(photoId)} />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.topInfo}>
        <Text style={[styles.topName, { color: theme.primary }]}>{globe.partner_name}'s World</Text>
        <Text style={styles.topCount}>{photos.length} photos</Text>
      </View>

      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={handleAddPhoto}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={!!selectedPhoto} transparent animationType="fade" onRequestClose={() => setSelectedPhoto(null)}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedPhoto(null)}>
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          {selectedPhoto && (
            <Image source={{ uri: photos.find(p => p.id === selectedPhoto)?.data_url }} style={styles.modalImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { color: '#fff', textAlign: 'center', marginTop: 100 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  backText: { color: '#fff', fontSize: 14 },
  topInfo: { position: 'absolute', top: 50, right: 16, zIndex: 10, alignItems: 'flex-end' },
  topName: { fontSize: 16, fontWeight: '700' },
  topCount: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  fab: { position: 'absolute', bottom: 40, alignSelf: 'center', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 34, fontWeight: '300' },
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.94)', justifyContent: 'center', alignItems: 'center' },
  modalClose: { position: 'absolute', top: 50, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  modalCloseText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalImage: { width: width * 0.9, height: width * 0.9, borderRadius: 16 },
});
