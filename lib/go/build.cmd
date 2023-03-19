cd "%~dp0"
goversioninfo.exe -platform-specific=true
set CGO_ENABLED=1
set GOARCH=amd64
go build -buildmode=c-shared -o "%~dp0..\dist\regodit.x64.dll" regodit
set GOARCH=386
go build -buildmode=c-shared -o "%~dp0..\dist\regodit.x86.dll" regodit