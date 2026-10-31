import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://adubible.org';
const DIST_DIR = path.join(__dirname, 'dist');
const TODAY = new Date().toISOString().slice(0, 10);
const CURRENT_YEAR = new Date().getFullYear();

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Load compiled master articles corpus
const corpusPath = path.join(__dirname, 'src', 'data', 'articlesCorpus.json');
let articles = [];
if (fs.existsSync(corpusPath)) {
  try {
    articles = JSON.parse(fs.readFileSync(corpusPath, 'utf-8'));
  } catch (err) {
    console.error('Failed to parse articlesCorpus.json:', err);
  }
}

// Load compiled master legal & institutional corpus
const legalCorpusPath = path.join(__dirname, 'src', 'data', 'legalPagesCorpus.json');
let legalPages = {};
if (fs.existsSync(legalCorpusPath)) {
  try {
    legalPages = JSON.parse(fs.readFileSync(legalCorpusPath, 'utf-8'));
  } catch (err) {
    console.error('Failed to parse legalPagesCorpus.json:', err);
  }
}

// Load compiled authority corpora (Top Verses, Topical Hubs, Strong's Lexicon)
const topVersesPath = path.join(__dirname, 'src', 'data', 'topVersesCorpus.json');
let topVerses = [];
if (fs.existsSync(topVersesPath)) {
  try {
    topVerses = JSON.parse(fs.readFileSync(topVersesPath, 'utf-8'));
  } catch (err) {
    console.error('Failed to parse topVersesCorpus.json:', err);
  }
}

const topicalHubsPath = path.join(__dirname, 'src', 'data', 'topicalScriptureCorpus.json');
let topicalHubs = [];
if (fs.existsSync(topicalHubsPath)) {
  try {
    topicalHubs = JSON.parse(fs.readFileSync(topicalHubsPath, 'utf-8'));
  } catch (err) {
    console.error('Failed to parse topicalScriptureCorpus.json:', err);
  }
}

const strongsLexiconPath = path.join(__dirname, 'src', 'data', 'strongsLexicon.json');
let strongsEntries = {};
if (fs.existsSync(strongsLexiconPath)) {
  try {
    strongsEntries = JSON.parse(fs.readFileSync(strongsLexiconPath, 'utf-8'));
  } catch (err) {
    console.error('Failed to parse strongsLexicon.json:', err);
  }
}

const CANONICAL_ROUTES = [
  {
    route: '/',
    priority: '1.0',
    changefreq: 'daily',
    title: "AduBible.org® — Free Online Bible, Parallel Bible Hub, Strong's Concordance, Audio Bible & Commentary",
    description:
      "Read the Holy Bible online free in 4 parallel columns across NKJV, KJV, BSB, Hebrew, Greek, French, Spanish, German, and Twi (35+ languages) on AduBible.org®. Features Genesis 1, Psalm 91, Psalm 23, Psalm 1, Psalm 35, Strong's Concordance, Bible Hub Commentary, 24kHz Audio Bible, Offline Bible App for Android & iOS, 3D Bible Games, and Bible Verses on Thanksgiving & Strength. 100% Ads-Free.",
    heading: "AduBible.org® — Free Online Parallel Bible Hub, Strong's Concordance, Audio Bible & Exegetical Commentary",
    excerpt:
      "Read and compare the Holy Bible online in up to 4 synchronized parallel columns across NKJV, KJV, BSB, Original Hebrew (WLC), Koine Greek (Textus Receptus), French, Spanish, German, and Asante Twi (35+ global languages). Includes Strong's Exhaustive Concordance, Matthew Henry & John Gill Commentaries, 24kHz Neural Audio Bible, Free Offline Bible App (Android, iOS & PC PWA), 3D Bible & Psalm Games, and Genesis 1 to Revelation 22 — 100% Ads-Free Forever.",
    isHomeAuthority: true,
  },
  {
    route: '/articles/',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'Pillar Scripture Guides, Exegesis & Digital Translation Library | AduBible.org®',
    description:
      "Explore 15 authoritative scripture and study guides: 100% ad-free parallel reading, Bible Gateway & Bible Hub comparisons, Greek/Hebrew Strong's concordance, Asante Twi, and ancient manuscripts on AduBible.",
    heading: 'AduBible Scripture & Study Articles — 15 Authoritative Research Pillars',
    excerpt:
      'A library of 15 comprehensive, 3,200+ word research guides covering ad-free Bible study, Bible Gateway and Bible Hub alternatives, Greek/Hebrew Strong concordance exegesis, multilingual parallel reading, and manuscript history.',
  },
  {
    route: '/nkjv/ephesians/1/',
    priority: '0.9',
    changefreq: 'monthly',
    title: "Ephesians 1 NKJV Parallel Bible — Strong's Concordance & Matthew Henry Commentary | AduBible.org®",
    description:
      "Study Ephesians Chapter 1 (verses 1–23) in NKJV, KJV, BSB, and Original Greek Interlinear with Strong's numbers (G2128 eulogētos, G4309 proorizō) and Matthew Henry Commentary on AduBible.",
    heading: 'Ephesians Chapter 1 (NKJV) — Parallel Study, Greek Interlinear & Commentaries',
    excerpt:
      'Paul, an apostle of Jesus Christ by the will of God, To the saints who are in Ephesus, and faithful in Christ Jesus: Grace to you and peace from God our Father and the Lord Jesus Christ. Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ.',
    verses: [
      '1. Paul, an apostle of Jesus Christ by the will of God, To the saints who are in Ephesus, and faithful in Christ Jesus:',
      '2. Grace to you and peace from God our Father and the Lord Jesus Christ.',
      '3. Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ,',
      '4. just as He chose us in Him before the foundation of the world, that we should be holy and without blame before Him in love,',
      '5. having predestined us to adoption as sons by Jesus Christ to Himself, according to the good pleasure of His will,',
      '6. to the praise of the glory of His grace, by which He made us accepted in the Beloved.',
      '7. In Him we have redemption through His blood, the forgiveness of sins, according to the riches of His grace.',
    ],
    studyNotes: "Strong's Greek Key: Eulogētos (G2128 — Blessed/Adored), Eklegomai (G1586 — Chosen out in love), Proorizō (G4309 — Predestined unto sonship huiothesia G5206), Apolytrōsis (G629 — Redemption by ransom).",
  },
  {
    route: '/twi/ephesians/1/',
    priority: '0.9',
    changefreq: 'monthly',
    title: 'Efesofoɔ 1 — Asante Twi Bible (Twerɛ Kronkron) & English Parallel Study | AduBible.org®',
    description:
      'Kenkan Efesofoɔ Ti 1 (Ephesians 1) wɔ Asante Twi Twerɛ Kronkron ne Borɔfo (NKJV/KJV) mu. Read Asante Twi and Akuapem Twi Scripture side-by-side with Strong’s Lexicon and 24kHz Akan Audio on AduBible.',
    heading: 'Efesofoɔ Ti 1 (Asante Twi Twerɛ Kronkron) — Parallel Bible & 24kHz Akan Audio Study',
    excerpt:
      'Paulo, Onyankopɔn pɛ mu Kristo Yesu somafoɔ, de kɔma ahotefoɔ a wɔwɔ Efeso ne Kristo Yesu mu agyidifoɔ: Adom ne asomdwoeɛ a ɛfiri yɛn Agya Onyankopɔn ne Awurade Yesu Kristo nka mo.',
    verses: [
      '1. Paulo, Onyankopɔn pɛ mu Kristo Yesu somafoɔ, de kɔma ahotefoɔ a wɔwɔ Efeso ne Kristo Yesu mu agyidifoɔ:',
      '2. Adom ne asomdwoeɛ a ɛfiri yɛn Agya Onyankopɔn ne Awurade Yesu Kristo nka mo.',
      '3. Nhyira nka yɛn Awurade Yesu Kristo Nyankopɔn ne n’Agya a ɔnam Kristo so de honhom mu nhyira nyinaa ahyira yɛn ɔsoro hɔnom,',
      '4. sɛdeɛ ɔyii yɛn wɔ ne mu ansa na wɔrebɔ wiase, sɛ yɛnyɛ kronkron a dɛm nni yɛn ho wɔ n’anim, ɔdɔ mu;',
      '7. Ɔno ara mu na yɛnam ne mogya so nya ɔgyeɛ, a ɛne mfomsoɔ fafirie, sɛdeɛ n’adom ahonya no teɛ.',
    ],
    studyNotes: 'Includes Asante Twi (Twerɛ Kronkron), Akuapem Twi, English NKJV/KJV side-by-side parallel alignment, and 24kHz Akan Neural Voice Synthesis.',
  },
  {
    route: '/kjv/ephesians/1/',
    priority: '0.9',
    changefreq: 'monthly',
    title: "Ephesians 1 KJV with Strong's Concordance & Parallel Study | AduBible.org®",
    description:
      "Read Ephesians 1 in the Authorized King James Version (KJV) with Greek Textus Receptus and Strong's Exhaustive Concordance on AduBible.",
    heading: 'Ephesians Chapter 1 (KJV 1769) — Exhaustive Strong’s Concordance Edition',
    excerpt:
      'Blessed be the God and Father of our Lord Jesus Christ, who hath blessed us with all spiritual blessings in heavenly places in Christ: According as he hath chosen us in him before the foundation of the world.',
    verses: [
      '1. Paul, an apostle of Jesus Christ by the will of God, to the saints which are at Ephesus, and to the faithful in Christ Jesus:',
      '2. Grace be to you, and peace, from God our Father, and from the Lord Jesus Christ.',
      '3. Blessed be the God and Father of our Lord Jesus Christ, who hath blessed us with all spiritual blessings in heavenly places in Christ:',
      '4. According as he hath chosen us in him before the foundation of the world, that we should be holy and without blame before him in love.',
    ],
  },
  {
    route: '/parallel/ephesians/1/',
    priority: '0.9',
    changefreq: 'monthly',
    title: 'Ephesians 1 Multi-Language Parallel Bible (KJV, BSB, Greek, French, Spanish) | AduBible.org®',
    description:
      'Compare Ephesians 1 verse-by-verse across KJV, BSB, NKJV, Koine Greek, French Louis Segond, Spanish Reina-Valera, and 35+ global languages on AduBible.',
    heading: 'Ephesians 1 — Synchronized Multi-Language Parallel Reader',
    excerpt:
      'Side-by-side comparison of Ephesians 1:1–23 across English, Original Greek, French, Spanish, German, Arabic, Swahili, Yoruba, and global editions.',
  },
  {
    route: '/nkjv/genesis/1/',
    priority: '0.9',
    changefreq: 'monthly',
    title: "Genesis 1 NKJV, Hebrew WLC & KJV Parallel Bible — In the Beginning God Created | AduBible.org®",
    description:
      "In the beginning God (Elohim H430) created the heavens and the earth. Read Genesis Chapter 1 (verses 1–31) in parallel across NKJV, KJV, BSB, and Westminster Leningrad Codex Hebrew on AduBible.",
    heading: 'Genesis Chapter 1 (NKJV & KJV) — Creation Account in Parallel & Hebrew Interlinear',
    excerpt:
      'In the beginning God created the heavens and the earth. בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ׃ Read all 31 verses of Genesis 1 with Strong’s Hebrew Concordance (H7225 Bereshit, H1254 Bara, H430 Elohim, H216 Or) and Matthew Henry Commentary.',
    verses: [
      '1. In the beginning God created the heavens and the earth.',
      '2. The earth was without form, and void; and darkness was on the face of the deep. And the Spirit of God was hovering over the face of the waters.',
      '3. Then God said, “Let there be light”; and there was light.',
      '4. And God saw the light, that it was good; and God divided the light from the darkness.',
      '5. God called the light Day, and the darkness He called Night. So the evening and the morning were the first day.',
      '26. Then God said, “Let Us make man in Our image, according to Our likeness...”',
      '27. So God created man in His own image; in the image of God He created him; male and female He created them.',
      '31. Then God saw everything that He had made, and indeed it was very good. So the evening and the morning were the sixth day.',
    ],
    studyNotes: "Strong's Hebrew Lexicon: Bereshit (H7225 — In the beginning), Bara (H1254 — Created ex nihilo), Elohim (H430 — Supreme Creator God), Ruach Elohim (H7307 — Spirit of God), Or (H216 — Light).",
  },
  {
    route: '/nkjv/psalms/1/',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'Psalms Chapter 1 (Psalm 1 NKJV & KJV) — Blessed Is the Man Parallel Bible & Commentary | AduBible.org®',
    description:
      'Read Psalms Chapter 1 (Psalm 1:1–6) in NKJV, KJV, Hebrew, and Asante Twi on AduBible.org®. "Blessed is the man who walks not in the counsel of the ungodly... He shall be like a tree planted by the rivers of water." Includes Psalm pronunciation, commentary, and audio.',
    heading: 'Psalms Chapter 1 (Psalm 1 NKJV & KJV) — The Way of the Righteous & the Ungodly',
    excerpt:
      'Blessed is the man Who walks not in the counsel of the ungodly, Nor stands in the path of sinners, Nor sits in the seat of the scornful; But his delight is in the law of the LORD, And in His law he meditates day and night (Psalm 1:1–2).',
    verses: [
      '1. Blessed is the man Who walks not in the counsel of the ungodly, Nor stands in the path of sinners, Nor sits in the seat of the scornful;',
      '2. But his delight is in the law of the LORD, And in His law he meditates day and night.',
      '3. He shall be like a tree Planted by the rivers of water, That brings forth its fruit in its season, Whose leaf also shall not wither; And whatever he does shall prosper.',
      '4. The ungodly are not so, But are like the chaff which the wind drives away.',
      '5. Therefore the ungodly shall not stand in the judgment, Nor sinners in the congregation of the righteous.',
      '6. For the LORD knows the way of the righteous, But the way of the ungodly shall perish.',
    ],
    studyNotes: "Strong's Hebrew Key: Esheg / Ashrei (H835 — O the blessednesses of), Torah (H8451 — Law/Instruction of YHWH), Hagah (H1897 — To meditate/ponder day and night), Shalath / Shatal (H8362 — Transplanted by streams of water).",
  },
  {
    route: '/nkjv/psalms/23/',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'Psalm 23 NKJV & KJV Parallel Bible — The LORD Is My Shepherd | AduBible.org®',
    description:
      'The LORD is my shepherd; I shall not want. Read and study all 6 verses of Psalm 23 in NKJV, KJV, Hebrew (Yahweh Roi), Asante Twi, and Matthew Henry Commentary with 24kHz Audio on AduBible.org®.',
    heading: 'Psalm 23 (NKJV & KJV) — The LORD Is My Shepherd Parallel Psalm & Exegesis',
    excerpt:
      'The LORD is my shepherd; I shall not want. He makes me to lie down in green pastures; He leads me beside the still waters. He restores my soul; He leads me in the paths of righteousness For His name’s sake (Psalm 23:1–3).',
    verses: [
      '1. The LORD is my shepherd; I shall not want.',
      '2. He makes me to lie down in green pastures; He leads me beside the still waters.',
      '3. He restores my soul; He leads me in the paths of righteousness For His name’s sake.',
      '4. Yea, though I walk through the valley of the shadow of death, I will fear no evil; For You are with me; Your rod and Your staff, they comfort me.',
      '5. You prepare a table before me in the presence of my enemies; You anoint my head with oil; My cup runs over.',
      '6. Surely goodness and mercy shall follow me All the days of my life; And I will dwell in the house of the LORD Forever.',
    ],
    studyNotes: "Strong's Hebrew Key: YHWH Roi (H3068 + H7462 — The LORD is my Shepherd), Nephesh (H5315 — Soul/Vital life restored), Tsalmaveth (H6757 — Shadow of death/deep darkness), Chesed (H2617 — Covenant mercy and unfailing love).",
  },
  {
    route: '/nkjv/psalms/34/',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'Psalm 34 NKJV & KJV Parallel Bible — I Will Bless the LORD at All Times | AduBible.org®',
    description:
      'Read Psalm 34 (verses 1–22) in NKJV, KJV, and Asante Twi parallel columns on AduBible.org®. "I sought the LORD, and He heard me, and delivered me from all my fears... Oh, taste and see that the LORD is good!"',
    heading: 'Psalm 34 (NKJV & KJV) — Deliverance from Fear & Taste and See That the LORD Is Good',
    excerpt:
      'I will bless the LORD at all times; His praise shall continually be in my mouth... I sought the LORD, and He heard me, And delivered me from all my fears. The angel of the LORD encamps all around those who fear Him, And delivers them (Psalm 34:1, 4, 7).',
    verses: [
      '1. I will bless the LORD at all times; His praise shall continually be in my mouth.',
      '2. My soul shall make its boast in the LORD; The humble shall hear of it and be glad.',
      '3. Oh, magnify the LORD with me, And let us exalt His name together.',
      '4. I sought the LORD, and He heard me, And delivered me from all my fears.',
      '7. The angel of the LORD encamps all around those who fear Him, And delivers them.',
      '8. Oh, taste and see that the LORD is good; Blessed is the man who trusts in Him!',
      '18. The LORD is near to those who have a broken heart, And saves such as have a contrite spirit.',
      '19. Many are the afflictions of the righteous, But the LORD delivers him out of them all.',
    ],
    studyNotes: "Strong's Hebrew Key: Barak (H1288 — Kneel/Bless continually), Darash (H1875 — Sought earnestly), Natsal (H5337 — Delivered/Snatched away from all fears), Ta'am (H2938 — Taste/Perceive experientially).",
  },
  {
    route: '/nkjv/psalms/35/',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'Psalm 35 NKJV & KJV Parallel Bible — Plead My Cause, O LORD & Commentary | AduBible.org®',
    description:
      'Read Psalm 35 (verses 1–28) in NKJV, KJV, and Asante Twi parallel columns on AduBible.org®. "Plead my cause, O LORD, with those who strive with me; fight against those who fight against me. Take hold of shield and buckler, and stand up for my help."',
    heading: 'Psalm 35 (NKJV & KJV) — Prayer for Divine Vindication & Spiritual Defense',
    excerpt:
      'Plead my cause, O LORD, with those who strive with me; Fight against those who fight against me. Take hold of shield and buckler, And stand up for my help. Also draw out the spear, And stop those who pursue me. Say to my soul, “I am your salvation” (Psalm 35:1–3).',
    verses: [
      '1. Plead my cause, O LORD, with those who strive with me; Fight against those who fight against me.',
      '2. Take hold of shield and buckler, And stand up for my help.',
      '3. Also draw out the spear, And stop those who pursue me. Say to my soul, “I am your salvation.”',
      '9. And my soul shall be joyful in the LORD; It shall rejoice in His salvation.',
      '10. All my bones shall say, “LORD, who is like You, Delivering the poor from him who is too strong for him...”',
      '27. Let them shout for joy and be glad, Who favor my righteous cause; And let them say continually, “Let the LORD be magnified, Who has pleasure in the prosperity of His servant.”',
      '28. And my tongue shall speak of Your righteousness And of Your praise all the day long.',
    ],
    studyNotes: "Strong's Hebrew Key: Rib (H7378 — Contend/Plead my legal cause), Lacham (H3898 — Fight/Do battle), Magen & Tsinnah (H4043 & H6793 — Small buckler and full-body shield), Yeshuah (H3444 — Salvation/Deliverance).",
  },
  {
    route: '/nkjv/psalms/91/',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'Book of Psalms 91 (Psalm 91 NKJV & KJV) — Under the Shadow of the Almighty Parallel Bible | AduBible.org®',
    description:
      'Read the Book of Psalms 91 (Psalm 91:1–16) in NKJV, KJV, Hebrew, and Asante Twi on AduBible.org®. "He who dwells in the secret place of the Most High shall abide under the shadow of the Almighty. I will say of the LORD, He is my refuge and my fortress."',
    heading: 'Book of Psalms 91 (Psalm 91 NKJV & KJV) — Dwelling in the Secret Place of the Most High',
    excerpt:
      'He who dwells in the secret place of the Most High Shall abide under the shadow of the Almighty. I will say of the LORD, “He is my refuge and my fortress; My God, in Him I will trust” (Psalm 91:1–2). Read all 16 verses in parallel with Strong’s Hebrew names of God (Elyon, Shaddai, YHWH, Elohim).',
    verses: [
      '1. He who dwells in the secret place of the Most High Shall abide under the shadow of the Almighty.',
      '2. I will say of the LORD, “He is my refuge and my fortress; My God, in Him I will trust.”',
      '3. Surely He shall deliver you from the snare of the fowler And from the perilous pestilence.',
      '4. He shall cover you with His feathers, And under His wings you shall take refuge; His truth shall be your shield and buckler.',
      '5. You shall not be afraid of the terror by night, Nor of the arrow that flies by day,',
      '6. Nor of the pestilence that walks in darkness, Nor of the destruction that lays waste at noonday.',
      '7. A thousand may fall at your side, And ten thousand at your right hand; But it shall not come near you.',
      '9. Because you have made the LORD, who is my refuge, Even the Most High, your dwelling place,',
      '10. No evil shall befall you, Nor shall any plague come near your dwelling;',
      '11. For He shall give His angels charge over you, To keep you in all your ways.',
      '14. “Because he has set his love upon Me, therefore I will deliver him; I will set him on high, because he has known My name.',
      '15. He shall call upon Me, and I will answer him; I will be with him in trouble; I will deliver him and honor him.',
      '16. With long life I will satisfy him, And show him My salvation.”',
    ],
    studyNotes: "Strong's Four Covenant Names in Psalm 91:1–2: Elyon (H5945 — The Most High), Shaddai (H7706 — The Almighty), YHWH (H3068 — The Covenant LORD), Elohim (H430 — My Mighty God). Secret Place: Sether (H5643).",
  },
  {
    route: '/nkjv/john/1/',
    priority: '0.9',
    changefreq: 'monthly',
    title: 'John 1 NKJV, Greek Interlinear & KJV Parallel Bible | AduBible.org®',
    description:
      'In the beginning was the Word (Logos G3056), and the Word was with God, and the Word was God. Study John 1 in parallel with Strong’s Greek Lexicon on AduBible.',
    heading: 'John Chapter 1 (NKJV) — The Eternal Logos in Parallel & Greek Interlinear',
    excerpt:
      'In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made.',
    verses: [
      '1. In the beginning was the Word, and the Word was with God, and the Word was God.',
      '2. He was in the beginning with God.',
      '3. All things were made through Him, and without Him nothing was made that was made.',
      '4. In Him was life, and the life was the light of men.',
      '5. And the light shines in the darkness, and the darkness did not comprehend it.',
      '14. And the Word became flesh and dwelt among us, and we beheld His glory, the glory as of the only begotten of the Father, full of grace and truth.',
    ],
  },
  {
    route: '/nkjv/romans/8/',
    priority: '0.9',
    changefreq: 'monthly',
    title: 'Romans 8 NKJV & KJV Parallel Bible Study — More Than Conquerors | AduBible.org®',
    description:
      'There is therefore now no condemnation to those who are in Christ Jesus. Read Romans 8 in parallel across NKJV, KJV, and Open-Source Commentaries on AduBible.',
    heading: 'Romans Chapter 8 (NKJV) — Life in the Spirit & More Than Conquerors',
    excerpt:
      'There is therefore now no condemnation to those who are in Christ Jesus, who do not walk according to the flesh, but according to the Spirit.',
    verses: [
      '1. There is therefore now no condemnation to those who are in Christ Jesus, who do not walk according to the flesh, but according to the Spirit.',
      '2. For the law of the Spirit of life in Christ Jesus has made me free from the law of sin and death.',
      '28. And we know that all things work together for good to those who love God, to those who are the called according to His purpose.',
      '31. What then shall we say to these things? If God is for us, who can be against us?',
      '37. Yet in all these things we are more than conquerors through Him who loved us.',
    ],
  },
  {
    route: '/deuterocanon/',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'Deuterocanonical Scriptures & Apocrypha — 16 Sacred Books in Parallel | AduBible.org®',
    description:
      'Read the 16 Deuterocanonical Books (Tobit, Judith, Wisdom of Solomon, Sirach, Baruch, 1 & 2 Maccabees, Septuagint additions) in parallel across KJV 1611 Apocrypha, Douay-Rheims, Greek LXX, and Asante Twi on AduBible.',
    heading: 'Deuterocanonical Scriptures & Biblical Apocrypha (16 Books) — Parallel Study',
    excerpt:
      'Sacred scriptures canonical for Catholic, Eastern Orthodox, and Oriental traditions. Features Wisdom of Solomon, Sirach (Ecclesiasticus), Tobit, Judith, and Maccabees in parallel translations with 24kHz audio.',
  },
  {
    route: '/list-of-sixty/',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'List of Sixty Canonical & Apocryphal Books — 7th-Century Manuscript Index & Apostolic Fathers | AduBible.org®',
    description:
      'Explore the ancient 7th-century List of Sixty and Apocrypha (1 Enoch, Didache, Shepherd of Hermas, Clement, Testament of the Twelve Patriarchs) in parallel across R.H. Charles, Lightfoot, and Asante Twi translations on AduBible.',
    heading: 'List of Sixty & Ancient Apocrypha (25 Historic Books) — Apostolic Fathers & Pseudepigrapha',
    excerpt:
      'Historic 7th-century manuscript canon index preserved in Codex Sinaiticus, Ethiopian Orthodox canon, and Early Church collections. Read 1 Enoch, Didache, Epistle of Barnabas, and Shepherd of Hermas in parallel.',
  },
  {
    route: '/apocrypha/',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'Biblical Apocrypha & Ancient Pseudepigrapha — 25 Historic Sacred Books | AduBible.org®',
    description:
      'Read 25 ancient Apocrypha and Pseudepigrapha books (1 Enoch, Book of Jasher, Jubilees, 2 Esdras, Didache, Shepherd of Hermas) in parallel across R.H. Charles, Lightfoot, and Asante Twi on AduBible.',
    heading: 'Biblical Apocrypha & Ancient Pseudepigrapha (25 Sacred Books) — Parallel Study',
    excerpt:
      'Ancient Jewish and early Christian sacred literature including 1 Enoch (Book of Enoch), Book of Jasher, Book of Jubilees, 2 Esdras (4 Ezra), and Apostolic Fathers with 24kHz neural audio and sovereign offline storage.',
  },
  {
    route: '/donate/',
    priority: '0.8',
    changefreq: 'monthly',
    title: 'Support the AduBible Scripture Mission — 100% Ad-Free Scripture for Humanity | AduBible.org®',
    description:
      'Partner with AduBible in honoring the legacy of Apostle Kwame Adu of Nsuhia, Ghana. Support non-profit parallel Bible translation, Asante Twi digitizing, and zero-ad server operations via Stripe and PayPal.',
    heading: 'Support the AduBible Planetary Scripture Mission — Giving & Partnership',
    excerpt:
      'AduBible operates as a dedicated, 100% ad-free non-profit scripture sanctuary for 4 billion readers worldwide, honoring Apostle Kwame Adu of Nsuhia, Ghana (https://nsuhia.com/). Support our planetary scripture distribution via Stripe (Card, Apple Pay, Google Pay) and PayPal.',
  },
  {
    route: '/ask/',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'Ask AduBible — Ancient Biblical Wisdom & Exegesis | AduBible.org®',
    description:
      "Ask AduBible for deep exegetical answers from the Holy Bible, Hebrew Masoretic text, Greek Textus Receptus, and Strong's Concordance. 100% free, unmonetized sanctuary AI honoring Apostle Kwame Adu of Nsuhia, Ghana.",
    heading: 'Ask AduBible — Ancient Biblical Wisdom & Exegetical Intelligence',
    excerpt:
      'Explore deep biblical exegesis, original Hebrew and Greek root words, covenant hermeneutics, and Asante Twi theological heritage with Ask AduBible. A sovereign, unmonetized sanctuary intelligence dedicated to the glory of God.',
  },
];

