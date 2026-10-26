import { CommentarySource, VerseCommentary } from '../types/bible';

export const COMMENTARIES_CATALOG: CommentarySource[] = [
  {
    id: 'matthew-henry',
    name: "Matthew Henry's Complete Commentary on the Whole Bible",
    shortName: 'Matthew Henry',
    author: 'Matthew Henry',
    year: '1706',
    description:
      'Classic pastoral and devotional exposition of the Old and New Testaments.',
    helloaoId: 'matthew-henry',
  },
  {
    id: 'jfb',
    name: 'Jamieson, Fausset, and Brown Commentary Critical and Explanatory',
    shortName: 'JFB Critical',
    author: 'Robert Jamieson, A. R. Fausset & David Brown',
    year: '1871',
    description:
      'Grammatical, philological, and historical analysis of every chapter.',
    helloaoId: 'jamieson-fausset-brown',
  },
  {
    id: 'gill',
    name: "John Gill's Exposition of the Entire Bible",
    shortName: 'John Gill',
    author: 'Dr. John Gill',
    year: '1763',
    description:
      'Deep rabbinical, Hebraic, and Greek lexical exposition of every verse.',
    helloaoId: 'john-gill',
  },
  {
    id: 'geneva',
    name: '1599 Geneva Study Bible Marginal Notes',
    shortName: 'Geneva 1599',
    author: 'Reformation Scholars at Geneva',
    year: '1599',
    description:
      'Historic Reformation study notes emphasizing covenant theology and grace.',
  },
  {
    id: 'elohim-exegetical',
    name: 'Elohim Exegetical & Asante Twi Theological Synthesis',
    shortName: 'Elohim & Twi Synthesis',
    author: 'Elohim Bible Hub Scholars',
    year: '2026',
    description:
      'Bridges original Hebrew/Greek morphology with Asante Twi (Twerɛ Kronkron) and parallel global translations.',
  },
];

