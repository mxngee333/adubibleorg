/**
 * ADUBIBLE / ELOHIM BIBLE HUB — D1 DATABASE SEED GENERATOR
 * Exports SQL seed script for Cloudflare D1 edge database
 * Usage: node scripts/seed-d1.js > cloudflare/seed-data.sql
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read raw source files to extract data without TS compile step
const booksTsPath = path.join(__dirname, '../src/data/bibleBooks.ts');
const langTsPath = path.join(__dirname, '../src/data/languagesRegistry.ts');

console.log('-- ====================================================================');
console.log('-- ADUBIBLE D1 SEED SCRIPT — CANONICAL BOOKS, VERSIONS & LANGUAGES');
console.log('-- ====================================================================');
console.log('BEGIN TRANSACTION;');

// 1. Essential canonical books SQL
const canonicalBooks = [
  ['GEN', 'genesis', 1, 'OT', 'Pentateuch', 50, 'Moses', 'Patriarchal'],
  ['EXO', 'exodus', 2, 'OT', 'Pentateuch', 40, 'Moses', 'Exodus & Wilderness'],
  ['LEV', 'leviticus', 3, 'OT', 'Pentateuch', 27, 'Moses', 'Wilderness'],
  ['NUM', 'numbers', 4, 'OT', 'Pentateuch', 36, 'Moses', 'Wilderness'],
  ['DEU', 'deuteronomy', 5, 'OT', 'Pentateuch', 34, 'Moses', 'Wilderness'],
  ['JOS', 'joshua', 6, 'OT', 'Historical', 24, 'Joshua', 'Conquest of Canaan'],
  ['JDG', 'judges', 7, 'OT', 'Historical', 21, 'Samuel', 'Judges Era'],
  ['RUT', 'ruth', 8, 'OT', 'Historical', 4, 'Samuel', 'Judges Era'],
  ['1SA', '1-samuel', 9, 'OT', 'Historical', 31, 'Samuel / Nathan / Gad', 'United Monarchy'],
  ['2SA', '2-samuel', 10, 'OT', 'Historical', 24, 'Nathan / Gad', 'United Monarchy'],
  ['1KI', '1-kings', 11, 'OT', 'Historical', 22, 'Jeremiah', 'Divided Kingdom'],
  ['2KI', '2-kings', 12, 'OT', 'Historical', 25, 'Jeremiah', 'Divided Kingdom & Exile'],
  ['1CH', '1-chronicles', 13, 'OT', 'Historical', 29, 'Ezra', 'Post-Exilic Reflection'],
  ['2CH', '2-chronicles', 14, 'OT', 'Historical', 36, 'Ezra', 'Post-Exilic Reflection'],
  ['EZR', 'ezra', 15, 'OT', 'Historical', 10, 'Ezra', 'Post-Exilic Restoration'],
  ['NEH', 'nehemiah', 16, 'OT', 'Historical', 13, 'Nehemiah', 'Post-Exilic Restoration'],
  ['EST', 'esther', 17, 'OT', 'Historical', 10, 'Mordecai / Unknown', 'Persian Diaspora'],
  ['JOB', 'job', 18, 'OT', 'Poetic & Wisdom', 42, 'Unknown / Job / Moses', 'Patriarchal'],
  ['PSA', 'psalms', 19, 'OT', 'Poetic & Wisdom', 150, 'David, Asaph, Sons of Korah, Moses, Solomon', 'Monarchy to Post-Exile'],
  ['PRO', 'proverbs', 20, 'OT', 'Poetic & Wisdom', 31, 'Solomon, Agur, Lemuel', 'United Monarchy'],
  ['ECC', 'ecclesiastes', 21, 'OT', 'Poetic & Wisdom', 12, 'Solomon', 'United Monarchy'],
  ['SNG', 'song-of-solomon', 22, 'OT', 'Poetic & Wisdom', 8, 'Solomon', 'United Monarchy'],
  ['ISA', 'isaiah', 23, 'OT', 'Major Prophets', 66, 'Isaiah', 'Divided Kingdom'],
  ['JER', 'jeremiah', 24, 'OT', 'Major Prophets', 52, 'Jeremiah', 'Late Monarchy & Exile'],
  ['LAM', 'lamentations', 25, 'OT', 'Major Prophets', 5, 'Jeremiah', 'Destruction of Jerusalem'],
  ['EZK', 'ezekiel', 26, 'OT', 'Major Prophets', 48, 'Ezekiel', 'Babylonian Exile'],
  ['DAN', 'daniel', 27, 'OT', 'Major Prophets', 12, 'Daniel', 'Babylonian & Persian Exile'],
  ['HOS', 'hosea', 28, 'OT', 'Minor Prophets', 14, 'Hosea', 'Divided Kingdom (Israel)'],
  ['JOL', 'joel', 29, 'OT', 'Minor Prophets', 3, 'Joel', 'Judah Monarchy'],
  ['AMO', 'amos', 30, 'OT', 'Minor Prophets', 9, 'Amos', 'Divided Kingdom (Israel)'],
  ['OBA', 'obadiah', 31, 'OT', 'Minor Prophets', 1, 'Obadiah', 'Post-Fall of Jerusalem'],
  ['JON', 'jonah', 32, 'OT', 'Minor Prophets', 4, 'Jonah', 'Divided Kingdom'],
  ['MIC', 'micah', 33, 'OT', 'Minor Prophets', 7, 'Micah', 'Divided Kingdom (Judah)'],
  ['NAM', 'nahum', 34, 'OT', 'Minor Prophets', 3, 'Nahum', 'Fall of Nineveh'],
  ['HAB', 'habakkuk', 35, 'OT', 'Minor Prophets', 3, 'Habakkuk', 'Babylonian Incursion'],
  ['ZEP', 'zephaniah', 36, 'OT', 'Minor Prophets', 3, 'Zephaniah', 'Judah Monarchy'],
  ['HAG', 'haggai', 37, 'OT', 'Minor Prophets', 2, 'Haggai', 'Post-Exilic Temple Reconstruction'],
  ['ZEC', 'zechariah', 38, 'OT', 'Minor Prophets', 14, 'Zechariah', 'Post-Exilic Temple Reconstruction'],
  ['MAL', 'malachi', 39, 'OT', 'Minor Prophets', 4, 'Malachi', 'Post-Exilic Closure'],
  ['MAT', 'matthew', 40, 'NT', 'Gospels', 28, 'Matthew (Levi)', 'First Century (c. 55-65 AD)'],
  ['MRK', 'mark', 41, 'NT', 'Gospels', 16, 'John Mark', 'First Century (c. 50-60 AD)'],
  ['LUK', 'luke', 42, 'NT', 'Gospels', 24, 'Luke the Physician', 'First Century (c. 60-62 AD)'],
  ['JHN', 'john', 43, 'NT', 'Gospels', 21, 'John the Apostle', 'First Century (c. 85-95 AD)'],
  ['ACT', 'acts', 44, 'NT', 'Apostolic History', 28, 'Luke the Physician', 'Apostolic Age (c. 62-64 AD)'],
  ['ROM', 'romans', 45, 'NT', 'Pauline Epistles', 16, 'Paul the Apostle', 'c. 57 AD (from Corinth)'],
  ['1CO', '1-corinthians', 46, 'NT', 'Pauline Epistles', 16, 'Paul the Apostle', 'c. 55 AD (from Ephesus)'],
  ['2CO', '2-corinthians', 47, 'NT', 'Pauline Epistles', 13, 'Paul the Apostle', 'c. 56 AD (from Macedonia)'],
  ['GAL', 'galatians', 48, 'NT', 'Pauline Epistles', 6, 'Paul the Apostle', 'c. 49-50 AD (from Antioch)'],
  ['EPH', 'ephesians', 49, 'NT', 'Pauline Epistles', 6, 'Paul the Apostle', 'c. 60-62 AD (Roman Imprisonment)'],
  ['PHP', 'philippians', 50, 'NT', 'Pauline Epistles', 4, 'Paul the Apostle', 'c. 61-62 AD (Roman Imprisonment)'],
  ['COL', 'colossians', 51, 'NT', 'Pauline Epistles', 4, 'Paul the Apostle', 'c. 60-62 AD (Roman Imprisonment)'],
  ['1TH', '1-thessalonians', 52, 'NT', 'Pauline Epistles', 5, 'Paul the Apostle', 'c. 51 AD (from Corinth)'],
  ['2TH', '2-thessalonians', 53, 'NT', 'Pauline Epistles', 3, 'Paul the Apostle', 'c. 51-52 AD (from Corinth)'],
  ['1TI', '1-timothy', 54, 'NT', 'Pauline Epistles', 6, 'Paul the Apostle', 'c. 63-65 AD (from Macedonia)'],
  ['2TI', '2-timothy', 55, 'NT', 'Pauline Epistles', 4, 'Paul the Apostle', 'c. 66-67 AD (Final Roman Mamertine Imprisonment)'],
  ['TIT', 'titus', 56, 'NT', 'Pauline Epistles', 3, 'Paul the Apostle', 'c. 63-65 AD (from Macedonia/Nicopolis)'],
  ['PHM', 'philemon', 57, 'NT', 'Pauline Epistles', 1, 'Paul the Apostle', 'c. 60-62 AD (Roman Imprisonment)'],
  ['HEB', 'hebrews', 58, 'NT', 'General Epistles', 13, 'Apostolic Author (Paul / Apollos / Barnabas)', 'Pre-70 AD'],
  ['JAS', 'james', 59, 'NT', 'General Epistles', 5, 'James (Brother of the Lord)', 'c. 45-48 AD'],
  ['1PE', '1-peter', 60, 'NT', 'General Epistles', 5, 'Peter the Apostle', 'c. 62-64 AD (from Rome/Babylon)'],
  ['2PE', '2-peter', 61, 'NT', 'General Epistles', 3, 'Peter the Apostle', 'c. 66-67 AD (Before Martyrdom)'],
  ['1JN', '1-john', 62, 'NT', 'General Epistles', 5, 'John the Apostle', 'c. 85-95 AD (from Ephesus)'],
  ['2JN', '2-john', 63, 'NT', 'General Epistles', 1, 'John the Apostle', 'c. 85-95 AD (from Ephesus)'],
  ['3JN', '3-john', 64, 'NT', 'General Epistles', 1, 'John the Apostle', 'c. 85-95 AD (from Ephesus)'],
  ['JUD', 'jude', 65, 'NT', 'General Epistles', 1, 'Jude (Brother of James)', 'c. 65-70 AD'],
  ['REV', 'revelation', 66, 'NT', 'Apocalyptic', 22, 'John the Apostle', 'c. 95-96 AD (Patmos Exile)']
];

for (const b of canonicalBooks) {
  const namesJson = JSON.stringify({ en: b[1].replace(/-/g, ' ').toUpperCase() }).replace(/'/g, "''");
  console.log(`INSERT OR REPLACE INTO books (id, slug, number, testament, category, chapters, author, historical_era, names_json) VALUES ('${b[0]}', '${b[1]}', ${b[2]}, '${b[3]}', '${b[4]}', ${b[5]}, '${b[6]}', '${b[7]}', '${namesJson}');`);
}

// 2. Built-in Versions
const versions = [
  ['nkjv', 'NKJV', 'New King James Version (Study Edition)', 'NKJV', 'en', 'English', 'English', '1982', 'Thomas Nelson / Public Domain Study Notes', 1, 0, 'ltr', 'r2', 'BSB', '1', 'Flagship parallel study translation with Strong concordance cross-references'],
  ['kjv', 'KJV', 'King James Version (1769 Authorized)', 'KJV', 'en', 'English', 'English', '1769', 'Public Domain (Crown Copyright in UK)', 1, 0, 'ltr', 'r2', 'KJV', '1', 'Classic Authorized Version with Strong numbers and archaic morphology notes'],
  ['twi', 'TWI', 'Asante Twi Twerɛ Kronkron', 'Twi', 'tw', 'Twi', 'Twi (Asante)', '1909', 'Bible Society of Ghana / Public Domain', 0, 0, 'ltr', 'r2', 'twi', '100', 'Flagship Ghanaian mother-tongue translation for West African diaspora'],
  ['ak-twi', 'AK-TWI', 'Akuapem Twi Twerɛ Kronkron', 'Akuapem', 'ak', 'Akuapem Twi', 'Akuapem Twi', '1871', 'Christaller Basel Mission / Public Domain', 0, 0, 'ltr', 'r2', 'aktwi', '101', 'Historic Christaller translation of the Holy Scriptures into Akuapem Twi'],
  ['bsb', 'BSB', 'Berean Standard Bible', 'BSB', 'en', 'English', 'English', '2016', 'CC0 Public Domain Dedication', 1, 0, 'ltr', 'r2', 'BSB', '2', 'Modern transparent literal translation released under CC0 public domain'],
  ['web', 'WEB', 'World English Bible', 'WEB', 'en', 'English', 'English', '2000', 'Public Domain', 1, 0, 'ltr', 'r2', 'WEB', '3', 'Modern English public domain translation based on the American Standard Version'],
  ['grc-tr', 'TR', 'Textus Receptus (Greek New Testament)', 'TR Greek', 'el', 'Koine Greek', 'Ἑλληνική', '1550', 'Public Domain (Stephanus 1550 / Scrivener 1894)', 1, 1, 'ltr', 'r2', 'TR', '4', 'Historic Greek text underlying the Reformation Bibles with morphological parsing'],
  ['heb-wlc', 'WLC', 'Westminster Leningrad Codex (Hebrew OT)', 'WLC Hebrew', 'he', 'Biblical Hebrew', 'עִבְרִית', '1008', 'Public Domain (J. Alan Groves Center)', 1, 1, 'rtl', 'r2', 'WLC', '5', 'Vocalized and cantillated Hebrew Masoretic text from the oldest complete manuscript']
];

for (const v of versions) {
  console.log(`INSERT OR REPLACE INTO versions (id, code, name, short_name, language_code, language_name, native_language_name, year, copyright, has_strongs, is_interlinear, dir, source_type, helloao_id, bolls_id, description) VALUES ('${v[0]}', '${v[1]}', '${v[2]}', '${v[3]}', '${v[4]}', '${v[5]}', '${v[6]}', '${v[7]}', '${v[8]}', ${v[9]}, ${v[10]}, '${v[11]}', '${v[12]}', '${v[13]}', '${v[14]}', '${v[15]}');`);
}

// 3. Core Strong's Lexicon Sample
const strongs = [
  ['G2128', 'εὐλογητός', 'eulogētos', 'yoo-log-ay-tos', 'Adjective', 'Blessed, praised, worthy of adoration; spoken exclusively of God in the New Testament', 8, 'From G2127 (eulogeō)'],
  ['G4309', 'προορίζω', 'proorizō', 'pro-or-id-zo', 'Verb', 'To predetermine, foreordain, mark out boundaries beforehand', 6, 'From G4253 (pro) and G3724 (horizō)'],
  ['G5485', 'χάρις', 'charis', 'khar-ece', 'Noun, Feminine', 'Grace, unmerited divine favor, goodwill, lovingkindness', 156, 'From G5463 (chairō)'],
  ['G4151', 'πνεῦμα', 'pneuma', 'pnyoo-mah', 'Noun, Neuter', 'Spirit, breath, wind; the Holy Spirit of God', 385, 'From G4154 (pneō)'],
  ['H7225', 'רֵאשִׁית', 'reshith', 'ray-sheeth', 'Noun, Feminine', 'Beginning, first, chief part, choice part', 51, 'From H7218 (rosh)'],
  ['H430', 'אֱלֹהִים', 'Elohim', 'el-o-heem', 'Noun, Masculine Plural', 'God, supreme deity, judges; plural of majesty', 2606, 'Plural of H433 (eloah)'],
  ['H1254', 'בָּרָא', 'bara', 'baw-raw', 'Verb', 'To create, shape, form; ex nihilo creation reserved for divine agency', 54, 'Root verb'],
  ['H7704', 'שָׂדֶה', 'sadeh', 'saw-deh', 'Noun, Masculine', 'Field, land, wild country', 329, 'From an unused root']
];

for (const s of strongs) {
  console.log(`INSERT OR REPLACE INTO strongs_lexicon (code, lemma, transliteration, pronunciation, part_of_speech, definition, kjv_occurrences, derivation) VALUES ('${s[0]}', '${s[1]}', '${s[2]}', '${s[3]}', '${s[4]}', '${s[5]}', ${s[6]}, '${s[7]}');`);
}

console.log('COMMIT;');
console.log('-- D1 Seed generation complete');
