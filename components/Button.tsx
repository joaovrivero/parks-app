import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef } from 'react';
import { Text, View, StyleSheet } from 'react-native';

import AnimatedPressable from './AnimatedPressable';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';

type ButtonProps = {
  title: string;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
};

export const Button = forwardRef<View, ButtonProps>(
  ({ title, variant = 'primary', size = 'md', onPress, disabled = false, className = '' }, ref) => {
    const sizeStyles = {
      sm: 'px-4 py-2',
      md: 'px-5 py-3',
      lg: 'px-6 py-4',
    };

    const textSizeStyles = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    // Gradient variant
    if (variant === 'gradient') {
      return (
        <AnimatedPressable
          ref={ref}
          onPress={onPress}
          disabled={disabled}
          className={`overflow-hidden rounded-3xl ${disabled ? 'opacity-50' : ''} ${className}`}>
          <LinearGradient
            colors={['#1DDD96', '#35B385']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientShadow}
            className={sizeStyles[size]}>
            <Text className={`${textSizeStyles[size]} text-center font-bold text-white`}>
              {title}
            </Text>
          </LinearGradient>
        </AnimatedPressable>
      );
    }

    // Standard variants
    const variantStyles = {
      primary: 'bg-brand-500 shadow-elevation-2',
      secondary: 'bg-dark-200 shadow-elevation-1',
      outline: 'border-2 border-brand-500 bg-white',
      ghost: 'bg-transparent',
    };

    const textVariantStyles = {
      primary: 'text-white',
      secondary: 'text-dark-700',
      outline: 'text-brand-600',
      ghost: 'text-brand-600',
    };

    return (
      <AnimatedPressable
        ref={ref}
        onPress={onPress}
        disabled={disabled}
        className={`items-center justify-center rounded-3xl ${sizeStyles[size]} ${variantStyles[variant as keyof typeof variantStyles]} ${disabled ? 'opacity-50' : ''} ${className}`}>
        <Text
          className={`${textSizeStyles[size]} text-center font-bold ${textVariantStyles[variant as keyof typeof textVariantStyles]}`}>
          {title}
        </Text>
      </AnimatedPressable>
    );
  }
);

const styles = StyleSheet.create({
  gradientShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
});
