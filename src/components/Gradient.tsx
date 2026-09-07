import React from 'react';
import { Platform, StyleProp, View, ViewStyle } from 'react-native';

export interface GradientProps {
  colors: readonly string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: StyleProp<ViewStyle>;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
  children?: React.ReactNode;
}

/**
 * Robust gradient component.
 *
 * On native platforms we delegate to expo-linear-gradient. On web, where
 * expo-linear-gradient can render transparently before its first onLayout
 * fires (or fail outright in some bundling setups), we always paint a solid
 * background colour first and then layer a CSS linear-gradient on top. This
 * guarantees that any white text placed inside the gradient is never rendered
 * against the page background.
 */
const GradientImpl = (
  props: GradientProps & { native: typeof import('expo-linear-gradient').LinearGradient | null },
): React.JSX.Element => {
  const { colors, style, children, pointerEvents } = props;
  const first = colors[0] ?? '#000000';
  const last = colors[colors.length - 1] ?? first;
  const solid = first === last ? first : first;

  const cssGradient = (() => {
    if (colors.length < 2 || first === last) return undefined;
    const startX = props.start?.x ?? 0;
    const startY = props.start?.y ?? 0;
    const endX = props.end?.x ?? 1;
    const endY = props.end?.y ?? 0;
    const dx = endX - startX;
    const dy = endY - startY;
    const angle = 90 + (Math.atan2(dy, dx) * 180) / Math.PI;
    const stops = colors.map((c, i) => `${c} ${Math.round((i / (colors.length - 1)) * 100)}%`).join(', ');
    return `linear-gradient(${Math.round(angle)}deg, ${stops})`;
  })();

  if (props.native) {
    const Native = props.native;
    return (
      <Native
        colors={colors as unknown as string[]}
        start={props.start}
        end={props.end}
        pointerEvents={pointerEvents}
        style={[style as ViewStyle, { backgroundColor: solid }]}
      >
        {children}
      </Native>
    );
  }

  return (
    <View
      pointerEvents={pointerEvents}
      style={[
        style as ViewStyle,
        { backgroundColor: solid },
        cssGradient ? ({ backgroundImage: cssGradient } as unknown as ViewStyle) : null,
      ]}
    >
      {children}
    </View>
  );
};

let cachedNative: typeof import('expo-linear-gradient').LinearGradient | null = null;
let tried = false;
function tryLoadNative(): typeof import('expo-linear-gradient').LinearGradient | null {
  // On web we use the pure-CSS fallback below so the component never
  // depends on the native LinearGradient view (which can render
  // transparently before its first onLayout). On native platforms the
  // expo-linear-gradient native view is the correct choice.
  if (Platform.OS === 'web') return null;
  if (tried) return cachedNative;
  tried = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expo-linear-gradient');
    cachedNative = mod.LinearGradient ?? mod.default ?? null;
  } catch {
    cachedNative = null;
  }
  return cachedNative;
}

export const Gradient: React.FC<GradientProps> = (props) => {
  const native = tryLoadNative();
  return <GradientImpl {...props} native={native} />;
};

export default Gradient;