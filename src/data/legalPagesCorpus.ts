// MASTER INSTITUTIONAL & LEGAL GOVERNANCE CORPUS — ADUBIBLE.ORG
// Domiciled at the Apostle Kwame Adu Gospel Center, Nsuhia, Bono Region, Republic of Ghana
// Governed by the Ecclesiastical Council & Sacred Scripture Custodians
// Dedicated to Humanity · 100% Ads-Free Perpetual Covenant · Open Scripture Commons

export interface LegalSection {
  id: string;
  heading: string;
  content: string;
}

export interface LegalPageData {
  key: 'about' | 'privacy' | 'terms' | 'contact' | 'cookie-policy' | 'how-to-use' | 'editorial-policy' | 'glossary' | 'sources';
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  badge: string;
  lastUpdated: string;
  sections: LegalSection[];
  schemaType: 'AboutPage' | 'WebPage' | 'ContactPage';
}

export const LEGAL_PAGES_CORPUS: Record<string, LegalPageData> = {
  about: {
    key: 'about',
    slug: 'about',
    title: 'Institutional Charter & The Ministry of Apostle Kwame Adu',
    metaTitle: 'About AduBible — The Ministry & Mission of Apostle Kwame Adu | Nsuhia, Ghana',
    metaDescription: 'Official Institutional Charter of AduBible.org, established in support of the apostolic ministry of Apostle Kwame Adu of Nsuhia, Ghana. A perpetual 100% ad-free parallel Scripture sanctuary.',
    badge: 'Apostolic Charter & Ecclesiastical Covenant',
    lastUpdated: '2026-10-28',
    schemaType: 'AboutPage',
    sections: [
      {
        id: 'apostolic-mandate',
        heading: 'ARTICLE I — Foundational Mandate & Apostolic Heritage',
        content: `AduBible (https://adubible.org) was solemnly established as an enduring digital sanctuary, theological repository, and global missionary commons in honor of the lifelong gospel labors of Apostle Kwame Adu of Nsuhia, Bono Region, Republic of Ghana (https://nsuhia.com/).

For decades, Apostle Kwame Adu has dedicated his ministerial calling to the uncompromising proclamation of the Holy Gospel of Jesus Christ across rural villages, metropolitan centers, and the worldwide diaspora. Central to his pastoral conviction is the unyielding doctrine that Holy Scripture is the divinely inspired, inerrant, and living Word of God, and that every soul has a God-given birthright to read, examine, and cherish the sacred text in their own mother tongue without financial barriers, commercial interruption, or algorithmic surveillance.

In fulfillment of this mandate, AduBible is governed by an irrevocable Ecclesiastical Covenant: the entire platform, including all 107 Holy Bible translations, interlinear lexical tools, and classical expository commentaries, is dedicated to humanity as a permanent, unmonetized gift—guaranteed 100% ads-free for all generations.`
      },
      {
        id: 'theological-pillars',
        heading: 'ARTICLE II — The Triune Scriptural Foundations',
        content: `The spiritual doctrine, institutional governance, and technical architecture of AduBible are anchored upon three foundational canonical declarations:

1. The Inheritance of Sovereign Grace — Ephesians 1:3 (Efesofoɔ 1:3):
"Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ."
Confessing that salvation, revelation, and divine illumination are sovereign gifts bestowed by God the Father through Christ Jesus, freely received and freely shared with all humanity.

2. The Piercing Power of the Living Word — Hebrews 4:12 (Hebrifoɔ 4:12):
"For the word of God is living and active, sharper than any two-edged sword, piercing to the division of soul and of spirit, of joints and of marrow, and discerning the thoughts and intentions of the heart."
Acknowledging that Holy Scripture is not a static human artifact, but a living, convicting, supernatural agent of transformation, repentance, and sanctification.

3. The Divine Inspiration and Sufficiency of the Canon — 2 Timothy 3:16 (2 Timoteo 3:16):
"All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness."
Affirming the plenary verbal inspiration, historical trustworthiness, and normative authority of the biblical canon as the ultimate rule of faith and Christian conduct.`
      },
      {
        id: 'parallel-sanctuary',
        heading: 'ARTICLE III — Harmonizing BibleHub Exegesis with Modern Fluidity',
        content: `For decades, students of Scripture have faced an agonizing dilemma: either navigate clunky, ad-saturated portals to access original Hebrew and Greek lexicons, or utilize closed, mobile-only apps that lack deep parallel exegetical tools.

AduBible permanently resolves this divide by harmonizing the deep lexical horsepower of classical study hubs with modern, elegant, distraction-free reading architecture:

| Institutional Capability | Classical Study Portals | Typical Commercial Apps | AduBible Sovereign Sanctuary |
| :--- | :--- | :--- | :--- |
| **Advertising Model** | Cluttered with banners, auto-play videos | Sponsored daily verses & upsell subscriptions | **100% Ads-Free Covenant** (Zero commercial monetization) |
| **Parallel Column Power** | Rigid, static multi-column tables | 1 or 2 mobile-locked split views | **Fluid 1-to-4 Column Grid** with instant 1-click swap (⇄) |
| **Lexical Depth** | High (Strong's, Thayer, Gesenius) | Low (Simplified surface text only) | **Inline Greek & Hebrew Strong's Badges** with instant popovers |
| **African Mother Tongues** | Seldom available; low typographic care | Basic secondary text options | **Asante Twi, Akuapem Twi, Ewe, Ga, Yoruba, Hausa, Swahili** |
| **Privacy Architecture** | Heavy third-party tracking pixels & cookies | Behavioral tracking of devotions & notes | **Client-First IndexedDB Sandbox** with zero behavioral logging |`
      },
      {
        id: 'linguistic-dignity',
        heading: 'ARTICLE IV — Linguistic Dignity for Asante Twi and African Vernaculars',
        content: `A cornerstone of Apostle Kwame Adu’s ministry is the profound truth that God speaks to the human soul with unmatched intimacy in the heart language of the believer. In West Africa, the Asante Twi Holy Bible (Twerɛ Kronkron) and Akuapem Twi Holy Bible (Kyerew Kronkron) possess a venerable heritage tracing to the Basel Evangelical Missionary Society and the monumental translational labors of Johannes Gottlieb Christaller in 1871.

AduBible accords native African vernaculars the identical academic dignity, typographic precision, and interlinear cross-referencing granted to classical English, Latin, Greek, and Hebrew scriptures. Believers and scholars can read Asante Twi, Akuapem Twi, Ewe (Eʋegbe), Ga (Ŋmalɛ Krɔŋkrɔŋ Lɛ), Yoruba (Bíbélì Mímọ́), Hausa (Littafi Mai Tsarki), and Swahili (Kiswahili) side-by-side with original biblical languages, supported by full verse synchronization and offline caching.`
      },
      {
        id: 'governance-domicile',
        heading: 'ARTICLE V — Institutional Domicile & Voluntary Stewardship',
        content: `AduBible is neither owned nor controlled by any commercial media conglomerate, venture capital firm, or advertising syndicate. The platform is maintained by the Apostle Kwame Adu Gospel Center in partnership with independent theological scholars, linguists, and voluntary software engineers committed to the advancement of Christian truth across all nations.

Official Seat of Governance:
AduBible Sacred Scripture Foundation
Apostle Kwame Adu Gospel Center
Nsuhia Community, Bono Region, Republic of Ghana
Official Civic & Heritage Register: https://nsuhia.com/
Direct Secretariat Contact: info[at]adubible.org`
      }
    ]
  },

  privacy: {
    key: 'privacy',
    slug: 'privacy',
    title: 'Sovereign Privacy Policy & Zero-Telemetry Data Covenant',
    metaTitle: 'Privacy Policy — Zero Ads, Zero Tracking & Client Vault | AduBible.org',
    metaDescription: 'Official Privacy Policy of AduBible.org: 100% ad-free, zero tracking pixels, client-first IndexedDB sandbox, GDPR/CCPA consumer rights, and complete data portability.',
    badge: 'Statutory Privacy Folio · Zero-Telemetry Covenant',
    lastUpdated: '2026-10-28',
    schemaType: 'WebPage',
    sections: [
      {
        id: 'zero-telemetry-covenant',
        heading: 'ARTICLE I — The Zero-Telemetry Covenant',
        content: `At AduBible (https://adubible.org), we hold the sacred privacy of your spiritual devotions, prayer notes, sermon preparations, and Scripture reading habits to be inviolable. When a human soul communes with the Word of God, that communion must remain entirely private—free from corporate surveillance, behavioral profiling, and commercial monetization.

Our foundational privacy commitment is absolute and permanent:
1. Zero Advertising: We do not display banner advertisements, sponsored verses, popups, or programmatic commercial media of any description.
2. Zero Data Brokering: We do not sell, rent, lease, or monetize your personal information or devotional habits to any third party, data broker, or commercial entity.
3. Zero Behavioral Trackers: We deploy zero third-party tracking pixels, zero social media surveillance widgets (such as Meta Pixel, TikTok Tracker, or X Pixel), and zero cross-site remarketing tags.
4. Zero Devotional Profiling: We do not log, categorize, or analyze the chapters you study, the verses you highlight, or the exegetical notes you author.`
      },
      {
        id: 'client-sandbox-architecture',
        heading: 'ARTICLE II — Client-First Sandbox Architecture & Local Storage Register',
        content: `AduBible is engineered with a strict client-first, sovereign data vault architecture. By default, 100% of your reading configurations and devotional notes are stored solely inside your browser's private local sandbox:

| Storage Key | Storage Engine | Technical Purpose | Data Class | Lifecycle & Control |
| :--- | :--- | :--- | :--- | :--- |
| **adubible_prefs_v2** | LocalStorage | Active reading preferences (theme, font size, active columns) | Non-identifiable UI settings | Client-controlled; purges with cache |
| **adubible_user_pins** | IndexedDB / LocalStorage | Verses pinned to the persistent Study Deck | Private devotional verses | Client-controlled; exportable anytime |
| **adubible_user_highlights** | IndexedDB / LocalStorage | Verse highlights across six royal palette shades | Private devotional annotations | Client-controlled; exportable anytime |
| **adubible_user_notes** | IndexedDB / LocalStorage | Personal sermon notes, exegesis, and commentary drafts | Private text notes | Client-controlled; exportable anytime |
| **adubible_offline_vault** | IndexedDB | Seeded Scripture chapters for 0ms offline reading | Public domain biblical texts | Client-controlled; purges with cache |`
      },
      {
        id: 'optional-cloud-sync',
        heading: 'ARTICLE III — Optional Cloud Study Sync & Security Boundary',
        content: `For scholars and believers who elect to synchronize their personal study vault across multiple devices (e.g., desktop PC, tablet, and mobile smartphone), AduBible provides an optional, isolated Cloud Study Sync feature powered by Google Firebase:

1. Minimum Authentication Data: When you choose to authenticate via Google Auth or Email Login, Firebase processes only your primary identity credential (email address and display name) strictly to establish your secure cryptographic tenant.
2. Cryptographic Tenant Isolation: Your synchronized study records (bookmarks, pins, highlights, notes) are stored within an isolated Firestore document governed by strict security rules. No third party or unauthorized user can view or query your devotional records.
3. Complete Revocation: You may disconnect Cloud Sync at any moment. When you sign out, your local study vault remains intact on your device.`
      },
      {
        id: 'statutory-rights',
        heading: 'ARTICLE IV — International Statutory Rights: GDPR, CCPA/CPRA, and Ghana Act 843',
        content: `AduBible guarantees and upholds full statutory compliance under the European Union General Data Protection Regulation (GDPR / Regulation EU 2016/679), the California Consumer Privacy Act as amended by the CPRA (Cal. Civ. Code § 1798.100 et seq.), and the Republic of Ghana Data Protection Act of 2012 (Act 843):

• Right of Access (GDPR Art. 15 / Act 843 § 21): You possess the unconditional right to inspect all personal data associated with your cloud profile.
• Right to Rectification (GDPR Art. 16 / Act 843 § 28): You may correct or amend your account credentials at any time.
• Right to Erasure / Right to Be Forgotten (GDPR Art. 17 / Act 843 § 28): You may permanently delete your cloud profile and all cloud-stored study records with instantaneous effect.
• Right to Data Portability (GDPR Art. 20): You may export your complete study vault—including all bookmarks, pins, highlights, and notes—in standard JSON or Markdown format directly from the Settings and Study Vault panels.
• "Do Not Sell or Share My Data" (CCPA): Because AduBible never sells, leases, or transfers personal data for cross-context behavioral advertising, the platform operates in full compliance with CCPA/CPRA standards by design.`
      },
      {
        id: 'security-governance',
        heading: 'ARTICLE V — Transport Encryption & Data Protection Inquiries',
        content: `All transmissions between your web browser and AduBible edge servers are secured via Transport Layer Security (TLS 1.3 / HTTPS) utilizing strict HTTP Strict Transport Security (HSTS) headers, Content Security Policy (CSP), and X-Frame-Options (SAMEORIGIN).

For formal inquiries regarding this Privacy Policy, statutory access requests, or verification of data deletion, you may correspond directly with our Data Protection Secretariat:

Data Protection Secretariat
AduBible Sacred Scripture Foundation
Apostle Kwame Adu Gospel Center, Nsuhia, Bono Region, Ghana
Certified Email: info[at]adubible.org (Click to email: mailto:info@adubible.org)
Web: https://adubible.org/contact/`
      }
    ]
  },

  terms: {
    key: 'terms',
    slug: 'terms',
    title: 'Terms of Service & Open-Access Scripture Commons Licensing',
    metaTitle: 'Terms of Service & Open Scripture Licensing | AduBible.org',
    metaDescription: 'Official Terms of Service of AduBible.org: Open Scripture Commons licensing, public domain canon, user intellectual property ownership, and ecclesiastical conduct.',
    badge: 'Scripture Commons License · Terms of Governance',
    lastUpdated: '2026-10-28',
    schemaType: 'WebPage',
    sections: [
      {
        id: 'agreement-covenant',
        heading: 'ARTICLE I — Agreement to Terms & Ecclesiastical Respect',
        content: `By accessing, browsing, reading, or utilizing AduBible (https://adubible.org), its progressive web application, APIs, seed datasets, or audio narration streams, you acknowledge that you have read, comprehended, and agreed to be bound by these Terms of Service.

AduBible is an ecclesiastical, educational, and devotional platform dedicated to the worldwide Body of Christ and all seekers of divine truth in honor of Apostle Kwame Adu of Nsuhia, Ghana. We request all visitors, scholars, and church communities to engage with the sacred texts, commentaries, and fellow believers with Christian charity, scholarly integrity, and mutual reverence.`
      },
      {
        id: 'scripture-commons-registry',
        heading: 'ARTICLE II — Open-Access Scripture Commons & Public Domain Register',
        content: `The vast majority of biblical manuscripts, translations, lexicons, dictionaries, and historical commentaries provided on AduBible reside in the public domain or are provided under open-access creative commons charters:

| Translation / Dataset | Primary Language | Historical Lineage | Legal Licensing Classification |
| :--- | :--- | :--- | :--- |
| **King James Version (KJV 1769)** | English | Authorized King James, Blayney 1769 | **Public Domain Worldwide** (Free preaching, copying, distribution) |
| **Berean Standard Bible (BSB)** | English | Bible Hub / BSB Translation Committee | **Dedicated to Public Domain (Creative Commons Zero / CC0)** |
| **American Standard Version (ASV 1901)** | English | American Revision Committee 1901 | **Public Domain Worldwide** |
| **Asante Twi Holy Bible (Twerɛ Kronkron)** | Asante Twi (Akan) | Basel Evangelical Missionary Society 1871 | **Religious Cultural Commons** (Non-commercial devotional study) |
| **Akuapem Twi Holy Bible (Kyerew Kronkron)** | Akuapem Twi | J.G. Christaller historical heritage | **Religious Cultural Commons** (Non-commercial devotional study) |
| **Greek Textus Receptus (TR 1550/1894)** | Biblical Greek | Robert Estienne (Stephanus) / Scrivener | **Public Domain Worldwide** |
| **Westminster Leningrad Codex (WLC)** | Biblical Hebrew | Masoretic Text, Leningrad B19a | **Open-Access Academic Commons** |
| **Matthew Henry Expository Commentary** | English Exegesis | Matthew Henry (1706–1714) | **Public Domain Worldwide** |
| **Jamieson-Fausset-Brown (JFB)** | English Exegesis | Critical Commentary (1871) | **Public Domain Worldwide** |`
      },
      {
        id: 'intellectual-property-ownership',
        heading: 'ARTICLE III — User Ownership of Personal Devotional Output',
        content: `AduBible explicitly recognizes that your personal spiritual reflections, sermon notes, exegetical outlines, and highlights are your exclusive intellectual property:

1. 100% User Ownership: You retain complete and unencumbered ownership of all personal notes, bookmarks, verse pins, and custom study packs authored within the platform. AduBible claims zero copyright, ownership, or commercial rights over your devotional content.
2. Platform Software License: The visual interface, brand marks, bespoke typographic layouts, dynamic parallel synchronization engine, and proprietary frontend algorithms of AduBible are protected by the intellectual property laws of Ghana and international conventions. You are granted a personal, non-exclusive, royalty-free license to use the platform for devotional, educational, scholarly, and ministerial purposes.`
      },
      {
        id: 'acceptable-use',
        heading: 'ARTICLE IV — Acceptable Use & System Integrity Protections',
        content: `To ensure reliable, instantaneous, high-speed access for believers around the globe, you agree to adhere to the following acceptable use boundaries:

• Permitted Uses: Personal prayer and devotion, pastoral sermon preparation, academic manuscript research, church Bible study groups, and classroom instruction.
• Prohibited Uses: You may not execute automated scraping bots, mass data harvesters, or high-frequency headless queries designed to copy the entire database for commercial resale or that impose excessive bandwidth costs upon the ministry.
• Security Integrity: You may not attempt to reverse-engineer server infrastructure, bypass rate limits, inject malicious scripts, or compromise authentication tokens.`
      },
      {
        id: 'liability-governing-law',
        heading: 'ARTICLE V — Disclaimer of Warranties & Dispute Resolution',
        content: `AduBible is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. While our research scholars exercise meticulous care to ensure typographical fidelity and lexical alignment:
1. We do not warrant that service will be wholly uninterrupted by external telecommunications failures or cloud provider maintenance.
2. Historical theological viewpoints expressed within classical commentaries belong to their respective authors and do not necessarily represent the exhaustive dogmatic stance of the ministry on every secondary doctrinal question.
3. These Terms shall be construed under the laws of the Republic of Ghana. Any grievance shall first be addressed through Christian conciliation and mediation (1 Corinthians 6:1–7), or, if necessary, submitted to the competent courts of Kumasi or Accra, Ghana.`
      }
    ]
  },

  contact: {
    key: 'contact',
    slug: 'contact',
    title: 'Secretariat Directory, Errata Registry & Global Contact',
    metaTitle: 'Contact Us — Ministry Support, Textual Errata & Inquiries | AduBible.org',
    metaDescription: 'Contact the AduBible Secretariat in Nsuhia, Ghana. Pastoral inquiries, theological consultations, textual errata submissions, technical assistance, and church partnerships.',
    badge: 'Secretariat Directory · Errata Registry',
    lastUpdated: '2026-10-28',
    schemaType: 'ContactPage',
    sections: [
      {
        id: 'secretariat-welcome',
        heading: 'ARTICLE I — Institutional Secretariat & Ministerial Support',
        content: `The AduBible Secretariat welcomes correspondence from pastors, Bible translators, university scholars, seminary students, and believers worldwide. Operating from Nsuhia, Bono Region, Ghana, in support of the missionary endeavors of Apostle Kwame Adu, our secretariat handles all inquiries with Christian diligence, theological rigor, and pastoral warmth.`
      },
      {
        id: 'communication-channels',
        heading: 'ARTICLE II — Certified Communication Channels & Email Register',
        content: `To defend our mail servers against automated harvesting bots while preserving open access for correspondents, all communications are routed through our unified, anti-scrape obfuscated secretariat email:

| Ministerial Department | Scope of Responsibility | Certified Secretariat Channel | Typical Response Window |
| :--- | :--- | :--- | :--- |
| **Pastoral & Apostolic Ministry** | Prayer requests, pastoral counsel, missionary partnerships in honor of Apostle Kwame Adu | **info[at]adubible.org** *(mailto:info@adubible.org)* | 24–48 Business Hours |
| **Textual Errata & Scholarly Review** | Manuscript alignment, Strong's concordance feedback, Twi/vernacular spelling submissions | **info[at]adubible.org** *(mailto:info@adubible.org)* | Reviewed within 48 Hours |
| **Technical & Cloud Support** | Offline caching, Study Vault exports, device synchronization, PWA installation support | **info[at]adubible.org** *(mailto:info@adubible.org)* | 24 Business Hours |
| **Statutory Privacy & Governance** | GDPR/CCPA data verification, cloud vault erasure, institutional licensing inquiries | **info[at]adubible.org** *(mailto:info@adubible.org)* | Immediate Priority |`
      },
      {
        id: 'physical-registry',
        heading: 'ARTICLE III — Physical Domicile & Civic Heritage',
        content: `Physical Seat of Ministry:
Apostle Kwame Adu Gospel Center & AduBible Foundation
Nsuhia Community, Bono Region, Republic of Ghana
Official Civic & Heritage Register: https://nsuhia.com/ (Nsuhia Community Heritage Portal)
Official Platform Domain: https://adubible.org/`
      }
    ]
  },

  'cookie-policy': {
    key: 'cookie-policy',
    slug: 'cookie-policy',
    title: 'Client Storage Disclosure & Zero-Cookie Policy',
    metaTitle: 'Cookie Policy — Zero Tracking Cookies & Local Storage | AduBible.org',
    metaDescription: 'Official Cookie & Storage Policy of AduBible.org: Zero advertising cookies, zero third-party telemetry, and 100% essential client-side storage keys.',
    badge: 'Storage Disclosure · Zero Tracking Cookies',
    lastUpdated: '2026-10-28',
    schemaType: 'WebPage',
    sections: [
      {
        id: 'zero-cookie-declaration',
        heading: 'ARTICLE I — Zero Third-Party Advertising Cookies Declaration',
        content: `AduBible enforces a strict Zero-Tracking-Cookie Policy. Unlike commercial media portals, we do not deploy advertising cookies, behavioral tracking scripts, social network cross-site trackers, or third-party analytics trackers designed to follow your browsing across the internet.

When you study Scripture on AduBible, you are completely free from advertising retargeting tags, affiliate marketing cookies, and cross-site tracking beacons.`
      },
      {
        id: 'essential-storage-register',
        heading: 'ARTICLE II — Register of Essential Client Storage Keys',
        content: `To deliver a high-speed, personalized study experience that functions seamlessly offline, AduBible utilizes browser-native LocalStorage and IndexedDB technology. These storage keys are strictly functional, client-side, and non-intrusive:

| Client Key | Storage Type | Exact Functionality | Third-Party Access |
| :--- | :--- | :--- | :--- |
| **adubible_prefs_v2** | LocalStorage | Remembers your chosen theme (e.g., Wisdom Pine, Symbol Gold), scripture font size, and active columns | Zero (Client Only) |
| **adubible_user_pins** | IndexedDB | Retains verses you have pinned to your active Study Deck | Zero (Client Only) |
| **adubible_user_highlights** | IndexedDB | Retains verse highlight colors across your reading sessions | Zero (Client Only) |
| **adubible_user_notes** | IndexedDB | Stores private sermon and devotional notes authored on verses | Zero (Client Only) |
| **adubible_offline_vault** | IndexedDB | Caches Scripture chapters for instantaneous 0ms offline retrieval | Zero (Client Only) |`
      },
      {
        id: 'user-control-deletion',
        heading: 'ARTICLE III — Complete User Control & Cache Purging',
        content: `Because all essential study data is stored locally in your browser sandbox, you possess total physical control over its lifecycle. You may clear your study vault, reset your theme preferences, or delete all cached chapters at any time by selecting "Clear Data" inside the Settings Panel, or by clearing your browser's site data in your browser settings.`
      }
    ]
  },

  'how-to-use': {
    key: 'how-to-use',
    slug: 'how-to-use',
    title: 'Master Exegetical Manual & Multi-Column Parallel Study Guide',
    metaTitle: 'How to Use AduBible — 4-Column Parallel Study & Strong’s Guide | AduBible.org',
    metaDescription: 'Master the full exegetical horsepower of AduBible.org: 4-column parallel reading, instant language swap, Strong’s Hebrew/Greek concordances, and personal study vault.',
    badge: 'Master User Manual · Exegetical Guide',
    lastUpdated: '2026-10-28',
    schemaType: 'WebPage',
    sections: [
      {
        id: 'parallel-study-engine',
        heading: 'ARTICLE I — The 4-Column Synchronized Parallel Reader',
        content: `AduBible's flagship capability is its fluid, multi-column parallel reading architecture. Scholars and believers can examine up to four translations side-by-side with verse-level alignment:

1. Adding & Removing Columns: Tap the '+ Add Column' button in the toolbar to activate an additional translation view. Tap the column header's '✕' icon to remove any translation.
2. Instant Language Swap (⇄): Click the bidirectional swap icon (⇄) on any column to instantly invert translation order (e.g., swapping King James Version to the primary column and Asante Twi to the parallel view).
3. Synchronized Verse Scrolling: As you scroll through any chapter, all active translation columns advance in harmony, maintaining exact alignment between English, Asante Twi, Greek, Hebrew, and other languages.`
      },
      {
        id: 'strongs-lexical-suite',
        heading: 'ARTICLE II — Strong’s Hebrew & Greek Lexicon Integration',
        content: `For deep linguistic and exegesis study, AduBible embeds Strong's Exhaustive Concordance numbers directly into the verse reading surface:

• Interactive Code Badges: Tap any Strong's badge (such as G2128 eulogētos or H430 Elohim) to summon the comprehensive Lexical Popover.
• Morphological Parsing & Etymology: Inspect the root derivation, Thayer/Gesenius definitions, King James translation count, and cross-references in seconds.
• Vernacular Synthesis: Discover how classical Greek concepts (such as agapē or charis) translate into indigenous Akan Twi terms like dɔ or adom.`
      },
      {
        id: 'commentaries-and-vault',
        heading: 'ARTICLE III — Expository Commentaries & The Sovereign Study Vault',
        content: `Expand your devotional depth with classical theological scholarship and personal annotations:

1. Classical Expository Commentaries: Beneath any chapter, expand historical notes from Matthew Henry, Jamieson-Fausset-Brown, John Gill, and the Geneva Bible 1599.
2. Verse Highlights: Highlight verses in six royal palette tones (Gold, Emerald, Sapphire, Rose, Amethyst, Silver) with a single tap.
3. Pinned Verses Study Deck: Pin key verses to your floating Study Deck for instant side-by-side comparative meditation across different books.
4. Exegetical Notes: Author private devotional reflections and sermon drafts attached to individual verses, backed up securely to your local or cloud vault.`
      }
    ]
  },

  'editorial-policy': {
    key: 'editorial-policy',
    slug: 'editorial-policy',
    title: 'Textual Integrity Protocol & Ecumenical Translation Standards',
    metaTitle: 'Editorial Policy & Translation Integrity Standards | AduBible.org',
    metaDescription: 'AduBible Textual Integrity Protocol: Scholarly source verification, ecumenical manuscript alignments, inerrancy of Scripture, and textual errata protocols.',
    badge: 'Textual Integrity Protocol · Translation Standards',
    lastUpdated: '2026-10-28',
    schemaType: 'WebPage',
    sections: [
      {
        id: 'textual-fidelity-standard',
        heading: 'ARTICLE I — The Standard of Plenary Verbal Fidelity',
        content: `AduBible upholds the historical Christian doctrine of the plenary verbal inspiration and infallible authority of Holy Scripture. We believe that God inspired not merely the general concepts, but the very words of the original autographs (Hebrew, Aramaic, and Greek).

Consequently, our editorial and digital encoding policy is governed by rigorous scholarly standards:
• Zero Theological Censorship: We do not alter, modernize, or sanitize historical biblical texts to conform to contemporary cultural, political, or secular trends.
• Manuscript Lineage Transparency: Every translation on AduBible is clearly annotated with its source manuscript lineage (e.g., Byzantine / Textus Receptus, Alexandrian / Critical Text, Masoretic Text).
• Scholarly Errata Verification: Any suspected typographical anomaly, missing verse, or orthographic variance is investigated by our research faculty against historical facsimile editions within 48 hours.`
      },
      {
        id: 'african-translation-rigor',
        heading: 'ARTICLE II — Translation Rigor for African Vernacular Scriptures',
        content: `African biblical translations provided on AduBible—including Asante Twi (Twerɛ Kronkron), Akuapem Twi, Ewe, Ga, Yoruba, Hausa, and Swahili—are maintained with pristine orthographic fidelity. We honor the historical translational labors of the Basel Evangelical Missionary Society, the British and Foreign Bible Society, and contemporary African national Bible societies.

Diacritical marks, special Akan vowels (ɛ, ɔ), and tone distinctions are preserved with typographical precision to ensure authentic vernacular vocalization and exegesis.`
      }
    ]
  },

  glossary: {
    key: 'glossary',
    slug: 'glossary',
    title: 'Biblical Exegesis, Manuscript & Lexical Glossary',
    metaTitle: 'Biblical Exegesis & Theological Glossary | AduBible.org',
    metaDescription: 'Comprehensive glossary of biblical exegesis terms: Textus Receptus, Masoretic Text, Septuagint, Strong’s Concordance, Pericope, and Hermeneutics.',
    badge: 'Scholarly Lexical Glossary · Exegetical Terms',
    lastUpdated: '2026-10-28',
    schemaType: 'WebPage',
    sections: [
      {
        id: 'manuscript-terms',
        heading: 'ARTICLE I — Manuscript Lineage & Textual Terms',
        content: `• Textus Receptus (TR): The "Received Text"—the printed Greek New Testament tradition synthesized by Desiderius Erasmus (1516), refined by Robert Estienne (Stephanus 1550), and Theodore Beza, serving as the textual foundation for the Reformation translations, including the Authorized King James Version (1611) and classical vernacular Bibles.

• Masoretic Text (MT): The authoritative Hebrew and Aramaic text of the Tanakh (Old Testament), meticulously preserved, vocalized, and accented by Jewish scribal scholars known as the Masoretes between the 6th and 10th centuries AD, exemplified in the Westminster Leningrad Codex (1008 AD).

• Septuagint (LXX): The ancient Koine Greek translation of the Hebrew Old Testament produced in Alexandria, Egypt, during the 3rd to 2nd centuries BC, widely quoted by the New Testament Apostles and early Church Fathers.

• Strong’s Exhaustive Concordance: The monumental indexing system compiled by Dr. James Strong in 1890, assigning a unique numerical identifier to every root word in the Hebrew Old Testament (H1 to H8674) and Greek New Testament (G1 to G5624).`
      },
      {
        id: 'hermeneutical-terms',
        heading: 'ARTICLE II — Hermeneutical & Exegetical Concepts',
        content: `• Exegesis: The critical, grammatical, historical, and contextual analysis of a biblical passage to determine its authentic original meaning intended by the divine and human authors, drawn directly out of the text (as opposed to eisegesis, which reads foreign ideas into the text).

• Pericope: A distinct, cohesive section or narrative unit of Holy Scripture (e.g., a parable, miracle, or discourse) suitable for public reading and expository preaching.

• Interlinear Translation: A study layout that displays the original Hebrew or Greek text directly alongside its literal target-language translation, root grammar, and morphological parsing word-for-word.

• Twerɛ Kronkron: The sacred title of the Holy Bible in the Asante Twi and Akan languages, literally signifying "The Sacred Written Word".`
      }
    ]
  },

  sources: {
    key: 'sources',
    slug: 'sources',
    title: 'Comprehensive Manuscript Sources, Archives & Provenance Register',
    metaTitle: 'Manuscript Sources & Historical Archives Register | AduBible.org',
    metaDescription: 'AduBible Historical Archives & Manuscript Provenance Register: King James 1769, Stephanus 1550 Greek TR, Westminster Leningrad Codex, Basel 1871 Twi, and commentaries.',
    badge: 'Archives Register · Manuscript Provenance',
    lastUpdated: '2026-10-28',
    schemaType: 'WebPage',
    sections: [
      {
        id: 'provenance-register',
        heading: 'ARTICLE I — Primary Source Provenance & Editorial Lineage',
        content: `AduBible draws its biblical corpus from authenticated historical manuscripts, open-access public domain archives, and verified scholarly databases:

| Corpus Title | Primary Historical Source | Archival Provenance & Authority | Public Domain Status |
| :--- | :--- | :--- | :--- |
| **King James Version (KJV)** | 1769 Oxford Edition (Benjamin Blayney) | British Library / Cambridge University Press | **Public Domain Worldwide** |
| **Berean Standard Bible (BSB)** | Berean Translation Committee (2023) | Open-Access Biblical Commons / Bible Hub | **Dedicated to Public Domain (CC0)** |
| **Greek Textus Receptus** | Robert Estienne (Stephanus 1550) / Scrivener (1894) | Cambridge University Press / Tyndale House | **Public Domain Worldwide** |
| **Westminster Leningrad Codex** | Leningrad Codex B19a (1008 AD) | J. Alan Groves Center for Advanced Biblical Research | **Open-Access Academic Commons** |
| **Asante Twi (Twerɛ Kronkron)** | Basel Evangelical Missionary Society (1871) | Johannes Gottlieb Christaller Archives | **Religious Cultural Commons** |
| **Matthew Henry’s Commentary** | 6-Volume Exposition of the Old and New Testaments (1706–1714) | Original London Printings / Christian Classics Ethereal Library | **Public Domain Worldwide** |
| **Jamieson-Fausset-Brown** | Critical and Explanatory Commentary on the Whole Bible (1871) | William Collins, Sons & Co., Glasgow | **Public Domain Worldwide** |`
      },
      {
        id: 'archive-stewardship',
        heading: 'ARTICLE II — Archival Stewardship & Open Access Guarantee',
        content: `All source texts, lexical indexes, and commentary archives on AduBible are preserved in open, standardized, and portable electronic formats (JSON and UTF-8 Unicode). The ministry guarantees that these foundational treasures of Christian heritage shall remain freely accessible to humanity without proprietary locks, commercial paywalls, or artificial gatekeepers.`
      }
    ]
  }
};
