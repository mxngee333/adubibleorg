const fs = require('fs');

// Read languagesRegistry.ts to extract LANGUAGES_REGISTRY and BIBLE_VERSIONS
const registryCode = fs.readFileSync('src/data/languagesRegistry.ts', 'utf8');

// Quick parser for BIBLE_VERSIONS and LANGUAGES_REGISTRY
// Since it's typescript, let's extract the array definitions or evaluate using a lightweight runner
console.log('Reading languages registry...');

// Let's create an evaluation script that transpiles or parses languagesRegistry
