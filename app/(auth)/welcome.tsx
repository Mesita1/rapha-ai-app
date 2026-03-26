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
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

const { width } = Dimensions.get('window');

function HeartbeatLogo() {
  return (
    <View style={styles.logoContainer}>
      <Svg width={120} height={120} viewBox="0 0 120 120">
        {/* Neural dots */}
        <Circle cx="20" cy="60" r="3" fill={Colors.accent} opacity={0.5} />
        <Circle cx="35" cy="40" r="2.5" fill={Colors.accent} opacity={0.4} />
        <Circle cx="85" cy="40" r="2.5" fill={Colors.accent} opacity={0.4} />
        <Circle cx="100" cy="60" r="3" fill={Colors.accent} opacity={0.5} />
        <Circle cx="35" cy="80" r="2" fill={Colors.accent} opacity={0.3} />
        <Circle cx="85" cy="80" r="2" fill={Colors.accent} opacity={0.3} />
        {/* Heartbeat waveform */}
        <Path
          d="M10 60 L30 60 L38 60 L42 45 L48 75 L54 30 L60 85 L66 45 L70 60 L78 60 L90 60 L110 60"
          stroke={Colors.accent}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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

    // Subtle pulse animation for the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
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
              transform: [{ translateY: slideAnim }, { scale: pulseAnim }],
            },
          ]}
        >
          <HeartbeatLogo />
          <Text style={styles.appName}>Rapha AI</Text>
          <Text style={styles.tagline}>Your Personal Autonomic Intelligence</Text>
        </Animated.View>

        <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => router.push('/(auth)/connect-device')}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/(tabs)')}
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
  bottomSection: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  getStartedButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.xl,
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
