import React, { useState } from 'react';
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
import { mockPricingTiers } from '../constants/mockData';
import { useSubscription } from '../context/SubscriptionContext';

export default function UpgradeScreen() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { tier } = useSubscription();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Choose Your Plan</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Monthly/Annual Toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, !isAnnual && styles.toggleBtnActive]}
            onPress={() => setIsAnnual(false)}
          >
            <Text style={[styles.toggleText, !isAnnual && styles.toggleTextActive]}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, isAnnual && styles.toggleBtnActive]}
            onPress={() => setIsAnnual(true)}
          >
            <Text style={[styles.toggleText, isAnnual && styles.toggleTextActive]}>Annual</Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>Save 44%</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tier Cards */}
        {mockPricingTiers.map((pricingTier) => {
          const price = isAnnual ? pricingTier.annualPrice : pricingTier.monthlyPrice;
          const period = isAnnual ? '/year' : '/month';
          const isPopular = pricingTier.popular;
          const isFoundingPractitioner = pricingTier.foundingPrice && !isAnnual;
          const isCurrent = tier === pricingTier.tierKey || (tier === 'pro_trial' && pricingTier.tierKey === 'pro');

          const getButtonLabel = () => {
            if (isCurrent && tier === 'pro_trial') return 'Current Trial';
            if (isCurrent) return 'Current Plan';
            if (price === 0) return 'Get Started Free';
            if (isPopular) return 'Start 14-Day Free Trial';
            if (pricingTier.name === 'Practitioner') return "Let's Talk";
            return `Get ${pricingTier.name}`;
          };

          return (
            <GlassCard
              key={pricingTier.name}
              style={[styles.tierCard, isPopular && styles.tierCardPopular]}
              glowColor={isPopular ? Colors.accent : undefined}
            >
              {isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Most Popular</Text>
                </View>
              )}

              <Text style={styles.tierName}>{pricingTier.name}</Text>

              <View style={styles.priceRow}>
                {price === 0 ? (
                  <Text style={styles.priceValue}>Free</Text>
                ) : (
                  <>
                    <Text style={styles.priceCurrency}>$</Text>
                    <Text style={styles.priceValue}>{price.toFixed(2)}</Text>
                    <Text style={styles.pricePeriod}>{period}</Text>
                  </>
                )}
              </View>

              {isAnnual && pricingTier.monthlyPrice > 0 && pricingTier.annualPrice > 0 && (
                <Text style={styles.annualBreakdown}>
                  ${(pricingTier.annualPrice / 12).toFixed(2)}/month, billed annually
                </Text>
              )}

              {isFoundingPractitioner && (
                <View style={styles.foundingRow}>
                  <Text style={styles.foundingText}>
                    Founding: ${pricingTier.foundingPrice}/mo locked for life
                  </Text>
                  <View style={styles.remainingBadge}>
                    <Text style={styles.remainingText}>{pricingTier.foundingRemaining} left</Text>
                  </View>
                </View>
              )}

              {pricingTier.features.map((feature, i) => (
                <View key={i} style={styles.featureRow}>
                  <Ionicons name="checkmark" size={16} color={Colors.accent} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}

              <TouchableOpacity
                style={[
                  styles.selectButton,
                  price === 0 && styles.selectButtonFree,
                  isPopular && styles.selectButtonPopular,
                ]}
              >
                <Text
                  style={[
                    styles.selectButtonText,
                    price === 0 && styles.selectButtonTextFree,
                  ]}
                >
                  {getButtonLabel()}
                </Text>
              </TouchableOpacity>
            </GlassCard>
          );
        })}

        <Text style={styles.disclaimer}>
          Pro plan includes a free 14-day trial. Cancel anytime.
        </Text>

        <View style={{ height: 60 }} />
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
  },
  header: {
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
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    padding: 3,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: Colors.accent,
  },
  toggleText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  toggleTextActive: {
    color: Colors.white,
  },
  saveBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  saveBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: Colors.accent,
  },
  tierCard: {
    marginBottom: Spacing.md,
  },
  tierCardPopular: {
    borderColor: 'rgba(212, 165, 116, 0.3)',
  },
  popularBadge: {
    backgroundColor: Colors.accentLight,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.3)',
  },
  popularBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs - 1,
    color: Colors.accent,
  },
  tierName: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xl,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  priceCurrency: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xl,
    color: Colors.text,
    marginRight: 2,
  },
  priceValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    color: Colors.text,
    letterSpacing: -1,
  },
  pricePeriod: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  annualBreakdown: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  foundingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(212, 165, 116, 0.08)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  foundingText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.accent,
    flex: 1,
  },
  remainingBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  remainingText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs - 1,
    color: Colors.accent,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  featureText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 18,
  },
  selectButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  selectButtonFree: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  selectButtonPopular: {
    backgroundColor: Colors.accent,
  },
  selectButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.white,
  },
  selectButtonTextFree: {
    color: Colors.textMuted,
  },
  disclaimer: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
