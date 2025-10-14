import { MotiPressable, MotiPressableProps } from 'moti/interactions';
import React, { forwardRef } from 'react';

type AnimatedPressableProps = {
  children: React.ReactNode;
  scaleOnPress?: number;
  className?: string;
} & Omit<MotiPressableProps, 'animate'>;

const AnimatedPressable = forwardRef<any, AnimatedPressableProps>(
  ({ children, scaleOnPress = 0.96, className = '', ...props }, ref) => {
    return (
      <MotiPressable
        ref={ref}
        animate={({ pressed }) => {
          'worklet';
          return {
            scale: pressed ? scaleOnPress : 1,
          };
        }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 400,
        }}
        className={className}
        {...props}>
        {children}
      </MotiPressable>
    );
  }
);

AnimatedPressable.displayName = 'AnimatedPressable';

export default AnimatedPressable;
