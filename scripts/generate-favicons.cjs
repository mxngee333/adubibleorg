const fs = require('fs');
const path = require('path');
const sharp = require('C:/Users/kwame/AppData/Roaming/npm/node_modules/sharp');

const PROJECT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(PROJECT_DIR, 'public');

// 1. High-Contrast, Legible 512x512 Master Favicon SVG
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Base Container: Deep Obsidian with Gold Border -->
  <rect width="512" height="512" rx="108" fill="#0c0a09" />
  <rect width="496" height="496" x="8" y="8" rx="100" fill="none" stroke="#f59e0b" stroke-width="10" stroke-opacity="0.9" />
  
  <!-- Sacred Radiant Center Symbol: High-Contrast Bold Open Bible -->
  <g fill="none" stroke="#f59e0b" stroke-linecap="round" stroke-linejoin="round" transform="translate(68, 88) scale(15.6)">
    <!-- Book Left Page -->
    <path d="M2 4 C5 2.5, 9 2.5, 12 4 L12 18 C9 16.5, 5 16.5, 2 18 Z" fill="#f59e0b" fill-opacity="0.22" stroke="#f59e0b" stroke-width="2.2" />
    <!-- Book Right Page -->
    <path d="M22 4 C19 2.5, 15 2.5, 12 4 L12 18 C15 16.5, 19 16.5, 22 18 Z" fill="#f59e0b" fill-opacity="0.22" stroke="#f59e0b" stroke-width="2.2" />
    <!-- Center Spine Accent & Radiance Marker -->
    <line x1="12" y1="4" x2="12" y2="18" stroke="#fef08a" stroke-width="2.6" />
    <!-- Left Page Inscription Lines -->
    <line x1="4.5" y1="7.5" x2="9.5" y2="7.5" stroke="#fef3c7" stroke-width="1.8" />
    <line x1="4.5" y1="11" x2="9.5" y2="11" stroke="#fef3c7" stroke-width="1.8" />
    <line x1="4.5" y1="14.5" x2="9.5" y2="14.5" stroke="#fef3c7" stroke-width="1.8" />
    <!-- Right Page Inscription Lines -->
    <line x1="14.5" y1="7.5" x2="19.5" y2="7.5" stroke="#fef3c7" stroke-width="1.8" />
    <line x1="14.5" y1="11" x2="19.5" y2="11" stroke="#fef3c7" stroke-width="1.8" />
    <line x1="14.5" y1="14.5" x2="19.5" y2="14.5" stroke="#fef3c7" stroke-width="1.8" />
  </g>
  
  <!-- Sacred Cross / Star of Truth at Top -->
  <path d="M 256 50 L 262 68 L 280 74 L 262 80 L 256 98 L 250 80 L 232 74 L 250 68 Z" fill="#fef08a" />
