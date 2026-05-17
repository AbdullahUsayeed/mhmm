import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PHOTOS_KEY = '@raisa_globe_photos';

export interface GlobePhoto {
  id: string;
  uri: string;
  lat: number;
  lng: number;
  addedAt: string;
}

const CONTINENTS: { latRange: [number, number]; lngRange: [number, number] }[] = [
  { latRange: [35, 60], lngRange: [-125, -70] },
  { latRange: [-25, 10], lngRange: [-80, -35] },
  { latRange: [38, 65], lngRange: [-10, 40] },
  { latRange: [-20, 35], lngRange: [-15, 50] },
  { latRange: [15, 65], lngRange: [60, 145] },
  { latRange: [-35, -10], lngRange: [115, 155] },
];

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function generatePhotoPosition(): { lat: number; lng: number } {
  const continent = CONTINENTS[Math.floor(Math.random() * CONTINENTS.length)];
  return {
    lat: randomInRange(continent.latRange[0], continent.latRange[1]),
    lng: randomInRange(continent.lngRange[0], continent.lngRange[1]),
  };
}

export function usePhotos() {
  const [photos, setPhotos] = useState<GlobePhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const stored = await AsyncStorage.getItem(PHOTOS_KEY);
      if (stored) {
        setPhotos(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load photos:', e);
    } finally {
      setLoading(false);
    }
  };

  const addPhoto = useCallback(async (uri: string) => {
    const pos = generatePhotoPosition();
    const newPhoto: GlobePhoto = {
      id: Date.now().toString(),
      uri,
      lat: pos.lat,
      lng: pos.lng,
      addedAt: new Date().toISOString(),
    };
    const updated = [...photos, newPhoto];
    setPhotos(updated);
    await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(updated));
    return newPhoto;
  }, [photos]);

  const removePhoto = useCallback(async (id: string) => {
    const updated = photos.filter((p) => p.id !== id);
    setPhotos(updated);
    await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(updated));
  }, [photos]);

  return { photos, loading, addPhoto, removePhoto, reload: loadPhotos };
}
