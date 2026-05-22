import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, RAISA_GLOBE_SLUG } from '../lib/supabase';
import { getAge } from '../constants/theme';

const PHOTOS_KEY = '@raisa_globe_photos';
const GLOBE_ID_KEY = '@raisa_globe_id';

export interface GlobePhoto {
  id: string;
  uri: string;
  lat: number;
  lng: number;
  addedAt: string;
}

const CONTINENTS: { name: string; latRange: [number, number]; lngRange: [number, number] }[] = [
  { name: 'North America', latRange: [35, 60], lngRange: [-125, -70] },
  { name: 'South America', latRange: [-25, 10], lngRange: [-80, -35] },
  { name: 'Europe', latRange: [38, 65], lngRange: [-10, 40] },
  { name: 'Africa', latRange: [-20, 35], lngRange: [-15, 50] },
  { name: 'Asia', latRange: [15, 65], lngRange: [60, 145] },
  { name: 'Australia', latRange: [-35, -10], lngRange: [115, 155] },
];

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function getContinent(lat: number, lng: number): string {
  for (const c of CONTINENTS) {
    if (lat >= c.latRange[0] && lat <= c.latRange[1] &&
        lng >= c.lngRange[0] && lng <= c.lngRange[1]) {
      return c.name;
    }
  }
  return 'Asia';
}

export function generatePhotoPosition(): { lat: number; lng: number } {
  const continent = CONTINENTS[Math.floor(Math.random() * CONTINENTS.length)];
  return {
    lat: randomInRange(continent.latRange[0], continent.latRange[1]),
    lng: randomInRange(continent.lngRange[0], continent.lngRange[1]),
  };
}

async function getGlobeId(): Promise<string | null> {
  const cached = await AsyncStorage.getItem(GLOBE_ID_KEY);
  if (cached) return cached;

  const { data } = await supabase
    .from('globes')
    .select('id')
    .eq('slug', RAISA_GLOBE_SLUG)
    .single();

  if (data?.id) {
    await AsyncStorage.setItem(GLOBE_ID_KEY, data.id);
    return data.id;
  }
  return null;
}

function getYearKey(): string {
  const age = getAge();
  return `${age}-${age + 1}`;
}

export function usePhotos() {
  const [photos, setPhotos] = useState<GlobePhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const globeId = await getGlobeId();
      if (globeId) {
        const yearKey = getYearKey();
        const { data } = await supabase
          .from('photos')
          .select('id, data_url, lat, lng, added_at')
          .eq('globe_id', globeId)
          .eq('year_key', yearKey)
          .order('added_at', { ascending: false });

        if (data && data.length > 0) {
          const supabasePhotos: GlobePhoto[] = data.map((p: any) => ({
            id: p.id,
            uri: p.data_url,
            lat: p.lat,
            lng: p.lng,
            addedAt: p.added_at,
          }));
          setPhotos(supabasePhotos);
          await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(supabasePhotos));
          setLoading(false);
          return;
        }
      }

      const stored = await AsyncStorage.getItem(PHOTOS_KEY);
      if (stored) {
        setPhotos(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load photos:', e);
      const stored = await AsyncStorage.getItem(PHOTOS_KEY);
      if (stored) {
        setPhotos(JSON.parse(stored));
      }
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

    try {
      const globeId = await getGlobeId();
      if (globeId) {
        await supabase.from('photos').insert({
          id: newPhoto.id,
          globe_id: globeId,
          data_url: uri,
          lat: pos.lat,
          lng: pos.lng,
          year_key: getYearKey(),
          continent: getContinent(pos.lat, pos.lng),
        });
      }
    } catch (e) {
      console.error('Failed to save photo to Supabase:', e);
    }

    return newPhoto;
  }, [photos]);

  const removePhoto = useCallback(async (id: string) => {
    const updated = photos.filter((p) => p.id !== id);
    setPhotos(updated);
    await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(updated));

    try {
      await supabase.from('photos').delete().eq('id', id);
    } catch (e) {
      console.error('Failed to delete photo from Supabase:', e);
    }
  }, [photos]);

  return { photos, loading, addPhoto, removePhoto, reload: loadPhotos };
}
