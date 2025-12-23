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
    echo [2/6] Configurando remote origin...
    git remote add origin https://github.com/mond-day/pdv-roma.git
    echo [OK] Remote configurado
) else (
    echo [OK] Remote já configurado
)

echo.

REM Adicionar arquivos
echo [3/6] Adicionando arquivos ao staging...
git add .
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao adicionar arquivos
    pause
    exit /b 1
)
echo [OK] Arquivos adicionados

echo.

REM Fazer commit
echo [4/6] Fazendo commit...
git commit -m "feat: projeto inicial PDV Roma" -m "- Sistema completo de gestão de carregamentos" -m "- Next.js 14 com App Router" -m "- TypeScript + Tailwind CSS" -m "- Integração com PostgreSQL" -m "- Sistema de autenticação JWT" -m "- RBAC (Role-Based Access Control)" -m "- Integração n8n para webhooks" -m "- Sistema de logs imutáveis" -m "- Documentação completa em docs/" -m "" -m "Projeto organizado e pronto para deploy."
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao fazer commit
    pause
    exit /b 1
)
echo [OK] Commit realizado com sucesso!

echo.

REM Verificar branch
git branch --show-current >nul 2>&1
if %errorlevel% neq 0 (
    echo [5/6] Configurando branch main...
    git branch -M main
    echo [OK] Branch configurada
) else (
    echo [OK] Branch já configurada
)

echo.

REM Perguntar sobre push
echo [6/6] Deseja fazer push para o GitHub agora?
echo.
set /p push_confirm="Digite S para fazer push ou N para cancelar: "

if /i "%push_confirm%"=="S" (
    echo.
    echo Fazendo push para GitHub...
    git push -u origin main
    if %errorlevel% equ 0 (
        echo.
        echo [SUCESSO] Push realizado com sucesso!
        echo.
        echo Repositório disponível em:
        echo https://github.com/mond-day/pdv-roma
    ) else (
        echo.
        echo [ERRO] Falha ao fazer push
        echo Verifique suas credenciais do GitHub
    )
) else (
    echo.
    echo [INFO] Push cancelado.
    echo Execute manualmente quando estiver pronto:
    echo   git push -u origin main
)

echo.
echo ========================================
echo   Concluído!
echo ========================================
echo.
pause

