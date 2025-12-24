# PDV Roma — Mapa Técnico de JSObjects (Appsmith)

Fonte: export Appsmith `PDV - Roma (JSObjects).json`. Este documento descreve **cada JSObject**, sua API (funções), dependências (store/queries/widgets) e trechos de código relevantes para entendimento/portabilidade.

## Convenções Appsmith usadas

- `storeValue(key, value)`: grava no `appsmith.store`.
- `appsmith.store.<chave>`: estado global da página.
- `Query.run(params)`: executa query/action configurada no Appsmith.
- `showAlert(msg, type)`, `showModal(id)`, `closeModal(id)`, `resetWidget(id, resetChildren)`.

## Índice de JSObjects

- [JSController](#jscontroller)
- [JSLimpar](#jslimpar)
- [ImpressaoController](#impressaocontroller)
- [CarregamentoController](#carregamentocontroller)
- [Urls](#urls)
- [TicketUI](#ticketui)
- [PlacasSelectController](#placasselectcontroller)
- [SplitController](#splitcontroller)


---

## JSController

**Página:** Início  
**Tipo:** ActionCollection (JSObject)

### Dependências

- **Queries/Actions chamadas:** listarProdutosDaVenda

- **Widgets/Modais manipulados:** (nenhum detectado)

- **Chaves de store tocadas/referenciadas (parcial):** carregamentoIdAtual, carregamentoSelecionado, isResetting, modoPesagem, mostrarDetalhes, produto_venda_id, produtosDaVenda, vendaSelecionada

### API (funções)

#### `_pickVendaIdTxt`

- **Assinatura:** `_pickVendaIdTxt(item) {`

- **Efeito principal:** helper/utilitário

```js
_pickVendaIdTxt(item) {
    const candidates = [
      item?.venda_id,
      item?.codigo,
      item?.id_gc,
      item?.id,              // alguns contratos vêm assim
      item?.venda,           // casos raros
      item?.codigo_venda,
      item?.cod,
      item?.numero
    ];
    for (const v of candidates) {
      if (v !== null && v !== undefined) {
        const s = String(v).trim();
        if (s.length) return s;
      }
    }
    return null;
  },
```

#### `_runListarProdutosDaVenda`

- **Assinatura:** ``

- **Efeito principal:** manipula appsmith.store (storeValue); executa queries/actions (.run)

```js
async _runListarProdutosDaVenda() {                                  // <<< NOVO
    const vendaKey = String(appsmith.store.vendaSelecionada?.venda_id ?? "");
    const carregamentoId = Number(appsmith.store.carregamentoIdAtual) || 0;

    if (!vendaKey && !carregamentoId) {
      await storeValue("produtosDaVenda", []);
      return 0;
    }

    const rows = await listarProdutosDaVenda.run({
      carregamento_id: carregamentoId,
      venda_key: vendaKey
    });

    const arr = Array.isArray(rows) ? rows : [];
    await storeValue("produtosDaVenda", arr);

    // Pré-seleciona se houver exatamente 1 opção e nada selecionado
    if (!appsmith.store.produto_venda_id && arr.length === 1 && arr[0]?.produto_venda_id != null) {
      await storeValue("produto_venda_id", String(arr[0].produto_venda_id));
    }
    return arr.length || 0;
  },
```

#### `init`

- **Assinatura:** `init() {`

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
init() {
    if (appsmith.store.isResetting === undefined) storeValue("isResetting", false);
    if (appsmith.store.modoPesagem === undefined) storeValue("modoPesagem", false);
    if (appsmith.store.mostrarDetalhes === undefined) storeValue("mostrarDetalhes", false);
    if (appsmith.store.vendaSelecionada === undefined) storeValue("vendaSelecionada", null);
    if (appsmith.store.carregamentoSelecionado === undefined) storeValue("carregamentoSelecionado", null);
    if (appsmith.store.produto_venda_id === undefined) storeValue("produto_venda_id", "");
    if (appsmith.store.carregamentoIdAtual === undefined) storeValue("carregamentoIdAtual", null);      // <<< NOVO
    if (appsmith.store.produtosDaVenda === undefined) storeValue("produtosDaVenda", []);                 // <<< NOVO
  },
```

#### `limparSelecao`

- **Assinatura:** ``

- **Efeito principal:** (não extraído automaticamente)

> Trecho não extraído automaticamente. Busque por `limparSelecao` no body do JSObject.

#### `selecionarVenda`

- **Assinatura:** ``

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
async selecionarVenda(item) {
    await storeValue("isResetting", true);

    // detectar se é CARREGAMENTO
    const isCarregamento =
      item?.carregamento_id != null ||
      item?.tara_total != null ||
      item?.peso_final_total != null ||
      item?.status != null;

    if (isCarregamento) {
      // --- CARREGAMENTO ---
      await storeValue("carregamentoSelecionado", item);

      // venda_id é TEXT nas suas tabelas
      const vendaIdTxt = this._pickVendaIdTxt(item);
      await storeValue("vendaSelecionada", vendaIdTxt ? { venda_id: String(vendaIdTxt) } : null);

      // sincroniza id do carregamento para a query parametrizada
      const cid = Number(item?.carregamento_id || item?.id || 0) || null;
      await storeValue("carregamentoIdAtual", cid);

      // se existir produto_venda_id no carregamento, aproveite (como STRING)
      const pvid = (item?.produto_venda_id == null) ? "" : String(item.produto_venda_id);
      await storeValue("produto_venda_id", pvid);
    } else {
      // --- VENDA (CONTRATO) ---
      await storeValue("carregamentoSelecionado", null);

      const vendaIdTxt = this._pickVendaIdTxt(item);
      await storeValue("vendaSelecionada", 
  // ... (truncado)
}
```


---

## JSLimpar

**Página:** Início  
**Tipo:** ActionCollection (JSObject)

### Dependências

- **Queries/Actions chamadas:** (nenhuma detectada)

- **Widgets/Modais manipulados:** (nenhum detectado)

- **Chaves de store tocadas/referenciadas (parcial):** carregamentoIdAtual, carregamentos, cliente, ctx_token, dataFim, dataInicio, detalhes_produto, eixos, errosFinal, etapaPesagem, excedeConjunto, excedeEixo, fasePesagem, isFinalValido, isResetting, itemAtual, modalAberto, modoConjuntos, modoEdicaoPesagem, modoPesagem, mostrarDetalhes, motorista_id, observacoes, paginaAtual, payload1, payload2, peso_inicial, pesosFinal, pesosFinalLastValid, pesosFinalRaw, pesosPorEixo, pesosTara, pesosTaraRaw, pesos_eixos, placa, placa_norm, produtoSelecionadoId, produto_id, produto_nome, produto_quantidade ...

### API (funções)

#### `limpar`

- **Assinatura:** `limpar: async () => {`

- **Efeito principal:** (não extraído automaticamente)

> Trecho não extraído automaticamente. Busque por `limpar` no body do JSObject.


---

## ImpressaoController

**Página:** Início  
**Tipo:** ActionCollection (JSObject)

### Dependências

- **Queries/Actions chamadas:** BuscarPorCodigo, buscaPorCodigo, buscarPorCodigo, n8n_ImprimirTicket

- **Widgets/Modais manipulados:** ModalTicket

- **Chaves de store tocadas/referenciadas (parcial):** detalhes_produto, modoPesagem, observacoes, pesos_eixos_array, produtosDaVenda, qtd_desejada, ticketHtml, vendaSelecionada

### API (funções)

#### `_ensureArray`

- **Assinatura:** `_ensureArray(a) { return Array.isArray(a) ? a : []; },`

- **Efeito principal:** helper/utilitário

```js
_ensureArray(a) { return Array.isArray(a) ? a : []; },
  _sum(arr) { return this._ensureArray(arr).reduce((s, v) => s + (Number(v) || 0), 0); },
  _fmtTon(kg) {
    if (kg == null || Number.isNaN(Number(kg))) return "-";
    const ton = Number(kg) / 1000;
    return ton.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + " TON";
  },
```

#### `_fmtTon`

- **Assinatura:** `_fmtTon(kg) {`

- **Efeito principal:** helper/utilitário

```js
_fmtTon(kg) {
    if (kg == null || Number.isNaN(Number(kg))) return "-";
    const ton = Number(kg) / 1000;
    return ton.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + " TON";
  },
```

#### `_sum`

- **Assinatura:** `_sum(arr) { return this._ensureArray(arr).reduce((s, v) => s + (Number(v) || 0), 0); },`

- **Efeito principal:** helper/utilitário

```js
_sum(arr) { return this._ensureArray(arr).reduce((s, v) => s + (Number(v) || 0), 0); },
  _fmtTon(kg) {
    if (kg == null || Number.isNaN(Number(kg))) return "-";
    const ton = Number(kg) / 1000;
    return ton.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + " TON";
  },
```

#### `_venda`

- **Assinatura:** `_venda() { return appsmith.store?.vendaSelecionada ?? {}; },`

- **Efeito principal:** helper/utilitário

```js
_venda() { return appsmith.store?.vendaSelecionada ?? {}; },

  _vendaInfoPorCodigo() {
    const codigo = this.vendaCodigo();
    if (!codigo) return null;

    const data =
      globalThis?.buscaPorCodigo?.data ||
      globalThis?.BuscarPorCodigo?.data ||
      globalThis?.buscarPorCodigo?.data ||
      [];

    if (!Array.isArray(data) || !data.length) return null;

    const row = data.find(r => String(r?.codigo) === String(codigo)) || data[0];
    return row || null;
  },
```

#### `_vendaInfoPorCodigo`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
_vendaInfoPorCodigo() {
    const codigo = this.vendaCodigo();
    if (!codigo) return null;

    const data =
      globalThis?.buscaPorCodigo?.data ||
      globalThis?.BuscarPorCodigo?.data ||
      globalThis?.buscarPorCodigo?.data ||
      [];

    if (!Array.isArray(data) || !data.length) return null;

    const row = data.find(r => String(r?.codigo) === String(codigo)) || data[0];
    return row || null;
  },
```

#### `baixarTicket`

- **Assinatura:** ``

- **Efeito principal:** (não extraído automaticamente)

> Trecho não extraído automaticamente. Busque por `baixarTicket` no body do JSObject.

#### `buildPayload`

- **Assinatura:** `buildPayload(previewFlag) {`

- **Efeito principal:** helper/utilitário

```js
buildPayload(previewFlag) {
    const fase = this.faseAtual();

    const tara_total_kg = this.taraTotalKg();
    const final_total_kg = this.finalTotalKg();
    const liquido_kg    = this.liquidoKg();

    const tara_arr  = this.pesosTara();
    const final_arr = this.pesosFinal();

    return {
      acao: "imprimir_ticket",
      pdv: "appsmith",
      venda: {
        codigo: this.vendaCodigo(),
        id_gc: this.vendaIdGC(),
        cliente: this.vendaCliente(),
        placa: this.vendaPlaca(),
        carregamento_id: this.vendaCarregamentoId(),
        produtos: this.vendaProdutos(),
        produto_venda_id: this.produtoVendaSelecionadoId(),
        produto_nome: this.produtoNome(),
        motorista_id: this.motoristaId(),
        motorista_nome: this.motoristaNome(),
        transportadora_id: this.transportadoraId(),
        transportadora_nome: this.transportadoraNome()
      },
```

#### `eixosSelecionados`

- **Assinatura:** `eixosSelecionados() {`

- **Efeito principal:** helper/utilitário

```js
eixosSelecionados() {
    const dd = this.w("dropdown_eixos");
    const raw = dd?.selectedOptionValue ?? dd?.selectedOption?.value;
    const n = Number(raw);
    if (!isNaN(n) && n > 0) return n;

    const se = Number(appsmith.store?.eixos);
    if (!isNaN(se) && se > 0) return se;

    const base = this.faseAtual() === "FINAL" ? this.pesosFinal() : this.pesosTara();
    if (base.length > 0) return base.length;

    return this.pesos().length;
  },
```

#### `faseAtual`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
faseAtual() {
    return String(appsmith.store?.fasePesagem || "TARA").toUpperCase();
  },
```

#### `finalTotalKg`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
finalTotalKg() {
    const direto = Number(appsmith.store?.peso_final_total);
    if (Number.isFinite(direto) && direto > 0) return direto;
    const soma = this._sum(this.pesosFinal());
    return soma > 0 ? soma : null;
  },
```

#### `imprimir`

- **Assinatura:** `imprimir() {`

- **Efeito principal:** executa queries/actions (.run); exibe alertas (showAlert)

```js
imprimir() {
    if (!appsmith.store.vendaSelecionada) {
      showAlert("Selecione uma venda antes de imprimir.", "warning");
      return;
    }
    if (!appsmith.store.modoPesagem) {
      showAlert("Ative o modo de pesagem antes de imprimir.", "warning");
      return;
    }

    const fase = this.faseAtual();
    if (fase === "FINAL" && (this.taraTotalKg() == null)) {
      showAlert("TARA não encontrada. Final depende da tara para calcular o líquido.", "warning");
      return;
    }

    if (fase === "TARA" && !this.pesosTara().length && !this.pesos().length) {
      showAlert("Informe ao menos um peso de eixo de TARA antes de imprimir.", "warning");
      return;
    }
    if (fase === "FINAL" && !this.pesosFinal().length && !this.pesos().length) {
      showAlert("Informe ao menos um peso de eixo FINAL antes de imprimir.", "warning");
      return;
    }

    n8n_ImprimirTicket.run(
      (res) => {
        const url =
          res?.url ||
          res?.fileUrl ||
          n8n_ImprimirTicket.data?.url ||
          n8n_ImprimirTicket.data?.fileUrl;

        if (url) {
          showAlert("Documento gerado. Abrindo...", "success");
          navigateTo(url, {}, "NEW_WIN
  // ... (truncado)
}
```

#### `imprimirDireto`

- **Assinatura:** ``

- **Efeito principal:** executa queries/actions (.run); exibe alertas (showAlert)

```js
async imprimirDireto() {
    return n8n_ImprimirTicket.run(
      (res) => {
        const url =
          res?.url ||
          res?.fileUrl ||
          n8n_ImprimirTicket.data?.url ||
          n8n_ImprimirTicket.data?.fileUrl;

        if (!url) {
          showAlert("Webhook não retornou a URL do ticket.", "error");
          return;
        }
        navigateTo(url, "NEW_WINDOW");
      },
```

#### `imprimirDoPreview`

- **Assinatura:** ``

- **Efeito principal:** exibe alertas (showAlert)

```js
imprimirDoPreview() {
    const html = appsmith.store?.ticketHtml;
    if (!html || typeof html !== "string") {
      showAlert("Abra a pré-visualização antes (ticket vazio).", "warning");
      return;
    }

    const hasPrint = /window\.print\(\)/.test(html);
    const toOpen = hasPrint
      ? html
      : html.replace(/<\/body>\s*<\/html>\s*$/i,
          '<script>window.addEventListener("load",function(){try{window.print()}catch(e){}});</script></body></html>');

    function utf8ToB64(str) {
      let out = "";
      for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        if (c < 128) {
          out += String.fromCharCode(c);
        } else if (c < 2048) {
          out += String.fromCharCode(192 | (c >> 6));
          out += String.fromCharCode(128 | (c & 63));
        } else if (c >= 0xD800 && c <= 0xDBFF) {
          i++;
          const c2 = str.charCodeAt(i);
          const cp = 0x10000 + (((c & 0x3FF) << 10) | (c2 & 0x3FF));
          out += String.fromCharCode(240 | (cp >> 18));
          out += String.fromCharCode(128 | ((cp >> 12) & 63));
          out += String.fromCharCode(128 | ((cp >> 6) & 63));
          out += String.fromCharCode
  // ... (truncado)
}
```

#### `liquidoKg`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
liquidoKg() {
    const tara = this.taraTotalKg();
    const fin = this.finalTotalKg();
    if (tara == null || fin == null) return null;
    return fin - tara;
  },
```

#### `motoristaId`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
motoristaId() {
    const n = Number(appsmith.store?.motorista_id);
    return Number.isFinite(n) ? n : null;
  },
```

#### `motoristaNome`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
motoristaNome() {
    const w = this.w("selecaoMotorista");
    return w?.selectedOptionLabel ?? this._venda()?.motorista_nome ?? null;
  },
```

#### `observacoesCompletas`

- **Assinatura:** `observacoesCompletas() {`

- **Efeito principal:** helper/utilitário

```js
observacoesCompletas() {
    const detalhes = appsmith.store.detalhes_produto || "";
    const obs = appsmith.store.observacoes || "";
    
    if (detalhes && obs) {
      return `${detalhes} | ${obs}`;
    }
    return detalhes || obs || "";
  },
```

#### `parsePeso`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
parsePeso(text) {
    if (text === null || text === undefined) return null;
    let s = String(text).trim();
    if (s.match(/,\d{1,3}$/)) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, ".");
    }
    const n = Number(s);
    return (!isNaN(n) && n > 0) ? n : null;
  },
```

#### `pesoTotal`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
pesoTotal() {
    return this.pesos().reduce((s, n) => s + n, 0);
  },
```

#### `pesos`

- **Assinatura:** `pesos(maxEixos = 12) {`

- **Efeito principal:** helper/utilitário

```js
pesos(maxEixos = 12) {
    const vals = [];
    for (let i = 1; i <= maxEixos; i++) {
      const w = this.w(`input_peso_eixo${i}`);
      let v = null;

      if (w && typeof w.text === "string") v = this.parsePeso(w.text);

      if (v === null) {
        const sv = appsmith.store?.[`peso_eixo${i}`];
        if (sv !== undefined && sv !== null) {
          const n = Number(sv);
          v = (!isNaN(n) && n > 0) ? n : null;
        }
      }

      if (v !== null) vals.push(v);
    }

    if (!vals.length && Array.isArray(appsmith.store?.pesos_eixos_array)) {
      const arr = appsmith.store.pesos_eixos_array;
      return arr.filter(n => typeof n === "number" && !isNaN(n) && n > 0);
    }

    return vals;
  },
```

#### `pesosFinal`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
pesosFinal() {
    const arr = this._ensureArray(appsmith.store?.pesosFinal);
    if (arr.length) return arr.filter(n => Number(n) > 0);
    if (this.faseAtual() === "FINAL") return this.pesos();
    return [];
  },
```

#### `pesosTara`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
pesosTara() {
    const arr = this._ensureArray(appsmith.store?.pesosTara);
    if (arr.length) return arr.filter(n => Number(n) > 0);
    if (this.faseAtual() === "TARA") return this.pesos();
    return [];
  },
```

#### `preview`

- **Assinatura:** ``

- **Efeito principal:** manipula appsmith.store (storeValue); executa queries/actions (.run); exibe alertas (showAlert); controla modais

```js
async preview() {
    showModal('ModalTicket');
    await storeValue('ticketHtml', "");

    try {
      if (globalThis?.buscaPorCodigo?.run) {
        await globalThis.buscaPorCodigo.run();
      } else if (globalThis?.BuscarPorCodigo?.run) {
        await globalThis.BuscarPorCodigo.run();
      } else if (globalThis?.buscarPorCodigo?.run) {
        await globalThis.buscarPorCodigo.run();
      }
    } catch (e) {
      console.log("buscaPorCodigo falhou (segue sem bloquear):", e);
    }

    return n8n_ImprimirTicket.run(
      async (res) => {
        let html = res?.html;
        if (!html) {
          const dataUrl = res?.url || n8n_ImprimirTicket.data?.url;
          if (dataUrl && String(dataUrl).startsWith("data:text/html;base64,")) {
            const base64 = String(dataUrl).split("base64,")[1];
            html = atob(base64);
          }
        }
        if (!html) {
          showAlert("Webhook não retornou HTML do ticket.", "error");
          return;
        }
        await storeValue('ticketHtml', html);
        showAlert("Pré-visualização pronta.", "success");
      },
```

#### `produtoNome`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
produtoNome() {
    const w = this.w("selecaoProduto");
    if (w?.selectedOptionLabel) return w.selectedOptionLabel;
    const arr = Array.isArray(appsmith.store?.produtosDaVenda) ? appsmith.store.produtosDaVenda : [];
    const cur = String(appsmith.store?.produto_venda_id || "");
    const row = arr.find(r => String(r?.produto_value) === cur);
    return row?.nome_produto ?? null;
  },
```

#### `produtoVendaSelecionadoId`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
produtoVendaSelecionadoId() {
    let val = appsmith.store?.produto_venda_id;
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return String(val);
    }

    const w = this.w("selecaoProduto");
    const raw = w?.selectedOptionValue ?? w?.selectedOption?.value ?? null;
    if (raw !== undefined && raw !== null && String(raw).trim() !== "") {
      return String(raw);
    }

    const arr = Array.isArray(appsmith.store?.produtosDaVenda) ? appsmith.store.produtosDaVenda : [];
    if (arr.length === 1 && arr[0]?.produto_value != null) {
      return String(arr[0].produto_value);
    }

    return null;
  },
```

#### `taraTotalKg`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
taraTotalKg() {
    const direto = Number(appsmith.store?.tara_total);
    if (Number.isFinite(direto) && direto > 0) return direto;
    const soma = this._sum(this.pesosTara());
    return soma > 0 ? soma : null;
  },
```

#### `transportadoraId`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
transportadoraId() {
    const raw = appsmith.store?.transportadora_id;
    const n = raw == null ? null : Number(raw);
    return Number.isFinite(n) ? n : null;
  },
```

#### `transportadoraNome`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
transportadoraNome() {
    const w = this.w("selecaoTransportadora");
    return w?.selectedOptionLabel ?? this._venda()?.transportadora_nome ?? null;
  },
```

#### `vendaCarregamentoId`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
vendaCarregamentoId() {
    const v = this._venda();
    return v.carregamento_id ?? appsmith.store?.carregamentoIdAtual ?? null;
  },
```

#### `vendaCliente`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
vendaCliente() {
    const q = (globalThis.buscaPorCodigo?.data
            || globalThis.BuscarPorCodigo?.data
            || globalThis.buscarPorCodigo?.data
            || []);
    if (Array.isArray(q) && q.length && q[0]?.nome_cliente) {
      return String(q[0].nome_cliente).trim();
    }

    const v = this._venda();
    const s = appsmith.store || {};
    const wCliente =
      (this.w('input_cliente')?.text ||
       this.w('txtCliente')?.text ||
       this.w('cliente')?.text || "").trim() || null;

    return (
      s.cliente ||
      v?.nome_cliente ||
      v?.cliente ||
      v?.cliente_nome ||
      wCliente ||
      null
    );
  },
```

#### `vendaCodigo`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
vendaCodigo() {
    const v = this._venda();
    let cod = v.codigo ?? v.cod_venda ?? v.codigo_venda ?? v.venda_id ?? null;
    if (cod) return String(cod);

    const q = (globalThis.buscaPorCodigo?.data
            || globalThis.BuscarPorCodigo?.data
            || globalThis.buscarPorCodigo?.data
            || []);
    if (Array.isArray(q) && q.length && q[0]?.codigo) {
      return String(q[0].codigo);
    }

    const w = this.w("input_busca");
    if (w?.text) return String(w.text);

    return null;
  },
```

#### `vendaIdGC`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
vendaIdGC() {
    const v = this._venda();

    const q = (globalThis.buscaPorCodigo?.data
            || globalThis.BuscarPorCodigo?.data
            || globalThis.buscarPorCodigo?.data
            || []);
    if (Array.isArray(q) && q.length && q[0]?.id_gc) {
      return String(q[0].id_gc);
    }

    if (v.id_gc) return String(v.id_gc);
    if (v.venda_id && /^\d+$/.test(String(v.venda_id))) return String(v.venda_id);

    const prods = Array.isArray(appsmith.store?.produtosDaVenda) ? appsmith.store.produtosDaVenda : [];
    if (prods.length && prods[0]?.dbg_id_gc) return String(prods[0].dbg_id_gc);

    return null;
  },
```

#### `vendaPlaca`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
vendaPlaca() {
    const v = this._venda();
    let placa = v.placa ?? v.placa_norm ?? appsmith.store?.placa_norm ?? appsmith.store?.placa ?? null;

    if (!placa) {
      const sp = this.w("selecaoPlaca");
      const raw = sp?.selectedOptionValue ?? sp?.selectedOption?.value ?? null;
      if (raw) placa = String(raw);
    }

    if (!placa) return null;
    return String(placa).toUpperCase().replace(/[^A-Z0-9]/g, "");
  },
```

#### `vendaProdutos`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
vendaProdutos() {
    const arr = Array.isArray(appsmith.store?.produtosDaVenda) ? appsmith.store.produtosDaVenda : null;
    return (arr && arr.length) ? arr : null;
  },
```

#### `w`

- **Assinatura:** `w(name) {`

- **Efeito principal:** helper/utilitário

```js
w(name) {
    try { return globalThis?.[name] ?? null; } catch { return null; }
  },
```


### Observações específicas (Impressão)

- Gera HTML do ticket (com Chart.js embutido) e abre em nova janela via `data:text/html;base64,...`.


---

## CarregamentoController

**Página:** Início  
**Tipo:** ActionCollection (JSObject)

### Dependências

- **Queries/Actions chamadas:** buscarUsuarioPorEmail, criarCarregamentoEmEspera, getCarregamentoDetalhe, getProdutoVendaBasico, inserirLogAcao, listarMotoristasPorPlaca, listarPlacasRecentes, listarProdutosDaVenda

- **Widgets/Modais manipulados:** ContainerPesagemFinal, ContainerPesagemTara, InputObservacoes, ListaVendas, SelectProduto, dropdown_eixos, inputDetalhesProduto, input_busca, selecaoMotorista, selecaoPlaca, selecaoProduto, selecaoTransportadora

- **Chaves de store tocadas/referenciadas (parcial):** carregamentoIdAtual, carregamento_id, cliente, conjuntos, ctx_token, dataFim, dataInicio, detalhes_produto, eixos, errosFinal, etapaPesagem, excedeConjunto, excedeEixo, fasePesagem, id, isFinalValido, isResetting, itemAtual, limitesPorConjunto, limitesPorEixo, modalAberto, modoConjuntos, modoEdicaoPesagem, modoPesagem, mostrarDetalhes, motorista_id, observacoes, paginaAtual, parametrosPesagem, peso_inicial, pesosFinal, pesosFinalLastValid, pesosFinalRaw, pesosPorEixo, pesosTara, pesosTaraRaw, pesos_eixos, placa, placa_norm, produtoSelecionadoId ...

### API (funções)

#### `_calcularPesos`

- **Assinatura:** `_calcularPesos() {`

- **Efeito principal:** helper/utilitário

```js
_calcularPesos() {
  if (this.isModoUnico()) {
    const finalKg = Number((appsmith.store.pesosFinal || [])[0] || 0);
    const taraKg  = Number((appsmith.store.pesosTara  || [])[0] || 0);
    if (!Number.isFinite(finalKg) || finalKg <= 0) throw new Error("Peso final total inválido.");
    if (!Number.isFinite(taraKg)  || taraKg  <  0) throw new Error("Tara total inválida.");
    const liquido = finalKg - taraKg;
    if (!Number.isFinite(liquido) || liquido <= 0) throw new Error("Peso líquido inválido (<= 0).");
    return { finais: [finalKg], final_total: finalKg, tara_total: taraKg, liquido };
  }
  const finais = this.lerFinalPorEixo();
  const tara   = this.lerTaraPorEixo();
  const final_total = finais.reduce((s, n) => s + n, 0);
  const tara_total  = tara.reduce((s, n) => s + n, 0);
  const liquido     = final_total - tara_total;
  if (!Number.isFinite(liquido) || liquido <= 0) {
    throw new Error("Peso líquido inválido (<= 0). Verifique a pesagem final.");
  }
  return { finais, final_total, tara_total, liquido };
},
```

#### `_ensureArray`

- **Assinatura:** `_ensureArray(a) { return Array.isArray(a) ? a : []; },`

- **Efeito principal:** helper/utilitário

```js
_ensureArray(a) { return Array.isArray(a) ? a : []; },
	_maybeParseJSON(v) {
		if (Array.isArray(v)) return v;
		if (typeof v === "string") {
			try { const j = JSON.parse(v); return Array.isArray(j) ? j : v; } catch { return v; }
		}
		return v;
	},
```

#### `_firstDefined`

- **Assinatura:** `_firstDefined(...vals) { for (let v of vals) if (v !== undefined && v !== null && v !== "") return v; },`

- **Efeito principal:** exibe alertas (showAlert)

```js
_firstDefined(...vals) { for (let v of vals) if (v !== undefined && v !== null && v !== "") return v; },

	_getVenda() {
		const v = appsmith.store.vendaSelecionada;
		if (!v) { showAlert("Selecione uma venda primeiro.", "warning"); throw new Error("Nenhuma venda selecionada"); }
		return v;
	},
```

#### `_formatTonBRFromKg`

- **Assinatura:** `_formatTonBRFromKg(kg) {`

- **Efeito principal:** helper/utilitário

```js
_formatTonBRFromKg(kg) {
		const n = Number(kg);
		if (!isFinite(n) || n === 0) return "";
		const ton = n / 1000;
		return ton.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
	},
```

#### `_getConjuntos`

- **Assinatura:** `_getConjuntos() {`

- **Efeito principal:** helper/utilitário

```js
_getConjuntos() {
  const cfg = appsmith.store.conjuntos || appsmith.store.parametrosPesagem?.conjuntos || null;
  if (Array.isArray(cfg) && cfg.length) return cfg;
  const e = this._getEixos();
  // Cada eixo é um conjunto individual
  const conjuntos = [];
  for (let i = 1; i <= e; i++) {
    conjuntos.push([i]);
  }
  return conjuntos.length > 0 ? conjuntos : [[1]];
},
```

#### `_getEixos`

- **Assinatura:** `_getEixos() {`

- **Efeito principal:** helper/utilitário

```js
_getEixos() {
  const n = Number(appsmith.store.eixos);
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : 0; 
},
```

#### `_getFinalPorConjuntoArray`

- **Assinatura:** `_getFinalPorConjuntoArray() {`

- **Efeito principal:** helper/utilitário

```js
_getFinalPorConjuntoArray() {
		const conjuntos = this._getConjuntos();
		const e = Number(appsmith.store.eixos || 0);
		const finaisEixoOuConj = Array.isArray(appsmith.store.pesosFinal) ? [...appsmith.store.pesosFinal] : [];
		if (this._isPorConjunto()) {
			while (finaisEixoOuConj.length < conjuntos.length) finaisEixoOuConj.push(0);
			return finaisEixoOuConj.slice(0, conjuntos.length).map(v => Number(v) || 0);
		}
		while (finaisEixoOuConj.length < e) finaisEixoOuConj.push(0);
		return conjuntos.map(indices1 => indices1.reduce((acc, i1) => acc + (Number(finaisEixoOuConj[i1 - 1]) || 0), 0));
	},
```

#### `_getLimitesPorConjunto`

- **Assinatura:** `_getLimitesPorConjunto() {`

- **Efeito principal:** helper/utilitário

```js
_getLimitesPorConjunto() {
		const lim = appsmith.store.limitesPorConjunto || appsmith.store.parametrosPesagem?.limites?.porConjunto || null;
		let out = null;
		if (Array.isArray(lim)) {
			out = lim.map(v => Number(v) || 0);
		} else if (lim && typeof lim === "object") {
			const conjuntos = this._getConjuntos();
			const keys = Object.keys(lim);
			if (keys.length) out = conjuntos.map((_, i) => Number(lim[keys[i]]) || 0);
		}
		if (!out) {
			const qtd = this._getConjuntos().length;
			const padrao = Number(this.getParametro("peso_maximo_conjunto") || 0);
			const eixoPadrao = Number(this.getParametro("peso_maximo_eixo") || 0);
			const base = padrao || eixoPadrao || 0;
			if (base > 0) return Array.from({ length: qtd }, () => base);
			return null;
		}
		return out;
	},
```

#### `_getLimitesPorEixo`

- **Assinatura:** `_getLimitesPorEixo() {`

- **Efeito principal:** helper/utilitário

```js
_getLimitesPorEixo() {
		const lim = appsmith.store.limitesPorEixo || appsmith.store.parametrosPesagem?.limites?.porEixo || null;
		return Array.isArray(lim) ? lim : null;
	},
```

#### `_getLiquidoPorConjuntoArray`

- **Assinatura:** `_getLiquidoPorConjuntoArray() {`

- **Efeito principal:** helper/utilitário

```js
_getLiquidoPorConjuntoArray() {
		const finalC = this._getFinalPorConjuntoArray();
		const taraC  = this._getTaraPorConjuntoArray();
		const n = Math.max(finalC.length, taraC.length);
		const out = [];
		for (let i = 0; i < n; i++) out.push((Number(finalC[i]) || 0) - (Number(taraC[i]) || 0));
		return out;
	},
```

#### `_getTaraPorConjuntoArray`

- **Assinatura:** `_getTaraPorConjuntoArray() {`

- **Efeito principal:** helper/utilitário

```js
_getTaraPorConjuntoArray() {
		const taraEixo = this._getTaraPorEixoArray();
		const conjuntos = this._getConjuntos();
		return conjuntos.map(indices1 => indices1.reduce((acc, i1) => acc + (taraEixo[i1 - 1] || 0), 0));
	},
```

#### `_getTaraPorEixoArray`

- **Assinatura:** `_getTaraPorEixoArray() {`

- **Efeito principal:** helper/utilitário

```js
_getTaraPorEixoArray() {
		const e = Number(appsmith.store.eixos || 0);
		const arr = Array.isArray(appsmith.store.pesosTara) ? [...appsmith.store.pesosTara] : [];
		while (arr.length < e) arr.push(0);
		return arr.slice(0, e).map(v => Number(v) || 0);
	},
```

#### `_getVenda`

- **Assinatura:** ``

- **Efeito principal:** exibe alertas (showAlert)

```js
_getVenda() {
		const v = appsmith.store.vendaSelecionada;
		if (!v) { showAlert("Selecione uma venda primeiro.", "warning"); throw new Error("Nenhuma venda selecionada"); }
		return v;
	},
```

#### `_getVendaKeyFromStore`

- **Assinatura:** `_getVendaKeyFromStore() {`

- **Efeito principal:** helper/utilitário

```js
_getVendaKeyFromStore() {
		const vSel = appsmith.store.vendaSelecionada || {};
		return String(this._firstDefined(vSel.id_gc, vSel.venda_id, vSel.id, vSel.codigo) || "");
	},
```

#### `_isPorConjunto`

- **Assinatura:** `_isPorConjunto() { return !!(appsmith.store.modoConjuntos ?? appsmith.store.parametrosPesagem?.modoConjuntos); },`

- **Efeito principal:** helper/utilitário

```js
_isPorConjunto() { return !!(appsmith.store.modoConjuntos ?? appsmith.store.parametrosPesagem?.modoConjuntos); },

	// ======================================================================
	// 8) =====[ Arrays por fase (tara/final/conjunto) e líquidos ]==========
	// ======================================================================
	_getTaraPorEixoArray() {
		const e = Number(appsmith.store.eixos || 0);
		const arr = Array.isArray(appsmith.store.pesosTara) ? [...appsmith.store.pesosTara] : [];
		while (arr.length < e) arr.push(0);
		return arr.slice(0, e).map(v => Number(v) || 0);
	},
```

#### `_limparInputsPesagemTara`

- **Assinatura:** `async _limparInputsPesagemTara() {`

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
async _limparInputsPesagemTara() {
		try {
			await resetWidget("ContainerPesagemTara", true);
			await storeValue("tara_total", null);
			await storeValue("pesosTara", []);
		} catch (_) {
			const eixos = Number(appsmith.store.eixos) || 5;
			const maxTentativas = Math.min(Math.max(eixos, 5), 10);
			const tentativas = [];
			for (let i = 1; i <= maxTentativas; i++) {
				tentativas.push(
					`input_peso_eixo_${i}`,
					`input_peso_eixo${i}`,
					`input_peso_eixo${String(i).padStart(2, "0")}`
				);
			}
			tentativas.push("input_tara_total", "input_peso_total_tara");
			for (const w of tentativas) { try { await resetWidget(w, false); } catch {} }
			await storeValue("tara_total", null);
			await storeValue("pesosTara", []);
		}
		await storeValue("tara_eixos_raw", "[]");
	},
```

#### `_maybeParseJSON`

- **Assinatura:** `_maybeParseJSON(v) {`

- **Efeito principal:** helper/utilitário

```js
_maybeParseJSON(v) {
		if (Array.isArray(v)) return v;
		if (typeof v === "string") {
			try { const j = JSON.parse(v); return Array.isArray(j) ? j : v; } catch { return v; }
		}
		return v;
	},
```

#### `_normalizeVendaSelecionada`

- **Assinatura:** `_normalizeVendaSelecionada(v) {`

- **Efeito principal:** helper/utilitário

```js
_normalizeVendaSelecionada(v) {
		if (!v) return null;
		const vendaId = this._firstDefined(v.id_gc, v.venda_id, v.id, v.codigo);
		if (!vendaId) return null;
		return { ...v, id_gc: String(vendaId), venda_id: String(vendaId) };
	},
```

#### `_parseKgFromTonBR`

- **Assinatura:** `_parseKgFromTonBR(str, require3dec=false) {`

- **Efeito principal:** helper/utilitário

```js
_parseKgFromTonBR(str, require3dec=false) {
		const ton = this._parseTonBR(str, require3dec);
		return Number.isFinite(ton) ? Math.round(ton * 1000) : NaN;
	},
```

#### `_parseTonBR`

- **Assinatura:** `_parseTonBR(str, require3dec=false) {`

- **Efeito principal:** helper/utilitário

```js
_parseTonBR(str, require3dec=false) {
		if (str === undefined || str === null) return NaN;
		const s = String(str).trim();
		if (!s) return NaN;
		const re = require3dec ? this.RE_BR_DEC_3 : this.RE_BR_DEC;
		if (!re.test(s)) return NaN;
		const canonical = s.replace(/\./g, "").replace(",", ".");
		const ton = Number(canonical);
		return Number.isFinite(ton) ? ton : NaN;
	},
```

#### `_pickVendaIdTxt`

- **Assinatura:** `_pickVendaIdTxt(item) {`

- **Efeito principal:** helper/utilitário

```js
_pickVendaIdTxt(item) {
		const candidates = [item?.venda_id, item?.codigo, item?.id_gc, item?.id, item?.venda, item?.codigo_venda, item?.cod, item?.numero];
		for (const v of candidates) {
			if (v !== null && v !== undefined) {
				const s = String(v).trim();
				if (s.length) return s;
			}
		}
		return null;
	},
```

#### `_safeItem`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
_safeItem(item) {
		if (item?.item && typeof item.item === "object") return item.item;
		if (item?.currentItem && typeof item.currentItem === "object") return item.currentItem;
		if (item?.data && typeof item.data === "object") return item.data;
		return item || {};
	},
```

#### `_sumKg`

- **Assinatura:** `_sumKg(arr) {`

- **Efeito principal:** helper/utilitário

```js
_sumKg(arr) {
		return (Array.isArray(arr) ? arr : [])
			.map(v => Number(v))
			.filter(v => Number.isFinite(v))
			.reduce((s, n) => s + n, 0);
	},
```

#### `_syncProdutoSelecionadoComOpcoes`

- **Assinatura:** ``

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
_syncProdutoSelecionadoComOpcoes() {
		const arr = Array.isArray(appsmith.store.produtosDaVenda) ? appsmith.store.produtosDaVenda : [];
		const ids = new Set(arr.map(r => String(r?.produto_value || "")));
		const atual = String(appsmith.store.produto_venda_id || "");
		if (!atual || !ids.has(atual)) {
			storeValue("produto_venda_id", "");
			storeValue("produtoSelecionadoId", "");
		}
	},
```

#### `_syncStoresFromWidgets`

- **Assinatura:** `async _syncStoresFromWidgets() {`

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
async _syncStoresFromWidgets() {
		try {
			if (!appsmith.store.motorista_id && globalThis.selecaoMotorista?.selectedOptionValue != null) {
				const v = Number(globalThis.selecaoMotorista.selectedOptionValue);
				await storeValue('motorista_id', Number.isFinite(v) ? v : null);
			}
			if (!appsmith.store.placa_norm && globalThis.selecaoPlaca?.selectedOptionValue) {
				const p = String(globalThis.selecaoPlaca.selectedOptionValue).toUpperCase().replace(/-/g,'');
				await storeValue('placa_norm', p || null);
			}
			if (!appsmith.store.transportadora_id && globalThis.selecaoTransportadora?.selectedOptionValue != null) {
				await storeValue('transportadora_id', String(globalThis.selecaoTransportadora.selectedOptionValue || ''));
			}
			if (!appsmith.store.produto_venda_id && globalThis.selecaoProduto?.selectedOptionValue != null) {
				const s = String(globalThis.selecaoProduto.selectedOptionValue || '');
				await storeValue('produto_venda_id', s);
				await storeValue('produtoSelecionadoId', s);
			}
			if (globalThis.dropdown_eixos?.selectedOptionValue != null) {
				const sel = Number(globalThis.dropdown_eixos.selectedOptionValue);
				if (Number(appsmith.store.eixos) !== se
  // ... (truncado)
}
```

#### `badgeTextoEixo`

- **Assinatura:** `badgeTextoEixo(i, modo = "valor", unidade = "t") {`

- **Efeito principal:** helper/utilitário

```js
badgeTextoEixo(i, modo = "valor", unidade = "t") {
    const idx = Number(i) - 1;
    if (!Number.isFinite(idx) || idx < 0) return "";
    
    const limC = this._getLimitesPorConjunto();
    if (!Array.isArray(limC) || limC.length === 0) return "";
    
    // Determinar o peso FINAL do input em KG
    let pesoFinalKg = 0;
    let temValor = false;
    
    // Pegar o valor atual do input correspondente de forma segura
    try {
        const inputName = `input_peso_eixo${i}`;
        const inputWidget = (typeof globalThis !== "undefined") ? globalThis[inputName] : null;
        const inputValue = inputWidget?.text || "";
        
        if (inputValue && inputValue.toString().trim()) {
            // Converter de toneladas para kg (input está em t)
            const valorLimpo = inputValue.toString().replace(',', '.').trim();
            const toneladas = Number(valorLimpo);
            if (Number.isFinite(toneladas)) {
                pesoFinalKg = toneladas * 1000;
                temValor = true;
            }
        }
    } catch {
        // Se não conseguir pegar do input, usar 0
        pesoFinalKg = 0;
        temValor = false;
    }
    
    // CORREÇÃO: Se não tem val
  // ... (truncado)
}
```

#### `carregarCarregamentoSelecionado`

- **Assinatura:** `async carregarCarregamentoSelecionado(carregamentoId) {`

- **Efeito principal:** manipula appsmith.store (storeValue); executa queries/actions (.run); exibe alertas (showAlert)

```js
async carregarCarregamentoSelecionado(carregamentoId) {
		try {
			const id = Number(carregamentoId);
			if (!id) return showAlert("Carregamento inválido.", "error");
			const r = await getCarregamentoDetalhe.run({ carregamento_id: id });
			const c = r?.[0];
			if (!c) return showAlert("Carregamento não encontrado.", "error");
			const placa = (c.placa || "").toString().toUpperCase();
			const eixos = Number(c.eixos) || null;
			const motoristaId = (c.motorista_id != null && c.motorista_id !== "") ? Number(c.motorista_id) : null;
			const transportadoraId = (c.transportadora_id != null && c.transportadora_id !== "") ? Number(c.transportadora_id) : null;
			await Promise.all([
				storeValue("carregamentoIdAtual", Number(c.id)),
				storeValue("placa_norm", placa || null),
				storeValue("eixos", eixos),
				storeValue("motorista_id", motoristaId),
				storeValue("transportadora_id", transportadoraId),
				storeValue("pesosFinal", []),
				storeValue("pesosFinalLastValid", null)
			]);
			await storeValue("vendaSelecionada", { id_gc: c.venda_id || null, codigo: c.venda_id || null });
			await listarProdutosDaVenda.run();
			await storeValue("produtosDaVenda", Array.isArray(listarP
  // ... (truncado)
}
```

#### `carregarProdutosDaVenda`

- **Assinatura:** `async carregarProdutosDaVenda() {`

- **Efeito principal:** manipula appsmith.store (storeValue); executa queries/actions (.run); exibe alertas (showAlert)

```js
async carregarProdutosDaVenda() {
		await storeValue("produto_venda_id", "");
		await storeValue("produtoSelecionadoId", "");
		if (typeof JSController?._runListarProdutosDaVenda === "function") {
			const n = await JSController._runListarProdutosDaVenda();
			this._syncProdutoSelecionadoComOpcoes();
			return n;
		}
		const vendaKey = this._getVendaKeyFromStore();
		const carregamentoId = Number(appsmith.store.carregamentoIdAtual) || 0;
		if (!vendaKey && !carregamentoId) {
			await storeValue("produtosDaVenda", []);
			this._syncProdutoSelecionadoComOpcoes();
			return 0;
		}
		try {
			const rows = await listarProdutosDaVenda.run({ carregamento_id: carregamentoId, venda_key: vendaKey });
			const arr = Array.isArray(rows) ? rows : [];
			await storeValue("produtosDaVenda", arr);
			if (arr.length === 1 && arr[0]?.produto_value) {
				const v = String(arr[0].produto_value);
				await storeValue("produto_venda_id", v);
				await storeValue("produtoSelecionadoId", v);
			} else {
				this._syncProdutoSelecionadoComOpcoes();
			}
			return arr.length || 0;
		} catch (e) {
			await storeValue("produtosDaVenda", []);
			this._syncProdutoSelecionadoComOpcoes();
			showAlert("Falha ao 
  // ... (truncado)
}
```

#### `criarEmEspera`

- **Assinatura:** `async criarEmEspera() {`

- **Efeito principal:** manipula appsmith.store (storeValue); exibe alertas (showAlert)

```js
async criarEmEspera() {
    const getErr = (e) => {
        try {
            return (
                e?.message ||
                e?.error?.message ||
                e?.responseMeta?.error?.message ||
                e?.data?.body ||
                e?.stack ||
                JSON.stringify(e)
            );
        } catch { return "erro desconhecido"; }
    };
    try {
        if (typeof this._syncStoresFromWidgets === "function") await this._syncStoresFromWidgets();
        
        // Captura valores dos inputs antes de criar carregamento
        const detalhes = inputDetalhesProduto?.text || "";
        const qtdDesejada = InputQtdDesejada?.text || "";
        await storeValue('detalhes_produto', detalhes);
        await storeValue('qtd_desejada', qtdDesejada);
        
        const prodMatch = String(appsmith.store.produto_venda_id ?? "").match(/\d+/);
        const prodSanStr = prodMatch ? prodMatch[0] : null;
        const prodSan = prodSanStr ? Number(prodSanStr) : null;
        await storeValue("produto_venda_id", prodSanStr);
        try { this.validarCamposObrigatorios(); } catch (e) { showAlert(e?.message || String(e), "warning"); return; }
        let taraArrSt
  // ... (truncado)
}
```

#### `debugParams`

- **Assinatura:** `debugParams() {`

- **Efeito principal:** (não extraído automaticamente)

> Trecho não extraído automaticamente. Busque por `debugParams` no body do JSObject.

#### `eixoConjuntos`

- **Assinatura:** `eixoConjuntos(i) {`

- **Efeito principal:** helper/utilitário

```js
eixoConjuntos(i) {
		const cjs = this._getConjuntos();
		const n = Number(i);
		const list = [];
		for (let c = 0; c < cjs.length; c++) if (Array.isArray(cjs[c]) && cjs[c].includes(n)) list.push(c);
		return list;
	},
```

#### `getParametro`

- **Assinatura:** `getParametro(key) { const row = getParametrosPesagem.data?.[0] || {}; return row[key]; },`

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
getParametro(key) { const row = getParametrosPesagem.data?.[0] || {}; return row[key]; },
	setFase(fase) {
		storeValue("fasePesagem", fase);
		if (fase === "FINAL") {
			const e = Number(appsmith.store.eixos) || 1;
			storeValue("excedeEixo", Array.from({ length: e }, () => false));
			storeValue("excedeConjunto", []);
			storeValue("errosFinal", []);
			storeValue("isFinalValido", true);
		}
	},
```

#### `getProdutoIdsParaPersistir`

- **Assinatura:** `getProdutoIdsParaPersistir() {`

- **Efeito principal:** helper/utilitário

```js
getProdutoIdsParaPersistir() {
		const row = this.getProdutoSelecionadoRow();
		if (!row) return { produto_venda_id: null, item_carregamento_id: null, origem: null };
		const origem = row.origem || (String(row.produto_value || "").startsWith("PC:") ? "CARREGAMENTO" : "VENDA");
		if (origem === "CARREGAMENTO") {
			return {
				produto_venda_id: null,
				item_carregamento_id: row.id_item_carreg || Number(String(row.produto_value).split(":")[1] || 0) || null,
				origem
			};
		}
		return {
			produto_venda_id: row.produto_venda_id ?? null,
			item_carregamento_id: null,
			origem
		};
	},
```

#### `getProdutoSelecionadoRow`

- **Assinatura:** `getProdutoSelecionadoRow() {`

- **Efeito principal:** helper/utilitário

```js
getProdutoSelecionadoRow() {
		const val = String(appsmith.store.produto_venda_id || "");
		const arr = Array.isArray(appsmith.store.produtosDaVenda) ? appsmith.store.produtosDaVenda : [];
		return arr.find(r => String(r?.produto_value || "") === val) || null;
	},
```

#### `handleChangeEixo`

- **Assinatura:** `handleChangeEixo(i, payload) {`

- **Efeito principal:** helper/utilitário

```js
handleChangeEixo(i, payload) {
		let text = "";
		if (typeof payload === "string") text = payload;
		else if (payload && typeof payload === "object") {
			if (typeof payload.text === "string") text = payload.text;
			else if (typeof payload.currentText === "string") text = payload.currentText;
			else if (typeof payload.value === "string") text = payload.value;
			else if (payload.target && typeof payload.target.value === "string") text = payload.target.value;
		}
		if (!text) {
			const wname = `input_peso_eixo${Number(i)}`;
			const w = (typeof globalThis !== "undefined") ? globalThis[wname] : null;
			if (w && typeof w.text === "string") text = w.text;
		}
		this.onInputEixoChange(Number(i), text);
	},
```

#### `init`

- **Assinatura:** `init() {`

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
init() {
		if (appsmith.store.isResetting === undefined) storeValue("isResetting", false);
		if (appsmith.store.modoPesagem === undefined) storeValue("modoPesagem", false);
		if (appsmith.store.mostrarDetalhes === undefined) storeValue("mostrarDetalhes", false);
		if (appsmith.store.vendaSelecionada === undefined) storeValue("vendaSelecionada", null);
		if (appsmith.store.carregamentoIdAtual === undefined) storeValue("carregamentoIdAtual", null);
		if (appsmith.store.placa_norm === undefined) storeValue("placa_norm", "");
		if (appsmith.store.motorista_id === undefined) storeValue("motorista_id", "");
		if (appsmith.store.transportadora_id === undefined) storeValue("transportadora_id", "");
		if (appsmith.store.produto_venda_id === undefined) storeValue("produto_venda_id", "");
		if (appsmith.store.eixos === undefined) storeValue("eixos", 0);

		if (appsmith.store.pesosTara === undefined) storeValue("pesosTara", []);
		if (appsmith.store.pesosFinal === undefined) storeValue("pesosFinal", []);
		if (appsmith.store.pesosFinalLastValid === undefined) storeValue("pesosFinalLastValid", []);
		if (appsmith.store.pesosTaraRaw === undefined) storeValue("pesosTaraRaw", []);
		if (appsmith.
  // ... (truncado)
}
```

#### `isEixoEmConjuntoExcedido`

- **Assinatura:** `isEixoEmConjuntoExcedido(i) {`

- **Efeito principal:** helper/utilitário

```js
isEixoEmConjuntoExcedido(i) {
		const flags = appsmith.store.excedeConjunto || [];
		const idxs = this.eixoConjuntos(i);
		return idxs.some(c => !!flags[c]);
	},
```

#### `isFaseFinal`

- **Assinatura:** `isFaseFinal() { return appsmith.store.fasePesagem === "FINAL"; },`

- **Efeito principal:** helper/utilitário

```js
isFaseFinal() { return appsmith.store.fasePesagem === "FINAL"; },
	isFinal() { return this.isFaseFinal(); },
	isModoUnico() { return Number(appsmith.store.eixos || 0) === 1; },

	// ======================================================================
	// 7) ===================[ Eixos & Conjuntos ]============================
	// ======================================================================
_getEixos() {
  const n = Number(appsmith.store.eixos);
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : 0; 
},
```

#### `isFinal`

- **Assinatura:** `isFinal() { return this.isFaseFinal(); },`

- **Efeito principal:** helper/utilitário

```js
isFinal() { return this.isFaseFinal(); },
	isModoUnico() { return Number(appsmith.store.eixos || 0) === 1; },

	// ======================================================================
	// 7) ===================[ Eixos & Conjuntos ]============================
	// ======================================================================
_getEixos() {
  const n = Number(appsmith.store.eixos);
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : 0; 
},
```

#### `isInvalidEixo`

- **Assinatura:** `isInvalidEixo(i) {`

- **Efeito principal:** helper/utilitário

```js
isInvalidEixo(i) {
		const idx = i - 1;
		const total = Number(appsmith.store.eixos || 0);
		if (!(i >= 1 && i <= total)) return false;
		const isFinal = this.isFinal();
		const rawArr = isFinal ? (appsmith.store.pesosFinalRaw || []) : (appsmith.store.pesosTaraRaw || []);
		const raw = String(rawArr[idx] ?? "").trim();
		if (!raw) return false;
		if (!this.RE_BR_DEC.test(raw)) {
			if (this.RE_BR_DEC_SOFT.test(raw)) return false;
			return true;
		}
		const kg = this._parseKgFromTonBR(raw);
		if (!Number.isFinite(kg) || kg < 0) return true;
		if (isFinal) {
			const permitir = !!this.getParametro("permitir_excesso");
			if (this._isPorConjunto()) {
				const limC = this._getLimitesPorConjunto();
				if (Array.isArray(limC) && !permitir) {
					const liqArr = this._getLiquidoPorConjuntoArray();
					const lim = Number(limC[idx] ?? limC[limC.length - 1]);
					const liq = Number(liqArr[idx]) || 0;
					if (Number.isFinite(lim) && liq > lim) return true;
				}
				return false;
			}
			const max = Number(this.getParametro("peso_maximo_eixo") || 0);
			if (max > 0 && !permitir && kg > max) return true;
		}
		return false;
	},
```

#### `isModoUnico`

- **Assinatura:** `isModoUnico() { return Number(appsmith.store.eixos || 0) === 1; },`

- **Efeito principal:** helper/utilitário

```js
isModoUnico() { return Number(appsmith.store.eixos || 0) === 1; },

	// ======================================================================
	// 7) ===================[ Eixos & Conjuntos ]============================
	// ======================================================================
_getEixos() {
  const n = Number(appsmith.store.eixos);
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : 0; 
},
```

#### `lerFinalPorEixo`

- **Assinatura:** `lerFinalPorEixo() {`

- **Efeito principal:** helper/utilitário

```js
lerFinalPorEixo() {
		const eixos = Number(appsmith.store.eixos || 0);
		if (eixos === 1) throw new Error("Modo único: peso final total no eixo 1.");
		if (!(eixos >= 2 && eixos <= 5)) throw new Error("Informe o número de eixos (2..5) para pesagem final por eixo.");
		const arr = (appsmith.store.pesosFinal || []).slice(0, eixos);
		if (arr.length !== eixos) throw new Error("Preencha todos os pesos da pesagem final.");
		return arr.map((v, i) => {
			const n = Number(v);
			if (!Number.isFinite(n) || n < 0) throw new Error(`Peso final inválido no eixo ${i + 1}.`);
			return n;
		});
	},
```

#### `lerTaraPorEixo`

- **Assinatura:** `lerTaraPorEixo() {`

- **Efeito principal:** helper/utilitário

```js
lerTaraPorEixo() {
		const eixos = Number(appsmith.store.eixos || 0);
		if (eixos === 1) throw new Error("Modo único: tara total no eixo 1.");
		if (!(eixos >= 2 && eixos <= 5)) throw new Error("Informe o número de eixos (2..5) para tara por eixo.");
		const arr = (appsmith.store.pesosTara || []).slice(0, eixos);
		if (arr.length !== eixos) throw new Error("Preencha todos os pesos de tara.");
		return arr.map((v, i) => {
			const n = Number(v);
			if (!Number.isFinite(n) || n < 0) throw new Error(`Tara inválida no eixo ${i + 1}.`);
			return n;
		});
	},
```

#### `limparContextoGeral`

- **Assinatura:** `async limparContextoGeral() {`

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
async limparContextoGeral() {
    await Promise.all([
        // === STORES QUE JÁ ESTAVAM SENDO LIMPOS ===
        // stores do carregamento
        storeValue("carregamentoIdAtual", null),
        storeValue("vendaSelecionada", null),
        storeValue("produto_venda_id_sel", null),
        storeValue("motorista_id", null),
        storeValue("transportadora_id", null),
        
        // eixos
        storeValue("eixos", null),
        storeValue("qtd_eixos", null),
        
        storeValue("placa_norm", ""),
        storeValue("tara_total", null),
        storeValue("pesosTara", []),
        storeValue("pesosFinal", []),
        storeValue("pesosFinalLastValid", null),
        storeValue("tara_eixos_raw", "[]"),
        storeValue("modoPesagem", false),
        storeValue("mostrarDetalhes", false),

        // === STORES ESQUECIDOS - ADICIONADOS ===
        
        // Produto
        storeValue("produto_id", ""),
        storeValue("produto_value", ""), 
        storeValue("produto_nome", ""),
        storeValue("produto_unidade", ""),
        
        // Pesagem
        storeValue("pesos_eixos", []),
        storeValue("peso_inicial", null),
        storeValue("produto_
  // ... (truncado)
}
```

#### `liquidoConjuntoTexto`

- **Assinatura:** `liquidoConjuntoTexto(i, unidade = "t") {`

- **Efeito principal:** helper/utilitário

```js
liquidoConjuntoTexto(i, unidade = "t") {
		if (!this.isFinal()) return "";
		const idx = Number(i) - 1;
		const liqC = this._getLiquidoPorConjuntoArray();
		const kg = Number(liqC?.[idx]);
		if (!Number.isFinite(kg) || kg <= 0) return "";
		if (unidade === "kg") return kg.toLocaleString("pt-BR") + " kg";
		return this._formatTonBRFromKg(kg) + " t";
	},
```

#### `liquidoTotalKg`

- **Assinatura:** `liquidoTotalKg() {`

- **Efeito principal:** helper/utilitário

```js
liquidoTotalKg() {
  if (!this.isFinal()) return null;
 
  const e = Number(appsmith.store.eixos || 0);
  if (!Number.isFinite(e) || e < 1) return null;
 
  // Modo único: final[0] - tara_total (CORRIGIDO)
  const isUnico = !!(this.isModoUnico && this.isModoUnico());
  if (isUnico || e === 1) {
    const f0 = Number((appsmith.store.pesosFinal || [])[0]);
    const t0 = Number(appsmith.store.tara_total) || 0; // LINHA CORRIGIDA
    const liq = f0 - t0;
    return (Number.isFinite(liq) && liq > 0) ? liq : null;
  }
 
  // Por eixo: soma exata dos 'e' valores (continua igual)
  const finais = (appsmith.store.pesosFinal || []).slice(0, e).map(v => Number(v));
  const taras  = (appsmith.store.pesosTara  || []).slice(0, e).map(v => Number(v));
 
  if (finais.length !== e || taras.length !== e) return null;
  if (!finais.every(Number.isFinite) || !taras.every(Number.isFinite)) return null;
 
  const total = this._sumKg(finais) - this._sumKg(taras);
  return (Number.isFinite(total) && total > 0) ? total : null;
},
```

#### `liquidoTotalTexto`

- **Assinatura:** `liquidoTotalTexto(unidade = "t") {`

- **Efeito principal:** helper/utilitário

```js
liquidoTotalTexto(unidade = "t") {
		const kg = this.liquidoTotalKg();
		if (!(Number.isFinite(kg) && kg > 0)) return "";
		if (unidade === "kg") return kg.toLocaleString("pt-BR") + " kg";
		return this._formatTonBRFromKg(kg) + " t";
	},
```

#### `onChangeEixos`

- **Assinatura:** `onChangeEixos(raw) {`

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
onChangeEixos(raw) {
		if (appsmith.store.isResetting) return;
		const n = Number(raw || 0);
		this.setQuantidadeEixos(Number.isFinite(n) ? n : 0);
		if (this.isFinal()) {
			storeValue('pesosFinal', Array(n).fill(null));
			storeValue('pesosFinalLastValid', Array(n).fill(null));
			storeValue('pesosFinalRaw', Array(n).fill(''));
		} else {
			storeValue('pesosTara', Array(n).fill(null));
			storeValue('pesosTaraRaw', Array(n).fill(''));
			storeValue('pesosFinal', Array(n).fill(null));
			storeValue('pesosFinalLastValid', Array(n).fill(null));
			storeValue('pesosFinalRaw', Array(n).fill(''));
		}
	},
```

#### `onInputEixoBlur`

- **Assinatura:** `onInputEixoBlur(i) {`

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
onInputEixoBlur(i) {
		const idx = Number(i) - 1;
		const isFinal = this.isFinal();
		const kgArr  = isFinal ? (appsmith.store.pesosFinal || []) : (appsmith.store.pesosTara || []);
		const kg = Number(kgArr[idx]);
		if (!Number.isFinite(kg)) return;
		const pretty = this._formatTonBRFromKg(kg);
		if (isFinal) {
			const raw = Array.isArray(appsmith.store.pesosFinalRaw) ? [...appsmith.store.pesosFinalRaw] : [];
			raw[idx] = pretty;
			storeValue("pesosFinalRaw", raw);
		} else {
			const raw = Array.isArray(appsmith.store.pesosTaraRaw) ? [...appsmith.store.pesosTaraRaw] : [];
			raw[idx] = pretty;
			storeValue("pesosTaraRaw", raw);
		}
	},
```

#### `onInputEixoChange`

- **Assinatura:** `onInputEixoChange(i, text) {`

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
onInputEixoChange(i, text) {
  const numI = Number(i);
  if (!Number.isFinite(numI) || numI < 1) return;

  const isFinal = this.isFinal();

  // ✅ Você não usa mais pares/conjuntos: sempre limite por eixos
  const eixos = Number(appsmith.store.eixos || 0);
  const upperBound = eixos;

  const idx = numI - 1; // eixo N → índice N-1 (zero-based)
  if (!(idx >= 0 && numI <= upperBound)) return;

  const require3 = false;
  const s = String(text ?? "");
  const okStrict = this.RE_BR_DEC.test(s);

  if (isFinal) {
    // ---------- FINAL ----------
    // Sempre dimensiona pelos eixos (não por conjuntos)
    const raw = Array.isArray(appsmith.store.pesosFinalRaw) ? [...appsmith.store.pesosFinalRaw] : [];
    while (raw.length < eixos) raw.push("");
    raw[idx] = s;
    storeValue("pesosFinalRaw", raw);

    if (okStrict) {
      const kgArr = Array.isArray(appsmith.store.pesosFinal) ? [...appsmith.store.pesosFinal] : [];
      while (kgArr.length < eixos) kgArr.push(null);

      const kg = this._parseKgFromTonBR(s, require3);
      if (Number.isFinite(kg) && kg >= 0) {
        kgArr[idx] = kg;
        storeValue("pesosFinal", kgArr);
      }
    }

    this.validarPesagemFinal({ sil
  // ... (truncado)
}
```

#### `onListItemClick`

- **Assinatura:** `async onListItemClick(itemRaw) {`

- **Efeito principal:** manipula appsmith.store (storeValue); exibe alertas (showAlert)

```js
async onListItemClick(itemRaw) {
		if (!itemRaw) return;
		await storeValue("isResetting", true);
		const item = this._safeItem(itemRaw);
		storeValue("itemAtual", item);
		if (item.linha_tipo === "carregamento") {
			await this.prepararPesagemFinalFromData(item);
			this.setFase("FINAL");
		} else {
			storeValue("carregamentoIdAtual", null);
			const vendaIdTxt = this._pickVendaIdTxt(item);
			const vNorm = vendaIdTxt ? this._normalizeVendaSelecionada({ venda_id: vendaIdTxt }) : null;
			await storeValue("vendaSelecionada", vNorm);
			this.setFase("TARA");
			const n = Number(appsmith.store.eixos || 0);
			this.setQuantidadeEixos(n);
			storeValue("pesosFinal", Array(n).fill(null));
			storeValue("pesosTaraRaw", Array(n).fill(""));
			storeValue("pesosFinalRaw", Array(n).fill(""));
			storeValue("modoPesagem", true);
			storeValue("mostrarDetalhes", true);
		}
		await this.carregarProdutosDaVenda();
		await storeValue("isResetting", false);
		showAlert("Seleção aplicada.", "success");
	},
```

#### `prepararPesagemFinalFromData`

- **Assinatura:** `async prepararPesagemFinalFromData(det) {`

- **Efeito principal:** manipula appsmith.store (storeValue); exibe alertas (showAlert)

```js
async prepararPesagemFinalFromData(det) {
		if (!det) { showAlert("Carregamento não encontrado.", "error"); return; }
		const vendaIdTxt = det.venda_id ? String(det.venda_id) : this._pickVendaIdTxt(det);
		if (vendaIdTxt) {
			const vNorm = this._normalizeVendaSelecionada({ venda_id: vendaIdTxt });
			if (vNorm) await storeValue("vendaSelecionada", vNorm);
		}
		storeValue("carregamentoIdAtual", det.carregamento_id || det.id);
		storeValue("placa_norm", (det.placa || det.placa_display || "").toUpperCase().replace(/-/g, ""));
		storeValue("motorista_id", det.motorista_id || "");
		storeValue("transportadora_id", det.transportadora_id || "");
		storeValue("produto_venda_id", det.produto_venda_id ? String(det.produto_venda_id) : "");
		if (det.produto_venda_id) this.setProdutoSelecionadoId(det.produto_venda_id);
		const eixos = Number(det.eixos || (Array.isArray(det.tara_eixos) ? det.tara_eixos.length : 0) || 0);
		this.setQuantidadeEixos(eixos);
		storeValue("pesosTara", Array.isArray(det.tara_eixos) ? det.tara_eixos : Array(eixos).fill(null));
		storeValue("pesosFinal", Array(eixos).fill(null));
		storeValue("pesosFinalLastValid", Array(eixos).fill(null));
		storeValue("pesosTaraRa
  // ... (truncado)
}
```

#### `prepararSegundaPesagemViaHistorico`

- **Assinatura:** `async prepararSegundaPesagemViaHistorico() {`

- **Efeito principal:** manipula appsmith.store (storeValue); exibe alertas (showAlert)

```js
async prepararSegundaPesagemViaHistorico() {
	try {
		const vSel = appsmith.store.vendaSelecionada || {};
		const vendaId = this._firstDefined(vSel.id_gc, vSel.venda_id, vSel.id, vSel.codigo);
		const vendaNorm = vendaId ? { ...vSel, id_gc: String(vendaId), venda_id: String(vendaId) } : vSel;
		await storeValue("vendaSelecionada", vendaNorm);
		if (appsmith.store.produto_venda_id) this.setProdutoSelecionadoId(appsmith.store.produto_venda_id);
		const tara_eixos = this._maybeParseJSON(this._firstDefined(appsmith.store.tara_eixos, appsmith.store.pesos_eixos));
		const qtd_eixos  = Number(this._firstDefined(appsmith.store.eixos, appsmith.store.qtd_eixos, Array.isArray(tara_eixos) ? tara_eixos.length : 0) || 0);
		
		await storeValue("qtd_eixos", qtd_eixos);
		
		if (!qtd_eixos || qtd_eixos < 1) showAlert("Eixos não informados ao retornar da edição. Defina o nº de eixos.", "warning");
		this.setQuantidadeEixos(qtd_eixos);
		if (Array.isArray(tara_eixos) && tara_eixos.length) await storeValue("pesosTara", tara_eixos.slice(0, qtd_eixos));
		await storeValue("pesosFinal", Array(qtd_eixos).fill(null));
		await storeValue("pesosFinalLastValid", Array(qtd_eixos).fill(null));
		await storeVa
  // ... (truncado)
}
```

#### `produtoSelecionadoId`

- **Assinatura:** `produtoSelecionadoId() { return appsmith.store.produtoSelecionadoId ?? ""; },`

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
produtoSelecionadoId() { return appsmith.store.produtoSelecionadoId ?? ""; },
	setProdutoSelecionadoId(id) {
		const v = (id == null) ? "" : String(id);
		storeValue("produtoSelecionadoId", v);
		storeValue("produto_venda_id", v);
	},
```

#### `prontoParaConfirmar`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
prontoParaConfirmar() {
  try { 
    this._getVenda(); 
  } catch (_) { 
    return false; 
  }
  
  const eixos = Number(appsmith.store.eixos || 0);
  if (!eixos) return false;
  
  // Se não está na fase final, considera pronto
  if (!(this.isFinal && this.isFinal())) return true;
  
  // CORRIGIDO: chama função que existe
  return this.validarPesagemFinal({ silencioso: true });
},
```

#### `rawInputEixo`

- **Assinatura:** `rawInputEixo(i) {`

- **Efeito principal:** helper/utilitário

```js
rawInputEixo(i) {
		const idx = i - 1;
		const isFinal = this.isFinal();
		const rawArr = isFinal ? (appsmith.store.pesosFinalRaw || []) : (appsmith.store.pesosTaraRaw || []);
		const raw = rawArr[idx];
		return (typeof raw === "string") ? raw : "";
	},
```

#### `selecionarResultado`

- **Assinatura:** `async selecionarResultado(it) {`

- **Efeito principal:** executa queries/actions (.run); exibe alertas (showAlert)

```js
async selecionarResultado(it) {
  try {
    if (!it) return;

    const fmtTon = (v) => {
      const n = Number(v);
      if (!Number.isFinite(n)) return "";
      return n.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    };

    const idCarreg = Number(it?.carregamento_id ?? it?.id);
    const isFlagCarreg =
      it?.is_carregamento === true ||
      String(it?.linha_tipo || "").toLowerCase() === "carregamento";
    const hasCarreg = Number.isFinite(idCarreg) && idCarreg > 0;

    let c = null;
    if (hasCarreg) {
      try {
        const rProbe = await getCarregamentoDetalhe.run({ carregamento_id: idCarreg });
        c = rProbe?.[0] || null;
      } catch {}
    }

    const isCarregamento = !!c || isFlagCarreg || hasCarreg;

    // ===================== CARREGAMENTO ======================
    if (isCarregamento) {
      if (!c) {
        const r = await getCarregamentoDetalhe.run({ carregamento_id: idCarreg });
        c = r?.[0];
      }
      if (!c) { showAlert("Carregamento não encontrado.", "error"); return; }

      const placa = (c.placa || it?.placa || "").toString().toUpperCase() || null;
      const eixos = Number(c.eixos ?? it?
  // ... (truncado)
}
```

#### `setFase`

- **Assinatura:** `setFase(fase) {`

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
setFase(fase) {
		storeValue("fasePesagem", fase);
		if (fase === "FINAL") {
			const e = Number(appsmith.store.eixos) || 1;
			storeValue("excedeEixo", Array.from({ length: e }, () => false));
			storeValue("excedeConjunto", []);
			storeValue("errosFinal", []);
			storeValue("isFinalValido", true);
		}
	},
```

#### `setPesoEixo`

- **Assinatura:** `setPesoEixo(idx, kg) {`

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
setPesoEixo(idx, kg) {
		const eixos = Number(appsmith.store.eixos || 0);
		if (!(idx >= 1 && idx <= eixos && idx <= 9)) return;
		const arr = Array.isArray(appsmith.store.pesosTara) ? [...appsmith.store.pesosTara] : [];
		const n = Number(kg);
		arr[idx - 1] = (!Number.isFinite(n) || n < 0) ? null : n;
		while (arr.length < eixos) arr.push(null);
		if (arr.length > eixos) arr.length = eixos;
		storeValue("pesosTara", arr);
	},
```

#### `setProdutoSelecionadoId`

- **Assinatura:** `setProdutoSelecionadoId(id) {`

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
setProdutoSelecionadoId(id) {
		const v = (id == null) ? "" : String(id);
		storeValue("produtoSelecionadoId", v);
		storeValue("produto_venda_id", v);
	},
```

#### `setQuantidadeEixos`

- **Assinatura:** `setQuantidadeEixos(n) {`

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
setQuantidadeEixos(n) {
		const eixos = Number(n || 0);
		storeValue("eixos", eixos);
		const pad = (arr) => {
			const a = Array.isArray(arr) ? [...arr] : [];
			while (a.length < eixos) a.push(null);
			if (a.length > eixos) a.length = eixos;
			return a;
		};
		storeValue("pesosTara", pad(appsmith.store.pesosTara));
		storeValue("pesosFinal", pad(appsmith.store.pesosFinal));
		storeValue("pesosFinalLastValid", pad(appsmith.store.pesosFinalLastValid));
		storeValue("pesosTaraRaw", pad(appsmith.store.pesosTaraRaw));
		storeValue("pesosFinalRaw", pad(appsmith.store.pesosFinalRaw));
	},
```

#### `showInputEixo`

- **Assinatura:** `showInputEixo(n) {`

- **Efeito principal:** helper/utilitário

```js
showInputEixo(n) {
  const num = Number(n);
  if (!Number.isFinite(num) || num < 1) return false;

  const eixos = this._getEixos(); // sua versão do bloco 7
  if (num > eixos) return false;

  // Se "por conjunto" estiver ativo, mostra o eixo se ele pertencer a algum conjunto.
  try {
    if (this._isPorConjunto && this._isPorConjunto()) {
      const cjs = this._getConjuntos ? this._getConjuntos() : [];
      if (Array.isArray(cjs) && cjs.length) {
        const inAlgum = cjs.some(grp => Array.isArray(grp) && grp.includes(num));
        // fallback seguro: se não estiver mapeado em nenhum conjunto, ainda assim mostra enquanto num <= eixos
        return inAlgum ? true : (num <= eixos);
      }
    }
  } catch (_) {}

  // Padrão: visível até o nº de eixos
  return true;
},
```

#### `syncFinalValido`

- **Assinatura:** `syncFinalValido() {`

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
syncFinalValido() {
  const ok = this.validarPesagemFinal({ silencioso: true });
  return storeValue('isFinalValido', ok);
},
```

#### `taraArray`

- **Assinatura:** `taraArray() { return JSON.stringify(this.lerTaraPorEixo()); },`

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
taraArray() { return JSON.stringify(this.lerTaraPorEixo()); },
	taraTotal() { return this.lerTaraPorEixo().reduce((s, n) => s + n, 0); },
	async _limparInputsPesagemTara() {
		try {
			await resetWidget("ContainerPesagemTara", true);
			await storeValue("tara_total", null);
			await storeValue("pesosTara", []);
		} catch (_) {
			const eixos = Number(appsmith.store.eixos) || 5;
			const maxTentativas = Math.min(Math.max(eixos, 5), 10);
			const tentativas = [];
			for (let i = 1; i <= maxTentativas; i++) {
				tentativas.push(
					`input_peso_eixo_${i}`,
					`input_peso_eixo${i}`,
					`input_peso_eixo${String(i).padStart(2, "0")}`
				);
			}
			tentativas.push("input_tara_total", "input_peso_total_tara");
			for (const w of tentativas) { try { await resetWidget(w, false); } catch {} }
			await storeValue("tara_total", null);
			await storeValue("pesosTara", []);
		}
		await storeValue("tara_eixos_raw", "[]");
	},
```

#### `taraArrayForSQL`

- **Assinatura:** `taraArrayForSQL() {`

- **Efeito principal:** helper/utilitário

```js
taraArrayForSQL() {
		if (this.isModoUnico()) return "[]";
		const eixos = Number(appsmith.store.eixos || 0);
		const arr = (appsmith.store.pesosTara || []).slice(0, eixos);
		if (arr.length !== eixos || arr.some(v => !Number.isFinite(Number(v)) || Number(v) < 0)) {
			throw new Error("Preencha todos os pesos de tara por eixo.");
		}
		return JSON.stringify(arr.map(n => Number(n)));
	},
```

#### `taraTotal`

- **Assinatura:** `taraTotal() { return this.lerTaraPorEixo().reduce((s, n) => s + n, 0); },`

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
taraTotal() { return this.lerTaraPorEixo().reduce((s, n) => s + n, 0); },
	async _limparInputsPesagemTara() {
		try {
			await resetWidget("ContainerPesagemTara", true);
			await storeValue("tara_total", null);
			await storeValue("pesosTara", []);
		} catch (_) {
			const eixos = Number(appsmith.store.eixos) || 5;
			const maxTentativas = Math.min(Math.max(eixos, 5), 10);
			const tentativas = [];
			for (let i = 1; i <= maxTentativas; i++) {
				tentativas.push(
					`input_peso_eixo_${i}`,
					`input_peso_eixo${i}`,
					`input_peso_eixo${String(i).padStart(2, "0")}`
				);
			}
			tentativas.push("input_tara_total", "input_peso_total_tara");
			for (const w of tentativas) { try { await resetWidget(w, false); } catch {} }
			await storeValue("tara_total", null);
			await storeValue("pesosTara", []);
		}
		await storeValue("tara_eixos_raw", "[]");
	},
```

#### `taraTotalForSQL`

- **Assinatura:** `taraTotalForSQL() {`

- **Efeito principal:** helper/utilitário

```js
taraTotalForSQL() {
		if (this.isModoUnico()) {
			const kg = Number((appsmith.store.pesosTara || [])[0] || 0);
			if (!Number.isFinite(kg) || kg <= 0) throw new Error("Informe a TARA total (no eixo 1).");
			return kg;
		}
		const arr = this.lerTaraPorEixo();
		return arr.reduce((s, n) => s + n, 0);
	},
```

#### `tooltipInputEixo`

- **Assinatura:** `tooltipInputEixo(n) {`

- **Efeito principal:** helper/utilitário

```js
tooltipInputEixo(n) {
  const idx = Number(n) - 1;
  if (!Number.isFinite(idx) || idx < 0) return "";
  const st = appsmith.store || {};
  
  // ---- TARA (kg) -> exibe em t com 3 casas
  let taraKg = null;
  
  // CORREÇÃO: Para 1 eixo, usar tara_total
  const qtdEixos = Number(st.qtd_eixos) || Number(st.eixos) || 0;
  
  if (qtdEixos === 1 && idx === 0) {
    // Para 1 eixo, usar tara_total
    taraKg = Number(st.tara_total) || null;
  } else {
    // Para múltiplos eixos, usar array
    try {
      if (Array.isArray(st.pesosTara)) {
        taraKg = Number(st.pesosTara[idx]);
      } else if (typeof st.tara_eixos_raw === "string") {
        const raw = st.tara_eixos_raw.trim();
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) taraKg = Number(arr[idx]);
        }
      }
    } catch {}
  }
  
  const taraTxt = (Number.isFinite(taraKg) && taraKg > 0)
    ? `Tara: ${(taraKg / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} t`
    : "";
  
  // ---- LIMITE por eixo (kg) -> exibe em t
  let limKg = null;
  try {
    const limArr = this._getLimitesPorEixo ? this._getLimitesPorEixo() : null;
    if (Array
  // ... (truncado)
}
```

#### `totalTexto`

- **Assinatura:** `totalTexto() {`

- **Efeito principal:** helper/utilitário

```js
totalTexto() {
  // usa a constante do objeto (preferencial) e tem fallback local se necessário
  const RE_STRICT = this?.RE_BR_DEC ?? /^\s*(\d{1,3}(\.\d{3})*|\d+)(,\d{1,3})?\s*$/;

  const eixos   = Number(appsmith.store.eixos || 0);
  const isFinal = this.isFinal();

  const rawArr = isFinal ? (appsmith.store.pesosFinalRaw || []) : (appsmith.store.pesosTaraRaw || []);
  const kgArr  = isFinal ? (appsmith.store.pesosFinal    || []) : (appsmith.store.pesosTara    || []);

  let somaKg = 0;

  for (let i = 0; i < eixos; i++) {
    const raw = String(rawArr[i] ?? "").trim();
    let kg    = Number(kgArr[i]);

    if (RE_STRICT.test(raw)) {
      const parsed = this._parseKgFromTonBR(raw);
      if (Number.isFinite(parsed)) kg = parsed;
    }

    if (!Number.isFinite(kg)) {
      const w = (typeof globalThis !== "undefined") ? globalThis[`input_peso_eixo${i+1}`] : null;
      const wtext = (w && typeof w.text === "string") ? w.text.trim() : "";
      if (RE_STRICT.test(wtext)) {
        const parsed = this._parseKgFromTonBR(wtext);
        if (Number.isFinite(parsed)) kg = parsed;
      }
    }

    if (Number.isFinite(kg)) somaKg += kg;
  }

  const ton = somaKg / 1000;
  return ton
  // ... (truncado)
}
```

#### `validarCamposObrigatorios`

- **Assinatura:** `validarCamposObrigatorios() {`

- **Efeito principal:** helper/utilitário

```js
validarCamposObrigatorios() {
		if (!appsmith.store?.vendaSelecionada?.id_gc) throw new Error("Selecione a venda/contrato.");
		if (!appsmith.store.placa_norm) throw new Error("Selecione uma placa.");
		if (!appsmith.store.motorista_id) throw new Error("Selecione o motorista.");
		if (!appsmith.store.eixos) throw new Error("Informe o número de eixos.");
		if (!appsmith.store.produto_venda_id) throw new Error("Selecione o produto da venda.");
		if (this.isModoUnico()) {
			const kg = Number((appsmith.store.pesosTara || [])[0] || 0);
			if (!Number.isFinite(kg) || kg <= 0) throw new Error("Informe a TARA total (no eixo 1).");
		} else {
			this.lerTaraPorEixo();
		}
	},
```

#### `validarLimitePorEixoTodos`

- **Assinatura:** ``

- **Efeito principal:** exibe alertas (showAlert)

```js
validarLimitePorEixoTodos() {
		if (this.isModoUnico()) return true;
		const max = Number(this.getParametro("peso_maximo_eixo") || 0);
		const permitir = !!this.getParametro("permitir_excesso");
		if (!max) return true;
		const finais = Array.isArray(appsmith.store.pesosFinal) ? appsmith.store.pesosFinal : [];
		const excessos = [];
		finais.forEach((peso, i) => {
			const n = Number(peso);
			if (Number.isFinite(n) && n > max) excessos.push({ eixo: i + 1, excedeu: n - max });
		});
		if (excessos.length) {
			const msg = excessos.map(x => `E${x.eixo}: +${x.excedeu.toFixed(0)} kg`).join(" | ");
			showAlert(permitir ? ("Excesso permitido: " + msg) : ("Excesso bloqueado: " + msg), permitir ? "info" : "warning");
			return permitir;
		}
		return true;
	},
```

#### `validarPesagemFinal`

- **Assinatura:** `validarPesagemFinal({ silencioso = true } = {}) {`

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
validarPesagemFinal({ silencioso = true } = {}) {
		const conjuntos = this._getConjuntos();
		const limC      = this._getLimitesPorConjunto();
		const permitir  = !!this.getParametro("permitir_excesso");
		const finalC   = this._getFinalPorConjuntoArray();
		const taraC    = this._getTaraPorConjuntoArray();
		const liquidoC = this._getLiquidoPorConjuntoArray();
		const excedeConjunto = Array.from({ length: conjuntos.length }, () => false);
		const erros = [];
		if (Array.isArray(limC)) {
			for (let c = 0; c < conjuntos.length; c++) {
				const lim = Number(limC[c] ?? limC[limC.length - 1]);
				const liq = Number(liquidoC[c]) || 0;
				const fin = Number(finalC[c])   || 0;
				const tar = Number(taraC[c])    || 0;
				if (Number.isFinite(lim) && liq > lim) {
					excedeConjunto[c] = true;
					erros.push(`Conjunto ${c+1}: líquido ${liq}kg > limite ${lim}kg (final ${fin} − tara ${tar})`);
				}
			}
		}
		const excedeEixo = this._isPorConjunto()
			? [...excedeConjunto]
			: Array.from({ length: Number(appsmith.store.eixos || 0) }, () => false);
		const isOk = permitir ? true : (erros.length === 0);
		storeValue("excedeEixo", excedeEixo);
		storeValue("excedeConjunto", excedeConju
  // ... (truncado)
}
```

#### `valorInputEixo`

- **Assinatura:** `valorInputEixo(i) {`

- **Efeito principal:** helper/utilitário

```js
valorInputEixo(i) {
		const idx = i - 1;
		const isFinal = this.isFinal();
		const rawArr  = isFinal ? (appsmith.store.pesosFinalRaw || []) : (appsmith.store.pesosTaraRaw || []);
		const kgArr   = isFinal ? (appsmith.store.pesosFinal || [])    : (appsmith.store.pesosTara || []);
		const raw = rawArr[idx];
		if (typeof raw === "string" && raw.trim().length) return raw;
		const kg  = Number(kgArr?.[idx] ?? 0);
		return this._formatTonBRFromKg(kg);
	},
```


### Observações específicas (Carregamento)

- Controla o fluxo principal de carregamento: seleção de venda/contrato, pesagem TARA, pesagem FINAL, validações por eixo/conjunto, cálculo líquido e confirmação (incluindo webhook).

- Possui helpers para conversão pt-BR (`t` formatado com 3 casas) ↔ `kg`, validações de inputs e sincronização de stores para UI.


---

## Urls

**Página:** Início  
**Tipo:** ActionCollection (JSObject)

### Dependências

- **Queries/Actions chamadas:** qWebhooks

- **Widgets/Modais manipulados:** (nenhum detectado)

- **Chaves de store tocadas/referenciadas (parcial):** webhooks

### API (funções)

#### `get`

- **Assinatura:** ``

- **Efeito principal:** (não extraído automaticamente)

> Trecho não extraído automaticamente. Busque por `get` no body do JSObject.

#### `init`

- **Assinatura:** `init() {`

- **Efeito principal:** manipula appsmith.store (storeValue); executa queries/actions (.run)

```js
init() {
    return qWebhooks.run().then(() => {
      const row = qWebhooks.data?.[0] || {};
      storeValue('webhooks', row);
    });
  },
```


---

## TicketUI

**Página:** Início  
**Tipo:** ActionCollection (JSObject)

### Dependências

- **Queries/Actions chamadas:** (nenhuma detectada)

- **Widgets/Modais manipulados:** (nenhum detectado)

- **Chaves de store tocadas/referenciadas (parcial):** observacoes, qtd_desejada

### API (funções)

#### `clearCamposTara`

- **Assinatura:** ``

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
clearCamposTara() {
    storeValue("qtd_desejada", "");
    storeValue("observacoes", "");
  },
```

#### `getUnidadeSelecionada`

- **Assinatura:** `getUnidadeSelecionada() {`

- **Efeito principal:** helper/utilitário

```js
getUnidadeSelecionada() {
    try {
      const selId = String(ImpressaoController.produtoVendaSelecionadoId?.() ?? "");
      const produtos = ImpressaoController.vendaProdutos?.() ?? [];
      if (Array.isArray(produtos)) {
        const item = produtos.find(p =>
          String(p?.produto_venda_id ?? p?.produto_value ?? "") === selId
        ) || produtos[0];
        return item?.unidade || "";
      }
      return "";
    } catch(e) { return ""; }
  },
```

#### `isQtdDesejadaValida`

- **Assinatura:** `isQtdDesejadaValida() {`

- **Efeito principal:** helper/utilitário

```js
isQtdDesejadaValida() {
    if (ImpressaoController.faseAtual() !== "TARA") return true;
    const raw = appsmith.store.qtd_desejada;
    if (!raw) return true; // opcional
    const n = this.parseNumFlex(raw);
    return n !== null && n >= 0;
  },
```

#### `msgErroQtd`

- **Assinatura:** `msgErroQtd() {`

- **Efeito principal:** helper/utilitário

```js
msgErroQtd() {
    if (!this.isQtdDesejadaValida()) return "Quantidade inválida. Use formato 2.280,560";
    return "";
  },
```

#### `parseNumFlex`

- **Assinatura:** `parseNumFlex(val) {`

- **Efeito principal:** helper/utilitário

```js
parseNumFlex(val) {
    if (val === undefined || val === null || val === "") return null;
    if (typeof val === "number") return val;
    let s = String(val).trim();
    s = s.replace(/[^\d.,-]/g, ""); // mantém só dígitos . , -
    const hasComma = s.includes(",");
    const hasDot = s.includes(".");
    if (hasComma && hasDot) {
      s = s.replace(/\./g, "").replace(",", "."); // padrão BR
    } else if (hasComma) {
      s = s.replace(",", ".");
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  },
```

#### `setObservacoes`

- **Assinatura:** ``

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
setObservacoes(text) {
    storeValue("observacoes", text ?? "");
  },
```

#### `setQtdDesejada`

- **Assinatura:** ``

- **Efeito principal:** manipula appsmith.store (storeValue)

```js
setQtdDesejada(text) {
    storeValue("qtd_desejada", text ?? "");
  },
```


---

## PlacasSelectController

**Página:** Início  
**Tipo:** ActionCollection (JSObject)

### Dependências

- **Queries/Actions chamadas:** buscarPlacasPorPrefixo, httpSyncGC, listarPlacasRecentes, listarPlacasTodos

- **Widgets/Modais manipulados:** modalBuscaMotorista

- **Chaves de store tocadas/referenciadas (parcial):** modalAberto

### API (funções)

#### `carregarPlacasIniciais`

- **Assinatura:** ``

- **Efeito principal:** executa queries/actions (.run)

```js
async carregarPlacasIniciais() {
    try {
      if (typeof listarPlacasRecentes !== 'undefined') {
        await listarPlacasRecentes.run();
      } else {
        await listarPlacasTodos.run();
      }
    } catch (error) {
      console.error('Erro ao carregar placas iniciais:', error);
    }
  },
```

#### `fecharModal`

- **Assinatura:** `fecharModal() {`

- **Efeito principal:** manipula appsmith.store (storeValue); controla modais

```js
fecharModal() {
    console.log('Fechamento manual do modal');
    this.modalFechado = true;
    this.pararSyncTimeout();
    this.isSyncing = false;
    storeValue('modalAberto', false);
    closeModal('modalBuscaMotorista');
  },
```

#### `fecharModalComErro`

- **Assinatura:** ``

- **Efeito principal:** manipula appsmith.store (storeValue); exibe alertas (showAlert); controla modais

```js
fecharModalComErro(mensagem) {
    if (this.modalFechado) return;
    console.log('Fechando modal - erro:', mensagem);
    
    this.modalFechado = true;
    this.pararSyncTimeout();
    this.isSyncing = false;
    
    try {
      storeValue('modalAberto', false);
      closeModal('modalBuscaMotorista');
      showAlert(mensagem, "error");
    } catch (error) {
      console.error('Erro ao fechar modal:', error);
    }
  },
```

#### `fecharModalComSucesso`

- **Assinatura:** ``

- **Efeito principal:** manipula appsmith.store (storeValue); exibe alertas (showAlert); controla modais

```js
fecharModalComSucesso() {
    if (this.modalFechado) return;
    console.log('Fechando modal - sincronização concluída');
    
    this.modalFechado = true;
    this.pararSyncTimeout();
    this.isSyncing = false;
    
    try {
      storeValue('modalAberto', false);
      closeModal('modalBuscaMotorista');
      showAlert("Sincronização finalizada! Tente buscar a placa novamente.", "success");
    } catch (error) {
      console.error('Erro ao fechar modal:', error);
    }
  },
```

#### `iniciarSincronizacaoAutomatica`

- **Assinatura:** ``

- **Efeito principal:** manipula appsmith.store (storeValue); executa queries/actions (.run); exibe alertas (showAlert); controla modais

```js
async iniciarSincronizacaoAutomatica(placaDigitada) {
    if (this.isSyncing) {
      console.log('Sincronização já em andamento, ignorando...');
      return;
    }
    
    try {
      this.isSyncing = true;
      this.modalFechado = false;
      
      // Salva a placa que estamos buscando
      this.lastFilterText = placaDigitada;
      
      // Abre o modal
      storeValue('modalAberto', true);
      showModal('modalBuscaMotorista');
      showAlert("Placa não encontrada. Sincronizando com Gestão Click...", "info");
      
      console.log(`Iniciando sincronização via webhook para placa: ${placaDigitada}`);
      
      // Inicia a sincronização
      const startTime = Date.now();
      await httpSyncGC.run({ 
        placa_digitada: placaDigitada 
      });
      const endTime = Date.now();
      const webhookDuration = endTime - startTime;
      
      console.log(`Webhook executado com sucesso em ${webhookDuration}ms`);
      
      // Aguarda um tempo adicional para garantir que o processamento termine
      const extraWaitTime = Math.max(2000, Math.min(webhookDuration * 0.5, 5000)); // Entre 2-5 segundos
      
      showAlert(`Sincronização concluída! Aguardando 
  // ... (truncado)
}
```

#### `iniciarWatcher`

- **Assinatura:** ``

- **Efeito principal:** executa queries/actions (.run)

```js
iniciarWatcher() {
    this.pararWatcher();
    this.watcherInterval = setInterval(async () => {
      const filterText = selecaoPlaca.filterText || '';
      if (filterText !== this.lastFilterText && filterText.length >= 3) {
        this.lastFilterText = filterText;
        try {
          await buscarPlacasPorPrefixo.run({ placa_search: filterText });
          if (buscarPlacasPorPrefixo.data.length === 0 && !this.isSyncing) {
            // Placa não encontrada - abre modal e inicia sincronização automaticamente
            await this.iniciarSincronizacaoAutomatica(filterText);
          }
        } catch (error) {
          console.error('Erro ao buscar placas:', error);
        }
      }
    },
```

#### `onDropdownClose`

- **Assinatura:** ``

- **Efeito principal:** (não extraído automaticamente)

> Trecho não extraído automaticamente. Busque por `onDropdownClose` no body do JSObject.

#### `onDropdownOpen`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
async onDropdownOpen() {
    console.log('Dropdown aberto');
    this.modalFechado = false;
    await this.carregarPlacasIniciais();
    this.iniciarWatcher();
  },
```

#### `pararSyncTimeout`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
pararSyncTimeout() {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
      console.log('Timeout de sincronização parado');
    }
  },
```

#### `pararWatcher`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
pararWatcher() {
    if (this.watcherInterval) {
      clearInterval(this.watcherInterval);
      this.watcherInterval = null;
      console.log('Watcher principal parado');
    }
    this.lastFilterText = '';
  },
```

#### `resetar`

- **Assinatura:** `resetar() {`

- **Efeito principal:** helper/utilitário

```js
resetar() {
    console.log('Resetando estado completo');
    this.pararWatcher();
    this.pararSyncTimeout();
    this.isSyncing = false;
    this.modalFechado = false;
    this.lastFilterText = '';
  },
```

#### `startWatching`

- **Assinatura:** `startWatching() { this.iniciarWatcher(); },`

- **Efeito principal:** helper/utilitário

```js
startWatching() { this.iniciarWatcher(); },
  stopWatching() { this.pararWatcher(); },
  
  async onDropdownOpen() {
    console.log('Dropdown aberto');
    this.modalFechado = false;
    await this.carregarPlacasIniciais();
    this.iniciarWatcher();
  },
```

#### `stopWatching`

- **Assinatura:** `stopWatching() { this.pararWatcher(); },`

- **Efeito principal:** helper/utilitário

```js
stopWatching() { this.pararWatcher(); },
  
  async onDropdownOpen() {
    console.log('Dropdown aberto');
    this.modalFechado = false;
    await this.carregarPlacasIniciais();
    this.iniciarWatcher();
  },
```


---

## SplitController

**Página:** Início  
**Tipo:** ActionCollection (JSObject)

### Dependências

- **Queries/Actions chamadas:** confirmarCarregamento, confirmarWebhook, confirmarWebhookSplit, splitCarregamento

- **Widgets/Modais manipulados:** modalSplitCarregamento

- **Chaves de store tocadas/referenciadas (parcial):** carregamentoIdAtual, detalhes_produto, eixos, motorista_id, observacoes, pesosFinal, pesosInicial, pesosTara, placa_norm, produto_venda_id_sel, produtosDaVenda, qtd_desejada, taraVeiculo, tara_total, transportadora_id, vendaSelecionada

### API (funções)

#### `calcularLiquidoKg`

- **Assinatura:** ``

- **Efeito principal:** helper/utilitário

```js
calcularLiquidoKg() {
    const pesosFinal = appsmith.store.pesosFinal || [];
    const pesosInicial = appsmith.store.pesosInicial || [];
    const taraVeiculo = Number(appsmith.store.taraVeiculo) || 0;
    const pesoBrutoFinal = pesosFinal.reduce((t, n) => t + (Number(n) || 0), 0);
    const pesoBrutoInicial = pesosInicial.reduce((t, n) => t + (Number(n) || 0), 0);
    return pesoBrutoFinal - pesoBrutoInicial - taraVeiculo;
  },
```

#### `confirmarComSplit`

- **Assinatura:** ``

- **Efeito principal:** exibe alertas (showAlert); controla modais

```js
async confirmarComSplit() {
    try {
      closeModal('modalSplitCarregamento');
      showAlert("Processando split...", "info");

      const carregamentoId = Number(appsmith.store.carregamentoIdAtual) || 0;
      
      const pesoInicialKg = Number(appsmith.store.tara_total || 0);
      const pesosFinalArray = appsmith.store.pesosFinal || [];
      const pesoFinalKg = pesosFinalArray.reduce((t, n) => t + (Number(n) || 0), 0);
      const liquidoTotalKg = pesoFinalKg - pesoInicialKg;
      
      const LIMITE_BASE = 48000;
      const variacao = Math.floor(Math.random() * 4001) - 2000;
      const primeiroCarro = Math.min(LIMITE_BASE + variacao, liquidoTotalKg - 1000);
      const divisao = {
        primeiro: Math.max(primeiroCarro, 30000),
        segundo: liquidoTotalKg - Math.max(primeiroCarro, 30000)
      };

      const pvId = appsmith.store.vendaSelecionada?.produto_venda_id || appsmith.store.produto_venda_id_sel;
      const produtoSelecionado = (appsmith.store.produtosDaVenda || [])
        .find(p => String(p.produto_venda_id) === String(pvId));

      const splitParams = {
        carregamento_original_id: carregamentoId,
        produto_venda_id: pvId || "404",
  
  // ... (truncado)
}
```

#### `confirmarPrincipal`

- **Assinatura:** `async confirmarPrincipal() {`

- **Efeito principal:** controla modais

```js
async confirmarPrincipal() {
    const liquidoKg = this.calcularLiquidoKg();
    
    if (liquidoKg > 48000) {
      showModal('modalSplitCarregamento');
    } else {
      await this.confirmarSemSplit();
    }
  },
```

#### `confirmarSemSplit`

- **Assinatura:** ``

- **Efeito principal:** executa queries/actions (.run); exibe alertas (showAlert); controla modais

```js
async confirmarSemSplit() {
    try {
      closeModal('modalSplitCarregamento');
      showAlert("Confirmando sem split...", "info");

      const carregamentoId = Number(appsmith.store.carregamentoIdAtual) || 0;
      const pvId = appsmith.store.vendaSelecionada?.produto_venda_id || appsmith.store.produto_venda_id_sel;
      const produtoSelecionado = (appsmith.store.produtosDaVenda || [])
        .find(p => String(p.produto_venda_id) === String(pvId));

      const pesoInicialKg = Number(appsmith.store.tara_total || 0);
      const pesosFinalArray = appsmith.store.pesosFinal || [];
      const pesoFinalKg = pesosFinalArray.reduce((t, n) => t + (Number(n) || 0), 0);
      const liquidoKg = pesoFinalKg - pesoInicialKg;

      const params = {
        carregamento_id: carregamentoId,
        produto_venda_id: pvId,
        produto_id: produtoSelecionado?.produto_value || null,
        produto_nome: appsmith.store.produtosDaVenda?.[0]?.nome_produto || null,
        quantidade_liquida: liquidoKg,
        unidade: "kg",
        peso_final_eixos: JSON.stringify(appsmith.store.pesosFinal || [])
      };

      const resultado = await confirmarCarregamento.run(params);
      const suc
  // ... (truncado)
}
```


### Observações específicas (Split)

- Implementa regra de split quando `peso_líquido_kg > 48000`: abre modal e gera dois payloads de confirmação.
