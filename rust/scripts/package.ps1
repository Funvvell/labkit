# Package the release build. The SDPC vendor DLLs are NOT bundled: the app
# downloads the official wheel from PyPI on first use and caches it in
# %USERPROFILE%\.liver_portal_crop\decoders\sdpc.
# Usage: powershell -ExecutionPolicy Bypass -File scripts/package.ps1
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$exe = Join-Path $root "target\release\labkit.exe"
if (-not (Test-Path -LiteralPath $exe)) {
    Write-Error "Release binary not found. Run: cargo build --release"
}

$dist = Join-Path $root "dist"
New-Item -ItemType Directory -Force -Path $dist | Out-Null
Copy-Item -Force -LiteralPath $exe (Join-Path $dist "labkit.exe")
Copy-Item -Force -LiteralPath (Join-Path $root "assets\icon.ico") (Join-Path $dist "app.ico")

$size = [math]::Round((Get-Item -LiteralPath (Join-Path $dist "labkit.exe")).Length / 1MB, 1)
Write-Host "Packaged to: $dist"
Write-Host "labkit.exe: $size MB (SDPC decoder downloads on first use)"
