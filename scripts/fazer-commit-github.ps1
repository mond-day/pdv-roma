# Script para fazer commit e push inicial do projeto para GitHub
# Execute este script no PowerShell: .\scripts\fazer-commit-github.ps1

Write-Host "🚀 Preparando commit para GitHub..." -ForegroundColor Cyan

# Verificar se git está instalado
try {
    $gitVersion = git --version
    Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git não encontrado. Por favor, instale o Git primeiro." -ForegroundColor Red
    Write-Host "   Download: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Verificar configuração do usuário Git
Write-Host "`n👤 Verificando identidade do Git..." -ForegroundColor Cyan
$gitName = git config user.name 2>$null
$gitEmail = git config user.email 2>$null

if ([string]::IsNullOrEmpty($gitName) -or [string]::IsNullOrEmpty($gitEmail)) {
    Write-Host "⚠️  Identidade do Git não configurada" -ForegroundColor Yellow
    Write-Host "`nPor favor, configure seu nome e email do Git:" -ForegroundColor Cyan
    
    $gitName = Read-Host "Digite seu nome"
    $gitEmail = Read-Host "Digite seu email"
    
    Write-Host "`n⚙️  Configurando Git..." -ForegroundColor Cyan
    git config user.name $gitName
    git config user.email $gitEmail
    Write-Host "✅ Identidade configurada para este repositório" -ForegroundColor Green
    
    $gitGlobal = Read-Host "`nDeseja configurar globalmente (para todos os repositórios)? (S/N)"
    if ($gitGlobal -eq "S" -or $gitGlobal -eq "s") {
        git config --global user.name $gitName
        git config --global user.email $gitEmail
        Write-Host "✅ Configuração global aplicada" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Identidade do Git configurada" -ForegroundColor Green
    Write-Host "   Nome: $gitName" -ForegroundColor Gray
    Write-Host "   Email: $gitEmail" -ForegroundColor Gray
}
Write-Host ""

# Verificar se já é um repositório git
if (-not (Test-Path ".git")) {
    Write-Host "📦 Inicializando repositório Git..." -ForegroundColor Cyan
    git init
    Write-Host "✅ Repositório inicializado" -ForegroundColor Green
} else {
    Write-Host "✅ Repositório Git já existe" -ForegroundColor Green
}

# Verificar remote
$remoteUrl = git remote get-url origin 2>$null
if ($null -eq $remoteUrl) {
    Write-Host "🔗 Configurando remote origin..." -ForegroundColor Cyan
    git remote add origin https://github.com/mond-day/pdv-roma.git
    Write-Host "✅ Remote configurado" -ForegroundColor Green
} else {
    Write-Host "✅ Remote já configurado: $remoteUrl" -ForegroundColor Green
}

# Adicionar todos os arquivos
Write-Host "📝 Adicionando arquivos ao staging..." -ForegroundColor Cyan
git add .
Write-Host "✅ Arquivos adicionados" -ForegroundColor Green

# Verificar status
Write-Host "`n📊 Status do repositório:" -ForegroundColor Cyan
git status --short

# Verificar se há mudanças para commitar
Write-Host "`n📊 Verificando mudanças..." -ForegroundColor Cyan
$stagedChanges = git diff --cached --name-only
$unstagedChanges = git status --porcelain

if ([string]::IsNullOrEmpty($stagedChanges) -and [string]::IsNullOrEmpty($unstagedChanges)) {
    Write-Host "ℹ️  Nenhuma mudança para commitar" -ForegroundColor Yellow
    Write-Host "   Tudo está commitado e limpo." -ForegroundColor Gray
} else {
    # Adicionar arquivos não rastreados se houver
    if ($unstagedChanges -match "^\?\?") {
        Write-Host "📝 Adicionando arquivos não rastreados..." -ForegroundColor Cyan
        git add .
    }
    
    # Detectar tipo de commit baseado nas mudanças
    $commitType = "fix"
    $commitMsg = "Correções e melhorias"
    
    $allChanges = git diff --cached --name-only
    if ($allChanges -match "migration|migracao") {
        $commitMsg = "Adiciona migração de correção de encoding UTF-8"
        $commitType = "feat"
    }
    if ($allChanges -match "encoding|utf|charset") {
        if ($commitMsg -eq "Correções e melhorias") {
            $commitMsg = "Corrige encoding UTF-8 em respostas HTTP e banco de dados"
            $commitType = "fix"
        }
    }
    if ($allChanges -match "dashboard|kpi") {
        if ($commitMsg -eq "Correções e melhorias") {
            $commitMsg = "Corrige atualização de KPIs no dashboard"
            $commitType = "fix"
        } else {
            $commitMsg = "$commitMsg e correção de KPIs no dashboard"
        }
    }
    if ($allChanges -match "script|\.cmd") {
        if ($commitMsg -eq "Correções e melhorias") {
            $commitMsg = "Adiciona scripts de migração e configuração"
            $commitType = "feat"
        } else {
            $commitMsg = "$commitMsg e scripts de migração"
        }
    }
    
    # Fazer commit
    Write-Host "`n💾 Fazendo commit..." -ForegroundColor Cyan
    $commitMessage = @"
$commitType : $commitMsg

Mudanças incluídas:
- Correção de encoding UTF-8 nas respostas HTTP
- Configuração de charset UTF-8 no pool PostgreSQL
- Migração 005 para corrigir encoding em notificações existentes
- Correção de queries do dashboard (status, JOINs, tipos)
- Scripts de migração e configuração de DATABASE_URL
- Melhorias no tratamento de erros da API
"@
    
    git commit -m $commitMessage
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Commit realizado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao fazer commit" -ForegroundColor Red
        Write-Host "💡 Verifique se há mudanças para commitar" -ForegroundColor Yellow
        exit 1
    }
}

# Verificar e configurar branch main
Write-Host "`n🌿 Verificando branch..." -ForegroundColor Cyan
$branch = git branch --show-current
if ([string]::IsNullOrEmpty($branch)) {
    $branch = "main"
    git branch -M main
    Write-Host "✅ Branch configurada para 'main'" -ForegroundColor Green
} else {
    Write-Host "   Branch atual: $branch" -ForegroundColor Gray
    if ($branch -ne "main") {
        Write-Host "⚠️  Você está na branch '$branch'" -ForegroundColor Yellow
        $changeBranch = Read-Host "   Deseja mudar para 'main'? (S/N)"
        if ($changeBranch -eq "S" -or $changeBranch -eq "s") {
            git checkout -b main 2>$null
            if ($LASTEXITCODE -ne 0) {
                git branch -M main
            }
            $branch = "main"
            Write-Host "✅ Mudado para branch 'main'" -ForegroundColor Green
        }
    } else {
        Write-Host "✅ Já está na branch 'main'" -ForegroundColor Green
    }
}

# Perguntar se deseja fazer push
Write-Host "`n❓ Deseja fazer push para o GitHub agora? (S/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq "S" -or $response -eq "s" -or $response -eq "Y" -or $response -eq "y") {
    Write-Host "`n🚀 Fazendo push para GitHub (branch: $branch)..." -ForegroundColor Cyan
    
    git push -u origin $branch
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Push realizado com sucesso!" -ForegroundColor Green
        Write-Host "🌐 Repositório disponível em: https://github.com/mond-day/pdv-roma" -ForegroundColor Cyan
        Write-Host "🌿 Branch: $branch" -ForegroundColor Cyan
    } else {
        Write-Host "`n❌ Erro ao fazer push" -ForegroundColor Red
        Write-Host "💡 Verifique suas credenciais do GitHub" -ForegroundColor Yellow
        Write-Host "   Se for a primeira vez, configure:" -ForegroundColor Yellow
        Write-Host "   git config --global user.name 'Seu Nome'" -ForegroundColor Gray
        Write-Host "   git config --global user.email 'seu@email.com'" -ForegroundColor Gray
    }
} else {
    Write-Host "`n⏭️  Push cancelado. Execute manualmente quando estiver pronto:" -ForegroundColor Yellow
    Write-Host "   git push -u origin $branch" -ForegroundColor Cyan
}

Write-Host "`n✨ Concluído!" -ForegroundColor Green

