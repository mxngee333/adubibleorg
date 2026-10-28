async function checkRedirect() {
  const res = await fetch('https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFkJhGTVKTFan4ZW0RALxFpuCQ9OI_FHbVX8psQ_OXWSaKx90tkq6fvZ3IZ4WAF0Br7-YAGWYM2OGT3o74A28gCIafopBJvSkyAW_Vdf8YH2R0VFYlrOLoSkdM6kz-LiAfLDFjSIg3KXlG22rCq4TdTXBZu7Bo=', {
    redirect: 'follow',
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  console.log('Redirect:', res.url);
}
checkRedirect().catch(console.error);
