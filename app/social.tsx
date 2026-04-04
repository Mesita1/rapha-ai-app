import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
  Linking,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';

type SocialTab = 'friends' | 'groups' | 'community';

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState<SocialTab>('friends');
  const [groupCode, setGroupCode] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [emailSearchResult, setEmailSearchResult] = useState<'none' | 'not_found' | null>(null);
  const [showContactsInfo, setShowContactsInfo] = useState(false);

  const handleInviteFriends = async () => {
    try {
      await Share.share({
        message: 'Join me on Rapha AI \u2014 track your HRV and discover what helps your nervous system. Download: https://raphaai.com',
        title: 'Rapha AI',
      });
    } catch {}
  };

  const handleSendEncouragement = () => {
    Alert.alert('Coming Soon', 'Encouragement messages will be available when friends are connected.');
  };

  const handleFindByEmail = () => {
    const trimmed = searchEmail.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    setEmailSearchResult('not_found');
  };

  const handleCreateGroup = () => {
    Alert.alert(
      'Coming Soon',
      "Group creation coming soon! You'll be able to create accountability groups for your church, clinic, or friends."
    );
  };

  const handleJoinGroup = () => {
    if (!groupCode.trim()) {
      Alert.alert('Enter Code', 'Please enter an invite code to join a group.');
      return;
    }
    Alert.alert(
      'Group Not Found',
      'Invalid code or group not found. Check with your group leader.'
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Social Hub</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {(['friends', 'groups', 'community'] as SocialTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <>
            {/* Find Friends from Contacts */}
            <GlassCard style={styles.findFriendsCard}>
              <View style={styles.findFriendsRow}>
                <View style={styles.findFriendsIcon}>
                  <Ionicons name="people-outline" size={22} color={Colors.accent} />
                </View>
                <View style={styles.findFriendsInfo}>
                  <Text style={styles.findFriendsTitle}>Find Friends from Contacts</Text>
                  <Text style={styles.findFriendsDesc}>
                    See which of your contacts are already on Rapha AI
                  </Text>
                </View>
              </View>
              {!showContactsInfo ? (
                <TouchableOpacity
                  style={styles.findFriendsBtn}
                  onPress={() => setShowContactsInfo(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="search-outline" size={16} color={Colors.accent} />
                  <Text style={styles.findFriendsBtnText}>Check Contacts</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.contactsInfoBox}>
                  <Ionicons name="information-circle-outline" size={18} color={Colors.accent} />
                  <Text style={styles.contactsInfoText}>
                    Contact sync coming soon! In the meantime, invite friends directly.
                  </Text>
                </View>
              )}
              <Text style={styles.contactsPrivacy}>
                Rapha AI can check your contacts to find friends already using the app. We never store or upload your contacts.
              </Text>
            </GlassCard>

            {/* Find by Email */}
            <GlassCard style={styles.findByEmailCard}>
              <View style={styles.findFriendsRow}>
                <View style={[styles.findFriendsIcon, { backgroundColor: Colors.purpleLight }]}>
                  <Ionicons name="mail-outline" size={22} color={Colors.purple} />
                </View>
                <View style={styles.findFriendsInfo}>
                  <Text style={styles.findFriendsTitle}>Find by Email</Text>
                  <Text style={styles.findFriendsDesc}>
                    Search for a friend by their email address
                  </Text>
                </View>
              </View>
              <View style={styles.emailSearchRow}>
                <TextInput
                  style={styles.emailSearchInput}
                  placeholder="Enter friend's email"
                  placeholderTextColor={Colors.textDim}
                  value={searchEmail}
                  onChangeText={(text) => {
                    setSearchEmail(text);
                    setEmailSearchResult(null);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TouchableOpacity style={styles.emailSearchBtn} onPress={handleFindByEmail}>
                  <Text style={styles.emailSearchBtnText}>Search</Text>
                </TouchableOpacity>
              </View>
              {emailSearchResult === 'not_found' && (
                <View style={styles.emailNotFound}>
                  <Text style={styles.emailNotFoundText}>
                    No user found — invite them to Rapha AI!
                  </Text>
                  <TouchableOpacity style={styles.emailInviteBtn} onPress={handleInviteFriends}>
                    <Ionicons name="share-outline" size={14} color={Colors.accent} />
                    <Text style={styles.emailInviteBtnText}>Send Invite</Text>
                  </TouchableOpacity>
                </View>
              )}
            </GlassCard>

            {/* Invite Friends */}
            <TouchableOpacity style={styles.primaryButton} onPress={handleInviteFriends} activeOpacity={0.8}>
              <Ionicons name="person-add-outline" size={18} color={Colors.white} />
              <Text style={styles.primaryButtonText}>Invite Friends</Text>
            </TouchableOpacity>

            <GlassCard style={styles.emptyCard}>
              <Ionicons name="people-outline" size={48} color={Colors.textDim} />
              <Text style={styles.emptyTitle}>No friends yet</Text>
              <Text style={styles.emptyText}>
                Invite friends to see each other's progress and encourage one another
              </Text>
            </GlassCard>

            {/* Preview of what connected friends look like */}
            <Text style={styles.sectionLabel}>COMING SOON</Text>
            <GlassCard style={styles.friendPreview}>
              <View style={styles.friendRow}>
                <View style={styles.friendAvatar}>
                  <Ionicons name="person" size={20} color={Colors.textMuted} />
                </View>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>Sarah M.</Text>
                  <View style={styles.friendMeta}>
                    <View style={styles.friendStreakBadge}>
                      <Ionicons name="flame" size={12} color="#f59e0b" />
                      <Text style={styles.friendStreakText}>12 day streak</Text>
                    </View>
                    <Text style={styles.friendSessions}>2 sessions today</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.encourageBtn} onPress={handleSendEncouragement}>
                  <Text style={styles.encourageBtnText}>Send encouragement</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
            <GlassCard style={styles.friendPreview}>
              <View style={styles.friendRow}>
                <View style={styles.friendAvatar}>
                  <Ionicons name="person" size={20} color={Colors.textMuted} />
                </View>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>David R.</Text>
                  <View style={styles.friendMeta}>
                    <View style={styles.friendStreakBadge}>
                      <Ionicons name="flame" size={12} color="#f59e0b" />
                      <Text style={styles.friendStreakText}>5 day streak</Text>
                    </View>
                    <Text style={styles.friendSessions}>1 session today</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.encourageBtn} onPress={handleSendEncouragement}>
                  <Text style={styles.encourageBtnText}>Send encouragement</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
            <View style={styles.comingSoonOverlay}>
              <Text style={styles.comingSoonBadge}>Preview - Coming Soon</Text>
            </View>
          </>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <>
            <View style={styles.groupButtonRow}>
              <TouchableOpacity style={styles.groupButton} activeOpacity={0.8} onPress={handleCreateGroup}>
                <Ionicons name="add-circle-outline" size={20} color={Colors.accent} />
                <Text style={styles.groupButtonText}>Create a Group</Text>
              </TouchableOpacity>
            </View>

            <GlassCard style={styles.joinGroupCard}>
              <Text style={styles.joinGroupTitle}>Join a Group</Text>
              <View style={styles.joinGroupInputRow}>
                <TextInput
                  style={styles.joinGroupInput}
                  placeholder="Enter invite code"
                  placeholderTextColor={Colors.textDim}
                  value={groupCode}
                  onChangeText={setGroupCode}
                  maxLength={20}
                />
                <TouchableOpacity style={styles.joinGroupBtn} onPress={handleJoinGroup}>
                  <Text style={styles.joinGroupBtnText}>Join</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>

            <Text style={styles.sectionLabel}>GROUP IDEAS</Text>
            {[
              { icon: 'people-outline', label: 'Accountability Partners', desc: 'Pair up and keep each other on track' },
              { icon: 'heart-outline', label: 'Church Health Groups', desc: 'Heal together with your faith community' },
              { icon: 'medkit-outline', label: 'Clinical Groups', desc: 'Provider-managed groups for patients' },
            ].map((group) => (
              <GlassCard key={group.label} style={styles.groupIdeaCard}>
                <View style={styles.groupIdeaRow}>
                  <View style={styles.groupIdeaIcon}>
                    <Ionicons name={group.icon as any} size={22} color={Colors.accent} />
                  </View>
                  <View style={styles.groupIdeaInfo}>
                    <Text style={styles.groupIdeaLabel}>{group.label}</Text>
                    <Text style={styles.groupIdeaDesc}>{group.desc}</Text>
                  </View>
                </View>
              </GlassCard>
            ))}

            <Text style={styles.sectionLabel}>COMING SOON</Text>
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="bar-chart-outline" size={36} color={Colors.textDim} />
              <Text style={styles.emptyText}>
                Your group averaged 3.2 sessions this week
              </Text>
              <Text style={styles.previewLabel}>Group stats preview</Text>
            </GlassCard>
          </>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <>
            <GlassCard style={styles.communityCard}>
              <Ionicons name="globe-outline" size={48} color={Colors.accent} />
              <Text style={styles.communityTitle}>Join the Rapha AI Community</Text>
              <Text style={styles.communityText}>
                Connect with thousands of people on their healing journey. Share tips, ask questions, and find support.
              </Text>
              <TouchableOpacity
                style={styles.communityButton}
                onPress={() => Linking.openURL('https://raphaai.com')}
                activeOpacity={0.8}
              >
                <Ionicons name="open-outline" size={16} color={Colors.white} />
                <Text style={styles.communityButtonText}>Visit Community</Text>
              </TouchableOpacity>
            </GlassCard>

            <Text style={styles.sectionLabel}>IN-APP FORUMS</Text>
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="chatbubbles-outline" size={48} color={Colors.textDim} />
              <Text style={styles.emptyTitle}>Coming Soon</Text>
              <Text style={styles.emptyText}>
                In-app discussion forums, success stories, and protocol sharing are on the way.
              </Text>
            </GlassCard>
          </>
        )}

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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: 3,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.accent,
  },
  tabText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.white,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
  },
  primaryButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.white,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },
  previewLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  friendPreview: {
    marginBottom: Spacing.sm,
    opacity: 0.5,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  friendMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  friendStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  friendStreakText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: '#f59e0b',
  },
  friendSessions: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  encourageBtn: {
    backgroundColor: 'rgba(14,168,122,0.12)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(14,168,122,0.25)',
  },
  encourageBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs - 1,
    color: Colors.accent,
  },
  comingSoonOverlay: {
    alignItems: 'center',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  comingSoonBadge: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    fontStyle: 'italic',
  },
  // Find Friends
  findFriendsCard: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  findFriendsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  findFriendsIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(14,168,122,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  findFriendsInfo: {
    flex: 1,
  },
  findFriendsTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  findFriendsDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  findFriendsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(14,168,122,0.12)',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(14,168,122,0.25)',
  },
  findFriendsBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.accent,
  },
  contactsInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(14,168,122,0.08)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  contactsInfoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.accent,
    flex: 1,
    lineHeight: 18,
  },
  contactsPrivacy: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs - 1,
    color: Colors.textDim,
    lineHeight: 15,
    textAlign: 'center',
  },
  findByEmailCard: {
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  emailSearchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  emailSearchInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  emailSearchBtn: {
    backgroundColor: Colors.purple,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailSearchBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  emailNotFound: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  emailNotFoundText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  emailInviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(14,168,122,0.12)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(14,168,122,0.25)',
  },
  emailInviteBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.accent,
  },
  // Groups
  groupButtonRow: {
    marginBottom: Spacing.md,
  },
  groupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(14,168,122,0.12)',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(14,168,122,0.25)',
  },
  groupButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.accent,
  },
  joinGroupCard: {
    marginBottom: Spacing.lg,
  },
  joinGroupTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  joinGroupInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  joinGroupInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  joinGroupBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinGroupBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  groupIdeaCard: {
    marginBottom: Spacing.sm,
  },
  groupIdeaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  groupIdeaIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(14,168,122,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupIdeaInfo: {
    flex: 1,
  },
  groupIdeaLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  groupIdeaDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  // Community
  communityCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  communityTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xl,
    color: Colors.text,
    textAlign: 'center',
  },
  communityText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },
  communityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.sm,
  },
  communityButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.white,
  },
});
