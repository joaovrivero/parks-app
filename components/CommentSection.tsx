import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useState } from 'react';
import { Text, View, TextInput, Pressable, ActivityIndicator } from 'react-native';

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
    console.error('Comments fetch error:', commentsError);
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
    console.error('Profiles fetch error:', profilesError);
    // Continue without profiles data
  }

  console.log('Fetched profiles:', profilesData);

  // Join comments with profiles
  const profilesMap = new Map(profilesData?.map((p) => [p.id, p]) || []);

  const result = commentsData.map((comment) => ({
    ...comment,
    profiles: profilesMap.get(comment.user_id) || { username: null, avatar_url: null },
  }));

  console.log('Comments with joined profiles:', result);

  return result;
};

export default function CommentSection({ eventId }: CommentSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

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
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          event_id: eventId,
          user_id: user!.id,
          content,
        })
        .select('*, profiles(username, avatar_url)')
        .single();

      if (error) throw new Error(`Failed to post comment: ${error.message}`);
      return data as CommentWithProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', eventId] });
      setCommentText('');
    },
  });

  const handlePostComment = () => {
    if (commentText.trim()) {
      postCommentMutation.mutate(commentText);
    }
  };

  if (isLoading) {
    return (
      <View className="items-center justify-center p-5">
        <ActivityIndicator size="small" color="#0066cc" />
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
            onPress={handlePostComment}
            disabled={!commentText.trim() || postCommentMutation.isPending}
            className={`rounded-lg p-3 px-5 ${
              !commentText.trim() || postCommentMutation.isPending ? 'bg-gray-300' : 'bg-blue-500'
            }`}>
            <Text className="font-semibold text-white">
              {postCommentMutation.isPending ? 'Posting...' : 'Post'}
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
                <Text className="text-gray-800">{item.content}</Text>
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