// Append all 9 Legal & Institutional Governance Pages from Corpus
for (const key of Object.keys(legalPages)) {
  const lp = legalPages[key];
  CANONICAL_ROUTES.push({
    route: `/${lp.slug}/`,
    priority: '0.7',
    changefreq: 'monthly',
    title: lp.metaTitle,
    description: lp.metaDescription,
    heading: lp.title,
    excerpt: lp.metaDescription,
    legalPageData: lp,
  });
}

// Append all 15 Pillar Articles to CANONICAL_ROUTES
for (const art of articles) {
  CANONICAL_ROUTES.push({
    route: `/articles/${art.slug}/`,
    priority: '0.9',
    changefreq: 'weekly',
    title: art.metaTitle,
    description: art.metaDescription,
    heading: `${art.title} — ${art.subtitle}`,
    excerpt: art.excerpt,
    article: art,
  });
}

// 23 localization routes
const MEGA_LOCALES = [
  { code: 'tw', name: 'Asante Twi (Twerɛ Kronkron)' },
  { code: 'de', name: 'Deutsch (German Luther Bible)' },
  { code: 'es', name: 'Español (Reina-Valera)' },
  { code: 'fr', name: 'Français (Louis Segond)' },
  { code: 'pt', name: 'Português (Almeida)' },
  { code: 'it', name: 'Italiano (Riveduta)' },
  { code: 'ar', name: 'العربية (Arabic Smith & Van Dyke)' },
  { code: 'hi', name: 'हिन्दी (Hindi Bible)' },
  { code: 'bn', name: 'বাংলা (Bengali Bible)' },
  { code: 'ta', name: 'தமிழ் (Tamil Bible)' },
  { code: 'te', name: 'తెలుగు (Telugu Bible)' },
  { code: 'id', name: 'Bahasa Indonesia (Terjemahan Baru)' },
  { code: 'tl', name: 'Tagalog (Ang Dating Biblia)' },
  { code: 'ko', name: '한국어 (Korean Revised Version)' },
  { code: 'ja', name: '日本語 (Japanese Kougo-yaku)' },
  { code: 'zh-hans', name: '简体中文 (Simplified Chinese CUV)' },
  { code: 'zh-hant', name: '繁體中文 (Traditional Chinese CUV)' },
  { code: 'sw', name: 'Kiswahili (Swahili Union Version)' },
  { code: 'ha', name: 'Hausa (Littafi Mai Tsarki)' },
  { code: 'yo', name: 'Èdè Yorùbá (Bíbélì Mímọ́)' },
  { code: 'vi', name: 'Tiếng Việt (Vietnamese Bible)' },
  { code: 'tr', name: 'Türkçe (Kutsal Kitap)' },
  { code: 'ru', name: 'Русский (Russian Synodal Bible)' },
];

for (const loc of MEGA_LOCALES) {
  CANONICAL_ROUTES.push({
    route: `/${loc.code}/`,
    priority: '0.8',
    changefreq: 'weekly',
    title: `AduBible.org® (${loc.name}) — Online Parallel Bible, Strong's Concordance & Audio | Adubible.org`,
    description: `Read and study the Holy Bible online in ${loc.name} alongside English (NKJV/KJV/BSB) and Original Hebrew & Greek on AduBible.org® with Strong's Concordance, Commentaries, and zero ads.`,
    heading: `${loc.name} — Online Parallel Bible & Exegetical Study Sanctuary`,
    excerpt: `Read ${loc.name} in synchronized parallel columns with Strong's Exhaustive Concordance, Matthew Henry Commentary, 24kHz Audio Bible, and cloud-synced bookmarks, pins, highlights, and notes on AduBible.org®.`,
  });
}

// ==========================================
// 1. TOP 30 VERSES AUTHORITY HUBS & DIRECTORY
// ==========================================
CANONICAL_ROUTES.push({
  route: '/verse/',
  priority: '0.9',
  changefreq: 'weekly',
  title: 'Top 30 Most Searched Bible Verses in Parallel | AduBible.org®',
  description:
    'Read and study the 30 most famous and searched Bible verses in parallel (John 3:16, Psalm 23:1, Psalm 91:1, Romans 8:28, Philippians 4:13) across NKJV, KJV, BSB, Hebrew, Greek, and Asante Twi with Strong’s Concordance and 24kHz Studio Audio on AduBible.org®.',
  heading: 'Top 30 Most Searched Bible Verses — Multi-Translation Parallel Sanctuary',
  excerpt:
    'A curated sanctuary of the 30 most profound scriptures in human history, compared side-by-side across English, Original Languages, and African Translations with Position #0 definitions.',
  isVerseIndex: true,
});

for (const v of topVerses) {
  CANONICAL_ROUTES.push({
    route: `/verse/${v.slug}/`,
    priority: '0.9',
    changefreq: 'weekly',
    title: `${v.title}`,
    description: `${v.positionZeroSummary} Read in NKJV, KJV, BSB, and Asante Twi on AduBible.org®.`,
    heading: `${v.reference} — Parallel Bible Study & Original Language Exegesis`,
    excerpt: v.positionZeroSummary,
    topVerseData: v,
  });
}

// ==========================================
// 2. 10 TOPICAL SCRIPTURE LIFE THEMES & HUB
// ==========================================
CANONICAL_ROUTES.push({
  route: '/topics/',
  priority: '0.9',
  changefreq: 'weekly',
  title: 'Topical Scripture Hubs — 10 Life Themes in Parallel | AduBible.org®',
  description:
    'Explore 10 comprehensive topical scripture hubs: Healing, Strength, Divine Protection, Peace Over Anxiety, Thanksgiving, Faith, Love (Agape), Hope, Forgiveness, and Wisdom with parallel translations and commentaries on AduBible.org®.',
  heading: 'AduBible Topical Scripture Hubs — 10 Foundational Themes for Life & Prayer',
  excerpt:
    'Curated thematic scripture collections addressing real human needs: healing, endurance, anxiety, thanksgiving, and spiritual defense with deep theological expositions and 24kHz audio.',
  isTopicsIndex: true,
});

for (const hub of topicalHubs) {
  CANONICAL_ROUTES.push({
    route: `/topics/${hub.slug}/`,
    priority: '0.9',
    changefreq: 'weekly',
    title: hub.title,
    description: hub.metaDescription,
    heading: hub.h1,
    excerpt: hub.tagline,
    topicalHubData: hub,
  });
}

// ==========================================
// 3. STRONG'S GREEK & HEBREW LEXICON ENGINE
// ==========================================
CANONICAL_ROUTES.push({
  route: '/lexicon/',
  priority: '0.9',
  changefreq: 'weekly',
  title: 'Strong’s Greek & Hebrew Exhaustive Concordance Lexicon | AduBible.org®',
  description:
    'Search and study Hebrew (H1–H8674) and Greek (G1–G5624) original root words from Strong’s Exhaustive Concordance with BDB/Thayer definitions, pronunciations, biblical occurrences, and Asante Twi translations on AduBible.org®.',
  heading: 'Strong’s Exhaustive Concordance — Hebrew & Greek Lexicon Sanctuary',
  excerpt:
    'The complete biblical vocabulary of the Old and New Testaments, providing root derivations, phonetic pronunciations, theological meanings, and occurrence maps for pastors and scholars.',
  isLexiconIndex: true,
});

for (const [code, entry] of Object.entries(strongsEntries)) {
  const codeLower = code.toLowerCase();
  CANONICAL_ROUTES.push({
    route: `/lexicon/${codeLower}/`,
    priority: '0.8',
    changefreq: 'monthly',
    title: `${code} ${entry.transliteration} (${entry.originalWord}) — Strong’s ${entry.language} Lexicon & Definition | AduBible.org®`,
    description: `${entry.code} ${entry.transliteration} (${entry.originalWord}): ${entry.shortDefinition}. Strong's ${entry.language} definition, BDB/Thayer exegesis, occurrences (${entry.occurrences}x), and key biblical verses on AduBible.org®.`,
    heading: `${entry.code}: ${entry.originalWord} (${entry.transliteration}) — Strong’s ${entry.language} Lexicon`,
    excerpt: `${entry.shortDefinition} — ${entry.fullDefinition}`,
    lexiconData: entry,
  });
}

