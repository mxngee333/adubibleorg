/**
 * Akan (Asante & Akuapem Twi) & West African Phonology & Speech Transphonemizer v2
 *
 * Engineered to eliminate English homograph mispronunciations ("boo" for bɔɔ, "eye" for ɛyɛ,
 * "free" for frɛɛ, "see" for sɛ, "knee" for ne, "no" for no, "tie" for Ti, "buy-oh" for bio)
 * across all neural TTS engines (Google Gemini 24kHz, Meta MMS-TTS, Groq Orpheus 24kHz, and
 * WebKit/Chromium SpeechSynthesis).
 *
 * Key Akan Phonological Rules Enforced:
 * 1. Open-mid back rounded vowel ɔ (/ɔ/) -> "aw" (e.g., bɔɔ -> baw-aw, wɔ -> waw, dɔ -> daw, kɔ -> kaw)
 * 2. Open-mid front unrounded vowel ɛ (/ɛ/) -> "eh" (e.g., ɛyɛ -> ehyeh, frɛɛ -> freh-eh, sɛ -> seh, yɛ -> yeh)
 * 3. Short word-final vowels protected against English diphthongization:
 *    - no (/nʊ/) -> "noh" (never English "NO" /noʊ/)
 *    - ne (/nɪ/) -> "neh" (never English "KNEE" /niː/)
 *    - me (/mɪ/) -> "meh" (never English "ME" /miː/)
 *    - wo (/wʊ/) -> "woh" (never English "WOE" /woʊ/)
 *    - ti (/ti/) -> "tee" (never English "TIE" /taɪ/)
 *    - bi, di, yi, si, fi, ni -> "bee", "dee", "yee", "see", "fee", "nee"
 *    - da, na, ka, ma, ba, fa, sa, ta -> "dah", "nah", "kah", "mah", "bah", "fah", "sah", "tah"
 * 4. Akan palatalized & labial-palatalized digraphs:
 *    - tw (/tɕw/) -> "chw"
 *    - dw (/dʑw/) -> "jw"
 *    - ky (/tɕ/)  -> "ch"
 *    - gy (/dʑ/)  -> "j"
 *    - hy (/ɕ/)   -> "sh"
 *    - hw (/ɕw/)  -> "shw"
 * 5. Native Akan Cardinal Numbers (1–150) for authentic Chapter ("Ti Baako") & Psalm ("Nnwom Aduonu Mmiɛnsa") announcements.
 */

// Complete Akan Cardinal Number System (Asante Twi & Akuapem Twi) for Chapters 1–150
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
 * Spoken canonical Bible book names in Asante/Akuapem Twi
 */
