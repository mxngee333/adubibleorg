# Export Clean Source ZIP Archive for Developer Handoff
$ErrorActionPreference = 'Stop'

$zipName = 'adubible-developer-source.zip'

$vitalFolders = @('src', 'public', 'scripts', 'docs', 'cloudflare', 'hetzner-cluster')

$vitalFiles = @(
  '.env',
  '.env.example',
  '.firebaserc',
  '.gitignore',
  'build-ssg.js',
  'DEVELOPER_GUIDE.md',
  'Dockerfile',
  'firebase.json',
  'firestore.rules',
  'index.html',
  'package.json',
  'package-lock.json',
  'postcss.config.js',
  'README.md',
  'tsconfig.json',
  'vite.config.ts',
  'WARROOM_REPORT.md'
)

$allPaths = @()
foreach ($f in $vitalFolders) {
  if (Test-Path $f) { $allPaths += $f }
}
foreach ($f in $vitalFiles) {
  if (Test-Path $f) { $allPaths += $f }
}

Write-Host "Gathered items to package:"
foreach ($p in $allPaths) {
  Write-Host " - $p"
}

if (Test-Path $zipName) {
  Remove-Item $zipName -Force
}

Write-Host "`nCompressing archive $zipName..."
Compress-Archive -Path $allPaths -DestinationPath $zipName -CompressionLevel Optimal

# Create folder alias mirror
Copy-Item $zipName 'bible-developer-source.zip' -Force

$zipItem = Get-Item $zipName
$sizeMB = [math]::Round($zipItem.Length / 1MB, 2)
$sizeKB = [math]::Round($zipItem.Length / 1KB, 2)

Write-Host "`nArchive successfully created!"
Write-Host "Path: $($zipItem.FullName)"
Write-Host "Mirror Path: C:\Users\kwame\Downloads\bible\bible-developer-source.zip"
Write-Host "Size: $sizeKB KB ($sizeMB MB)"
Write-Host "Last Modified: $($zipItem.LastWriteTime)"