function extractFaqSchema(contentHtml) {
  const faqRegex = /<h3[^>]*>(?:Q\d+:?\s*)?([^<]+)<\/h3>\s*<p><strong>Answer:<\/strong>\s*([\s\S]*?)<\/p>/gi;
  const questions = [];
  let match;
  while ((match = faqRegex.exec(contentHtml)) !== null) {
    const q = match[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
    const a = match[2].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
    if (q && a) {
      questions.push({
        '@type': 'Question',
        'name': q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': a,
        },
      });
    }
  }
  if (questions.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': questions,
  };
}

const HOME_FAQ_ITEMS = [
  {
    q: 'What is the best 100% ad-free online Bible alternative to Bible Hub and Bible Gateway?',
    a: "AduBible.org® is a 100% ad-free, unmonetized online parallel Bible sanctuary dedicated to humanity. It combines Bible Hub's deep exegetical resources (Strong's Hebrew and Greek Concordance, interlinear parsing, and classic commentaries by Matthew Henry, John Gill, and Jamieson-Fausset-Brown) with Bible Gateway's multi-translation readability—allowing readers to compare up to 4 translations side-by-side across 35+ languages with zero display ads, zero video popups, and zero subscription paywalls.",
  },
  {
    q: 'Is there a free Bible Hub app for Android, iPhone, and offline download?',
    a: 'Yes. AduBible.org® functions as an instant-install Progressive Web App (PWA) for Android, iOS (iPhone and iPad), Windows, and macOS with a built-in IndexedDB Offline Scripture Vault. Readers can open adubible.org in Chrome or Safari, tap "Add to Home Screen" or "Install App," and read NKJV, KJV, BSB, Asante Twi, Strong\'s Lexicon, and saved study notes 100% offline without heavy APK downloads or data tracking.',
  },
  {
    q: 'How do you pronounce "Psalm" and what does the Book of Psalms mean in the Bible?',
    a: 'The word "Psalm" is pronounced /sɑːm/ ("SAHM", rhyming with calm and balm), where the initial letter "P" is completely silent and the "L" is silent in standard pronunciation. It comes from the Koine Greek word psalmos (ψαλμός, Strong\'s G5568), signifying a sacred song sung to the plucking of a stringed harp, translating the Hebrew word Mizmor (מִזְמוֹר, Strong\'s H4210). The Hebrew title of the Book of Psalms is Tehillim (תְּהִלִּים), meaning "Praises."',
  },
  {
    q: 'What are the most read chapters in the Book of Psalms (Psalm 91, Psalm 23, Psalm 1, Psalm 35, Psalm 34)?',
    a: 'The most searched chapters in the Book of Psalms include: Psalm 1 ("Blessed is the man who walks not in the counsel of the ungodly"), Psalm 23 ("The LORD is my shepherd; I shall not want"), Psalm 34 ("I sought the LORD, and He heard me, and delivered me from all my fears"), Psalm 35 ("Plead my cause, O LORD, with those who strive with me"), and Book of Psalms 91 ("He who dwells in the secret place of the Most High shall abide under the shadow of the Almighty"). All 150 Psalms can be studied in parallel on AduBible.org®.',
  },
  {
    q: 'What are the best Bible verses about strength in hard times?',
    a: 'Key Bible verses about strength in hard times include Isaiah 41:10 ("Fear not, for I am with you; Be not dismayed, for I am your God. I will strengthen you"), Isaiah 40:31 ("Those who wait on the LORD shall renew their strength; they shall mount up with wings like eagles"), Philippians 4:13 ("I can do all things through Christ who strengthens me"), Psalm 46:1 ("God is our refuge and strength, a very present help in trouble"), 2 Corinthians 12:9 ("My grace is sufficient for you, for My strength is made perfect in weakness"), and Joshua 1:9.',
  },
  {
    q: 'What are the top Bible verses on thanksgiving and gratitude?',
    a: 'Foundational Bible verses on thanksgiving include Psalm 100:4 ("Enter into His gates with thanksgiving, and into His courts with praise"), 1 Thessalonians 5:18 ("In everything give thanks; for this is the will of God in Christ Jesus for you"), Psalm 107:1 ("Oh, give thanks to the LORD, for He is good! For His mercy endures forever"), Philippians 4:6–7 ("With thanksgiving, let your requests be made known to God"), and Colossians 3:15–17.',
  },
  {
    q: 'Can I listen to an Audio Bible in English and Twi on AduBible.org®?',
    a: 'Yes. AduBible.org® includes a 24kHz Neural Audio Bible engine that streams crystal-clear spoken Scripture across English (NKJV, KJV, BSB), Asante Twi & Akuapem Twi (Twerɛ Kronkron), French, Spanish, German, and global translations, complete with real-time verse highlighting and auto-scrolling.',
  },
  {
    q: 'Does AduBible have interactive 3D Bible games and a Psalm quiz game?',
    a: 'Yes. AduBible.org® features a built-in 3D WebGL Bible Games Arcade accessible from the top header (🎮) or by pressing G. It includes three interactive 3D games: 3D Scripture Quiz Sanctuary (testing knowledge of the Psalms, Gospels, Genesis, and Epistles), 3D Verse Scramble Temple, and 3D Armor of God Runner.',
  },
];

function buildSanctuaryNavPillsHtml() {
  const pills = [
    { href: '/', label: '🏛️ AduBible Home', gold: true },
    { href: '/nkjv/genesis/1/', label: '📖 Genesis 1 (Creation)' },
    { href: '/nkjv/psalms/91/', label: '🛡️ Book of Psalms 91', gold: true },
    { href: '/nkjv/psalms/23/', label: '🌿 Psalm 23 (Shepherd)', gold: true },
    { href: '/nkjv/psalms/1/', label: '🌳 Psalms Chapter 1 (NKJV)' },
    { href: '/nkjv/psalms/35/', label: '⚔️ Psalm 35 (Defense)' },
    { href: '/nkjv/psalms/34/', label: '🙌 Psalm 34 (Deliverance)' },
    { href: '/nkjv/ephesians/1/', label: '✨ Ephesians 1 NKJV' },
    { href: '/twi/ephesians/1/', label: '🌍 Efesofoɔ 1 Twi' },
    { href: '/kjv/ephesians/1/', label: '👑 Ephesians 1 KJV' },
    { href: '/nkjv/john/1/', label: '🕊️ John 1 (Logos)' },
    { href: '/nkjv/romans/8/', label: '🔥 Romans 8' },
    { href: '/deuterocanon/', label: '📜 16 Deuterocanon Books' },
    { href: '/list-of-sixty/', label: '🏺 List of Sixty & Enoch' },
    { href: '/topics/', label: '🏷️ 10 Topical Scripture Hubs', gold: true },
    { href: '/verse/', label: '✨ Top 30 Bible Verses', gold: true },
    { href: '/lexicon/', label: '📖 Strong’s Lexicon', gold: true },
    { href: '/ask/', label: '<img src="/brand/icon-48.png" alt="" style="width:13px;height:13px;border-radius:2px;vertical-align:-1px;margin-right:5px;display:inline-block;" />Ask AduBible', gold: true },
    { href: '/articles/', label: '📚 15 Pillar Study Guides', gold: true },
    { href: '/donate/', label: '💛 Support Mission (Donate)', gold: true },
  ];
  return pills
    .map((p) =>
      p.gold
        ? `<a href="${p.href}" style="display:inline-block;padding:6px 13px;background:#202d20;border:1px solid rgba(212,167,44,0.55);border-radius:999px;color:#f7d584;font-weight:700;font-size:12.5px;text-decoration:none;">${p.label}</a>`
        : `<a href="${p.href}" style="display:inline-block;padding:6px 13px;background:#162018;border:1px solid #2d3c2e;border-radius:999px;color:#d8e2d5;font-weight:600;font-size:12.5px;text-decoration:none;">${p.label}</a>`
    )
    .join('\n');
}

function buildSanctuaryFooterHtml() {
  return `<footer style="margin-top:3rem;padding-top:2rem;border-top:1px solid #283629;font-size:13px;color:#9ca89a;text-align:center;">
    <div style="margin-bottom:1.25rem;font-style:italic;color:#c2cbbd;max-width:860px;margin-left:auto;margin-right:auto;line-height:1.7;">
      &ldquo;Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ.&rdquo; &mdash; Ephesians 1:3 &bull;
      &ldquo;For the word of God is living and active, sharper than any two-edged sword...&rdquo; &mdash; Hebrews 4:12 &bull;
      &ldquo;All Scripture is breathed out by God and profitable for teaching...&rdquo; &mdash; 2 Timothy 3:16
    </div>
    <nav aria-label="Institutional & Legal Governance" style="margin-bottom:1.25rem;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:8px 10px;max-width:1100px;margin-left:auto;margin-right:auto;">
      <a href="/" style="display:inline-block;padding:5px 12px;background:#162018;border:1px solid #2d3c2e;border-radius:999px;color:#f7d584;font-weight:700;font-size:12px;text-decoration:none;">AduBible Home</a>
      <a href="/topics/" style="display:inline-block;padding:5px 12px;background:#162018;border:1px solid #2d3c2e;border-radius:999px;color:#f7d584;font-weight:600;font-size:12px;text-decoration:none;">🏷️ 10 Topical Hubs</a>
      <a href="/verse/" style="display:inline-block;padding:5px 12px;background:#162018;border:1px solid #2d3c2e;border-radius:999px;color:#f7d584;font-weight:600;font-size:12px;text-decoration:none;">✨ Top 30 Verses</a>
      <a href="/lexicon/" style="display:inline-block;padding:5px 12px;background:#162018;border:1px solid #2d3c2e;border-radius:999px;color:#f7d584;font-weight:600;font-size:12px;text-decoration:none;">📖 Strong’s Lexicon</a>
      <a href="/articles/" style="display:inline-block;padding:5px 12px;background:#162018;border:1px solid #2d3c2e;border-radius:999px;color:#f7d584;font-weight:600;font-size:12px;text-decoration:none;">15 Pillar Guides</a>
      <a href="/about/" style="display:inline-block;padding:5px 12px;background:#162018;border:1px solid #2d3c2e;border-radius:999px;color:#d8e2d5;font-size:12px;text-decoration:none;">About AduBible</a>
      <a href="/how-to-use/" style="display:inline-block;padding:5px 12px;background:#162018;border:1px solid #2d3c2e;border-radius:999px;color:#d8e2d5;font-size:12px;text-decoration:none;">How to Use</a>
      <a href="/editorial-policy/" style="display:inline-block;padding:5px 12px;background:#162018;border:1px solid #2d3c2e;border-radius:999px;color:#d8e2d5;font-size:12px;text-decoration:none;">Editorial Policy</a>
      <a href="/glossary/" style="display:inline-block;padding:5px 12px;background:#162018;border:1px solid #2d3c2e;border-radius:999px;color:#d8e2d5;font-size:12px;text-decoration:none;">Biblical Glossary</a>
      <a href="/sources/" style="display:inline-block;padding:5px 12px;background:#162018;border:1px solid #2d3c2e;border-radius:999px;color:#d8e2d5;font-size:12px;text-decoration:none;">Manuscript Sources</a>
      <a href="/privacy/" style="display:inline-block;padding:5px 12px;background:#162018;border:1px solid #2d3c2e;border-radius:999px;color:#d8e2d5;font-size:12px;text-decoration:none;">Privacy Policy</a>
      <a href="/terms/" style="display:inline-block;padding:5px 12px;background:#162018;border:1px solid #2d3c2e;border-radius:999px;color:#d8e2d5;font-size:12px;text-decoration:none;">Terms of Service</a>
      <a href="/cookie-policy/" style="display:inline-block;padding:5px 12px;background:#162018;border:1px solid #2d3c2e;border-radius:999px;color:#d8e2d5;font-size:12px;text-decoration:none;">Cookie Policy</a>
      <a href="/contact/" style="display:inline-block;padding:5px 12px;background:#162018;border:1px solid #2d3c2e;border-radius:999px;color:#d8e2d5;font-size:12px;text-decoration:none;">Contact Us</a>
      <a href="/donate/" style="display:inline-block;padding:5px 14px;background:rgba(212,167,44,0.14);border:1px solid rgba(212,167,44,0.55);border-radius:999px;color:#f7d584;font-weight:700;font-size:12px;text-decoration:none;">💛 Support Mission</a>
    </nav>
    <p style="margin:0 auto;max-width:860px;line-height:1.7;">&copy; ${CURRENT_YEAR} <a href="https://adubible.org/" style="color:#f7d584;text-decoration:none;font-weight:700;">AduBible.org&reg;</a> &middot; Dedicated to Humanity; A Global Ministry of Apostle Kwame Adu &middot; <a href="https://nsuhia.com/" target="_blank" rel="noopener noreferrer" style="color:#f7d584;text-decoration:none;">Nsuhia, Ghana ↗</a> &middot; <span style="color:#34d399;font-weight:700;">100% Ads-Free Reading Experience</span></p>
  </footer>`;
}


function buildAskAiPrerenderShell(item) {
  const inquiries = [
    { badge: '👑 The Divine Name', title: 'The Sacred Name YHWH (יהוה) & The Tetragrammaton', desc: 'Unpack the covenantal self-existence of "I AM THAT I AM" (Ehyeh Asher Ehyeh) in Exodus 3:14 and how YHWH reveals God\'s unchangeable fidelity.' },
    { badge: '🕊️ Hebrew Exegesis', title: 'The Covenant of Shalom (שָׁלוֹם): Beyond Peace to Total Wholeness', desc: 'Discover the ancient root shalam—completeness, divine restoration, restitution, and holistic reconciliation with God and man.' },
    { badge: '📜 Greek Nuance', title: 'Agape (ἀγάπη) vs. Phileo (φιλέω) in John 21', desc: 'Analyze the profound dialogue on the Sea of Tiberias where sacrificial divine covenant love meets brotherly affection.' },
    { badge: '⚡ Covenant Victory', title: 'Tetelestai (τετέλεσται): "It is Finished" — The Legal Receipt', desc: 'Explore the ancient papyrological receipts stamped "Tetelestai" meaning "Paid in Full," confirming humanity’s sin-debt was forever cleared.' },
    { badge: '🌿 Kingdom Ethics', title: 'The Beatitudes in Matthew 5: The Charter of the Kingdom of Heaven', desc: 'Understand Makarios as divine favor and inner tranquility untethered to external circumstances, ushering in God’s heavenly reign.' },
    { badge: '🇬🇭 African Heritage', title: 'Tweduampɔn Nyame & Adom (Grace) in Asante Twi Heritage', desc: 'Explore the profound Akan theological ontology: Tweduampɔn as the dependable tree of eternity upon which one leans without slipping.' },
    { badge: '🛡️ Ancient Sanctuary', title: 'Psalm 91: The Secret Place of the Most High (Elyon & Shaddai)', desc: 'Journey into the four divine names of God in Psalm 91: Elyon, Shaddai, Yahweh, and Elohim—the fortress of sovereign protection.' },
    { badge: '⚔️ Spiritual Exegesis', title: 'The Full Armor of God in Ephesians 6: Panoplia (πανοπλία)', desc: 'Analyze each piece of armor as God’s own garments from Isaiah 59:17 conferred upon believers in covenant union with Christ.' },
  ];

  const inqCards = inquiries.map((inq) => `
    <div style="background:#141e16;border:1px solid #283629;border-radius:14px;padding:1.25rem 1.35rem;">
      <span style="display:inline-block;padding:3px 9px;border-radius:999px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.35);color:#f59e0b;font-size:11px;font-weight:700;margin-bottom:0.5rem;">${inq.badge}</span>
      <h3 style="font-size:1.1rem;color:#f7d584;margin:0 0 0.5rem 0;font-weight:700;line-height:1.35;">${inq.title}</h3>
      <p style="font-size:0.92rem;color:#c7d6c6;line-height:1.65;margin:0;">${inq.desc}</p>
    </div>
  `).join('\n');

  return `
  <div id="root">
    <main style="max-width:1120px;margin:0 auto;padding:2.5rem 1.25rem;font-family:system-ui,-apple-system,sans-serif;color:#e8ede7;background:#0d140e;line-height:1.7;">
      <header style="text-align:center;margin-bottom:2.5rem;">
        <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.35);color:#f59e0b;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:1rem;">
          <span>✦ Trained Exegetical AI &middot; Ancient Wisdom</span>
        </div>
        <h1 style="font-family:Georgia,serif;font-size:2.65rem;color:#fafaf9;margin:0 0 1rem 0;line-height:1.2;font-weight:800;">
          Ask <span style="color:#f59e0b;">AduBible</span> for Ancient Biblical Wisdom &amp; Exegesis
        </h1>
        <p style="font-size:1.15rem;color:#a8b6a7;max-width:820px;margin:0 auto 1.5rem auto;line-height:1.75;font-weight:300;">
          Trained on the 66 canonical books of the Holy Bible, the ancient Hebrew Westminster Leningrad Codex (WLC), Greek Textus Receptus, Strong's Concordance, and the gospel ministry of <strong style="color:#34d399;">Apostle Kwame Adu of Nsuhia, Ghana</strong>. 100% free, unmonetized, and ads-free.
        </p>
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:1.5rem;">
          ${buildSanctuaryNavPillsHtml()}
        </div>
      </header>

      <section style="background:#131c14;border:1px solid #253326;border-radius:18px;padding:1.75rem;margin-bottom:2.5rem;box-shadow:0 12px 36px rgba(0,0,0,0.45);">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1px solid #233024;">
          <div style="width:10px;height:10px;border-radius:50%;background:#34d399;box-shadow:0 0 12px #34d399;"></div>
          <span style="font-size:0.85rem;font-weight:700;font-family:monospace;color:#f7d584;letter-spacing:0.03em;">Ask AduBible Interactive Wisdom Terminal &middot; Armed with Sacred Texts</span>
        </div>
        <p style="font-size:1.02rem;color:#d8e2d5;line-height:1.75;margin-bottom:1.5rem;">
          Explore deep theological exegesis, root Hebrew and Greek meanings, covenant hermeneutics, and Asante Twi translation heritage. Tap any inquiry below to launch the live interactive terminal:
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:1rem;">
          ${inqCards}
        </div>
        <div style="text-align:center;margin-top:2rem;">
          <a href="/ask/" style="display:inline-block;padding:14px 28px;background:#f59e0b;color:#0c0a09;font-weight:800;font-size:15px;text-decoration:none;border-radius:12px;box-shadow:0 6px 20px rgba(245,158,11,0.35);">
            Launch Interactive Ask AduBible Terminal &rarr;
          </a>
        </div>
      </section>

      <section style="margin-bottom:2.5rem;">
        <h2 style="font-family:Georgia,serif;font-size:1.85rem;color:#f7d584;margin-bottom:1.25rem;text-align:center;">
          The 4 Pillars of Ask AduBible Training
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:1.25rem;">
          <div style="background:#131c14;border:1px solid #253326;border-radius:14px;padding:1.35rem;">
            <h3 style="font-size:1.15rem;color:#34d399;margin:0 0 0.5rem 0;">1. Original Language Primacy</h3>
            <p style="font-size:0.92rem;color:#c7d6c6;line-height:1.65;margin:0;">Every inquiry cross-references original Hebrew Masoretic and Greek Textus Receptus scripts with Strong's Concordance numbering (H1-H8674, G1-G5624) and Brown-Driver-Briggs definitions.</p>
          </div>
          <div style="background:#131c14;border:1px solid #253326;border-radius:14px;padding:1.35rem;">
            <h3 style="font-size:1.15rem;color:#34d399;margin:0 0 0.5rem 0;">2. Whole-Counsel Hermeneutics</h3>
            <p style="font-size:0.92rem;color:#c7d6c6;line-height:1.65;margin:0;">Scripture interprets scripture. No isolated proof-texting; seamlessly uniting Old and New Testament covenant typology, Messianic prophecies, and apostolic doctrine.</p>
          </div>
          <div style="background:#131c14;border:1px solid #253326;border-radius:14px;padding:1.35rem;">
            <h3 style="font-size:1.15rem;color:#34d399;margin:0 0 0.5rem 0;">3. Classical Commentary Synthesis</h3>
            <p style="font-size:0.92rem;color:#c7d6c6;line-height:1.65;margin:0;">Synthesizes Matthew Henry's Complete Commentary, Charles Ellicott, Jamieson-Fausset-Brown, and ancient patristic texts alongside parallel world translations.</p>
          </div>
          <div style="background:#131c14;border:1px solid #253326;border-radius:14px;padding:1.35rem;">
            <h3 style="font-size:1.15rem;color:#34d399;margin:0 0 0.5rem 0;">4. Sovereign Sanctuary Privacy</h3>
            <p style="font-size:0.92rem;color:#c7d6c6;line-height:1.65;margin:0;">100% free, zero ads, zero data selling. Created in honor of Apostle Kwame Adu, your spiritual questions remain private between you and God.</p>
          </div>
        </div>
      </section>

      ${buildSanctuaryFooterHtml()}
    </main>
  </div>`;
}

