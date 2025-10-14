import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View, TextInput, Pressable, Text } from 'react-native';

import { supabase } from '~/utils/supabase';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    if (!session) Alert.alert('Please check your inbox for email verification!');
    setLoading(false);
  }

  return (
    <View className="flex-1 bg-gradient-to-br from-brand-50 to-brand-100">
      <Stack.Screen options={{ title: 'Sign up', headerShown: false }} />

      <View className="flex-1 justify-center px-6">
        {/* Header Section */}
        <View className="mb-12 items-center">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-brand-500">
            <Text className="text-2xl font-bold text-white">🌳</Text>
          </View>
          <Text className="mb-2 text-3xl font-bold text-dark-800">Join the Community</Text>
          <Text className="text-center text-dark-600">
            Create your account to start discovering local park events
          </Text>
        </View>

        {/* Signup Card */}
        <View className="rounded-2xl bg-white p-6 shadow-lg">
          <View className="gap-4">
            <View>
              <Text className="mb-2 text-sm font-medium text-dark-700">Email</Text>
              <TextInput
                onChangeText={(text) => setEmail(text)}
                value={email}
                placeholder="Enter your email"
                autoCapitalize="none"
                keyboardType="email-address"
                className="rounded-xl border border-dark-200 bg-dark-50 p-4 text-dark-800 focus:border-brand-500"
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-dark-700">Password</Text>
              <TextInput
                onChangeText={(text) => setPassword(text)}
                value={password}
                secureTextEntry
                placeholder="Create a password"
                autoCapitalize="none"
                className="rounded-xl border border-dark-200 bg-dark-50 p-4 text-dark-800 focus:border-brand-500"
              />
              <Text className="mt-1 text-xs text-dark-500">Minimum 6 characters</Text>
            </View>

            <Pressable
              onPress={() => signUpWithEmail()}
              disabled={loading}
              className="mt-4 items-center rounded-xl bg-brand-500 p-4 shadow-md disabled:opacity-50">
              <Text className="text-lg font-semibold text-white">
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Sign In Link */}
        <View className="mt-6 items-center">
          <Text className="text-dark-600">Already have an account?</Text>
          <Pressable onPress={() => router.back()} disabled={loading} className="mt-2">
            <Text className="font-semibold text-brand-600">Sign In</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
