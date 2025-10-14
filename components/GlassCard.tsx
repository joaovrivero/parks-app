import { BlurView } from 'expo-blur';
import React from 'react';
import { View, ViewProps, Platform, StyleSheet } from 'react-native';

type GlassCardProps = {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  children: React.ReactNode;
  className?: string;
} & Omit<ViewProps, 'children'>;

export default function GlassCard({
  intensity = 20,
  tint = 'light',
  children,
  className = '',
  style,
  ...props
}: GlassCardProps) {
  // On web, we'll use CSS backdrop-filter
  if (Platform.OS === 'web') {
    return (
      <View
        className={`rounded-3xl border border-white/20 bg-white/70 backdrop-blur-xl ${className}`}
        style={[styles.webGlass, style]}
        {...props}>
        {children}
      </View>
    );
  }

  // On native, use BlurView
  return (
    <View className={className} style={style} {...props}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={styles.blurContainer}
        className="overflow-hidden rounded-3xl border border-white/20">
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
  },
  webGlass: {
    backdropFilter: 'blur(20px)',
  },
});
