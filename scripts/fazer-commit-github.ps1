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

# Fazer commit
Write-Host "`n💾 Fazendo commit..." -ForegroundColor Cyan
$commitMessage = @"
feat: projeto inicial PDV Roma

- Sistema completo de gestão de carregamentos
- Next.js 14 com App Router
- TypeScript + Tailwind CSS
- Integração com PostgreSQL
- Sistema de autenticação JWT
- RBAC (Role-Based Access Control)
- Integração n8n para webhooks
- Sistema de logs imutáveis
- Documentação completa em docs/

Projeto organizado e pronto para deploy.
"@

git commit -m $commitMessage
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit realizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao fazer commit" -ForegroundColor Red
    exit 1
}

# Perguntar se deseja fazer push
Write-Host "`n❓ Deseja fazer push para o GitHub agora? (S/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq "S" -or $response -eq "s" -or $response -eq "Y" -or $response -eq "y") {
    Write-Host "`n🚀 Fazendo push para GitHub..." -ForegroundColor Cyan
    
    # Verificar branch atual
    $branch = git branch --show-current
    if ([string]::IsNullOrEmpty($branch)) {
        $branch = "main"
        git branch -M main
        Write-Host "✅ Branch renomeada para 'main'" -ForegroundColor Green
    }
    
    git push -u origin $branch
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Push realizado com sucesso!" -ForegroundColor Green
        Write-Host "🌐 Repositório disponível em: https://github.com/mond-day/pdv-roma" -ForegroundColor Cyan
    } else {
        Write-Host "`n❌ Erro ao fazer push" -ForegroundColor Red
        Write-Host "💡 Verifique suas credenciais do GitHub" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n⏭️  Push cancelado. Execute manualmente quando estiver pronto:" -ForegroundColor Yellow
    Write-Host "   git push -u origin main" -ForegroundColor Cyan
}

Write-Host "`n✨ Concluído!" -ForegroundColor Green

