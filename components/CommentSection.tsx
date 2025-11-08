import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import { Text, View, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';

import AvatarReadOnly from '~/components/AvatarReadOnly';
import { useAuth } from '~/contexts/AuthProvider';
import { CommentWithProfile } from '~/types/db';
import { supabase } from '~/utils/supabase';

dayjs.extend(relativeTime);

interface CommentSectionProps {
  eventId: number;
}

const fetchComments = async (eventId: number): Promise<CommentWithProfile[]> => {
  // Fetch comments and profiles separately, then join them manually
  const { data: commentsData, error: commentsError } = await supabase
    .from('comments')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (commentsError) {
    throw new Error(`Failed to fetch comments: ${commentsError.message}`);
  }

  if (!commentsData || commentsData.length === 0) {
    return [];
  }

  // Get unique user IDs
  const userIds = [...new Set(commentsData.map((c) => c.user_id))];

  // Fetch profiles for those users
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', userIds);

  if (profilesError) {
    // Continue without profiles data
  }

  // Join comments with profiles
  const profilesMap = new Map(profilesData?.map((p) => [p.id, p]) || []);

  const result = commentsData.map((comment) => ({
    ...comment,
    profiles: profilesMap.get(comment.user_id) || { username: null, avatar_url: null },
  }));

  return result;
};

export default function CommentSection({ eventId }: CommentSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    data: comments,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['comments', eventId],
    queryFn: () => fetchComments(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 10, // 10 seconds - refetch more often to get updated profiles
  });

  if (error) {
    console.error('Query error:', error);
  }

  const postCommentMutation = useMutation({
    mutationFn: async ({ content, imageUrl }: { content: string; imageUrl: string | null }) => {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          event_id: eventId,
          user_id: user!.id,
          content,
          image_url: imageUrl,
        })
        .select('*, profiles(username, avatar_url)')
        .single();

      if (error) throw new Error(`Failed to post comment: ${error.message}`);
      return data as CommentWithProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', eventId] });
      setCommentText('');
      setSelectedImage(null);
    },
  });

  // Real-time subscription for new comments
  useEffect(() => {
    if (!eventId) return;

    const channel = supabase
      .channel(`comments:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log('New comment received:', payload);
          // Invalidate to refetch comments with profile data
          queryClient.invalidateQueries({ queryKey: ['comments', eventId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log('Comment deleted:', payload);
          queryClient.invalidateQueries({ queryKey: ['comments', eventId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, queryClient]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        if (image.uri) {
          setSelectedImage(image.uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image picker error:', error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        if (image.uri) {
          setSelectedImage(image.uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      console.error('Camera error:', error);
    }
  };

  const handleImageOption = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: handlePickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const uploadImage = async (imageUri: string): Promise<string> => {
    const arraybuffer = await fetch(imageUri).then((res) => res.arrayBuffer());
    const fileExt = imageUri.split('.').pop()?.toLowerCase() ?? 'jpeg';
    const path = `comment-images/${Date.now()}.${fileExt}`;

    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, arraybuffer, {
        contentType: `image/${fileExt}`,
      });

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    return data.path;
  };

  const handlePostComment = async () => {
    if (!commentText.trim() && !selectedImage) {
      return;
    }

    try {
      let imageUrl: string | null = null;

      if (selectedImage) {
        setIsUploadingImage(true);
        imageUrl = await uploadImage(selectedImage);
        setIsUploadingImage(false);
      }

      postCommentMutation.mutate({ content: commentText.trim(), imageUrl });
    } catch (error) {
      setIsUploadingImage(false);
      Alert.alert('Error', 'Failed to upload image');
      console.error('Upload error:', error);
    }
  };

  if (isLoading) {
    return (
      <View className="items-center justify-center p-5">
        <ActivityIndicator size="small" color="#1DDD96" />
      </View>
    );
  }

  // Still show the UI even if comments fail to load, but show error in the list
  const showError = isError;

  return (
    <View className="border-t border-gray-200">
      {/* Comment Input */}
      <View className="border-b border-gray-200 bg-white p-3">
        <Text className="mb-2 text-lg font-bold">Comments</Text>

        {/* Image Preview */}
        {selectedImage && (
          <View className="mb-2 relative">
            <Image
              source={{ uri: selectedImage }}
              style={{ width: '100%', height: 200, borderRadius: 8 }}
              contentFit="cover"
            />
            <Pressable
              onPress={handleRemoveImage}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-2">
              <Text className="text-white font-bold">✕</Text>
            </Pressable>
          </View>
        )}

        <View className="flex-row items-center gap-2">
          <TextInput
            className="flex-1 rounded-lg border border-gray-300 bg-white p-3"
            placeholder="Add a comment..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={handleImageOption}
            disabled={isUploadingImage || postCommentMutation.isPending}
            className={`rounded-lg p-3 ${
              isUploadingImage || postCommentMutation.isPending ? 'bg-gray-300' : 'bg-gray-500'
            }`}>
            <Text className="text-xl">📷</Text>
          </Pressable>
          <Pressable
            onPress={handlePostComment}
            disabled={(!commentText.trim() && !selectedImage) || isUploadingImage || postCommentMutation.isPending}
            className={`rounded-lg p-3 px-5 ${
              (!commentText.trim() && !selectedImage) || isUploadingImage || postCommentMutation.isPending ? 'bg-gray-300' : 'bg-blue-500'
            }`}>
            <Text className="font-semibold text-white">
              {isUploadingImage ? 'Uploading...' : postCommentMutation.isPending ? 'Posting...' : 'Post'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Comments List - using ScrollView content instead of FlatList to avoid nesting */}
      <View className="p-3">
        {showError ? (
          <Text className="py-8 text-center text-red-600">
            Failed to load comments. Please check console for details.
          </Text>
        ) : comments && comments.length > 0 ? (
          comments.map((item) => (
            <View key={item.id} className="mb-4 flex-row gap-3 border-b border-gray-100 pb-4">
              <AvatarReadOnly
                size={40}
                url={item.profiles?.avatar_url}
                fallbackText={item.profiles?.username || item.profiles?.id}
              />
              <View className="flex-1">
                <View className="mb-1 flex-row items-center gap-2">
                  <Text className="font-semibold">
                    {item.profiles?.username || item.profiles?.id?.slice(0, 8) || 'Anonymous'}
                  </Text>
                  <Text className="text-xs text-gray-500">{dayjs(item.created_at).fromNow()}</Text>
                </View>
                {item.content && <Text className="text-gray-800 mb-2">{item.content}</Text>}
                {item.image_url && (
                  <Image
                    source={{ uri: supabase.storage.from('avatars').getPublicUrl(item.image_url).data.publicUrl }}
                    style={{ width: '100%', height: 200, borderRadius: 8, marginTop: 8 }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                )}
              </View>
            </View>
          ))
        ) : (
          <Text className="py-8 text-center text-gray-500">
            No comments yet. Be the first to comment!
          </Text>
        )}
      </View>
    </View>
  );
}