const SPOKEN_TWI_BOOK_NAMES: Record<string, string> = {
  gyenesis: 'Jehnehsees',
  genesis: 'Jehnehsees',
  eksodɔs: 'Ehksodaws',
  exodus: 'Ehksodaws',
  lewitikɔs: 'Lehweetikaws',
  leviticus: 'Lehweetikaws',
  numeri: 'Noomehree',
  deuteronomium: 'Deh-ootehrohnohmee-oom',
  yosua: 'Yohsoo-ah',
  atemmufoɔ: 'Ahtehm-moofaw',
  atemmufo: 'Ahtehm-moofoh',
  rut: 'Root',
  samuel: 'Sahmoo-ehl',
  ahemfo: 'Ah-hehmfoh',
  berɛsosɛm: 'Behreh-soh-sehm',
  beraɛsosɛm: 'Behreh-soh-sehm',
  esra: 'Ehsrah',
  nehemia: 'Neh-heh-mee-ah',
  ester: 'Ehstehr',
  hiob: 'Hee-ohb',
  nnwom: 'Enwom',
  psalms: 'Enwom',
  psalm: 'Enwom',
  mmebusɛm: 'Emmeh-boosehm',
  ɔsɛnkafoɔ: 'Awsehn-kahfaw',
  ɔsɛnkafo: 'Awsehn-kahfoh',
  yesaia: 'Yeh-sah-yah',
  yeremia: 'Yeh-reh-mee-ah',
  kwaadwom: 'Kwah-jwom',
  heszekiel: 'Heh-zeh-kee-ehl',
  daniel: 'Dah-nee-ehl',
  hosea: 'Hoh-seh-ah',
  yoel: 'Yoh-ehl',
  amos: 'Ah-mohs',
  obadia: 'Oh-bah-dee-ah',
  yona: 'Yoh-nah',
  mika: 'Mee-kah',
  nahum: 'Nah-hoom',
  habakuk: 'Hah-bah-kook',
  sefania: 'Seh-fah-nee-ah',
  hagai: 'Hah-gah-ee',
  sakaria: 'Sah-kah-ree-ah',
  malaki: 'Mah-lah-kee',
  mateo: 'Mah-teh-oh',
  marko: 'Mahr-koh',
  luka: 'Loo-kah',
  yohane: 'Yoh-hah-neh',
  romafoɔ: 'Roh-mah-faw',
  romafo: 'Roh-mah-foh',
  korintofoɔ: 'Koh-reen-toh-faw',
  korintofo: 'Koh-reen-toh-foh',
  galatifoɔ: 'Gah-lah-tee-faw',
  galatifo: 'Gah-lah-tee-foh',
  efesofoɔ: 'Eh-feh-soh-faw',
  efesofo: 'Eh-feh-soh-foh',
  ephesians: 'Eh-feh-soh-faw',
  filipifoɔ: 'Fee-lee-pee-faw',
  filipifo: 'Fee-lee-pee-foh',
  kolosefoɔ: 'Koh-loh-seh-faw',
  kolosefo: 'Koh-loh-seh-foh',
  tesalonikafoɔ: 'Teh-sah-loh-nee-kah-faw',
  timoteo: 'Tee-moh-teh-oh',
  tito: 'Tee-toh',
  filemon: 'Fee-leh-mohn',
  hebrifoɔ: 'Heh-bree-faw',
  hebrifo: 'Heh-bree-foh',
  yakobo: 'Yah-koh-boh',
  petro: 'Peh-troh',
  yuda: 'Yoo-dah',
  adiyisɛm: 'Ah-dee-yee-sehm',
};

/**
 * Comprehensive Sacred Akan (Asante & Akuapem Twi) Phonetic Lexicon
 * Every entry is calibrated so neural TTS models produce authentic Ghanaian Akan vowel & consonant quality.
 */