</svg>`;

async function run() {
  console.log('⚡ [Favicon Engine] Generating Google Search Compliant Favicon Stack...');

  // Save favicon.svg
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), faviconSvg, 'utf-8');
  console.log('✅ Wrote public/favicon.svg');

  const svgBuffer = Buffer.from(faviconSvg);

  // Generate PNGs: 48x48, 96x96, 180x180 (apple-touch-icon)
  await sharp(svgBuffer).resize(48, 48).png().toFile(path.join(PUBLIC_DIR, 'favicon-48x48.png'));
  console.log('✅ Generated public/favicon-48x48.png (48x48)');

  await sharp(svgBuffer).resize(96, 96).png().toFile(path.join(PUBLIC_DIR, 'favicon-96x96.png'));
  console.log('✅ Generated public/favicon-96x96.png (96x96)');

  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  console.log('✅ Generated public/apple-touch-icon.png (180x180)');

  // Generate REAL ICO Binary (sizes 16, 32, 48)
  const sizes = [16, 32, 48];
  const pngBuffers = [];
  for (const size of sizes) {
    const buf = await sharp(svgBuffer).resize(size, size, { fit: 'cover' }).png().toBuffer();
    pngBuffers.push(buf);
  }

  // ICO Header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);            // Reserved
  header.writeUInt16LE(1, 2);            // Type: 1 = ICO
  header.writeUInt16LE(sizes.length, 4); // Image count

  // Directory entries: 16 bytes each
  const dirEntries = [];
  let dataOffset = 6 + (16 * sizes.length);

  for (let i = 0; i < sizes.length; i++) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(sizes[i], 0);                    // Width
    entry.writeUInt8(sizes[i], 1);                    // Height
    entry.writeUInt8(0, 2);                           // Color palette
    entry.writeUInt8(0, 3);                           // Reserved
    entry.writeUInt16LE(1, 4);                        // Color planes
    entry.writeUInt16LE(32, 6);                       // Bits per pixel
    entry.writeUInt32LE(pngBuffers[i].length, 8);     // Image data size
    entry.writeUInt32LE(dataOffset, 12);              // Image data offset
    dirEntries.push(entry);
    dataOffset += pngBuffers[i].length;
  }

  const ico = Buffer.concat([header, ...dirEntries, ...pngBuffers]);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), ico);

  // Validate ICO signature: Must start with 00000100
  const verify = fs.readFileSync(path.join(PUBLIC_DIR, 'favicon.ico'));
  const sig = verify.slice(0, 4).toString('hex');
  if (sig === '00000100') {
    console.log(`✅ Valid ICO binary generated: ${ico.length} bytes (Signature: ${sig})`);
  } else {
    throw new Error(`❌ Failed ICO signature check: ${sig}`);
  }

  // Generate 1200x630 OG Image (Social preview & Google Discover preview)
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      <radialGradient id="ogGlow" cx="50%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#2a1205" />
        <stop offset="60%" stop-color="#140a04" />
        <stop offset="100%" stop-color="#080402" />
      </radialGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#ogGlow)" />
    <rect width="1168" height="598" x="16" y="16" rx="28" fill="none" stroke="#f59e0b" stroke-width="3" stroke-opacity="0.45" />

    <!-- Open Bible Emblem -->
    <g transform="translate(480, 80) scale(0.48)">
      <rect width="512" height="512" rx="108" fill="#0c0a09" />
      <rect width="496" height="496" x="8" y="8" rx="100" fill="none" stroke="#f59e0b" stroke-width="10" stroke-opacity="0.9" />
      <g fill="none" stroke="#f59e0b" stroke-linecap="round" stroke-linejoin="round" transform="translate(68, 88) scale(15.6)">
        <path d="M2 4 C5 2.5, 9 2.5, 12 4 L12 18 C9 16.5, 5 16.5, 2 18 Z" fill="#f59e0b" fill-opacity="0.22" stroke="#f59e0b" stroke-width="2.2" />
        <path d="M22 4 C19 2.5, 15 2.5, 12 4 L12 18 C15 16.5, 19 16.5, 22 18 Z" fill="#f59e0b" fill-opacity="0.22" stroke="#f59e0b" stroke-width="2.2" />
        <line x1="12" y1="4" x2="12" y2="18" stroke="#fef08a" stroke-width="2.6" />
        <line x1="4.5" y1="7.5" x2="9.5" y2="7.5" stroke="#fef3c7" stroke-width="1.8" />
        <line x1="4.5" y1="11" x2="9.5" y2="11" stroke="#fef3c7" stroke-width="1.8" />
        <line x1="4.5" y1="14.5" x2="9.5" y2="14.5" stroke="#fef3c7" stroke-width="1.8" />
        <line x1="14.5" y1="7.5" x2="19.5" y2="7.5" stroke="#fef3c7" stroke-width="1.8" />
        <line x1="14.5" y1="11" x2="19.5" y2="11" stroke="#fef3c7" stroke-width="1.8" />
        <line x1="14.5" y1="14.5" x2="19.5" y2="14.5" stroke="#fef3c7" stroke-width="1.8" />
      </g>
      <path d="M 256 50 L 262 68 L 280 74 L 262 80 L 256 98 L 250 80 L 232 74 L 250 68 Z" fill="#fef08a" />
    </g>

    <!-- Typography -->
    <text x="600" y="380" font-family="Georgia, serif" font-size="52" font-weight="bold" fill="#fef08a" text-anchor="middle" letter-spacing="1">AduBible.org</text>
    <text x="600" y="430" font-family="system-ui, sans-serif" font-size="22" font-weight="600" fill="#f59e0b" text-anchor="middle" letter-spacing="3">✦ FREE AD-FREE MULTILINGUAL PARALLEL BIBLE ✦</text>
    <text x="600" y="480" font-family="Georgia, serif" font-size="20" font-style="italic" fill="#fafaf9" text-anchor="middle">Asante Twi (Twerɛ Kronkron) • NKJV • KJV • Hebrew • Greek • 35+ Languages</text>
    <text x="600" y="525" font-family="system-ui, sans-serif" font-size="16" fill="#a8a29e" text-anchor="middle">Strong’s Exhaustive Concordance • Open-Source Commentaries • 10s Status Video Studio</text>
    <text x="600" y="565" font-family="system-ui, sans-serif" font-size="14" fill="#78716c" text-anchor="middle">Honoring the Legacy of Apostle Kwame Adu · Nsuhia, Ghana (https://nsuhia.com/)</text>
  </svg>`;

  await sharp(Buffer.from(ogSvg)).jpeg({ quality: 90 }).toFile(path.join(PUBLIC_DIR, 'og-image.jpg'));
  console.log('✅ Generated public/og-image.jpg (1200x630, high contrast)');
}

run().catch((err) => {
  console.error('Fatal favicon error:', err);
  process.exit(1);
});
