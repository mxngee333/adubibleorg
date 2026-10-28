const fs = require('fs');

async function searchProviders() {
  console.log('--- SEARCHING HELLOAO FOR AMHARIC, ZULU, JAPANESE ---');
  const haoRes = await fetch('https://bible.helloao.org/api/available_translations.json');
  const haoData = await haoRes.json();
  const haoList = haoData.translations || haoData;

  const findHao = (term) => haoList.filter(t => 
    (t.id + ' ' + t.name + ' ' + (t.language || '') + ' ' + (t.languageName || '')).toLowerCase().includes(term.toLowerCase())
  );

  console.log('Amharic in HelloAO:', findHao('amharic').map(t => ({ id: t.id, name: t.name, lang: t.language })));
  console.log('Am in HelloAO:', findHao(' am ').map(t => ({ id: t.id, name: t.name, lang: t.language })));
  console.log('Zulu in HelloAO:', findHao('zulu').map(t => ({ id: t.id, name: t.name, lang: t.language })));
  console.log('Japanese in HelloAO:', findHao('japan').map(t => ({ id: t.id, name: t.name, lang: t.language })));
  console.log('Jpn in HelloAO:', findHao('jpn').map(t => ({ id: t.id, name: t.name, lang: t.language })));

  console.log('\n--- SEARCHING BOLLS FOR AMHARIC, ZULU, JAPANESE ---');
  const bollsRes = await fetch('https://bolls.life/static/bolls/app/views/languages.json');
  const bollsLangs = await bollsRes.json();
  const bollsList = Array.isArray(bollsLangs) ? bollsLangs : Object.values(bollsLangs);

  for (const group of bollsList) {
    const str = JSON.stringify(group).toLowerCase();
    if (str.includes('amharic') || str.includes('zulu') || str.includes('japan') || str.includes('am ') || str.includes('zu ') || str.includes('ja ')) {
      console.log('Bolls group:', group.language, group.translations?.map(t => ({ id: t.short_name, name: t.full_name })));
    }
  }
}

searchProviders().catch(console.error);
