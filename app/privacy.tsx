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
import GlassCard from '../components/GlassCard';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';

interface PolicySection {
  title: string;
  items: string[];
}

const SECTIONS: PolicySection[] = [
  {
    title: 'Data We Collect',
    items: [
      'Account information (email, display name)',
      'Health data you choose to log (interventions, training sessions)',
      'HRV and heart rate data from connected devices',
      'Conditions and health goals you select during onboarding',
    ],
  },
  {
    title: 'How We Use Your Data',
    items: [
      'To provide personalized health insights and AI coaching',
      'To track your intervention responses over time',
      'To generate your personal HRV reports and trends',
    ],
  },
  {
    title: 'Community Data (Opt-in Only)',
    items: [
      'If you enable Community Insights, your intervention data is anonymized and aggregated',
      'We NEVER share your name, email, or identifiable information',
      'Only aggregate statistics are shown (minimum 5 users before any finding is displayed)',
      'You can opt out at any time \u2014 all your community data will be deleted',
    ],
  },
  {
    title: 'Data Storage',
    items: [
      'Your data is stored securely using Supabase (encrypted at rest and in transit)',
      'We do not sell your data to third parties',
      'We do not share your data with advertisers',
    ],
  },
  {
    title: 'Your Rights',
    items: [
      'You can export all your data at any time (CSV export)',
      'You can delete your account and all associated data',
      'You can opt out of community data sharing at any time',
    ],
  },
];

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Privacy Policy</Text>
          <View style={{ width: 40 }} />
        </View>

        <GlassCard style={styles.mainCard}>
          <View style={styles.iconRow}>
            <Ionicons name="lock-closed-outline" size={32} color={Colors.accent} />
          </View>

          <Text style={styles.heading}>Privacy Policy</Text>
          <Text style={styles.updated}>Last updated: April 2026</Text>

          <Text style={styles.intro}>
            Your Privacy Matters{'\n\n'}
            Rapha AI takes your privacy seriously. Here's how we handle your data:
          </Text>

          {SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}:</Text>
              {section.items.map((item, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          ))}

          <View style={styles.contactSection}>
            <Text style={styles.contactLabel}>Contact:</Text>
            <Text style={styles.contactText}>
              For privacy questions, contact: privacy@raphaai.com
            </Text>
          </View>
        </GlassCard>

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>Rapha AI</Text>
          <Text style={styles.footerTagline}>From Jehovah Rapha, The God Who Heals</Text>
        </View>

        <View style={{ height: 80 }} />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
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
  mainCard: {
    marginBottom: Spacing.lg,
  },
  iconRow: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heading: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xxl,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  updated: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  intro: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.textMuted,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.lg,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    paddingRight: Spacing.md,
    marginBottom: Spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginTop: 7,
    marginRight: Spacing.sm + 2,
    flexShrink: 0,
  },
  bulletText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: 20,
    flex: 1,
  },
  contactSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: Colors.surfaceBorder,
  },
  contactLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  contactText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  footerBrand: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.accent,
    marginBottom: Spacing.xs,
  },
  footerTagline: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});
