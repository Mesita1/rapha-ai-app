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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { scriptureVerses } from '../../constants/scriptureData';
import { getChatResponse } from '../../lib/gemini';
import { useBLE } from '../../context/BLEContext';
import { useInterventions } from '../../context/InterventionContext';

const SCRIPTURE_REF_PATTERN = /(\d?\s?(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Samuel|Kings|Chronicles|Ezra|Nehemiah|Esther|Job|Psalm|Psalms|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation)\s+\d+:\d+(?:-\d+)?)/g;

function getYouversionUrl(ref: string): string {
  const found = scriptureVerses.find(v => v.reference === ref);
  if (found) return found.youversionUrl;
  // Fallback: construct URL from reference
  const bookMap: Record<string, string> = {
    'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM', 'Deuteronomy': 'DEU',
    'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT', '1 Samuel': '1SA', '2 Samuel': '2SA',
    '1 Kings': '1KI', '2 Kings': '2KI', '1 Chronicles': '1CH', '2 Chronicles': '2CH',
    'Ezra': 'EZR', 'Nehemiah': 'NEH', 'Esther': 'EST', 'Job': 'JOB',
    'Psalm': 'PSA', 'Psalms': 'PSA', 'Proverbs': 'PRO', 'Ecclesiastes': 'ECC',
    'Isaiah': 'ISA', 'Jeremiah': 'JER', 'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN',
    'Hosea': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON',
    'Micah': 'MIC', 'Nahum': 'NAM', 'Habakkuk': 'HAB', 'Zephaniah': 'ZEP', 'Haggai': 'HAG',
    'Zechariah': 'ZEC', 'Malachi': 'MAL', 'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK',
    'John': 'JHN', 'Acts': 'ACT', 'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO',
    'Galatians': 'GAL', 'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL',
    '1 Thessalonians': '1TH', '2 Thessalonians': '2TH', '1 Timothy': '1TI', '2 Timothy': '2TI',
    'Titus': 'TIT', 'Philemon': 'PHM', 'Hebrews': 'HEB', 'James': 'JAS',
    '1 Peter': '1PE', '2 Peter': '2PE', '1 John': '1JN', '2 John': '2JN', '3 John': '3JN',
    'Jude': 'JUD', 'Revelation': 'REV',
  };
  const match = ref.match(/^(\d?\s?\w+)\s+(\d+):(\d+)/);
  if (match) {
    const bookName = match[1].trim();
    const code = bookMap[bookName] || bookName.substring(0, 3).toUpperCase();
    return `https://bible.com/bible/111/${code}.${match[2]}.${match[3]}`;
  }
  return 'https://bible.com';
}

function renderTextWithVerseLinks(text: string) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(SCRIPTURE_REF_PATTERN.source, 'g');

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<Text key={`t-${lastIndex}`}>{text.slice(lastIndex, match.index)}</Text>);
    }
    const ref = match[1];
    const url = getYouversionUrl(ref);
    parts.push(
      <Text
        key={`v-${match.index}`}
        style={{ color: '#d4a574', textDecorationLine: 'underline' }}
        onPress={() => Linking.openURL(url)}
      >
        {ref}
      </Text>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<Text key={`t-${lastIndex}`}>{text.slice(lastIndex)}</Text>);
  }

  return parts.length > 0 ? parts : text;
}

function ChatBubble({ message }: { message: { role: string; content: string; timestamp: string } }) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      {!isUser && (
        <View style={styles.sparkleIcon}>
          <Text style={styles.sparkleText}>✦</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={styles.bubbleText}>
          {isUser ? message.content : renderTextWithVerseLinks(message.content)}
        </Text>
        <Text style={[styles.bubbleTime, isUser && styles.userBubbleTime]}>
          {message.timestamp}
        </Text>
      </View>
    </View>
  );
}

export default function CoachScreen() {
  const { rmssd, heartRate } = useBLE();
  const { interventions } = useInterventions();

  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: string }[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to Rapha AI! I'm your autonomic nervous system coach. Connect a heart rate device to get started with real-time HRV tracking, or log an intervention and I'll start learning what works for your body. How can I help?",
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userText = inputText.trim();
    setInputText('');
    setIsLoading(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    // Build conversation history (skip the welcome message for context)
    const history = messages
      .filter((m) => m.id !== '1')
      .map((m) => ({ role: m.role, content: m.content }));

    // Build context from BLE and interventions
    const recentInterventions = interventions
      .slice(-5)
      .map((i) => i.name);

    const aiText = await getChatResponse(userText, history, {
      rmssd: rmssd || undefined,
      heartRate: heartRate || undefined,
      recentInterventions: recentInterventions.length > 0 ? recentInterventions : undefined,
    });

    const aiMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant' as const,
      content: aiText,
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
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
              <View style={styles.sparkleIcon}>
                <Text style={styles.sparkleText}>✦</Text>
              </View>
              <View style={[styles.bubble, styles.aiBubble]}>
                <Text style={styles.typingDots}>Rapha is thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.micButton}>
            <Ionicons name="mic-outline" size={22} color={Colors.textMuted} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Ask Rapha anything..."
            placeholderTextColor={Colors.textDim}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={18}
              color={inputText.trim() ? Colors.white : Colors.textDim}
            />
          </TouchableOpacity>
        </View>

        {/* Powered by note */}
        <View style={{ alignItems: 'center', paddingVertical: 6 }}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.textDim }}>
            AI coach powered by Gemini
          </Text>
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
  messagesContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    maxWidth: '88%',
  },
  bubbleRowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  sparkleIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  sparkleText: {
    fontSize: 16,
    color: Colors.accent,
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
    borderTopLeftRadius: BorderRadius.sm,
  },
  userBubble: {
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    borderTopRightRadius: BorderRadius.sm,
  },
  bubbleText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  bubbleTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs - 1,
    color: Colors.textDim,
    marginTop: Spacing.xs,
    alignSelf: 'flex-end',
  },
  userBubbleTime: {
    color: 'rgba(255,255,255,0.6)',
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
  micButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
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
