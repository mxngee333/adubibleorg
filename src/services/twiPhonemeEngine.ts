/**
 * Akan (Asante & Akuapem Twi) & West African Phonology & Speech Transphonemizer v3
 *
 * Powers two complementary speech pipelines:
 * 1. Native Ghanaian Bible Neural Models (44.1kHz Fast Ghana Voice ONNX & 16kHz Meta MMS-TTS):
 *    - `prepareTextForFastGhanaVoice(rawText, langCode)` conditions raw Twi/Ewe orthography
 *      for `michsethowusu/ghana-tts-twi-ewe-dagbani` (44.1kHz StableTTS + Vocos trained on the
 *      GhanaNLP Twi & Ewe Bible corpus): converts digits to native Twi words, normalizes NFC
 *      lowercase, applies Akan ATR Vowel Harmony protection on biblical book names (`gyɛnɛsis`,
 *      `matɛo`, `yɛsaia`, `ɛfɛsofoɔ`), protects labiovelar `w` in `awuurade`, and inserts
 *      hiatus micro-pauses (`bɔɔ, ɔ`, `sɛ, ɛ`).
 *    - `prepareClauseForMetaMmsTts(clauseText, langCode)` normalizes clauses strictly to the
 *      lowercase `vocab.json` of `facebook/mms-tts-aka` so uppercase letters are never dropped
 *      as `<unk>`.
 * 2. Clause-Stitched 24kHz Studio Neural & Browser Speech Engines (Groq Orpheus 24kHz & Web Speech):
 *    - Eliminates English homograph mispronunciations ("boo" for bɔɔ, "eye" for ɛyɛ,
 *      "free" for frɛɛ, "see" for sɛ, "knee" for ne, "no" for no, "tie" for Ti, "buy-oh" for bio)
 *      using binary rhythmic-foot prosody (`Onyankoh-pawn`, `Emfitia-seh`, `awsoh-roh`, `ahsah-seh`).
 */

// Complete Akan Cardinal Number System (Asante Twi & Akuapem Twi) for Chapters & Verses 1–150
const ASANTE_ONES: Record<number, string> = {
  1: 'Baako',
  2: 'Mmienu',
  3: 'Mmiɛnsa',
  4: 'Anan',
  5: 'Enum',
  6: 'Nsia',
  7: 'Nson',
  8: 'Nwɔtwe',
  9: 'Nkron',
};

const AKUAPEM_ONES: Record<number, string> = {
  1: 'Biako',
  2: 'Abien',
  3: 'Abiɛsa',
  4: 'Anan',
  5: 'Enum',
  6: 'Nsia',
  7: 'Nson',
  8: 'Awotwe',
  9: 'Nkron',
};

const TWI_TEENS_ASANTE: Record<number, string> = {
  10: 'Edu',
  11: 'Edubaako',
  12: 'Edummienu',
  13: 'Edummiɛnsa',
  14: 'Edunan',
  15: 'Edunum',
  16: 'Edunsia',
  17: 'Edunson',
  18: 'Edunwɔtwe',
  19: 'Edunkron',
};

const TWI_TEENS_AKUAPEM: Record<number, string> = {
  10: 'Edu',
  11: 'Edubiako',
  12: 'Edubien',
  13: 'Edubiɛsa',
  14: 'Edunan',
  15: 'Edunum',
  16: 'Edunsia',
  17: 'Edunson',
  18: 'Eduawotwe',
  19: 'Edunkron',
};

const TWI_TENS: Record<number, string> = {
  20: 'Aduonu',
  30: 'Aduasa',
  40: 'Aduanan',
  50: 'Aduonum',
  60: 'Aduosia',
  70: 'Aduoson',
  80: 'Aduɔwɔtwe',
  90: 'Aduɔkron',
};

/**
 * Converts a chapter or verse number (1–150) into authentic Asante or Akuapem Twi words.
 */
export function numberToTwiWords(num: number, dialect: 'asante' | 'akuapem' = 'asante'): string {
  const n = Math.floor(Number(num) || 1);
  if (n <= 0 || n > 150) return String(num);

  const onesMap = dialect === 'akuapem' ? AKUAPEM_ONES : ASANTE_ONES;
  const teensMap = dialect === 'akuapem' ? TWI_TEENS_AKUAPEM : TWI_TEENS_ASANTE;

  if (n < 10) return onesMap[n];
  if (n < 20) return teensMap[n];
  if (n < 100) {
    const ten = Math.floor(n / 10) * 10;
    const rem = n % 10;
    return rem === 0 ? TWI_TENS[ten] : `${TWI_TENS[ten]} ${onesMap[rem]}`;
  }
  if (n === 100) return 'Ɔha';
  if (n > 100 && n <= 150) {
    const rem = n - 100;
    return `Ɔha ne ${numberToTwiWords(rem, dialect)}`;
  }
  return String(num);
}

