import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../constants/theme';
import type { AutonomicState } from '../lib/types';

interface AutonomicBadgeProps {
  state: AutonomicState;
  small?: boolean;
}

const stateConfig: Record<AutonomicState, { label: string; color: string; bg: string }> = {
  parasympathetic: { label: 'Parasympathetic', color: Colors.accent, bg: Colors.accentLight },
  transitional: { label: 'Transitional', color: Colors.warning, bg: Colors.warningLight },
  sympathetic: { label: 'Sympathetic', color: Colors.alert, bg: Colors.alertLight },
  dorsal_vagal: { label: 'Dorsal Vagal', color: Colors.alert, bg: Colors.alertLight },
};

export default function AutonomicBadge({ state, small }: AutonomicBadgeProps) {
  const config = stateConfig[state];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, small && styles.small]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }, small && styles.smallText]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    gap: Spacing.sm,
  },
  small: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
  },
  smallText: {
    fontSize: FontSize.xs,
  },
});
