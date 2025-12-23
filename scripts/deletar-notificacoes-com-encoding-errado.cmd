@echo off
chcp 65001 >nul
echo ========================================
echo   DELETAR NOTIFICAÇÕES COM ENCODING ERRADO
echo ========================================
echo.
echo [AVISO] Este script irá DELETAR todas as notificações
echo         que ainda têm problemas de encoding.
echo.
echo [INFO] As notificações serão deletadas permanentemente.
echo        Você pode recriá-las executando o seed novamente.
echo.
set /p CONFIRM="Deseja continuar? (S/N): "
if /i not "%CONFIRM%"=="S" (
    echo Operação cancelada.
    pause
    exit /b 0
)

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

echo [INFO] Será solicitada a senha do PostgreSQL
echo.

REM Mostrar quantas notificações serão deletadas
echo Verificando notificações com encoding incorreto...
"%PSQL_PATH%" -U postgres -d pdv_roma -c "SELECT COUNT(*) as total FROM notificacoes WHERE titulo LIKE '%%Ã%%' OR mensagem LIKE '%%Ã%%';"

echo.
set /p CONFIRM2="Confirma a deleção? (S/N): "
if /i not "%CONFIRM2%"=="S" (
    echo Operação cancelada.
    pause
    exit /b 0
)

echo.
echo Deletando notificações com encoding incorreto...
"%PSQL_PATH%" -U postgres -d pdv_roma -c "DELETE FROM notificacoes WHERE titulo LIKE '%%Ã%%' OR mensagem LIKE '%%Ã%%';"

if %errorlevel% equ 0 (
    echo.
    echo [SUCESSO] Notificações deletadas com sucesso!
    echo.
    echo [INFO] Você pode recriar as notificações executando:
    echo        executar-seed.cmd
) else (
    echo.
    echo [ERRO] Falha ao deletar notificações
    echo Verifique os erros acima
)

echo.
pause

