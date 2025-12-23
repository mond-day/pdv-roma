# PDV Roma — Escopo técnico (Appsmith → Tailwind CSS)

Fonte de verdade: export do Appsmith (`PDV - Roma.json`).

## Páginas (pode manter as que criou)
- `Login`
- `Início`
- `Histórico`
- `Configurações`

## Datasources
- Postgres: `pdv`
- REST: `DEFAULT_REST_DATASOURCE` (URLs via `Urls.get(...)`)

## Widgets UI (por página)
### Login (23 widgets)
- `btn_navigateToSignIn` — `BUTTON_WIDGET`
- `btn_navigateToSignUp` — `BUTTON_WIDGET`
- `btn_signIn` — `BUTTON_WIDGET`
- `btn_signUp` — `BUTTON_WIDGET`
- `Canvas1` — `CANVAS_WIDGET`
- `Canvas2` — `CANVAS_WIDGET`
- `Canvas3` — `CANVAS_WIDGET`
- `MainContainer` — `CANVAS_WIDGET`
- `con_login` — `CONTAINER_WIDGET`
- `icn_login` — `ICON_BUTTON_WIDGET`
- `icn_register` — `ICON_BUTTON_WIDGET`
- `img_login` — `IMAGE_WIDGET`
- `inp_email` — `INPUT_WIDGET_V2`
- `inp_firstName` — `INPUT_WIDGET_V2`
- `inp_lastName` — `INPUT_WIDGET_V2`
- `inp_password` — `INPUT_WIDGET_V2`
- `inp_registerEmail` — `INPUT_WIDGET_V2`
- `inp_registerPassword` — `INPUT_WIDGET_V2`
- `tab_auth` — `TABS_WIDGET`
- `txt_register` — `TEXT_WIDGET`
- `txt_registerWelcome` — `TEXT_WIDGET`
- `txt_signIn` — `TEXT_WIDGET`
- `txt_welcome` — `TEXT_WIDGET`
### Início (71 widgets)
- `btn_buscar` — `BUTTON_WIDGET`
- `cancelaSplit` — `BUTTON_WIDGET`
- `confirmaSplit` — `BUTTON_WIDGET`
- `confirmar` — `BUTTON_WIDGET`
- `imprimir` — `BUTTON_WIDGET`
- `limpar` — `BUTTON_WIDGET`
- `standBy` — `BUTTON_WIDGET`
- `Canvas1` — `CANVAS_WIDGET`
- `Canvas2` — `CANVAS_WIDGET`
- `Canvas3` — `CANVAS_WIDGET`
- `Canvas4` — `CANVAS_WIDGET`
- `Canvas5` — `CANVAS_WIDGET`
- `Canvas6` — `CANVAS_WIDGET`
- `Canvas7` — `CANVAS_WIDGET`
- `MainContainer` — `CANVAS_WIDGET`
- `containerBusca` — `CONTAINER_WIDGET`
- `containerDetalhes` — `CONTAINER_WIDGET`
- `containerPesagem` — `CONTAINER_WIDGET`
- `divisor` — `DIVIDER_WIDGET`
- `IconFecharModalMotorista` — `ICON_BUTTON_WIDGET`
- `baixarTicket` — `ICON_BUTTON_WIDGET`
- `closeTicket` — `ICON_BUTTON_WIDGET`
- `fechaModalSplit` — `ICON_BUTTON_WIDGET`
- `resetBotao` — `ICON_BUTTON_WIDGET`
- `tag` — `ICON_BUTTON_WIDGET`
- `taraIcon` — `ICON_BUTTON_WIDGET`
- `IframeTicket` — `IFRAME_WIDGET`
- `logoFisconorte` — `IMAGE_WIDGET`
- `truckImage` — `IMAGE_WIDGET`
- `InputObservacoes` — `INPUT_WIDGET_V2`
- `InputQtdDesejada` — `INPUT_WIDGET_V2`
- `inputDetalhesProduto` — `INPUT_WIDGET_V2`
- `input_busca` — `INPUT_WIDGET_V2`
- `input_peso_eixo1` — `INPUT_WIDGET_V2`
- `input_peso_eixo2` — `INPUT_WIDGET_V2`
- `input_peso_eixo3` — `INPUT_WIDGET_V2`
- `input_peso_eixo4` — `INPUT_WIDGET_V2`
- `input_peso_eixo5` — `INPUT_WIDGET_V2`
- `listaVendas` — `LIST_WIDGET_V2`
- `ModalTicket` — `MODAL_WIDGET`
- `modalBuscaMotorista` — `MODAL_WIDGET`
- `modalSplitCarregamento` — `MODAL_WIDGET`
- `dropdown_eixos` — `SELECT_WIDGET`
- `selecaoMotorista` — `SELECT_WIDGET`
- `selecaoPlaca` — `SELECT_WIDGET`
- `selecaoProduto` — `SELECT_WIDGET`
- `selecaoTransportadora` — `SELECT_WIDGET`
- `Limite_maximo` — `TEXT_WIDGET`
- `Peso_Liquido_da_Carga` — `TEXT_WIDGET`
- `Peso_Total_da_Carga` — `TEXT_WIDGET`
- `buscaTitulo` — `TEXT_WIDGET`
- `codigoVenda` — `TEXT_WIDGET`
- `dataVenda` — `TEXT_WIDGET`
- `excessInputEixo1` — `TEXT_WIDGET`
- `excessInputEixo2` — `TEXT_WIDGET`
- `excessInputEixo3` — `TEXT_WIDGET`
- `excessInputEixo4` — `TEXT_WIDGET`
- `excessInputEixo5` — `TEXT_WIDGET`
- `limiteEixo` — `TEXT_WIDGET`
- `nomeCliente` — `TEXT_WIDGET`
- `paginaTitulo` — `TEXT_WIDGET`
- `pesagemTitulo` — `TEXT_WIDGET`
- `placa` — `TEXT_WIDGET`
- `produtos` — `TEXT_WIDGET`
- `status` — `TEXT_WIDGET`
- `subtituloModalMotorista` — `TEXT_WIDGET`
- `textDireitos` — `TEXT_WIDGET`
- `textoModalSplit` — `TEXT_WIDGET`
- `tituloModalMotorista` — `TEXT_WIDGET`
- `totalCarga` — `TEXT_WIDGET`
- `totalLiquido` — `TEXT_WIDGET`
### Histórico (22 widgets)
- `buscar` — `BUTTON_WIDGET`
- `cancelar` — `BUTTON_WIDGET`
- `editar` — `BUTTON_WIDGET`
- `Canvas1` — `CANVAS_WIDGET`
- `Canvas2` — `CANVAS_WIDGET`
- `MainContainer` — `CANVAS_WIDGET`
- `carregamentoList` — `CONTAINER_WIDGET`
- `datePickerFim` — `DATE_PICKER_WIDGET2`
- `datePickerInicio` — `DATE_PICKER_WIDGET2`
- `limparFiltros` — `ICON_BUTTON_WIDGET`
- `input_busca` — `INPUT_WIDGET_V2`
- `listaCarregamentos` — `LIST_WIDGET_V2`
- `botaoExportacao` — `MENU_BUTTON_WIDGET`
- `cliente` — `TEXT_WIDGET`
- `dataCarregamento` — `TEXT_WIDGET`
- `historicoTitulo` — `TEXT_WIDGET`
- `motorista` — `TEXT_WIDGET`
- `pesoCarregamento` — `TEXT_WIDGET`
- `placa` — `TEXT_WIDGET`
- `produto` — `TEXT_WIDGET`
- `status` — `TEXT_WIDGET`
- `vendaId` — `TEXT_WIDGET`
### Configurações (55 widgets)
- `btn_cancelar` — `BUTTON_WIDGET`
- `btn_cancelar_edit` — `BUTTON_WIDGET`
- `btn_salvar` — `BUTTON_WIDGET`
- `btn_salvar_edit` — `BUTTON_WIDGET`
- `editarPesagem` — `BUTTON_WIDGET`
- `editarUsuario` — `BUTTON_WIDGET`
- `editarWebhook` — `BUTTON_WIDGET`
- `salvarPesagem` — `BUTTON_WIDGET`
- `salvarWebhook` — `BUTTON_WIDGET`
- `usuarioCriar` — `BUTTON_WIDGET`
- `Canvas1` — `CANVAS_WIDGET`
- `Canvas2` — `CANVAS_WIDGET`
- `Canvas3` — `CANVAS_WIDGET`
- `Canvas4` — `CANVAS_WIDGET`
- `Canvas5` — `CANVAS_WIDGET`
- `Canvas6` — `CANVAS_WIDGET`
- `Canvas7` — `CANVAS_WIDGET`
- `MainContainer` — `CANVAS_WIDGET`
- `listaUsuario` — `CONTAINER_WIDGET`
- `parametrosPesagem` — `FORM_WIDGET`
- `parametrosUsuarios` — `FORM_WIDGET`
- `parametrosWebhook` — `FORM_WIDGET`
- `IconButton1` — `ICON_BUTTON_WIDGET`
- `excluirUsuario` — `ICON_BUTTON_WIDGET`
- `fechar` — `ICON_BUTTON_WIDGET`
- `buscaCodigo` — `INPUT_WIDGET_V2`
- `buscaPlaca` — `INPUT_WIDGET_V2`
- `cancelamento` — `INPUT_WIDGET_V2`
- `confirmarCarregamento` — `INPUT_WIDGET_V2`
- `duplicacao` — `INPUT_WIDGET_V2`
- `geraTicket` — `INPUT_WIDGET_V2`
- `inp_email` — `INPUT_WIDGET_V2`
- `inp_email_edit` — `INPUT_WIDGET_V2`
- `inp_nome` — `INPUT_WIDGET_V2`
- `inp_nome_edit` — `INPUT_WIDGET_V2`
- `inp_senha` — `INPUT_WIDGET_V2`
- `inp_senha_edit` — `INPUT_WIDGET_V2`
- `inputEmail` — `INPUT_WIDGET_V2`
- `inputNome` — `INPUT_WIDGET_V2`
- `pesoEixo` — `INPUT_WIDGET_V2`
- `toleranciaPeso` — `INPUT_WIDGET_V2`
- `usuarioLista` — `LIST_WIDGET_V2`
- `ModalEditarUsuario` — `MODAL_WIDGET`
- `ModalNovoUsuario` — `MODAL_WIDGET`
- `ms_permissoes` — `MULTI_SELECT_WIDGET_V2`
- `ms_permissoes_edit` — `MULTI_SELECT_WIDGET_V2`
- `permissaoUsuario` — `MULTI_SELECT_WIDGET_V2`
- `excessoSwitch` — `SWITCH_WIDGET`
- `sw_ativo` — `SWITCH_WIDGET`
- `sw_ativo_edit` — `SWITCH_WIDGET`
- `Text1` — `TEXT_WIDGET`
- `configuracaoWebhook` — `TEXT_WIDGET`
- `pesagemTitulo` — `TEXT_WIDGET`
- `tituloModal` — `TEXT_WIDGET`
- `tituloUsuario` — `TEXT_WIDGET`

