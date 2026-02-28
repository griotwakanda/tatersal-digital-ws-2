@echo off
cd /d %~dp0\..
IF NOT EXIST node_modules (
  echo [start.bat] Instalando dependencias...
  call npm install
)
call npm run start
