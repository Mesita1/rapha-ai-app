import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';
import { mockTopInterventions } from '../constants/mockData';

export default function FlareScreen() {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (total: number) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Filter positive interventions as "what's helped before"
  const helpedBefore = mockTopInterventions
    .filter((i) => i.avgDelta > 0)
    .sort((a, b) => b.avgDelta - a.avgDelta);

  const handleEndFlare = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.flareActiveRow}>
            <View style={styles.flareDot} />
            <Text style={styles.flareActiveText}>Flare Active</Text>
          </View>
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        </View>

        {/* Current HRV */}
        <GlassCard style={styles.hrvCard} glowColor="#ef4444">
          <Text style={styles.hrvLabel}>Current HRV</Text>
          <View style={styles.hrvRow}>
            <Text style={styles.hrvValue}>34</Text>
            <Text style={styles.hrvUnit}>ms</Text>
          </View>
          <Text style={styles.hrvDrop}>-24ms from baseline</Text>
        </GlassCard>

        {/* What's Helped Before */}
        <Text style={styles.sectionTitle}>What's Helped Before</Text>
        {helpedBefore.map((item, i) => (
          <GlassCard key={item.name} style={styles.helpCard}>
            <View style={styles.helpRow}>
              <View style={styles.helpRank}>
                <Text style={styles.helpRankText}>{i + 1}</Text>
              </View>
              <View style={styles.helpInfo}>
                <Text style={styles.helpName}>{item.name}</Text>
                <Text style={styles.helpMeta}>{item.observations} times used</Text>
              </View>
              <Text style={styles.helpDelta}>+{item.avgDelta.toFixed(1)}ms</Text>
            </View>
          </GlassCard>
        ))}

        {/* Start Breathing Exercise */}
        <TouchableOpacity style={styles.breatheButton} activeOpacity={0.8}>
          <Ionicons name="cloud-outline" size={22} color={Colors.white} />
          <Text style={styles.breatheText}>Start Breathing Exercise</Text>
        </TouchableOpacity>

        {/* End Flare */}
        <TouchableOpacity style={styles.endButton} onPress={handleEndFlare} activeOpacity={0.8}>
          <Text style={styles.endText}>End Flare</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  closeBtn: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flareActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  flareDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
  flareActiveText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xl,
    color: '#ef4444',
  },
  timerText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 48,
    color: Colors.text,
    letterSpacing: -1,
  },
  // HRV Card
  hrvCard: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  hrvLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: '#ef4444',
    marginBottom: Spacing.xs,
  },
  hrvRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  hrvValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.hero,
    color: Colors.text,
    letterSpacing: -2,
  },
  hrvUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xl,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  hrvDrop: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: '#ef4444',
    marginTop: 4,
  },
  // Helped before
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  helpCard: {
    marginBottom: Spacing.sm,
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  helpRankText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.sm,
    color: '#ef4444',
  },
  helpInfo: {
    flex: 1,
  },
  helpName: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  helpMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  helpDelta: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.accent,
  },
  // Buttons
  breatheButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  breatheText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.white,
  },
  endButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  endText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: '#ef4444',
  },
});
