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
    title: 'Biblical Exegesis, Manuscript & Lexical Mega Glossary',
    metaTitle: 'Mega Biblical Exegesis & Theological Glossary | AduBible.org',
    metaDescription: 'Master 10-article scholarly glossary of biblical exegesis, ancient languages, manuscript codices, textual criticism, hermeneutics, lexicons, and African vernacular translation.',
    badge: 'Scholarly Lexical & Exegetical Mega Glossary · 10 Articles',
    lastUpdated: '2026-10-28',
    schemaType: 'WebPage',
    sections: [
      {
        id: 'ancient-languages-and-grammar',
        heading: 'ARTICLE I — Ancient Biblical Languages & Grammar (Hebrew, Aramaic, Koine Greek & Latin)',
        content: `• Masoretic Hebrew (Biblical Hebrew / Ivrit Miqra'it): The Northwest Semitic language of the Old Testament / Tanakh. Structured upon a trilateral consonantal root system (shoresh), vocalized through vowel pointings (niqqud), and governed by rich aspectual and stem semantics.

• Tiberian Vocalization: The definitive system of diacritical points, vowel signs, and cantillation accents (te'amim) developed by the Masoretic scholars of Tiberias between the 8th and 10th centuries AD to safeguard the sacred oral pronunciation of the Hebrew Scriptures.

• Dagesh (Lene and Forte): The diacritical dot placed within a Hebrew letter indicating either the non-aspirated, hard pronunciation of a begadkepat consonant (Dagesh Lene) or the doubling/gemination of a consonant resulting from assimilation or grammatical intensification (Dagesh Forte).

• Ketiv-Qere (כְּתִיב וּקְרֵי): Ancient scribal notations preserving textual integrity: "Ketiv" ("what is written") marks the traditional consonantal text, while "Qere" ("what is read") instructs the public reader to vocalize a corrected, euphemistic, or reverential alternate reading (e.g., vocalizing Adonai where the sacred Tetragrammaton YHWH is written).

• Hebrew Binyanim (Verbal Stems): The seven foundational morphological paradigms that govern verbal voice and intensity: Qal (simple active), Niphal (simple passive/reflexive), Piel (intensive active), Pual (intensive passive), Hiphil (causative active), Hophal (causative passive), and Hithpael (intensive reflexive).

• Waw Consecutive (Vav Inversive): The distinctive syntactic construction in Biblical Hebrew narrative where the prefix conjunction 'waw' (and) attached to an imperfect verb converts its semantic tense into a consecutive past/perfect narrative action, or attached to a perfect verb converts it into a future/imperfect aspect.

• Tetragrammaton (יהוה — YHWH): The sacred, ineffable four-letter covenant name of the Almighty God revealed to Moses at the burning bush ("I AM WHO I AM", Exodus 3:14). Reverently substituted with Adonai in liturgical recitation and rendered as "LORD" in small capitals across standard English Bible editions.

• Elohim (אֱלֹהִים): The plural form of majesty denoting the one supreme Creator God (Genesis 1:1), syntactically paired with singular verbs and adjectives to signify the absolute fullness of divine power and majesty.

• Ruach Ha-Kodesh (רוּחַ הַקֹּדֶשׁ): The Holy Spirit / Divine Breath; from Ruach (wind, breath, vital life-force) and Kodesh (sacredness, set-apart purity). The personal agent of God in creation, prophetic inspiration, and spiritual regeneration.

• Shekinah (שְׁכִינָה): The glorious, visible manifest presence of God dwelling among His covenant people (from shakhan, "to dwell"), revealed in the pillar of cloud and fire, the Holy of Holies, the Solomonic Temple, and incarnated in Jesus Christ (John 1:14).

• Tanakh (תַּנַ״ךְ): The Hebrew acronym for the tripartite canonical divisions of the Hebrew Bible: Torah (Instruction / Law / Pentateuch), Nevi'im (Prophets), and Ketuvim (Writings), comprising 24 books identical in content to the 39 books of the Protestant Old Testament.

• Koine Greek (Ἑλληνιστική Κοινή): The international lingua franca of the eastern Mediterranean basin from the conquests of Alexander the Great through the Roman era; the divinely prepared, highly expressive grammatical vehicle employed by the Apostles for the New Testament.

• Greek Nominal Case System: The inflectional endings that designate grammatical and relational functions within the sentence: Nominative (subject/predicate nominative), Genitive (source, possession, description), Dative (indirect object, agency, sphere, instrumental means), Accusative (direct object, extent of space/time), and Vocative (direct address).

• Verbal Aspect in Koine Greek: The foundational semantic category of the Greek verb denoting the author's internal or external portrayal of the action rather than chronological time: Imperfective Aspect (ongoing, continuous internal process), Perfective / Aoristic Aspect (complete, summary snapshot viewed externally), and Stative / Perfect Aspect (abiding state resulting from completed past action).

• Hapax Legomenon (ἅπαξ λεγόμενον): A lexical item or phrase that occurs only once in the entire biblical corpus or within the writings of a specific biblical author, demanding meticulous contextual, grammatical, and extra-biblical comparative philology.

• Biblical Aramaic: The Northwest Semitic language closely related to Hebrew used for international diplomacy in the ancient Near East, preserved in inspired Scripture in Daniel 2:4b–7:28, Ezra 4:8–6:18; 7:12–26, Jeremiah 10:11, and reflected in the preserved spoken words of Jesus Christ (e.g., Talitha koum, Eloi Eloi lama sabachthani, Maranatha, Abba).

• Latin Vulgate (Biblia Vulgata): The historic Latin translation produced primarily by Saint Jerome (Hieronymus) between 382 and 405 AD directly from original Hebrew and Greek texts under papal commission, serving as the common theological text of Western Christendom for over a millennium.`
      },
      {
        id: 'ancient-manuscripts-and-codices',
        heading: 'ARTICLE II — Ancient Manuscripts, Codices & Textual Lineage',
        content: `• Codex Sinaiticus (א / 01): The celebrated 4th-century parchment uncial manuscript discovered by Constantin von Tischendorf at Saint Catherine's Monastery at Mount Sinai in 1844, containing the oldest complete New Testament and the majority of the Greek Septuagint.

• Codex Vaticanus (B / 03): The monumental 4th-century vellum uncial codex preserved in the Vatican Library since at least 1475, renowned for its clean, non-harmonized witness to the Alexandrian text-type across both Testaments.

• Codex Alexandrinus (A / 02): A 5th-century parchment codex from Alexandria, Egypt, presented to King Charles I of England in 1627; a premier witness to the Byzantine text in the Gospels and the Alexandrian text in the Epistles and Revelation.

• Codex Ephraemi Rescriptus (C / 04): A 5th-century parchment palimpsest where biblical text was erased in the 12th century to transcribe the ascetic sermons of Saint Ephrem the Syrian, deciphered through chemical reagents and modern multi-spectral imaging by Tischendorf in 1840.

• Codex Bezae Cantabrigiensis (D / 05): A 5th-century bilingual Greek and Latin uncial codex presented by the Reformer Theodore Beza to Cambridge University in 1581, representing the primary witness to the Western text-type with distinctive narrative readings in the Gospels and Acts.

• Codex Washingtonianus (W / 032): The "Freer Gospels" codex dating from the late 4th or early 5th century, housed at the Smithsonian Institution in Washington D.C., notable for its block-mixed text-types and the unique "Freer Logion" after Mark 16:14.

• Westminster Leningrad Codex (B19a): Copied in Cairo in 1008 AD from the authenticated Masoretic manuscripts of Aaron ben Moses ben Asher; the oldest complete extant manuscript of the Hebrew Old Testament, serving as the foundational text for the Biblia Hebraica Stuttgartensia (BHS).

• Aleppo Codex (Keter Aram Tzova): The most renowned Hebrew manuscript of the Tanakh, produced circa 930 AD in Tiberias and verified by Maimonides; approximately one-third of its pages, including nearly all of the Torah, were tragically lost during the 1947 Aleppo riots.

• Dead Sea Scrolls (Qumran Cave Manuscripts): The discovery of over 900 biblical and sectarian scrolls between 1947 and 1956 near Khirbet Qumran, dating between 250 BC and 68 AD. Predating the Leningrad Codex by more than a millennium, scrolls like the Great Isaiah Scroll (1QIsaᵃ) demonstrate the extraordinary, supernatural preservation of the Hebrew biblical text across centuries.

• Papyrus Witnesses (P52, P45, P46, P66, P75): The earliest surviving physical New Testament witnesses written on Egyptian reed papyrus:
  - P52 (Rylands Library Papyrus, c. 125 AD): The oldest known manuscript fragment of the New Testament (John 18:31–33, 37–38).
  - P45 (Chester Beatty I, c. 200–250 AD): Early codex containing portions of all four Gospels and the Book of Acts.
  - P46 (Chester Beatty II, c. 175–225 AD): Monumental early collection of the Pauline Epistles and Hebrews.
  - P66 (Bodmer II, c. 200 AD): Nearly complete codex of the Gospel of John.
  - P75 (Bodmer XIV–XV, c. 175–225 AD): Exceptional witness to Luke and John, demonstrating textual affinity with Codex Vaticanus.

• Uncials (Majuscules) vs. Minuscules (Cursives): Uncials are ancient manuscripts written entirely in large, detached Greek capital letters without word spacing or punctuation (scriptio continua) from the 2nd to 9th centuries AD; Minuscules are later manuscripts written in smaller, flowing cursive handwriting with standard accents and breathing marks from the 9th to 16th centuries.

• Palimpsest (παλίμψηστος): A vellum or parchment manuscript whose original text was scraped, washed, or buffed away so the costly animal skin could be reused for a secondary text, now recoverable through ultraviolet analysis and digital reflectance spectroscopy.

• Apparatus Criticus: The concise scholarly notation system situated at the foot of critical Greek or Hebrew biblical editions (e.g., Nestle-Aland NA28 or BHS), rigorously cataloging variant readings, scribal omissions, additions, and manuscript witnesses.`
      },
      {
        id: 'textual-criticism-and-variants',
        heading: 'ARTICLE III — Textual Criticism, Principles & Variant Classifications',
        content: `• Lower Criticism (Textual Criticism): The scholarly discipline that analyzes, compares, and evaluates all surviving biblical manuscripts, codices, lectionaries, and patristic citations to reconstruct the exact wording of the original inspired autographs.

• Higher Criticism (Historical-Grammatical / Literary Criticism): The study of literary composition, historical authorship, date, audience, literary integrity, and source origins of biblical books.

• Lectio Difficilior Potior: The premier canon of textual criticism: "The more difficult reading is preferable." Scribes were far more likely to smooth out, explain, harmonize, or soften a challenging, puzzling, or grammatically awkward reading than to introduce one.

• Lectio Brevior Potior: The text-critical guideline: "The shorter reading is preferable." Ancient scribes tended to expand biblical texts by incorporating marginal explanatory glosses, liturgical prayers, and harmonizations from parallel passages.

• Scribal Errors of Sight (Visual Variants):
  - Dittography: The inadvertent repetition of a letter, word, or entire clause by a copyist whose eye returned to the wrong position.
  - Haplography: The accidental omission of a letter, word, or sentence when identical or similar characters occur consecutively.
  - Homoioteleuton: Omission of text occurring when two sentences or clauses end with identical words or endings, causing the scribe's eye to skip forward from the first instance to the second.
  - Homoioarcton: Omission caused when two lines or clauses begin with identical phrasing, causing the copyist's eye to jump ahead.
  - Metathesis: The accidental transposition or swapping of adjacent letters, syllables, or words within a line.

• Scribal Errors of Hearing (Auditory Variants):
  - Itacism (Iotacism): The phonetic shift in Hellenistic Greek where vowels and diphthongs with previously distinct sounds (ι, η, υ, ει, οι, υι) all came to be pronounced as the long "ee" sound, causing acoustic confusion during oral scriptorium dictation (e.g., confusing hēmeis ["we"] with hymeis ["you"]).

• Textus Receptus (TR): The "Received Text"—the family of printed Greek New Testament editions initiated by Desiderius Erasmus (1516), refined by Robert Estienne (Stephanus 1550), Theodore Beza (1565–1604), and the Elzevir brothers (1624/1633). It served as the Greek master text for the Protestant Reformation and the Authorized King James Bible (1611).

• Byzantine Majority Text: The widespread manuscript tradition preserved in over 80% of surviving Greek minuscules and Eastern Church lectionaries, characterized by grammatical polish, full narrative flow, and high harmonization.

• Alexandrian Text-Type: The ancient textual family preserved primarily in Egyptian papyri and early uncials (Sinaiticus, Vaticanus), characterized by concise, abrupt, and non-harmonized readings; forms the primary foundation for modern critical texts (Nestle-Aland / UBS).

• Western Text-Type: An ancient, widely distributed textual tradition attested in Codex Bezae, Old Latin translations, and the early Western Church Fathers (Tertullian, Cyprian), marked by lively narrative paraphrases, explanatory insertions, and biographical details.

• Critical Textual Passages:
  - Pericope Adulterae (John 7:53–8:11): The account of the woman caught in adultery, absent from the earliest Alexandrian papyri and uncials (P66, P75, א, B), yet cherished throughout Western and Byzantine traditions for its supreme manifestation of Christ's mercy and holiness.
  - Comma Johanneum (1 John 5:7–8): The explicit Trinitarian clause ("in heaven: the Father, the Word, and the Holy Ghost: and these three are one"), found in late Latin Vulgate witnesses and Erasmus's 1522 Greek edition via Codex Montfortianus.
  - Markan Shorter and Longer Endings (Mark 16:9–20): The post-resurrection appearances of Christ; present in the overwhelming majority of Greek manuscripts, the Syriac Peshitta, and Old Latin, though absent in Codices Sinaiticus and Vaticanus.`
      },
      {
        id: 'hermeneutics-and-literary-forms',
        heading: 'ARTICLE IV — Hermeneutics, Exegesis & Literary Forms',
        content: `• Hermeneutics (Ἑρμηνευτική): The systematic science and art of biblical interpretation. It establishes the theological framework, linguistic rules, and contextual methods required to understand what the biblical text meant in its original setting and what it authoritatively signifies today.

• Exegesis vs. Eisegesis: Exegesis (from ek, "out of") is the rigorous, objective extraction of the author's intended meaning out of the biblical text; eisegesis (from eis, "into") is the subjective, illegitimate insertion of personal assumptions, cultural biases, or theological presuppositions into the text.

• Analogia Fidei (Analogy of Faith): The classic Reformation hermeneutical maxim that "Scripture interprets Scripture" (Scriptura Sacra sui ipsius interpres). Clear, didactic passages illuminate obscure, figurative passages, and no single verse may be interpreted so as to contradict the unified theological witness of the entire canon.

• Grammatical-Historical Method: The hermeneutical approach that analyzes the grammar, syntax, lexical semantics, historical occasion, cultural customs, and geographical circumstances of a biblical passage to discover the original author's intended meaning.

• Sensus Plenior: The "fuller meaning" intended by God as the divine Author that transcends the conscious awareness of the human prophet, unveiled through subsequent progressive revelation and fulfilled in the New Testament (e.g., the virgin birth typology in Isaiah 7:14 and Matthew 1:22–23).

• Typology (Type and Antitype): The divinely orchestrated historical correspondence between Old Testament persons, institutions, sacrifices, or historical events (the Type, e.g., the Passover Lamb, the Tabernacle, Melchizedek) and their ultimate spiritual realization in Jesus Christ and His Kingdom (the Antitype).

• Chiasm / Chiastic Structure: An artistic Hebrew and Greek literary device where words, concepts, or narrative blocks are arranged in an inverted parallel order (A-B-C-B'-A' or A-B-C-D-C'-B'-A'), deliberately focusing the reader's attention upon the thematic climax at the center (C or D).

• Inclusio (Envelope Construction): A literary frame in which a narrative, psalm, or discourse begins and ends with the identical phrase, keyword, or theological statement, marking the boundary of a cohesive literary unit (e.g., Psalm 8:1 and 8:9: "O LORD our Lord, how excellent is thy name in all the earth!").

• Hebrew Poetic Parallelism: The correspondence of thought, rhythm, and theological meaning between adjacent lines of Hebrew poetry:
  - Synonymous Parallelism: The second poetic line restates the thought of the first line using different vocabulary (Psalm 19:1: "The heavens declare the glory of God; and the firmament sheweth his handywork").
  - Antithetic Parallelism: The second line sharpens the first by stating the contrasting opposite truth (Proverbs 10:1: "A wise son maketh a glad father: but a foolish son is the heaviness of his mother").
  - Synthetic / Climactic Parallelism: The second line builds upon, completes, or escalates the thought begun in the first (Psalm 29:1: "Give unto the LORD, O ye mighty, give unto the LORD glory and strength").

• Pericope: An identifiable, cohesive passage or narrative segment of Holy Scripture (e.g., a miracle narrative, a parable, or a liturgical hymn) suitable for liturgical reading, preaching, or standalone exegetical analysis.

• Sitz im Leben: The "setting in life"—the specific historical, social, political, and religious environment in which a biblical text was first composed, spoken, or utilized within the ancient covenant community.

• Biblical Literary Genres: The distinct literary forms employed by the Holy Spirit: Historical Narrative, Mosaic Law/Torah, Wisdom Literature, Poetic Lyrics, Prophetic Oracles, Gospels, Epistles, and Apocalyptic Visions.`
      },
      {
        id: 'lexicons-and-concordances',
        heading: 'ARTICLE V — Lexicons, Concordances & Exegetical Reference Systems',
        content: `• Strong’s Exhaustive Concordance: The monumental indexing masterwork completed in 1890 by Dr. James Strong and over 100 colleagues. It catalogs every occurrence of every word in the King James Version, assigning a unique numerical identifier to every Hebrew root word (H1 to H8674) and Greek root word (G1 to G5624), unlocking original-language study for believers worldwide.

• Brown-Driver-Briggs (BDB): *A Hebrew and English Lexicon of the Old Testament* (1906), prepared by Francis Brown, S. R. Driver, and Charles A. Briggs based on Gesenius. Arranged by triliteral root, it remains the standard reference for Semitic etymologies, cognates, and classical Old Testament lexicography.

• Gesenius' Hebrew and Chaldee Lexicon: Wilhelm Gesenius's foundational 19th-century philological masterwork, translated and updated by Samuel Prideaux Tregelles, providing rigorous grammatical analysis of Old Testament Hebrew and Aramaic.

• BDAG (Bauer-Danker-Arndt-Gingrich): *A Greek-English Lexicon of the New Testament and Other Early Christian Literature* (3rd Edition, 2000). Globally acclaimed as the undisputed standard academic lexicon for New Testament Greek, Hellenistic papyri, and the Apostolic Fathers.

• Thayer’s Greek-English Lexicon: Joseph Henry Thayer's celebrated 1889 translation and revision of Christian Gottlob Wilke's *Clavis Novi Testamenti*, renowned for rich theological explanations, classical citations, and seamless integration with Strong's numbering system.

• Liddell-Scott-Jones (LSJ): *A Greek-English Lexicon* (Oxford University Press), the definitive master lexicon spanning the entire breadth of ancient Greek literature from Homer (8th century BC) through Byzantine times.

• Theological Dictionary of the New Testament (TDNT / "Kittel"): The monumental multi-volume theological reference work edited by Gerhard Kittel and Gerhard Friedrich, tracing the linguistic, Septuagintal, intertestamental, and rabbinic background of every major New Testament theological concept.

• Theological Wordbook of the Old Testament (TWOT): R. Laird Harris, Gleason L. Archer Jr., and Bruce K. Waltke's 2-volume evangelical lexical guide, providing deep theological treatises on the religious significance of Old Testament Hebrew vocabulary.

• Louw-Nida Semantic Domains: *Greek-English Lexicon of the New Testament Based on Semantic Domains* (Johannes P. Louw and Eugene A. Nida), categorizing Greek vocabulary by conceptual domains rather than alphabetical roots, revolutionizing modern translation theory.

• Interlinear Scripture Engine: The computational presentation of Holy Scripture that displays the original Hebrew, Aramaic, or Greek text aligned vertically word-for-word with its English translation, root lemma, grammatical morphology parsing, and Strong's concordance tag.`
      },
      {
        id: 'historical-translations-and-lineage',
        heading: 'ARTICLE VI — Historical Translations, Protestant Reformation & English Bible Lineage',
        content: `• John Wycliffe's Bible (1382): The first complete English translation of Holy Scripture, rendered from the Latin Vulgate by the "Morning Star of the Reformation" and distributed by itinerant Lollard preachers across England despite fierce ecclesiastical persecution.

• William Tyndale New Testament (1526): The revolutionary masterwork translated directly from original Greek (Erasmus TR) and Hebrew into vibrant Early Modern English. Tyndale's heroic scholarship gave the English language over 80% of the phrasing found in the King James Bible. Betrayed and martyred at Vilvoorde in 1536, his dying prayer was: "Lord, open the King of England's eyes."

• Miles Coverdale Bible (1535): The first complete printed English Bible, compiled by Myles Coverdale by synthesizing Tyndale's translations with additional German and Latin versions under the patronage of Thomas Cromwell.

• Matthew Bible (1537): Prepared by Tyndale's disciple John Rogers under the pseudonym Thomas Matthew, combining Tyndale's published New Testament, Tyndale's unpublished Old Testament manuscripts (Genesis through 2 Chronicles), and Coverdale, with the first extensive English marginal study notes.

• The Great Bible (1539): The first authorized English Bible commissioned by King Henry VIII and edited by Miles Coverdale, ordered to be chained to the pulpit of every parish church across England for public reading (the "Chained Bible").

• The Geneva Bible (1560): The beloved Bible of the English Reformers, the Puritans, William Shakespeare, and the Mayflower Pilgrims. Produced in Geneva by Marian exiles including William Whittingham and John Knox, it was the first English Bible to feature numbered verses, chapter summaries, maps, and extensive Calvinistic study notes.

• The Bishops’ Bible (1568): A revision of the Great Bible prepared by bishops of the Church of England under Archbishop Matthew Parker during the reign of Queen Elizabeth I to counter the popular influence of the Geneva Bible.

• The Authorized King James Version (1611): Commissioned by King James I at the Hampton Court Conference (1604) and produced by 47 eminent scholars organized into six companies at Westminster, Oxford, and Cambridge. Translated directly from the Hebrew Masoretic Text and Greek Textus Receptus, it represents the supreme crown jewel of English prose and sacred literature.

• The 1769 Oxford Blayney Edition: The definitive revision of the King James Version executed by Dr. Benjamin Blayney at Oxford University. It standardized archaic spelling, modernized punctuation, verified italicized supplied words, and expanded cross-references, establishing the standard KJV text in global use today.

• The New King James Version (NKJV 1982): A conservative, reverent modernization commissioned by Thomas Nelson, retaining the lyric majesty, cadence, and Textus Receptus foundation of the 1611 KJV while updating archaic pronouns and vocabulary.

• The Berean Standard Bible (BSB 2023): A modern, exquisitely accurate, transparent English translation created by the Berean Translation Committee, dedicated entirely to the Public Domain (CC0) for unhindered worldwide ministry and technological integration.`
      },
      {
        id: 'african-vernacular-heritage',
        heading: 'ARTICLE VII — African Vernacular Translation & Ghanaian Mother-Tongue Heritage',
        content: `• The Basel Evangelical Missionary Society (Basler Mission): The pietist missionary society founded in Switzerland (1815) that established deep educational, linguistic, agricultural, and theological roots on the Gold Coast (Ghana) starting in 1828, championing native mother-tongue literacy.

• Johannes Gottlieb Christaller (1827–1895): The preeminent German philologist and Basel missionary who codified the grammar and orthography of the Akan language. He translated the monumental complete 1871 Twi Bible (Anyamesɛm Anaa Twerɛ Kronkron), authored the 1875 Twi Grammar, and compiled the 1881 *Dictionary of the Asante and Fante Language Called Tshi (Chwee, Twi)*, universally recognized as a masterpiece of African linguistics.

• David Asante (1834–1892): The first ordained native Gold Coast Basel missionary, royal prince of Akropong-Akuapem, and scholar who co-labored with Christaller to translate the full Holy Scriptures into Akan, also translating John Bunyan's *Pilgrim's Progress* (Kristofo Akwantuo) into Twi.

• Twerɛ Kronkron (Asante Twi): The sacred Holy Bible translated into the Asante dialect of Akan, beloved across millions of believers in Ghana and the worldwide diaspora, noted for its expressive oral resonance, rich metaphors, and theological depth.

• Kyerew Kronkron (Akuapem Twi): The historic literary standard translation produced at Akropong-Akuapem, providing the foundational orthography, grammar, and formal theological prose for Akan biblical literature.

• Mfantse Bible (Nwoma Kronkron): The Holy Scriptures translated into the coastal Fante dialect of Akan, pioneered through Methodist missions and Cape Coast indigenous scholarship.

• Onyankopɔn (O-Nyame-koro-pɔn): The Great and Only God of Eternity; the supreme, uncreated Creator God in traditional Akan cosmology who created all things (Bɔrebɔre) and rules sovereignly over the cosmos.

• Tweaduampɔn (Tweaduampɔn Kwame): The Almighty God who supports everything without stumbling; the rock-solid pillar upon whom humanity can lean without fear of collapse.

• Nyame (Onyame): The living God, the giver of light, life, and breath; the loving, all-sustaining Deity whom every child knows by innate instinct ("Obi nkyerɛ abofra Nyame"—"No one needs to teach a child that God exists").

• Ogyefo & Agyenkwa: The Akan theological titles for our Lord Jesus Christ: Ogyefo (The Mighty Redeemer who snatches the captive from the clutches of death) and Agyenkwa (The Life-Giver and Savior who imparts everlasting zoe-life).

• Honhom Kronkron: The Holy Spirit in the Akan language—Honhom (Breath, Wind, Invisible Divine Essence) and Kronkron (Holiness, purity, immaculate radiance, set apart).

• Asɛm No (The Logos): The Divine Word of God incarnate in Jesus Christ (John 1:1, 14: "Mfididie no mu na Asɛm no wɔe, na Asɛm no ne Nyankopɔn na ɛwɔe, na Asɛm no nso ne Nyankopɔn").

• Nkwagyeɛ: Salvation, deliverance, and holistic preservation of life; the complete rescue of the human soul and body through the finished cross of Christ.

• Adom: Unmerited favor, sovereign grace, divine gift; the freely given grace of God upon which all redemption and eternal life rest.

• Johannes Zimmermann (1825–1876): Basel missionary who codified the Ga language of Accra, translating the entire Holy Bible into Ga (Ga Biblia) in 1866 and compiling the first Ga dictionary.`
      },
      {
        id: 'systematic-theology-and-covenants',
        heading: 'ARTICLE VIII — Systematic Theology, Christology & Biblical Covenants',
        content: `• Biblical Covenants (Foedus): The sovereign divine pacts structuring redemptive history:
  - Adamic Covenant: Creation mandate and probationary covenant of works in Eden (Genesis 1–2; Hosea 6:7).
  - Noahic Covenant: Common grace covenant preserving creation and seasonal regularity (Genesis 9).
  - Abrahamic Covenant: Unconditional covenant of election, nationhood, seed, and global blessing (Genesis 12, 15, 17).
  - Mosaic Covenant: The legal and pedagogical covenant delivered at Mount Sinai structuring Israel's civil, ceremonial, and moral holiness (Exodus 19–24; Galatians 3:24).
  - Davidic Covenant: The eternal royal dynastic covenant promising that David's royal seed shall reign forever upon the throne (2 Samuel 7; Psalm 89).
  - The New Covenant (B'rit Chadashah): The eternal covenant instituted by Jesus Christ in His own blood, imparting regeneration, forgiveness of sins, and the law written upon the heart (Jeremiah 31:31–34; Luke 22:20; Hebrews 8).

• The Five Solas of the Protestant Reformation:
  - Sola Scriptura: Scripture alone is the sole infallible rule of faith and practice.
  - Sola Fide: Justification is received through faith alone, without human merit or works.
  - Sola Gratia: Salvation is by unmerited divine grace alone from regeneration to final glorification.
  - Solus Christus: Christ alone is the mediator, Redeemer, and head of the Church.
  - Soli Deo Gloria: All glory belongs to God alone in creation, providence, and redemption.

• Verbal Plenary Inspiration: The historic doctrine that every single word (verbal) and all parts (plenary) of Holy Scripture in the original autographs were breathed out by God (theopneustos, 2 Timothy 3:16) through human instruments without error.

• Inerrancy & Infallibility: Inerrancy means the Scriptures are wholly true, free from error in all matters they affirm (scientific, historical, geographical, and theological); infallibility means the Scriptures cannot fail or lead astray in their divine purpose.

• Hypostatic Union: The theological truth formulated at the Council of Chalcededon (451 AD) that our Lord Jesus Christ is one divine Person possessing two complete, distinct, and unconfused natures—truly God and truly man—forever united without division, change, or separation.

• Penal Substitutionary Atonement: The core gospel doctrine that Jesus Christ on the cross bore the full divine wrath and legal penalty due for the sins of His people, satisfying divine justice as their blameless substitute (Isaiah 53; Romans 3:25; 2 Corinthians 5:21).

• Justification: The judicial act of God whereby He declares a guilty sinner righteous solely through the imputed righteousness of Jesus Christ received by faith alone.

• Sanctification & Glorification: Sanctification is the progressive, lifetime work of the Holy Spirit conforming the believer into the image of Christ; Glorification is the final, instantaneous transformation of the believer's body and soul into sinless, immortal perfection at the Parousia.

• Regeneration (New Birth / Palin-genesia): The sovereign, monergistic work of the Holy Spirit imparting spiritual life to dead sinners, enabling faith and repentance.

• Eschatology & Parousia: The doctrine of last things; the Parousia (Personal, bodily, glorious second coming of Jesus Christ to judge the living and the dead, resurrect the saints, and inaugurate the New Heavens and the New Earth).`
      },
      {
        id: 'biblical-canon-and-apocrypha',
        heading: 'ARTICLE IX — The Biblical Canon, Deuterocanon & Ancient Apocrypha',
        content: `• Biblical Canon (Kanon / קָנֶה): From the reed or measuring rod; the authoritative collection of divinely inspired books recognized by the Church as the standard of truth and faith.

• Proto-Canonical Books: The 66 books (39 Old Testament, 27 New Testament) whose divine inspiration and canonical status have been universally acknowledged by orthodox Judaism and the historic Protestant Church.

• Deuterocanonical Books: The 7 books (Tobit, Judith, 1 & 2 Maccabees, Wisdom of Solomon, Sirach/Ecclesiasticus, Baruch) and additions to Esther and Daniel, accepted as canonical by the Roman Catholic Church (Trent 1546) and Eastern Orthodox churches, but recognized as non-inspired historical and ethical writings by the Protestant Reformers.

• The Apocrypha: From apokryphos ("hidden"); the intertestamental Jewish writings excluded from the Hebrew canon of the Old Testament. As declared in Article VI of the 39 Articles of Religion (1562), "the Church doth read them for example of life and instruction of manners; but yet doth it not apply them to establish any doctrine."

• Pseudepigrapha: Ancient religious texts falsely attributed to biblical patriarchs or prophets (e.g., 1 Enoch, Jubilees, Testaments of the Twelve Patriarchs, Apocalypse of Baruch), valuable for understanding Jewish apocalyptic thought in the Second Temple period.

• Historical Councils on the Canon:
  - Council of Rome (382 AD) & Council of Carthage (397 AD): Early Western ecclesiastical synods that affirmed the 27 books of the New Testament.
  - Council of Trent (1546 AD): The Counter-Reformation Roman Catholic council that dogmatically canonized the Vulgate and the Deuterocanonical books under anathema.
  - Westminster Confession of Faith (1646): The definitive Reformed confessional statement affirming the 66 canonical books as the sole infallible Word of God.`
      },
      {
        id: 'expository-preaching-and-liturgy',
        heading: 'ARTICLE X — Expository Preaching, Liturgy & Devotional Terms',
        content: `• Expository Preaching (Lectio Continua): The systematic, verse-by-verse preaching through entire books of Holy Scripture, ensuring that the central point of the biblical passage becomes the central point of the sermon.

• Lectio Divina: The ancient Christian practice of contemplative prayer and meditation on Scripture comprising four movements: Lectio (reading), Meditatio (meditation), Oratio (prayer), and Contemplatio (resting in the presence of God).

• Doxology & Benediction: A doxology is an expression of praise to the Triune God (e.g., Jude 24–25; Romans 11:33–36); a benediction is an authoritative pronouncement of divine blessing upon the assembled congregation (e.g., Numbers 6:24–26; 2 Corinthians 13:14).

• Epiclesis & Anaphora: Epiclesis is the liturgical invocation of the Holy Spirit upon the Word or communion elements; Anaphora is the great Eucharistic prayer of thanksgiving and dedication.

• Classic Commentary Tradition:
  - Matthew Henry (1662–1714): The renowned Nonconformist English minister whose 6-volume *Exposition of the Old and New Testaments* provides unmatched practical, devotional, and pastoral exposition.
  - Jamieson-Fausset-Brown (JFB 1871): The comprehensive, verse-by-verse critical, explanatory, and practical commentary produced by Robert Jamieson, A. R. Fausset, and David Brown, balancing textual scholarship with warm evangelical piety.

• AduBible Sovereign Study Vault: The integrated digital repository combining parallel scriptures (KJV, NKJV, Asante Twi, Akuapem Twi, Berean Standard Bible, Greek TR, and Hebrew MT) with verse-by-verse classic commentaries, Strong's Greek/Hebrew lexicons, and mother-tongue audio streaming for global discipleship.`
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
