import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/contexts/AuthContext';

interface Globe {
  id: string; slug: string; partner_name: string; creator_name: string;
  birth_day: number; birth_month: number; birth_year: number;
  theme: string; is_premium: boolean; views: number; created_at: string;
}

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const [globes, setGlobes] = useState<Globe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadGlobes(); }, []);

  async function loadGlobes() {
    setLoading(true);
    const { data } = await supabase.from('globes').select('*').eq('creator_id', user?.id).order('created_at', { ascending: false });
    setGlobes(data || []);
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Globes</Text>
        <TouchableOpacity onPress={() => Alert.alert('Sign Out', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Sign Out', onPress: signOut }])}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={globes}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadGlobes} tintColor="#FF69B4" />}
        ListEmptyComponent={<Text style={styles.empty}>No globes yet.{'\n'}Tap ✨ Create to make your first!</Text>}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/globe/${item.id}`)}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardName}>{item.partner_name}'s World</Text>
              <Text style={styles.cardMeta}>{item.slug} • {item.theme} theme {item.is_premium ? '• Pro' : ''}</Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  logout: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  empty: { textAlign: 'center', color: 'rgba(255,255,255,0.3)', marginTop: 80, fontSize: 15, lineHeight: 24 },
  card: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderRadius: 16, padding: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  cardLeft: { flex: 1 },
  cardName: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 4 },
  cardMeta: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  cardArrow: { fontSize: 20, color: 'rgba(255,255,255,0.2)' },
});
