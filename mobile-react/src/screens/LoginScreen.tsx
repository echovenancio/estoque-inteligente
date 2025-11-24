import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Surface, useTheme, HelperText } from 'react-native-paper';
import { API } from '../services/api';
import { CredStore } from '../services/credStore';
import { useRouter } from 'expo-router';
import { instockLogo } from '../assets';

// @ts-ignore
const Image = require('react-native').Image;

export const LoginScreen: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const onAction = async () => {
    if (!email || !password) {
      setError('Preencha e-mail e senha');
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      setError('As senhas não conferem');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let res;
      if (isRegistering) {
        res = await API.register({ email, password });
      } else {
        res = await API.login({ email, password });
      }
      
      await CredStore.setToken((res as any).idToken || (res as any).token || '');

      // Always redirect to store selection for now
      router.replace('/store-selection');
    } catch (e: any) {
      console.warn('auth error', e);
      setError(e?.response?.data?.detail || e?.response?.data?.message || e.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Card style={styles.card} elevation={4}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.logoContainer}>
              <Image source={instockLogo} style={styles.logo} resizeMode="contain" />
            </View>

            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
              {isRegistering ? 'Criar Conta' : 'Bem-vindo'}
            </Text>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              {isRegistering ? 'Preencha os dados abaixo' : 'Faça login para continuar'}
            </Text>

            <TextInput
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              disabled={loading}
              mode="outlined"
              left={<TextInput.Icon icon="email" />}
              style={styles.input}
              error={!!error && !email}
            />

            <TextInput
              label="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              disabled={loading}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
              error={!!error && !password}
            />

            {isRegistering && (
              <TextInput
                label="Confirmar Senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                disabled={loading}
                mode="outlined"
                left={<TextInput.Icon icon="lock-check" />}
                style={styles.input}
                error={!!error && password !== confirmPassword}
              />
            )}

            {error ? (
              <HelperText type="error" visible={!!error} style={styles.errorText}>
                {error}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={onAction}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              {isRegistering ? 'Cadastrar' : 'Entrar'}
            </Button>

            <Button
              mode="text"
              onPress={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setConfirmPassword('');
              }}
              disabled={loading}
              style={styles.textButton}
            >
              {isRegistering ? 'Já tem uma conta? Entre' : 'Não tem conta? Cadastre-se'}
            </Button>
          </Card.Content>
        </Card>
      </KeyboardAvoidingView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    marginHorizontal: 8,
  },
  cardContent: {
    paddingVertical: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 160,
    height: 64,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
