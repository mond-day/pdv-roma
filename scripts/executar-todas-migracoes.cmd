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

echo [1/9] Executando migração 001 (Init)...
"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\001_init.sql"
if %errorlevel% neq 0 (
    echo [AVISO] Migração 001 pode ter falhado ou já foi executada
    set /a ERROR_COUNT+=1
)
echo.

echo [2/9] Executando migração 002 (Logs Immutable)...
"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\002_logs_immutable.sql"
if %errorlevel% neq 0 (
    echo [AVISO] Migração 002 pode ter falhado ou já foi executada
    set /a ERROR_COUNT+=1
)
echo.

echo [3/9] Executando migração 003 (Seed Fake Data)...
echo [INFO] Esta migração pode ser executada separadamente com: executar-seed.cmd
"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\003_seed_fake_data.sql"
if %errorlevel% neq 0 (
    echo [AVISO] Migração 003 pode ter falhado ou já foi executada
    set /a ERROR_COUNT+=1
)
echo.

echo [4/9] Executando migração 004 (Appsmith Schema Alignment)...
"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\004_appsmith_schema_alignment.sql"
if %errorlevel% neq 0 (
    echo [AVISO] Migração 004 pode ter falhado ou já foi executada
    set /a ERROR_COUNT+=1
)
echo.

echo [5/9] Executando migração 005 (Fix Encoding UTF-8)...
"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\005_fix_encoding_notificacoes.sql"
if %errorlevel% neq 0 (
    echo [AVISO] Migração 005 pode ter falhado ou já foi executada
    set /a ERROR_COUNT+=1
)
echo.

echo [6/9] Executando migração 006 (Fix Encoding V2)...
"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\006_fix_encoding_notificacoes_v2.sql"
if %errorlevel% neq 0 (
    echo [AVISO] Migração 006 pode ter falhado ou já foi executada
    set /a ERROR_COUNT+=1
)
echo.

echo [7/9] Executando migração 007 (Normalizar Status)...
"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\007_normalizar_status_carregamentos.sql"
if %errorlevel% neq 0 (
    echo [AVISO] Migração 007 pode ter falhado ou já foi executada
    set /a ERROR_COUNT+=1
)
echo.

echo [8/9] Executando migração 008 (Align with Real Schema)...
"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\008_align_with_real_schema.sql"
if %errorlevel% neq 0 (
    echo [AVISO] Migração 008 pode ter falhado ou já foi executada
    set /a ERROR_COUNT+=1
)
echo.

echo [9/9] Executando migração 009 (Fix Schema Alignment - CORRETIVA)...
"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\009_fix_schema_alignment.sql"
if %errorlevel% neq 0 (
    echo [ERRO] Migração 009 CRÍTICA falhou!
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
echo [INFO] PRÓXIMO PASSO: scripts\executar-seed.cmd
echo [INFO] Reinicie o servidor para aplicar todas as mudanças
echo.
pause

