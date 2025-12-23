@echo off
chcp 65001 >nul
title PDV Roma - Iniciando Servidor

echo.
echo ╔═══════════════════════════════════════╗
echo ║   PDV Roma - Iniciando Servidor      ║
echo ╚═══════════════════════════════════════╝
echo.

REM Verificar se Node.js está instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js não encontrado!
    echo Por favor, instale o Node.js primeiro.
    pause
    exit /b 1
)

REM Verificar se npm está instalado
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] npm não encontrado!
    echo Por favor, instale o Node.js primeiro.
    pause
    exit /b 1
)

REM Encontrar e matar processos Node.js na porta 3000
echo [1/4] Encerrando processos na porta 3000...
set found=0
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3000 ^| findstr LISTENING') do (
    echo    Encerrando processo PID: %%a
    taskkill /F /PID %%a >nul 2>&1
    set found=1
)
if %found%==0 (
    echo    Nenhum processo encontrado na porta 3000
)

REM Aguardar um pouco para garantir que os processos foram encerrados
timeout /t 2 /nobreak >nul

REM Verificar se node_modules existe
echo [2/4] Verificando dependências...
if not exist "node_modules" (
    echo    Instalando dependências...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar dependências!
        pause
        exit /b 1
    )
) else (
    echo    Dependências já instaladas
)

REM Iniciar o servidor em uma nova janela
echo [3/4] Iniciando servidor Next.js...
start "PDV Roma Server" cmd /k "title PDV Roma Server && npm run dev"

REM Aguardar o servidor iniciar
echo [4/4] Aguardando servidor iniciar...
echo    (Isso pode levar alguns segundos)
timeout /t 8 /nobreak >nul

REM Verificar se o servidor está respondendo
echo    Verificando se o servidor está respondendo...
timeout /t 2 /nobreak >nul

REM Abrir o navegador
echo.
echo ╔═══════════════════════════════════════╗
echo ║   Abrindo navegador...                ║
echo ╚═══════════════════════════════════════╝
start http://localhost:3000

echo.
echo ✅ Servidor iniciado com sucesso!
echo.
echo 📍 URL: http://localhost:3000
echo.
echo 💡 Dica: O servidor está rodando em outra janela.
echo    Para encerrar, feche a janela "PDV Roma Server"
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul

