# 📋 Processo de Pesagem - Documentação Completa

## 🎯 Visão Geral

O sistema de pesagem gerencia o processo de pesagem de caminhões em duas fases principais: **TARA** (peso vazio) e **FINAL** (peso com carga). O sistema também gerencia carregamentos em diferentes estados: **novo**, **em espera (standby)**, e **finalizado**.

---

## 📊 Variáveis e Estados Principais

### 1. **Fases de Pesagem** (`fasePesagem`)
- **`null`**: Nenhuma fase ativa (inicial)
- **`"TARA"`**: Fase de pesagem da tara (caminhão vazio)
- **`"FINAL"`**: Fase de pesagem final (caminhão com carga)

### 2. **Status do Carregamento** (`vendaSelecionada.status`)
- **`null` ou ausente**: Carregamento novo (ainda não criado)
- **`"standby"`**: Carregamento em espera (tara já registrada, aguardando pesagem final)
- **`"finalizado"`**: Carregamento concluído (tara e final já registrados)

### 3. **Variáveis de Dados**

#### Informações do Veículo
- **`qtdEixos`** (string): Quantidade de eixos (1-5)
- **`placaSelecionada`** (string): Placa do veículo
- **`motoristaSelecionado`** (string): ID do motorista
- **`transportadoraSelecionada`** (string): ID da transportadora

#### Pesos
- **`pesosEixos`** (Record<number, string>): Peso de cada eixo em **kg** (armazenamento interno)
  - Exemplo: `{ 1: "1000", 2: "2000" }` = Eixo 1: 1000kg, Eixo 2: 2000kg
- **`taraKg`** (number | null): Peso total da tara em kg
- **`pesoTotal`** (number): Soma de todos os pesos dos eixos na fase atual
- **`pesoLiquido`** (number): Peso líquido = `pesoTotal - taraKg`
- **`excessoEixos`** (Record<number, number>): Excesso de peso por eixo em kg

#### Configurações
- **`limiteEixo`** (number): Limite máximo por eixo em kg (padrão: 6000kg)
- **`permitirExcesso`** (boolean): Se permite excesso de peso

#### Outros Dados
- **`produtoSelecionado`** (string): Produto a ser carregado
- **`qtdDesejada`** (string): Quantidade desejada em toneladas
- **`detalhesProduto`** (string): Detalhes do produto
- **`observacoes`** (string): Observações gerais

---

## 🔄 Fluxo de Trabalho

### **Cenário 1: Novo Carregamento (Fluxo Completo)**

#### **Passo 1: Buscar/Selecionar Venda**
1. Usuário busca por cliente, placa ou contrato
2. Sistema mostra apenas carregamentos **em espera (standby)** ou permite criar novo
3. Ao selecionar, o sistema preenche automaticamente:
   - Se for carregamento em standby: `fasePesagem = "FINAL"`, preenche dados existentes
   - Se for novo: `fasePesagem = "TARA"`

#### **Passo 2: Preencher Dados Básicos** (Fase TARA)
- **Campos habilitados:**
  - Quantidade de Eixos
  - Produto
  - Placa
  - Transportadora
  - Motorista
  - Quantidade Desejada
  - Detalhes do Produto
  - Observações
  - **Pesos por Eixo (Tara)**

- **Campos desabilitados:**
  - Nenhum (todos editáveis)

#### **Passo 3: Inserir Pesos da Tara**
1. Usuário seleciona quantidade de eixos (1-5)
2. Sistema mostra inputs para cada eixo
3. Usuário insere peso de cada eixo em **TON** (ex: 10,234)
4. Sistema converte automaticamente para **kg** internamente (ex: 10234kg)
5. Sistema calcula:
   - `pesoTotal` = soma de todos os eixos
   - `taraKg` = `pesoTotal` (na fase TARA)
   - `excessoEixos` = peso de cada eixo - `limiteEixo`

#### **Passo 4: Criar Carregamento em Standby**
- **Botão "Stand By"** disponível quando:
  - `fasePesagem === "TARA"`
  - `pesoTotal > 0`
  - Placa selecionada

- **Ação:**
  - Cria carregamento com `status = "standby"`
  - Salva tara e dados básicos
  - Redireciona para página de detalhes

---

### **Cenário 2: Carregamento em Espera (Standby)**

#### **Situação:**
- Carregamento já existe com tara registrada
- Status: `"standby"`
- Aguardando pesagem final

#### **Comportamento do Sistema:**
1. **Ao selecionar carregamento em standby:**
   - `fasePesagem` automaticamente = `"FINAL"`
   - Sistema preenche automaticamente:
     - Quantidade de eixos
     - Placa
     - Dados básicos
     - Pesos da tara (se disponíveis)

