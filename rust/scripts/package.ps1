# Package the release build with the SDPC decoder DLLs.
# Usage: powershell -ExecutionPolicy Bypass -File scripts/package.ps1
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$exe = Join-Path $root "target\release\pathology-crop-rs.exe"
if (-not (Test-Path $exe)) {
    Write-Error "Release binary not found. Run: cargo build --release"
}

$dist = Join-Path $root "dist"
New-Item -ItemType Directory -Force -Path $dist | Out-Null
Copy-Item -Force $exe (Join-Path $dist "pathology-crop-rs.exe")

$dllDir = $env:SDPC_DLL_DIR
if (-not $dllDir) {
    $probe = & python -c "import sdpc,pathlib;print(pathlib.Path(sdpc.__file__).parent/'WINDOWS'/'dll')"
    if ($LASTEXITCODE -eq 0) { $dllDir = $probe.Trim() }
}
if (-not $dllDir -or -not (Test-Path (Join-Path $dllDir "DecodeSdpcDll.dll"))) {
    Write-Error "DecodeSdpcDll.dll not found. Set SDPC_DLL_DIR."
}

$target = Join-Path $dist "sdpc\WINDOWS\dll"
New-Item -ItemType Directory -Force -Path $target | Out-Null
Copy-Item -Force (Join-Path $dllDir "*.dll") $target
Copy-Item -Force (Join-Path $root "assets\icon.ico") (Join-Path $dist "app.ico")

Write-Host "Packaged to: $dist"
Write-Host "DLLs copied: " + (Get-ChildItem $target -Filter *.dll).Count
