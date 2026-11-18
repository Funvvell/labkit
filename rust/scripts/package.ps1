# Package the release build with the SDPC decoder DLLs.
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

$target = Join-Path $dist "sdpc\WINDOWS\dll"

# DLL 来源优先级：已随包发布的目录 → SDPC_DLL_DIR → sdpc-for-python 安装目录。
# 第一条让重复打包不再依赖本机 Python 环境（沙箱里的 python 往往没有 sdpc 包）。
$dllDir = $null
if (Test-Path -LiteralPath (Join-Path $target "DecodeSdpcDll.dll")) {
    $dllDir = $target
}
if (-not $dllDir -and $env:SDPC_DLL_DIR -and
    (Test-Path -LiteralPath (Join-Path $env:SDPC_DLL_DIR "DecodeSdpcDll.dll"))) {
    $dllDir = $env:SDPC_DLL_DIR
}
if (-not $dllDir) {
    foreach ($py in @("py -3.12", "python")) {
        try {
            $cmd, $arg = $py.Split(" ")
            $args = @()
            if ($arg) { $args += $arg }
            $args += @("-c", "import sdpc,pathlib;print(pathlib.Path(sdpc.__file__).parent/'WINDOWS'/'dll')")
            $probe = & $cmd @args 2>$null
            if ($LASTEXITCODE -eq 0 -and $probe) {
                $cand = ([string]$probe).Trim()
                if (Test-Path -LiteralPath (Join-Path $cand "DecodeSdpcDll.dll")) { $dllDir = $cand; break }
            }
        } catch { }
    }
}
if (-not $dllDir) {
    Write-Error "DecodeSdpcDll.dll not found. Set SDPC_DLL_DIR to the sdpc-for-python WINDOWS/dll directory."
}

New-Item -ItemType Directory -Force -Path $target | Out-Null
if ((Resolve-Path -LiteralPath $dllDir).Path -ne (Resolve-Path -LiteralPath $target).Path) {
    Copy-Item -Force -Path (Join-Path $dllDir "*.dll") -Destination $target
}
Copy-Item -Force -LiteralPath (Join-Path $root "assets\icon.ico") (Join-Path $dist "app.ico")

$count = (Get-ChildItem -LiteralPath $target -Filter *.dll).Count
Write-Host "Packaged to: $dist"
Write-Host "DLLs present: $count"