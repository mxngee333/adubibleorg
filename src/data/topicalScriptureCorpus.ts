export interface TopicalVerseItem {
  reference: string;
  bookSlug: string;
  chapter: number;
  verse: number;
  nkjv: string;
  kjv: string;
  twi: string;
  strongsNotes: string;
}

export interface TopicalHubEntry {
  slug: string;
  title: string;
  h1: string;
  metaDescription: string;
  icon: string;
  tagline: string;
  historicalExposition: string;
  hebrewGreekRoots: string;
  verses: TopicalVerseItem[];
  faqs: Array<{ q: string; a: string }>;
}

export const TOPICAL_HUBS_CORPUS: TopicalHubEntry[] = [
  {
    slug: 'healing',
    title: 'Bible Verses for Healing — Physical, Emotional & Spiritual Restoration | AduBible.org®',
    h1: 'Bible Verses for Healing, Health & Divine Restoration',
    metaDescription:
      'Read and study the most powerful Bible verses for healing (Psalm 103:2-3, Isaiah 53:5, Jeremiah 17:14, James 5:14-16) across NKJV, KJV, and Asante Twi with 24kHz Studio Audio on AduBible.org®.',
    icon: '🌿',
    tagline: 'YHWH-Rapha: The LORD God Who Heals Every Infirmity and Restores the Soul',
    historicalExposition:
      'Throughout the sacred scriptures of both the Old and New Testaments, healing is revealed not as an occasional benevolent exception, but as an intrinsic covenant attribute of the Living God. In Exodus 15:26, God reveals His redemptive memorial name to Israel: YHWH-Rapha ("I am the LORD who heals you"). The Hebrew verb rapha encompasses total restoration—mending broken bones, reviving diseased tissues, lifting psychological depression, and binding fractured spirits. In the prophetic ministry of Isaiah 53:5, healing is forever anchored into the substitutionary atonement of the Messiah: "By His stripes we are healed." When Jesus of Nazareth walked the shores of Galilee, His healing miracles (Matthew 8:16-17) were not merely displays of divine sovereignty, but the tangible invasion of God\'s kingdom overcoming the corrupting forces of sickness, death, and human vulnerability.',
    hebrewGreekRoots:
      'Key Lexicon: Rapha (רָפָא, Strong’s H7495 — To heal, cure, make whole, physician), Iaomai (ἰάομαι, Strong’s G2390 — To heal spiritually and physically), Therapeuō (θεραπεύω, Strong’s G2323 — To serve, relieve, restore to health).',
    verses: [
      {
        reference: 'Psalm 103:2–3',
        bookSlug: 'psalms',
        chapter: 103,
        verse: 2,
        nkjv: 'Bless the LORD, O my soul, and forget not all His benefits: who forgives all your iniquities, who heals all your diseases.',
        kjv: 'Bless the LORD, O my soul, and forget not all his benefits: who forgiveth all thine iniquities; who healeth all thy diseases;',
        twi: 'Nhyira Awurade, me kra, na mfrɔ n’adɔeɛ nyinaa: Ɔno na ɔfiri wo bɔne nyinaa kyɛ wo, na ɔsa wo yareɛ nyinaa;',
        strongsNotes: 'Rapha (H7495) encompasses holistic disease healing coupled with forgiveness (Salach H5545).',
      },
      {
        reference: 'Isaiah 53:5',
        bookSlug: 'isaiah',
        chapter: 53,
        verse: 5,
        nkjv: 'But He was wounded for our transgressions, He was bruised for our iniquities; the chastisement for our peace was upon Him, and by His stripes we are healed.',
        kjv: 'But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.',
        twi: 'Na wɔpirapiraa no yɛn mmarato nti, wɔbɔbɔɔ no yɛn amumuyɛ nti; asomdwoeɛ asotwe daa ne so, na ne mpirepem na yɛnam so anya ayaresa.',
        strongsNotes: 'Chabburah (H2250 — stripe/scourge wound) yields universal healing (Rapha H7495).',
      },
      {
        reference: 'Jeremiah 17:14',
        bookSlug: 'jeremiah',
        chapter: 17,
        verse: 14,
        nkjv: 'Heal me, O LORD, and I shall be healed; save me, and I shall be saved, for You are my praise.',
        kjv: 'Heal me, O LORD, and I shall be healed; save me, and I shall be saved: for thou art my praise.',
        twi: 'Sa me yareɛ, Awurade, na m’aduru bɛyɛ adwuma; gye me, na mɛgye me ho, na wone m’ayeyie.',
        strongsNotes: 'Yasha (H3467 — Sovereign rescue and deliverance) paired with Rapha (H7495).',
      },
      {
        reference: 'James 5:14–15',
        bookSlug: 'james',
        chapter: 5,
        verse: 14,
        nkjv: 'Is anyone among you sick? Let him call for the elders of the church, and let them pray over him, anointing him with oil in the name of the Lord.',
        kjv: 'Is any sick among you? let him call for the elders of the church; and let them pray over him, anointing him with oil in the name of the Lord:',
        twi: 'Mo mu bi yare anaa? Ɔmfrɛ asafo mu mpanimfoɔ, na wɔmmɔ mpaeɛ mma no, na wɔnsra no ngo wɔ Awurade din mu.',
        strongsNotes: 'Astheneō (G770 — to be physically frail/feeble), Proseucomai (G4336 — prayer of faith).',
      },
    ],
    faqs: [
      {
        q: 'What is the most famous Bible verse for healing?',
        a: 'The most recited and studied healing verse in the Bible is Isaiah 53:5: "By His stripes we are healed," reaffirmed in 1 Peter 2:24. Other foundational passages include Psalm 103:2-3 and Exodus 15:26 ("I am the LORD who heals you").',
      },
      {
        q: 'How do you pray for healing according to scripture?',
        a: 'Scriptural prayer for healing combines thanksgiving for God’s character (Psalm 103), standing upon the promises of Christ’s atonement (Isaiah 53:5), and following the apostolic pattern of faith, anointing, and collective prayer through church elders (James 5:14-16).',
      },
      {
        q: 'Can I listen to these healing scriptures in parallel audio?',
        a: 'Yes. On AduBible.org, you can listen to all healing chapters and verses recited by 24kHz Google Studio Voices in English (NKJV, KJV), Asante Twi, French, and Spanish with synchronized highlighting.',
      },
    ],
  },
  {
    slug: 'strength',
    title: 'Bible Verses for Strength in Hard Times — Weariness & Overcoming | AduBible.org®',
    h1: 'Bible Verses for Strength in Difficult Times & Exhaustion',
    metaDescription:
      'Find daily courage and renewal with powerful Bible verses for strength (Isaiah 40:31, Philippians 4:13, Psalm 46:1, 2 Corinthians 12:9) in NKJV, KJV, and Asante Twi on AduBible.org®.',
    icon: '⚡',
    tagline: 'Exchange Human Exhaustion for Divine Invincible Power',
    historicalExposition:
      'Human strength is inherently finite, susceptible to fatigue, emotional breakdown, and circumstantial crises. The biblical worldview contrasts the frailty of human flesh with the inexhaustible vigor of the Creator. In Isaiah 40:28-31, the prophet writes to a demoralized exilic community, reminding them that the Creator of the ends of the earth neither faints nor grows weary. Spiritual strength in scripture is rarely portrayed as innate muscular self-reliance; rather, it is described as an "exchange"—waiting upon Yahweh (qavah) so that His infinite energy infuses human limitation. In the New Testament, the Apostle Paul discovers that Christ’s divine power (dynamis) reaches its highest operational perfection not in human arrogance, but in conscious weakness (2 Corinthians 12:9-10).',
    hebrewGreekRoots:
      'Key Lexicon: Koach (כֹּחַ, Strong’s H3581 — Inherent strength, power, capacity), Chazaq (חָזַק, Strong’s H2388 — To seize hold, become firm and courageous), Dynamis (δύναμις, Strong’s G1411 — Miraculous, explosive power), Ischyō (ἰσχύω, Strong’s G2480 — Prevailing strength).',
    verses: [
      {
        reference: 'Isaiah 40:31',
        bookSlug: 'isaiah',
        chapter: 40,
        verse: 31,
        nkjv: 'But those who wait on the LORD Shall renew their strength; They shall mount up with wings like eagles, They shall run and not be weary, They shall walk and not faint.',
        kjv: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.',
        twi: 'Na wɔn a wɔtwɛn Awurade no bɛnya ahoɔden foforɔ, wɔbɛforo soro sɛ akɔdeɛ, wɔbɛtu mmirika na wɔrenbrɛ, wɔbɛnante na wɔrentɔ piti.',
        strongsNotes: 'Chalaph (H2498 — To exchange), Nesher (H5404 — Eagle soaring effortlessly).',
      },
      {
        reference: 'Philippians 4:13',
        bookSlug: 'philippians',
        chapter: 4,
        verse: 13,
        nkjv: 'I can do all things through Christ who strengthens me.',
        kjv: 'I can do all things through Christ which strengtheneth me.',
        twi: 'Metumi nnoɔma nyinaa yɛ wɔ Kristo a ɔhyɛ me den no mu.',
        strongsNotes: 'Endynamoō (G1743 — To pour internal divine power into the spirit).',
      },
      {
        reference: 'Psalm 46:1',
        bookSlug: 'psalms',
        chapter: 46,
        verse: 1,
        nkjv: 'God is our refuge and strength, a very present help in trouble.',
        kjv: 'God is our refuge and strength, a very present help in trouble.',
        twi: 'Onyankopɔn ne yɛn guankɔbea ne yɛn ahoɔden, mmoa a ɔwɔ hɔ tɔɔte wɔ ahohiahia mu.',
        strongsNotes: 'Machaseh (H4268 — High rock shelter), Oz (H5797 — Mighty fortified strength).',
      },
      {
        reference: '2 Corinthians 12:9',
        bookSlug: '2-corinthians',
        chapter: 12,
        verse: 9,
        nkjv: 'And He said to me, “My grace is sufficient for you, for My strength is made perfect in weakness.” Therefore most gladly I will rather boast in my infirmities, that the power of Christ may rest upon me.',
        kjv: 'And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness. Most gladly therefore will I rather glory in my infirmities, that the power of Christ may rest upon me.',
        twi: 'Na ɔsee me sɛ: M’adom dɔɔso ma wo, na m’ahoɔden wie pɛyɛ wɔ mmerɛwyɛ mu.',
        strongsNotes: 'Arkeō (G714 — Sufficient, overflowing fullness), Teleō (G5055 — Brought to full fruition).',
      },
    ],
    faqs: [
      {
        q: 'What is the best Bible verse for physical and emotional exhaustion?',
        a: 'Isaiah 40:29-31 is the biblical masterpiece for exhaustion: "He gives power to the weak, and to those who have no might He increases strength... Those who wait on the LORD shall renew their strength."',
      },
      {
        q: 'What does Philippians 4:13 truly mean in context?',
        a: 'In context (Philippians 4:11-12), Paul is writing about contentment across poverty, hunger, prosperity, or hardship. Christ infuses supernatural spiritual resilience to endure all life seasons victoriously.',
      },
    ],
  },
  {
    slug: 'protection',
    title: 'Bible Verses for Protection, Spiritual Warfare & Safety | AduBible.org®',
    h1: 'Bible Verses for Divine Protection, Deliverance & Safety',
    metaDescription:
      'Dwell under the shadow of the Almighty with top Bible verses for protection (Psalm 91:1-4, Psalm 35:1-3, Psalm 121:7-8, 2 Thessalonians 3:3) in parallel study on AduBible.org®.',
    icon: '🛡️',
    tagline: 'Under the Shadow of Shaddai: Shield, Buckler, and Invincible Fortress',
    historicalExposition:
      'In the ancient Near East, life was fraught with desert bandits, venomous serpents, pestilence, and sudden military siege. Scripture captures this reality while unveiling God as the supreme military Defender of the righteous. Psalm 91 presents God as both a towering fortress (metsudah) and a tender parent eagle sheltering vulnerable chicks beneath protective pinions. In Psalm 35, David appeals to the celestial courtroom, asking God to wield the shield (magen) and buckler (tsinnah) against predatory adversaries. Divine protection in scripture is not the absence of spiritual warfare, but the absolute covenant certainty that no weapon formed against the believer will prosper (Isaiah 54:17).',
    hebrewGreekRoots:
      'Key Lexicon: Magen (מָגֵן, Strong’s H4043 — Handheld buckler, defensive covering), Tsinnah (צִנָּה, Strong’s H6793 — Massive full-body shield), Sether (סֵתֶר, Strong’s H5643 — Secret hiding place), Phylassō (φυλάσσω, Strong’s G5442 — To guard as a sentinel).',
    verses: [
      {
        reference: 'Psalm 91:1–4',
        bookSlug: 'psalms',
        chapter: 91,
        verse: 1,
        nkjv: 'He who dwells in the secret place of the Most High shall abide under the shadow of the Almighty. I will say of the LORD, “He is my refuge and my fortress; my God, in Him I will trust.”',
        kjv: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust.',
        twi: 'Deɛ ɔte Ɔsorosoroni no kokoamuhɔ no bɛtena Otumfoɔ no sunsuma ase. Mɛka afa Awurade ho sɛ: Ɔne me guankɔbea ne m’aban dennen; me Nyankopɔn a mede me ho to no so.',
        strongsNotes: 'Four divine names: Elyon (H5945), Shaddai (H7706), YHWH (H3068), Elohim (H430).',
      },
      {
        reference: 'Psalm 121:7–8',
        bookSlug: 'psalms',
        chapter: 121,
        verse: 7,
        nkjv: 'The LORD shall preserve you from all evil; He shall preserve your soul. The LORD shall preserve your going out and your coming in from this time forth, and even forevermore.',
        kjv: 'The LORD shall preserve thee from all evil: he shall preserve thy soul. The LORD shall preserve thy going out and thy coming in from this time forth, and even for evermore.',
        twi: 'Awurade bɛbɔ wo ho ban afiri bɔne nyinaa ho; ɔbɛbɔ wo kra ho ban. Awurade bɛbɔ wo firi ne wo ba ho ban firi sesie kɔsi daa.',
        strongsNotes: 'Shamar (H8104 — To keep, preserve, protect as an attentive watchman).',
      },
    ],
    faqs: [
      {
        q: 'What is the most powerful psalm for protection against spiritual attacks?',
        a: 'The Book of Psalms 91 and Psalm 35 are historically and theologically recognized as the preeminent prayers of divine protection, shielding the soul from unseen spiritual snares and nocturnal terrors.',
      },
    ],
  },
  {
    slug: 'peace',
    title: 'Bible Verses About Peace, Calming Anxiety & Quiet Rest | AduBible.org®',
    h1: 'Bible Verses About Peace & Conquering Anxiety',
    metaDescription:
      'Overcome fear, anxiety, and sleepless nights with comforting Bible verses on peace (Philippians 4:6-7, John 14:27, Isaiah 26:3, Colossians 3:15) on AduBible.org®.',
    icon: '🕊️',
    tagline: 'Shalom: The Divine Wholeness That Surpasses Human Understanding',
    historicalExposition:
      'The biblical concept of peace is far richer than the modern Western definition, which merely implies the temporary absence of military conflict or psychological stress. The Hebrew term Shalom encompasses cosmic completeness, sound health, safety, reconciliation, and unbroken harmony with God and community. In the Upper Room on the eve of the crucifixion, Jesus bequeathed this unique heritage to His disciples: "Peace I leave with you, My peace I give to you; not as the world gives do I give to you. Let not your heart be troubled, neither let it be afraid" (John 14:27). Biblical peace is an anchor in the storm, grounded in the resurrected Prince of Peace (Sar Shalom).',
    hebrewGreekRoots:
      'Key Lexicon: Shalom (שָׁלוֹם, Strong’s H7965 — Completeness, wholeness, prosperity, tranquility), Eirēnē (εἰρήνη, Strong’s G1515 — Peace, concord, quiet tranquility of soul).',
    verses: [
      {
        reference: 'Philippians 4:6–7',
        bookSlug: 'philippians',
        chapter: 4,
        verse: 6,
        nkjv: 'Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God; and the peace of God, which surpasses all understanding, will guard your hearts and minds through Christ Jesus.',
        kjv: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
        twi: 'Munnnwen biribiara ho; na mmom biribiara mu momfa mpaebɔ ne nkotosrɛ ne aseda nna mo abisadeɛ adi nkyerɛ Onyankopɔn. Na Onyankopɔn asomdwoeɛ a ɛboro nteaseɛ nyinaa so no bɛkora mo koma ne mo adwene so wɔ Kristo Yesu mu.',
        strongsNotes: 'Phroureō (G5432 — Garrison as armed sentinels guarding a royal citadel).',
      },
      {
        reference: 'John 14:27',
        bookSlug: 'john',
        chapter: 14,
        verse: 27,
        nkjv: 'Peace I leave with you, My peace I give to you; not as the world gives do I give to you. Let not your heart be troubled, neither let it be afraid.',
        kjv: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.',
        twi: 'Asomdwoeɛ na megya mo; m’asomdwoeɛ na mede ma mo; ɛnyɛ sɛdeɛ wiase ma no na me de ma mo. Mma mo koma nntu, na munsuro nso.',
        strongsNotes: 'Tarassō (G5015 — To agitate, disturb, shake with fear).',
      },
    ],
    faqs: [
      {
        q: 'How does Philippians 4:6-7 advise dealing with severe anxiety?',
        a: 'The apostolic formula requires: 1) Refusing to dwell in anxious rumination, 2) Transforming every specific worry into earnest prayer and supplication, 3) Infusing gratitude, and 4) Allowing the transcendent peace of God to garrison (guard) the mind.',
      },
    ],
  },
  {
    slug: 'thanksgiving',
    title: 'Bible Verses on Thanksgiving, Gratitude & Praise | AduBible.org®',
    h1: 'Bible Verses on Thanksgiving, Gratitude & Heartfelt Praise',
    metaDescription:
      'Enter His gates with praise! Discover transformative Bible verses on thanksgiving (Psalm 100:4, 1 Thessalonians 5:18, Psalm 107:1, Colossians 3:15-17) on AduBible.org®.',
    icon: '🙌',
    tagline: 'Todah: The Sacrifice of Praise That Unlocks Heavenly Gateways',
    historicalExposition:
      'Thanksgiving is the universal gateway into communion with God. In the Levitical sacrificial system, the Todah (sacrifice of thanksgiving) was celebrated when a worshiper had experienced divine deliverance from death, illness, or sea storms. In Psalm 100:4, the worshiper is commanded to enter His gates with thanksgiving and into His courts with praise. In the New Testament, gratitude is not contingent upon ideal external circumstances; rather, 1 Thessalonians 5:18 teaches: "In everything give thanks; for this is the will of God in Christ Jesus for you." Gratitude shifts the human heart from scarcity to overflowing covenant abundance.',
    hebrewGreekRoots:
      'Key Lexicon: Todah (תּוֹדָה, Strong’s H8426 — Confession, thanksgiving, sacrificial praise), Eucharistia (εὐχαριστία, Strong’s G2169 — Gratitude, thankfulness, the Eucharist).',
    verses: [
      {
        reference: 'Psalm 100:4',
        bookSlug: 'psalms',
        chapter: 100,
        verse: 4,
        nkjv: 'Enter into His gates with thanksgiving, and into His courts with praise. Be thankful to Him, and bless His name.',
        kjv: 'Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name.',
        twi: 'Momfa aseda nwura ne mpono ano, ne ayeyie nwura n’adidibea; monna no ase, na monhyira ne din.',
        strongsNotes: 'Todah (H8426) paired with Tehillah (H8416 — spontaneous vocal praise).',
      },
      {
        reference: '1 Thessalonians 5:18',
        bookSlug: '1-thessalonians',
        chapter: 5,
        verse: 18,
        nkjv: 'In everything give thanks; for this is the will of God in Christ Jesus for you.',
        kjv: 'In every thing give thanks: for this is the will of God in Christ Jesus concerning you.',
        twi: 'Biribiara mu monna ase; na yei ne Onyankopɔn pɛ ma mo wɔ Kristo Yesu mu.',
        strongsNotes: 'Eucharisteō (G2168 — Give heartfelt thanks for divine grace).',
      },
    ],
    faqs: [
      {
        q: 'Why does the Bible command giving thanks in everything?',
        a: 'Because thanksgiving recognizes God’s sovereign goodness even in challenging seasons, aligning the believer’s spirit with God’s overarching redemptive plan (Romans 8:28).',
      },
    ],
  },
  {
    slug: 'faith',
    title: 'Bible Verses on Faith, Trusting God & Mountain-Moving Belief | AduBible.org®',
    h1: 'Bible Verses on Faith, Trust & Mountain-Moving Power',
    metaDescription:
      'Ignite your spiritual confidence with foundational Bible verses on faith (Hebrews 11:1, Proverbs 3:5-6, Mark 11:22-24, Romans 10:17) in parallel on AduBible.org®.',
    icon: '🔥',
    tagline: 'Pistis: The Substance of Things Hoped For and Reality of Things Unseen',
    historicalExposition:
      'Biblical faith is never blind credulity or wishful optimism; it is the firm, resolute confidence in the verified character and sworn promises of God. In Hebrews 11:1, faith (pistis) is defined as the hypostasis—the underlying legal title-deed and concrete reality—of things hoped for. From Abraham stepping out into an unknown inheritance to David facing Goliath in the name of the Lord of Hosts, faith acts upon divine revelation before physical confirmation appears. In the teaching of Jesus, faith as small as a mustard seed possesses the spiritual leverage to uproot mountainous obstacles (Matthew 17:20).',
    hebrewGreekRoots:
      'Key Lexicon: Emunah (אֱמוּנָה, Strong’s H530 — Firmness, steadfast fidelity, truth), Pistis (πίστις, Strong’s G4102 — Faith, conviction, holy persuasion), Pisteuō (πιστεύω, Strong’s G4100 — To commit oneself to, believe).',
    verses: [
      {
        reference: 'Hebrews 11:1',
        bookSlug: 'hebrews',
        chapter: 11,
        verse: 1,
        nkjv: 'Now faith is the substance of things hoped for, the evidence of things not seen.',
        kjv: 'Now faith is the substance of things hoped for, the evidence of things not seen.',
        twi: 'Na gyidie ne nnoɔma a wɔhwɛ kwan no nnyinasoɔ, nnoɔma a wɔnhunu ho adanseɛ.',
        strongsNotes: 'Hypostasis (G5287 — Firm foundation/title deed), Elenchos (G1650 — Convincing proof).',
      },
      {
        reference: 'Romans 10:17',
        bookSlug: 'romans',
        chapter: 10,
        verse: 17,
        nkjv: 'So then faith comes by hearing, and hearing by the word of God.',
        kjv: 'So then faith cometh by hearing, and hearing by the word of God.',
        twi: 'Enti gyidie firi asɛm a wɔteɛ mu, na asɛm a wɔteɛ no nso nam Kristo asɛm so.',
        strongsNotes: 'Akoē (G189 — Attentive hearing), Rhēma (G4487 — The spoken, living utterance of God).',
      },
    ],
    faqs: [
      {
        q: 'How does a person grow and increase their faith according to scripture?',
        a: 'According to Romans 10:17, faith grows by saturating the mind in the hearing and meditation of the Word of God (Rhēma), and through putting faith into obedience (James 2:17).',
      },
    ],
  },
  {
    slug: 'love',
    title: 'Bible Verses on Love (Agape), Compassion & Grace | AduBible.org®',
    h1: 'Bible Verses on Love: Agape, Covenant Fidelity & Grace',
    metaDescription:
      'Explore the depths of divine love with essential Bible verses on love (1 Corinthians 13:4-8, John 3:16, 1 John 4:7-19, Romans 5:8) in parallel on AduBible.org®.',
    icon: '💛',
    tagline: 'Agape: The Unconditional, Self-Sacrificing Nature of the Godhead',
    historicalExposition:
      'The New Testament elevated the Greek language by adopting the relatively rare word Agape to describe the transcendent, uncalculated love of God. Unlike Eros (romantic attraction) or Phileo (brotherly affection), Agape is not provoked by the beauty or worthiness of the recipient; it originates solely in the holy nature of God Himself. "God is love" (1 John 4:8) defines the essence of the divine nature. The crowning demonstration of this love took place on Calvary, where Christ died for humanity while we were still sinners (Romans 5:8). In 1 Corinthians 13, the Apostle Paul presents love as the indispensable supreme virtue that outlasts prophecies, tongues, and all temporal gifts.',
    hebrewGreekRoots:
      'Key Lexicon: Ahavah (אַהֲבָה, Strong’s H160 — Covenant love, ardent affection), Chesed (חֶסֶד, Strong’s H2617 — Steadfast mercy, lovingkindness), Agapē (ἀγάπη, Strong’s G26 — Sacrificial, unconditional love).',
    verses: [
      {
        reference: '1 Corinthians 13:4–7',
        bookSlug: '1-corinthians',
        chapter: 13,
        verse: 4,
        nkjv: 'Love suffers long and is kind; love does not envy; love does not parade itself, is not puffed up; does not behave rudely, does not seek its own, is not provoked, thinks no evil; does not rejoice in iniquity, but rejoices in the truth; bears all things, believes all things, hopes all things, endures all things.',
        kjv: 'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up, doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil;',
        twi: 'Ɔdɔ to ne bo ase, ɔdɔ yam ye; ɔdɔ nyɛ ninkunu; ɔdɔ nhoahoa ne ho, ɔnhyɛ ne ho so;',
        strongsNotes: 'Agapē (G26) is the eternal character of God manifest in daily relationships.',
      },
      {
        reference: '1 John 4:18',
        bookSlug: '1-john',
        chapter: 4,
        verse: 18,
        nkjv: 'There is no fear in love; but perfect love casts out fear, because fear involves torment. But he who fears has not been made perfect in love.',
        kjv: 'There is no fear in love; but perfect love casteth out fear: because fear hath torment. He that feareth is not made perfect in love.',
        twi: 'Ehu nni ɔdɔ mu, na mmom ɔdɔ a ɛwie pɛyɛ no pam ehu, ɛfiri sɛ ehu mu na asotwe wɔ. Na deɛ ɔsuro no nwiee pɛyɛ ɔdɔ mu.',
        strongsNotes: 'Teleios (G5046 — Complete, mature, reaching full objective), Phobos (G5401 — Paralyzing dread).',
      },
    ],
    faqs: [
      {
        q: 'What does "perfect love casts out fear" mean?',
        a: 'When an individual comprehends how deeply and unreservedly they are loved and accepted by God in Christ, the anxious dread of condemnation, punishment, and rejection vanishes completely.',
      },
    ],
  },
  {
    slug: 'hope',
    title: 'Bible Verses for Hope, Future & Renewal | AduBible.org®',
    h1: 'Bible Verses for Hope, Spiritual Renewal & A Bright Future',
    metaDescription:
      'Revive your spirit with powerful Bible verses for hope (Jeremiah 29:11, Romans 15:13, Psalm 42:11, Lamentations 3:22-24) studied in parallel on AduBible.org®.',
    icon: '⚓',
    tagline: 'An Anchor for the Soul, Both Sure and Steadfast',
    historicalExposition:
      'In biblical theology, hope (elpis / tiqvah) is never an uncertain wish ("I hope it doesn\'t rain"). It is the confident, joyful expectation of good based upon the sworn covenant promises of God. In Hebrews 6:19, hope is called the "anchor of the soul, both sure and steadfast, and which enters the Presence behind the veil." When Jeremiah stood amid the smoldering ruins of Jerusalem, he proclaimed the everlasting faithfulness of Yahweh: "His mercies are new every morning; great is Your faithfulness" (Lamentations 3:23). Hope provides supernatural ballast when earthly foundations shake.',
    hebrewGreekRoots:
      'Key Lexicon: Tiqvah (תִּקְוָה, Strong’s H8615 — Cord of expectation, hope), Yachal (יָחַל, Strong’s H3176 — To wait with patient expectation), Elpis (ἐλπίς, Strong’s G1680 — Favorable and confident expectation).',
    verses: [
      {
        reference: 'Jeremiah 29:11',
        bookSlug: 'jeremiah',
        chapter: 29,
        verse: 11,
        nkjv: '“For I know the thoughts that I think toward you,” says the LORD, “thoughts of peace and not of evil, to give you a future and a hope.”',
        kjv: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.',
        twi: 'Na menim adwene a medwene fa mo ho, Awurade na ɔseɛ, asomdwoeɛ adwene na ɛnyɛ bɔne, sɛ mede awieeɛ ne anidasoɔ bɛma mo.',
        strongsNotes: 'Shalom (H7965 — Peace, health, prosperity) and Tiqvah (H8615 — Sure hope).',
      },
      {
        reference: 'Romans 15:13',
        bookSlug: 'romans',
        chapter: 15,
        verse: 13,
        nkjv: 'Now may the God of hope fill you with all joy and peace in believing, that you may abound in hope by the power of the Holy Spirit.',
        kjv: 'Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.',
        twi: 'Na anidasoɔ Nyankopɔn no nhyɛ mo ma wɔ anigyeɛ ne asomdwoeɛ nyinaa mu wɔ gyidie mu, na moabu so anidasoɔ mu Honhom Kronkron tumi mu.',
        strongsNotes: 'Perisseuō (G4052 — To overflow, abound superabundantly).',
      },
    ],
    faqs: [
      {
        q: 'Why is hope compared to an anchor in the Bible?',
        a: 'Because like a ship’s anchor lodged into the ocean floor during violent tempests, biblical hope is fastened directly into the throne room of God, keeping the human heart from drifting into despair.',
      },
    ],
  },
  {
    slug: 'forgiveness',
    title: 'Bible Verses on Forgiveness, Mercy & Grace | AduBible.org®',
    h1: 'Bible Verses on Forgiveness, Cleansing & Reconciliation',
    metaDescription:
      'Experience true freedom with transformative Bible verses on forgiveness (1 John 1:9, Ephesians 4:32, Colossians 3:13, Psalm 103:12) in parallel on AduBible.org®.',
    icon: '🕊️',
    tagline: 'As Far as the East Is from the West: Total Removal of Guilt',
    historicalExposition:
      'Forgiveness stands at the very heart of the Christian gospel. Under the Old Covenant, the Day of Atonement (Yom Kippur) featured two goats: one slain as a blood offering to satisfy divine justice, and the scapegoat carrying the nation’s sins into an uninhabited wilderness, signifying the total removal of guilt. Psalm 103:12 proclaims: "As far as the east is from the west, so far has He removed our transgressions from us." In the New Covenant, 1 John 1:9 promises that if we confess our sins, God is faithful and just to forgive us and cleanse us from all unrighteousness. Having received such unmerited pardon, believers are commissioned to forgive others freely (Ephesians 4:32).',
    hebrewGreekRoots:
      'Key Lexicon: Salach (סָלַח, Strong’s H5545 — To pardon, forgive, spare), Nasa (נָשָׂא, Strong’s H5375 — To lift up and carry away guilt), Aphiēmi (ἀφίημι, Strong’s G863 — To send away, release, cancel debt), Charizomai (χαρίζομαι, Strong’s G5483 — To bestow favor freely, pardon).',
    verses: [
      {
        reference: '1 John 1:9',
        bookSlug: '1-john',
        chapter: 1,
        verse: 9,
        nkjv: 'If we confess our sins, He is faithful and just to forgive us our sins and to cleanse us from all unrighteousness.',
        kjv: 'If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.',
        twi: 'Sɛ yɛka yɛn bɔne kyerɛ a, ɔdi nokorɛ na ɔtene sɛ ɔde yɛn bɔne bɛfiri yɛn, na wate yɛn ho afiri amumuyɛ nyinaa mu.',
        strongsNotes: 'Homologeō (G3670 — To say the same thing, agree with God’s diagnosis of sin).',
      },
      {
        reference: 'Ephesians 4:32',
        bookSlug: 'ephesians',
        chapter: 4,
        verse: 32,
        nkjv: 'And be kind to one another, tenderhearted, forgiving one another, even as God in Christ forgave you.',
        kjv: 'And be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ’s sake hath forgiven you.',
        twi: 'Na monyɛ ayamyɛfoɔ mma mo ho mo ho, mmɔbɔhunufoɔ, na momfa mmfiri mo ho mo ho, sɛdeɛ Onyankopɔn nso de afiri mo Kristo mu no.',
        strongsNotes: 'Charizomai (G5483 — Forgive with gracious unconditional benevolence).',
      },
    ],
    faqs: [
      {
        q: 'How many times must we forgive someone who offends us?',
        a: 'Jesus answered Peter in Matthew 18:21-22: "Not seven times, but seventy times seven," indicating that forgiveness is an ongoing lifestyle of covenant mercy rather than a mathematical calculation.',
      },
    ],
  },
  {
    slug: 'wisdom',
    title: 'Bible Verses on Wisdom, Guidance & Discernment | AduBible.org®',
    h1: 'Bible Verses on Divine Wisdom, Discernment & Guidance',
    metaDescription:
      'Seek heavenly guidance with foundational Bible verses on wisdom (James 1:5, Proverbs 4:7, Psalm 119:105, Colossians 2:2-3) on AduBible.org®.',
    icon: '🧭',
    tagline: 'Chokmah: The Skillful Application of Heavenly Truth to Earthly Living',
    historicalExposition:
      'In biblical theology, wisdom is far more than theoretical intellectual knowledge; it is Chokmah—the moral, practical skill of living harmoniously with God’s creation and commandments. Proverbs 9:10 states that "The fear of the LORD is the beginning of wisdom, and the knowledge of the Holy One is understanding." Human philosophy searches upward through speculation, but heavenly wisdom descends downward as a gracious gift of the Holy Spirit. In the New Testament Epistle of James 1:5, believers facing perplexing trials are invited to ask God directly, who gives to all liberally and without reproach.',
    hebrewGreekRoots:
      'Key Lexicon: Chokmah (חָכְמָה, Strong’s H2451 — Skill, moral wisdom, practical prudence), Sophia (σοφία, Strong’s G4678 — Wisdom, insight into the true nature of things), Phronēsis (φρόνησις, Strong’s G5428 — Practical understanding).',
    verses: [
      {
        reference: 'James 1:5',
        bookSlug: 'james',
        chapter: 1,
        verse: 5,
        nkjv: 'If any of you lacks wisdom, let him ask of God, who gives to all liberally and without reproach, and it will be given to him.',
        kjv: 'If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.',
        twi: 'Na sɛ mo mu bi di nyansa nsam a, ɔmmisa Onyankopɔn a ɔma nnipa nyinaa kɛseɛ a ɔnwiinwii no, na wɔbɛma no.',
        strongsNotes: 'Haplōs (G574 — Generously, with single-minded benevolence).',
      },
      {
        reference: 'Proverbs 3:5–6',
        bookSlug: 'proverbs',
        chapter: 3,
        verse: 5,
        nkjv: 'Trust in the LORD with all your heart, and lean not on your own understanding; in all your ways acknowledge Him, and He shall direct your paths.',
        kjv: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
        twi: 'Fa wo koma nyinaa bata Awurade ho, na nna wo tirim nyansa so. Hu no w’akwan nyinaa mu, na ɔno ara na ɔbɛteɛ w’akwan.',
        strongsNotes: 'Yashar (H3474 — To make smooth, straight, and unhindered).',
      },
    ],
    faqs: [
      {
        q: 'What is the biblical difference between knowledge and wisdom?',
        a: 'Knowledge is the accumulation of facts and truth, while wisdom (Chokmah / Sophia) is the righteous, practical skill to apply that truth to real-world decisions in accordance with the will of God.',
      },
    ],
  },
];

export function getAllTopicalHubs(): TopicalHubEntry[] {
  return TOPICAL_HUBS_CORPUS;
}

export function getTopicalHubBySlug(slug: string): TopicalHubEntry | undefined {
  const clean = slug.toLowerCase().replace(/^\/+|\/+$/g, '').trim();
  return TOPICAL_HUBS_CORPUS.find((t) => t.slug === clean);
}
