import type { ReactNode } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

type FadeInProps = {
  children: ReactNode;
  delay?: number;
};

export function FadeIn({ children, delay = 0 }: FadeInProps) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(420).springify().damping(18)}>
      {children}
    </Animated.View>
  );
}
