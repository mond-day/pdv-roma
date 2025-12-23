@echo off
chcp 65001 >nul
echo ========================================
echo   EXECUTAR TODAS AS MIGRAÇÕES
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
echo [INFO] Executando migrações na ordem:
echo        001 - Init
echo        002 - Logs Immutable
echo        003 - Seed Fake Data
echo        004 - Appsmith Schema Alignment
echo        005 - Fix Encoding UTF-8
echo.

REM Executar migrações em ordem
set ERROR_COUNT=0

echo [1/5] Executando migração 001 (Init)...
"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\001_init.sql"
if %errorlevel% neq 0 (
    echo [AVISO] Migração 001 pode ter falhado ou já foi executada
    set /a ERROR_COUNT+=1
)
echo.

echo [2/5] Executando migração 002 (Logs Immutable)...
"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\002_logs_immutable.sql"
if %errorlevel% neq 0 (
    echo [AVISO] Migração 002 pode ter falhado ou já foi executada
    set /a ERROR_COUNT+=1
)
echo.

echo [3/5] Executando migração 003 (Seed Fake Data)...
echo [INFO] Esta migração pode ser executada separadamente com: executar-seed.cmd
"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\003_seed_fake_data.sql"
if %errorlevel% neq 0 (
    echo [AVISO] Migração 003 pode ter falhado ou já foi executada
    set /a ERROR_COUNT+=1
)
echo.

echo [4/5] Executando migração 004 (Appsmith Schema Alignment)...
"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\004_appsmith_schema_alignment.sql"
if %errorlevel% neq 0 (
    echo [AVISO] Migração 004 pode ter falhado ou já foi executada
    set /a ERROR_COUNT+=1
)
echo.

echo [5/5] Executando migração 005 (Fix Encoding UTF-8)...
"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\005_fix_encoding_notificacoes.sql"
if %errorlevel% neq 0 (
    echo [AVISO] Migração 005 pode ter falhado ou já foi executada
    set /a ERROR_COUNT+=1
)
echo.

if %ERROR_COUNT% equ 0 (
    echo [SUCESSO] Todas as migrações foram executadas!
) else (
    echo [AVISO] Algumas migrações podem ter falhado ou já foram executadas
    echo         Isso é normal se as migrações já foram aplicadas anteriormente
)

echo.
echo [INFO] Reinicie o servidor para aplicar todas as mudanças
echo.
pause