function buildHomeAuthorityPrerenderShell() {
  const faqHtml = HOME_FAQ_ITEMS.map(
    (item) => `
      <div style="background:#141e16;border:1px solid #283629;border-radius:12px;padding:1.15rem 1.35rem;margin-bottom:0.85rem;">
        <h3 style="font-size:1.05rem;color:#f7d584;margin:0 0 0.45rem 0;font-weight:700;">${item.q}</h3>
        <p style="margin:0;color:#d8e2d5;font-size:0.95rem;line-height:1.7;">${item.a}</p>
      </div>`
  ).join('\n');

  return `<div id="root"><main id="seo-prerender" style="min-height:100vh;background-color:#0f1712;color:#e3e6d8;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Georgia,serif;line-height:1.7;padding:2rem 1.25rem;">
    <div style="max-width:1080px;margin:0 auto;">

      <!-- LUXURY SANCTUARY PRE-HYDRATION HEADER & LIVE LOADER -->
      <header style="text-align:center;background:linear-gradient(180deg,#172319 0%,#121b14 100%);border:1px solid rgba(212,167,44,0.38);border-radius:18px;padding:2rem 1.5rem;margin-bottom:2rem;box-shadow:0 12px 36px rgba(0,0,0,0.45);">
        <div style="display:inline-flex;align-items:center;gap:10px;padding:6px 16px;background:rgba(212,167,44,0.14);border:1px solid rgba(212,167,44,0.48);border-radius:999px;color:#f7d584;font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:1rem;">
          <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#34d399;box-shadow:0 0 10px #34d399;"></span>
          Initializing AduBible.org&reg; Parallel Scripture Sanctuary &bull; 100% Ads-Free Forever
        </div>
        <h1 style="font-family:Georgia,'Playfair Display',serif;font-size:clamp(1.75rem,3.6vw,2.65rem);line-height:1.2;color:#fafaf5;margin:0 0 0.85rem 0;font-weight:800;">
          AduBible.org&reg; &mdash; Free Online Bible, Parallel Bible Hub, Strong&rsquo;s Concordance, Audio Bible &amp; Commentary
        </h1>
        <p style="font-size:1.05rem;color:#c8d4c5;max-width:880px;margin:0 auto 1.25rem auto;line-height:1.75;">
          <strong>Quick Summary:</strong> Read and study the Holy Bible online free in up to <strong>4 synchronized parallel columns</strong> across <strong>NKJV, KJV, BSB, Original Hebrew (WLC), Koine Greek (Textus Receptus), French, Spanish, German, and Asante Twi (35+ global languages)</strong>. Engineered as a 100% ad-free sanctuary combining <strong>Bible Hub&rsquo;s</strong> exhaustive Strong&rsquo;s Concordance &amp; verse-by-verse commentaries with <strong>Bible Gateway&rsquo;s</strong> clean multi-version passage lookup, plus a <strong>24kHz Neural Audio Bible</strong>, <strong>Offline Bible App (Android, iOS &amp; PC PWA)</strong>, and <strong>Interactive 3D Bible &amp; Psalm Games</strong>.
        </p>
        <nav aria-label="Quick Passage & Sanctuary Directory" style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:1rem;">
          ${buildSanctuaryNavPillsHtml()}
        </nav>
      </header>

      <!-- SECTION 1: GENESIS CHAPTER 1 (DEFAULT READER PASSAGE PARITY) -->
      <section style="background:#141e16;border:1px solid #283629;border-radius:16px;padding:1.5rem;margin-bottom:2rem;">
        <div style="font-size:11.5px;font-weight:800;color:#f7d584;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.4rem;">
          Active Sanctuary Reader Passage &bull; Parallel NKJV, KJV, Hebrew &amp; Asante Twi
        </div>
        <h2 style="font-family:Georgia,serif;font-size:1.5rem;color:#fafaf5;margin:0 0 0.75rem 0;">
          Genesis Chapter 1 (Genesis 1) &mdash; In the Beginning God Created the Heavens and the Earth
        </h2>
        <p style="margin:0 0 0.85rem 0;color:#dce5d8;font-size:1rem;">
          <strong>Genesis 1:1&ndash;5 (NKJV / KJV):</strong> &ldquo;[1] In the beginning God (<em>Elohim</em> H430) created (<em>bara</em> H1254) the heavens and the earth. [2] The earth was without form, and void; and darkness was on the face of the deep. And the Spirit of God (<em>Ruach Elohim</em> H7307) was hovering over the face of the waters. [3] Then God said, &lsquo;Let there be light&rsquo; (<em>Or</em> H216); and there was light. [4] And God saw the light, that it was good; and God divided the light from the darkness. [5] God called the light Day, and the darkness He called Night. So the evening and the morning were the first day.&rdquo;
        </p>
        <p style="margin:0;color:#b7c99f;font-size:0.92rem;">
          <strong>Original Hebrew (Westminster Leningrad Codex):</strong> בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ׃ &bull;
          <strong>Asante Twi (Twerɛ Kronkron):</strong> &ldquo;Mfitiaseɛ no Onyankopɔn bɔɔ ɔsoro ne asase.&rdquo; &mdash;
          <a href="/nkjv/genesis/1/" style="color:#f7d584;font-weight:700;text-decoration:underline;">Open Full Genesis 1 Parallel Study &rarr;</a>
        </p>
      </section>

      <!-- SECTION 2: ONLINE BIBLE HUB & BIBLE GATEWAY COMPARISON MATRIX -->
      <section style="background:#141e16;border:1px solid #283629;border-radius:16px;padding:1.5rem;margin-bottom:2rem;">
        <h2 style="font-family:Georgia,serif;font-size:1.5rem;color:#f7d584;margin:0 0 0.65rem 0;">
          Online Bible Sanctuary Comparison: AduBible.org&reg; vs. Bible Hub &amp; Bible Gateway (2026)
        </h2>
        <p style="margin:0 0 1rem 0;color:#d0dbd0;font-size:0.96rem;">
          Millions of believers search daily for an <strong>online Bible</strong>, <strong>Bible Hub commentary</strong>, <strong>Bible Gateway parallel translations</strong>, and a <strong>free offline Bible app</strong> without intrusive commercial advertisements or subscription paywalls:
        </p>
        <div style="overflow-x:auto;border:1px solid #2d3c2e;border-radius:12px;">
          <table style="width:100%;border-collapse:collapse;text-align:left;font-size:13.5px;">
            <thead>
              <tr style="background:#1a271c;color:#f7d584;border-bottom:1px solid #2d3c2e;">
                <th style="padding:10px 12px;">Bible Study Feature</th>
                <th style="padding:10px 12px;">AduBible.org&reg; Sanctuary</th>
                <th style="padding:10px 12px;">Bible Hub</th>
                <th style="padding:10px 12px;">Bible Gateway</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid #233025;">
                <td style="padding:10px 12px;font-weight:700;color:#fafaf5;">Parallel Bible Reading</td>
                <td style="padding:10px 12px;color:#34d399;font-weight:700;">Up to 4 Synchronized Columns (35+ Languages)</td>
                <td style="padding:10px 12px;color:#c8d4c5;">Single-verse stacked list view</td>
                <td style="padding:10px 12px;color:#c8d4c5;">2-column desktop view</td>
              </tr>
              <tr style="border-bottom:1px solid #233025;">
                <td style="padding:10px 12px;font-weight:700;color:#fafaf5;">Strong&rsquo;s Concordance &amp; Commentary</td>
                <td style="padding:10px 12px;color:#34d399;font-weight:700;">1-Tap Hebrew/Greek Lexicon + Matthew Henry &amp; Gill</td>
                <td style="padding:10px 12px;color:#c8d4c5;">Full Interlinear &amp; Commentaries (Desktop UI)</td>
                <td style="padding:10px 12px;color:#c8d4c5;">Many study notes locked behind Plus paywall</td>
              </tr>
              <tr style="border-bottom:1px solid #233025;">
                <td style="padding:10px 12px;font-weight:700;color:#fafaf5;">Offline Bible App (Android, iOS &amp; PC)</td>
                <td style="padding:10px 12px;color:#34d399;font-weight:700;">100% Free Offline PWA Vault (Zero APK Bloat)</td>
                <td style="padding:10px 12px;color:#c8d4c5;">Separate mobile app downloads</td>
                <td style="padding:10px 12px;color:#c8d4c5;">Ad-supported mobile app</td>
              </tr>
              <tr style="border-bottom:1px solid #233025;">
                <td style="padding:10px 12px;font-weight:700;color:#fafaf5;">Audio Bible &amp; 3D Bible Games</td>
                <td style="padding:10px 12px;color:#34d399;font-weight:700;">24kHz Neural Audio (English &amp; Twi) + 3D Bible Games</td>
                <td style="padding:10px 12px;color:#c8d4c5;">Basic chapter audio links; no 3D games</td>
                <td style="padding:10px 12px;color:#c8d4c5;">English audio streams; no 3D games</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;font-weight:700;color:#fafaf5;">Commercial Ads &amp; Tracking</td>
                <td style="padding:10px 12px;color:#34d399;font-weight:700;">100% Ads-Free Forever &bull; Zero Tracking</td>
                <td style="padding:10px 12px;color:#c8d4c5;">Display ad banners</td>
                <td style="padding:10px 12px;color:#c8d4c5;">Display &amp; video advertisements</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- SECTION 3: BOOK OF PSALMS AUTHORITY HUB (PSALM 91, PSALM 23, PSALM 1, PSALM 35, PSALM 34, PRONUNCIATION, LIST & 3D PSALM GAME) -->
      <section style="background:#141e16;border:1px solid #283629;border-radius:16px;padding:1.5rem;margin-bottom:2rem;">
        <div style="font-size:11.5px;font-weight:800;color:#f7d584;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.4rem;">
          The Book of Psalms (Sefer Tehillim) &bull; Complete 150 Psalms Study Hub
        </div>
        <h2 style="font-family:Georgia,serif;font-size:1.5rem;color:#fafaf5;margin:0 0 0.75rem 0;">
          Psalm Bible Hub: Book of Psalms 91, Psalm 23, Psalms Chapter 1, Psalm 35, Psalm 34, Pronunciation &amp; List
        </h2>
        <p style="margin:0 0 1.15rem 0;color:#d0dbd0;font-size:0.96rem;">
          Explore the most searched chapters in the <strong>Book of Psalms</strong> in parallel across <strong>NKJV, KJV, BSB, Original Hebrew, and Asante Twi</strong>, complete with <strong>Strong&rsquo;s Concordance</strong>, <strong>Matthew Henry &amp; Spurgeon commentaries</strong>, and <strong>24kHz Audio Bible</strong> playback:
        </p>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:14px;margin-bottom:1.25rem;">
          <article style="background:#19251b;border:1px solid rgba(212,167,44,0.35);border-radius:12px;padding:1.15rem;">
            <h3 style="font-size:1.08rem;color:#f7d584;margin:0 0 0.4rem 0;">
              <a href="/nkjv/psalms/91/" style="color:#f7d584;text-decoration:none;">🛡️ Book of Psalms 91 (Psalm 91 NKJV &amp; KJV)</a>
            </h3>
            <p style="font-size:0.9rem;color:#dce5d8;margin:0 0 0.5rem 0;">
              &ldquo;He who dwells in the secret place of the Most High (<em>Elyon</em> H5945) shall abide under the shadow of the Almighty (<em>Shaddai</em> H7706). I will say of the LORD, &lsquo;He is my refuge and my fortress; My God, in Him I will trust.&rsquo;&rdquo; (Psalm 91:1&ndash;2)
            </p>
            <a href="/nkjv/psalms/91/" style="font-size:12.5px;color:#34d399;font-weight:700;text-decoration:underline;">Read All 16 Verses of Psalm 91 in Parallel &rarr;</a>
          </article>

          <article style="background:#19251b;border:1px solid rgba(212,167,44,0.35);border-radius:12px;padding:1.15rem;">
            <h3 style="font-size:1.08rem;color:#f7d584;margin:0 0 0.4rem 0;">
              <a href="/nkjv/psalms/23/" style="color:#f7d584;text-decoration:none;">🌿 Psalm 23 (NKJV, KJV &amp; Hebrew Yahweh Roi)</a>
            </h3>
            <p style="font-size:0.9rem;color:#dce5d8;margin:0 0 0.5rem 0;">
              &ldquo;The LORD is my shepherd; I shall not want. He makes me to lie down in green pastures; He leads me beside the still waters. He restores my soul; He leads me in the paths of righteousness For His name&rsquo;s sake.&rdquo; (Psalm 23:1&ndash;3)
            </p>
            <a href="/nkjv/psalms/23/" style="font-size:12.5px;color:#34d399;font-weight:700;text-decoration:underline;">Read Psalm 23 in Parallel &amp; Audio &rarr;</a>
          </article>

          <article style="background:#19251b;border:1px solid #2d3c2e;border-radius:12px;padding:1.15rem;">
            <h3 style="font-size:1.08rem;color:#f7d584;margin:0 0 0.4rem 0;">
              <a href="/nkjv/psalms/1/" style="color:#f7d584;text-decoration:none;">🌳 Psalms Chapter 1 (Psalm 1 NKJV &amp; KJV)</a>
            </h3>
            <p style="font-size:0.9rem;color:#dce5d8;margin:0 0 0.5rem 0;">
              &ldquo;Blessed is the man who walks not in the counsel of the ungodly, nor stands in the path of sinners, nor sits in the seat of the scornful; But his delight is in the law of the LORD, and in His law he meditates day and night.&rdquo; (Psalm 1:1&ndash;2)
            </p>
            <a href="/nkjv/psalms/1/" style="font-size:12.5px;color:#34d399;font-weight:700;text-decoration:underline;">Read Psalms Chapter 1 (Psalm 1 NKJV) &rarr;</a>
          </article>

          <article style="background:#19251b;border:1px solid #2d3c2e;border-radius:12px;padding:1.15rem;">
            <h3 style="font-size:1.08rem;color:#f7d584;margin:0 0 0.4rem 0;">
              <a href="/nkjv/psalms/35/" style="color:#f7d584;text-decoration:none;">⚔️ Psalm 35 (NKJV &amp; KJV Prayer for Vindication)</a>
            </h3>
            <p style="font-size:0.9rem;color:#dce5d8;margin:0 0 0.5rem 0;">
              &ldquo;Plead my cause, O LORD, with those who strive with me; fight against those who fight against me. Take hold of shield and buckler, and stand up for my help... Say to my soul, &lsquo;I am your salvation.&rsquo;&rdquo; (Psalm 35:1&ndash;3)
            </p>
            <a href="/nkjv/psalms/35/" style="font-size:12.5px;color:#34d399;font-weight:700;text-decoration:underline;">Read All 28 Verses of Psalm 35 &rarr;</a>
          </article>

          <article style="background:#19251b;border:1px solid #2d3c2e;border-radius:12px;padding:1.15rem;">
            <h3 style="font-size:1.08rem;color:#f7d584;margin:0 0 0.4rem 0;">
              <a href="/nkjv/psalms/34/" style="color:#f7d584;text-decoration:none;">🙌 Psalm 34 (NKJV &amp; KJV Deliverance from Fear)</a>
            </h3>
            <p style="font-size:0.9rem;color:#dce5d8;margin:0 0 0.5rem 0;">
              &ldquo;I will bless the LORD at all times; His praise shall continually be in my mouth... I sought the LORD, and He heard me, and delivered me from all my fears. Oh, taste and see that the LORD is good!&rdquo; (Psalm 34:1, 4, 8)
            </p>
            <a href="/nkjv/psalms/34/" style="font-size:12.5px;color:#34d399;font-weight:700;text-decoration:underline;">Read All 22 Verses of Psalm 34 &rarr;</a>
          </article>

          <article style="background:#19251b;border:1px solid #2d3c2e;border-radius:12px;padding:1.15rem;">
            <h3 style="font-size:1.08rem;color:#f7d584;margin:0 0 0.4rem 0;">
              🎮 Interactive 3D Psalm Game &amp; Bible Quiz Arcade
            </h3>
            <p style="font-size:0.9rem;color:#dce5d8;margin:0 0 0.5rem 0;">
              Play our free browser-based <strong>3D Psalm Game &amp; Bible Quiz Sanctuary</strong>! Test your mastery of Psalm 23, Psalm 91, Psalm 1, and all 66 books in the <strong>3D Scripture Quiz</strong>, <strong>3D Verse Scramble Temple</strong>, and <strong>3D Armor of God Runner</strong>.
            </p>
            <span style="font-size:12.5px;color:#f7d584;font-weight:700;">Tap 🎮 in the Top Header or Press &lsquo;G&rsquo; to Play Instant 3D Games</span>
          </article>
        </div>

        <!-- PSALM PRONUNCIATION & LIST OF 150 PSALMS -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;">
          <div style="background:#101812;border:1px solid #283629;border-radius:12px;padding:1.15rem;">
            <h3 style="font-size:1.02rem;color:#f7d584;margin:0 0 0.45rem 0;">🔊 Psalm Pronunciation &amp; Hebrew/Greek Etymology</h3>
            <p style="margin:0;font-size:0.9rem;color:#d0dbd0;line-height:1.65;">
              <strong>How to Pronounce &ldquo;Psalm&rdquo;:</strong> Pronounced <strong>/sɑːm/ (&ldquo;SAHM&rdquo;</strong>, rhyming with <em>calm</em> and <em>balm</em>; the initial <strong>P</strong> is completely silent). Plural: <strong>Psalms (/sɑːmz/ &ldquo;SAHMZ&rdquo;)</strong>. Derived from Koine Greek <em>psalmos</em> (<strong>ψαλμός</strong>, Strong&rsquo;s G5568 &mdash; a sacred song sung to the plucking of stringed instruments), translating Biblical Hebrew <em>Mizmor</em> (<strong>מִזְמוֹר</strong>, Strong&rsquo;s H4210). The Hebrew title of the entire Psalter is <em>Sefer Tehillim</em> (<strong>תְּהִלִּים</strong>, &ldquo;Book of Praises&rdquo;), and in Asante Twi it is <strong>Nnwom</strong>.
            </p>
          </div>
          <div style="background:#101812;border:1px solid #283629;border-radius:12px;padding:1.15rem;">
            <h3 style="font-size:1.02rem;color:#f7d584;margin:0 0 0.45rem 0;">📋 Psalms in the Bible List (All 5 Books of the 150 Psalms)</h3>
            <ul style="margin:0;padding-left:1.1rem;font-size:0.88rem;color:#d0dbd0;line-height:1.6;">
              <li><strong>Book I (Psalms 1&ndash;41):</strong> Davidic Psalms of Torah Wisdom, Shepherd Trust &amp; Deliverance (Psalm 1, 8, 19, 22, 23, 24, 27, 34, 35, 37, 40).</li>
              <li><strong>Book II (Psalms 42&ndash;72):</strong> Korah, Asaph &amp; David &mdash; Refuge, Repentance &amp; Royal Intercession (Psalm 42, 46, 51, 61, 63, 72).</li>
              <li><strong>Book III (Psalms 73&ndash;89):</strong> Asaph &amp; Korah Sanctuary Laments &amp; Covenant Faithfulness (Psalm 73, 84, 86, 89).</li>
              <li><strong>Book IV (Psalms 90&ndash;106):</strong> Prayer of Moses, Shadow of the Almighty &amp; Thanksgiving (Psalm 90, 91, 95, 100, 103).</li>
              <li><strong>Book V (Psalms 107&ndash;150):</strong> Word of God, Songs of Ascents &amp; Hallelujah Doxology (Psalm 107, 119, 121, 136, 139, 150).</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- SECTION 4: MOST SEARCHED TOPICAL BIBLE VERSES (STRENGTH IN HARD TIMES & THANKSGIVING) -->
      <section style="background:#141e16;border:1px solid #283629;border-radius:16px;padding:1.5rem;margin-bottom:2rem;">
        <h2 style="font-family:Georgia,serif;font-size:1.5rem;color:#f7d584;margin:0 0 0.85rem 0;">
          Essential Bible Verses: Strength in Hard Times &amp; Bible Verses on Thanksgiving
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;">
          <div style="background:#19251b;border:1px solid #2d3c2e;border-radius:12px;padding:1.25rem;">
            <h3 style="font-size:1.1rem;color:#f7d584;margin:0 0 0.65rem 0;">💪 Bible Verses About Strength in Hard Times</h3>
            <ul style="margin:0;padding-left:1.1rem;font-size:0.9rem;color:#dce5d8;line-height:1.68;">
              <li style="margin-bottom:0.45rem;"><strong>Isaiah 41:10 (NKJV):</strong> &ldquo;Fear not, for I am with you; Be not dismayed, for I am your God. I will strengthen you, Yes, I will help you, I will uphold you with My righteous right hand.&rdquo;</li>
              <li style="margin-bottom:0.45rem;"><strong>Isaiah 40:31 (NKJV):</strong> &ldquo;But those who wait on the LORD shall renew their strength; They shall mount up with wings like eagles, They shall run and not be weary, They shall walk and not faint.&rdquo;</li>
              <li style="margin-bottom:0.45rem;"><strong>Philippians 4:13 (NKJV):</strong> &ldquo;I can do all things through Christ who strengthens me.&rdquo;</li>
              <li style="margin-bottom:0.45rem;"><strong>Psalm 46:1&ndash;2 (NKJV):</strong> &ldquo;God is our refuge and strength, a very present help in trouble. Therefore we will not fear...&rdquo;</li>
              <li style="margin-bottom:0.45rem;"><strong>2 Corinthians 12:9 (NKJV):</strong> &ldquo;My grace is sufficient for you, for My strength is made perfect in weakness.&rdquo;</li>
              <li><strong>Joshua 1:9 &amp; <a href="/nkjv/romans/8/" style="color:#34d399;">Romans 8:31&ndash;39</a>:</strong> &ldquo;Be strong and of good courage; do not be afraid, nor be dismayed, for the LORD your God is with you wherever you go.&rdquo;</li>
            </ul>
          </div>

          <div style="background:#19251b;border:1px solid #2d3c2e;border-radius:12px;padding:1.25rem;">
            <h3 style="font-size:1.1rem;color:#f7d584;margin:0 0 0.65rem 0;">🙏 Bible Verses on Thanksgiving &amp; Gratitude</h3>
            <ul style="margin:0;padding-left:1.1rem;font-size:0.9rem;color:#dce5d8;line-height:1.68;">
              <li style="margin-bottom:0.45rem;"><strong>Psalm 100:4 (NKJV):</strong> &ldquo;Enter into His gates with thanksgiving, And into His courts with praise. Be thankful to Him, and bless His name.&rdquo;</li>
              <li style="margin-bottom:0.45rem;"><strong>1 Thessalonians 5:16&ndash;18 (NKJV):</strong> &ldquo;Rejoice always, pray without ceasing, in everything give thanks; for this is the will of God in Christ Jesus for you.&rdquo;</li>
              <li style="margin-bottom:0.45rem;"><strong>Psalm 107:1 (NKJV):</strong> &ldquo;Oh, give thanks to the LORD, for He is good! For His mercy endures forever.&rdquo;</li>
              <li style="margin-bottom:0.45rem;"><strong>Philippians 4:6&ndash;7 (NKJV):</strong> &ldquo;Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God...&rdquo;</li>
              <li style="margin-bottom:0.45rem;"><strong>Colossians 3:15&ndash;17 (NKJV):</strong> &ldquo;And let the peace of God rule in your hearts, to which also you were called in one body; and be thankful.&rdquo;</li>
              <li><strong>Psalm 95:2 &amp; Psalm 136:1 (NKJV):</strong> &ldquo;Let us come before His presence with thanksgiving; Let us shout joyfully to Him with psalms.&rdquo;</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- SECTION 5: OFFLINE BIBLE APP (ANDROID/IOS), AUDIO BIBLE & COMMENTARIES -->
      <section style="background:#141e16;border:1px solid #283629;border-radius:16px;padding:1.5rem;margin-bottom:2rem;">
        <h2 style="font-family:Georgia,serif;font-size:1.5rem;color:#f7d584;margin:0 0 0.75rem 0;">
          Free Offline Bible App (Android &amp; iOS), 24kHz Audio Bible &amp; Bible Hub Commentary Suite
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;">
          <div style="background:#19251b;border:1px solid #2d3c2e;border-radius:12px;padding:1.1rem;">
            <h3 style="font-size:1rem;color:#f7d584;margin:0 0 0.4rem 0;">📲 Offline Bible App for Android, iOS &amp; PC</h3>
            <p style="margin:0;font-size:0.89rem;color:#d0dbd0;line-height:1.65;">
              Searching for a <strong>Bible Hub app for Android</strong> or <strong>free offline Bible download</strong>? AduBible.org&reg; installs directly to your phone or desktop as a lightweight Progressive Web App (PWA) with automatic IndexedDB offline chapter caching &mdash; read Scripture anywhere with zero internet connection and zero ads.
            </p>
          </div>
          <div style="background:#19251b;border:1px solid #2d3c2e;border-radius:12px;padding:1.1rem;">
            <h3 style="font-size:1rem;color:#f7d584;margin:0 0 0.4rem 0;">🎧 24kHz Neural Audio Bible Streaming</h3>
            <p style="margin:0;font-size:0.89rem;color:#d0dbd0;line-height:1.65;">
              Listen to any chapter in crystal-clear <strong>24kHz Neural Audio</strong> across English (NKJV, KJV, BSB), Asante Twi (Twerɛ Kronkron), French, Spanish, and German. Includes verse-by-verse auto-scroll synchronization, adjustable playback speeds, and hands-free chapter progression.
            </p>
          </div>
          <div style="background:#19251b;border:1px solid #2d3c2e;border-radius:12px;padding:1.1rem;">
            <h3 style="font-size:1rem;color:#f7d584;margin:0 0 0.4rem 0;">📚 Exhaustive Commentaries &amp; Strong&rsquo;s Lexicon</h3>
            <p style="margin:0;font-size:0.89rem;color:#d0dbd0;line-height:1.65;">
              Access complete verse-by-verse expositions from <strong>Matthew Henry&rsquo;s Complete Commentary</strong>, <strong>John Gill&rsquo;s Exposition of the Entire Bible</strong>, and <strong>Jamieson-Fausset-Brown</strong> alongside 1-tap Strong&rsquo;s Hebrew (H1&ndash;H8674) and Greek (G1&ndash;G5624) lexical definitions.
            </p>
          </div>
        </div>
      </section>

      <!-- SECTION 6: PEOPLE ALSO ASK (PAA) FREQUENTLY ASKED QUESTIONS -->
      <section style="margin-bottom:2rem;">
        <h2 style="font-family:Georgia,serif;font-size:1.5rem;color:#f7d584;margin:0 0 0.85rem 0;">
          Frequently Asked Questions About Online Bible Study, Psalms &amp; AduBible.org&reg;
        </h2>
        ${faqHtml}
      </section>

      ${buildSanctuaryFooterHtml()}
    </div>
  </main></div>`;
}

