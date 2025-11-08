import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { MotiView } from 'moti';
import { useState } from 'react';
import { StyleSheet, View, Alert, ActivityIndicator, Text } from 'react-native';

import GradientButton from './GradientButton';

import { supabase } from '~/utils/supabase';

interface Props {
  size: number;
  url: string | null;
  onUpload: (filePath: string) => void;
}

const getPublicUrl = (path: string): string => {
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
};

export default function Avatar({ url, size = 150, onUpload }: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const queryClient = useQueryClient();
  const avatarSize = { height: size, width: size };

  const avatarUrl = url ? getPublicUrl(url) : null;

  const uploadMutation = useMutation({
    mutationFn: async (): Promise<string> => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        quality: 1,
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        throw new Error('Image selection cancelled');
      }

      const image = result.assets[0];
      if (!image.uri) {
        throw new Error('No image uri!');
      }

      const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());
      const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const path = `${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arraybuffer, {
          contentType: image.mimeType ?? 'image/jpeg',
        });

      if (uploadError) {
        throw uploadError;
      }

      return data.path;
    },
    onSuccess: (filePath) => {
      queryClient.invalidateQueries({ queryKey: ['avatar', url] });
      onUpload(filePath);
    },
    onError: (error) => {
      Alert.alert('Upload failed', error.message);
    },
  });

  return (
    <View className="items-center gap-4">
      <MotiView
        from={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}>
        <View style={[avatarSize, styles.avatarContainer]}>
          {avatarUrl && !imageError ? (
            <>
              <Image
                source={{ uri: avatarUrl }}
                accessibilityLabel="Avatar"
                style={[avatarSize, styles.avatar]}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                transition={200}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              {!imageLoaded && (
                <View style={[avatarSize, styles.avatar, styles.noImage, styles.loadingOverlay]}>
                  <ActivityIndicator size="small" color="#1DDD96" />
                </View>
              )}
            </>
          ) : (
            <View style={[avatarSize, styles.avatar, styles.noImage]}>
              <Text className="text-4xl">📸</Text>
            </View>
          )}
        </View>
      </MotiView>

      <GradientButton
        title={uploadMutation.isPending ? 'Uploading...' : 'Upload Photo'}
        onPress={() => uploadMutation.mutate()}
        disabled={uploadMutation.isPending}
        variant="teal"
        size="sm"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    shadowColor: '#1DDD96',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  avatar: {
    borderRadius: 24,
    overflow: 'hidden',
    maxWidth: '100%',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  noImage: {
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});
