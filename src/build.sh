#!/bin/sh

CWD = "$(dirname "${BASH_SOURCE[0]}")"

cd CWD
export GOOS=windows
export CGO_ENABLED=1

echo "Compiling x64..."
export GOARCH=amd64
export CC=zig cc -target x86_64-windows-gnu
go build -buildmode=c-shared -o "$CWD/../dist/regodit.x64.dll" regodit

echo "Compiling x86..."
export GOARCH=386
export CC=zig cc -target x86-windows-gnu
go build -buildmode=c-shared -o "$CWD/../dist/regodit.x86.dll" regodit

echo "Compiling arm64..."
export GOARCH=arm64
export CC=zig cc -target aarch64-windows-gnu
go build -buildmode=c-shared -o "$CWD/../dist/regodit.arm64.dll" regodit