import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

export type IconName =
  | 'cart'
  | 'tag'
  | 'map-pin'
  | 'sparkles'
  | 'check'
  | 'arrow-left'
  | 'caret-down'
  | 'refresh';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

const glyphs: Record<IconName, string> = {
  cart: '🛒',
  tag: '🏷️',
  'map-pin': '📍',
  sparkles: '✨',
  check: '✓',
  'arrow-left': '‹',
  'caret-down': '▾',
  refresh: '↻',
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 16,
  color,
  style,
}) => (
  <Text
    style={[
      { fontSize: size, lineHeight: size + 2, color },
      style,
    ]}
  >
    {glyphs[name]}
  </Text>
);