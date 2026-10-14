# AzureWolf Paw Cursor installer for profile_azurewolf (PowerShell 5.1+)
param([string]$Repo = ".")
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $Repo).Path
$jsFile = Join-Path $root 'skin-studio.js'
$cssFile = Join-Path $root 'skin-studio.css'
$htmlFile = Join-Path $root 'index.html'
foreach ($file in @($jsFile, $cssFile, $htmlFile)) {
  if (-not (Test-Path -LiteralPath $file)) { throw "Missing repository file: $file" }
}
$js = [System.IO.File]::ReadAllText($jsFile)
$css = [System.IO.File]::ReadAllText($cssFile)
$html = [System.IO.File]::ReadAllText($htmlFile)

# Existing HTML/JS/CSS remains intact; only insert the cursor integration.
if (-not $js.Contains('paw-cursor-ready')) {
  $anchor = "  const fine = matchMedia('(pointer: fine)');"
  if (-not $js.Contains($anchor)) { throw 'Unexpected skin-studio.js format (pointer: fine anchor not found). No changes made.' }
  $extra = @'
  let cursorReady = false;
  const cursorImage = new Image();
  cursorImage.onload = () => { cursorReady = true; syncEffects(); };
  cursorImage.onerror = () => { cursorReady = false; syncEffects(); };
  cursorImage.src = 'assets/azurewolf-paw-cursor.png';
'@
  $js = $js.Replace($anchor, $anchor + "`n" + $extra.TrimEnd())
  $anchor = "    document.documentElement.classList.toggle('paw-effects-enabled', effects);"
  if (-not $js.Contains($anchor)) { throw 'Unexpected skin-studio.js format (syncEffects anchor not found). No changes made.' }
  $js = $js.Replace($anchor, $anchor + "`n" + "    document.documentElement.classList.toggle('paw-cursor-ready', effects && fine.matches && cursorReady);")
}

if (-not $css.Contains('html.paw-cursor-ready body *')) {
  $css += @'

/* AzureWolf paw becomes the real mouse cursor while effects are enabled. */
html.paw-cursor-ready,
html.paw-cursor-ready body,
html.paw-cursor-ready body * {
  cursor: url('assets/azurewolf-paw-cursor.png') 18 6, auto !important;
}
'@
}
$html = [regex]::Replace($html, 'skin-studio\.css\?v=\d+', 'skin-studio.css?v=16')
$html = [regex]::Replace($html, 'skin-studio\.js\?v=\d+', 'skin-studio.js?v=16')

$source = Join-Path $PSScriptRoot 'assets\azurewolf-paw-cursor.png'
if (-not (Test-Path -LiteralPath $source)) { throw "Missing cursor PNG asset in patch: $source" }
$assetDir = Join-Path $root 'assets'
if (-not (Test-Path -LiteralPath $assetDir)) { throw "Missing assets directory in repository: $assetDir" }

$backup = Join-Path $env:TEMP ('azurewolf-paw-backup-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $backup -Force | Out-Null
Copy-Item -Path @($jsFile, $cssFile, $htmlFile) -Destination $backup -Force
$cursorDest = Join-Path $assetDir 'azurewolf-paw-cursor.png'
if (Test-Path -LiteralPath $cursorDest) { Copy-Item $cursorDest -Destination $backup -Force }
$utf8 = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($jsFile, $js, $utf8)
[System.IO.File]::WriteAllText($cssFile, $css, $utf8)
[System.IO.File]::WriteAllText($htmlFile, $html, $utf8)
Copy-Item $source $cursorDest -Force
Write-Host 'AzureWolf furry paw cursor installed.' -ForegroundColor Green
Write-Host "Backup: $backup"
Write-Host 'Changed: skin-studio.js, skin-studio.css, index.html, assets/azurewolf-paw-cursor.png'
Write-Host 'Next: git status; git add ...; git commit ...; git push origin main'
