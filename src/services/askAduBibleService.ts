import { getActiveGeminiApiKeys } from './neuralTtsService';

export interface AskAduBibleMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  bookContext?: string;
}

export interface AskAduBibleContext {
  bookNameEn: string;
  bookNameTw?: string;
  bookSlug: string;
  chapter: number;
  selectedVerse?: number;
  selectedVerseText?: string;
  activeVersions: string[];
}

const AI_TEXT_MODELS = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-2.5-pro',
];

/**
 * Fallback analytical responses if offline or without API network access
 */
function getSanctuaryFallbackAnswer(query: string, ctx: AskAduBibleContext): string {
  const q = query.toLowerCase();
  const book = ctx.bookNameEn;
  const ch = ctx.chapter;

  if (q.includes('pray') || q.includes('prayer') || q.includes('mpaebɔ')) {
    return `### Biblical Foundation: How to Pray According to Scripture
In Scripture, prayer is an intimate, heartfelt communion with God our Heavenly Father through Jesus Christ.

#### 1. The Lord's Prayer (The Pattern Christ Taught - Matthew 6:9-13)
Jesus taught His disciples not to use vain repetitions like the hypocrites, but to pray with reverence:
- **Praise & Adoration**: *"Our Father in heaven, hallowed be Your name"* (Yɛn Agya a wowɔ soro, wo din ho ntew).
- **Alignment to His Sovereign Will**: *"Your kingdom come, Your will be done on earth as it is in heaven."*
- **Daily Provision**: *"Give us this day our daily bread"* (Ma yɛn yɛn daa aduan).
- **Forgiveness & Cleansing**: *"And forgive us our debts, as we forgive our debtors."*
- **Spiritual Deliverance**: *"And do not lead us into temptation, but deliver us from the evil one."*

#### 2. The Apostolic Heart of Prayer in Ephesians
In ${book} (e.g., Ephesians 1:16-19 and 6:18), Paul instructs believers:
- Pray for the **Spirit of wisdom and revelation** in the full knowledge of Christ (*Ephesians 1:17*).
- Pray *"always with all prayer and supplication in the Spirit, being watchful to this end with all perseverance"* (*Ephesians 6:18*).

#### 3. Original Language & Asante Twi Insight
- **Greek: Proseuchomai (G4336 - προσεύχομαι)**: To exchange human weakness for divine strength in reverent prayer.
- **Asante Twi (*Mpaebɔ*)**: Calling upon **Tweduampɔn Nyame** (the dependable Almighty upon whom we lean without falling) with sincere faith (*gyidie*), thanksgiving (*aseda*), and humility (*ahobrɛaseɛ*).`;
  }

  if (q.includes('twi') || q.includes('asante') || q.includes('akan')) {
    return `### Asante Twi Theological Analysis for ${book} ${ch}
In the **Asante Twi Twerɛ Kronkron**, scripture captures deep covenantal depth:
- **Onyankopɔn / Onyame**: The Supreme, Eternal Creator of heaven and earth.
- **Yesu Kristo (Awurade)**: The Lord Jesus Christ, our Savior and Redeemer.
- **Adom ne Asomdwoeɛ**: *Grace and Peace* (e.g. Efesofoɔ 1:2). *Adom* signifies unmerited favor, while *Asomdwoeɛ* denotes complete spiritual wholeness, reflecting the Hebrew *Shalom* (שָׁלוֹם).
- **Honhom Kronkron**: The Holy Spirit who seals believers and imparts divine power.

> *Kyerɛwsɛm Nyinaa fi Onyankopɔn Honhom mu (2 Timoteo 3:16).*`;
  }

  if (q.includes('greek') || q.includes('hebrew') || q.includes('strong')) {
    return `### Original Language Exegesis for ${book} ${ch}
Key original biblical root terms found in this scripture context:
1. **Eulogētos (G2128 - εὐλογητός)**: *Blessed, praise-worthy* — spoken of God as the source of all blessings (Ephesians 1:3).
2. **Proorizō (G4309 - προορίζω)**: *Predestined, marked out beforehand* by the sovereign love and counsel of God.
3. **Charis (G5485 - χάρις)**: *Grace* — the unearned, transforming favor of Christ.
4. **Shalom (H7965 - שָׁלוֹם)**: Complete peace, harmony, safety, and reconciliation with God.`;
  }

  if (q.includes('deuterocanon') || q.includes('apocrypha') || q.includes('enoch') || q.includes('maccabees')) {
    return `### Historical Canon & Second Temple Context
The **Deuterocanonical books** (16 books including Wisdom of Solomon, Sirach, Tobit, Judith, and 1-2 Maccabees) and the **Ancient Apocrypha** (such as 1 Enoch and Jubilees) were preserved in the Greek Septuagint (LXX) and early Church manuscripts:
- **King James 1611**: Originally printed all of the Apocrypha between the Old and New Testaments.
- **Theological Value**: They bridge the 400-year intertestamental period between Malachi and Matthew, illustrating Jewish faithfulness under trial and messianic expectation.`;
  }

  return `### Exegetical Reflection on ${book} Chapter ${ch}
**Core Theological Themes:**
1. **Sovereignty & Grace**: God's eternal redemptive plan unfolded through Jesus Christ for humanity.
2. **Spiritual Equipping**: The living Word (*Hebrews 4:12*) actively searches the human heart and equips every believer (*2 Timothy 3:16-17*).
3. **Universal Scope**: Available 100% ad-free across all tongues, uniting Asante Twi, English, and the original Greek/Hebrew text.

**Practical Application:**
- Meditate on God's promises in ${book} ${ch}.
- Compare verses side-by-side with Asante Twi to gain deeper devotional understanding.`;
}