## Actions/Queries (não-JS)
### Início (26 actions)
- `confirmarWebhook` — API `DEFAULT_REST_DATASOURCE` POST {{ Urls.get('confirmacao') }}
- `confirmarWebhookSplit` — API `DEFAULT_REST_DATASOURCE` POST {{ Urls.get('confirmacao') }}
- `httpSyncGC` — API `DEFAULT_REST_DATASOURCE` POST {{ Urls.get('busca_placa') }}
- `n8n_ImprimirTicket` — API `DEFAULT_REST_DATASOURCE` POST {{ Urls.get('ticket') }}
- `buscarPorCodigo` — DB `Ajuste`
- `buscarPorPlaca` — DB `Ajuste`
- `getParametrosPesagem` — DB `Ajuste`
- `listarMotoristasDaVenda` — DB `Ajuste`
- `listarMotoristasPorPlaca` — DB `Ajuste`
- `listarTransportadorasDaVenda` — DB `Ajuste`
- `listarTransportadorasPorPlaca` — DB `Ajuste`
- `qWebhooks` — DB `Ajuste`
- `BuscarClientePorIdGC` — DB `pdv`
- `buscarPlacasPorPrefixo` — DB `pdv`
- `buscarUsuarioPorEmail` — DB `pdv`
- `buscarVendas` — DB `pdv`
- `confirmarCarregamento` — DB `pdv`
- `criarCarregamentoEmEspera` — DB `pdv`
- `getCarregamentoDetalhe` — DB `pdv`
- `getProdutoVendaBasico` — DB `pdv`
- `inserirLogAcao` — DB `pdv`
- `listarPlacasDaVenda` — DB `pdv`
- `listarPlacasRecentes` — DB `pdv`
- `listarPlacasTodos` — DB `pdv`
- `listarProdutosDaVenda` — DB `pdv`
- `splitCarregamento` — DB `pdv`
### Histórico (11 actions)
- `PDF_n8n` — API `DEFAULT_REST_DATASOURCE` POST 
- `cancelarCarregamentoN8N` — API `DEFAULT_REST_DATASOURCE` POST {{ Urls.get('cancelamento') }}
- `qWebhooks` — DB `Ajuste`
- `atualizarStatusCarregamento` — DB `pdv`
- `buscarCarregamento` — DB `pdv`
- `buscarUsuarioPorEmail` — DB `pdv`
- `contarCarregamentos` — DB `pdv`
- `inserirLogAcao` — DB `pdv`
- `listarCarregamentosFiltrados` — DB `pdv`
- `listarCarregamentosRecentes` — DB `pdv`
- `obterCarregamentoParaEdicao` — DB `pdv`
### Configurações (8 actions)
- `deletarUsuario` — DB `Ajuste`
- `getParametrosPesagem` — DB `Ajuste`
- `getWebhooksConfig` — DB `Ajuste`
- `listarUsuarios` — DB `Ajuste`
- `salvarParametrosPesagem` — DB `Ajuste`
- `salvarWebhooksConfig` — DB `Ajuste`
- `createUsuario` — DB `pdv`
- `updateUsuario` — DB `pdv`

