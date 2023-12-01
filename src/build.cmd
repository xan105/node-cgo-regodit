@echo off
set CGO_ENABLED=1

echo x64
set GOARCH=amd64
set CC=zig cc -target x86_64-windows-gnu
go build -buildmode=c-shared -o "%~dp0..\dist\regodit.x64.dll" regodit
del /Q "%~dp0..\dist\regodit.x64.h"

echo x86
set GOARCH=386
set CC=zig cc -target x86-windows-gnu
go build -buildmode=c-shared -o "%~dp0..\dist\regodit.x86.dll" regodit
del /Q "%~dp0..\dist\regodit.x86.h"

echo arm64
set GOARCH=arm64
set CC=zig cc -target aarch64-windows-gnu
go build -buildmode=c-shared -o "%~dp0..\dist\regodit.arm64.dll" regodit
del /Q "%~dp0..\dist\regodit.arm64.h"