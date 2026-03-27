import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';
import { mockPatients } from '../constants/mockData';

const statusColors = {
  good: Colors.accent,
  declining: Colors.warning,
  attention: Colors.negative,
};

const statusLabels = {
  good: 'Good',
  declining: 'Declining',
  attention: 'Needs Attention',
};

export default function PractitionerScreen() {
  const [activeTab, setActiveTab] = useState<'health' | 'patients' | 'referrals'>('patients');
  const [searchText, setSearchText] = useState('');

  const filteredPatients = mockPatients.filter(p =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

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
          <Text style={styles.pageTitle}>Practitioner</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Toggle: My Health / My Patients / Referrals */}
        <View style={styles.toggleRow}>
          {(['health', 'patients', 'referrals'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.toggleBtn, activeTab === tab && styles.toggleBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.toggleText, activeTab === tab && styles.toggleTextActive]}>
                {tab === 'health' ? 'My Health' : tab === 'patients' ? 'My Patients' : 'Referrals'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'patients' && (
          <>
            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color={Colors.textDim} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search patients..."
                placeholderTextColor={Colors.textDim}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            {/* Patient List */}
            {filteredPatients.map((patient) => (
              <GlassCard key={patient.id} style={styles.patientCard}>
                <View style={styles.patientRow}>
                  <View style={[styles.statusDot, { backgroundColor: statusColors[patient.status] }]} />
                  <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{patient.name}</Text>
                    <Text style={styles.patientMeta}>
                      RMSSD {patient.avgRmssd}ms · Stress {patient.stressScore} · {patient.lastActive}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColors[patient.status] + '18' }]}>
                    <Text style={[styles.statusBadgeText, { color: statusColors[patient.status] }]}>
                      {statusLabels[patient.status]}
                    </Text>
                  </View>
                </View>
              </GlassCard>
            ))}

            {/* Add Patient */}
            <TouchableOpacity style={styles.addPatientBtn}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.purple} />
              <Text style={styles.addPatientText}>Invite Patient</Text>
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'referrals' && (
          <>
            <GlassCard style={styles.referralCard}>
              <Text style={styles.referralTitle}>Your Referral Link</Text>
              <View style={styles.linkBox}>
                <Text style={styles.linkText}>raphaai.com/ref/drmesita</Text>
                <TouchableOpacity style={styles.copyBtn}>
                  <Ionicons name="copy-outline" size={16} color={Colors.purple} />
                </TouchableOpacity>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>12</Text>
                  <Text style={styles.statLabel}>Referrals</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>8</Text>
                  <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>$159.84</Text>
                  <Text style={styles.statLabel}>Earned</Text>
                </View>
              </View>
            </GlassCard>

            <GlassCard style={styles.contactCard}>
              <Text style={styles.contactTitle}>Enterprise / White-Label</Text>
              <Text style={styles.contactDesc}>
                Custom pricing for clinics with 3+ practitioners or 100+ patients.
              </Text>
              <TouchableOpacity style={styles.contactBtn}>
                <Text style={styles.contactBtnText}>Let's Talk</Text>
              </TouchableOpacity>
            </GlassCard>
          </>
        )}

        {activeTab === 'health' && (
          <GlassCard style={styles.healthPlaceholder}>
            <Ionicons name="heart-outline" size={48} color={Colors.accent} />
            <Text style={styles.healthText}>Your personal dashboard</Text>
            <Text style={styles.healthSubtext}>
              Switch to "My Patients" to view your patient list, or access your personal health data from the main Dashboard tab.
            </Text>
          </GlassCard>
        )}

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
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
  },
  toggleBtnActive: {
    backgroundColor: Colors.purple,
  },
  toggleText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  toggleTextActive: {
    color: Colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.sm + 4,
  },
  patientCard: {
    marginBottom: Spacing.sm,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  patientMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs - 1,
  },
  addPatientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
    borderRadius: BorderRadius.lg,
    borderStyle: 'dashed',
  },
  addPatientText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.purple,
  },
  referralCard: {
    marginBottom: Spacing.md,
  },
  referralTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
  },
  linkText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.purple,
    flex: 1,
  },
  copyBtn: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xl,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  contactCard: {
    marginBottom: Spacing.md,
  },
  contactTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  contactDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  contactBtn: {
    backgroundColor: Colors.purple,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  contactBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.white,
  },
  healthPlaceholder: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  healthText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  healthSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
