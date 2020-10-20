cd "%~dp0"\src\regodit
go generate
cd "%~dp0"
set GOPATH="%~dp0"
go build -buildmode=c-shared -o "%~dp0\build\regodit.dll" regodit