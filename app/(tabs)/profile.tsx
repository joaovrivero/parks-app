import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Pressable,
  TextInput,
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';

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

      const { data, error } = await supabase.from('profiles').upsert(updates).select();

      if (error) {
        throw error;
      }

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1">
      <Stack.Screen options={{ title: 'Profile', headerShown: false }} />

      <LinearGradient
        colors={['#e6faf3', '#b3f0d9', '#f8fafc']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-6"
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}>
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
                {fullName || username || 'Seu Nome'}
              </Text>
              <Text className="text-dark-500">{session?.user?.email}</Text>
            </View>
          </View>

          {/* Personal Information Card */}
          <View className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
            <Text className="mb-4 text-lg font-semibold text-dark-800">Informações Pessoais</Text>

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
                <Text className="mb-2 text-sm font-medium text-dark-700">Nome Completo</Text>
                <TextInput
                  onChangeText={(text) => setFullName(text)}
                  value={fullName}
                  placeholder="Digite seu nome completo"
                  autoCapitalize="words"
                  className="rounded-xl border border-dark-200 bg-white p-4 text-dark-800 focus:border-brand-500"
                />
              </View>

              <View>
                <Text className="mb-2 text-sm font-medium text-dark-700">Nome de Usuário</Text>
                <TextInput
                  onChangeText={(text) => setUsername(text)}
                  value={username}
                  placeholder="Escolha um nome de usuário"
                  autoCapitalize="none"
                  className="rounded-xl border border-dark-200 bg-white p-4 text-dark-800 focus:border-brand-500"
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mb-6 gap-3">
            <Pressable
              onPress={() =>
                updateProfile({ username, avatar_url: avatarUrl, full_name: fullName })
              }
              disabled={loading}
              className="items-center rounded-xl bg-brand-500 p-4 shadow-md disabled:opacity-50">
              <Text className="text-lg font-semibold text-white">
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => supabase.auth.signOut()}
              className="items-center rounded-xl border-2 border-dark-300 bg-white p-4">
              <Text className="text-lg font-semibold text-dark-700">Sair</Text>
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