function buildTopVersePrerenderShell(v) {
  const strongsPills = (v.strongsCodes || []).map((code) => {
    const entry = strongsEntries[code];
    const gloss = entry ? ` (${entry.transliteration} — ${entry.shortDefinition})` : '';
    return `<a href="/lexicon/${code.toLowerCase()}/" style="display:inline-block;padding:4px 10px;background:#19251b;border:1px solid #2d3c2e;border-radius:6px;color:#f7d584;font-size:12px;text-decoration:none;font-family:monospace;margin:3px;">${code}${gloss}</a>`;
  }).join(' ');

  const crossRefLinks = (v.crossReferences || []).map((ref) => {
    return `<span style="display:inline-block;padding:4px 10px;background:#141e16;border:1px solid #283629;border-radius:6px;color:#c8d4c5;font-size:12px;margin:3px;">${ref}</span>`;
  }).join(' ');

  return `<div id="root"><main id="seo-prerender" style="min-height:100vh;background-color:#0f1712;color:#e3e6d8;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Georgia,serif;line-height:1.7;padding:2rem 1.25rem;">
    <div style="max-width:1020px;margin:0 auto;">
      <header style="background:linear-gradient(180deg,#172319 0%,#121b14 100%);border:1px solid rgba(212,167,44,0.38);border-radius:16px;padding:2rem 1.5rem;margin-bottom:1.75rem;">
        <nav aria-label="Breadcrumb" style="font-size:13px;color:#9ca89a;margin-bottom:0.85rem;">
          <a href="/" style="color:#f7d584;text-decoration:none;">AduBible</a> &rsaquo;
          <a href="/verse/" style="color:#f7d584;text-decoration:none;">Top Verses</a> &rsaquo;
          <a href="/nkjv/${v.bookSlug}/${v.chapter}/" style="color:#f7d584;text-decoration:none;">${v.bookName} ${v.chapter}</a> &rsaquo;
          <span style="color:#e3e6d8;">Verse ${v.verse}</span>
        </nav>
        <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 12px;background:rgba(212,167,44,0.14);border:1px solid rgba(212,167,44,0.45);border-radius:999px;color:#f7d584;font-size:11.5px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.75rem;">
          ${v.theme} &bull; Parallel Scripture Study
        </div>
        <h1 style="font-family:Georgia,serif;font-size:clamp(1.75rem,3.2vw,2.4rem);line-height:1.25;color:#fafaf5;margin:0 0 1rem 0;">
          ${v.reference} — Parallel Bible Study &amp; Exegesis
        </h1>
        
        <!-- POSITION #0 SUMMARY BOX -->
        <div style="background:#19251b;border-left:4px solid #d4a72c;border-radius:8px;padding:1.15rem 1.35rem;margin-bottom:1.25rem;">
          <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#f7d584;margin-bottom:0.35rem;">
            📌 Quick Summary &amp; Biblical Meaning
          </div>
          <p style="margin:0;font-size:1.02rem;color:#e3e6d8;line-height:1.7;">
            ${v.positionZeroSummary}
          </p>
        </div>

        <nav aria-label="Sanctuary Quick Navigation" style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">
          ${buildSanctuaryNavPillsHtml()}
        </nav>
      </header>

      <!-- 4-COLUMN PARALLEL SCRIPTURE CARDS -->
      <section style="background:#141e16;border:1px solid #283629;border-radius:16px;padding:1.75rem;margin-bottom:1.75rem;">
        <h2 style="font-family:Georgia,serif;font-size:1.35rem;color:#f7d584;margin:0 0 1.25rem 0;">
          ${v.reference} Side-by-Side Parallel Translations
        </h2>
        
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin-bottom:1.5rem;">
          <!-- NKJV Card -->
          <div style="background:#19251b;border:1px solid #2d3c2e;border-radius:12px;padding:1.25rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem;">
              <span style="font-weight:700;color:#f7d584;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;">New King James Version (NKJV)</span>
            </div>
            <p style="font-family:Georgia,serif;font-size:1.08rem;line-height:1.75;color:#fafaf5;margin:0;">
              &ldquo;${v.nkjv}&rdquo;
            </p>
          </div>

          <!-- KJV Card -->
          <div style="background:#19251b;border:1px solid #2d3c2e;border-radius:12px;padding:1.25rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem;">
              <span style="font-weight:700;color:#9ca89a;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;">King James Version (KJV 1769)</span>
            </div>
            <p style="font-family:Georgia,serif;font-size:1.05rem;line-height:1.75;color:#d8e2d5;margin:0;">
              &ldquo;${v.kjv}&rdquo;
            </p>
          </div>

          <!-- BSB Card -->
          <div style="background:#19251b;border:1px solid #2d3c2e;border-radius:12px;padding:1.25rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem;">
              <span style="font-weight:700;color:#9ca89a;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;">Berean Standard Bible (BSB)</span>
            </div>
            <p style="font-family:Georgia,serif;font-size:1.05rem;line-height:1.75;color:#d8e2d5;margin:0;">
              &ldquo;${v.bsb}&rdquo;
            </p>
          </div>

          <!-- Original Language Card -->
          <div style="background:#19251b;border:1px solid #2d3c2e;border-radius:12px;padding:1.25rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem;">
              <span style="font-weight:700;color:#f7d584;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;">${v.originalLanguageLabel} Interlinear</span>
            </div>
            <p style="font-family:Georgia,serif;font-size:1.15rem;line-height:1.8;color:#f7d584;margin:0;direction:${v.originalLanguageLabel === 'Hebrew WLC' ? 'rtl' : 'ltr'};">
              ${v.originalLanguageText}
            </p>
          </div>

          <!-- Asante Twi Card -->
          <div style="background:#19251b;border:1px solid rgba(52,211,153,0.3);border-radius:12px;padding:1.25rem;grid-column:1 / -1;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem;">
              <span style="font-weight:700;color:#34d399;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;">Asante Twi (Twerɛ Kronkron &bull; Akan Audio)</span>
            </div>
            <p style="font-family:Georgia,serif;font-size:1.08rem;line-height:1.75;color:#e6fcf2;margin:0;">
              &ldquo;${v.twiText}&rdquo;
            </p>
          </div>
        </div>

        <div style="text-align:center;padding-top:1rem;border-top:1px solid #283629;">
          <a href="/nkjv/${v.bookSlug}/${v.chapter}/?verse=${v.verse}" style="display:inline-flex;align-items:center;gap:8px;padding:10px 24px;background:#d4a72c;color:#0d1310;font-weight:800;font-size:14px;border-radius:10px;text-decoration:none;">
            📖 Open Full ${v.bookName} ${v.chapter} in Synchronized Parallel Reader &rarr;
          </a>
        </div>
      </section>

      <!-- STRONG'S CONCORDANCE & CROSS-REFERENCES -->
      <section style="background:#141e16;border:1px solid #283629;border-radius:16px;padding:1.5rem;margin-bottom:1.75rem;">
        <h3 style="font-family:Georgia,serif;font-size:1.25rem;color:#f7d584;margin:0 0 0.85rem 0;">
          Strong&rsquo;s Exhaustive Concordance Word Study
        </h3>
        <p style="font-size:0.95rem;color:#d0dbd0;line-height:1.7;margin-bottom:1rem;">
          ${v.keyStrongsNotes}
        </p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:1.25rem;">
          ${strongsPills}
        </div>
        <h4 style="font-size:0.95rem;color:#f7d584;margin:1.25rem 0 0.5rem 0;text-transform:uppercase;letter-spacing:0.06em;">
          Companion Scripture Cross-References:
        </h4>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${crossRefLinks}
        </div>
      </section>

      ${buildSanctuaryFooterHtml()}
    </div>
  </main></div>`;
}

