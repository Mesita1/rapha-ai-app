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

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const COMMON_FOODS = [
  'Coffee', 'Water', 'Protein Shake', 'Salad', 'Chicken', 'Rice',
  'Fruit', 'Nuts', 'Alcohol', 'Sugar/Candy', 'Fast Food', 'Smoothie',
];

const MOOD_OPTIONS: { key: 'great' | 'good' | 'okay' | 'low' | 'struggling'; label: string; icon: string }[] = [
  { key: 'great', label: 'Great', icon: '😄' },
  { key: 'good', label: 'Good', icon: '🙂' },
  { key: 'okay', label: 'Okay', icon: '😐' },
  { key: 'low', label: 'Low', icon: '😕' },
  { key: 'struggling', label: 'Struggling', icon: '😢' },
];

const STRESS_LEVELS = [
  { value: 1, label: 'Calm', color: '#22c55e' },
  { value: 2, label: 'Mild', color: '#86efac' },
  { value: 3, label: 'Moderate', color: '#f59e0b' },
  { value: 4, label: 'High', color: '#f97316' },
  { value: 5, label: 'Intense', color: '#ef4444' },
];

const ENERGY_LEVELS = [
  { value: 1, label: 'Exhausted', color: '#ef4444' },
  { value: 2, label: 'Low', color: '#f97316' },
  { value: 3, label: 'Moderate', color: '#f59e0b' },
  { value: 4, label: 'Good', color: '#86efac' },
  { value: 5, label: 'Energized', color: '#22c55e' },
];

