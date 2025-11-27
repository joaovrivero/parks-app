import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
  Alert,
  View,
  AppState,
  TextInput,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from 'react-native';

import AnimatedPressable from '~/components/AnimatedPressable';
import GradientButton from '~/components/GradientButton';
import { supabase } from '~/utils/supabase';

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <LinearGradient
      colors={['#ffffff', '#f8f9fa', '#f1f3f5']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}>
      <Stack.Screen options={{ title: 'Entrar', headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 justify-center px-6">
            {/* Header Section */}
            <MotiView
              from={{ opacity: 0, translateY: -30 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', delay: 100 }}
              className="mb-12 items-center">
              <MotiView
                from={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 200, damping: 12 }}
                className="mb-6"
                style={styles.logoShadow}>
                <Image
                  source={require('~/assets/parkslogo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </MotiView>
              <Text className="mb-3 text-4xl font-bold text-dark-900">Bem-vindo de Volta</Text>
              <Text className="text-center text-base text-dark-600">
                Entre para descobrir eventos incríveis ao ar livre
              </Text>
            </MotiView>

            {/* Login Card */}
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', delay: 300 }}
              className="mb-6 overflow-hidden rounded-3xl bg-white"
              style={styles.card}>
              <View className="gap-5 p-6">
                <View>
                  <Text className="mb-2 text-sm font-bold text-dark-700">Endereço de Email</Text>
                  <TextInput
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholder="voce@exemplo.com"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    className="rounded-2xl border-2 border-dark-200 bg-dark-50 p-4 text-base text-dark-900 focus:border-brand-500"
                  />
                </View>

                <View>
                  <Text className="mb-2 text-sm font-bold text-dark-700">Senha</Text>
                  <TextInput
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="none"
                    className="rounded-2xl border-2 border-dark-200 bg-dark-50 p-4 text-base text-dark-900 focus:border-brand-500"
                  />
                </View>

                <View className="mt-2">
                  <GradientButton
                    title={loading ? 'Entrando...' : 'Entrar'}
                    onPress={() => signInWithEmail()}
                    disabled={loading}
                    variant="teal"
                    size="lg"
                    className="w-full"
                  />
                </View>
              </View>
            </MotiView>

            {/* Sign Up Link */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 500 }}
              className="items-center">
              <Text className="mb-3 text-base text-dark-700">Não tem uma conta?</Text>
              <AnimatedPressable
                onPress={() => router.push('/(auth)/signup')}
                disabled={loading}
                className="rounded-2xl bg-white/80 px-8 py-3">
                <Text className="text-base font-bold text-brand-600">Criar Conta</Text>
              </AnimatedPressable>
            </MotiView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 80,
  },
  logoShadow: {
    shadowColor: '#1DDD96',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
});