const SACRED_TWI_LEXICON: Record<string, string> = {
  // 1. Divine Names, Titles & Persons
  onyankopɔn: 'Ohnyankohpawn',
  onyankopon: 'Ohnyankohpawn',
  nyankopɔn: 'Nyankohpawn',
  nyankopon: 'Nyankohpawn',
  onyame: 'Ohnyahmeh',
  nyame: 'Nyahmeh',
  awurade: 'Ahwoorahdeh',
  yesu: 'Yehsoo',
  kristo: 'Kreestoh',
  tweduampɔn: 'Chwehdoo-ampawn',
  tweduampon: 'Chwehdoo-ampawn',
  ɔdomankoma: 'Awdoh-mankohmah',
  ɔbɔadeɛ: 'Awbaw-ahdeh-eh',
  agya: 'Ahjah',
  honhom: 'Hohnhohm',
  kronkron: 'Krohnkrohn',
  ɔdɔfoɔ: 'Awdawfaw',
  ɔdɔfo: 'Awdawfoh',
  ɔsorosoroni: 'Awsohroh-sohroh-nee',
  paulo: 'Pah-oo-loh',
  dawid: 'Dahweed',
  solomon: 'Sohlohmohn',
  mose: 'Mohseh',
  abraham: 'Ahbrah-hahm',
  israel: 'Eesrah-ehl',
  yerusalem: 'Yehroosahlehm',
  efeso: 'Ehfehsoh',
  nikodemo: 'Neekohdehmoh',

  // 2. Genesis 1 & Creation Core Vocabulary (Eliminating "boo", "eye", "free", "see", "no", "knee")
  gyenesis: 'Jehnehsees',
  mfitiaseɛ: 'Mfitee-ahseh',
  mfitiase: 'Mfitee-ahseh',
  bɔɔ: 'baw-aw',
  bɔe: 'baw-eh',
  bɔ: 'baw',
  rebɔ: 'rehbaw',
  wɔrebɔ: 'waw-rehbaw',
  adebɔ: 'ahdehbaw',
  wiase: 'wee-ahseh',
  ɔsoro: 'awsohroh',
  soro: 'sohroh',
  asase: 'ahsahseh',
  asaase: 'ahsahseh',
  sakasaka: 'sahkah-sahkah',
  hunu: 'hoonoo',
  hunuu: 'hoonoo',
  nhunu: 'enhoonoo',
  moahunu: 'moh-ah-hoonoo',
  nhumu: 'enhoomoo',
  nhunumu: 'enhoonoomoo',
  esum: 'ehsoom',
  sum: 'soom',
  ebun: 'ehboon',
  ani: 'ahnee',
  anim: 'ahneem',
  dɛkyɛdɛkyɛ: 'deh-cheh-deh-cheh',
  nsuo: 'ensoo-oh',
  nsu: 'ensoo',
  kaa: 'kah-ah',
  kae: 'kah-eh',
  ka: 'kah',
  nka: 'enkah',
  bɛka: 'behkah',
  ɔbɛka: 'awbehkah',
  sɛ: 'seh',
  hann: 'hahn',
  mmra: 'emmrah',
  bae: 'bah-eh',
  ba: 'bah',
  mma: 'emmah',
  ɛyɛ: 'ehyeh',
  yɛ: 'yeh',
  nyɛ: 'enyeh',
  ɔnyɛ: 'awnyeh',
  yɛn: 'yehn',
  yɛyɛ: 'yehyeh',
  ayɛ: 'ahyeh',
  wɔayɛ: 'waw-ahyeh',
  yɛe: 'yeh-eh',
  ɔyɛe: 'awyeh-eh',
  ɔyɛ: 'awyeh',
  paee: 'pah-eh',
  pae: 'pah-eh',
  frɛɛ: 'freh-eh',
  ɔfrɛɛ: 'awfreh-eh',
  frɛ: 'freh',
  avia: 'ahwee-ah',
  awia: 'ahwee-ah',
  anadwo: 'ahnah-jwoh',
  adeɛ: 'ahdeh-eh',
  ade: 'ahdeh',
  sae: 'sah-eh',
  kyee: 'cheh-eh',
  kye: 'cheh',
  da: 'dah',
  nna: 'ennah',
  dada: 'dahdah',
  dedaw: 'dehdahw',
  ɛdi: 'ehdee',
  edi: 'ehdee',
  adi: 'ahdee',
  yɛadi: 'yeh-ahdee',
  diiɛ: 'dee-eh',
  dii: 'dee',
  die: 'dee-eh',
  kan: 'kahn',
  nie: 'nee-eh',
  ni: 'nee',
  nsia: 'ensee-ah',
  ewim: 'ehweem',
  nkyekyɛmu: 'encheh-cheh-moo',

  // 3. High-Frequency Function Words, Pronouns & Particles (Zero English Homographs)
  no: 'noh',
  ne: 'neh',
  na: 'nah',
  me: 'meh',
  mo: 'moh',
  wo: 'woh',
  ɔno: 'awnoh',
  ɛno: 'ehnoh',
  wɔn: 'wawn',
  wɔ: 'waw',
  wɔwɔ: 'waw-waw',
  mowɔ: 'moh-waw',
  ɛwɔ: 'ehwaw',
  mu: 'moo',
  so: 'soh',
  soɔ: 'soh-aw',
  hɔ: 'haw',
  hɔnom: 'hawnohm',
  yi: 'yee',
  eyi: 'ehyee',
  bi: 'bee',
  biara: 'bee-ahrah',
  ti: 'tee',
  tire: 'teereh',
  tiri: 'teeree',
  tirim: 'teereem',
  di: 'dee',
  si: 'see',
  sii: 'see',
  asi: 'ahsee',
  kɔsi: 'kawsee',
  kosi: 'kohsee',
  fi: 'fee',
  efi: 'ehfee',
  firi: 'feeree',
  ɛfiri: 'ehfeeree',
  firii: 'feeree',
  fafirie: 'fah-feeree-eh',
  fafiri: 'fah-feeree',
  kɔ: 'kaw',
  kɔɔ: 'kaw-aw',
  kɔma: 'kawmah',
  rekɔ: 'rehkaw',
  tɔ: 'taw',
  wɔatɔ: 'waw-ahtaw',
  atɔ: 'ahtaw',
  dɔ: 'daw',
  ɔdɔ: 'awdaw',
  dɔɔ: 'daw-aw',
  modɔ: 'mohdaw',
  pɛ: 'peh',
  pɛyɛ: 'peh-yeh',
  sɔ: 'saw',
  sɔɔ: 'saw-aw',
  anisɔ: 'ahneesaw',
  ma: 'mah',
  maa: 'mah-ah',
  ama: 'ahmah',
  de: 'deh',
  deɛ: 'deh-eh',
  nea: 'neh-ah',
  sɛdeɛ: 'seh-deh-eh',
  sɛnea: 'seh-neh-ah',
  teɛ: 'teh-eh',
  te: 'teh',
  tee: 'teh-eh',
  motee: 'mohteh-eh',
  tie: 'tee-eh',
  bio: 'bee-oh',
  ara: 'ahrah',
  nso: 'ensoh',
  nko: 'enkoh',
  mmom: 'emmohm',
  koraa: 'kohrah',
  nti: 'entee',
  enti: 'ehntee',
  saa: 'sah-ah',
  ansa: 'ahnsah',
  berɛ: 'behreh',
  mmerɛ: 'emmeh-reh',
  mmere: 'emmeh-reh',

  // 4. Foundational Theological & Epistle Vocabulary (Ephesians, Psalms, John, Romans)
  nhyira: 'ensheerah',
  ahyira: 'ah-sheerah',
  adom: 'ahdohm',
  dom: 'dohm',
  asomdwoeɛ: 'ahsohm-jwoh-eh',
  asomdwoee: 'ahsohm-jwoh-eh',
  asomdwoe: 'ahsohm-jwoh-eh',
  gyidie: 'jeedee-eh',
  gyidi: 'jeedee',
  agyidifoɔ: 'ahjeedee-faw',
  gyidifo: 'jeedee-foh',
  gye: 'jeh',
  ɔgyeɛ: 'awjeh-eh',
  ogye: 'ohjeh',
  mogye: 'mohjeh',
  mugye: 'moojeh',
  yɛgye: 'yehjeh',
  wɔbɛgye: 'waw-behjeh',
  wobegye: 'woh-behjeh',
  nkwagyeɛ: 'enkwah-jeh-eh',
  nkwagye: 'enkwah-jeh',
  nkwa: 'enkwah',
  aseda: 'ahsehdah',
  ahobrɛaseɛ: 'ah-hoh-breh-ahseh-eh',
  ahobrease: 'ah-hoh-breh-ahseh',
  mpaebɔ: 'empah-ehbaw',
  mpaebo: 'empah-ehboh',
  twerɛ: 'chweh-reh',
  twere: 'chweh-reh',
  kyerɛw: 'cheh-rehw',
  kyerew: 'cheh-rehw',
  kyerɛ: 'cheh-reh',
  kyerɛɛ: 'cheh-reh-eh',
  kyere: 'cheh-reh',
  nyinaa: 'nyeenah',
  asɛm: 'ahsehm',
  asem: 'ahsehm',
  asɛmpa: 'ahsehm-pah',
  ahuntasɛm: 'ah-hoontah-sehm',
  ahintasɛm: 'ah-heentah-sehm',
  adiyisɛm: 'ahdee-yeesehm',
  nnwoma: 'enwohmah',
  nyansa: 'nyahnsah',
  anyansa: 'ahnyahnsah',
  bɔne: 'bawneh',
  bone: 'bawneh',
  mfomsoɔ: 'emfohm-soh-aw',
  mfomso: 'emfohm-soh',
  ahemman: 'ah-hehm-mahn',
  somafoɔ: 'sohmah-faw',
  somafo: 'sohmah-foh',
  ahotefoɔ: 'ah-hohteh-faw',
  ahotefo: 'ah-hohteh-foh',
  hwɛfoɔ: 'shwehfaw',
  hwɛfo: 'shwehfoh',
  hwɛ: 'shweh',
  dɛm: 'dehm',
  nni: 'ennee',
  ho: 'hoh',
  yii: 'yee',
  ɔyii: 'awyee',
  wɔayi: 'waw-ahyee',
  wɔapaw: 'waw-ahpahw',
  ɔpaw: 'awpahw',
  paw: 'pahw',
  bɛfa: 'behfah',
  animuonyam: 'ahnee-moo-ohnyahm',
  anuonyam: 'ahnoo-ohnyahm',
  ayeyie: 'ahyeh-yee-eh',
  ayeyi: 'ahyeh-yee',
  mogya: 'mohjah',
  nya: 'nyah',
  mennyae: 'mehn-nyah-eh',
  ahonya: 'ah-hohnyah',
  boroo: 'bohroh',
  ɛboroo: 'eh-bohroh',
  ɔdaa: 'awdah-ah',
  nhyehyɛeɛ: 'ensheh-sheh-eh',
  nhyehyɛe: 'ensheh-sheh-eh',
  ɛwie: 'ehwee-eh',
  ewie: 'ehwee-eh',
  abom: 'ahbohm',
  nnoɔma: 'ennaw-mah',
  nneɛma: 'enneh-mah',
  agyapadeɛ: 'ahjah-pahdeh-eh',
  agyapade: 'ahjah-pahdeh',
  agyinatuo: 'ahjeenah-too-oh',
  agyinatu: 'ahjeenah-too',
  botaeɛ: 'bohtah-eh',
  botae: 'bohtah-eh',
  ato: 'ahtoh',
  nokorɛ: 'nohkoh-reh',
  nokware: 'nohkwah-reh',
  bɔhyɛ: 'baw-sheh',
  ano: 'ahnoh',
  nnyinasodeɛ: 'enyeenah-sohdeh-eh',
  nnyinasode: 'enyeenah-sohdeh',
  aso: 'ahsoh',
  din: 'deen',
  mebɔ: 'mehbaw',
  wɔbɔ: 'wawbaw',
  nimdeɛ: 'neemdeh-eh',
  akoma: 'ahkohmah',
  ɔmma: 'awmmah',
  anidasoɔ: 'ahneedah-soh-aw',
  anidaso: 'ahneedah-soh',
  tumi: 'toomee',
  tumidie: 'toomee-dee-eh',
  kɛseyɛ: 'kehseh-yeh',
  ɛtra: 'ehtrah',
  ahoɔden: 'ah-haw-dehn',
  adwuma: 'ahjwoomah',
  ɔnyanee: 'aw-nyahneh',
  awufoɔ: 'ahwoofaw',
  awufo: 'ahwoofoh',
  tenaa: 'tehnah-ah',
  tenenee: 'tehneh-neh',
  teneneeni: 'tehneh-neh-nee',
  nifa: 'neefah',
  mpanyinnie: 'empah-nyeen-nee-eh',
  awuradie: 'ahwoorah-dee-eh',
  ɛreba: 'eh-rehbah',
  agu: 'ahgoo',
  nan: 'nahn',
  ase: 'ahseh',
  asafo: 'ahsahfoh',
  nipadua: 'neepah-doo-ah',
  onipa: 'ohneepah',
  suban: 'soobahn',
  ɔhyɛ: 'awsheh',
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
  // Handle numbered books like "1 Samuel", "2 Korintofoɔ", "1 Yohane"
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
  // Double open vowels first so bɔɔ -> baw-aw, frɛɛ -> freh-eh
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