function buildTopVersesIndexPrerenderShell() {
  const cardsHtml = topVerses.map((v) => `
    <div style="background:#141e16;border:1px solid #283629;border-radius:12px;padding:1.25rem;display:flex;flex-direction:column;justify-content:space-between;">
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
          <span style="font-size:11px;font-weight:800;color:#f7d584;text-transform:uppercase;letter-spacing:0.06em;background:rgba(212,167,44,0.12);padding:2px 8px;border-radius:4px;">${v.theme}</span>
          <span style="font-size:12px;color:#9ca89a;">${v.bookName}</span>
        </div>
        <h2 style="font-family:Georgia,serif;font-size:1.2rem;color:#fafaf5;margin:0 0 0.5rem 0;">
          <a href="/verse/${v.slug}/" style="color:#fafaf5;text-decoration:none;">${v.reference}</a>
        </h2>
        <p style="font-family:Georgia,serif;font-size:0.96rem;line-height:1.65;color:#c8d4c5;margin:0 0 1rem 0;font-style:italic;">
          &ldquo;${v.nkjv.length > 130 ? v.nkjv.slice(0, 130) + '...' : v.nkjv}&rdquo;
        </p>
      </div>
      <div style="border-top:1px solid #283629;padding-top:0.75rem;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:12px;color:#34d399;font-weight:600;">NKJV &bull; KJV &bull; TWI</span>
        <a href="/verse/${v.slug}/" style="color:#d4a72c;font-size:12px;font-weight:700;text-decoration:none;">Study Parallel &rarr;</a>
      </div>
    </div>
  `).join('\n');

  return `<div id="root"><main id="seo-prerender" style="min-height:100vh;background-color:#0f1712;color:#e3e6d8;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Georgia,serif;line-height:1.7;padding:2rem 1.25rem;">
    <div style="max-width:1080px;margin:0 auto;">
      <header style="text-align:center;background:linear-gradient(180deg,#172319 0%,#121b14 100%);border:1px solid rgba(212,167,44,0.38);border-radius:16px;padding:2.25rem 1.5rem;margin-bottom:2rem;">
        <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 14px;background:rgba(212,167,44,0.14);border:1px solid rgba(212,167,44,0.45);border-radius:999px;color:#f7d584;font-size:11.5px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.85rem;">
          ✨ Programmatic Scripture Authority Hub
        </div>
        <h1 style="font-family:Georgia,serif;font-size:clamp(1.85rem,3.4vw,2.6rem);line-height:1.2;color:#fafaf5;margin:0 0 0.85rem 0;">
          Top 30 Most Searched Bible Verses in Parallel
        </h1>
        <p style="font-size:1.05rem;color:#c8d4c5;max-width:840px;margin:0 auto 1.25rem auto;line-height:1.7;">
          Read, compare, and study humanity’s most cherished scriptures side-by-side across the New King James Version (NKJV), King James Version (KJV), Berean Standard Bible (BSB), Original Hebrew/Greek Interlinear, and Asante Twi (Twerɛ Kronkron). Includes 24kHz Studio Audio and Strong’s Concordance.
        </p>
        <nav aria-label="Sanctuary Quick Navigation" style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">
          ${buildSanctuaryNavPillsHtml()}
        </nav>
      </header>

      <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:16px;margin-bottom:2.5rem;">
        ${cardsHtml}
      </section>

      ${buildSanctuaryFooterHtml()}
    </div>
  </main></div>`;
}

function buildTopicalHubPrerenderShell(hub) {
  const versesHtml = (hub.verses || []).map((v) => `
    <div style="background:#19251b;border:1px solid #2d3c2e;border-radius:12px;padding:1.25rem;margin-bottom:1rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem;">
        <span style="font-weight:700;color:#f7d584;font-size:1.1rem;font-family:Georgia,serif;">${v.reference}</span>
        <a href="/nkjv/${v.bookSlug}/${v.chapter}/?verse=${v.verse}" style="color:#d4a72c;font-size:12px;text-decoration:none;font-weight:700;">Open Chapter &rarr;</a>
      </div>
      <p style="font-family:Georgia,serif;font-size:1.06rem;line-height:1.75;color:#fafaf5;margin:0 0 0.5rem 0;">
        <strong style="color:#f7d584;font-size:11px;font-family:sans-serif;text-transform:uppercase;margin-right:6px;background:rgba(212,167,44,0.15);padding:2px 6px;border-radius:4px;">NKJV</strong>${v.nkjv}
      </p>
      <p style="font-family:Georgia,serif;font-size:0.96rem;line-height:1.7;color:#c8d4c5;margin:0 0 0.5rem 0;border-top:1px solid rgba(45,60,46,0.5);padding-top:0.4rem;">
        <strong style="color:#9ca89a;font-size:11px;font-family:sans-serif;text-transform:uppercase;margin-right:6px;background:#141e16;padding:2px 6px;border-radius:4px;">KJV</strong>${v.kjv}
      </p>
      <p style="font-family:Georgia,serif;font-size:0.96rem;line-height:1.7;color:#34d399;margin:0 0 0.5rem 0;border-top:1px solid rgba(45,60,46,0.5);padding-top:0.4rem;">
        <strong style="color:#34d399;font-size:11px;font-family:sans-serif;text-transform:uppercase;margin-right:6px;background:rgba(52,211,153,0.1);padding:2px 6px;border-radius:4px;">TWI</strong>${v.twi}
      </p>
      <div style="font-size:12px;color:#9ca89a;font-style:italic;margin-top:0.4rem;">
        ${v.strongsNotes}
      </div>
    </div>
  `).join('\n');

  const faqsHtml = (hub.faqs || []).map((f) => `
    <div style="background:#19251b;border:1px solid #2d3c2e;border-radius:10px;padding:1rem 1.25rem;margin-bottom:0.75rem;">
      <h3 style="font-size:1rem;color:#f7d584;margin:0 0 0.4rem 0;">${f.q}</h3>
      <p style="margin:0;font-size:0.92rem;color:#d0dbd0;line-height:1.65;">${f.a}</p>
    </div>
  `).join('\n');

  return `<div id="root"><main id="seo-prerender" style="min-height:100vh;background-color:#0f1712;color:#e3e6d8;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Georgia,serif;line-height:1.7;padding:2rem 1.25rem;">
    <div style="max-width:1020px;margin:0 auto;">
      <header style="background:linear-gradient(180deg,#172319 0%,#121b14 100%);border:1px solid rgba(212,167,44,0.38);border-radius:16px;padding:2rem 1.5rem;margin-bottom:1.75rem;">
        <nav aria-label="Breadcrumb" style="font-size:13px;color:#9ca89a;margin-bottom:0.85rem;">
          <a href="/" style="color:#f7d584;text-decoration:none;">AduBible</a> &rsaquo;
          <a href="/topics/" style="color:#f7d584;text-decoration:none;">Topical Scripture Hubs</a> &rsaquo;
          <span style="color:#e3e6d8;">${hub.slug.charAt(0).toUpperCase() + hub.slug.slice(1)}</span>
        </nav>
        <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 12px;background:rgba(212,167,44,0.14);border:1px solid rgba(212,167,44,0.45);border-radius:999px;color:#f7d584;font-size:11.5px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.75rem;">
          ${hub.icon} Foundational Scripture Life Theme
        </div>
        <h1 style="font-family:Georgia,serif;font-size:clamp(1.75rem,3.2vw,2.4rem);line-height:1.25;color:#fafaf5;margin:0 0 0.75rem 0;">
          ${hub.h1}
        </h1>
        <p style="font-size:1.1rem;color:#f7d584;font-style:italic;margin:0 0 1.25rem 0;">
          &ldquo;${hub.tagline}&rdquo;
        </p>
        <nav aria-label="Sanctuary Quick Navigation" style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">
          ${buildSanctuaryNavPillsHtml()}
        </nav>
      </header>

      <!-- THEOLOGICAL EXPOSITION -->
      <section style="background:#141e16;border:1px solid #283629;border-radius:16px;padding:1.75rem;margin-bottom:1.75rem;">
        <h2 style="font-family:Georgia,serif;font-size:1.35rem;color:#f7d584;margin:0 0 0.85rem 0;">
          Theological Context &amp; Scriptural Exegesis
        </h2>
        <p style="font-size:1.02rem;color:#d8e2d5;line-height:1.8;margin-bottom:1rem;">
          ${hub.historicalExposition}
        </p>
        <div style="background:#19251b;border-left:3px solid #d4a72c;padding:0.75rem 1rem;border-radius:6px;font-family:monospace;font-size:0.92rem;color:#f7d584;">
          ${hub.hebrewGreekRoots}
        </div>
      </section>

      <!-- CURATED PARALLEL VERSES -->
      <section style="background:#141e16;border:1px solid #283629;border-radius:16px;padding:1.75rem;margin-bottom:1.75rem;">
        <h2 style="font-family:Georgia,serif;font-size:1.35rem;color:#f7d584;margin:0 0 1rem 0;">
          Foundational Scriptures on ${hub.slug.charAt(0).toUpperCase() + hub.slug.slice(1)} (${hub.verses.length} Key Passages)
        </h2>
        ${versesHtml}
      </section>

      <!-- FAQS -->
      <section style="background:#141e16;border:1px solid #283629;border-radius:16px;padding:1.75rem;margin-bottom:1.75rem;">
        <h2 style="font-family:Georgia,serif;font-size:1.35rem;color:#f7d584;margin:0 0 1rem 0;">
          Frequently Asked Questions on ${hub.slug.charAt(0).toUpperCase() + hub.slug.slice(1)}
        </h2>
        ${faqsHtml}
      </section>

      ${buildSanctuaryFooterHtml()}
    </div>
  </main></div>`;
}

function buildTopicalHubsIndexPrerenderShell() {
  const cardsHtml = topicalHubs.map((hub) => `
    <div style="background:#141e16;border:1px solid #283629;border-radius:12px;padding:1.35rem;display:flex;flex-direction:column;justify-content:space-between;">
      <div>
        <div style="font-size:2rem;margin-bottom:0.5rem;">${hub.icon}</div>
        <h2 style="font-family:Georgia,serif;font-size:1.25rem;color:#fafaf5;margin:0 0 0.5rem 0;">
          <a href="/topics/${hub.slug}/" style="color:#fafaf5;text-decoration:none;">${hub.h1}</a>
        </h2>
        <p style="font-size:0.95rem;color:#c8d4c5;line-height:1.65;margin:0 0 0.75rem 0;">
          ${hub.tagline}
        </p>
      </div>
      <div style="border-top:1px solid #283629;padding-top:0.75rem;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:12px;color:#f7d584;font-weight:600;">${hub.verses.length} Key Verses</span>
        <a href="/topics/${hub.slug}/" style="color:#d4a72c;font-size:12px;font-weight:700;text-decoration:none;">Explore Theme &rarr;</a>
      </div>
    </div>
  `).join('\n');

  return `<div id="root"><main id="seo-prerender" style="min-height:100vh;background-color:#0f1712;color:#e3e6d8;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Georgia,serif;line-height:1.7;padding:2rem 1.25rem;">
    <div style="max-width:1080px;margin:0 auto;">
      <header style="text-align:center;background:linear-gradient(180deg,#172319 0%,#121b14 100%);border:1px solid rgba(212,167,44,0.38);border-radius:16px;padding:2.25rem 1.5rem;margin-bottom:2rem;">
        <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 14px;background:rgba(212,167,44,0.14);border:1px solid rgba(212,167,44,0.45);border-radius:999px;color:#f7d584;font-size:11.5px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.85rem;">
          🏷️ Thematic Biblical Sanctuary
        </div>
        <h1 style="font-family:Georgia,serif;font-size:clamp(1.85rem,3.4vw,2.6rem);line-height:1.2;color:#fafaf5;margin:0 0 0.85rem 0;">
          Topical Scripture Hubs — 10 Life Themes in Parallel
        </h1>
        <p style="font-size:1.05rem;color:#c8d4c5;max-width:840px;margin:0 auto 1.25rem auto;line-height:1.7;">
          Discover curated scriptures addressing real human spiritual and physical needs: Healing, Supernatural Strength, Divine Protection, Peace over Anxiety, Thanksgiving, Mountain-Moving Faith, Agape Love, Anchor Hope, Forgiveness, and Heavenly Wisdom in parallel translations.
        </p>
        <nav aria-label="Sanctuary Quick Navigation" style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">
          ${buildSanctuaryNavPillsHtml()}
        </nav>
      </header>

      <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:16px;margin-bottom:2.5rem;">
        ${cardsHtml}
      </section>

      ${buildSanctuaryFooterHtml()}
    </div>
  </main></div>`;
}

function buildStrongsLexiconPrerenderShell(e) {
  const isHebrew = e.language === 'Hebrew';
  const keyVersesHtml = (e.keyVerses || []).map((kv) => {
    return `<span style="display:inline-block;padding:4px 10px;background:#19251b;border:1px solid #2d3c2e;border-radius:6px;color:#d8e2d5;font-size:13px;margin:3px;">${kv}</span>`;
  }).join('');

  return `<div id="root"><main id="seo-prerender" style="min-height:100vh;background-color:#0f1712;color:#e3e6d8;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Georgia,serif;line-height:1.7;padding:2rem 1.25rem;">
    <div style="max-width:1020px;margin:0 auto;">
      <header style="background:linear-gradient(180deg,#172319 0%,#121b14 100%);border:1px solid rgba(212,167,44,0.38);border-radius:16px;padding:2rem 1.5rem;margin-bottom:1.75rem;">
        <nav aria-label="Breadcrumb" style="font-size:13px;color:#9ca89a;margin-bottom:0.85rem;">
          <a href="/" style="color:#f7d584;text-decoration:none;">AduBible</a> &rsaquo;
          <a href="/lexicon/" style="color:#f7d584;text-decoration:none;">Strong’s Lexicon</a> &rsaquo;
          <span style="color:#e3e6d8;">${e.code} (${e.transliteration})</span>
        </nav>
        <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 12px;background:rgba(212,167,44,0.14);border:1px solid rgba(212,167,44,0.45);border-radius:999px;color:#f7d584;font-size:11.5px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.75rem;">
          Strong’s ${e.language} &bull; ${e.partOfSpeech}
        </div>
        <div style="display:flex;flex-wrap:wrap;align-items:baseline;gap:16px;margin-bottom:0.5rem;">
          <h1 style="font-family:Georgia,serif;font-size:clamp(2rem,4vw,3rem);color:#fafaf5;margin:0;">
            ${e.code}: ${e.transliteration}
          </h1>
          <span style="font-size:2.4rem;color:#f7d584;font-family:Georgia,serif;direction:${isHebrew ? 'rtl' : 'ltr'};">
            ${e.originalWord}
          </span>
        </div>
        <p style="font-size:1.15rem;color:#c8d4c5;margin:0 0 0.5rem 0;font-style:italic;">
          Pronounced: <strong>/${e.phonetic}/</strong> &bull; ${e.rootWord}
        </p>
        <p style="font-size:1.05rem;color:#e3e6d8;margin:0 0 1.25rem 0;">
          <strong>Short Definition:</strong> ${e.shortDefinition}
        </p>
        <nav aria-label="Sanctuary Quick Navigation" style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">
          ${buildSanctuaryNavPillsHtml()}
        </nav>
      </header>

      <!-- LEXICAL EXPOSITION -->
      <section style="background:#141e16;border:1px solid #283629;border-radius:16px;padding:1.75rem;margin-bottom:1.75rem;">
        <h2 style="font-family:Georgia,serif;font-size:1.35rem;color:#f7d584;margin:0 0 0.85rem 0;">
          Exhaustive Lexicon Definition &amp; Theological Meaning
        </h2>
        <p style="font-size:1.05rem;color:#fafaf5;line-height:1.8;margin-bottom:1.25rem;">
          ${e.fullDefinition}
        </p>
        <div style="background:#19251b;border-left:3px solid #d4a72c;padding:1rem 1.25rem;border-radius:8px;margin-bottom:1.25rem;">
          <h3 style="font-size:0.95rem;color:#f7d584;margin:0 0 0.35rem 0;text-transform:uppercase;letter-spacing:0.06em;">
            Brown-Driver-Briggs / Thayer Exegesis:
          </h3>
          <p style="margin:0;font-size:0.96rem;color:#d8e2d5;line-height:1.7;">
            ${e.bdbOrThayer}
          </p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;">
          <div style="background:#19251b;border:1px solid #2d3c2e;border-radius:10px;padding:1rem;">
            <div style="font-size:11px;font-weight:700;color:#9ca89a;text-transform:uppercase;">KJV Translation Usage</div>
            <div style="font-size:1.05rem;color:#fafaf5;font-weight:700;margin-top:0.25rem;">${e.kjvUsage}</div>
          </div>
          <div style="background:#19251b;border:1px solid #2d3c2e;border-radius:10px;padding:1rem;">
            <div style="font-size:11px;font-weight:700;color:#9ca89a;text-transform:uppercase;">Total Biblical Occurrences</div>
            <div style="font-size:1.05rem;color:#f7d584;font-weight:700;margin-top:0.25rem;">${e.occurrences} Times</div>
          </div>
          <div style="background:#19251b;border:1px solid rgba(52,211,153,0.3);border-radius:10px;padding:1rem;">
            <div style="font-size:11px;font-weight:700;color:#34d399;text-transform:uppercase;">Asante Twi Equivalent</div>
            <div style="font-size:1.05rem;color:#34d399;font-weight:700;margin-top:0.25rem;">${e.twiEquivalent || '—'}</div>
          </div>
        </div>
      </section>

      <!-- KEY BIBLICAL VERSES -->
      <section style="background:#141e16;border:1px solid #283629;border-radius:16px;padding:1.75rem;margin-bottom:1.75rem;">
        <h2 style="font-family:Georgia,serif;font-size:1.35rem;color:#f7d584;margin:0 0 0.85rem 0;">
          Key Biblical Occurrences
        </h2>
        <p style="font-size:0.95rem;color:#d0dbd0;line-height:1.7;margin-bottom:1rem;">
          ${e.code} (${e.originalWord}) appears in these foundational scripture passages:
        </p>
        <div>
          ${keyVersesHtml}
        </div>
      </section>

      ${buildSanctuaryFooterHtml()}
    </div>
  </main></div>`;
}