/**
 * Ask AduBible Exegetical AI Service
 */
export async function askAduBibleAI(
  userQuery: string,
  context: AskAduBibleContext,
  history: AskAduBibleMessage[] = []
): Promise<string> {
  const candidateKeys = getActiveGeminiApiKeys();

  const systemInstruction = `You are "Ask AduBible", the dedicated AI Scripture Theologian and Exegetical Scholar for AduBible (adubible.org).
AduBible is a 100% ad-free parallel scripture sanctuary dedicated to humanity in honor of the Legacy of Apostle Kwame Adu of Nsuhia, Ghana.
AduBible unites 107 holy books: the 66 accepted canonical books, the 16 Deuterocanonical books (Wisdom, Sirach, Tobit, Maccabees), and the 25 Ancient Apocrypha texts (1 Enoch, Jubilees, Didache).

Your Mission:
1. Provide biblically grounded, reverent, scholarly, and deeply faithful answers to user questions about scripture, theology, and Christian living.
2. Ground your explanations in the original Hebrew (Tanakh / BDB Lexicon) and Greek (Textus Receptus / Thayer Lexicon) root words, including Strong's numbers (e.g., G2128, H7965) when helpful.
3. Where relevant or asked, explain the Ghanaian Asante Twi (Twerɛ Kronkron) linguistic and cultural nuances (e.g., Adom, Asomdwoeɛ, Onyankopɔn, Honhom Kronkron).
4. Cite chapter and verse references clearly (e.g., John 3:16, Ephesians 1:3, Hebrews 4:12, 2 Timothy 3:16).
5. Always maintain an encouraging, pastoral, and academically rigorous tone with zero advertisements.

Current Reading Context:
- Active Book: ${context.bookNameEn} ${context.bookNameTw ? `(${context.bookNameTw})` : ''}
- Active Chapter: ${context.chapter}
${context.selectedVerseText ? `- Selected Verse ${context.selectedVerse}: "${context.selectedVerseText}"` : ''}
- Active Parallel Translations: ${context.activeVersions.join(', ').toUpperCase()}`;

  // Format conversation history for Gemini API
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `${systemInstruction}\n\nUser Question: ${userQuery}`,
        },
      ],
    },
  ];

  // Add recent history if provided
  if (history.length > 0) {
    const historyParts = history.slice(-6).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));
    contents.unshift(...historyParts as any);
  }

  // Try candidate keys across available models
  for (const apiKey of candidateKeys) {
    for (const model of AI_TEXT_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 4096,
              thinkingConfig: {
                thinkingBudget: 0,
              },
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const parts = data?.candidates?.[0]?.content?.parts || [];
          const answer = parts
            .filter((p: any) => !p.thought)
            .map((p: any) => p.text || '')
            .join('')
            .trim();
          if (answer && answer.length > 10) {
            return answer;
          }
        }
      } catch {
        // Continue to next candidate
      }
    }
  }

  // Return sanctuary fallback if API is unreachable
  return getSanctuaryFallbackAnswer(userQuery, context);
}
