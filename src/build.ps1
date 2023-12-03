cd $PSScriptRoot
$env:CGO_ENABLED = "1"

Write-Host -NoNewline "Compiling x64..."
$env:GOARCH = "amd64"
$env:CC = "zig cc -target x86_64-windows-gnu"
$output = & { go build -buildmode=c-shared -o "$PSScriptRoot\..\dist\regodit.x64.dll" regodit } 2>&1
if ($LASTEXITCODE -eq 0) {
  Write-Host " [Ok]" -ForegroundColor Green
} else {
  Write-Host " [Fail]" -ForegroundColor Red
  Write-Host $output`n -ForegroundColor Red
}

Write-Host -NoNewline "Compiling x86..."
$env:GOARCH = "386"
$env:CC = "zig cc -target x86-windows-gnu"
$output = & { go build -buildmode=c-shared -o "$PSScriptRoot\..\dist\regodit.x86.dll" regodit  } 2>&1
if ($LASTEXITCODE -eq 0) {
  Write-Host " [Ok]" -ForegroundColor Green
} else {
  Write-Host " [Fail]" -ForegroundColor Red
  Write-Host $output`n -ForegroundColor Red
}

Write-Host -NoNewline "Compiling arm64..."
$env:GOARCH = "arm64"
$env:CC = "zig cc -target aarch64-windows-gnu"
$output = & { go build -buildmode=c-shared -o "$PSScriptRoot\..\dist\regodit.arm64.dll" regodit } 2>&1
if ($LASTEXITCODE -eq 0) {
  Write-Host " [Ok]" -ForegroundColor Green
} else {
  Write-Host " [Fail]" -ForegroundColor Red
  Write-Host $output`n -ForegroundColor Red
}