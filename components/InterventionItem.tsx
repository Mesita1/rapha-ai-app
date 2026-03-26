import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';

interface InterventionItemProps {
  name: string;
  category: string;
  dose?: string | null;
  timestamp: string;
  rmssdDelta: number;
}

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  supplement: 'medical-outline',
  therapy: 'pulse-outline',
  activity: 'walk-outline',
  food: 'restaurant-outline',
  prayer: 'heart-outline',
  breathwork: 'cloud-outline',
  rest: 'moon-outline',
  stress: 'flash-outline',
  medication: 'bandage-outline',
  other: 'ellipsis-horizontal-outline',
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function InterventionItem({
  name,
  category,
  dose,
  timestamp,
  rmssdDelta,
}: InterventionItemProps) {
  const isPositive = rmssdDelta >= 0;
  const icon = categoryIcons[category] || 'ellipsis-horizontal-outline';

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: isPositive ? Colors.accentLight : Colors.alertLight }]}>
        <Ionicons name={icon} size={18} color={isPositive ? Colors.accent : Colors.alert} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.meta}>
          {dose ? `${dose} · ` : ''}{formatTime(timestamp)}
        </Text>
      </View>
      <Text style={[styles.delta, { color: isPositive ? Colors.positive : Colors.negative }]}>
        {isPositive ? '+' : ''}{rmssdDelta.toFixed(1)}ms
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  meta: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  delta: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
  },
});
