import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/contexts/AuthContext';
import { FREE_THEMES } from '../../src/lib/themes';

export default function CreateScreen() {
  const { user } = useAuth();
  const [partnerName, setPartnerName] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState('pink');
  const [loading, setLoading] = useState(false);

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
  }

  const handleCreate = async () => {
    if (!partnerName || !creatorName || !birthDay || !birthMonth || !birthYear) {
      return Alert.alert('Missing fields', 'Please fill in all fields');
    }
    const d = parseInt(birthDay), m = parseInt(birthMonth), y = parseInt(birthYear);
    if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2026) {
      return Alert.alert('Invalid date', 'Please enter a valid birth date');
    }
    setLoading(true);
    try {
      const slug = generateSlug(partnerName);
      const { error } = await supabase.from('globes').insert({
        creator_id: user!.id,
        slug,
        partner_name: partnerName,
        creator_name: creatorName,
        birth_day: d,
        birth_month: m,
        birth_year: y,
        theme,
        custom_message: message || 'You are my world.',
        is_premium: false,
      });
      if (error) throw error;
      Alert.alert('Globe Created! 🎉', `Share this link:\nmyworld.app/${slug}`, [
        { text: 'View Dashboard', onPress: () => router.replace('/(tabs)/dashboard') },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create globe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create a Globe</Text>
        <Text style={styles.subtitle}>Fill in your partner's details</Text>

        <Text style={styles.label}>Your Name</Text>
        <TextInput style={styles.input} placeholder="e.g. Usayeed" placeholderTextColor="rgba(255,255,255,0.3)" value={creatorName} onChangeText={setCreatorName} />

        <Text style={styles.label}>Partner's Name</Text>
        <TextInput style={styles.input} placeholder="e.g. Raisa" placeholderTextColor="rgba(255,255,255,0.3)" value={partnerName} onChangeText={setPartnerName} />

        <Text style={styles.label}>Birth Date</Text>
        <View style={styles.dateRow}>
          <TextInput style={[styles.input, styles.dateInput]} placeholder="DD" placeholderTextColor="rgba(255,255,255,0.3)" value={birthDay} onChangeText={setBirthDay} keyboardType="numeric" maxLength={2} />
          <TextInput style={[styles.input, styles.dateInput]} placeholder="MM" placeholderTextColor="rgba(255,255,255,0.3)" value={birthMonth} onChangeText={setBirthMonth} keyboardType="numeric" maxLength={2} />
          <TextInput style={[styles.input, styles.dateInput, { flex: 1.5 }]} placeholder="YYYY" placeholderTextColor="rgba(255,255,255,0.3)" value={birthYear} onChangeText={setBirthYear} keyboardType="numeric" maxLength={4} />
        </View>

        <Text style={styles.label}>Theme</Text>
        <View style={styles.themeRow}>
          {FREE_THEMES.map(t => (
            <TouchableOpacity key={t} style={[styles.themeBtn, theme === t && styles.themeBtnActive]} onPress={() => setTheme(t)}>
              <Text style={[styles.themeBtnText, theme === t && styles.themeBtnTextActive]}>{t === 'pink' ? '💗 Pink' : '💙 Blue'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Personal Message (optional)</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="You are my world..." placeholderTextColor="rgba(255,255,255,0.3)" value={message} onChangeText={setMessage} multiline numberOfLines={3} />

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleCreate} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Creating...' : 'Create Globe ✨'}</Text>
        </TouchableOpacity>
        <Text style={styles.freeNote}>Free: up to 10 photos, pink or blue theme. Upgrade to Pro for unlimited.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 80 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { color: 'rgba(255,255,255,0.5)', marginBottom: 32, fontSize: 14 },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderRadius: 14, padding: 16, fontSize: 16, color: '#fff' },
  textArea: { height: 80, textAlignVertical: 'top' },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateInput: { flex: 1, textAlign: 'center' },
  themeRow: { flexDirection: 'row', gap: 10 },
  themeBtn: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, alignItems: 'center' },
  themeBtnActive: { borderColor: '#FF69B4', backgroundColor: 'rgba(255,105,180,0.1)' },
  themeBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },
  themeBtnTextActive: { color: '#FF69B4' },
  btn: { backgroundColor: '#FF69B4', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 32 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  freeNote: { textAlign: 'center', color: 'rgba(255,255,255,0.25)', marginTop: 16, fontSize: 12 },
});