## JSObjects (lista completa de funções + dependências)

### Urls (Page: Início)
- Funções (4):
- `get` — storeRead: webhooks | alert
- `get` — storeRead: webhooks | alert
- `init` — run: qWebhooks
- `init` — run: qWebhooks

### PlacasSelectController (Page: Início)
- Funções (13):
- `carregarPlacasIniciais` — run: listarPlacasRecentes, listarPlacasTodos
- `fecharModal`
- `fecharModalComErro` — alert
- `fecharModalComSucesso` — alert
- `iniciarSincronizacaoAutomatica` — run: httpSyncGC | alert
- `iniciarWatcher` — run: buscarPlacasPorPrefixo
- `onDropdownClose`
- `onDropdownOpen`
- `pararSyncTimeout`
- `pararWatcher`
- `resetar`
- `startWatching`
- `stopWatching`

### JSController (Page: Início)
- Funções (8):
- `_pickVendaIdTxt`
- `_runListarProdutosDaVenda` — run: listarProdutosDaVenda | storeValue: produto_venda_id, produtosDaVenda | storeRead: carregamentoIdAtual, produto_venda_id, vendaSelecionada
- `_runListarProdutosDaVenda` — run: listarProdutosDaVenda | storeValue: produto_venda_id, produtosDaVenda | storeRead: carregamentoIdAtual, produto_venda_id, vendaSelecionada
- `init` — storeValue: carregamentoIdAtual, carregamentoSelecionado, isResetting, modoPesagem, mostrarDetalhes, produto_venda_id, produtosDaVenda, vendaSelecionada | storeRead: carregamentoIdAtual, carregamentoSelecionado, isResetting, modoPesagem, mostrarDetalhes, produto_venda_id, produtosDaVenda, vendaSelecionada
- `init` — storeValue: modoPesagem, mostrarDetalhes, vendaSelecionada | storeRead: modoPesagem, mostrarDetalhes, vendaSelecionada
- `limparSelecao` — storeValue: carregamentoIdAtual, carregamentoSelecionado, isResetting, modoPesagem, mostrarDetalhes, produto_venda_id, produtosDaVenda, vendaSelecionada
- `limparSelecao` — storeValue: carregamentoIdAtual, carregamentoSelecionado, isResetting, modoPesagem, mostrarDetalhes, produto_venda_id, produtosDaVenda, vendaSelecionada
- `selecionarVenda` — storeValue: carregamentoIdAtual, carregamentoSelecionado, isResetting, modoPesagem, mostrarDetalhes, produto_venda_id, vendaSelecionada | storeRead: carregamentoIdAtual, vendaSelecionada | alert

