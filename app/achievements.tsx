import React from 'react';
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
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { achievements } from '../constants/mockData';

export default function AchievementsScreen() {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Achievements</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.subtitle}>
          {unlockedCount} of {achievements.length} unlocked
        </Text>

        {/* Grid */}
        <View style={styles.grid}>
          {achievements.map((item) => (
            <View
              key={item.name}
              style={[
                styles.card,
                item.unlocked && styles.cardUnlocked,
              ]}
            >
              <View style={[styles.iconContainer, item.unlocked && styles.iconContainerUnlocked]}>
                <Ionicons
                  name={item.icon}
                  size={32}
                  color={item.unlocked ? Colors.accent : Colors.textDim}
                />
              </View>
              <Text style={[styles.achieveName, item.unlocked && styles.achieveNameUnlocked]}>
                {item.name}
              </Text>
              <Text style={styles.achieveDesc}>{item.description}</Text>
              {item.unlocked && (
                <View style={styles.unlockedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.accent} />
                  <Text style={styles.unlockedText}>Unlocked</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xl,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    marginBottom: Spacing.xs,
    opacity: 0.5,
  },
  cardUnlocked: {
    opacity: 1,
    borderColor: 'rgba(212, 165, 116, 0.25)',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  iconContainerUnlocked: {
    backgroundColor: Colors.accentLight,
  },
  achieveName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.textDim,
    textAlign: 'center',
    marginBottom: 4,
  },
  achieveNameUnlocked: {
    color: Colors.text,
  },
  achieveDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    textAlign: 'center',
    lineHeight: 16,
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  unlockedText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.accent,
  },
});
