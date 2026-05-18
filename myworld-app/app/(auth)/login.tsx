import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      Alert.alert('Login Failed', e.message || 'Check your email and password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🌍 MyWorld</Text>
        <Text style={styles.subtitle}>Create unforgettable birthday globes</Text>

        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="rgba(255,255,255,0.3)" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="rgba(255,255,255,0.3)" value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
        </TouchableOpacity>

        <Link href="/(auth)/signup" style={styles.link}>Don't have an account? <Text style={{ color: '#FF69B4', fontWeight: '600' }}>Sign Up</Text></Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#0a0a0f' },
  content: { paddingHorizontal: 32 },
  logo: { fontSize: 32, fontWeight: '800', color: '#FF69B4', textAlign: 'center', marginBottom: 4, letterSpacing: -1 },
  subtitle: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 40, fontSize: 14 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderRadius: 14, padding: 16, fontSize: 16, color: '#fff', marginBottom: 12 },
  btn: { backgroundColor: '#FF69B4', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginTop: 24, fontSize: 14 },
});