function buildStrongsLexiconIndexPrerenderShell() {
  const cardsHtml = Object.entries(strongsEntries).map(([code, entry]) => `
    <div style="background:#141e16;border:1px solid #283629;border-radius:10px;padding:1.15rem;display:flex;flex-direction:column;justify-content:space-between;">
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
          <span style="font-family:monospace;font-weight:800;color:#f7d584;font-size:13px;">${code}</span>
          <span style="font-size:11px;color:#9ca89a;text-transform:uppercase;">${entry.language}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:0.4rem;">
          <h2 style="font-family:Georgia,serif;font-size:1.15rem;color:#fafaf5;margin:0;">
            <a href="/lexicon/${code.toLowerCase()}/" style="color:#fafaf5;text-decoration:none;">${entry.transliteration}</a>
          </h2>
          <span style="font-size:1.35rem;color:#f7d584;font-family:Georgia,serif;">${entry.originalWord}</span>
        </div>
        <p style="font-size:0.88rem;color:#c8d4c5;line-height:1.55;margin:0 0 0.75rem 0;">
          ${entry.shortDefinition}
        </p>
      </div>
      <div style="border-top:1px solid #283629;padding-top:0.5rem;display:flex;justify-content:space-between;align-items:center;font-size:12px;">
        <span style="color:#9ca89a;">${entry.occurrences}x in KJV</span>
        <a href="/lexicon/${code.toLowerCase()}/" style="color:#d4a72c;font-weight:700;text-decoration:none;">Lexicon Entry &rarr;</a>
      </div>
    </div>
  `).join('\n');

  return `<div id="root"><main id="seo-prerender" style="min-height:100vh;background-color:#0f1712;color:#e3e6d8;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Georgia,serif;line-height:1.7;padding:2rem 1.25rem;">
    <div style="max-width:1080px;margin:0 auto;">
      <header style="text-align:center;background:linear-gradient(180deg,#172319 0%,#121b14 100%);border:1px solid rgba(212,167,44,0.38);border-radius:16px;padding:2.25rem 1.5rem;margin-bottom:2rem;">
        <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 14px;background:rgba(212,167,44,0.14);border:1px solid rgba(212,167,44,0.45);border-radius:999px;color:#f7d584;font-size:11.5px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.85rem;">
          📖 Hebrew &amp; Greek Exegetical Lexicon
        </div>
        <h1 style="font-family:Georgia,serif;font-size:clamp(1.85rem,3.4vw,2.6rem);line-height:1.2;color:#fafaf5;margin:0 0 0.85rem 0;">
          Strong’s Exhaustive Concordance Lexicon Directory
        </h1>
        <p style="font-size:1.05rem;color:#c8d4c5;max-width:840px;margin:0 auto 1.25rem auto;line-height:1.7;">
          Explore original Hebrew (H) and Greek (G) root words with Brown-Driver-Briggs &amp; Thayer definitions, transliterations, pronunciations, biblical occurrences, and Asante Twi translation equivalents. 100% Ad-Free on AduBible.org&reg;.
        </p>
        <nav aria-label="Sanctuary Quick Navigation" style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">
          ${buildSanctuaryNavPillsHtml()}
        </nav>
      </header>

      <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:14px;margin-bottom:2.5rem;">
        ${cardsHtml}
      </section>

      ${buildSanctuaryFooterHtml()}
    </div>
  </main></div>`;
}

function buildChapterOrHubPrerenderShell(item) {
  const versesHtml = Array.isArray(item.verses) && item.verses.length > 0
    ? `<section style="background:#141e16;border:1px solid #283629;border-radius:14px;padding:1.5rem;margin-bottom:1.5rem;">
        <h2 style="font-family:Georgia,serif;font-size:1.3rem;color:#f7d584;margin:0 0 0.85rem 0;">Scripture Text Preview &mdash; ${item.heading}</h2>
        <div style="display:flex;flex-direction:column;gap:0.65rem;color:#e3e6d8;font-size:1.02rem;line-height:1.75;">
          ${item.verses.map((v) => `<p style="margin:0;padding-bottom:0.5rem;border-bottom:1px solid rgba(45,60,46,0.5);">${v}</p>`).join('\n')}
        </div>
        ${item.studyNotes ? `<div style="margin-top:1rem;padding:0.85rem 1rem;background:#19251b;border-left:3px solid #d4a72c;border-radius:8px;font-size:0.92rem;color:#c8d4c5;"><strong>Exegetical &amp; Lexical Notes:</strong> ${item.studyNotes}</div>` : ''}
      </section>`
    : '';

  return `<div id="root"><main id="seo-prerender" style="min-height:100vh;background-color:#0f1712;color:#e3e6d8;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Georgia,serif;line-height:1.7;padding:2rem 1.25rem;">
    <div style="max-width:1020px;margin:0 auto;">
      <header style="text-align:center;background:linear-gradient(180deg,#172319 0%,#121b14 100%);border:1px solid rgba(212,167,44,0.38);border-radius:16px;padding:1.75rem 1.5rem;margin-bottom:1.75rem;">
        <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 14px;background:rgba(212,167,44,0.14);border:1px solid rgba(212,167,44,0.45);border-radius:999px;color:#f7d584;font-size:11.5px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.85rem;">
          AduBible.org&reg; Parallel Scripture Sanctuary &bull; 100% Ads-Free
        </div>
        <h1 style="font-family:Georgia,serif;font-size:clamp(1.65rem,3.2vw,2.35rem);line-height:1.25;color:#fafaf5;margin:0 0 0.75rem 0;">${item.heading}</h1>
        <p style="font-size:1.03rem;color:#c8d4c5;max-width:840px;margin:0 auto 1.2rem auto;line-height:1.7;">${item.excerpt}</p>
        <nav aria-label="Sanctuary Quick Navigation" style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">
          ${buildSanctuaryNavPillsHtml()}
        </nav>
      </header>
      ${versesHtml}
      <section style="background:#141e16;border:1px solid #283629;border-radius:14px;padding:1.35rem;margin-bottom:1.5rem;">
        <h2 style="font-family:Georgia,serif;font-size:1.2rem;color:#f7d584;margin:0 0 0.5rem 0;">Parallel Bible Study, Strong&rsquo;s Concordance, 24kHz Audio &amp; Offline Vault</h2>
        <p style="margin:0;font-size:0.94rem;color:#d0dbd0;line-height:1.7;">
          Compare this passage side-by-side in up to 4 synchronized columns across <strong>NKJV, KJV, BSB, Original Hebrew (WLC), Koine Greek (Textus Receptus), Asante Twi (Twerɛ Kronkron), French, Spanish, German, and 35+ global languages</strong> on <strong>AduBible.org&reg;</strong>. Tap any verse for Strong&rsquo;s Exhaustive Concordance numbers, Matthew Henry &amp; John Gill commentaries, 24kHz Neural Audio streaming, and 100% offline PWA access.
        </p>
      </section>
      ${buildSanctuaryFooterHtml()}
    </div>
  </main></div>`;
}

function replaceRootMount(html, replacementBlock) {
  if (html.includes('<div id="root"><!--SEO_PRERENDER_SLOT--></div>')) {
    return html.replace('<div id="root"><!--SEO_PRERENDER_SLOT--></div>', replacementBlock);
  }
  return html.replace('<div id="root"></div>', replacementBlock);
}