export default function LogInterventionScreen() {
  const [text, setText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrayerSub, setSelectedPrayerSub] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');
  const [foodNotes, setFoodNotes] = useState('');
  const [selectedMood, setSelectedMood] = useState<'great' | 'good' | 'okay' | 'low' | 'struggling' | null>(null);
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const { isConnected, rmssd } = useBLE();
  const { addIntervention } = useInterventions();
  const { trackIntervention } = useHRVTracker();

  const handleLog = () => {
    if (!text.trim()) return;
    const interventionId = Date.now().toString();
    addIntervention({
      name: text.trim(),
      category: selectedCategory || 'other',
      subcategory: selectedCategory === 'food' ? (selectedMealType?.toLowerCase() || undefined) : (selectedPrayerSub || undefined),
      preRmssd: isConnected && rmssd > 0 ? rmssd : undefined,
      notes: selectedCategory === 'food' && foodNotes.trim() ? foodNotes.trim() : undefined,
      mood: selectedMood || undefined,
      stressLevel: stressLevel || undefined,
      energyLevel: energyLevel || undefined,
      mealType: selectedCategory === 'food' ? (selectedMealType?.toLowerCase() || undefined) : undefined,
      quantity: selectedCategory === 'food' && quantity.trim() ? quantity.trim() : undefined,
    });
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
                  setSelectedMealType(null);
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

          {/* Food-specific fields */}
          {selectedCategory === 'food' && (
            <View style={styles.foodSection}>
              {/* Meal Type Pills */}
              <Text style={styles.sectionLabel}>Meal Type</Text>
              <View style={styles.chipContainer}>
                {MEAL_TYPES.map((meal) => (
                  <TouchableOpacity
                    key={meal}
                    style={[
                      styles.chip,
                      selectedMealType === meal && styles.chipSelected,
                    ]}
                    onPress={() => {
                      setSelectedMealType(meal);
                      try { Haptics?.selectionAsync(); } catch {}
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, selectedMealType === meal && styles.chipTextSelected]}>
                      {meal}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Quantity Input */}
              <Text style={styles.sectionLabel}>Quantity</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { minHeight: 44 }]}
                  placeholder="e.g., 8oz, 1 cup, 2 servings"
                  placeholderTextColor={Colors.textDim}
                  value={quantity}
                  onChangeText={setQuantity}
                  maxLength={100}
                />
              </View>

              {/* Common Foods Quick-Add */}
              <Text style={styles.sectionLabel}>Common Foods</Text>
              <View style={styles.chipContainer}>
                {COMMON_FOODS.map((food) => (
                  <TouchableOpacity
                    key={food}
                    style={styles.chip}
                    onPress={() => {
                      setText(food);
                      try { Haptics?.selectionAsync(); } catch {}
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chipText}>{food}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Food Notes */}
              <Text style={styles.sectionLabel}>How did this food make you feel?</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { minHeight: 44 }]}
                  placeholder="Any reactions, energy changes, etc."
                  placeholderTextColor={Colors.textDim}
                  value={foodNotes}
                  onChangeText={setFoodNotes}
                  multiline
                  maxLength={300}
                />
              </View>
            </View>
          )}

          {/* Mood / Stress / Energy Section */}
          <View style={styles.moodSection}>
            <Text style={styles.moodSectionTitle}>How are you feeling?</Text>

            {/* Mood Selector */}
            <View style={styles.moodRow}>
              {MOOD_OPTIONS.map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[
                    styles.moodPill,
                    selectedMood === m.key && styles.moodPillSelected,
                  ]}
                  onPress={() => {
                    setSelectedMood(selectedMood === m.key ? null : m.key);
                    try { Haptics?.selectionAsync(); } catch {}
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.moodEmoji}>{m.icon}</Text>
                  <Text style={[styles.moodLabel, selectedMood === m.key && styles.moodLabelSelected]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stress Level */}
            <Text style={styles.scaleLabel}>Stress Level</Text>
            <View style={styles.scaleRow}>
              {STRESS_LEVELS.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[
                    styles.scaleCircle,
                    stressLevel === s.value && { backgroundColor: s.color, borderColor: s.color },
                  ]}
                  onPress={() => {
                    setStressLevel(stressLevel === s.value ? null : s.value);
                    try { Haptics?.selectionAsync(); } catch {}
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.scaleNumber,
                    stressLevel === s.value && styles.scaleNumberSelected,
                  ]}>
                    {s.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.scaleLabelRow}>
              <Text style={styles.scaleEndLabel}>Calm</Text>
              <Text style={styles.scaleEndLabel}>Intense</Text>
            </View>

            {/* Energy Level */}
            <Text style={styles.scaleLabel}>Energy Level</Text>
            <View style={styles.scaleRow}>
              {ENERGY_LEVELS.map((e) => (
                <TouchableOpacity
                  key={e.value}
                  style={[
                    styles.scaleCircle,
                    energyLevel === e.value && { backgroundColor: e.color, borderColor: e.color },
                  ]}
                  onPress={() => {
                    setEnergyLevel(energyLevel === e.value ? null : e.value);
                    try { Haptics?.selectionAsync(); } catch {}
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.scaleNumber,
                    energyLevel === e.value && styles.scaleNumberSelected,
                  ]}>
                    {e.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.scaleLabelRow}>
              <Text style={styles.scaleEndLabel}>Exhausted</Text>
              <Text style={styles.scaleEndLabel}>Energized</Text>
            </View>
          </View>

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
    borderColor: 'rgba(212, 165, 116, 0.2)',
    backgroundColor: 'rgba(212, 165, 116, 0.08)',
  },
  subChipSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  subChipText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  subChipTextSelected: {
    color: Colors.accent,
    fontFamily: 'Inter_500Medium',
  },
  // Food section
  foodSection: {
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  // Mood section
  moodSection: {
    marginBottom: Spacing.lg,
  },
  moodSectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.lg,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  moodPill: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surface,
    minWidth: 60,
  },
  moodPillSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  moodEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  moodLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  moodLabelSelected: {
    color: Colors.accent,
  },
  scaleLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  scaleRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  scaleCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  scaleNumberSelected: {
    color: Colors.white,
  },
  scaleLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 5 * 40 + 4 * Spacing.md,
    marginBottom: Spacing.lg,
  },
  scaleEndLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
  },
  logButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
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
