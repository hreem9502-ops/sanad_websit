# ==========================================================================
# بناء نسخة سند المستقلة (ملف HTML واحد) من مجلد frontend
# الاستخدام:  powershell -ExecutionPolicy Bypass -File .\build_standalone.ps1
# يدمج style.css و app.js داخل الصفحة ويحوّل الصور المستخدمة إلى Base64
# ==========================================================================

$ErrorActionPreference = 'Stop'
$root     = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontend = Join-Path $root 'frontend'
$outFile  = Join-Path $root 'Sanad_Standalone_AllInOne.html'
$utf8     = New-Object System.Text.UTF8Encoding($false)

$html = [System.IO.File]::ReadAllText((Join-Path $frontend 'index.html'), $utf8)
$css  = [System.IO.File]::ReadAllText((Join-Path $frontend 'assets\css\style.css'), $utf8)
$js   = [System.IO.File]::ReadAllText((Join-Path $frontend 'assets\js\app.js'), $utf8)

# 1) Inline CSS
$html = $html.Replace('<link rel="stylesheet" href="assets/css/style.css">', "<style>`n$css`n</style>")

# 2) Inline JS (guard against a literal closing script tag inside the code)
$jsSafe = $js.Replace('</script>', '<\/script>')
$html = $html.Replace('<script src="assets/js/app.js"></script>', "<script>`n$jsSafe`n</script>")

# 3) Inline referenced images as data URIs
$mime = @{ '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.svg' = 'image/svg+xml'; '.webp' = 'image/webp' }
$refs = [regex]::Matches($html, 'assets/(images|icons)/[A-Za-z0-9_\-\.]+') | ForEach-Object { $_.Value } | Sort-Object -Unique
foreach ($ref in $refs) {
  $path = Join-Path $frontend ($ref -replace '/', '\')
  if (-not (Test-Path $path)) { Write-Warning "Missing asset: $ref"; continue }
  $ext = [System.IO.Path]::GetExtension($path).ToLower()
  $b64 = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($path))
  $html = $html.Replace($ref, "data:$($mime[$ext]);base64,$b64")
}

if ($html -match 'assets/(css|js)/') { throw 'Some local CSS/JS references were not inlined.' }

[System.IO.File]::WriteAllText($outFile, $html, $utf8)
$rootIndex = Join-Path $root 'index.html'
[System.IO.File]::WriteAllText($rootIndex, $html, $utf8)
$size = [math]::Round((Get-Item $outFile).Length / 1KB)
Write-Host "Built $outFile and $rootIndex ($size KB, $($refs.Count) assets inlined)"
