@echo off
cd /d "%~dp0"
echo Starting Trumpet Dashboard...
timeout /t 2 /nobreak
start http://localhost:5173
npm run dev
pause