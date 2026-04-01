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
import Svg, { Path, Circle, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

const { width } = Dimensions.get('window');

function HeartbeatLogo() {
  return (
    <View style={styles.logoContainer}>
      <Svg width={140} height={140} viewBox="0 0 140 140">
        {/* Background glow */}
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={Colors.accent} stopOpacity="0.15" />
            <Stop offset="1" stopColor={Colors.accent} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="140" height="140" fill="url(#glow)" />

        {/* Neural dots */}
        <Circle cx="20" cy="70" r="3" fill={Colors.accent} opacity={0.5} />
        <Circle cx="35" cy="45" r="2.5" fill={Colors.accent} opacity={0.4} />
        <Circle cx="50" cy="30" r="2" fill={Colors.purple} opacity={0.3} />
        <Circle cx="90" cy="30" r="2" fill={Colors.purple} opacity={0.3} />
        <Circle cx="105" cy="45" r="2.5" fill={Colors.accent} opacity={0.4} />
        <Circle cx="120" cy="70" r="3" fill={Colors.accent} opacity={0.5} />
        <Circle cx="35" cy="95" r="2" fill={Colors.accent} opacity={0.3} />
        <Circle cx="105" cy="95" r="2" fill={Colors.accent} opacity={0.3} />
        <Circle cx="70" cy="110" r="2.5" fill={Colors.purple} opacity={0.25} />

        {/* Heartbeat waveform */}
        <Path
          d="M10 70 L30 70 L38 70 L42 52 L48 88 L54 30 L60 100 L66 52 L70 70 L78 70 L90 70 L110 70 L130 70"
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
            onPress={() => router.push('/(auth)/connect-device')}
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