2. **Campos habilitados:**
   - **Apenas Pesos por Eixo (Final)**
   - Botão "Confirmar"

3. **Campos desabilitados:**
   - Quantidade de Eixos
   - Produto
   - Placa
   - Transportadora
   - Motorista
   - Quantidade Desejada
   - Detalhes do Produto
   - Observações
   - **Pesos por Eixo (Tara)** - desabilitados

4. **Inserir Pesos Finais:**
   - Usuário insere apenas os pesos finais (com carga)
   - Sistema calcula:
     - `pesoTotal` = soma dos pesos finais
     - `pesoLiquido` = `pesoTotal - taraKg`
     - `excessoEixos` = peso final de cada eixo - `limiteEixo`

5. **Confirmar:**
   - **Botão "Confirmar"** disponível quando:
     - `fasePesagem === "FINAL"`
     - `pesoLiquido > 0`
     - `pesoTotal > 0`
   - **Ação:**
     - Se `pesoLiquido > 48000kg`: Abre modal de split
     - Senão: Finaliza carregamento
     - Atualiza `status = "finalizado"`
     - Salva pesos finais

---

### **Cenário 3: Carregamento Finalizado**

#### **Situação:**
- Carregamento já foi finalizado
- Status: `"finalizado"`

#### **Comportamento:**
- **Todos os campos desabilitados**
- Apenas visualização
- Não permite edição

---

## 🔢 Cálculos Automáticos

### **1. Peso Total** (`pesoTotal`)
```javascript
pesoTotal = soma de todos os valores em pesosEixos (convertidos de string para número)
```

### **2. Tara** (`taraKg`)
```javascript
// Na fase TARA:
taraKg = pesoTotal (quando fasePesagem === "TARA")

// Na fase FINAL:
taraKg = valor já salvo do carregamento (não muda)
```

### **3. Peso Líquido** (`pesoLiquido`)
```javascript
pesoLiquido = pesoTotal - taraKg
```

### **4. Excesso por Eixo** (`excessoEixos`)
```javascript
excessoEixos[eixo] = pesoEixo - limiteEixo
// Se excesso > 0, mostra badge de aviso
```

---

## 🎨 Conversões de Unidade

### **Entrada do Usuário → Armazenamento Interno**
- **Usuário digita:** TON com vírgula (ex: `10,234`)
- **Sistema armazena:** kg como string numérica (ex: `"10234"`)
- **Conversão:** `kg = TON × 1000`

### **Armazenamento Interno → Exibição**
- **Sistema armazena:** kg (ex: `"10234"`)
- **Sistema exibe:** TON com vírgula (ex: `10,234`)
- **Conversão:** `TON = kg ÷ 1000`

### **Por que essa conversão?**
- **Interface:** Usuário trabalha com TON (mais fácil: 10,234 TON vs 10234 kg)
- **Banco de dados:** Armazena em kg (padrão do sistema)
- **Cálculos:** Internamente tudo em kg (mais preciso)

---

## 🚦 Regras de Negócio

### **1. Validação de Excesso de Peso**
- **Limite padrão:** 6000kg por eixo
- **Configurável:** Via página de Configurações (`PESO_MAXIMO_EIXO`)
- **Excesso permitido:** Configurável via `PERMITIR_EXCESSO_PESO`
- **Badges visuais:**
  - Verde: Dentro do limite
  - Amarelo: Excesso ≤ 500kg
  - Vermelho: Excesso > 500kg

### **2. Validação de Peso Líquido**
- **Limite máximo:** 48000kg (48 toneladas)
- **Se exceder:** Abre modal de split (dividir carregamento)

### **3. Estados e Permissões**

| Status | Fase | Campos Editáveis | Botões Disponíveis |
|--------|------|------------------|-------------------|
| Novo | TARA | Todos | Stand By, Limpar |
| Novo | FINAL | Pesos Finais | Confirmar, Limpar |
| Standby | FINAL | Apenas Pesos Finais | Confirmar, Imprimir |
| Finalizado | - | Nenhum | Nenhum |

### **4. Lógica de Desabilitar Inputs de Eixo**

```javascript
// Se carregamento está em espera (standby):
isDisabled = fasePesagem !== "FINAL"
// → Só pode editar na fase FINAL

// Se carregamento não está em espera:
isDisabled = status === "finalizado"
// → Não pode editar quando finalizado
```

---

## 🔍 Fluxograma de Decisão

```
INÍCIO
  ↓
Buscar/Selecionar Carregamento
  ↓
Carregamento existe?
  ├─ NÃO → Criar Novo (fasePesagem = "TARA")
  │         ↓
  │       Preencher Dados + Pesos Tara
  │         ↓
  │       Clicar "Stand By"
  │         ↓
  │       Status = "standby"
  │         ↓
  └─ SIM → Status?
            ├─ "standby" → fasePesagem = "FINAL"
            │                ↓
            │              Inserir Apenas Pesos Finais
            │                ↓
            │              Clicar "Confirmar"
            │                ↓
            │              Status = "finalizado"
            │
            └─ "finalizado" → Apenas Visualização
```

