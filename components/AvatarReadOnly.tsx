import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, View, Image, ActivityIndicator, Text } from 'react-native';

import { supabase } from '~/utils/supabase';

interface Props {
  size: number;
  url: string | null;
  fallbackText?: string | null;
}

const downloadImage = async (path: string): Promise<string> => {
  const { data, error } = await supabase.storage.from('avatars').download(path);

  if (error) {
    throw new Error(`Failed to download avatar: ${error.message}`);
  }

  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.readAsDataURL(data);
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error('Failed to read avatar data'));
  });
};

export default function AvatarReadOnly({ url, size = 40, fallbackText }: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const avatarSize = { height: size, width: size };

  const {
    data: avatarUrl,
    isLoading: isDownloading,
    isError,
  } = useQuery({
    queryKey: ['avatar', url],
    queryFn: () => downloadImage(url!),
    enabled: !!url,
    staleTime: 1000 * 30, // 30 seconds - refetch more often for updated avatars
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  const showLoadingState = isDownloading || !avatarUrl || !imageLoaded;

  return (
    <View style={[avatarSize, styles.avatar]}>
      {avatarUrl && !isError ? (
        <>
          <Image
            source={{ uri: avatarUrl }}
            accessibilityLabel="Avatar"
            style={[avatarSize, styles.avatar, styles.image]}
            onLoad={() => setImageLoaded(true)}
          />
          {showLoadingState && (
            <View style={[avatarSize, styles.avatar, styles.noImage, styles.loadingOverlay]}>
              <ActivityIndicator size="small" color="#666" />
            </View>
          )}
        </>
      ) : (
        <View style={[avatarSize, styles.avatar, styles.noImage]}>
          {isDownloading ? (
            <ActivityIndicator size="small" color="#666" />
          ) : (
            <Text style={styles.fallbackText}>
              {fallbackText?.[0]?.toUpperCase() || '?'}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 20,
    overflow: 'hidden',
    maxWidth: '100%',
  },
  image: {
    objectFit: 'cover',
    paddingTop: 0,
  },
  noImage: {
    backgroundColor: '#e5e7eb',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgb(200, 200, 200)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  fallbackText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4b5563',
  },
});
