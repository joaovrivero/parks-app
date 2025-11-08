import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, StyleSheet } from 'react-native';

import AnimatedPressable from './AnimatedPressable';

type GradientButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'teal' | 'warm' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
};

const gradientColors = {
  teal: ['#1DDD96', '#35B385'],
  accent: ['#1DDD96', '#35B385'],
  warm: ['#1DDD96', '#35B385'],
};

export default function GradientButton({
  title,
  onPress,
  variant = 'teal',
  size = 'md',
  disabled = false,
  className = '',
}: GradientButtonProps) {
  const sizeStyles = {
    sm: 'px-4 py-2',
    md: 'px-6 py-4',
    lg: 'px-8 py-5',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      className={`overflow-hidden rounded-3xl ${disabled ? 'opacity-50' : ''} ${className}`}
      scaleOnPress={0.98}>
      <LinearGradient
        colors={gradientColors[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
        className={`${sizeStyles[size]} shadow-elevation-3`}>
        <Text className={`${textSizeStyles[size]} text-center font-bold text-white`}>{title}</Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
});
