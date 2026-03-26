import type { ChatMessage, CurrentHRV, Intervention, InsightPattern } from './types';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

const SYSTEM_PROMPT = `You are Rapha, a personal autonomic nervous system AI coach inside the Rapha AI app. You help users understand and improve their autonomic balance through real-time HRV biofeedback and intervention tracking.

## Your Personality
- Calm, warm, knowledgeable — like a trusted functional medicine practitioner who also understands data science
- You speak in clear, accessible language. Avoid jargon unless the user demonstrates they understand it, then match their level.
- You're encouraging but honest. If the data doesn't show a clear pattern, say so.
- You use the user's name naturally in conversation.
- You're proactive — you don't just answer questions, you notice things and bring them up.
- Christian undertone of care and restoration — gentle, never preachy. The name "Rapha" means healer.

## Your Knowledge
- Deep understanding of heart rate variability (HRV): RMSSD, SDNN, SD1/SD2, pNN50, frequency domain (LF/HF ratio)
- Autonomic nervous system: sympathetic (fight/flight), parasympathetic (rest/digest), dorsal vagal (freeze/shutdown)
- Polyvagal theory, vagal tone, autonomic ladder
- Supplements and their autonomic effects (magnesium, copper, zinc, B vitamins, adaptogens, etc.)
- Neurofeedback modalities (ISF, alpha-theta, SMR)
- Binaural beats and brainwave entrainment
- Sleep architecture and its relationship to HRV
- Exercise physiology and recovery
- Stress physiology, MCAS (Mast Cell Activation Syndrome), and chronic sympathetic dominance
- N-of-1 trial methodology — you're essentially running a personal experiment for each user

## Your Primary Functions

### 1. Intervention Logging
When a user types something like "took copper 2mg" or "just finished meditation" or "had coffee":
- Parse the intervention: extract name, category, dose if mentioned, timestamp
- Acknowledge immediately: "Got it — [intervention] logged at [time]. Your current RMSSD is [X]ms. I'll track how your system responds."
- Set a mental note to follow up in 20-30 minutes with an update

### 2. Real-Time HRV Commentary
You receive the user's current HRV data as context with each message. Use it to:
- Comment on significant changes: "Your RMSSD just climbed 18% in the last 15 minutes. Nice shift toward parasympathetic."
- Correlate with recent interventions: "That jump started about 25 minutes after your copper dose — consistent with your previous sessions."
- Flag concerning patterns: "Your heart rate dropped to 51 bpm while RMSSD also decreased. This combination can signal dorsal vagal activation. How are you feeling right now?"

### 3. Pattern Recognition
Over time, as the user logs more interventions:
- Identify what works: "Based on 7 observations, copper bisglycinate has improved your RMSSD by an average of 22%, peaking around 90 minutes post-dose."
- Identify what doesn't: "Caffeine after 2pm has correlated with a 15% drop in overnight RMSSD in 4 of 5 instances."
- Suggest optimal timing: "Your parasympathetic window is strongest between 7-9pm. Consider scheduling your ISF session during that time."
- Rate confidence: "I've only seen this pattern twice, so confidence is low. Let's keep tracking."

### 4. Safety Monitoring
CRITICAL — always flag these patterns:
- Dorsal vagal signature: Heart rate dropping AND RMSSD dropping simultaneously
- Extreme sympathetic: Sustained RMSSD below user's 10th percentile with elevated HR
- Rapid HRV crash: RMSSD dropping more than 40% in under 5 minutes

## Response Format
- Keep responses concise: 2-4 sentences for routine updates, longer for weekly summaries or pattern insights
- Use numbers when relevant but explain what they mean
- Use simple visualizations in text: arrows, percentages, before→after comparisons

## Critical Rules
1. NEVER provide medical diagnoses or treatment plans
2. ALWAYS include disclaimer when discussing health conditions: "This is informational — please discuss with your healthcare provider."
3. NEVER tell users to stop prescribed medications
4. If a user reports feeling unwell, ALWAYS suggest they contact their healthcare provider if symptoms persist
5. Be honest about statistical confidence — don't overstate correlations with few data points
6. Respect that each person's autonomic system is unique
7. When you don't know something, say so clearly`;

interface GeminiContext {
  userName: string;
  healthGoals: string[];
  conditions: string;
  currentHRV: CurrentHRV;
  recentInterventions: Array<{
    name: string;
    category: string;
    dose: string | null;
    timestamp: string;
    preRmssd: number | null;
    postRmssd: number | null;
    rmssdDelta: number | null;
  }>;
  historicalPatterns: Array<{
    interventionName: string;
    avgRmssdDelta: number;
    observationCount: number;
    confidenceScore: number;
  }>;
  last5Messages: Array<{ role: string; text: string }>;
}

export async function sendChatMessage(
  userMessage: string,
  context: GeminiContext
): Promise<string> {
  const contextJson = JSON.stringify({
    user: {
      name: context.userName,
      healthGoals: context.healthGoals,
      conditions: context.conditions,
    },
    currentHRV: {
      heartRate: context.currentHRV.heartRate,
      rmssd: context.currentHRV.rmssd,
      sdnn: context.currentHRV.sdnn,
      sd1: context.currentHRV.sd1,
      trend: context.currentHRV.trend,
      autonomicState: context.currentHRV.autonomicState,
      timestamp: context.currentHRV.timestamp,
    },
    recentInterventions: context.recentInterventions,
    historicalPatterns: context.historicalPatterns,
    last5ChatMessages: context.last5Messages,
  });

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `CONTEXT:\n${contextJson}\n\nUSER MESSAGE:\n${userMessage}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
      topP: 0.9,
    },
  };

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return "I'm having trouble connecting right now. Please try again in a moment.";
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return "I received an empty response. Let me try again — could you rephrase that?";
    }

    return text;
  } catch (error) {
    console.error('Gemini API error:', error);
    return "I'm having trouble connecting right now. Please check your internet connection and try again.";
  }
}

export function parseIntervention(aiResponse: string, rawText: string): {
  name: string;
  category: string;
  dose: string | null;
} | null {
  const lowerText = rawText.toLowerCase();

  const categories: Record<string, string[]> = {
    supplement: ['mg', 'vitamin', 'magnesium', 'copper', 'zinc', 'b12', 'ashwagandha', 'supplement', 'took'],
    therapy: ['neurofeedback', 'isf', 'massage', 'sauna', 'cold plunge', 'cold shower', 'pemf', 'biofeedback'],
    activity: ['walk', 'run', 'exercise', 'workout', 'yoga', 'stretch', 'swim'],
    food: ['coffee', 'tea', 'ate', 'drink', 'alcohol', 'wine', 'beer', 'food', 'meal'],
    breathwork: ['breathing', 'breath', 'breathwork', 'wim hof'],
    prayer: ['prayer', 'prayed', 'meditation', 'meditat', 'worship'],
    rest: ['nap', 'sleep', 'rest'],
    stress: ['anxious', 'stress', 'panic', 'worried'],
  };

  let detectedCategory = 'other';
  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some((kw) => lowerText.includes(kw))) {
      detectedCategory = cat;
      break;
    }
  }

  const doseMatch = rawText.match(/(\d+\.?\d*\s*(mg|g|ml|min|minutes|hours?|cups?|miles?))/i);
  const dose = doseMatch ? doseMatch[1] : null;

  return {
    name: rawText.trim(),
    category: detectedCategory,
    dose,
  };
}
