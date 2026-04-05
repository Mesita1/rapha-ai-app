export interface ScriptureVerse {
  reference: string;
  text: string;
  translation: string;
  state: 'stressed' | 'anxious' | 'calm' | 'grateful' | 'hurting' | 'hopeful' | 'resting' | 'any';
  tags: string[];
  youversionUrl: string;
}

export const scriptureVerses: ScriptureVerse[] = [
  // STRESSED / SYMPATHETIC DOMINANT
  { reference: 'Psalm 46:10', text: 'Be still, and know that I am God.', translation: 'NIV', state: 'stressed', tags: ['peace', 'stillness', 'trust'], youversionUrl: 'https://bible.com/bible/111/PSA.46.10' },
  { reference: 'Philippians 4:6-7', text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.', translation: 'NIV', state: 'anxious', tags: ['anxiety', 'peace', 'prayer'], youversionUrl: 'https://bible.com/bible/111/PHP.4.6-7' },
  { reference: 'Isaiah 41:10', text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.', translation: 'NIV', state: 'anxious', tags: ['fear', 'strength', 'help'], youversionUrl: 'https://bible.com/bible/111/ISA.41.10' },
  { reference: 'Matthew 11:28', text: 'Come to me, all you who are weary and burdened, and I will give you rest.', translation: 'NIV', state: 'stressed', tags: ['rest', 'weariness', 'comfort'], youversionUrl: 'https://bible.com/bible/111/MAT.11.28' },
  { reference: 'Psalm 23:1-3', text: 'The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.', translation: 'NIV', state: 'stressed', tags: ['peace', 'rest', 'provision'], youversionUrl: 'https://bible.com/bible/111/PSA.23.1-3' },
  { reference: '2 Timothy 1:7', text: 'For God has not given us a spirit of fear, but of power and of love and of a sound mind.', translation: 'NKJV', state: 'anxious', tags: ['fear', 'power', 'mind'], youversionUrl: 'https://bible.com/bible/114/2TI.1.7' },

  // HURTING / FLARING / DORSAL VAGAL
  { reference: 'Psalm 34:18', text: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.', translation: 'NIV', state: 'hurting', tags: ['pain', 'brokenness', 'nearness'], youversionUrl: 'https://bible.com/bible/111/PSA.34.18' },
  { reference: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.', translation: 'NIV', state: 'hurting', tags: ['purpose', 'hope', 'trust'], youversionUrl: 'https://bible.com/bible/111/ROM.8.28' },
  { reference: 'Psalm 147:3', text: 'He heals the brokenhearted and binds up their wounds.', translation: 'NIV', state: 'hurting', tags: ['healing', 'wounds', 'comfort'], youversionUrl: 'https://bible.com/bible/111/PSA.147.3' },
  { reference: 'Exodus 15:26', text: 'I am the Lord who heals you.', translation: 'NIV', state: 'hurting', tags: ['healing', 'jehovah-rapha'], youversionUrl: 'https://bible.com/bible/111/EXO.15.26' },
  { reference: '2 Corinthians 12:9', text: 'My grace is sufficient for you, for my power is made perfect in weakness.', translation: 'NIV', state: 'hurting', tags: ['grace', 'weakness', 'strength'], youversionUrl: 'https://bible.com/bible/111/2CO.12.9' },
  { reference: 'Isaiah 53:5', text: 'But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.', translation: 'NIV', state: 'hurting', tags: ['healing', 'salvation', 'peace'], youversionUrl: 'https://bible.com/bible/111/ISA.53.5' },

  // CALM / PARASYMPATHETIC / GRATEFUL
  { reference: 'Psalm 107:1', text: 'Give thanks to the Lord, for he is good; his love endures forever.', translation: 'NIV', state: 'grateful', tags: ['thankfulness', 'love', 'goodness'], youversionUrl: 'https://bible.com/bible/111/PSA.107.1' },
  { reference: '1 Thessalonians 5:16-18', text: 'Rejoice always, pray continually, give thanks in all circumstances; for this is God\'s will for you in Christ Jesus.', translation: 'NIV', state: 'grateful', tags: ['joy', 'prayer', 'thankfulness'], youversionUrl: 'https://bible.com/bible/111/1TH.5.16-18' },
  { reference: 'Psalm 118:24', text: 'This is the day the Lord has made; let us rejoice and be glad in it.', translation: 'NIV', state: 'calm', tags: ['joy', 'day', 'gratitude'], youversionUrl: 'https://bible.com/bible/111/PSA.118.24' },
  { reference: 'Philippians 4:13', text: 'I can do all things through Christ who strengthens me.', translation: 'NKJV', state: 'hopeful', tags: ['strength', 'ability', 'empowerment'], youversionUrl: 'https://bible.com/bible/114/PHP.4.13' },

  // RESTING / SLEEP
  { reference: 'Psalm 4:8', text: 'In peace I will lie down and sleep, for you alone, Lord, make me dwell in safety.', translation: 'NIV', state: 'resting', tags: ['sleep', 'peace', 'safety'], youversionUrl: 'https://bible.com/bible/111/PSA.4.8' },
  { reference: 'Proverbs 3:24', text: 'When you lie down, you will not be afraid; when you lie down, your sleep will be sweet.', translation: 'NIV', state: 'resting', tags: ['sleep', 'rest', 'peace'], youversionUrl: 'https://bible.com/bible/111/PRO.3.24' },
  { reference: 'Psalm 91:1-2', text: 'Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, "He is my refuge and my fortress, my God, in whom I trust."', translation: 'NIV', state: 'resting', tags: ['refuge', 'trust', 'safety'], youversionUrl: 'https://bible.com/bible/111/PSA.91.1-2' },

  // HEALING / JEHOVAH RAPHA
  { reference: 'Jeremiah 17:14', text: 'Heal me, Lord, and I will be healed; save me and I will be saved, for you are the one I praise.', translation: 'NIV', state: 'hurting', tags: ['healing', 'salvation', 'praise'], youversionUrl: 'https://bible.com/bible/111/JER.17.14' },
  { reference: 'Psalm 103:2-3', text: 'Praise the Lord, my soul, and forget not all his benefits\u2014who forgives all your sins and heals all your diseases.', translation: 'NIV', state: 'any', tags: ['healing', 'forgiveness', 'benefits'], youversionUrl: 'https://bible.com/bible/111/PSA.103.2-3' },
  { reference: 'James 5:16', text: 'Therefore confess your sins to each other and pray for each other so that you may be healed. The prayer of a righteous person is powerful and effective.', translation: 'NIV', state: 'any', tags: ['prayer', 'healing', 'community'], youversionUrl: 'https://bible.com/bible/111/JAS.5.16' },
  { reference: '3 John 1:2', text: 'Dear friend, I pray that you may enjoy good health and that all may go well with you, even as your soul is getting along well.', translation: 'NIV', state: 'any', tags: ['health', 'wholeness', 'prayer'], youversionUrl: 'https://bible.com/bible/111/3JN.1.2' },

  // UNIVERSAL WISDOM / REFLECTION
  { reference: 'Reflection', text: 'Be still and know that you are held.', translation: '', state: 'stressed', tags: ['peace', 'stillness', 'trust'], youversionUrl: '' },
  { reference: 'Reflection', text: 'In the quiet, healing begins.', translation: '', state: 'resting', tags: ['healing', 'rest', 'peace'], youversionUrl: '' },
  { reference: 'Reflection', text: 'Your body knows how to heal. Your job is to create the conditions.', translation: '', state: 'any', tags: ['healing', 'wholeness', 'health'], youversionUrl: '' },
];

// Get a verse based on autonomic state
export function getVerseForState(autonomicState: string): ScriptureVerse {
  let targetState: ScriptureVerse['state'];
  if (autonomicState === 'sympathetic' || autonomicState === 'stressed') targetState = 'stressed';
  else if (autonomicState === 'dorsal' || autonomicState === 'shutdown') targetState = 'hurting';
  else if (autonomicState === 'parasympathetic') targetState = 'calm';
  else targetState = 'any';

  const candidates = scriptureVerses.filter(v => v.state === targetState || v.state === 'any');
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// Get verse of the day (deterministic by date)
export function getVerseOfTheDay(): ScriptureVerse {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return scriptureVerses[dayOfYear % scriptureVerses.length];
}
