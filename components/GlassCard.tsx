import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
  glowColor?: string;
}

export default function GlassCard({ children, style, noPadding, glowColor }: GlassCardProps) {
  return (
    <View style={[styles.container, glowColor && { borderColor: glowColor + '20' }, style]}>
      <View style={[styles.content, noPadding && { padding: 0 }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
  },
  content: {
    padding: Spacing.md,
  },
});
