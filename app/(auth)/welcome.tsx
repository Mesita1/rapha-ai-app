import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

const { width } = Dimensions.get('window');

function RadiantCircleLogo() {
  return (
    <View style={styles.logoContainer}>
      <Svg width={150} height={150} viewBox="0 0 150 150">
        <Defs>
          <LinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0ea87a" />
            <Stop offset="100%" stopColor="#C9963A" />
          </LinearGradient>
        </Defs>
        <Circle
          cx="75"
          cy="75"
          r="60"
          stroke="url(#ringGradient)"
          strokeWidth={8}
          fill="none"
        />
        <SvgText
          x="75"
          y="75"
          textAnchor="middle"
          alignmentBaseline="central"
          fontSize={52}
          fontWeight="700"
          fill="#ffffff"
        >
          R
        </SvgText>
      </Svg>
    </View>
  );
}

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Animated.View style={{ opacity: pulseAnim }}>
            <RadiantCircleLogo />
          </Animated.View>
          <Text style={styles.appName}>Rapha AI</Text>
          <Text style={styles.tagline}>Your Personal Autonomic Intelligence</Text>
          <Text style={styles.healingTagline}>Rapha: from the Hebrew word meaning 'to heal'</Text>
        </Animated.View>

        <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.7}
          >
            <Text style={styles.signInText}>I already have an account</Text>
          </TouchableOpacity>

          <Text style={styles.platformText}>Available on iOS & Android</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl * 2,
    paddingBottom: Spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  appName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 42,
    color: Colors.text,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.lg,
    color: Colors.accent,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  healingTagline: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: '#C9963A',
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomSection: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  getStartedButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  getStartedText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.lg,
    color: Colors.background,
  },
  signInButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  signInText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  platformText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    marginTop: Spacing.sm,
  },
});
