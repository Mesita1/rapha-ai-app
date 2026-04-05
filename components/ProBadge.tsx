import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors, BorderRadius } from '../constants/theme';

interface ProBadgeProps {
  isTrial?: boolean;
  hasAccess?: boolean;
}

export default function ProBadge({ isTrial = false, hasAccess = true }: ProBadgeProps) {
  const label = isTrial ? 'PRO TRIAL' : 'PRO';

  if (!hasAccess) {
    return (
      <TouchableOpacity onPress={() => router.push('/upgrade')} activeOpacity={0.7}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{label}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(212, 165, 116, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.3)',
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
});
