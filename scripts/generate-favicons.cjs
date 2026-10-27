const fs = require('fs');
const path = require('path');
const sharp = require('C:/Users/kwame/AppData/Roaming/npm/node_modules/sharp');

const PROJECT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(PROJECT_DIR, 'public');
const BRAND_DIR = path.join(PUBLIC_DIR, 'brand');
const EXTERNAL_KIT_DIR = 'C:/Users/kwame/Downloads/AduBible_Symbol_Logo_Kit/AduBible_Symbol_Logo_Kit';

async function run() {
  console.log('⚡ [Favicon Engine] Deploying AduBible Symbol Edition Favicon Stack...');

  // Ensure brand directory exists and has source files
  if (!fs.existsSync(BRAND_DIR)) {
    fs.mkdirSync(BRAND_DIR, { recursive: true });
  }

  // Copy from external kit if files missing in brand directory
  if (fs.existsSync(EXTERNAL_KIT_DIR)) {
    const kitFiles = fs.readdirSync(EXTERNAL_KIT_DIR);
    for (const file of kitFiles) {
      const target = path.join(BRAND_DIR, file);
      if (!fs.existsSync(target)) {
        fs.copyFileSync(path.join(EXTERNAL_KIT_DIR, file), target);
      }
    }
  }

  // 1. Deploy Master Multi-Resolution favicon.ico (64x64, 48x48, 32x32, 16x16 with alpha)
  const masterIcoSrc = fs.existsSync(path.join(BRAND_DIR, 'favicon.ico'))
    ? path.join(BRAND_DIR, 'favicon.ico')
    : path.join(EXTERNAL_KIT_DIR, 'favicon.ico');

  if (fs.existsSync(masterIcoSrc)) {
    fs.copyFileSync(masterIcoSrc, path.join(PUBLIC_DIR, 'favicon.ico'));
    const verify = fs.readFileSync(path.join(PUBLIC_DIR, 'favicon.ico'));
    const sig = verify.slice(0, 4).toString('hex');
    console.log(`✅ Deployed public/favicon.ico (${verify.length} bytes, Signature: ${sig})`);
  } else {
    throw new Error('Master favicon.ico source not found in brand or kit folder');
  }

  // 2. Locate master icon image source (prefer icon-1024.png or Profile_1024.png or icon-512.png)
  let masterPngSrc = path.join(BRAND_DIR, 'icon-1024.png');
  if (!fs.existsSync(masterPngSrc)) {
    masterPngSrc = path.join(BRAND_DIR, 'Profile_1024.png');
  }
  if (!fs.existsSync(masterPngSrc)) {
    masterPngSrc = path.join(BRAND_DIR, 'icon-512.png');
  }

  console.log(`📸 Using master logo source: ${masterPngSrc}`);

  // 3. Generate Google Search and standard browser PNG favicons (transparent background)
  await sharp(masterPngSrc).resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(PUBLIC_DIR, 'favicon-48x48.png'));
  console.log('✅ Generated public/favicon-48x48.png (48x48 transparent)');

  await sharp(masterPngSrc).resize(96, 96, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(PUBLIC_DIR, 'favicon-96x96.png'));
  console.log('✅ Generated public/favicon-96x96.png (96x96 transparent)');

  await sharp(masterPngSrc).resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  console.log('✅ Generated public/apple-touch-icon.png (180x180 transparent)');

  await sharp(masterPngSrc).resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(PUBLIC_DIR, 'icon-192.png'));
  console.log('✅ Generated public/icon-192.png (192x192 transparent)');

  await sharp(masterPngSrc).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(PUBLIC_DIR, 'icon-512.png'));
  console.log('✅ Generated public/icon-512.png (512x512 transparent)');

  // 4. Generate public/favicon.svg, public/logo.svg, and public/auth-logo.svg
  const png512Buf = await sharp(masterPngSrc).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const b64 = png512Buf.toString('base64');
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image width="512" height="512" href="data:image/png;base64,${b64}" />
</svg>`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), faviconSvg, 'utf-8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'logo.svg'), faviconSvg, 'utf-8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'auth-logo.svg'), faviconSvg, 'utf-8');
  console.log('✅ Generated public/favicon.svg, logo.svg, and auth-logo.svg (strict Symbol logo)');

  // 5. Generate 1200x630 OG Image (Social preview & Google Discover preview)
  // Composite the new symbol logo in the center top
  const logo220 = await sharp(masterPngSrc).resize(220, 220, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();

  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      <radialGradient id="ogGlow" cx="50%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#1e293b" />
        <stop offset="50%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#020617" />
      </radialGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#ogGlow)" />
    <rect width="1168" height="598" x="16" y="16" rx="28" fill="none" stroke="#BD913F" stroke-width="3" stroke-opacity="0.6" />

    <!-- Typography (Strict Brand Colors) -->
    <text x="600" y="380" font-family="Georgia, serif" font-size="52" font-weight="bold" text-anchor="middle" letter-spacing="1"><tspan fill="#38bdf8">Adu</tspan><tspan fill="#f59e0b">Bible</tspan><tspan fill="#10b981">.org</tspan></text>
    <text x="600" y="430" font-family="system-ui, sans-serif" font-size="22" font-weight="600" fill="#BD913F" text-anchor="middle" letter-spacing="3">✦ FREE AD-FREE MULTILINGUAL PARALLEL BIBLE ✦</text>
    <text x="600" y="480" font-family="Georgia, serif" font-size="20" font-style="italic" fill="#f8fafc" text-anchor="middle">Asante Twi (Twerɛ Kronkron) • NKJV • KJV • Hebrew • Greek • 35+ Languages</text>
    <text x="600" y="525" font-family="system-ui, sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">Strong’s Exhaustive Concordance • Open-Source Commentaries • 10s Status Video Studio</text>
    <text x="600" y="565" font-family="system-ui, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">Honoring the Legacy of Apostle Kwame Adu · Nsuhia, Ghana (https://adubible.org/)</text>
  </svg>`;

  const ogBaseBuf = await sharp(Buffer.from(ogSvg)).png().toBuffer();
  await sharp(ogBaseBuf)
    .composite([
      { input: logo220, top: 80, left: 490 }
    ])
    .jpeg({ quality: 90 })
    .toFile(path.join(PUBLIC_DIR, 'og-image.jpg'));

  console.log('✅ Generated public/og-image.jpg with AduBible Symbol logo (1200x630)');
}

run().catch((err) => {
  console.error('Fatal favicon error:', err);
  process.exit(1);
});