### JSLimpar (Page: Início)
- Funções (1):
- `limpar` — storeValue: carregamentoIdAtual, carregamentos, cliente, ctx_token, dataFim, dataInicio, detalhes_produto, eixos... | alert

### CarregamentoController (Page: Início)
- Funções (73):
- `_calcularPesos` — storeRead: pesosFinal, pesosTara
- `_ensureArray`
- `_firstDefined`
- `_formatTonBRFromKg`
- `_getConjuntos` — storeRead: conjuntos, parametrosPesagem
- `_getEixos` — storeRead: eixos
- `_getFinalPorConjuntoArray` — storeRead: eixos, pesosFinal
- `_getLimitesPorConjunto` — storeRead: limitesPorConjunto, parametrosPesagem
- `_getLimitesPorEixo` — storeRead: limitesPorEixo, parametrosPesagem
- `_getLiquidoPorConjuntoArray`
- `_getTaraPorConjuntoArray`
- `_getTaraPorEixoArray` — storeRead: eixos, pesosTara
- `_getVenda` — storeRead: vendaSelecionada | alert
- `_getVendaKeyFromStore` — storeRead: vendaSelecionada
- `_isPorConjunto` — storeRead: modoConjuntos, parametrosPesagem
- `_limparInputsPesagemTara` — storeValue: pesosTara, tara_eixos_raw, tara_total | storeRead: eixos | resetWidget: ContainerPesagemTara
- `_maybeParseJSON`
- `_normalizeVendaSelecionada`
- `_parseKgFromTonBR`
- `_parseTonBR`
- `_pickVendaIdTxt`
- `_safeItem`
- `_sumKg`
- `_syncProdutoSelecionadoComOpcoes` — storeValue: produtoSelecionadoId, produto_venda_id | storeRead: produto_venda_id, produtosDaVenda
- `_syncStoresFromWidgets` — storeRead: eixos, modoConjuntos, motorista_id, placa_norm, produto_venda_id, transportadora_id
- `badgeTextoEixo` — storeRead: eixos, pesosTara, qtd_eixos, tara_total
- `carregarCarregamentoSelecionado` — run: getCarregamentoDetalhe, listarProdutosDaVenda | storeValue: carregamentoIdAtual, eixos, isResetting, motorista_id, pesosFinal, pesosFinalLastValid, placa_norm, produto_venda_id... | storeRead: produtosDaVenda | alert
- `carregarProdutosDaVenda` — run: listarProdutosDaVenda | storeValue: produtoSelecionadoId, produto_venda_id, produtosDaVenda | storeRead: carregamentoIdAtual | alert
- `criarEmEspera` — run: buscarUsuarioPorEmail, criarCarregamentoEmEspera, inserirLogAcao | storeValue: carregamentoIdAtual, ctx_token, eixos, modoPesagem, mostrarDetalhes, motorista_id, placa_norm, produto_venda_id... | storeRead: detalhes_produto, eixos, motorista_id, observacoes, placa_norm, produto_venda_id, qtd_desejada, transportadora_id... | alert
- `debugParams` — storeRead: carregamentoIdAtual, produto_id, produto_venda_id
- `eixoConjuntos`
- `getParametro`
- `getProdutoIdsParaPersistir`
- `getProdutoSelecionadoRow` — storeRead: produto_venda_id, produtosDaVenda
- `handleChangeEixo`
- `init` — storeValue: carregamentoIdAtual, eixos, fasePesagem, isResetting, modoConjuntos, modoPesagem, mostrarDetalhes, motorista_id... | storeRead: carregamentoIdAtual, eixos, fasePesagem, isResetting, modoConjuntos, modoPesagem, mostrarDetalhes, motorista_id...
- `isEixoEmConjuntoExcedido` — storeRead: excedeConjunto
- `isFaseFinal` — storeRead: fasePesagem
- `isFinal`
- `isInvalidEixo` — storeRead: eixos, pesosFinalRaw, pesosTaraRaw
- `isModoUnico` — storeRead: eixos
- `lerFinalPorEixo` — storeRead: eixos, pesosFinal
- `lerTaraPorEixo` — storeRead: eixos, pesosTara
- `limparContextoGeral` — storeValue: carregamentoIdAtual, cliente, ctx_token, dataFim, dataInicio, detalhes_produto, eixos, errosFinal... | resetWidget: ContainerPesagemFinal, ContainerPesagemTara, InputObservacoes, ListaVendas, SelectProduto, dropdown_eixos...
- `liquidoConjuntoTexto`
- `liquidoTotalKg` — storeRead: eixos, pesosFinal, pesosTara, tara_total
- `liquidoTotalTexto`
- `onChangeEixos` — storeRead: isResetting
- `onInputEixoBlur` — storeValue: pesosFinalRaw, pesosTaraRaw | storeRead: pesosFinal, pesosFinalRaw, pesosTara, pesosTaraRaw
- `onInputEixoChange` — storeValue: pesosFinal, pesosFinalRaw, pesosTara, pesosTaraRaw | storeRead: eixos, pesosFinal, pesosFinalRaw, pesosTara, pesosTaraRaw
- `onListItemClick` — storeValue: carregamentoIdAtual, isResetting, itemAtual, modoPesagem, mostrarDetalhes, pesosFinal, pesosFinalRaw, pesosTaraRaw... | storeRead: eixos | alert
- `prepararPesagemFinalFromData` — storeValue: carregamentoIdAtual, modoPesagem, mostrarDetalhes, motorista_id, pesosFinal, pesosFinalLastValid, pesosFinalRaw, pesosTara... | alert
- `prepararSegundaPesagemViaHistorico` — run: listarProdutosDaVenda | storeValue: carregamentoIdAtual, detalhes_produto, modoPesagem, mostrarDetalhes, motorista_id, observacoes, pesosFinal, pesosFinalLastValid... | storeRead: carregamentoIdAtual, carregamento_id, detalhes_produto, eixos, id, motorista_id, observacoes, pesos_eixos... | alert
- `produtoSelecionadoId` — storeRead: produtoSelecionadoId
- `prontoParaConfirmar` — storeRead: eixos
- `rawInputEixo` — storeRead: pesosFinalRaw, pesosTaraRaw
- `selecionarResultado` — run: getCarregamentoDetalhe, getProdutoVendaBasico, listarMotoristasPorPlaca, listarPlacasRecentes, listarProdutosDaVenda | storeValue: carregamentoIdAtual, detalhes_produto, eixos, fasePesagem, isResetting, modoPesagem, mostrarDetalhes, motorista_id... | storeRead: produto_venda_id | resetWidget: selecaoMotorista, selecaoPlaca, selecaoProduto, selecaoTransportadora | alert
- `setFase` — storeValue: errosFinal, excedeConjunto, excedeEixo, fasePesagem, isFinalValido | storeRead: eixos
- `setPesoEixo` — storeValue: pesosTara | storeRead: eixos, pesosTara
- `setProdutoSelecionadoId` — storeValue: produtoSelecionadoId, produto_venda_id
- `setQuantidadeEixos` — storeValue: eixos, pesosFinal, pesosFinalLastValid, pesosFinalRaw, pesosTara, pesosTaraRaw | storeRead: pesosFinal, pesosFinalLastValid, pesosFinalRaw, pesosTara, pesosTaraRaw
- `showInputEixo`
- `syncFinalValido`
- `taraArray`
- `taraArrayForSQL` — storeRead: eixos, pesosTara
- `taraTotal`
- `taraTotalForSQL` — storeRead: pesosTara
- `tooltipInputEixo`
- `totalTexto` — storeRead: eixos, pesosFinal, pesosFinalRaw, pesosTara, pesosTaraRaw
- `validarCamposObrigatorios` — storeRead: eixos, motorista_id, pesosTara, placa_norm, produto_venda_id
- `validarLimitePorEixoTodos` — storeRead: pesosFinal | alert
- `validarPesagemFinal` — storeValue: errosFinal, excedeConjunto, excedeEixo, isFinalValido | storeRead: eixos | alert
- `valorInputEixo` — storeRead: pesosFinal, pesosFinalRaw, pesosTara, pesosTaraRaw

