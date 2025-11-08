import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';

import { supabase } from '~/utils/supabase';

interface Props {
  size: number;
  url: string | null;
  fallbackText?: string | null;
}

const getPublicUrl = (path: string): string => {
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
};

export default function AvatarReadOnly({ url, size = 40, fallbackText }: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const avatarSize = { height: size, width: size };

  const avatarUrl = url ? getPublicUrl(url) : null;

  return (
    <View style={[avatarSize, styles.avatar]}>
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
              <ActivityIndicator size="small" color="#666" />
            </View>
          )}
        </>
      ) : (
        <View style={[avatarSize, styles.avatar, styles.noImage]}>
          <Text style={styles.fallbackText}>{fallbackText?.[0]?.toUpperCase() || '?'}</Text>
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
