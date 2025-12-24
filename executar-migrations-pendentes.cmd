@echo off
setlocal EnableDelayedExpansion

echo ========================================
echo   EXECUTAR MIGRATIONS PENDENTES
echo   (006, 007, 008)
echo ========================================
echo.

REM Verificar se estamos no diretório correto
if not exist "lib\db\migrations" (
    echo [ERRO] Diretório lib\db\migrations não encontrado!
    echo Execute este script a partir da raiz do projeto.
    pause
    exit /b 1
)

echo [OK] Diretório do projeto: %CD%
echo.

REM Procurar psql.exe
set PSQL_PATH=
for %%P in (
    "C:\Program Files\PostgreSQL\17\bin\psql.exe"
    "C:\Program Files\PostgreSQL\16\bin\psql.exe"
    "C:\Program Files\PostgreSQL\15\bin\psql.exe"
    "F:\Programas\Postgres\bin\psql.exe"
) do (
    if exist %%P (
        set PSQL_PATH=%%~P
        goto :found_psql
    )
)

:found_psql
if "%PSQL_PATH%"=="" (
    echo [ERRO] psql.exe não encontrado!
    echo Instale o PostgreSQL ou adicione o caminho ao PATH
    pause
    exit /b 1
)

echo [OK] psql encontrado: %PSQL_PATH%
echo.

echo [INFO] Será solicitada a senha do PostgreSQL
echo.

echo [1/3] Executando migration 006 (Fix Encoding V2)...
"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\006_fix_encoding_notificacoes_v2.sql"
echo.

echo [2/3] Executando migration 007 (Normalizar Status)...
"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\007_normalizar_status_carregamentos.sql"
echo.

echo [3/3] Executando migration 008 (Align with Real Schema)...
"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\008_align_with_real_schema.sql"
echo.

echo [SUCESSO] Todas as migrations pendentes foram executadas!
echo.
echo [INFO] Agora execute o seed novamente: executar-seed.cmd
echo.

pause