### SplitController (Page: Início)
- Funções (8):
- `calcularLiquidoKg` — storeRead: pesosFinal, pesosInicial, taraVeiculo
- `calcularLiquidoKg` — storeRead: pesosFinal, pesosInicial, taraVeiculo
- `confirmarComSplit` — run: confirmarWebhookSplit, splitCarregamento | storeRead: carregamentoIdAtual, detalhes_produto, eixos, motorista_id, observacoes, pesosFinal, pesosTara, placa_norm... | alert
- `confirmarComSplit` — run: confirmarWebhookSplit, splitCarregamento | storeRead: carregamentoIdAtual, detalhes_produto, eixos, motorista_id, observacoes, pesosFinal, pesosTara, placa_norm... | alert
- `confirmarPrincipal`
- `confirmarPrincipal`
- `confirmarSemSplit` — run: confirmarCarregamento, confirmarWebhook | storeRead: carregamentoIdAtual, detalhes_produto, eixos, motorista_id, observacoes, pesosFinal, pesosTara, placa_norm... | alert
- `confirmarSemSplit` — run: confirmarCarregamento, confirmarWebhook | storeRead: carregamentoIdAtual, detalhes_produto, eixos, motorista_id, observacoes, pesosFinal, pesosTara, placa_norm... | alert