function buildSSG() {
  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('dist/index.html not found. Run vite build first.');
    process.exit(1);
  }
  const baseHtml = fs.readFileSync(templatePath, 'utf-8');

  for (const item of CANONICAL_ROUTES) {
    const canonicalUrl = `${BASE_URL}${item.route}`;
    let html = baseHtml
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${item.title}</title>`)
      .replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="description" content="${item.description}" />`
      )
      .replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
        `<link rel="canonical" href="${canonicalUrl}" />`
      )
      .replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:title" content="${item.title}" />`
      )
      .replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:description" content="${item.description}" />`
      )
      .replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:url" content="${canonicalUrl}" />`
      );

    if (item.article) {
      const art = item.article;
      const heroWebpUrl = `${BASE_URL}/assets/articles/${art.slug}-16x9.webp`;

      // Update OG Image to article hero
      html = html.replace(
        /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:image" content="${heroWebpUrl}" />\n    <meta property="og:image:width" content="1600" />\n    <meta property="og:image:height" content="900" />\n    <meta property="og:type" content="article" />\n    <meta property="article:published_time" content="${art.datePublished}" />\n    <meta property="article:modified_time" content="${art.dateModified}" />\n    <meta property="article:section" content="${art.category}" />`
      );

      // Inject preload for LCP hero image
      const preloadTag = `<link rel="preload" as="image" href="/assets/articles/${art.slug}-16x9.webp" type="image/webp" />`;
      html = html.replace('</head>', `    ${preloadTag}\n  </head>`);

      // Schemas: BlogPosting + BreadcrumbList + FAQPage
      const blogPostingSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': art.title,
        'alternativeHeadline': art.subtitle,
        'description': art.metaDescription,
        'url': canonicalUrl,
        'datePublished': art.datePublished,
        'dateModified': art.dateModified,
        'wordCount': art.wordCount,
        'articleSection': art.category,
        'inLanguage': 'en-US',
        'image': [
          `${BASE_URL}/assets/articles/${art.slug}-16x9.webp`,
          `${BASE_URL}/assets/articles/${art.slug}-4x3.webp`,
          `${BASE_URL}/assets/articles/${art.slug}-1x1.webp`,
        ],
        'author': {
          '@type': 'Organization',
          'name': art.author,
          'url': BASE_URL,
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'AduBible.org',
          'url': BASE_URL,
          'logo': {
            '@type': 'ImageObject',
            'url': `${BASE_URL}/favicon-96x96.png`,
          },
        },
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
      };

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': `${BASE_URL}/`,
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Articles',
            'item': `${BASE_URL}/articles/`,
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': art.title,
            'item': canonicalUrl,
          },
        ],
      };

      const faqSchema = extractFaqSchema(art.contentHtml);

      const schemas = [blogPostingSchema, breadcrumbSchema];
      if (faqSchema) schemas.push(faqSchema);

      const jsonLdBlock = `\n    <script type="application/ld+json">\n${JSON.stringify(schemas, null, 2)}\n    </script>\n  </head>`;
      html = html.replace('</head>', jsonLdBlock);

      // Inject full article body inside #root
      const articleSsrBlock = `<div id="root"><main style="max-width:960px;margin:0 auto;padding:2rem 1.25rem;font-family:Georgia,serif;color:#f5f5f4;background:#1c1917;line-height:1.75;"><header style="margin-bottom:2rem;border-bottom:1px solid #292524;padding-bottom:1.5rem;"><nav aria-label="Breadcrumb" style="font-size:13px;color:#a8a29e;margin-bottom:1rem;"><a href="/" style="color:#f59e0b;text-decoration:none;">AduBible</a> &rsaquo; <a href="/articles/" style="color:#f59e0b;text-decoration:none;">Articles</a> &rsaquo; <span>${art.category}</span></nav><div style="font-size:12px;font-weight:700;color:#f59e0b;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.5rem;">${art.category} &bull; ${art.readTimeMinutes} Min Read</div><h1 style="font-size:2.25rem;line-height:1.2;color:#fafaf9;margin:0 0 1rem 0;">${art.title}</h1><p style="font-size:1.15rem;color:#d6d3d1;font-style:italic;margin:0 0 1rem 0;">${art.subtitle}</p><div style="font-size:13px;color:#a8a29e;">By <strong>${art.author}</strong> &bull; Published ${art.datePublished} &bull; Updated ${art.dateModified} &bull; <span>${art.wordCount.toLocaleString()} Words</span></div><div style="margin-top:1.5rem;"><picture><source srcset="/assets/articles/${art.slug}-16x9.webp" type="image/webp" /><img src="/assets/articles/${art.slug}-16x9.webp" alt="${art.title}" width="1600" height="900" style="width:100%;height:auto;border-radius:12px;border:1px solid #292524;" loading="eager" fetchpriority="high" /></picture></div></header><article class="article-body" style="font-size:1.05rem;line-height:1.8;">${art.contentHtml}</article><footer style="margin-top:3rem;padding-top:2rem;border-top:1px solid #292524;font-size:13px;color:#a8a29e;text-align:center;"><nav style="margin-bottom:1.25rem;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:8px 10px;max-width:1100px;margin-left:auto;margin-right:auto;"><a href="/articles/" style="display:inline-block;padding:5px 12px;background:#243024;border:1px solid rgba(245,158,11,0.4);border-radius:999px;color:#f59e0b;font-weight:700;font-size:12px;text-decoration:none;">&larr; Back to All Articles</a><a href="/" style="display:inline-block;padding:5px 12px;background:#1c1917;border:1px solid #3d3835;border-radius:999px;color:#f59e0b;font-weight:600;font-size:12px;text-decoration:none;">AduBible Home</a><a href="/about/" style="display:inline-block;padding:5px 12px;background:#1c1917;border:1px solid #3d3835;border-radius:999px;color:#d6d3d1;font-size:12px;text-decoration:none;">About AduBible</a><a href="/privacy/" style="display:inline-block;padding:5px 12px;background:#1c1917;border:1px solid #3d3835;border-radius:999px;color:#d6d3d1;font-size:12px;text-decoration:none;">Privacy Policy</a><a href="/terms/" style="display:inline-block;padding:5px 12px;background:#1c1917;border:1px solid #3d3835;border-radius:999px;color:#d6d3d1;font-size:12px;text-decoration:none;">Terms of Service</a><a href="/contact/" style="display:inline-block;padding:5px 12px;background:#1c1917;border:1px solid #3d3835;border-radius:999px;color:#d6d3d1;font-size:12px;text-decoration:none;">Contact Us</a><a href="/donate/" style="display:inline-block;padding:5px 14px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.6);border-radius:999px;color:#f59e0b;font-weight:700;font-size:12px;text-decoration:none;">💛 Support the Mission</a></nav><p style="margin:0 auto;max-width:820px;line-height:1.7;">&copy; ${CURRENT_YEAR} <a href="https://adubible.org/" style="color:#f59e0b;text-decoration:none;font-weight:700;">AduBible.org&reg;</a> &middot; Dedicated to Humanity; A Global Ministry of Apostle Kwame Adu &middot; <a href="https://nsuhia.com/" target="_blank" rel="noopener noreferrer" style="color:#f59e0b;text-decoration:none;">Nsuhia, Ghana ↗</a> &middot; <span style="color:#10b981;font-weight:700;">100% Ads-Free Reading Experience</span></p></footer></main></div>`;
      html = replaceRootMount(html, articleSsrBlock);
    } else if (item.legalPageData) {
      const lp = item.legalPageData;
      const schemaType = lp.schemaType || 'WebPage';

      const pageSchema = {
        '@context': 'https://schema.org',
        '@type': schemaType,
        'name': lp.title,
        'description': lp.metaDescription,
        'url': canonicalUrl,
        'inLanguage': 'en-US',
        'isPartOf': {
          '@type': 'WebSite',
          'name': 'AduBible.org',
          'url': BASE_URL,
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'AduBible.org',
          'url': BASE_URL,
          'logo': {
            '@type': 'ImageObject',
            'url': `${BASE_URL}/favicon-96x96.png`,
          },
        },
      };

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': `${BASE_URL}/`,
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Institutional Governance',
            'item': `${BASE_URL}/about/`,
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': lp.title,
            'item': canonicalUrl,
          },
        ],
      };

      const jsonLdBlock = `\n    <script type="application/ld+json">\n${JSON.stringify([pageSchema, breadcrumbSchema], null, 2)}\n    </script>\n  </head>`;
      html = html.replace('</head>', jsonLdBlock);

      const renderLegalContent = (content) => {
        const blocks = content.split('\n\n');
        return blocks
          .map((block) => {
            const lines = block.trim().split('\n');
            if (lines.length >= 2 && lines[0].includes('|') && lines[1].includes('|')) {
              const headerCols = lines[0]
                .split('|')
                .map((c) => c.trim())
                .filter(Boolean);
              const rowLines = lines.slice(2).filter((l) => l.trim().startsWith('|'));
              const ths = headerCols
                .map(
                  (c) =>
                    `<th style="padding:10px 14px;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#b7c99f;background:#151b15;border-bottom:1px solid #2d382c;text-align:left;">${c.replace(/\*\*/g, '')}</th>`
                )
                .join('');
              const trs = rowLines
                .map((r) => {
                  const cols = r.split('|').map((c) => c.trim()).filter(Boolean);
                  const tds = cols
                    .map((c) => {
                      const formatted = c.replace(
                        /\*\*([^*]+)\*\*/g,
                        '<strong style="color:#b7c99f;">$1</strong>'
                      );
                      return `<td style="padding:10px 14px;border-bottom:1px solid #2d382c;color:#e3e6d8;font-size:13px;line-height:1.5;">${formatted}</td>`;
                    })
                    .join('');
                  return `<tr style="border-bottom:1px solid #2d382c;">${tds}</tr>`;
                })
                .join('');
              return `<div style="overflow-x:auto;margin:1.25rem 0;border:1px solid #2d382c;border-radius:10px;background:#181f18;"><table style="width:100%;border-collapse:collapse;text-align:left;"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`;
            }

            let formatted = block
              .replace(
                /([a-zA-Z0-9._-]+\[at\][a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
                (match) => {
                  const realEmail = match.replace('[at]', '@');
                  return `<a href="mailto:${realEmail}" style="color:#b7c99f;text-decoration:underline;">${match}</a>`;
                }
              )
              .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#fdfbf7;">$1</strong>');

            return `<p style="margin:0 0 1rem 0;line-height:1.8;color:#e3e6d8;font-size:15px;">${formatted.replace(/\n/g, '<br/>')}</p>`;
          })
          .join('');
      };

      const sectionsHtml = lp.sections
        .map(
          (sec) => `
        <section id="${sec.id}" style="margin-bottom:2rem;background:#1a221a;border:1px solid #2d382c;border-radius:14px;padding:1.75rem;">
          <h2 style="font-size:1.35rem;color:#b7c99f;margin-top:0;margin-bottom:1rem;border-bottom:1px solid #2d382c;padding-bottom:0.6rem;font-weight:700;letter-spacing:-0.01em;">${sec.heading}</h2>
          <div style="font-size:1rem;line-height:1.8;color:#e3e6d8;">
            ${renderLegalContent(sec.content)}
          </div>
        </section>
      `
        )
        .join('\n');

      const legalSsrBlock = `<div id="root">
        <main style="max-width:960px;margin:0 auto;padding:2.5rem 1.25rem;font-family:Georgia,serif;color:#e3e6d8;background:#121712;line-height:1.8;">
          <header style="margin-bottom:2.5rem;border-bottom:1px solid #2d382c;padding-bottom:1.75rem;">
            <nav aria-label="Breadcrumb" style="font-size:13px;color:#8e968d;margin-bottom:1rem;">
              <a href="/" style="color:#b7c99f;text-decoration:none;font-weight:600;">AduBible</a> &rsaquo;
              <a href="/about/" style="color:#b7c99f;text-decoration:none;">Institutional Governance</a> &rsaquo;
              <span>${lp.title}</span>
            </nav>
            <div style="display:inline-block;padding:4px 12px;background:#243024;border:1px solid #3d4f3d;border-radius:999px;font-size:11px;font-weight:700;color:#b7c99f;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.75rem;">
              ${lp.badge} &bull; Last Updated: ${lp.lastUpdated}
            </div>
            <h1 style="font-size:2.25rem;line-height:1.2;color:#fdfbf7;margin:0 0 1rem 0;font-weight:800;letter-spacing:-0.02em;">${lp.title}</h1>
            <p style="font-size:1.1rem;color:#c2c9bc;font-style:italic;margin:0;line-height:1.6;">${lp.metaDescription}</p>
          </header>

          <article class="legal-body">
            ${sectionsHtml}
          </article>

          ${buildSanctuaryFooterHtml()}
        </main>
      </div>`;

      html = replaceRootMount(html, legalSsrBlock);
    } else if (item.route === '/ask/') {
      const askAppSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': 'Ask AduBible — Ancient Biblical Wisdom & Exegesis',
        'applicationCategory': 'EducationalApplication',
        'operatingSystem': 'All',
        'browserRequirements': 'Requires JavaScript. Requires HTML5.',
        'description': item.description,
        'url': canonicalUrl,
        'inLanguage': ['en', 'ak', 'he', 'el'],
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD',
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'AduBible.org®',
          'url': BASE_URL,
        },
      };

      const askFaqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is Ask AduBible and how was its biblical intelligence developed?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': "Ask AduBible is a sovereign, unmonetized artificial intelligence engine trained on the 66 canonical books of the Holy Bible, ancient Hebrew Masoretic text, Greek Textus Receptus, and Strong's Concordance numbering.",
            },
          },
          {
            '@type': 'Question',
            'name': 'How does Ask AduBible handle original Hebrew and Greek root words?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': "Every inquiry cross-references original language manuscripts, providing exact Strong's numbers (e.g. H7965 for Shalom, G26 for Agape), transliterations, and Brown-Driver-Briggs / Thayer definitions.",
            },
          },
          {
            '@type': 'Question',
            'name': 'Can Ask AduBible analyze the Asante Twi and African Bible translations?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes. Ask AduBible uniquely incorporates the linguistic richness of the Asante Twi Holy Bible (Twerɛ Kronkron), highlighting indigenous concepts like Tweduampɔn Nyame (The Dependable Almighty) and Adom (Grace).',
            },
          },
          {
            '@type': 'Question',
            'name': 'Is my theological research and chat history private?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': '100% private. In alignment with our strict Ads-Free Covenant, your chats and theological questions are never logged for commercial advertising profiling, never sold, and never tracked.',
            },
          },
        ],
      };

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': `${BASE_URL}/`,
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Ask AduBible',
            'item': canonicalUrl,
          },
        ],
      };

      html = html.replace(
        '</head>',
        `\n    <script type="application/ld+json">\n${JSON.stringify([askAppSchema, askFaqSchema, breadcrumbSchema], null, 2)}\n    </script>\n  </head>`
      );

      html = replaceRootMount(html, buildAskAiPrerenderShell(item));
    } else if (item.isHomeAuthority) {
      // Inject FAQPage JSON-LD schema for the root Online Bible Authority Hub
      const homeFaqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': HOME_FAQ_ITEMS.map((itemFaq) => ({
          '@type': 'Question',
          'name': itemFaq.q,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': itemFaq.a,
          },
        })),
      };
      html = html.replace(
        '</head>',
        `\n    <script type="application/ld+json">\n${JSON.stringify(homeFaqSchema, null, 2)}\n    </script>\n  </head>`
      );

      html = replaceRootMount(html, buildHomeAuthorityPrerenderShell());
    } else if (item.topVerseData) {
      const v = item.topVerseData;
      const verseSchema = {
        '@context': 'https://schema.org',
        '@type': 'BibleVerse',
        'name': v.reference,
        'headline': item.heading,
        'description': item.description,
        'text': v.nkjv,
        'inLanguage': 'en',
        'url': canonicalUrl,
        'isPartOf': {
          '@type': 'WebSite',
          'name': 'AduBible.org®',
          'url': BASE_URL,
        },
      };
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${BASE_URL}/` },
          { '@type': 'ListItem', 'position': 2, 'name': 'Top Verses', 'item': `${BASE_URL}/verse/` },
          { '@type': 'ListItem', 'position': 3, 'name': v.reference, 'item': canonicalUrl },
        ],
      };
      html = html.replace(
        '</head>',
        `\n    <script type="application/ld+json">\n${JSON.stringify([verseSchema, breadcrumbSchema], null, 2)}\n    </script>\n  </head>`
      );
      html = replaceRootMount(html, buildTopVersePrerenderShell(v));
    } else if (item.isVerseIndex) {
      const pageSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': item.title,
        'description': item.description,
        'url': canonicalUrl,
      };
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${BASE_URL}/` },
          { '@type': 'ListItem', 'position': 2, 'name': 'Top Verses', 'item': canonicalUrl },
        ],
      };
      html = html.replace(
        '</head>',
        `\n    <script type="application/ld+json">\n${JSON.stringify([pageSchema, breadcrumbSchema], null, 2)}\n    </script>\n  </head>`
      );
      html = replaceRootMount(html, buildTopVersesIndexPrerenderShell());
    } else if (item.topicalHubData) {
      const hub = item.topicalHubData;
      const topicSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': hub.h1,
        'description': hub.metaDescription,
        'url': canonicalUrl,
      };
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${BASE_URL}/` },
          { '@type': 'ListItem', 'position': 2, 'name': 'Topical Scripture Hubs', 'item': `${BASE_URL}/topics/` },
          { '@type': 'ListItem', 'position': 3, 'name': hub.h1, 'item': canonicalUrl },
        ],
      };
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': (hub.faqs || []).map((f) => ({
          '@type': 'Question',
          'name': f.q,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': f.a,
          },
        })),
      };
      html = html.replace(
        '</head>',
        `\n    <script type="application/ld+json">\n${JSON.stringify([topicSchema, breadcrumbSchema, faqSchema], null, 2)}\n    </script>\n  </head>`
      );
      html = replaceRootMount(html, buildTopicalHubPrerenderShell(hub));
    } else if (item.isTopicsIndex) {
      const pageSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': item.title,
        'description': item.description,
        'url': canonicalUrl,
      };
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${BASE_URL}/` },
          { '@type': 'ListItem', 'position': 2, 'name': 'Topical Scripture Hubs', 'item': canonicalUrl },
        ],
      };
      html = html.replace(
        '</head>',
        `\n    <script type="application/ld+json">\n${JSON.stringify([pageSchema, breadcrumbSchema], null, 2)}\n    </script>\n  </head>`
      );
      html = replaceRootMount(html, buildTopicalHubsIndexPrerenderShell());
    } else if (item.lexiconData) {
      const e = item.lexiconData;
      const termSchema = {
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        'termCode': e.code,
        'name': `${e.code} ${e.transliteration} (${e.originalWord})`,
        'description': e.shortDefinition,
        'inDefinedTermSet': "Strong's Exhaustive Concordance",
        'url': canonicalUrl,
      };
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${BASE_URL}/` },
          { '@type': 'ListItem', 'position': 2, 'name': 'Strong’s Lexicon', 'item': `${BASE_URL}/lexicon/` },
          { '@type': 'ListItem', 'position': 3, 'name': e.code, 'item': canonicalUrl },
        ],
      };
      html = html.replace(
        '</head>',
        `\n    <script type="application/ld+json">\n${JSON.stringify([termSchema, breadcrumbSchema], null, 2)}\n    </script>\n  </head>`
      );
      html = replaceRootMount(html, buildStrongsLexiconPrerenderShell(e));
    } else if (item.isLexiconIndex) {
      const pageSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': item.title,
        'description': item.description,
        'url': canonicalUrl,
      };
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${BASE_URL}/` },
          { '@type': 'ListItem', 'position': 2, 'name': 'Strong’s Lexicon', 'item': canonicalUrl },
        ],
      };
      html = html.replace(
        '</head>',
        `\n    <script type="application/ld+json">\n${JSON.stringify([pageSchema, breadcrumbSchema], null, 2)}\n    </script>\n  </head>`
      );
      html = replaceRootMount(html, buildStrongsLexiconIndexPrerenderShell());
    } else {
      // Luxury inline-styled Chapter & Hub Pre-render Shell
      const chapterSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'name': item.title,
        'headline': item.heading,
        'description': item.description,
        'url': canonicalUrl,
        'isPartOf': {
          '@type': 'WebSite',
          'name': 'AduBible.org®',
          'url': BASE_URL,
        },
      };
      html = html.replace(
        '</head>',
        `\n    <script type="application/ld+json">\n${JSON.stringify(chapterSchema, null, 2)}\n    </script>\n  </head>`
      );
      html = replaceRootMount(html, buildChapterOrHubPrerenderShell(item));
    }

    if (item.route === '/donate/') {
      const donateSchema = {
        '@context': 'https://schema.org',
        '@type': 'DonateAction',
        'name': 'Support AduBible Planetary Scripture Mission',
        'description': item.description,
        'url': canonicalUrl,
        'recipient': {
          '@type': 'NGO',
          'name': 'AduBible Scripture Mission (In Support of Apostle Kwame Adu)',
          'url': BASE_URL,
        },
      };
      html = html.replace('</head>', `\n    <script type="application/ld+json">\n${JSON.stringify(donateSchema, null, 2)}\n    </script>\n  </head>`);
    }

    const outDir =
      item.route === '/'
        ? DIST_DIR
        : path.join(DIST_DIR, item.route.replace(/^\/|\/$/g, ''));
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
  }

  // Generate physical /admin/ entry point (Strictly noindex, nofollow; excluded from sitemaps)
  const adminDir = path.join(DIST_DIR, 'admin');
  fs.mkdirSync(adminDir, { recursive: true });
  let adminHtml = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/i, '<title>AduBible Mission Command Deck &amp; Executive Admin | AduBible.org</title>')
    .replace(
      /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
      '<meta name="robots" content="noindex, nofollow" />'
    )
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${BASE_URL}/admin/" />`
    );
  adminHtml = replaceRootMount(
    adminHtml,
    '<div id="root"><main style="max-width:760px;margin:4rem auto;padding:2rem;font-family:Georgia,serif;color:#f5f5f4;text-align:center;"><h1 style="color:#e3e6d8;font-size:2rem;margin-bottom:0.75rem;">AduBible Mission Command Deck</h1><p style="color:#9ca3af;font-size:1rem;">Initializing Sovereign Executive Authentication...</p></main></div>'
  );
  fs.writeFileSync(path.join(adminDir, 'index.html'), adminHtml, 'utf-8');

  // Generate sitemap.xml
  const sitemapEntries = CANONICAL_ROUTES.map(
    (r) => `  <url>
    <loc>${BASE_URL}${r.route}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  ).join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>
`;
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');

  // Generate image-sitemap.xml for all 45 WebP images
  const imageSitemapEntries = articles.map((art) => `  <url>
    <loc>${BASE_URL}/articles/${art.slug}/</loc>
    <image:image>
      <image:loc>${BASE_URL}/assets/articles/${art.slug}-16x9.webp</image:loc>
      <image:title>${escapeXml(art.title)} — 16:9 Landscape Artwork</image:title>
      <image:caption>${escapeXml(art.excerpt)}</image:caption>
    </image:image>
    <image:image>
      <image:loc>${BASE_URL}/assets/articles/${art.slug}-4x3.webp</image:loc>
      <image:title>${escapeXml(art.title)} — 4:3 Standard Artwork</image:title>
      <image:caption>${escapeXml(art.excerpt)}</image:caption>
    </image:image>
    <image:image>
      <image:loc>${BASE_URL}/assets/articles/${art.slug}-1x1.webp</image:loc>
      <image:title>${escapeXml(art.title)} — 1:1 Square Artwork</image:title>
      <image:caption>${escapeXml(art.excerpt)}</image:caption>
    </image:image>
  </url>`).join('\n');

  const imageSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageSitemapEntries}
</urlset>
`;
  fs.writeFileSync(path.join(DIST_DIR, 'image-sitemap.xml'), imageSitemapXml, 'utf-8');

  // Generate llms.txt for LLM crawlers
  const llmsTxt = `# AduBible.org® — Sovereign Multilingual Parallel Bible Engine

> Free, unmonetized, 100% ad-free Scripture study platform uniting 35+ global translations, Strong's Greek and Hebrew Lexicon, classic commentaries, 24kHz Neural Audio Bible, 3D Bible & Psalm Games, and ancient manuscripts. Dedicated to humanity in honor of the ministry of Apostle Kwame Adu (Nsuhia, Ghana · https://nsuhia.com/).

## Core Features
- Synchronized multi-column parallel reading (up to 4 versions simultaneously)
- 100% ad-free forever with zero tracking and zero monetization
- 35+ global language translations including Asante Twi, Akuapem Twi, Hebrew, Greek, French, Spanish, German, Hausa, Yoruba, Swahili, Arabic, Chinese, and Hindi
- Strong's Exhaustive Concordance with instant morphological word studies
- Matthew Henry, John Gill, and Jamieson-Fausset-Brown classic commentaries
- Flagship Psalms Study Hub: Book of Psalms 91 (/nkjv/psalms/91/), Psalm 23 (/nkjv/psalms/23/), Psalms Chapter 1 (/nkjv/psalms/1/), Psalm 35 (/nkjv/psalms/35/), Psalm 34 (/nkjv/psalms/34/)
- 16 Deuterocanonical books and 25 ancient Apocryphal works from the 7th-century List of Sixty
- 24kHz Neural Audio Bible streaming across English and Twi
- Interactive 3D WebGL Bible & Psalm Games Arcade (Scripture Quiz, Verse Scramble, Armor of God Runner)
- Private Offline Study Vault (PWA for Android, iOS & Desktop with bookmarks, pins, highlights, notes)

## Authoritative Exegesis & Study Guides (/articles/)
${articles.map((a, idx) => `${idx + 1}. ${a.title}: ${BASE_URL}/articles/${a.slug}/`).join('\n')}

## Institutional & Legal Governance (/footer)
- About AduBible & Legacy: ${BASE_URL}/about/
- Sovereign Privacy Policy: ${BASE_URL}/privacy/
- Terms of Service: ${BASE_URL}/terms/
- Contact Us & Ministry Support: ${BASE_URL}/contact/
- Cookie & Local Storage Policy: ${BASE_URL}/cookie-policy/
- How to Use AduBible: ${BASE_URL}/how-to-use/
- Editorial Policy & Translation Standards: ${BASE_URL}/editorial-policy/
- Biblical Exegesis Glossary: ${BASE_URL}/glossary/
- Manuscript Sources & Archives: ${BASE_URL}/sources/
`;
  fs.writeFileSync(path.join(DIST_DIR, 'llms.txt'), llmsTxt, 'utf-8');

  // Copy robots.txt
  try {
    const publicRobots = fs.readFileSync(path.join(__dirname, 'public', 'robots.txt'), 'utf-8');
    fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), publicRobots, 'utf-8');
  } catch (err) {
    const fallbackRobots = `User-agent: *
Allow: /

User-agent: Googlebot-Image
Allow: /
Allow: /assets/
Allow: /assets/articles/
Allow: /favicon.ico
Allow: /favicon.svg
Allow: /favicon-48x48.png
Allow: /favicon-96x96.png
Allow: /apple-touch-icon.png

Sitemap: ${BASE_URL}/sitemap.xml
`;
    fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), fallbackRobots, 'utf-8');
  }

  console.log(
    `[ADUBIBLE SSG] Generated ${CANONICAL_ROUTES.length} static routes (including ${articles.length} pillar articles + ${Object.keys(legalPages).length} full legal pages) + sitemap.xml + image-sitemap.xml + llms.txt in dist/ for ${BASE_URL}`
  );
}

buildSSG();