export const BUNDLED_COMMENTARIES: VerseCommentary[] = [
  // ==========================================
  // EPHESIANS CHAPTER 1 (VERSES 1-23)
  // ==========================================
  {
    sourceId: 'matthew-henry',
    sourceName: "Matthew Henry's Complete Commentary",
    author: 'Matthew Henry (1706)',
    bookId: 'EPH',
    chapter: 1,
    verse: 1,
    title: 'Apostolic Commission by the Sovereign Will of God',
    content:
      'Paul asserts his apostolical authority as proceeding directly from the will (G2307 thelēma) of God, not human appointment. He addresses all believers at Ephesus as "saints" (G40 hagioi) and "faithful in Christ Jesus" (G4103 pistoi)—for none are true saints without true faith uniting them to Christ.',
    crossReferences: ['Romans 1:1', '1 Corinthians 1:1', '2 Corinthians 1:1', 'Colossians 1:1'],
  },
  {
    sourceId: 'jfb',
    sourceName: 'Jamieson-Fausset-Brown Commentary',
    author: 'A. R. Fausset (1871)',
    bookId: 'EPH',
    chapter: 1,
    verse: 2,
    title: 'Grace and Peace — The Twin Pillars of the Gospel',
    content:
      'Charis (G5485, Grace) is the Western Greek salutation elevated to divine unmerited favor; Eirēnē (G1515, Peace / Hebrew Shalom H7965) is the Eastern Hebraic blessing of complete spiritual reconciliation. Grace is the fountain in the Father’s heart; Peace is the stream flowing into the believer’s conscience through the Lord Jesus Christ.',
    crossReferences: ['Numbers 6:24-26', 'Romans 5:1', 'Galatians 1:3', 'Philippians 1:2'],
  },
  {
    sourceId: 'matthew-henry',
    sourceName: "Matthew Henry's Complete Commentary",
    author: 'Matthew Henry (1706)',
    bookId: 'EPH',
    chapter: 1,
    verse: 3,
    title: 'Every Spiritual Blessing in the Heavenly Places',
    content:
      'Verses 3–14 form one magnificent, unbroken golden sentence of doxology in the original Greek! God the Father is Eulogētos (G2128, worthy of highest adoration) because He has blessed us (G2127) with every spiritual blessing (G2129 eulogia pneumatikē G4152) in the heavenly places (G2032 epouraniois) in Christ. While Old Covenant promises emphasized earthly Canaan, New Covenant blessings are spiritual, eternal, and seated in the heavenly realm.',
    crossReferences: ['2 Corinthians 1:3', '1 Peter 1:3', 'Ephesians 1:20', 'Ephesians 2:6'],
  },
  {
    sourceId: 'elohim-exegetical',
    sourceName: 'Elohim Exegetical & Asante Twi Synthesis',
    author: 'Elohim Bible Hub Scholars',
    bookId: 'EPH',
    chapter: 1,
    verse: 3,
    title: 'Greek Eulogia (G2129) & Asante Twi "Honhom Mu Nhyira Nyinaa"',
    content:
      'In Asante Twi (Twerɛ Kronkron), Ephesians 1:3 reads: "Nhyira nka yɛn Awurade Yesu Kristo Nyankopɔn ne Agya a ɔnam Kristo so ahyira yɛn honhom mu nhyira nyinaa wɔ soro hɔnom." Notice how the Greek past aorist participle eulogēsas ("having already blessed us") is rendered "ahyira yɛn"—signifying a completed covenantal endowment in the heavenly sanctuary (soro hɔnom).',
    crossReferences: ['Ephesians 1:4', 'Ephesians 2:6', 'Colossians 3:1-3'],
  },
  {
    sourceId: 'gill',
    sourceName: "John Gill's Exposition of the Entire Bible",
    author: 'Dr. John Gill (1763)',
    bookId: 'EPH',
    chapter: 1,
    verse: 4,
    title: 'Chosen in Christ Before the Foundation of the World',
    content:
      'Exelexato (G1586, He chose us for Himself) in Him before katabolēs kosmou (G2602, the foundation of the world). Election is not grounded on foreseen human merit, for its purpose is "that we should be holy (G40) and without blame (G299 amōmous, like an unblemished sacrificial lamb) before Him in love (G26 agapē)." Holiness is the fruit and design of divine choosing.',
    crossReferences: ['John 15:16', 'Romans 8:29', '2 Thessalonians 2:13', '1 Peter 1:20'],
  },
  {
    sourceId: 'geneva',
    sourceName: '1599 Geneva Study Bible Notes',
    author: 'Geneva Reformers (1599)',
    bookId: 'EPH',
    chapter: 1,
    verse: 5,
    title: 'Predestined unto Adoption as Sons (Huiothesia)',
    content:
      'Having predestined us (G4309 proorisas) unto the adoption of children (G5206 huiothesia) by Jesus Christ to Himself, according to the good pleasure of His will (G2307). All rests upon the free, sovereign benevolence of the Father, to the praise of the glory of His grace (v. 6).',
    crossReferences: ['Romans 8:15', 'Romans 8:23', 'Galatians 4:5', '1 John 3:1'],
  },
  {
    sourceId: 'jfb',
    sourceName: 'Jamieson-Fausset-Brown Commentary',
    author: 'A. R. Fausset (1871)',
    bookId: 'EPH',
    chapter: 1,
    verse: 7,
    title: 'Redemption Through His Blood & Remission of Trespasses',
    content:
      'In Whom we have (present possession: echomen) redemption (G629 apolytrōsis—deliverance by payment of a costly ransom) through His blood (G129), even the forgiveness (G859 aphesis—sending away) of sins, measured not scantily, but "according to the riches of His grace" (G5485).',
    crossReferences: ['Colossians 1:14', 'Romans 3:24-25', 'Hebrews 9:12', '1 Peter 1:18-19'],
  },
  {
    sourceId: 'matthew-henry',
    sourceName: "Matthew Henry's Complete Commentary",
    author: 'Matthew Henry (1706)',
    bookId: 'EPH',
    chapter: 1,
    verse: 9,
    title: 'The Unveiled Mystery of His Will',
    content:
      'God has made known to us the mystery (G3466 mystērion) of His will—that in the dispensation of the fullness of the times (v. 10) He might gather together in one (G346 anakephalaioomai—sum up under one Head) all things in Christ, both which are in heaven and which are on earth.',
    crossReferences: ['Ephesians 3:3-9', 'Colossians 1:19-20', 'Philippians 2:9-11'],
  },
  {
    sourceId: 'gill',
    sourceName: "John Gill's Exposition of the Entire Bible",
    author: 'Dr. John Gill (1763)',
    bookId: 'EPH',
    chapter: 1,
    verse: 13,
    title: 'Sealed with the Holy Spirit of Promise',
    content:
      'Upon hearing the word of truth (G231), the gospel of your salvation (G4991), and believing in Christ, you were sealed (G4972 sphragizō—marked with the King’s royal signet ring of ownership and security) with the Holy Spirit of promise, who is the earnest (G728 arrabōn, v. 14—pledge and first installment) of our inheritance until the redemption of the purchased possession.',
    crossReferences: ['2 Corinthians 1:22', '2 Corinthians 5:5', 'Ephesians 4:30'],
  },
  {
    sourceId: 'matthew-henry',
    sourceName: "Matthew Henry's Complete Commentary",
    author: 'Matthew Henry (1706)',
    bookId: 'EPH',
    chapter: 1,
    verse: 17,
    title: 'Apostolic Prayer for the Spirit of Wisdom and Revelation',
    content:
      'Even those who are already blessed and sealed with the Spirit need further illumination: Paul prays that "the Father of glory may give to you the spirit of wisdom (G4678 sophia) and revelation in the full knowledge (G1922 epignōsis) of Him, the eyes of your understanding (kardia) being enlightened (v. 18)."',
    crossReferences: ['Colossians 1:9-11', 'Psalm 119:18', '2 Corinthians 4:6'],
  },
  {
    sourceId: 'jfb',
    sourceName: 'Jamieson-Fausset-Brown Commentary',
    author: 'A. R. Fausset (1871)',
    bookId: 'EPH',
    chapter: 1,
    verse: 19,
    title: 'Four Greek Terms for Resurrection Power',
    content:
      'To express the inexhaustible omnipotence of God toward us who believe, Paul piles up four distinct Greek nouns for power in verses 19–20: (1) Dynamis (G1411, inherent capability), (2) Energeia (G1753, effectual working), (3) Kratos (G2904, conquering dominion), and (4) Ischys (G2479, mighty strength)—all demonstrated when He raised Christ from the dead and seated Him at His right hand in the heavenly places!',
    crossReferences: ['Ephesians 3:20', 'Philippians 3:10', 'Colossians 2:12', 'Psalm 110:1'],
  },
  {
    sourceId: 'elohim-exegetical',
    sourceName: 'Elohim Exegetical & Asante Twi Synthesis',
    author: 'Elohim Bible Hub Scholars',
    bookId: 'EPH',
    chapter: 1,
    verse: 22,
    title: 'Christ the Supreme Head Over All Things to the Church',
    content:
      'In Ephesians 1:22–23, God placed all things under Christ’s feet and gave Him to be Head (G2776 kephalē / Twi: "Ti") over all things to the Church (G1577 ekklēsia / Twi: "Asafo"), which is His body (G4983 sōma), the fullness (G4138 plērōma) of Him who fills all in all.',
    crossReferences: ['Ephesians 4:15-16', 'Ephesians 5:23', 'Colossians 1:18', '1 Corinthians 12:27'],
  },

  // ==========================================
  // GENESIS CHAPTER 1
  // ==========================================
  {
    sourceId: 'matthew-henry',
    sourceName: "Matthew Henry's Complete Commentary",
    author: 'Matthew Henry (1706)',
    bookId: 'GEN',
    chapter: 1,
    verse: 1,
    title: 'Bereshit Bara Elohim — In the Beginning God Created',
    content:
      'The first verse of the Bible lays the foundation of all true theology: Elohim (H430), the eternal, self-existent Creator, brought the heavens and the earth into being out of nothing (H1254 bara) in the beginning of time (H7225 reshit).',
    crossReferences: ['John 1:1-3', 'Hebrews 11:3', 'Psalm 33:6', 'Colossians 1:16'],
  },
  {
    sourceId: 'elohim-exegetical',
    sourceName: 'Elohim Exegetical & Asante Twi Synthesis',
    author: 'Elohim Bible Hub Scholars',
    bookId: 'GEN',
    chapter: 1,
    verse: 1,
    title: 'Elohim (H430) & Asante Twi "Mfitiaseɛ No Onyankopɔn Bɔɔ Ɔsoro Ne Asase"',
    content:
      'In Hebrew, אֱלֹהִים (Elohim, H430) is a plural of majesty paired with the singular verb בָּרָא (bara, H1254). In the Asante Twi Twerɛ Kronkron, "Onyankopɔn" (The Supreme Great One) captures the majestic sovereignty of the Creator who speaks light ("Hann mmra", v. 3) into cosmic order.',
    crossReferences: ['Genesis 1:3', 'Isaiah 45:18', 'Revelation 4:11'],
  },

  // ==========================================
  // PSALM CHAPTER 23
  // ==========================================
  {
    sourceId: 'matthew-henry',
    sourceName: "Matthew Henry's Complete Commentary",
    author: 'Matthew Henry (1706)',
    bookId: 'PSA',
    chapter: 23,
    verse: 1,
    title: 'YHWH Ro‘i — The LORD Is My Shepherd; I Shall Not Want',
    content:
      'David, himself a shepherd-king, rejoices that the Eternal LORD (H3068 YHWH) is his personal Shepherd (H7462 ra‘ah). From this premise follows the triumphant conclusion: "I shall not want" (lo echsar)—I shall lack no good thing for body or soul, in time or eternity.',
    crossReferences: ['John 10:11', 'Hebrews 13:20', '1 Peter 2:25', 'Ezekiel 34:11-15'],
  },

  // ==========================================
  // JOHN CHAPTER 1
  // ==========================================
  {
    sourceId: 'jfb',
    sourceName: 'Jamieson-Fausset-Brown Commentary',
    author: 'David Brown (1871)',
    bookId: 'JHN',
    chapter: 1,
    verse: 1,
    title: 'The Eternal Logos — Distinct in Person, One in Essence with God',
    content:
      'En archē ēn ho Logos (G3056): "In the beginning WAS the Word" (imperfect tense denoting eternal pre-existence prior to creation); "and the Word was WITH God" (pros ton Theon—face-to-face personal communion with the Father); "and the Word WAS God" (kai Theos ēn ho Logos—sharing the full divine essence).',
    crossReferences: ['Genesis 1:1', 'John 1:14', 'Philippians 2:6', 'Hebrews 1:1-3', 'Revelation 19:13'],
  },

  // ==========================================
  // ROMANS CHAPTER 8
  // ==========================================
  {
    sourceId: 'matthew-henry',
    sourceName: "Matthew Henry's Complete Commentary",
    author: 'Matthew Henry (1706)',
    bookId: 'ROM',
    chapter: 8,
    verse: 1,
    title: 'No Condemnation in Christ Jesus',
    content:
      'Romans 8 begins with "no condemnation" (ouden ara nyn katakrima, v. 1) and concludes with "no separation" (v. 38–39) from the love of God which is in Christ Jesus our Lord!',
    crossReferences: ['John 3:18', 'John 5:24', 'Romans 5:1', 'Galatians 5:16'],
  },
];

export function getCommentariesForChapter(
  bookId: string,
  chapter: number
): VerseCommentary[] {
  const cleanId = (bookId || 'EPH').toUpperCase();
  const matches = BUNDLED_COMMENTARIES.filter(
    (c) => c.bookId === cleanId && c.chapter === chapter
  );
  if (matches.length > 0) {
    return matches;
  }
  return [
    {
      sourceId: 'elohim-exegetical',
      sourceName: 'Elohim Exegetical & Parallel Synthesis',
      author: 'Elohim Bible Hub Scholars',
      bookId: cleanId,
      chapter,
      verse: 1,
      title: `Exegetical Overview of ${cleanId} Chapter ${chapter}`,
      content: `Compare the parallel language columns above to observe how classical English (NKJV/KJV/BSB), West African (Asante Twi Twerɛ Kronkron, Akuapem Twi, Ewe, Yoruba, Hausa), and European/Asian translations render the theological structure of ${cleanId} ${chapter}. Tap any Strong's badge to inspect the Hebrew or Greek lexicon root.`,
      crossReferences: ['Ephesians 1:3', 'Genesis 1:1', 'Psalm 23:1', 'John 1:1'],
    },
  ];
}