### ImpressaoController (Page: Início)
- Funções (45):
- `_ensureArray`
- `_ensureArray`
- `_fmtTon`
- `_fmtTon`
- `_sum`
- `_sum`
- `_venda`
- `_vendaInfoPorCodigo`
- `baixarTicket`
- `baixarTicket`
- `buildPayload` — storeRead: qtd_desejada
- `eixosSelecionados`
- `faseAtual`
- `faseAtual`
- `finalTotalKg`
- `finalTotalKg`
- `imprimir` — run: n8n_ImprimirTicket | storeRead: modoPesagem, vendaSelecionada | alert
- `imprimirDireto` — run: n8n_ImprimirTicket | alert
- `imprimirDoPreview` — alert
- `liquidoKg`
- `liquidoKg`
- `motoristaId`
- `motoristaNome`
- `observacoesCompletas` — storeRead: detalhes_produto, observacoes
- `parsePeso`
- `pesoTotal`
- `pesos` — storeRead: pesos_eixos_array
- `pesosFinal`
- `pesosFinal`
- `pesosTara`
- `pesosTara`
- `preview` — run: BuscarPorCodigo, buscaPorCodigo, buscarPorCodigo, n8n_ImprimirTicket | alert
- `produtoNome` — storeRead: produtosDaVenda
- `produtoVendaSelecionadoId` — storeRead: produtosDaVenda
- `taraTotalKg`
- `taraTotalKg`
- `transportadoraId`
- `transportadoraNome`
- `vendaCarregamentoId`
- `vendaCliente`
- `vendaCodigo`
- `vendaIdGC` — storeRead: produtosDaVenda
- `vendaPlaca`
- `vendaProdutos` — storeRead: produtosDaVenda
- `w`

