const fs = require('fs');
const content = fs.readFileSync('src/data/languagesRegistry.ts', 'utf8');
const lines = content.split('\n');
function showVersion(id) {
  const start = lines.findIndex(l => l.includes(`id: '${id}'`));
  if (start !== -1) {
    console.log(lines.slice(start - 1, start + 18).join('\n'));
    console.log('---');
  }
}
showVersion('twi');
showVersion('ak-twi');
showVersion('fr-lsg');
showVersion('nl-staten');
showVersion('sw');
showVersion('ja-kougo');
showVersion('am');
showVersion('zu');