---

## 📝 Exemplo Prático

### **Exemplo 1: Novo Carregamento**

1. **Usuário busca:** "Cliente ABC"
2. **Não encontra:** Cria novo carregamento
3. **Preenche:**
   - Eixos: 3
   - Placa: ABC-1234
   - Produto: Soja
4. **Insere Tara (em TON):**
   - Eixo 1: 8,500 TON → Sistema armazena: 8500kg
   - Eixo 2: 8,200 TON → Sistema armazena: 8200kg
   - Eixo 3: 8,300 TON → Sistema armazena: 8300kg
   - **Total Tara:** 25000kg
5. **Clica "Stand By":**
   - Cria carregamento com `status = "standby"`
   - Salva tara: `tara_eixos_kg = {1: 8500, 2: 8200, 3: 8300}`
6. **Caminhão carrega produto**
7. **Usuário retorna e seleciona o carregamento**
8. **Sistema automaticamente:**
   - `fasePesagem = "FINAL"`
   - Preenche dados (não editáveis)
   - Mostra apenas inputs de pesos finais
9. **Usuário insere Pesos Finais (em TON):**
   - Eixo 1: 12,500 TON → Sistema armazena: 12500kg
   - Eixo 2: 12,200 TON → Sistema armazena: 12200kg
   - Eixo 3: 12,300 TON → Sistema armazena: 12300kg
   - **Total Final:** 37000kg
   - **Peso Líquido:** 37000 - 25000 = 12000kg (12 toneladas)
10. **Clica "Confirmar":**
    - Finaliza carregamento
    - Salva pesos finais: `final_eixos_kg = {1: 12500, 2: 12200, 3: 12300}`
    - `status = "finalizado"`

---

## ⚠️ Pontos de Atenção

1. **Conversão TON ↔ kg:**
   - Sempre verificar se a conversão está correta
   - Usuário vê TON, sistema trabalha com kg

2. **Fase vs Status:**
   - **Fase** (`fasePesagem`): Controla qual pesagem está sendo feita (TARA ou FINAL)
   - **Status** (`status`): Controla o estado do carregamento (standby, finalizado)

3. **Campos Desabilitados:**
   - Em standby, apenas pesos finais são editáveis
   - Todos os outros campos ficam bloqueados

4. **Validações:**
   - Não pode confirmar sem peso líquido > 0
   - Não pode criar standby sem tara
   - Não pode editar carregamento finalizado

---

## 🛠️ Funções Principais

### **`handleStandBy()`**
- Cria carregamento em standby
- Salva tara e dados básicos
- Requer: placa e pesos da tara

### **`handleConfirmar()`**
- Finaliza carregamento
- Salva pesos finais
- Calcula peso líquido
- Se > 48000kg, abre modal de split

### **`handleSelecionarVenda()`**
- Preenche dados do carregamento selecionado
- Define fase baseada no status
- Preenche pesos se disponíveis

### **`calcularTara()`**
- Calcula tara total a partir dos pesos dos eixos
- Usado quando não há `taraKg` definido

---

## 📊 Estrutura de Dados no Banco

### **Carregamento (carregamentos)**
```json
{
  "id": 1,
  "placa": "ABC-1234",
  "eixos": 3,
  "status": "standby",
  "tara_kg": 25000,
  "tara_eixos_kg": {
    "1": 8500,
    "2": 8200,
    "3": 8300
  },
  "final_eixos_kg": null, // Preenchido na finalização
  "peso_final_total": null,
  "data_carregamento": "2024-01-15T10:00:00Z"
}
```

---

## ✅ Checklist de Validação

### **Antes de Criar Standby:**
- [ ] Placa selecionada
- [ ] Quantidade de eixos definida
- [ ] Todos os pesos da tara preenchidos
- [ ] `pesoTotal > 0`

### **Antes de Confirmar:**
- [ ] Carregamento selecionado
- [ ] Todos os pesos finais preenchidos
- [ ] `pesoLiquido > 0`
- [ ] `pesoTotal > 0`
- [ ] Se `pesoLiquido > 48000kg`, decidir sobre split

---

## 🔄 Resumo do Fluxo

1. **Buscar/Selecionar** → Define carregamento
2. **Preencher Dados** → Informações básicas
3. **Inserir Pesos Tara** → Peso vazio
4. **Stand By** → Salva e aguarda carga
5. **Inserir Pesos Finais** → Peso com carga
6. **Confirmar** → Finaliza carregamento

---

**Última atualização:** 2024-01-15

