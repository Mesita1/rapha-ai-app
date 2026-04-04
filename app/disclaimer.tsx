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

const KEY_POINTS = [
  'HRV data and insights provided by this app are for informational and educational purposes only',
  'This app does not provide medical advice \u2014 always consult your healthcare provider before making changes to your health regimen',
  'Do not use this app as a substitute for professional medical advice, diagnosis, or treatment',
  'If you are experiencing a medical emergency, call 911 or your local emergency services immediately',
  'The intervention correlations shown are based on user-reported data and do not constitute clinical evidence',
  'Individual results may vary \u2014 what works for one person may not work for another',
  'Binaural beats and breathing exercises may not be suitable for everyone \u2014 consult your doctor if you have epilepsy, seizure disorders, or other neurological conditions',
  'The community insights feature shows anonymized aggregate data and should not be used to make medical decisions',
  'Rapha AI is not HIPAA certified (at this time) \u2014 do not enter protected health information you are not comfortable sharing',
];

export default function DisclaimerScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Health Disclaimer</Text>
          <View style={{ width: 40 }} />
        </View>

        <GlassCard style={styles.mainCard}>
          <View style={styles.iconRow}>
            <Ionicons name="shield-checkmark-outline" size={32} color="#ffd93d" />
          </View>

          <Text style={styles.heading}>Medical Disclaimer</Text>

          <Text style={styles.body}>
            Rapha AI is a wellness application designed for general health and wellness purposes only. It is NOT a medical device and is NOT intended to diagnose, treat, cure, or prevent any disease or medical condition.
          </Text>

          <Text style={styles.subheading}>Key Points:</Text>

          {KEY_POINTS.map((point, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{point}</Text>
            </View>
          ))}

          <View style={styles.acknowledgement}>
            <Text style={styles.acknowledgementText}>
              By using Rapha AI, you acknowledge that you have read and understand this disclaimer.
            </Text>
          </View>
        </GlassCard>

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>Rapha AI</Text>
          <Text style={styles.footerTagline}>From Jehovah Rapha, The God Who Heals</Text>
          <Text style={styles.footerVerse}>
            "He heals the brokenhearted and binds up their wounds." {'\u2014'} Psalm 147:3
          </Text>
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
    marginBottom: Spacing.lg,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.textMuted,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  subheading: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.lg,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    paddingRight: Spacing.md,
    marginBottom: Spacing.md,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffd93d',
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
  acknowledgement: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: Colors.surfaceBorder,
  },
  acknowledgementText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.text,
    textAlign: 'center',
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
    marginBottom: Spacing.sm,
  },
  footerVerse: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
