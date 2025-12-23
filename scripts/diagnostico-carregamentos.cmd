@echo off
chcp 65001 >nul
echo ========================================
echo   DIAGNOSTICO - Carregamentos
echo ========================================
echo.

REM Mudar para o diretório do projeto
set PROJECT_DIR=C:\Users\Usuario\Documents\Cursor\PDV - Roma
cd /d "%PROJECT_DIR%"

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
        pause
        exit /b 1
    )
)

echo [INFO] Executando consultas de diagnóstico...
echo.

REM Obter data de hoje usando PowerShell
for /f "usebackq delims=" %%I in (`powershell -Command "Get-Date -Format 'yyyy-MM-dd'"`) do set hoje=%%I

echo Data de hoje: %hoje%
echo.

echo [1/4] Total de carregamentos na tabela:
"%PSQL_PATH%" -U postgres -d pdv_roma -c "SELECT COUNT(*) as total FROM carregamentos;"

echo.
echo [2/4] Carregamentos de hoje:
"%PSQL_PATH%" -U postgres -d pdv_roma -c "SELECT COUNT(*) as total_hoje FROM carregamentos WHERE CAST(data_carregamento AS DATE) = CAST('%hoje%' AS DATE);"

echo.
echo [3/4] Carregamentos de hoje com detalhes:
"%PSQL_PATH%" -U postgres -d pdv_roma -c "SELECT id, placa, cliente_nome, status, data_carregamento FROM carregamentos WHERE CAST(data_carregamento AS DATE) = CAST('%hoje%' AS DATE) LIMIT 10;"

echo.
echo [4/4] Verificando se há vendas associadas:
"%PSQL_PATH%" -U postgres -d pdv_roma -c "SELECT c.id, c.placa, c.cliente_nome, c.venda_id, v.nome_cliente as venda_cliente FROM carregamentos c LEFT JOIN vendas v ON v.id_gc = c.venda_id WHERE CAST(c.data_carregamento AS DATE) = CAST('%hoje%' AS DATE) LIMIT 10;"

echo.
echo ========================================
echo   Diagnóstico concluído
echo ========================================
echo.
pause

