@echo off
cd %~dp0
set CGO_ENABLED=1

echo Compiling x64...
set GOARCH=amd64
set CC=zig cc -target x86_64-windows-gnu
go build -trimpath -buildmode=c-shared -ldflags "-w -s -buildid=" -o "..\dist\regodit.x64.dll" regodit

echo Compiling x86...
set GOARCH=386
set CC=zig cc -target x86-windows-gnu
go build -trimpath -buildmode=c-shared -ldflags "-w -s -buildid=" -o "..\dist\regodit.x86.dll" regodit

echo Compiling arm64...
set GOARCH=arm64
set CC=zig cc -target aarch64-windows-gnu
go build -trimpath -buildmode=c-shared -ldflags "-w -s -buildid=" -o "..\dist\regodit.arm64.dll" regodit