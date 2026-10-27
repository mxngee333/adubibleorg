/**
 * Akan (Asante & Akuapem Twi) Phonology & Speech Transphonemizer
 * 
 * Standard Web Speech synthesizers on Chrome, Edge, Safari, and Android lack native Twi voices
 * and fumble severely when fed raw Twi orthography (pronouncing "nhyira" as "n-h-y" or "e-slash").
 * 
 * This engine converts authentic Asante and Akuapem Twi orthography (including Akan digraphs
 * ky, gy, tw, dw, hy, hw, ny, open vowels ɛ, ɔ, and syllabic nasals m-, n-) into clear,
 * fluent phonetic syllables that standard speech synthesizers speak naturally and intelligibly
 * without fumbling or stuttering!
 */

// Common sacred and foundational Twi theological terms mapped to high-fidelity phonetic pronunciation
const SACRED_TWI_LEXICON: Record<string, string> = {
  // Divine Names & Titles
  onyankopɔn: 'Oh-nyahn-kaw-pawn',
  onyankopon: 'Oh-nyahn-kaw-pawn',
  onyame: 'Oh-nyah-meh',
  awurade: 'Ah-woo-rah-deh',
  yesu: 'Yeh-soo',
  kristo: 'Krees-toh',
  tweduampɔn: 'Chweh-doo-ahm-pawn',
  tweduampon: 'Chweh-doo-ahm-pawn',
  agya: 'Ah-jah',
  honhom: 'Hawn-hawm',
  kronkron: 'Krawn-krawn',
  ba: 'Bah',

  // Foundational Spiritual Concepts
  nhyira: 'en-shee-rah',
  adom: 'Ah-dawm',
  asomdwoeɛ: 'Ah-sawm-jwoh-eh',
  asomdwoee: 'Ah-sawm-jwoh-eh',
  asomdwoe: 'Ah-sawm-jwoh-eh',
  gyidie: 'jee-dee-eh',
  aseda: 'Ah-seh-dah',
  ahobrɛaseɛ: 'Ah-haw-breh-ah-see-eh',
  ahobrease: 'Ah-haw-breh-ah-see-eh',
  mpaebɔ: 'em-pie-baw',
  mpaebo: 'em-pie-baw',
  twerɛ: 'chweh-reh',
  twere: 'chweh-reh',
  kyerew: 'chyeh-reh-oo',
  kyerɛ: 'chyeh-reh',
  kyere: 'chyeh-reh',
  nyinaa: 'nyee-nah',
  soro: 'saw-raw',
  asaase: 'ah-sah-seh',
  nkwa: 'en-kwah',
  asɛm: 'ah-sehm',
  asem: 'ah-sehm',
  nnwoma: 'en-nwoh-mah',
  anyansa: 'ahn-yahn-sah',
  bɔne: 'baw-neh',
  bone: 'baw-neh',
  dɔ: 'daw',
  do: 'daw',
  nkwagyeɛ: 'en-kwah-jee-eh',
  nkwagye: 'en-kwah-jee-eh',
  ahemman: 'ah-hehm-mahn',
  somafoɔ: 'saw-mah-foh-aw',
  somafo: 'saw-mah-foh',
};

/**
 * Transphonemizes Twi words into natural phonetic speech for speech synthesis
 */
export function transphonemizeTwiWord(rawWord: string): string {
  if (!rawWord) return '';

  // Separate leading/trailing punctuation
  const match = rawWord.match(/^([^a-zA-ZɛɔƐƆ0-9]*)(.*?)([^a-zA-ZɛɔƐƆ0-9]*)$/);
  if (!match) return rawWord;

  const [, leadingPunct, coreText, trailingPunct] = match;
  if (!coreText) return rawWord;

  const lower = coreText.toLowerCase();

  // 1. Direct match in sacred lexicon
  if (SACRED_TWI_LEXICON[lower]) {
    const phonetic = SACRED_TWI_LEXICON[lower];
    // Preserve initial capitalization if present in original
    const formatted =
      coreText[0] === coreText[0].toUpperCase() && phonetic.length > 0
        ? phonetic[0].toUpperCase() + phonetic.slice(1)
        : phonetic;
    return `${leadingPunct}${formatted}${trailingPunct}`;
  }

  // 2. Rule-based Akan phonological transformation
  let phon = lower;

  // Normalize Unicode variations of Akan open vowels
  phon = phon.replace(/ɛ/g, 'e').replace(/ɔ/g, 'o');
  phon = phon.replace(/\u025B/g, 'e').replace(/\u0254/g, 'o');

  // Handle Syllabic Nasals at word onset (e.g. nka -> en-ka, nhyira -> en-shira, mpae -> em-pae)
  if (/^n[bcdfghjklmnpqrstvwxyz]/i.test(phon)) {
    phon = 'en-' + phon.slice(1);
  } else if (/^m[bcdfghjklmnpqrstvwxyz]/i.test(phon)) {
    phon = 'em-' + phon.slice(1);
  }

  // Akan Digraphs to English phonetic approximations:
  // tw -> chw (Twerɛ -> Chwere, Tweduampon -> Chweduampon)
  phon = phon.replace(/tw/g, 'chw');

  // ky -> ch (Kyerɛ -> Chere, kyi -> chee)
  phon = phon.replace(/ky/g, 'ch');

  // dw -> jw (dware -> jware, adwuma -> ajwuma)
  phon = phon.replace(/dw/g, 'jw');

  // gy -> j (gyidie -> jeedie, gyina -> jeena)
  phon = phon.replace(/gy/g, 'j');

  // hy -> sh (hyira -> shira, ahyira -> ashira, hyɛ -> sheh)
  phon = phon.replace(/hy/g, 'sh');

  // hw -> shw (hwɛ -> shweh, ahwɛfo -> ashwehfo)
  phon = phon.replace(/hw/g, 'shw');

  // ny followed by vowel -> ny (Nyame -> Nyameh)
  phon = phon.replace(/nye/g, 'nyee-eh').replace(/nyo/g, 'nyaw');

  // Open vowel end rhymes (e.g. -foɔ -> -fo-aw, -eɛ -> -ee-eh)
  phon = phon.replace(/oɔ/g, 'o-aw').replace(/eɛ/g, 'ee-eh');

  // Terminal -ɛ -> -eh, -ɔ -> -aw
  phon = phon.replace(/e$/g, 'eh').replace(/o$/g, 'aw');

  // Capitalize if original word was capitalized
  if (coreText[0] === coreText[0].toUpperCase() && phon.length > 0) {
    phon = phon[0].toUpperCase() + phon.slice(1);
  }

  return `${leadingPunct}${phon}${trailingPunct}`;
}

/**
 * Transphonemizes an entire Twi verse or passage so standard TTS engines
 * recite it fluently and smoothly without stumbling over Akan digraphs and nasals.
 */
export function transphonemizeTwiForSpeech(verseText: string): string {
  if (!verseText) return '';
  const words = verseText.split(/\s+/);
  return words.map(transphonemizeTwiWord).join(' ');
}
