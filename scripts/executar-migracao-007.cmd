@echo off
chcp 65001 >nul
echo ========================================
echo   EXECUTAR MIGRAÇÃO 007
echo   (Normalização de Status de Carregamentos)
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
echo [INFO] Esta migração normaliza os status de carregamentos:
echo        - stand-by → standby
echo        - concluido → finalizado
echo        - pendente → standby
echo.

REM Executar migração
echo [1/1] Executando migração 007 (Normalização de Status)...
echo.

"%PSQL_PATH%" -U postgres -d pdv_roma -f "lib\db\migrations\007_normalizar_status_carregamentos.sql"

if %errorlevel% equ 0 (
    echo.
    echo [SUCESSO] Migração executada com sucesso!
    echo.
    echo [INFO] Os status dos carregamentos foram normalizados
    echo        Verifique as mensagens acima para ver quantos registros foram corrigidos
) else (
    echo.
    echo [ERRO] Falha ao executar migração
    echo Verifique os erros acima
)

echo.
pause