/**
 * Orthographic & Phonological Conditioner for the 44.1kHz Fast Ghana Voice Neural Engine
 * (`michsethowusu/ghana-tts-twi-ewe-dagbani` — StableTTS + Vocos 44.1kHz ONNX).
 *
 * Because `grapheme_g2p.py` in the model strips digits (`0-9`) and colons (`:`), and applies
 * Akan regressive +ATR vowel harmony across `i`/`u`, this function:
 * 1. Expands all numbers (1–150) to native Asante/Akuapem Twi words.
 * 2. Converts colons/semicolons to natural clause commas and dashes to sentence breaks.
 * 3. Protects open `-ATR` vowels in biblical loanwords (`gyɛnɛsis`, `ɛksodɔs`, `matɛo`, `yɛsaia`, `ɛfɛsofoɔ`).
 * 4. Protects labiovelar `/w/` in `awuurade` and inserts micro-comma hiatus separators (`bɔɔ, ɔ`, `sɛ, ɛ`).
 */
export function prepareTextForFastGhanaVoice(rawText: string, langCode = 'tw'): string {
  if (!rawText) return '';
  const code = (langCode || 'tw').toLowerCase().trim();
  const isTwi = code === 'tw' || code === 'ak' || code === 'aka' || code.includes('twi');
  const dialect: 'asante' | 'akuapem' = code === 'ak' ? 'akuapem' : 'asante';

  let s = rawText
    .replace(/[’‘`]/g, "'")
    .replace(/[:;]+/g, ', ')
    .replace(/[—–]+/g, '. ')
    .replace(/[()[\]"]/g, ' ');

  if (isTwi) {
    // Expand standalone numbers 1–150 into spoken Twi words before G2P strips digits
    s = s.replace(/\b(\d{1,3})\b/g, (match) => {
      const n = parseInt(match, 10);
      if (n >= 1 && n <= 150) {
        return numberToTwiWords(n, dialect);
      }
      return match;
    });
  }

  s = s.normalize('NFC').toLowerCase();

  if (isTwi) {
    // Akan ATR Vowel Harmony Calibration for Biblical Book Names & Proper Nouns
    // Prevents +ATR 'i' from raising preceding 'e' to 'i' ("gyinisis")
    s = s
      .replace(/\b(?:gyenesis|genesis)\b/g, 'gyɛnɛsis')
      .replace(/\b(?:eksodɔs|exodus)\b/g, 'ɛksodɔs')
      .replace(/\b(?:lewitikɔs|leviticus)\b/g, 'lɛwitikɔs')
      .replace(/\bdeuteronomium\b/g, 'dɛtɛronomium')
      .replace(/\bmateo\b/g, 'matɛo')
      .replace(/\byesaia\b/g, 'yɛsaia')
      .replace(/\byeremia\b/g, 'yɛrɛmia')
      .replace(/\b(?:heszekiel|hesekiel)\b/g, 'hɛsɛkiɛl')
      .replace(/\bdaniel\b/g, 'daniɛl')
      .replace(/\befesofoɔ\b/g, 'ɛfɛsofoɔ')
      .replace(/\befesofo\b/g, 'ɛfɛsofo')
      .replace(/\bhebrifoɔ\b/g, 'hɛbrifoɔ')
      .replace(/\bhebrifo\b/g, 'hɛbrifo')
      // Preserve labiovelar /w/ in Awurade against rapid-speech elision
      .replace(/\bawurade\b/g, 'awuurade')
      .replace(/\bawuradie\b/g, 'awuuradie')
      // Insert micro-comma hiatus boundaries so adjacent open vowels never coalesce across words
      .replace(/\bbɔɔ\s+ɔ/g, 'bɔɔ, ɔ')
      .replace(/\bsɛ\s+ɛ/g, 'sɛ, ɛ')
      .replace(/\bfrɛɛ\s+/g, 'frɛɛ, ')
      .replace(/\bpaee\s+/g, 'paee, ');
  }

  s = s
    .replace(/\s*,\s*,+/g, ', ')
    .replace(/\s*\.\s*\.+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();

  if (s && !/[.!?]$/.test(s)) {
    s += '.';
  }

  return s;
}

/**
 * Lowercase Vocabulary Conditioner for Meta MMS-TTS (`facebook/mms-tts-aka`, `ewe`, `yor`, `hau`, `swh`, `amh`).
 * `facebook/mms-tts-aka` vocab.json contains strictly lowercase characters:
 * `2 3 ' - _ a b d e f g h i k l m n o p r s t u w y á ɔ ɛ ʼ`
 * Any uppercase character (`G`, `T`, `B`, `M`, `O`, `N`, `H`, `A`, `Ɔ`, `Ɛ`) is dropped as `<unk>`!
 */
export function prepareClauseForMetaMmsTts(clauseText: string, langCode = 'tw'): string {
  if (!clauseText) return '';
  const code = (langCode || 'tw').toLowerCase().trim();
  const isTwi = code === 'tw' || code === 'ak' || code === 'aka' || code.includes('twi');
  const dialect: 'asante' | 'akuapem' = code === 'ak' ? 'akuapem' : 'asante';

  let s = clauseText.replace(/[’‘`]/g, "'");

  if (isTwi) {
    s = s.replace(/\b(\d{1,3})\b/g, (match) => {
      const n = parseInt(match, 10);
      if (n >= 1 && n <= 150) {
        return numberToTwiWords(n, dialect);
      }
      return match;
    });
  }

  s = s.normalize('NFC').toLowerCase();

  if (isTwi) {
    // Map non-Akan loan consonants to native Akan equivalents present in vocab.json
    s = s
      .replace(/c/g, 'k')
      .replace(/j/g, 'gy')
      .replace(/q/g, 'k')
      .replace(/v/g, 'w')
      .replace(/x/g, 'ks')
      .replace(/z/g, 's');
  }

  // Strip punctuation that MMS-TTS does not model so clauses end cleanly
  s = s
    .replace(/[.,!?;:"“”«»()[\]—–]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return s;
}

/**
 * Spoken canonical Bible book names in Asante/Akuapem Twi (calibrated with binary rhythmic feet)
 */
const SPOKEN_TWI_BOOK_NAMES: Record<string, string> = {
  gyenesis: 'Jehneh-sees',
  genesis: 'Jehneh-sees',
  eksodɔs: 'Ehksoh-daws',
  exodus: 'Ehksoh-daws',
  lewitikɔs: 'Lehweeti-kaws',
  leviticus: 'Lehweeti-kaws',
  numeri: 'Noomeh-ree',
  deuteronomium: 'Dehtehroh-nohmee-oom',
  yosua: 'Yohsoo-ah',
  atemmufoɔ: 'Ahtehm-moofaw',
  atemmufo: 'Ahtehm-moofoh',
  rut: 'Root',
  samuel: 'Sahmoo-ehl',
  ahemfo: 'Ah-hehmfoh',
  berɛsosɛm: 'Behreh-sohsehm',
  beraɛsosɛm: 'Behreh-sohsehm',
  esra: 'Ehsrah',
  nehemia: 'Neh-hehmee-ah',
  ester: 'Ehstehr',
  hiob: 'Hee-ohb',
  nnwom: 'Enwom',
  psalms: 'Enwom',
  psalm: 'Enwom',
  mmebusɛm: 'Emmeh-boosehm',
  ɔsɛnkafoɔ: 'Awsehn-kahfaw',
  ɔsɛnkafo: 'Awsehn-kahfoh',
  yesaia: 'Yehsah-yah',
  yeremia: 'Yehreh-meeah',
  kwaadwom: 'Kwah-jwom',
  heszekiel: 'Hehzeh-kee-ehl',
  daniel: 'Dahnee-ehl',
  hosea: 'Hohseh-ah',
  yoel: 'Yoh-ehl',
  amos: 'Ah-mohs',
  obadia: 'Ohbah-deeah',
  yona: 'Yoh-nah',
  mika: 'Mee-kah',
  nahum: 'Nah-hoom',
  habakuk: 'Hahbah-kook',
  sefania: 'Sehfah-neeah',
  hagai: 'Hahgah-ee',
  sakaria: 'Sahkah-reeah',
  malaki: 'Mahlah-kee',
  mateo: 'Mahteh-oh',
  marko: 'Mahr-koh',
  luka: 'Loo-kah',
  yohane: 'Yoh-hahneh',
  romafoɔ: 'Rohmah-faw',
  romafo: 'Rohmah-foh',
  korintofoɔ: 'Kohreen-tohfaw',
  korintofo: 'Kohreen-tohfoh',
  galatifoɔ: 'Gahlah-teefaw',
  galatifo: 'Gahlah-teefoh',
  efesofoɔ: 'Ehfeh-sohfaw',
  efesofo: 'Ehfeh-sohfoh',
  ephesians: 'Ehfeh-sohfaw',
  filipifoɔ: 'Feelee-peefaw',
  filipifo: 'Feelee-peefoh',
  kolosefoɔ: 'Kohloh-sehfaw',
  kolosefo: 'Kohloh-sehfoh',
  tesalonikafoɔ: 'Tehsahloh-neekahfaw',
  timoteo: 'Teemoh-teh-oh',
  tito: 'Tee-toh',
  filemon: 'Feeleh-mohn',
  hebrifoɔ: 'Hehbree-faw',
  hebrifo: 'Hehbree-foh',
  yakobo: 'Yahkoh-boh',
  petro: 'Pehtroh',
  yuda: 'Yoo-dah',
  adiyisɛm: 'Ahdeeyee-sehm',
};

/**
 * Comprehensive Sacred Akan (Asante & Akuapem Twi) Phonetic Lexicon (v3 Binary Foot Prosody)
 * Calibrated for smooth, natural Ghanaian syllable timing on 24kHz studio engines.
 */
const SACRED_TWI_LEXICON: Record<string, string> = {
  // 1. Divine Names, Titles & Persons
  onyankopɔn: 'Onyankoh-pawn',
  onyankopon: 'Onyankoh-pawn',
  nyankopɔn: 'Nyankoh-pawn',
  nyankopon: 'Nyankoh-pawn',
  onyame: 'Onyah-meh',
  nyame: 'Nyah-meh',
  awurade: 'Ahwoorah-deh',
  yesu: 'Yeh-soo',
  kristo: 'Krees-toh',
  tweduampɔn: 'Chwehdoo-ampawn',
  tweduampon: 'Chwehdoo-ampawn',
  ɔdomankoma: 'Awdoh-mankohmah',
  ɔbɔadeɛ: 'Awbaw-ahdeh',
  agya: 'Ah-jah',
  honhom: 'Hohn-hohm',
  kronkron: 'Krohn-krohn',
  ɔdɔfoɔ: 'Awdaw-faw',
  ɔdɔfo: 'Awdaw-foh',
  ɔsorosoroni: 'Awsohroh-sohrohnee',
  paulo: 'Pah-ooloh',
  dawid: 'Dah-weed',
  solomon: 'Sohloh-mohn',
  mose: 'Moh-seh',
  abraham: 'Ahbrah-hahm',
  israel: 'Eesrah-ehl',
  yerusalem: 'Yehroosah-lehm',
  efeso: 'Ehfeh-soh',
  nikodemo: 'Neekoh-dehmoh',

  // 2. Genesis 1 & Creation Core Vocabulary (Zero English Homographs)
  gyenesis: 'Jehneh-sees',
  mfitiaseɛ: 'Emfitia-seh',
  mfitiase: 'Emfitia-seh',
  bɔɔ: 'baw-aw',
  bɔe: 'baw-eh',
  bɔ: 'baw',
  rebɔ: 'rehbaw',
  wɔrebɔ: 'waw-rehbaw',
  adebɔ: 'ahdeh-baw',
  wiase: 'weeah-seh',
  ɔsoro: 'awsoh-roh',
  soro: 'soh-roh',
  asase: 'ahsah-seh',
  asaase: 'ahsah-seh',
  sakasaka: 'sahkah-sahkah',
  hunu: 'hoo-noo',
  hunuu: 'hoo-noo',
  nhunu: 'enhoo-noo',
  moahunu: 'moh-ahhoonoo',
  nhumu: 'enhoo-moo',
  nhunumu: 'enhoonoo-moo',
  esum: 'eh-soom',
  sum: 'soom',
  ebun: 'eh-boon',
  ani: 'ah-nee',
  anim: 'ah-neem',
  dɛkyɛdɛkyɛ: 'dehcheh-dehcheh',
  nsuo: 'ensoo-oh',
  nsu: 'ensoo',
  kaa: 'kah-ah',
  kae: 'kah-eh',
  ka: 'kah',
  nka: 'enkah',
  bɛka: 'beh-kah',
  ɔbɛka: 'awbeh-kah',
  sɛ: 'seh',
  hann: 'hahn',
  mmra: 'emmrah',
  bae: 'bah-eh',
  ba: 'bah',
  mma: 'emmah',
  ɛyɛ: 'eh-yeh',
  yɛ: 'yeh',
  nyɛ: 'enyeh',
  ɔnyɛ: 'awnyeh',
  yɛn: 'yehn',
  yɛyɛ: 'yeh-yeh',
  ayɛ: 'ah-yeh',
  wɔayɛ: 'waw-ahyeh',
  yɛe: 'yeh-eh',
  ɔyɛe: 'awyeh-eh',
  ɔyɛ: 'aw-yeh',
  paee: 'pah-eh',
  pae: 'pah-eh',
  frɛɛ: 'freh-eh',
  ɔfrɛɛ: 'awfreh-eh',
  frɛ: 'freh',
  avia: 'ahwee-ah',
  awia: 'ahwee-ah',
  anadwo: 'ahnah-jwoh',
  adeɛ: 'ahdeh-eh',
  ade: 'ah-deh',
  sae: 'sah-eh',
  kyee: 'cheh-eh',
  kye: 'cheh',
  da: 'dah',
  nna: 'ennah',
  dada: 'dah-dah',
  dedaw: 'deh-dahw',
  ɛdi: 'eh-dee',
  edi: 'eh-dee',
  adi: 'ah-dee',
  yɛadi: 'yeh-ahdee',
  diiɛ: 'dee-eh',
  dii: 'dee',
  die: 'dee-eh',
  kan: 'kahn',
  nie: 'nee-eh',
  ni: 'nee',
  nsia: 'ensee-ah',
  ewim: 'eh-weem',
  nkyekyɛmu: 'encheh-chehmoo',

  // 3. High-Frequency Function Words, Pronouns & Particles
  no: 'noh',
  ne: 'neh',
  na: 'nah',
  me: 'meh',
  mo: 'moh',
  wo: 'woh',
  ɔno: 'aw-noh',
  ɛno: 'eh-noh',
  wɔn: 'wawn',
  wɔ: 'waw',
  wɔwɔ: 'waw-waw',
  mowɔ: 'moh-waw',
  ɛwɔ: 'eh-waw',
  mu: 'moo',
  so: 'soh',
  soɔ: 'soh-aw',
  hɔ: 'haw',
  hɔnom: 'haw-nohm',
  yi: 'yee',
  eyi: 'eh-yee',
  bi: 'bee',
  biara: 'beeah-rah',
  ti: 'tee',
  tire: 'tee-reh',
  tiri: 'tee-ree',
  tirim: 'tee-reem',
  di: 'dee',
  si: 'see',
  sii: 'see',
  asi: 'ah-see',
  kɔsi: 'kaw-see',
  kosi: 'koh-see',
  fi: 'fee',
  efi: 'eh-fee',
  firi: 'fee-ree',
  ɛfiri: 'ehfee-ree',
  firii: 'fee-ree',
  fafirie: 'fahfee-ree-eh',
  fafiri: 'fahfee-ree',
  kɔ: 'kaw',
  kɔɔ: 'kaw-aw',
  kɔma: 'kaw-mah',
  rekɔ: 'reh-kaw',
  tɔ: 'taw',
  wɔatɔ: 'waw-ahtaw',
  atɔ: 'ah-taw',
  dɔ: 'daw',
  ɔdɔ: 'aw-daw',
  dɔɔ: 'daw-aw',
  modɔ: 'moh-daw',
  pɛ: 'peh',
  pɛyɛ: 'peh-yeh',
  sɔ: 'saw',
  sɔɔ: 'saw-aw',
  anisɔ: 'ahnee-saw',
  ma: 'mah',
  maa: 'mah-ah',
  ama: 'ah-mah',
  de: 'deh',
  deɛ: 'deh-eh',
  nea: 'neh-ah',
  sɛdeɛ: 'sehdeh-eh',
  sɛnea: 'sehneh-ah',
  teɛ: 'teh-eh',
  te: 'teh',
  tee: 'teh-eh',
  motee: 'mohteh-eh',
  tie: 'tee-eh',
  bio: 'bee-oh',
  ara: 'ah-rah',
  nso: 'ensoh',
  nko: 'enkoh',
  mmom: 'emmohm',
  koraa: 'koh-rah',
  nti: 'entee',
  enti: 'ehn-tee',
  saa: 'sah-ah',
  ansa: 'ahn-sah',
  berɛ: 'beh-reh',
  mmerɛ: 'emmeh-reh',
  mmere: 'emmeh-reh',

  // 4. Foundational Theological & Epistle Vocabulary
  nhyira: 'enshee-rah',
  ahyira: 'ahshee-rah',
  adom: 'ah-dohm',
  dom: 'dohm',
  asomdwoeɛ: 'ahsohm-jwoheh',
  asomdwoee: 'ahsohm-jwoheh',
  asomdwoe: 'ahsohm-jwoheh',
  gyidie: 'jeedee-eh',
  gyidi: 'jee-dee',
  agyidifoɔ: 'ahjeedee-faw',
  gyidifo: 'jeedee-foh',
  gye: 'jeh',
  ɔgyeɛ: 'awjeh-eh',
  ogye: 'oh-jeh',
  mogye: 'moh-jeh',
  mugye: 'moo-jeh',
  yɛgye: 'yeh-jeh',
  wɔbɛgye: 'wawbeh-jeh',
  wobegye: 'wohbeh-jeh',
  nkwagyeɛ: 'enkwah-jeheh',
  nkwagye: 'enkwah-jeh',
  nkwa: 'enkwah',
  aseda: 'ahseh-dah',
  ahobrɛaseɛ: 'ahhoh-brehahseh',
  ahobrease: 'ahhoh-brehahseh',
  mpaebɔ: 'empah-ehbaw',
  mpaebo: 'empah-ehboh',
  twerɛ: 'chweh-reh',
  twere: 'chweh-reh',
  kyerɛw: 'cheh-rehw',
  kyerew: 'cheh-rehw',
  kyerɛ: 'cheh-reh',
  kyerɛɛ: 'chehreh-eh',
  kyere: 'cheh-reh',
  nyinaa: 'nyee-nah',
  asɛm: 'ah-sehm',
  asem: 'ah-sehm',
  asɛmpa: 'ahsehm-pah',
  ahuntasɛm: 'ahhoontah-sehm',
  ahintasɛm: 'ahheentah-sehm',
  adiyisɛm: 'ahdeeyee-sehm',
  nnwoma: 'enwoh-mah',
  nyansa: 'nyahn-sah',
  anyansa: 'ahnyahn-sah',
  bɔne: 'baw-neh',
  bone: 'baw-neh',
  mfomsoɔ: 'emfohm-sohaw',
  mfomso: 'emfohm-soh',
  ahemman: 'ahhehm-mahn',
  somafoɔ: 'sohmah-faw',
  somafo: 'sohmah-foh',
  ahotefoɔ: 'ahhohteh-faw',
  ahotefo: 'ahhohteh-foh',
  hwɛfoɔ: 'shweh-faw',
  hwɛfo: 'shweh-foh',
  hwɛ: 'shweh',
  dɛm: 'dehm',
  nni: 'ennee',
  ho: 'hoh',
  yii: 'yee',
  ɔyii: 'aw-yee',
  wɔayi: 'waw-ahyee',
  wɔapaw: 'waw-ahpahw',
  ɔpaw: 'aw-pahw',
  paw: 'pahw',
  bɛfa: 'beh-fah',
  animuonyam: 'ahneemoo-ohnyahm',
  anuonyam: 'ahnoo-ohnyahm',
  ayeyie: 'ahyeh-yee-eh',
  ayeyi: 'ahyeh-yee',
  mogya: 'moh-jah',
  nya: 'nyah',
  mennyae: 'mehn-nyaheh',
  ahonya: 'ahhoh-nyah',
  boroo: 'boh-roh',
  ɛboroo: 'ehboh-roh',
  ɔdaa: 'awdah-ah',
  nhyehyɛeɛ: 'ensheh-sheheh',
  nhyehyɛe: 'ensheh-sheheh',
  ɛwie: 'ehwee-eh',
  ewie: 'ehwee-eh',
  abom: 'ah-bohm',
  nnoɔma: 'ennaw-mah',
  nneɛma: 'enneh-mah',
  agyapadeɛ: 'ahjah-pahdeh',
  agyapade: 'ahjah-pahdeh',
  agyinatuo: 'ahjeenah-too-oh',
  agyinatu: 'ahjeenah-too',
  botaeɛ: 'bohtah-eh',
  botae: 'bohtah-eh',
  ato: 'ah-toh',
  nokorɛ: 'nohkoh-reh',
  nokware: 'nohkwah-reh',
  bɔhyɛ: 'baw-sheh',
  ano: 'ah-noh',
  nnyinasodeɛ: 'enyeenah-sohdeh',
  nnyinasode: 'enyeenah-sohdeh',
  aso: 'ah-soh',
  din: 'deen',
  mebɔ: 'meh-baw',
  wɔbɔ: 'waw-baw',
  nimdeɛ: 'neemdeh-eh',
  akoma: 'ahkoh-mah',
  ɔmma: 'awmmah',
  anidasoɔ: 'ahneedah-sohaw',
  anidaso: 'ahneedah-soh',
  tumi: 'too-mee',
  tumidie: 'toomee-deeeh',
  kɛseyɛ: 'kehseh-yeh',
  ɛtra: 'eh-trah',
  ahoɔden: 'ahhaw-dehn',
  adwuma: 'ahjwoo-mah',
  ɔnyanee: 'awnyah-neh',
  awufoɔ: 'ahwoo-faw',
  awufo: 'ahwoo-foh',
  tenaa: 'tehnah-ah',
  tenenee: 'tehneh-neh',
  teneneeni: 'tehneh-nehnee',
  nifa: 'nee-fah',
  mpanyinnie: 'empahnyeen-neeeh',
  awuradie: 'ahwoorah-deeeh',
  ɛreba: 'ehreh-bah',
  agu: 'ah-goo',
  nan: 'nahn',
  ase: 'ah-seh',
  asafo: 'ahsah-foh',
  nipadua: 'neepah-dooah',
  onipa: 'ohnee-pah',
  suban: 'soo-bahn',
  ɔhyɛ: 'aw-sheh',
  mã: 'mah',
  mãhyɛ: 'mah-sheh',
};

/**
 * Resolves the spoken phonetic name of a Bible book in Twi.
 */
export function getSpokenBookNameForTwi(bookName: string): string {
  if (!bookName) return '';
  const clean = bookName.trim().toLowerCase();
  if (SPOKEN_TWI_BOOK_NAMES[clean]) {
    return SPOKEN_TWI_BOOK_NAMES[clean];
  }
  const numMatch = clean.match(/^([123])\s+(.+)$/);
  if (numMatch) {
    const [, numStr, rest] = numMatch;
    const baseSpoken = SPOKEN_TWI_BOOK_NAMES[rest.trim()] || transphonemizeTwiWord(rest.trim());
    const ordMap: Record<string, string> = {
      '1': 'Baako',
      '2': 'Mmienu',
      '3': 'Mmiɛnsa',
    };
    return `${baseSpoken} Nwoma a ɛtɔ so ${ordMap[numStr] || numStr}`;
  }
  return transphonemizeTwiWord(bookName);
}

/**
 * Transphonemizes a single Twi word into natural, phonetically accurate Akan syllables
 * that preserve open vowels (ɔ = aw, ɛ = eh) and eliminate English homograph collisions.
 */
export function transphonemizeTwiWord(rawWord: string): string {
  if (!rawWord) return '';

  // Normalize curly apostrophes (e.g. n’Agya -> n'Agya)
  const normalizedRaw = rawWord.replace(/[’‘`]/g, "'");

  // Handle prefixed clitics like n'Agya, w'asɛm, m'akoma, n'adom, n'anim
  if (/^[nwmNWM]'[a-zA-ZɛɔƐƆãĩũ]+/.test(normalizedRaw)) {
    const parts = normalizedRaw.split("'");
    const pChar = parts[0].toLowerCase();
    const prefix = pChar === 'n' ? 'neh' : pChar === 'w' ? 'woh' : 'meh';
    const rest = transphonemizeTwiWord(parts.slice(1).join(''));
    const capPrefix =
      normalizedRaw[0] === normalizedRaw[0].toUpperCase()
        ? prefix[0].toUpperCase() + prefix.slice(1)
        : prefix;
    return `${capPrefix} ${rest}`;
  }

  // Separate leading/trailing punctuation
  const match = normalizedRaw.match(/^([^a-zA-ZɛɔƐƆãĩũ0-9]*)(.*?)([^a-zA-ZɛɔƐƆãĩũ0-9]*)$/);
  if (!match) return rawWord;

  const [, leadingPunct, coreText, trailingPunct] = match;
  if (!coreText) return rawWord;

  // Convert standalone numbers (1-150) inside Twi text to spoken Twi words
  if (/^\d+$/.test(coreText)) {
    const n = parseInt(coreText, 10);
    if (n >= 1 && n <= 150) {
      return `${leadingPunct}${transphonemizeTwiForSpeech(numberToTwiWords(n, 'asante'))}${trailingPunct}`;
    }
  }

  const lower = coreText.toLowerCase();

  // 1. Direct match in Sacred Twi Lexicon
  if (SACRED_TWI_LEXICON[lower]) {
    const phonetic = SACRED_TWI_LEXICON[lower];
    const formatted =
      coreText[0] === coreText[0].toUpperCase() && phonetic.length > 0
        ? phonetic[0].toUpperCase() + phonetic.slice(1)
        : phonetic;
    return `${leadingPunct}${formatted}${trailingPunct}`;
  }

  // 2. Rule-Based Akan Phonological Transformation
  let phon = lower;

  // Normalize nasalized vowels
  phon = phon.replace(/ã/g, 'ah').replace(/ĩ/g, 'ee').replace(/ũ/g, 'oo');

  // Step 2A: Akan Palatalized & Labial-Palatalized Digraphs (before vowel expansion)
  phon = phon.replace(/tw/g, 'chw');
  phon = phon.replace(/dw/g, 'jw');
  phon = phon.replace(/hw/g, 'shw');
  phon = phon.replace(/hy/g, 'sh');
  phon = phon.replace(/ky/g, 'ch');
  phon = phon.replace(/gy/g, 'j');

  // Step 2B: Syllabic nasals at word onset (nka -> enka, mpae -> empae)
  if (/^n[bcdfghjklmnpqrstvwxyz]/i.test(phon) && !/^ny|^nw/i.test(phon)) {
    phon = 'en' + phon.slice(1);
  } else if (/^m[bcdfghjklnpqrstvwxyz]/i.test(phon)) {
    phon = 'em' + phon.slice(1);
  }

  // Step 2C: Authentic Akan Open Vowels (ɔ = aw, ɛ = eh)
  phon = phon.replace(/[ɔ\u0254]{2}/g, 'aw-aw');
  phon = phon.replace(/[ɛ\u025B]{2}/g, 'eh-eh');
  phon = phon.replace(/[ɔ\u0254]/g, 'aw');
  phon = phon.replace(/[ɛ\u025B]/g, 'eh');

  // Step 2D: Akan Vowel Sequences & Diphthongs
  phon = phon.replace(/ae$/g, 'ah-eh');
  phon = phon.replace(/ee$/g, 'eh-eh');
  phon = phon.replace(/ie$/g, 'ee-eh');
  phon = phon.replace(/uo$/g, 'oo-oh');
  phon = phon.replace(/ia$/g, 'ee-ah');
  phon = phon.replace(/ua$/g, 'oo-ah');
  phon = phon.replace(/oo$/g, 'oh');
  phon = phon.replace(/uu$/g, 'oo');
  phon = phon.replace(/ii$/g, 'ee');
  phon = phon.replace(/aa$/g, 'ah');

  // Step 2E: Word-final open vowel protection against silent-e or English sight-word distortion
  if (/e$/.test(phon) && !/ee$|eh$/.test(phon)) {
    phon = phon.slice(0, -1) + 'eh';
  } else if (/o$/.test(phon) && !/oh$|oo$/.test(phon)) {
    phon = phon.slice(0, -1) + 'oh';
  } else if (/a$/.test(phon) && !/ah$/.test(phon)) {
    phon = phon.slice(0, -1) + 'ah';
  } else if (/i$/.test(phon) && phon.length <= 3) {
    phon = phon.slice(0, -1) + 'ee';
  } else if (/u$/.test(phon) && phon.length <= 3) {
    phon = phon.slice(0, -1) + 'oo';
  }

  // Capitalize if original word was capitalized
  if (coreText[0] === coreText[0].toUpperCase() && phon.length > 0) {
    phon = phon[0].toUpperCase() + phon.slice(1);
  }

  return `${leadingPunct}${phon}${trailingPunct}`;
}

/**
 * Transphonemizes an entire Twi verse or passage into authentic Ghanaian Akan phonetics
 * so 24kHz Neural TTS engines and standard speech synthesizers recite it with true Akan vowel values.
 */
export function transphonemizeTwiForSpeech(verseText: string): string {
  if (!verseText) return '';
  const words = verseText.split(/\s+/);
  return words.map(transphonemizeTwiWord).join(' ');
}

/**
 * Phonological speech conditioner for other West & East African Local Languages
 * (Ewe `ee`, Ga `gaa`, Yoruba `yo`, Igbo `ig`, Hausa `ha`, Swahili `sw`, isiZulu `zu`)
 * when synthesized by non-native fallback engines.
 */
export function conditionAfricanLocalLanguageForSpeech(text: string, langCode: string): string {
  if (!text) return '';
  const code = (langCode || '').toLowerCase().trim();

  if (code === 'tw' || code === 'ak' || code.includes('twi')) {
    return transphonemizeTwiForSpeech(text);
  }

  // Ewe (Eʋegbe — Ghana / Togo)
  if (code === 'ee' || code === 'ewe') {
    return text
      .replace(/Mawu/g, 'Mahwoo')
      .replace(/Aƒetɔ/g, 'Ahfehtaw')
      .replace(/Yesu/g, 'Yehsoo')
      .replace(/Kristo/g, 'Kreestoh')
      .replace(/Gbɔgbɔ/g, 'Gbawgbaw')
      .replace(/Kɔkɔe/g, 'Kawkaw-eh')
      .replace(/[ɖƉ]/g, 'd')
      .replace(/[ƒƑ]/g, 'f')
      .replace(/[ʋƲ]/g, 'v')
      .replace(/[ŋŊ]/g, 'ng')
      .replace(/[ɣƔ]/g, 'gh')
      .replace(/[ɛƐ]/g, 'eh')
      .replace(/[ɔƆ]/g, 'aw')
      .replace(/[ãẽĩõũ]/g, (m) => m.normalize('NFD')[0]);
  }

  // Ga (Gã — Greater Accra, Ghana)
  if (code === 'gaa' || code === 'ga') {
    return text
      .replace(/Nyɔŋmɔ/g, 'Nyawngmaw')
      .replace(/Nuŋtsɔ/g, 'Noongtsaw')
      .replace(/Yesu/g, 'Yehsoo')
      .replace(/Krɔŋkrɔŋ/g, 'Krawngkrawng')
      .replace(/Mumɔ/g, 'Moomaw')
      .replace(/shikpɔŋ/g, 'sheekpawng')
      .replace(/ŋwɛi/g, 'ngweh-ee')
      .replace(/[ŋŊ]/g, 'ng')
      .replace(/[ɛƐ]/g, 'eh')
      .replace(/[ɔƆ]/g, 'aw')
      .replace(/[ãẽĩõũ]/g, (m) => m.normalize('NFD')[0]);
  }

  // Yoruba (Èdè Yorùbá — Nigeria)
  if (code === 'yo' || code === 'yor') {
    return text
      .replace(/Ọlọ́run/gi, 'Awlawroon')
      .replace(/Olúwa/gi, 'Ohloowah')
      .replace(/Jésù/gi, 'Jehsoo')
      .replace(/Kírísítì/gi, 'Keereeseetee')
      .replace(/Ẹ̀mí/gi, 'Ehmee')
      .replace(/Mímọ́/gi, 'Meemaw')
      .replace(/ẹ/g, 'eh')
      .replace(/Ẹ/g, 'Eh')
      .replace(/ọ/g, 'aw')
      .replace(/Ọ/g, 'Aw')
      .replace(/ṣ/g, 'sh')
      .replace(/Ṣ/g, 'Sh');
  }

  // Igbo (Asụsụ Igbo — Nigeria)
  if (code === 'ig' || code === 'ibo') {
    return text
      .replace(/Chineke/gi, 'Cheeneh-keh')
      .replace(/Chukwu/gi, 'Chookwoo')
      .replace(/Onyenweanyị/gi, 'Ohnyeh-nweh-ahnyee')
      .replace(/Jisọs/gi, 'Jeesaws')
      .replace(/Kraịst/gi, 'Krah-eest')
      .replace(/Mmụọ/gi, 'Emmoo-aw')
      .replace(/Nsọ/gi, 'Ensaw')
      .replace(/[ịỊ]/g, 'ee')
      .replace(/[ọỌ]/g, 'aw')
      .replace(/[ụỤ]/g, 'oo')
      .replace(/[ṅṄ]/g, 'ng');
  }

  // Hausa (Harshen Hausa — West Africa)
  if (code === 'ha' || code === 'hau') {
    return text
      .replace(/[ɓƁ]/g, 'b')
      .replace(/[ɗƊ]/g, 'd')
      .replace(/[ƙƘ]/g, 'k')
      .replace(/[ƴƳ]/g, 'y');
  }

  return text;
}
