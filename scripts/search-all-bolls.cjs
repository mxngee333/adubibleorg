const fs = require('fs');

async function searchAllBolls() {
  const bollsRes = await fetch('https://bolls.life/static/bolls/app/views/languages.json');
  const bollsLangs = await bollsRes.json();
  const bollsList = Array.isArray(bollsLangs) ? bollsLangs : Object.values(bollsLangs);

  console.log('Total Bolls language groups:', bollsList.length);
  for (const group of bollsList) {
    const names = group.translations?.map(t => `${t.short_name}: ${t.full_name}`).join(' | ');
    console.log(`- ${group.language}: ${names}`);
  }
}

searchAllBolls().catch(console.error);
