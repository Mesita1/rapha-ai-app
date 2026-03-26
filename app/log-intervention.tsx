import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';
import { interventionCategories, mockCurrentHRV } from '../constants/mockData';

export default function LogInterventionScreen() {
  const [text, setText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);

  const handleLog = () => {
    if (!text.trim()) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsLogged(true);

    setTimeout(() => {
      router.back();
    }, 1500);
  };

  if (isLogged) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.accent} />
          </View>
          <Text style={styles.successTitle}>Logged!</Text>
          <Text style={styles.successSubtitle}>
            Current RMSSD: {mockCurrentHRV.rmssd}ms — I'll track how your system responds.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Log Intervention</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Category Chips */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipContainer}>
            {interventionCategories.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.chip,
                  selectedCategory === cat.key && styles.chipSelected,
                ]}
                onPress={() => {
                  setSelectedCategory(cat.key);
                  Haptics.selectionAsync();
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.icon}
                  size={16}
                  color={selectedCategory === cat.key ? Colors.accent : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.chipText,
                    selectedCategory === cat.key && styles.chipTextSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Text Input */}
          <Text style={styles.label}>What did you do?</Text>
          <TextInput
            style={styles.input}
            placeholder='e.g., "Took 400mg magnesium glycinate" or "20 min walk"'
            placeholderTextColor={Colors.textDim}
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
            maxLength={200}
          />
          <Text style={styles.helper}>
            Rapha will parse the details and track HRV changes automatically.
          </Text>

          {/* Current HRV context */}
          <View style={styles.hrvContext}>
            <Ionicons name="pulse" size={16} color={Colors.accent} />
            <Text style={styles.hrvContextText}>
              Current RMSSD: <Text style={styles.hrvValue}>{mockCurrentHRV.rmssd}ms</Text>
              {' · '}
              <Text style={styles.hrvValue}>{mockCurrentHRV.heartRate}bpm</Text>
            </Text>
          </View>

          {/* Log Button */}
          <TouchableOpacity
            style={[styles.logButton, !text.trim() && styles.logButtonDisabled]}
            onPress={handleLog}
            activeOpacity={0.8}
            disabled={!text.trim()}
          >
            <Ionicons name="add-circle" size={22} color={text.trim() ? Colors.background : Colors.textDim} />
            <Text style={[styles.logButtonText, !text.trim() && styles.logButtonTextDisabled]}>
              Log Intervention
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xxl,
    color: Colors.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surface,
  },
  chipSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  chipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  chipTextSelected: {
    color: Colors.accent,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helper: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  hrvContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  hrvContextText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  hrvValue: {
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logButtonDisabled: {
    backgroundColor: Colors.surface,
    shadowOpacity: 0,
    elevation: 0,
  },
  logButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.lg,
    color: Colors.background,
  },
  logButtonTextDisabled: {
    color: Colors.textDim,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  successIcon: {
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xxl,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
