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
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';
import { interventionCategories, prayerSubcategories } from '../constants/mockData';
import { useBLE } from '../context/BLEContext';
import { useInterventions } from '../context/InterventionContext';
import { useHRVTracker } from '../context/HRVTrackerContext';

let Haptics: any = null;
try { Haptics = require('expo-haptics'); } catch {}

export default function LogInterventionScreen() {
  const [text, setText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrayerSub, setSelectedPrayerSub] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const { isConnected, rmssd } = useBLE();
  const { addIntervention } = useInterventions();
  const { trackIntervention } = useHRVTracker();

  const handleLog = () => {
    if (!text.trim()) return;
    const interventionId = Date.now().toString();
    addIntervention({
      name: text.trim(),
      category: selectedCategory || 'other',
      subcategory: selectedPrayerSub || undefined,
      preRmssd: isConnected && rmssd > 0 ? rmssd : undefined,
    });
    // Start auto-tracking HRV snapshots at 2min, 5min, 10min, 30min, 1hr, 2hr
    trackIntervention(interventionId, text.trim(), selectedCategory || 'other');
    try { Haptics?.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    setIsLogged(true);
    setTimeout(() => router.back(), 1500);
  };

  if (isLogged) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.accent} />
          <Text style={styles.successTitle}>Logged!</Text>
          <Text style={styles.successSubtitle}>
            {isConnected && rmssd > 0
              ? `Current RMSSD: ${rmssd.toFixed(1)}ms — We'll track your HRV response.`
              : "Logged! We'll track your HRV response."}
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
            <Text style={styles.title}>Quick Log</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Text Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder='e.g., "Magnesium 400mg" or "Cold plunge 3 min"'
              placeholderTextColor={Colors.textDim}
              value={text}
              onChangeText={setText}
              multiline
              autoFocus
              maxLength={200}
            />
          </View>

          {/* Category Pills */}
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
                  setSelectedPrayerSub(null);
                  try { Haptics?.selectionAsync(); } catch {}
                }}
                activeOpacity={0.7}
              >
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

          {/* Prayer Subcategories */}
          {selectedCategory === 'prayer' && (
            <View style={styles.subChipContainer}>
              {prayerSubcategories.map((sub) => (
                <TouchableOpacity
                  key={sub}
                  style={[
                    styles.subChip,
                    selectedPrayerSub === sub && styles.subChipSelected,
                  ]}
                  onPress={() => {
                    if (sub === 'Scripture Meditation') {
                      router.push('/(tabs)/train');
                      return;
                    }
                    setSelectedPrayerSub(sub);
                    setText(sub);
                    try { Haptics?.selectionAsync(); } catch {}
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.subChipText,
                      selectedPrayerSub === sub && styles.subChipTextSelected,
                    ]}
                  >
                    {sub}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Log Button */}
          <TouchableOpacity
            style={[styles.logButton, !text.trim() && styles.logButtonDisabled]}
            onPress={handleLog}
            activeOpacity={0.8}
            disabled={!text.trim()}
          >
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
    fontSize: FontSize.xl,
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
  inputContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  chip: {
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
  subChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingLeft: Spacing.sm,
  },
  subChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
  },
  subChipSelected: {
    borderColor: Colors.purple,
    backgroundColor: Colors.purpleLight,
  },
  subChipText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  subChipTextSelected: {
    color: Colors.purple,
    fontFamily: 'Inter_500Medium',
  },
  logButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.purple,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
  },
  logButtonDisabled: {
    backgroundColor: Colors.surface,
  },
  logButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.white,
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
  successTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xxl,
    color: Colors.accent,
    marginTop: Spacing.md,
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
