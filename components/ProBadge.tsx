import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors, BorderRadius } from '../constants/theme';

interface ProBadgeProps {
  isTrial?: boolean;
  hasAccess?: boolean;
  tier?: 'pro' | 'elite';
}

export default function ProBadge({ isTrial = false, hasAccess = true, tier = 'pro' }: ProBadgeProps) {
  const isElite = tier === 'elite';
  const label = isElite ? 'ELITE' : isTrial ? 'PRO TRIAL' : 'PRO';

  const badgeStyle = isElite ? styles.eliteBadge : styles.badge;
  const textStyle = isElite ? styles.eliteBadgeText : styles.badgeText;

  if (!hasAccess) {
    return (
      <TouchableOpacity onPress={() => router.push('/upgrade')} activeOpacity={0.7}>
        <View style={badgeStyle}>
          <Text style={textStyle}>{label}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>{label}</Text>
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
  eliteBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  eliteBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#f59e0b',
    letterSpacing: 0.5,
  },
});
