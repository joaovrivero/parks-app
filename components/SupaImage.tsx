import { Image } from 'expo-image';
import { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

import { supabase } from '~/utils/supabase';

type SupaImageProps = {
  path: string;
  className: string;
  placeholder?: boolean;
  bucket?: string;
};

const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export default function SupaImage({
  path,
  className,
  placeholder = true,
  bucket = 'avatars',
}: SupaImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!path) {
    return <View className={`${className} bg-slate-200`} />;
  }

  if (imageError) {
    return <View className={`${className} bg-slate-300`} />;
  }

  const publicUrl = getPublicUrl(bucket, path);

  return (
    <View className={className}>
      <Image
        source={{ uri: publicUrl }}
        className={className}
        onLoad={() => {
          setImageLoaded(true);
        }}
        onError={() => {
          setImageError(true);
        }}
        transition={200}
        contentFit="cover"
        cachePolicy="memory-disk"
        style={{
          flex: 1,
          opacity: imageLoaded ? 1 : 0,
        }}
      />
      {!imageLoaded && !imageError && (
        <View className={`${className} absolute inset-0 items-center justify-center bg-slate-200`}>
          {placeholder && <ActivityIndicator size="small" color="#666" />}
        </View>
      )}
    </View>
  );
}
