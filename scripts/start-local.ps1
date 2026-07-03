$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$mysql = 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe'
$mysqlConfig = 'D:\MySQL\my.ini'

if (-not (Get-Process mysqld -ErrorAction SilentlyContinue)) {
  Start-Process -FilePath $mysql -ArgumentList "--defaults-file=$mysqlConfig" -WindowStyle Hidden
  Start-Sleep -Seconds 3
}

function Start-LocalService([int]$Port, [string]$Command) {
  $listening = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
  if (-not $listening) {
    Start-Process powershell.exe -WorkingDirectory $projectRoot -ArgumentList '-NoExit', '-Command', $Command
  }
}

Start-LocalService 3000 'pnpm dev:backend'
Start-LocalService 5174 'pnpm dev:admin'
Start-LocalService 5173 'pnpm dev:frontend'

Start-Sleep -Seconds 6
Start-Process 'http://localhost:5173'
Start-Process 'http://localhost:5174/login'
