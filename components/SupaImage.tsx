import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';

import { supabase } from '~/utils/supabase';

type SupaImageProps = {
  path: string;
  className: string;
  placeholder?: boolean;
};

const downloadImage = async (path: string): Promise<string> => {
  const { data, error } = await supabase.storage.from('avatars').download(path);

  if (error) {
    throw new Error(`Failed to download image: ${error.message}`);
  }

  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.readAsDataURL(data);
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error('Failed to read image data'));
  });
};

export default function SupaImage({ path, className, placeholder = true }: SupaImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const {
    data: uri,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['supabase-image', path],
    queryFn: () => downloadImage(path),
    enabled: !!path,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
  });

  if (!path) {
    return <View className={`${className} bg-slate-200`} />;
  }

  if (isLoading || !uri) {
    return (
      <View className={`${className} items-center justify-center bg-slate-200`}>
        {placeholder && <ActivityIndicator size="small" color="#666" />}
      </View>
    );
  }

  if (isError) {
    console.log('Error loading image:', error?.message);
    return <View className={`${className} bg-slate-300`} />;
  }

  return (
    <View className={className}>
      <Image
        source={{ uri }}
        className={className}
        onLoad={() => setImageLoaded(true)}
        style={{
          opacity: imageLoaded ? 1 : 0,
        }}
      />
      {!imageLoaded && (
        <View className={`${className} absolute inset-0 items-center justify-center bg-slate-200`}>
          <ActivityIndicator size="small" color="#666" />
        </View>
      )}
    </View>
  );
}
