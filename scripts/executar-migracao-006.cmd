@echo off
chcp 65001 >nul
echo ========================================
echo   EXECUTAR MIGRAÇÃO 006
echo   (Correção de Encoding UTF-8 - V2)
echo ========================================
echo.

REM Mudar para o diretório do projeto
set PROJECT_DIR=C:\Users\Usuario\Documents\Cursor\PDV - Roma
cd /d "%PROJECT_DIR%"

REM Verificar se está no diretório correto
if not exist "package.json" (
    echo [ERRO] package.json não encontrado no diretório:
    echo        %CD%
    pause
    exit /b 1
)

echo [OK] Diretório do projeto: %CD%
echo.

REM Verificar se psql está disponível
set PSQL_PATH=
if exist "F:\Programas\Postgres\bin\psql.exe" (
    set PSQL_PATH=F:\Programas\Postgres\bin\psql.exe
) else if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" (
    set PSQL_PATH=C:\Program Files\PostgreSQL\15\bin\psql.exe
) else if exist "C:\Program Files\PostgreSQL\14\bin\psql.exe" (
    set PSQL_PATH=C:\Program Files\PostgreSQL\14\bin\psql.exe
) else if exist "C:\Program Files\PostgreSQL\13\bin\psql.exe" (
    set PSQL_PATH=C:\Program Files\PostgreSQL\13\bin\psql.exe
) else (
    where psql >nul 2>&1
    if %errorlevel% equ 0 (
        set PSQL_PATH=psql
    ) else (
        echo [ERRO] psql não encontrado
        echo Verifique se o PostgreSQL está instalado
        pause
        exit /b 1
    )
)

echo [OK] psql encontrado: %PSQL_PATH%
echo.

REM Solicitar senha do PostgreSQL
echo [INFO] Será solicitada a senha do PostgreSQL
echo.
echo [INFO] Esta migração usa uma abordagem mais robusta para corrigir encoding
echo        Ela tenta múltiplas estratégias de conversão
echo.

REM Executar migração
echo [1/1] Executando migração 006 (Correção de Encoding UTF-8 - V2)...
echo.

"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\006_fix_encoding_notificacoes_v2.sql"

if %errorlevel% equ 0 (
    echo.
    echo [SUCESSO] Migração executada com sucesso!
    echo.
    echo [INFO] Verifique as mensagens acima para ver quantas notificações foram corrigidas
    echo        Se ainda houver problemas, pode ser necessário deletar e recriar as notificações
) else (
    echo.
    echo [ERRO] Falha ao executar migração
    echo Verifique os erros acima
)

echo.
pause