### TicketUI (Page: Início)
- Funções (7):
- `clearCamposTara` — storeValue: observacoes, qtd_desejada
- `getUnidadeSelecionada`
- `isQtdDesejadaValida` — storeRead: qtd_desejada
- `msgErroQtd`
- `parseNumFlex`
- `setObservacoes` — storeValue: observacoes
- `setQtdDesejada` — storeValue: qtd_desejada

### Urls (Page: Histórico)
- Funções (2):
- `get` — storeRead: webhooks | alert
- `init` — run: qWebhooks

### DateFilterSQL (Page: Histórico)
- Funções (2):
- `get` — storeRead: dataFim, dataInicio
- `get`

### ListaAgrupada (Page: Histórico)
- Funções (2):
- `get` — storeRead: cliente, dataFim, dataInicio, placa
- `inicializar` — run: listarCarregamentosRecentes | storeValue: paginaAtual, tamanhoPagina

### CarregamentosJS (Page: Histórico)
- Funções (5):
- `cancelarCarregamento` — run: atualizarStatusCarregamento, buscarCarregamento, buscarUsuarioPorEmail, cancelarCarregamentoN8N, inserirLogAcao | storeRead: user_id, usuario_id | alert
- `carregarPaginadoOuFiltrado` — run: listarCarregamentosFiltrados, listarCarregamentosRecentes | storeRead: cliente, dataFim, dataInicio, placa | alert
- `inicializar` — storeValue: paginaAtual, tamanhoPagina
- `paginaAnterior` — storeValue: paginaAtual | storeRead: paginaAtual
- `proximaPagina` — storeValue: paginaAtual | storeRead: paginaAtual

