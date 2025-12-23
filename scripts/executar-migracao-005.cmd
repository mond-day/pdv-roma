@echo off
chcp 65001 >nul
echo ========================================
echo   EXECUTAR MIGRAÇÃO 005
echo   (Correção de Encoding UTF-8)
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
echo [INFO] Esta migração corrige textos com encoding incorreto nas notificações
echo        Exemplos: "integraÃ§Ã£o" será corrigido para "integração"
echo.

REM Executar migração
echo [1/1] Executando migração 005 (Correção de Encoding UTF-8)...
echo.

"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\005_fix_encoding_notificacoes.sql"

if %errorlevel% equ 0 (
    echo.
    echo [SUCESSO] Migração executada com sucesso!
    echo.
    echo [INFO] Os textos das notificações foram corrigidos para UTF-8
    echo        Reinicie o servidor para aplicar as mudanças
) else (
    echo.
    echo [ERRO] Falha ao executar migração
    echo Verifique os erros acima
)

echo.
pause

