import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle, StyleProp } from 'react-native';
import { colors, radii } from '../theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = radii.sm,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.skeleton,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => (
  <View
    style={{
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: 10,
      width: '47%',
      marginBottom: 14,
    }}
  >
    <Skeleton width="100%" height={140} borderRadius={radii.md} />
    <View style={{ marginTop: 12 }}>
      <Skeleton width="80%" height={14} />
    </View>
    <View style={{ marginTop: 8 }}>
      <Skeleton width="50%" height={12} />
    </View>
    <View style={{ marginTop: 14 }}>
      <Skeleton width="90%" height={16} />
    </View>
    <View style={{ marginTop: 6 }}>
      <Skeleton width="60%" height={12} />
    </View>
  </View>
);

export const DetailSkeleton: React.FC = () => (
  <View style={{ padding: 16 }}>
    <Skeleton width="100%" height={260} borderRadius={radii.lg} />
    <View style={{ marginTop: 16 }}>
      <Skeleton width="70%" height={20} />
    </View>
    <View style={{ marginTop: 8 }}>
      <Skeleton width="40%" height={14} />
    </View>
    <View style={{ marginTop: 16 }}>
      <Skeleton width="50%" height={14} />
    </View>
    <View style={{ flexDirection: 'row', marginTop: 8 }}>
      <Skeleton width={80} height={32} borderRadius={radii.pill} style={{ marginRight: 8 }} />
      <Skeleton width={80} height={32} borderRadius={radii.pill} style={{ marginRight: 8 }} />
      <Skeleton width={80} height={32} borderRadius={radii.pill} />
    </View>
  </View>
);