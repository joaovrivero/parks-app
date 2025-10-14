import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Button, Pressable, TextInput, View, Text, ScrollView } from 'react-native';

import Avatar from '~/components/Avatar';
import { useAuth } from '~/contexts/AuthProvider';
import { supabase } from '~/utils/supabase';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');

  const [avatarUrl, setAvatarUrl] = useState('');

  const { session } = useAuth();

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, avatar_url, full_name`)
        .eq('id', session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username || '');
        setAvatarUrl(data.avatar_url || '');
        setFullName(data.full_name || '');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    avatar_url,
    full_name,
  }: {
    username: string;
    avatar_url: string;
    full_name: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const updates = {
        id: session?.user.id,
        username,
        avatar_url,
        full_name,
        updated_at: new Date(),
      };

      console.log('Updating profile with:', updates);

      const { data, error } = await supabase.from('profiles').upsert(updates).select();

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      console.log('Profile updated successfully:', data);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-dark-50">
      <Stack.Screen options={{ title: 'Profile', headerTitleStyle: { fontWeight: '600' } }} />

      <ScrollView className="flex-1" contentContainerClassName="p-6">
        {/* Profile Header Card */}
        <View className="mb-6 items-center rounded-2xl bg-white p-6 shadow-sm">
          <Avatar
            size={120}
            url={avatarUrl || null}
            onUpload={(url: string) => {
              setAvatarUrl(url);
              updateProfile({ username, avatar_url: url, full_name: fullName });
            }}
          />
          <View className="mt-4 items-center">
            <Text className="text-xl font-bold text-dark-800">
              {fullName || username || 'Your Name'}
            </Text>
            <Text className="text-dark-500">{session?.user?.email}</Text>
          </View>
        </View>

        {/* Personal Information Card */}
        <View className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-dark-800">Personal Information</Text>

          <View className="gap-4">
            <View>
              <Text className="mb-2 text-sm font-medium text-dark-700">Email</Text>
              <TextInput
                editable={false}
                value={session?.user?.email}
                placeholder="email"
                autoCapitalize="none"
                className="rounded-xl border border-dark-200 bg-dark-50 p-4 text-dark-500"
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-dark-700">Full Name</Text>
              <TextInput
                onChangeText={(text) => setFullName(text)}
                value={fullName}
                placeholder="Enter your full name"
                autoCapitalize="words"
                className="rounded-xl border border-dark-200 bg-white p-4 text-dark-800 focus:border-brand-500"
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-dark-700">Username</Text>
              <TextInput
                onChangeText={(text) => setUsername(text)}
                value={username}
                placeholder="Choose a username"
                autoCapitalize="none"
                className="rounded-xl border border-dark-200 bg-white p-4 text-dark-800 focus:border-brand-500"
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mb-6 gap-3">
          <Pressable
            onPress={() => updateProfile({ username, avatar_url: avatarUrl, full_name: fullName })}
            disabled={loading}
            className="items-center rounded-xl bg-brand-500 p-4 shadow-md disabled:opacity-50">
            <Text className="text-lg font-semibold text-white">
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => supabase.auth.signOut()}
            className="items-center rounded-xl border-2 border-dark-300 bg-white p-4">
            <Text className="text-lg font-semibold text-dark-700">Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
