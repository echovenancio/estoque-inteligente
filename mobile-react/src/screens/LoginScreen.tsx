import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import * as RN from 'react-native';
// runtime-safe Image import — use require and ignore TS here because the project's types are mismatched
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Image: any = require('react-native').Image;
import { useTheme } from '../styles/theme';
import { API } from '../services/api';
import { CredStore } from '../services/credStore';
import { useRouter } from 'expo-router';
import { instockLogo } from '../assets';

export const LoginScreen: React.FC = () => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha e-mail e senha');
      return;
    }
    setLoading(true);
    try {
      const res = await API.login({ email, password });
      // store token
      await CredStore.setToken((res as any).idToken || (res as any).token || '');

      // rudimentary role check like Android app (replace with server role when available)
      const userEmail = (res as any).email || email;
      if (userEmail.includes('loja')) {
        router.push('/inventory');
        await CredStore.setUserType('loja');
      } else if (userEmail.includes('fabrica')) {
        router.push('/fabrica');
        await CredStore.setUserType('fabrica');
      } else {
        router.push('/inventory');
      }
    } catch (e: any) {
      console.warn('login error', e);
      Alert.alert('Erro', e?.response?.data?.message || e.message || 'Erro no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
  <Image source={instockLogo} style={styles.logo} resizeMode="contain" />
        <Text style={[styles.title, { color: colors.primary }]}>Entrar</Text>

        <TextInput
          placeholder="E-mail"
          placeholderTextColor={colors.placeholder}
          style={[styles.input, { borderColor: colors.border }]}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          placeholder="Senha"
          placeholderTextColor={colors.placeholder}
          style={[styles.input, { borderColor: colors.border }]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={onLogin} disabled={loading}>
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>{loading ? 'Entrando...' : 'Entrar'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  card: { padding: 24, borderRadius: 8, elevation: 2, alignItems: 'center' },
  logo: { width: 140, height: 56, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  input: { height: 48, borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, marginBottom: 12 },
  button: { height: 48, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { fontWeight: '600' },
});
