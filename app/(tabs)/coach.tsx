import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import {
  mockChatMessages,
  mockCurrentHRV,
  mockUser,
  mockRecentInterventions,
  mockTopInterventions,
} from '../../constants/mockData';
import { sendChatMessage } from '../../lib/gemini';
import type { ChatMessage } from '../../lib/types';

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Ionicons name="pulse" size={16} color={Colors.accent} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>{message.content}</Text>
        <Text style={[styles.bubbleTime, isUser && styles.userBubbleTime]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

export default function CoachScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response = await sendChatMessage(inputText.trim(), {
        userName: mockUser.firstName,
        healthGoals: mockUser.healthGoals,
        conditions: mockUser.conditions,
        currentHRV: {
          rmssd: mockCurrentHRV.rmssd,
          heartRate: mockCurrentHRV.heartRate,
          sdnn: mockCurrentHRV.sdnn,
          sd1: mockCurrentHRV.sd1 || 41.3,
          autonomicState: mockCurrentHRV.autonomicState,
          trend: mockCurrentHRV.trend,
          timestamp: mockCurrentHRV.timestamp,
        },
        recentInterventions: mockRecentInterventions.map((i) => ({
          name: i.name,
          category: i.category,
          dose: i.dose,
          timestamp: i.timestamp,
          preRmssd: i.preRmssd,
          postRmssd: i.postRmssd,
          rmssdDelta: i.rmssdDelta,
        })),
        historicalPatterns: mockTopInterventions.map((p) => ({
          interventionName: p.name,
          avgRmssdDelta: p.avgDelta,
          observationCount: p.observations,
          confidenceScore: p.confidence,
        })),
        last5Messages: messages.slice(-5).map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: m.content,
        })),
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <Ionicons name="pulse" size={20} color={Colors.accent} />
        </View>
        <View>
          <Text style={styles.headerTitle}>Rapha</Text>
          <Text style={styles.headerSubtitle}>AI Coach · Online</Text>
        </View>
      </View>

      {/* HRV Status Bar */}
      <View style={styles.hrvBar}>
        <View style={styles.hrvBarItem}>
          <View style={[styles.hrvBarDot, { backgroundColor: Colors.accent }]} />
          <Text style={styles.hrvBarText}>RMSSD {mockCurrentHRV.rmssd}ms</Text>
        </View>
        <View style={styles.hrvBarDivider} />
        <View style={styles.hrvBarItem}>
          <Ionicons name="heart" size={12} color={Colors.alert} />
          <Text style={styles.hrvBarText}>{mockCurrentHRV.heartRate} bpm</Text>
        </View>
        <View style={styles.hrvBarDivider} />
        <Text style={[styles.hrvBarText, { color: Colors.accent }]}>Parasympathetic</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <View style={styles.bubbleRow}>
              <View style={styles.avatar}>
                <Ionicons name="pulse" size={16} color={Colors.accent} />
              </View>
              <View style={[styles.bubble, styles.aiBubble]}>
                <Text style={styles.typingDots}>Rapha is thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Log an intervention..."
            placeholderTextColor={Colors.textDim}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.micButton}>
            <Ionicons name="mic-outline" size={22} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={inputText.trim() ? Colors.white : Colors.textDim}
            />
          </TouchableOpacity>
        </View>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 88 }} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.surfaceBorder,
    gap: Spacing.md,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.accent,
  },
  hrvBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(14, 168, 122, 0.06)',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.surfaceBorder,
    gap: Spacing.sm,
  },
  hrvBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hrvBarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  hrvBarText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  hrvBarDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.surfaceBorder,
  },
  messagesContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    maxWidth: '85%',
  },
  bubbleRowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bubble: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    maxWidth: '100%',
  },
  aiBubble: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  userBubble: {
    backgroundColor: Colors.userBubble,
    borderBottomRightRadius: BorderRadius.sm,
  },
  bubbleText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  userBubbleText: {
    color: Colors.text,
  },
  bubbleTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs - 1,
    color: Colors.textDim,
    marginTop: Spacing.xs,
    alignSelf: 'flex-end',
  },
  userBubbleTime: {
    alignSelf: 'flex-start',
  },
  typingDots: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: Colors.surfaceBorder,
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.text,
    maxHeight: 100,
  },
  micButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: Colors.accent,
  },
});