### HistoricoController (Page: Histórico)
- Funções (2):
- `editarCarregamento` — run: obterCarregamentoParaEdicao | storeValue: carregamentoIdAtual, detalhes_produto, eixos, etapaPesagem, modoPesagem, mostrarDetalhes, motorista_id, observacoes... | alert
- `naoPodeEditar`

### Exportador (Page: Histórico)
- Funções (16):
- `exportCSV`
- `exportCSV`
- `exportPDF` — run: PDF_n8n | storeRead: cliente, dataFim, dataInicio, placa | alert
- `exportPDF` — run: PDF_n8n | storeRead: cliente, dataFim, dataInicio, placa | alert
- `formataData`
- `formataData`
- `formataTon`
- `formataTon`
- `getDadosBrutos` — storeRead: cliente, dataFim, dataInicio, placa
- `getDadosBrutos` — storeRead: cliente, dataFim, dataInicio, placa
- `nomeArquivo` — storeRead: cliente, dataFim, dataInicio, placa
- `nomeArquivo` — storeRead: cliente, dataFim, dataInicio, placa
- `toCSV`
- `toCSV`
- `toLinhas`
- `toLinhas`

### UsuariosController (Page: Configurações)
- Funções (4):
- `openCreateModal` — resetWidget: inp_email, inp_nome, inp_senha, ms_permissoes, sw_ativo
- `openEditModal` — storeValue: usuarioEmEdicao | resetWidget: inp_email_edit, inp_nome_edit, inp_senha_edit, ms_permissoes_edit, sw_ativo_edit
- `submitCreateUser` — run: createUsuario | resetWidget: inp_email, inp_nome, inp_senha, ms_permissoes, sw_ativo | alert
- `submitUpdateUser` — run: updateUsuario | storeValue: usuarioEmEdicao | storeRead: usuarioEmEdicao | alert

### edicaoPesagem (Page: Configurações)
- Funções (2):
- `iniciarEdicao` — storeValue: modoEdicaoPesagem
- `salvar` — storeValue: modoEdicaoPesagem

### edicaoWebhooks (Page: Configurações)
- Funções (4):
- `iniciarEdicaoWebhooks` — storeValue: modoEdicaoWebhooks
- `iniciarEdicaoWebhooks` — storeValue: modoEdicaoWebhooks
- `salvarWebhooks` — storeValue: modoEdicaoWebhooks
- `salvarWebhooks` — storeValue: modoEdicaoWebhooks

### executarExclusao (Page: Configurações)
- Funções (2):
- `excluir` — run: deletarUsuario, listarUsuarios | alert
- `excluir` — run: deletarUsuario, listarUsuarios | alert
