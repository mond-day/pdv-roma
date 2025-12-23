@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   COMMIT E PUSH PARA GITHUB
echo ========================================
echo.

REM Verificar se git está instalado
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Git não encontrado!
    echo Por favor, instale o Git primeiro:
    echo https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [OK] Git encontrado
echo.

REM Verificar configuração do usuário Git
git config user.name >nul 2>&1
if %errorlevel% neq 0 (
    echo [AVISO] Identidade do Git não configurada
    echo.
    echo Por favor, configure seu nome e email do Git:
    echo.
    set /p GIT_NAME="Digite seu nome: "
    set /p GIT_EMAIL="Digite seu email: "
    echo.
    echo Configurando Git...
    git config user.name "%GIT_NAME%"
    git config user.email "%GIT_EMAIL%"
    echo [OK] Identidade configurada para este repositório
    echo.
    echo Deseja configurar globalmente (para todos os repositórios)? (S/N)
    set /p GIT_GLOBAL=
    if /i "%GIT_GLOBAL%"=="S" (
        git config --global user.name "%GIT_NAME%"
        git config --global user.email "%GIT_EMAIL%"
        echo [OK] Configuração global aplicada
    )
    echo.
) else (
    echo [OK] Identidade do Git configurada
    git config user.name
    git config user.email
    echo.
)

REM Verificar se já é um repositório git
if not exist ".git" (
    echo [1/6] Inicializando repositório Git...
    git init
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao inicializar repositório
        pause
        exit /b 1
    )
    echo [OK] Repositório inicializado
) else (
    echo [OK] Repositório Git já existe
)

echo.

REM Verificar remote
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo [2/7] Configurando remote origin...
    git remote add origin https://github.com/mond-day/pdv-roma.git
    echo [OK] Remote configurado
) else (
    echo [OK] Remote já configurado
)

echo.

REM Adicionar arquivos
echo [3/7] Adicionando arquivos ao staging...
git add .
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao adicionar arquivos
    pause
    exit /b 1
)
echo [OK] Arquivos adicionados

echo.

REM Verificar se há mudanças para commitar
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo [AVISO] Nenhuma mudança para commitar
    echo         Verificando se há arquivos não rastreados...
    git status --porcelain | findstr /R "^??" >nul
    if %errorlevel% neq 0 (
        echo [INFO] Nenhuma mudança detectada. Tudo está commitado.
        goto :skip_commit
    )
)

REM Fazer commit
echo [4/7] Fazendo commit...
echo.
echo [INFO] Criando mensagem de commit baseada nas mudanças...
echo.

REM Criar mensagem de commit dinâmica
set COMMIT_TYPE=fix
set COMMIT_SCOPE=
set COMMIT_MSG=Correções e melhorias

REM Verificar tipos de mudanças
git diff --cached --name-only | findstr /I "migration\|migracao" >nul
if %errorlevel% equ 0 (
    set COMMIT_MSG=Adiciona migração de correção de encoding UTF-8
    set COMMIT_TYPE=feat
)

git diff --cached --name-only | findstr /I "encoding\|utf\|charset" >nul
if %errorlevel% equ 0 (
    if "%COMMIT_MSG%"=="Correções e melhorias" (
        set COMMIT_MSG=Corrige encoding UTF-8 em respostas HTTP e banco de dados
        set COMMIT_TYPE=fix
    )
)

git diff --cached --name-only | findstr /I "dashboard\|kpi" >nul
if %errorlevel% equ 0 (
    if "%COMMIT_MSG%"=="Correções e melhorias" (
        set COMMIT_MSG=Corrige atualização de KPIs no dashboard
        set COMMIT_TYPE=fix
    ) else (
        set COMMIT_MSG=%COMMIT_MSG% e correção de KPIs no dashboard
    )
)

git diff --cached --name-only | findstr /I "script\|\.cmd" >nul
if %errorlevel% equ 0 (
    if not "%COMMIT_MSG%"=="Correções e melhorias" (
        set COMMIT_MSG=%COMMIT_MSG% e scripts de migração
    ) else (
        set COMMIT_MSG=Adiciona scripts de migração e configuração
        set COMMIT_TYPE=feat
    )
)

REM Fazer commit com mensagem detalhada
git commit -m "%COMMIT_TYPE%: %COMMIT_MSG%" -m "" -m "Mudanças incluídas:" -m "- Correção de encoding UTF-8 nas respostas HTTP" -m "- Configuração de charset UTF-8 no pool PostgreSQL" -m "- Migração 005 para corrigir encoding em notificações existentes" -m "- Correção de queries do dashboard (status, JOINs, tipos)" -m "- Scripts de migração e configuração de DATABASE_URL" -m "- Melhorias no tratamento de erros da API"
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao fazer commit
    echo        Verifique se há mudanças para commitar
    pause
    exit /b 1
)
echo [OK] Commit realizado com sucesso!

:skip_commit

echo.

REM Verificar e configurar branch main
echo [5/7] Verificando branch...
for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set CURRENT_BRANCH=%%i
if "%CURRENT_BRANCH%"=="" (
    echo    Configurando branch main...
    git branch -M main
    set CURRENT_BRANCH=main
    echo [OK] Branch configurada para main
) else (
    echo    Branch atual: %CURRENT_BRANCH%
    if /i not "%CURRENT_BRANCH%"=="main" (
        echo    [AVISO] Você está na branch %CURRENT_BRANCH%
        echo            Deseja mudar para main? (S/N)
        set /p CHANGE_BRANCH=
        if /i "%CHANGE_BRANCH%"=="S" (
            git checkout -b main 2>nul
            if %errorlevel% neq 0 (
                git branch -M main
            )
            set CURRENT_BRANCH=main
            echo [OK] Mudado para branch main
        )
    ) else (
        echo [OK] Já está na branch main
    )
)

echo.

REM Perguntar sobre push
echo [6/7] Deseja fazer push para o GitHub agora?
echo.
set /p push_confirm="Digite S para fazer push ou N para cancelar: "

if /i "%push_confirm%"=="S" (
    echo.
    echo Fazendo push para GitHub (branch: %CURRENT_BRANCH%)...
    git push -u origin %CURRENT_BRANCH%
    if %errorlevel% equ 0 (
        echo.
        echo [SUCESSO] Push realizado com sucesso!
        echo.
        echo Repositório disponível em:
        echo https://github.com/mond-day/pdv-roma
        echo.
        echo Branch: %CURRENT_BRANCH%
    ) else (
        echo.
        echo [ERRO] Falha ao fazer push
        echo Verifique suas credenciais do GitHub
        echo.
        echo Se for a primeira vez, pode ser necessário configurar:
        echo   git config --global user.name "Seu Nome"
        echo   git config --global user.email "seu@email.com"
    )
) else (
    echo.
    echo [INFO] Push cancelado.
    echo Execute manualmente quando estiver pronto:
    echo   git push -u origin %CURRENT_BRANCH%
)

echo.
echo ========================================
echo   Concluído!
echo ========================================
echo.
pause

