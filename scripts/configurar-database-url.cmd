@echo off
chcp 65001 >nul
echo ========================================
echo   CONFIGURAR DATABASE_URL
echo   (PostgreSQL em F:\Programas\Postgres)
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

REM Verificar se .env existe
if not exist ".env" (
    echo [INFO] Arquivo .env não encontrado. Criando...
    echo. > .env
)

REM Verificar se PostgreSQL está em F:\Programas\Postgres
if not exist "F:\Programas\Postgres\bin\psql.exe" (
    echo [AVISO] PostgreSQL não encontrado em F:\Programas\Postgres\bin\psql.exe
    echo         Verificando outros caminhos...
    
    if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" (
        set PG_PORT=5432
        set PG_HOST=localhost
        echo [INFO] PostgreSQL encontrado em C:\Program Files\PostgreSQL\15
    ) else if exist "C:\Program Files\PostgreSQL\14\bin\psql.exe" (
        set PG_PORT=5432
        set PG_HOST=localhost
        echo [INFO] PostgreSQL encontrado em C:\Program Files\PostgreSQL\14
    ) else (
        echo [ERRO] PostgreSQL não encontrado!
        echo        Configure manualmente a DATABASE_URL no arquivo .env
        pause
        exit /b 1
    )
) else (
    set PG_PORT=5432
    set PG_HOST=localhost
    echo [OK] PostgreSQL encontrado em F:\Programas\Postgres
)

echo.
echo [INFO] Configurando DATABASE_URL...
echo.

REM Criar DATABASE_URL padrão
set DATABASE_URL=postgresql://postgres:postgres@%PG_HOST%:%PG_PORT%/pdv_roma?schema=public

REM Verificar se DATABASE_URL já existe no .env
findstr /C:"DATABASE_URL" .env >nul 2>&1
if %errorlevel% equ 0 (
    echo [AVISO] DATABASE_URL já existe no arquivo .env
    echo.
    echo Conteúdo atual:
    findstr /C:"DATABASE_URL" .env
    echo.
    echo Deseja substituir? (S/N)
    set /p REPLACE=
    if /i not "%REPLACE%"=="S" (
        echo [INFO] DATABASE_URL não foi alterada
        pause
        exit /b 0
    )
    
    REM Remover linha antiga
    findstr /V /C:"DATABASE_URL" .env > .env.tmp
    move /Y .env.tmp .env >nul
)

REM Adicionar DATABASE_URL
echo DATABASE_URL=%DATABASE_URL% >> .env

echo [SUCESSO] DATABASE_URL configurada!
echo.
echo DATABASE_URL=%DATABASE_URL%
echo.
echo [INFO] IMPORTANTE: Verifique se a senha está correta!
echo        Se sua senha do PostgreSQL não for "postgres",
echo        edite o arquivo .env e altere a senha na DATABASE_URL
echo.
echo        Formato: postgresql://usuario:senha@host:porta/banco
echo.
pause

