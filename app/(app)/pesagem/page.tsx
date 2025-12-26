"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EixoInput } from "@/components/ui/EixoInput";
import { PesagemTotais } from "@/components/ui/PesagemTotais";
import { SearchInput } from "@/components/ui/SearchInput";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { formatStatus, getStatusBadgeVariant } from "@/lib/utils/status";
import { formatTon, formatTonWithUnit, gramasToTon } from "@/lib/utils/weight";

type FasePesagem = "TARA" | "FINAL" | null;

interface PlacaData {
  placa: string;
  motorista_ids?: number[];
  motorista_nomes?: string[];
  transportadora_ids?: string[];
  transportadora_nomes?: string[];
}

export default function PesagemPage() {
  const router = useRouter();
  const [buscaTexto, setBuscaTexto] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState<any[]>([]);
  const [mostrarBusca, setMostrarBusca] = useState(true);
  const [buscaPage, setBuscaPage] = useState(1);
  const [buscaTotal, setBuscaTotal] = useState(0);
  const [searchInputAtivo, setSearchInputAtivo] = useState(false);
  const buscaPageSize = 10;
  const [vendaSelecionada, setVendaSelecionada] = useState<any>(null);
  const [fasePesagem, setFasePesagem] = useState<FasePesagem>(null);
  const [qtdEixos, setQtdEixos] = useState<string>("");
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [placaSelecionada, setPlacaSelecionada] = useState("");
  const [motoristaSelecionado, setMotoristaSelecionado] = useState("");
  const [transportadoraSelecionada, setTransportadoraSelecionada] = useState("");
  const [pesosEixos, setPesosEixos] = useState<Record<number, string>>({});
  const [excessoEixos, setExcessoEixos] = useState<Record<number, number>>({});
  const [qtdDesejada, setQtdDesejada] = useState("");
  const [detalhesProduto, setDetalhesProduto] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [taraKg, setTaraKg] = useState<number | null>(null);
  const [pesoTotal, setPesoTotal] = useState<number>(0);
  const [pesoLiquido, setPesoLiquido] = useState<number>(0);
  const [limiteEixo, setLimiteEixo] = useState<number>(6000);
  const [permitirExcesso, setPermitirExcesso] = useState<boolean>(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketHtml, setTicketHtml] = useState("");
  const [selectedCarregamentoModal, setSelectedCarregamentoModal] = useState<any>(null);
  const [showCarregamentoModal, setShowCarregamentoModal] = useState(false);
  const [placaDataMap, setPlacaDataMap] = useState<Map<string, PlacaData>>(new Map());

  // Opções para selects
  const opcoesEixos = [
    { value: "", label: "Selecione a quantidade de eixos" },
    { value: "1", label: "1 Eixo" },
    { value: "2", label: "2 Eixos" },
    { value: "3", label: "3 Eixos" },
    { value: "4", label: "4 Eixos" },
    { value: "5", label: "5 Eixos" },
  ];

  const [produtos, setProdutos] = useState<Array<{ value: string; label: string; disabled?: boolean }>>([
    { value: "", label: "Selecione um produto" }
  ]);

  // Listas completas de motoristas e transportadoras (carregadas da API)
  const [todosMotoristas, setTodosMotoristas] = useState<Array<{ value: string; label: string }>>([
    { value: "", label: "Selecione um motorista" }
  ]);

  const [todasTransportadoras, setTodasTransportadoras] = useState<Array<{ value: string; label: string }>>([
    { value: "", label: "Selecione uma transportadora" }
  ]);

  // Listas filtradas baseadas na placa selecionada
  const [motoristas, setMotoristas] = useState<Array<{ value: string; label: string }>>([
    { value: "", label: "Selecione um motorista" }
  ]);

  const [transportadoras, setTransportadoras] = useState<Array<{ value: string; label: string }>>([
    { value: "", label: "Selecione uma transportadora" }
  ]);

  // Estado para armazenar o ID do motorista que deve ser selecionado após os motoristas carregarem
  const [motoristaIdPendente, setMotoristaIdPendente] = useState<string | null>(null);
  const [transportadoraIdPendente, setTransportadoraIdPendente] = useState<string | null>(null);

  // Quando os motoristas são carregados, verificar se há um ID pendente para selecionar
  useEffect(() => {
    if (motoristaIdPendente && todosMotoristas.length > 1) {
      const motoristaExiste = todosMotoristas.some(m => m.value === motoristaIdPendente);
      if (motoristaExiste) {
        console.log("Aplicando motorista pendente:", motoristaIdPendente);
        setMotoristaSelecionado(motoristaIdPendente);
        setMotoristaIdPendente(null);
      }
    }
  }, [todosMotoristas, motoristaIdPendente]);

  // Quando as transportadoras são carregadas, verificar se há um ID pendente para selecionar
  useEffect(() => {
    if (transportadoraIdPendente && todasTransportadoras.length > 1) {
      const transportadoraExiste = todasTransportadoras.some(t => t.value === transportadoraIdPendente);
      if (transportadoraExiste) {
        console.log("Aplicando transportadora pendente:", transportadoraIdPendente);
        setTransportadoraSelecionada(transportadoraIdPendente);
        setTransportadoraIdPendente(null);
      }
    }
  }, [todasTransportadoras, transportadoraIdPendente]);

  useEffect(() => {
    // Calcular totais quando pesos mudarem
    // pesosEixos agora está em TON (string com vírgula)
    const totalTon = Object.values(pesosEixos).reduce((acc, peso) => {
      // Converter vírgula para ponto
      const num = parseFloat(String(peso).replace(',', '.')) || 0;
      return acc + num;
    }, 0);

    // Converter para kg para exibição
    const totalKg = totalTon * 1000;
    setPesoTotal(totalKg);

    // Se está na fase TARA, atualizar tara_kg
    if (fasePesagem === "TARA" && totalKg > 0) {
      setTaraKg(totalKg);
    }

    // Calcular líquido
    const tara = taraKg || calcularTara();
    setPesoLiquido(tara > 0 ? totalKg - tara : 0);

    // Calcular excessos em TON
    const limiteEixoTon = limiteEixo / 1000;
    const novosExcessos: Record<number, number> = {};
    Object.entries(pesosEixos).forEach(([eixo, peso]) => {
      // Converter vírgula para ponto (peso já está em TON)
      const pesoTon = parseFloat(String(peso).replace(',', '.')) || 0;
      const excessoTon = pesoTon - limiteEixoTon;
      if (excessoTon > 0) {
        // Armazenar excesso em kg para compatibilidade
        novosExcessos[parseInt(eixo)] = excessoTon * 1000;
      }
    });
    setExcessoEixos(novosExcessos);
  }, [pesosEixos, taraKg, limiteEixo, fasePesagem]);

  const showInputEixo = (eixo: number) => {
    if (!qtdEixos || qtdEixos === "") return false;
    const numEixos = parseInt(qtdEixos);
    if (isNaN(numEixos) || numEixos < 1) return false;
    // Mostrar eixos de 1 até numEixos (inclusive)
    // Para 1 eixo: eixo=1, numEixos=1 -> 1 <= 1 && 1 >= 1 = true
    return eixo <= numEixos && eixo >= 1;
  };

  const getBadgeColor = (excesso: number) => {
    if (excesso <= 0) return "success";
    if (excesso <= 500) return "warning";
    if (excesso <= 1000) return "danger";
    return "danger";
  };

  // Função para mapear situação do contrato para variante de cor do Badge
  // Usa cores distintas das labels "Carregamento" (warning/amarelo) e "Contrato" (info/azul)
  const getSituacaoBadgeVariant = (situacao: string | null | undefined): "success" | "warning" | "danger" | "info" | "default" => {
    if (!situacao) return "default";
    const situacaoLower = situacao.toLowerCase().trim();
    if (situacaoLower === "contrato qtd") return "success"; // Verde (diferente de "Contrato" azul e "Carregamento" amarelo)
    if (situacaoLower === "contrato valor") return "danger"; // Vermelho (diferente de "Contrato" azul e "Carregamento" amarelo)
    if (situacaoLower === "contrato finalizado") return "default"; // Cinza (diferente de todas as outras)
    return "default"; // Cinza para outros tipos
  };

  // Função para formatar produto_display que vem da query SQL (converte formato americano para brasileiro)
  const formatProdutoDisplay = (display: string | null | undefined): string => {
    if (!display) return "Sem produto";
    // Converter formato "Produto (105.000 TON disponível)" para "Produto (105,000 TON disponível)"
    // A query SQL retorna números com ponto como separador decimal, precisamos converter para vírgula
    // Padrão: número seguido de ponto e 3 dígitos antes de espaço ou parêntese
    return display.replace(/(\d+)\.(\d{3})(\s|\))/g, (match, intPart, decPart, after) => {
      // Converter para formato brasileiro: "105.000" -> "105,000"
      // Adicionar separador de milhar se necessário
      const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `${intFormatted},${decPart}${after}`;
    });
  };

  const calcularTara = useCallback(() => {
    // pesosEixos está em TON, retornar em kg
    const taraEixosArray = Object.keys(pesosEixos)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((key) => parseFloat(String(pesosEixos[parseInt(key)]).replace(',', '.')) || 0);
    const taraTon = taraEixosArray.reduce((acc, peso) => acc + peso, 0);
    return taraTon * 1000; // Converter para kg
  }, [pesosEixos]);

  // Buscar placas via API
  const searchPlacas = useCallback(async (query: string): Promise<string[]> => {
    try {
      console.log("searchPlacas - Buscando placas com query:", query);
      const normalizedQuery = query.trim().toUpperCase();
      const response = await fetch(`/api/placas/search?q=${encodeURIComponent(normalizedQuery)}`);
      
      if (!response.ok) {
        console.error("searchPlacas - Erro na resposta HTTP:", response.status, response.statusText);
        return [];
      }
      
      const data = await response.json();
      console.log("searchPlacas - Resposta da API:", data);

      if (data.ok && data.items) {
        console.log("searchPlacas - Items recebidos:", data.items);
        // Armazenar dados completos das placas no mapa
        const newMap = new Map(placaDataMap);
        data.items.forEach((item: PlacaData) => {
          newMap.set(item.placa, item);
          console.log("searchPlacas - Armazenando placa no mapa:", item.placa, item);
        });
        setPlacaDataMap(newMap);

        // Retornar apenas as strings das placas para o autocomplete
        const placas = data.items.map((item: PlacaData) => item.placa);
        console.log("searchPlacas - Retornando placas:", placas);
        return placas;
      }
      console.warn("searchPlacas - Nenhum item retornado ou resposta não ok");
      return [];
    } catch (error) {
      console.error("searchPlacas - Erro ao buscar placas:", error);
      return [];
    }
  }, [placaDataMap]);

  // Filtrar motoristas e transportadoras baseado na placa selecionada
  // IMPORTANTE: Este useEffect só deve executar quando:
  // 1. Uma placa é selecionada
  // 2. Os motoristas/transportadoras foram carregados (length > 1 = tem dados além do placeholder)
  // 3. O placaDataMap foi atualizado
  useEffect(() => {
    // Aguardar até que motoristas e transportadoras sejam carregados
    if (todosMotoristas.length <= 1 || todasTransportadoras.length <= 1) {
      console.log("🔍 [FILTRO] Aguardando carregamento de motoristas/transportadoras...");
      // Inicialmente, mostrar todos (mesmo que só tenha o placeholder)
      setMotoristas(todosMotoristas);
      setTransportadoras(todasTransportadoras);
      return;
    }

    console.log("🔍 [FILTRO] Placa selecionada:", placaSelecionada);
    console.log("🔍 [FILTRO] PlacaDataMap size:", placaDataMap.size);
    console.log("🔍 [FILTRO] Todos motoristas:", todosMotoristas.length);
    console.log("🔍 [FILTRO] Todas transportadoras:", todasTransportadoras.length);
    
    if (!placaSelecionada) {
      // Se não há placa selecionada, mostrar todos
      console.log("🔍 [FILTRO] Sem placa selecionada - mostrando todos");
      setMotoristas(todosMotoristas);
      setTransportadoras(todasTransportadoras);
      return;
    }

    const placaData = placaDataMap.get(placaSelecionada);
    console.log("🔍 [FILTRO] Dados da placa encontrados:", placaData);
    
    if (placaData) {
      // Filtrar motoristas vinculados à placa
      if (placaData.motorista_ids && placaData.motorista_ids.length > 0) {
        console.log("🔍 [FILTRO] Motorista IDs vinculados à placa:", placaData.motorista_ids);
        console.log("🔍 [FILTRO] Total de motoristas disponíveis:", todosMotoristas.length - 1, "(sem contar placeholder)");
        const motoristasFiltrados = todosMotoristas.filter(m => 
          m.value === "" || placaData.motorista_ids!.includes(parseInt(m.value))
        );
        console.log("🔍 [FILTRO] Motoristas filtrados:", motoristasFiltrados.length, "itens:", motoristasFiltrados.map(m => ({ value: m.value, label: m.label })));
        console.log("🔍 [FILTRO] Motoristas que SERÃO EXIBIDOS no select:", motoristasFiltrados.length - 1, "(sem contar placeholder)");
        setMotoristas(motoristasFiltrados);
      } else {
        // Se não há vínculos, mostrar todos
        console.log("🔍 [FILTRO] Sem vínculos de motorista - mostrando todos os", todosMotoristas.length - 1, "motoristas disponíveis");
        setMotoristas(todosMotoristas);
      }

      // Filtrar transportadoras vinculadas à placa
      if (placaData.transportadora_ids && placaData.transportadora_ids.length > 0) {
        console.log("🔍 [FILTRO] Transportadora IDs vinculadas à placa:", placaData.transportadora_ids);
        console.log("🔍 [FILTRO] Total de transportadoras disponíveis:", todasTransportadoras.length - 1, "(sem contar placeholder)");
        const transportadorasFiltradas = todasTransportadoras.filter(t => 
          t.value === "" || placaData.transportadora_ids!.includes(t.value)
        );
        console.log("🔍 [FILTRO] Transportadoras filtradas:", transportadorasFiltradas.length, "itens:", transportadorasFiltradas.map(t => ({ value: t.value, label: t.label })));
        console.log("🔍 [FILTRO] Transportadoras que SERÃO EXIBIDAS no select:", transportadorasFiltradas.length - 1, "(sem contar placeholder)");
        setTransportadoras(transportadorasFiltradas);
      } else {
        // Se não há vínculos, mostrar todas
        console.log("🔍 [FILTRO] Sem vínculos de transportadora - mostrando todas as", todasTransportadoras.length - 1, "transportadoras disponíveis");
        setTransportadoras(todasTransportadoras);
      }
    } else {
      // Se não há dados da placa, mostrar todos
      console.log("🔍 [FILTRO] Nenhum dado encontrado para placa - mostrando todos");
      setMotoristas(todosMotoristas);
      setTransportadoras(todasTransportadoras);
    }
  }, [placaSelecionada, placaDataMap, todosMotoristas, todasTransportadoras]);

  // Handler quando uma placa é selecionada - auto-popular motorista e transportadora
  const handlePlacaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const placa = e.target.value.toUpperCase();
    setPlacaSelecionada(placa);

    console.log("Placa selecionada:", placa);
    console.log("PlacaDataMap:", placaDataMap);

    // Se a placa existe no mapa, auto-popular motorista e transportadora
    const placaData = placaDataMap.get(placa);
    console.log("Dados da placa encontrados:", placaData);

    if (placaData) {
      // Motorista: auto-preencher apenas se houver exatamente 1 vínculo
      if (placaData.motorista_ids && placaData.motorista_ids.length === 1) {
        const motoristaId = String(placaData.motorista_ids[0]);
        console.log("Auto-preenchendo motorista (vínculo único):", motoristaId);
        
        // Verificar se o motorista existe nas opções disponíveis
        const motoristaExiste = todosMotoristas.length > 1 && todosMotoristas.some(m => m.value === motoristaId);
        console.log("Motorista existe nas opções?", motoristaExiste, "Total de motoristas:", todosMotoristas.length);
        
        if (motoristaExiste) {
          setMotoristaSelecionado(motoristaId);
          console.log("Motorista selecionado definido como:", motoristaId);
        } else {
          console.warn("Motorista ID", motoristaId, "não encontrado nas opções disponíveis. Armazenando como pendente...");
          // Armazenar como pendente para ser aplicado quando os motoristas carregarem
          setMotoristaIdPendente(motoristaId);
        }
      } else if (placaData.motorista_ids && placaData.motorista_ids.length > 1) {
        console.log(`Placa tem ${placaData.motorista_ids.length} motoristas vinculados - usuário deve escolher`);
        // Limpar seleção se houver múltiplos vínculos
        setMotoristaSelecionado("");
      } else {
        // Limpar seleção se não houver vínculos
        setMotoristaSelecionado("");
      }

      // Transportadora: auto-preencher apenas se houver exatamente 1 vínculo
      if (placaData.transportadora_ids && placaData.transportadora_ids.length === 1) {
        const transportadoraId = String(placaData.transportadora_ids[0]);
        console.log("Auto-preenchendo transportadora (vínculo único):", transportadoraId);
        
        // Verificar se a transportadora existe nas opções disponíveis
        const transportadoraExiste = todasTransportadoras.length > 1 && todasTransportadoras.some(t => t.value === transportadoraId);
        console.log("Transportadora existe nas opções?", transportadoraExiste, "Total de transportadoras:", todasTransportadoras.length);
        
        if (transportadoraExiste) {
          setTransportadoraSelecionada(transportadoraId);
          console.log("Transportadora selecionada definida como:", transportadoraId);
        } else {
          console.warn("Transportadora ID", transportadoraId, "não encontrada nas opções disponíveis. Armazenando como pendente...");
          // Armazenar como pendente para ser aplicado quando as transportadoras carregarem
          setTransportadoraIdPendente(transportadoraId);
        }
      } else if (placaData.transportadora_ids && placaData.transportadora_ids.length > 1) {
        console.log(`Placa tem ${placaData.transportadora_ids.length} transportadoras vinculadas - usuário deve escolher`);
        // Limpar seleção se houver múltiplos vínculos
        setTransportadoraSelecionada("");
      } else {
        // Limpar seleção se não houver vínculos
        setTransportadoraSelecionada("");
      }
    } else {
      console.warn("Nenhum dado encontrado para placa:", placa);
      // Limpar seleções se não houver dados da placa
      setMotoristaSelecionado("");
      setTransportadoraSelecionada("");
    }
  }, [placaDataMap, todosMotoristas, todasTransportadoras]);

  const handleStandBy = async () => {
    if (!placaSelecionada) {
      alert("Por favor, selecione uma placa");
      return;
    }

    if (!vendaSelecionada || !vendaSelecionada.id_gc) {
      alert("Por favor, selecione uma venda/contrato primeiro");
      return;
    }

    const taraTotal = calcularTara();
    if (taraTotal === 0 && !taraKg) {
      alert("Por favor, preencha os pesos dos eixos (Tara)");
      return;
    }

    // Tara já está em kg, converter para TON
    const taraTotalTon = (taraTotal || (taraKg || 0)) / 1000;

    // Converter tara_eixos de objeto para array JSONB (já está em TON, converter para kg)
    const taraEixosArray = Object.keys(pesosEixos)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((key) => {
        const ton = parseFloat(String(pesosEixos[parseInt(key)]).replace(',', '.')) || 0;
        return ton * 1000; // Converter TON para kg
      });

    // Criar carregamento em stand-by
    const response = await fetch("/api/carregamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        venda_id: vendaSelecionada.id_gc || vendaSelecionada.id,
        placa: placaSelecionada,
        produto_venda_id: produtoSelecionado ? parseInt(produtoSelecionado) : undefined,
        detalhes_produto: detalhesProduto || undefined,
        qtd_desejada: qtdDesejada || null,
        tara_total: taraTotalTon,
        eixos: parseInt(qtdEixos) || null,
        tara_eixos: taraEixosArray.length > 0 ? taraEixosArray : undefined,
        observacoes: observacoes,
        transportadora_id: transportadoraSelecionada || undefined,
        motorista_id: motoristaSelecionado ? parseInt(motoristaSelecionado) : undefined,
      }),
    });

    const data = await response.json();
    if (data.ok) {
      alert("Carregamento criado em standby!");
      router.push(`/carregamentos/${data.item.id}`);
    } else {
      alert(data.message || "Erro ao criar carregamento");
    }
  };

  const handleConfirmar = async () => {
    if (pesoLiquido > 48000) {
      setShowSplitModal(true);
      return;
    }

    if (!vendaSelecionada) {
      alert("Por favor, selecione uma venda primeiro");
      return;
    }

    // Se já existe carregamento, finalizar
    if (vendaSelecionada.id) {
      const idempotencyKey = `finalizar-${vendaSelecionada.id}-${Date.now()}`;

      // Converter final_eixos_kg de TON para kg
      const finalEixosKg = Object.keys(pesosEixos)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((key) => {
          const ton = parseFloat(String(pesosEixos[parseInt(key)]).replace(',', '.')) || 0;
          return Math.round(ton * 1000); // Converter TON para kg
        });

      // Converter pesoTotal de kg para TON
      const pesoTotalTon = pesoTotal / 1000;
      const pesoLiquidoTon = pesoLiquido / 1000;
      const finalEixosTon = finalEixosKg.map(kg => kg / 1000);

      const response = await fetch(`/api/carregamentos/${vendaSelecionada.id}/finalizar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotency_key: idempotencyKey,
          timestamp: new Date().toISOString(),
          bruto_kg: pesoTotalTon, // Na verdade é TON
          liquido_kg: pesoLiquidoTon, // Na verdade é TON
          final_eixos_kg: finalEixosTon, // Na verdade é TON
        }),
      });

      if (response.ok) {
        alert("Carregamento finalizado com sucesso!");
        router.push(`/carregamentos/${vendaSelecionada.id}`);
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao finalizar carregamento");
      }
    }
  };

  const handleLimpar = () => {
    setQtdEixos("");
    setProdutoSelecionado("");
    setPlacaSelecionada("");
    setMotoristaSelecionado("");
    setTransportadoraSelecionada("");
    setPesosEixos({});
    setQtdDesejada("");
    setDetalhesProduto("");
    setObservacoes("");
    setTaraKg(null);
    setFasePesagem(null);
    // Resetar filtros - mostrar todos motoristas e transportadoras
    setMotoristas(todosMotoristas);
    setTransportadoras(todasTransportadoras);
  };

  const isFinalValido = pesoLiquido > 0 && pesoTotal > 0;

  const handleSearch = useCallback(async (query: string): Promise<any[]> => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const textoBusca = query.trim();

    try {
      // Busca unificada de vendas + carregamentos (como no Appsmith)
      console.log("Buscando vendas e carregamentos:", textoBusca);
      const response = await fetch(`/api/vendas/search?q=${encodeURIComponent(textoBusca)}`);

      if (!response.ok) {
        console.error("Erro na busca:", response.status, await response.text());
        return [];
      }

      const data = await response.json();
      console.log("Resultados da busca unificada:", data);

      if (data.ok && data.items) {
        console.log(`✅ Encontrados ${data.items.length} itens (vendas + carregamentos)`);
        return data.items;
      }

      return [];
    } catch (error) {
      console.error("Erro na busca:", error);
      return [];
    }
  }, []);

  const handleSelecionarVenda = useCallback(async (item: any) => {
    console.log("Item selecionado:", item);

    // Verificar se é carregamento ou venda
    // Um item é considerado carregamento se:
    // 1. Tem is_carregamento = true (vem da busca) OU
    // 2. Tem status de carregamento (standby, finalizado, cancelado) e campo 'id' (vem da lista)
    const isCarregamento = item.is_carregamento ||
                          (item.status && ['standby', 'stand-by', 'finalizado', 'cancelado'].includes(item.status.toLowerCase()) && item.id);

    if (isCarregamento) {
      // É um CARREGAMENTO em andamento - carregar dados completos
      const carregamentoId = item.carregamento_id || item.id;
      console.log("Carregamento selecionado, ID:", carregamentoId);

      try {
        const response = await fetch(`/api/carregamentos/${carregamentoId}`);
        const data = await response.json();

        if (data.ok && data.item) {
          const carregamento = data.item;
          console.log("Dados completos do carregamento:", carregamento);

          setVendaSelecionada(carregamento);
          setMostrarBusca(false);
          setFasePesagem("FINAL"); // Ir direto para pesagem FINAL

          // Preencher campos com dados do carregamento
          if (carregamento.placa) setPlacaSelecionada(carregamento.placa);
          if (carregamento.motorista_id) setMotoristaSelecionado(String(carregamento.motorista_id));
          if (carregamento.transportadora_id) setTransportadoraSelecionada(String(carregamento.transportadora_id));
          if (carregamento.produto_venda_id) setProdutoSelecionado(String(carregamento.produto_venda_id));
          if (carregamento.qtd_desejada) setQtdDesejada(carregamento.qtd_desejada);
          if (carregamento.detalhes_produto) setDetalhesProduto(carregamento.detalhes_produto);
          if (carregamento.observacoes) setObservacoes(carregamento.observacoes);

          // Definir quantidade de eixos
          if (carregamento.eixos) {
            setQtdEixos(String(carregamento.eixos));
          }

          // Definir tara_kg
          if (carregamento.tara_total) {
            setTaraKg(carregamento.tara_total);
          }

          // Para carregamentos standby na fase FINAL:
          // - Se já tem peso final, preencher os inputs
          // - Se não tem peso final, deixar inputs vazios (usuário vai digitar peso final)
          if (carregamento.final_eixos_kg && typeof carregamento.final_eixos_kg === 'object' && Object.keys(carregamento.final_eixos_kg).length > 0) {
            // Já tem peso final, preencher - vem em kg, converter para TON
            const finalEixos: Record<number, string> = {};
            Object.keys(carregamento.final_eixos_kg).forEach((key) => {
              const eixoNum = parseInt(key);
              if (!isNaN(eixoNum)) {
                const kg = carregamento.final_eixos_kg[key];
                const ton = (kg / 1000).toFixed(3).replace('.', ',');
                finalEixos[eixoNum] = ton;
              }
            });
            setPesosEixos(finalEixos);
          } else {
            // Não tem peso final, deixar inputs vazios para digitação
            setPesosEixos({});
          }
        } else {
          alert("Erro ao carregar dados do carregamento");
        }
      } catch (error) {
        console.error("Erro ao buscar carregamento:", error);
        alert("Erro ao carregar dados do carregamento");
      }
    } else {
      // É uma VENDA sem carregamento - iniciar nova pesagem
      console.log("Venda selecionada (sem carregamento), ID:", item.id_gc);

      // Validar situação do contrato
      const situacao = item.situacao || "";
      if (situacao !== "Contrato Qtd" && situacao !== "Contrato Valor") {
        alert(
          `Não é possível realizar carregamento para um contrato com situação "${situacao}".\n\n` +
          `Apenas contratos com situação "Contrato Qtd" ou "Contrato Valor" podem ser carregados.`
        );
        return;
      }

      setVendaSelecionada(item);
      setMostrarBusca(false);
      setFasePesagem("TARA"); // Iniciar com pesagem de TARA

      // Limpar campos de pesagem
      setPesosEixos({});
      setQtdEixos("");
      setPlacaSelecionada("");
      setMotoristaSelecionado("");
      setTransportadoraSelecionada("");
      setQtdDesejada("");
      setDetalhesProduto(""); // Deixar vazio - produto será selecionado no select
      setObservacoes("");
      setTaraKg(null);
      setProdutoSelecionado(""); // Resetar seleção de produto
    }
  }, []);

  const handleSelectResult = useCallback(async (result: { id: string | number; label: string; subtitle?: string; metadata?: string }) => {
    // Buscar o item completo pela API
    try {
      const response = await fetch(`/api/carregamentos/${result.id}`);
      const data = await response.json();
      if (data.ok && data.item) {
        handleSelecionarVenda(data.item);
        // Atualizar resultados para mostrar o item selecionado
        setResultadosBusca([data.item]);
      }
    } catch (error) {
      console.error("Erro ao buscar item:", error);
    }
  }, [handleSelecionarVenda]);

  const handleSearchWrapper = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      alert("Digite pelo menos 2 caracteres para buscar");
      return;
    }
    setSearchInputAtivo(true);
    setBuscaPage(1); // Resetar para primeira página
    try {
      const results = await handleSearch(query);
      console.log("Resultados da busca:", results);
      setResultadosBusca(results || []);
      setBuscaTotal((results || []).length);
      setSearchInputAtivo(false);
      if (!results || results.length === 0) {
        alert("Nenhum resultado encontrado");
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      setSearchInputAtivo(false);
      alert("Erro ao realizar busca. Verifique o console para mais detalhes.");
    }
  }, [handleSearch]);

  const handleSelectWrapper = useCallback((result: { id: string | number; label: string; subtitle?: string; metadata?: string }) => {
    setSearchInputAtivo(false);
    handleSelectResult(result);
  }, [handleSelectResult]);


  const handleLimparBusca = () => {
    setBuscaTexto("");
    setResultadosBusca([]);
    setVendaSelecionada(null);
    setMostrarBusca(true);
    setBuscaPage(1);
    setBuscaTotal(0);
    setSearchInputAtivo(false);
  };

  const [carregamentos, setCarregamentos] = useState<any>({ ok: true, items: [], total: 0, page: 1, pageSize: 50 });
  const [mostrarLista, setMostrarLista] = useState(true);

  // Carregar configurações de pesagem
  useEffect(() => {
    fetch("/api/configuracoes")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.items) {
          const pesoMaximo = data.items.find((item: any) => item.key === "PESO_MAXIMO_EIXO");
          const permitir = data.items.find((item: any) => item.key === "PERMITIR_EXCESSO_PESO");
          if (pesoMaximo?.value) {
            setLimiteEixo(parseInt(pesoMaximo.value) || 6000);
          }
          if (permitir?.value) {
            setPermitirExcesso(permitir.value === "true");
          }
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar configurações:", error);
      });
  }, []);

  // Carregar lista completa de motoristas
  useEffect(() => {
    fetch("/api/motoristas")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.items) {
          const opcoes = [
            { value: "", label: "Selecione um motorista" },
            ...data.items.map((m: any) => ({ value: String(m.id), label: m.nome }))
          ];
          console.log("✅ Motoristas carregados:", opcoes.length, opcoes);
          setTodosMotoristas(opcoes);
          // O filtro será aplicado pelo useEffect que monitora placaSelecionada
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar motoristas:", error);
      });
  }, []);

  // Carregar lista completa de transportadoras
  useEffect(() => {
    fetch("/api/transportadoras")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.items) {
          const opcoes = [
            { value: "", label: "Selecione uma transportadora" },
            ...data.items.map((t: any) => ({ value: String(t.id_gc), label: t.nome }))
          ];
          console.log("✅ Transportadoras carregadas:", opcoes.length, opcoes);
          setTodasTransportadoras(opcoes);
          // O filtro será aplicado pelo useEffect que monitora placaSelecionada
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar transportadoras:", error);
      });
  }, []);

  // Carregar produtos quando selecionar uma venda
  useEffect(() => {
    const vendaId = vendaSelecionada?.id_gc || vendaSelecionada?.venda_id || vendaSelecionada?.id;
    if (vendaId) {
      console.log("Carregando produtos para venda:", vendaId);
      fetch(`/api/produtos/disponiveis?venda_id=${vendaId}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Produtos retornados:", data);
          if (data.ok && data.items && data.items.length > 0) {
            const opcoes = [
              { value: "", label: "Selecione um produto" },
              ...data.items.map((p: any) => ({
                value: String(p.produto_venda_id),
                label: `${p.nome_produto} (${formatTon(p.quantidade_disponivel)} TON disponível)`,
                disabled: p.quantidade_disponivel <= 0
              }))
            ];
            setProdutos(opcoes);
            console.log("Produtos configurados:", opcoes);
          } else {
            console.warn("Nenhum produto disponível para esta venda");
            // Even if no products, show empty list instead of not setting anything
            setProdutos([{ value: "", label: "Selecione um produto" }]);
          }
        })
        .catch((error) => {
          console.error("Erro ao carregar produtos:", error);
        });
    }
  }, [vendaSelecionada]);

  useEffect(() => {
    // Carregar lista de carregamentos - primeiro tenta últimos 7 dias, se não houver, busca últimos 30 dias
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const dataFormatada = `${ano}-${mes}-${dia}`;
    
    // Calcular data de 7 dias atrás
    const data7DiasAtras = new Date();
    data7DiasAtras.setDate(data7DiasAtras.getDate() - 7);
    const ano7 = data7DiasAtras.getFullYear();
    const mes7 = String(data7DiasAtras.getMonth() + 1).padStart(2, '0');
    const dia7 = String(data7DiasAtras.getDate()).padStart(2, '0');
    const data7DiasAtrasFormatada = `${ano7}-${mes7}-${dia7}`;
    
    console.log("Carregando carregamentos de", data7DiasAtrasFormatada, "até", dataFormatada);
    const url = `/api/carregamentos?date=${data7DiasAtrasFormatada}&dateFim=${dataFormatada}&pageSize=50`;
    console.log("URL da requisição:", url);
    
    fetch(url)
      .then((res) => {
        console.log("Status da resposta:", res.status, res.statusText);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Resposta completa da API:", JSON.stringify(data, null, 2));
        if (data.ok) {
          console.log(`Total de carregamentos: ${data.total}`);
          console.log(`Items recebidos: ${data.items?.length || 0}`);
          
          // Se não encontrou nos últimos 7 dias, buscar todos (sem filtro de data)
          if (!data.items || data.items.length === 0) {
            console.warn("Nenhum carregamento encontrado nos últimos 7 dias. Buscando todos os carregamentos...");
            return fetch(`/api/carregamentos?pageSize=50`)
              .then((res) => res.json())
              .then((dataAll) => {
                if (dataAll.ok) {
                  console.log(`✅ Carregados ${dataAll.items?.length || 0} carregamentos (todos)`);
                  setCarregamentos(dataAll);
                } else {
                  setCarregamentos({ ok: true, items: [], total: 0, page: 1, pageSize: 50 });
                }
              });
          } else {
            console.log(`✅ Carregados ${data.items.length} carregamentos`);
            console.log("Primeiro item:", data.items[0]);
            setCarregamentos(data);
          }
        } else {
          console.error("❌ Erro na resposta da API:", data);
          setCarregamentos({ ok: true, items: [], total: 0, page: 1, pageSize: 50 });
        }
      })
      .catch((error) => {
        console.error("❌ Erro ao carregar carregamentos:", error);
        console.error("Stack:", error.stack);
        setCarregamentos({ ok: true, items: [], total: 0, page: 1, pageSize: 50 });
      });
  }, []);


  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pesagem e Carregamentos</h1>
          <p className="text-gray-600 mt-1">Realize a pesagem e gerencie os carregamentos</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => {
              setMostrarLista(true);
              setMostrarBusca(false);
            }}
            className={`px-4 py-2 font-medium text-sm ${
              mostrarLista
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📋 Lista de Carregamentos
          </button>
          <button
            onClick={() => {
              setMostrarLista(false);
              setMostrarBusca(true);
            }}
            className={`px-4 py-2 font-medium text-sm ${
              !mostrarLista
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            ⚖️ Nova Pesagem
          </button>
        </div>

        {/* Lista de Carregamentos */}
        {mostrarLista && (
          <Card className="bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">
                      Placa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">
                      Produto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">
                      Líquido (TON)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!carregamentos || !carregamentos.items || carregamentos.items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <p className="text-gray-500">Nenhum carregamento encontrado nos últimos 7 dias</p>
                          <p className="text-sm text-gray-400">
                            Execute o seed de dados fake: <code className="bg-gray-100 px-2 py-1 rounded">executar-seed.cmd</code>
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    carregamentos.items.map((item: any) => {
                      // Normalizar status para comparação
                      const statusNormalizado = (item.status || "").toLowerCase().trim();
                      const podeCancelar = (statusNormalizado === "stand-by" || statusNormalizado === "standby" || statusNormalizado === "finalizado") && statusNormalizado !== "cancelado";
                      const podePesar = statusNormalizado === "stand-by" || statusNormalizado === "standby";
                      
                      return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {new Date(item.data_carregamento).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.placa}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.cliente_nome}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.produto_nome || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {item.status === 'finalizado' && (item.liquido_ton || item.liquido_kg)
                            ? formatTon(item.liquido_ton || (item.liquido_kg ? item.liquido_kg / 1000 : null))
                            : "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant={getStatusBadgeVariant(item.status)}>
                            {formatStatus(item.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              const res = await fetch(`/api/carregamentos/${item.id}`);
                              const data = await res.json();
                              if (data.ok) {
                                setSelectedCarregamentoModal(data.item);
                                setShowCarregamentoModal(true);
                              }
                            }}
                            title="Ver detalhes"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </Button>
                          {podePesar && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setVendaSelecionada(item);
                                setMostrarLista(false);
                                setMostrarBusca(false);
                                setFasePesagem("FINAL");
                              }}
                            >
                              Pesar
                            </Button>
                          )}
                          {podeCancelar && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                if (confirm("Tem certeza que deseja cancelar este carregamento?")) {
                                  const motivo = prompt("Informe o motivo do cancelamento:");
                                  if (motivo) {
                                    try {
                                      const res = await fetch(`/api/carregamentos/${item.id}/cancelar`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          motivo: motivo,
                                          request_id: `cancelar-${item.id}-${Date.now()}`,
                                        }),
                                      });
                                      const data = await res.json();
                                      if (data.ok) {
                                        alert("Carregamento cancelado com sucesso!");
                                        // Recarregar a lista
                                        const hoje = new Date();
                                        const ano = hoje.getFullYear();
                                        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
                                        const dia = String(hoje.getDate()).padStart(2, '0');
                                        const dataFormatada = `${ano}-${mes}-${dia}`;
                                        fetch(`/api/carregamentos?date=${dataFormatada}&pageSize=50`)
                                          .then((res) => res.json())
                                          .then((data) => {
                                            if (data.ok) {
                                              setCarregamentos(data);
                                            }
                                          });
                                      } else {
                                        alert(data.message || "Erro ao cancelar carregamento");
                                      }
                                    } catch (error) {
                                      alert("Erro ao cancelar carregamento");
                                    }
                                  }
                                }
                              }}
                              title="Cancelar carregamento"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </Button>
                          )}
                        </td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Busca de Vendas e Carregamentos */}
        {!mostrarLista && mostrarBusca && (
          <Card title="🔍 Buscar Venda ou Carregamento" className="bg-white">
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={buscaTexto}
                    onChange={(e) => setBuscaTexto(e.target.value)}
                    placeholder="Digite cliente, placa, código de venda ou ID..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchWrapper(buscaTexto);
                      }
                    }}
                  />
                </div>
                <div className="flex items-end pb-1 gap-2">
                  <Button
                    onClick={async () => {
                      if (buscaTexto.trim().length >= 2) {
                        await handleSearchWrapper(buscaTexto);
                      } else {
                        alert("Digite pelo menos 2 caracteres para buscar");
                      }
                    }}
                    disabled={buscaTexto.trim().length < 2 || searchInputAtivo}
                    isLoading={searchInputAtivo}
                  >
                    🔍 Buscar
                  </Button>
                  <Button variant="ghost" onClick={handleLimparBusca}>
                    Limpar
                  </Button>
                </div>
              </div>
              {searchInputAtivo && (
                <div className="mt-4 text-center text-gray-500">
                  Buscando...
                </div>
              )}
              {!searchInputAtivo && resultadosBusca.length === 0 && buscaTexto.trim().length >= 2 && (
                <div className="mt-4 text-center text-gray-500">
                  <p>Nenhum resultado encontrado.</p>
                  <p className="text-sm mt-1">Busque por: nome do cliente, placa, código de venda ou ID de carregamento.</p>
                </div>
              )}
              {!searchInputAtivo && resultadosBusca.length > 0 && (
                <div className="space-y-2 mt-4">
                  {resultadosBusca.slice((buscaPage - 1) * buscaPageSize, buscaPage * buscaPageSize).map((item) => {
                    // Gerar key único baseado no tipo de item
                    const itemKey = item.is_carregamento
                      ? `carreg-${item.carregamento_id}`
                      : `venda-${item.id_gc}`;

                    // Determinar variante do badge baseado no tipo
                    const badgeVariant = item.is_carregamento ? "warning" : "info";

                    return (
                      <Card
                        key={itemKey}
                        clickable
                        onClick={() => handleSelecionarVenda(item)}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900">
                                {item.is_carregamento
                                  ? `Carregamento #${item.carregamento_id}`
                                  : `Contrato ${item.codigo}`} - {item.nome_cliente}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600">
                              {item.is_carregamento ? (
                                // Para carregamentos: mostrar apenas Placa, Tara e Motorista
                                <>
                                  {item.placa && `Placa: ${item.placa}`}
                                  {item.tara_total && ` | Tara: ${formatTonWithUnit((item.tara_total || 0) / 1000)}`}
                                  {item.motorista_nome && ` | Motorista: ${item.motorista_nome}`}
                                </>
                              ) : (
                                // Para vendas: mostrar produto
                                formatProdutoDisplay(item.produto_display)
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.data
                                ? new Date(item.data).toLocaleDateString("pt-BR")
                                : item.data_carregamento
                                  ? new Date(item.data_carregamento).toLocaleDateString("pt-BR")
                                  : "-"}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant={badgeVariant}>
                              {item.tag_label || (item.is_carregamento ? "Carregamento" : "Contrato")}
                            </Badge>
                            {/* Situação do contrato abaixo da tag (apenas para vendas) */}
                            {!item.is_carregamento && item.situacao && (
                              <Badge variant={getSituacaoBadgeVariant(item.situacao)} className="text-xs">
                                {item.situacao}
                              </Badge>
                            )}
                            {/* Status do carregamento abaixo da tag */}
                            {item.is_carregamento && (
                              <Badge variant={getStatusBadgeVariant(item.status_item)}>
                                {formatStatus(item.status_item)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                  {buscaTotal > buscaPageSize && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-700">
                        Mostrando {((buscaPage - 1) * buscaPageSize) + 1} a {Math.min(buscaPage * buscaPageSize, buscaTotal)} de {buscaTotal} resultados
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setBuscaPage(Math.max(1, buscaPage - 1))}
                          disabled={buscaPage === 1}
                        >
                          Anterior
                        </Button>
                        <span className="px-4 py-2 text-sm text-gray-700">
                          Página {buscaPage} de {Math.ceil(buscaTotal / buscaPageSize)}
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setBuscaPage(Math.min(Math.ceil(buscaTotal / buscaPageSize), buscaPage + 1))}
                          disabled={buscaPage >= Math.ceil(buscaTotal / buscaPageSize)}
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Painel de Pesagem */}
        {!mostrarLista && !mostrarBusca && (
          <Card title="Pesagem" className="bg-white">
          <div className="space-y-6">
            {/* Seletores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Select
                label="Quantidade de Eixos"
                options={opcoesEixos}
                value={qtdEixos}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setQtdEixos(newValue);
                  setFasePesagem("TARA");
                  // Limpar pesos quando mudar quantidade de eixos
                  setPesosEixos({});
                  setExcessoEixos({});
                }}
                disabled={fasePesagem === "FINAL" || (vendaSelecionada && (vendaSelecionada.status === "stand-by" || vendaSelecionada.status === "standby"))}
              />
              <Select
                label="Produto"
                options={produtos}
                value={produtoSelecionado}
                onChange={(e) => setProdutoSelecionado(e.target.value)}
                disabled={fasePesagem === "FINAL" || (vendaSelecionada && (vendaSelecionada.status === "stand-by" || vendaSelecionada.status === "standby"))}
              />
              <AutocompleteInput
                label="Placa"
                value={placaSelecionada}
                onChange={handlePlacaChange}
                onSearch={searchPlacas}
                placeholder="Digite para buscar placa (ex: ABC1234)"
                minChars={3}
                debounceMs={300}
                disabled={fasePesagem === "FINAL" || (vendaSelecionada && (vendaSelecionada.status === "stand-by" || vendaSelecionada.status === "standby"))}
              />
              <Select
                label="Transportadora"
                options={transportadoras}
                value={transportadoraSelecionada}
                onChange={(e) => setTransportadoraSelecionada(e.target.value)}
                disabled={fasePesagem === "FINAL" || (vendaSelecionada && (vendaSelecionada.status === "stand-by" || vendaSelecionada.status === "standby"))}
              />
              <Select
                label="Motorista"
                options={motoristas}
                value={motoristaSelecionado}
                onChange={(e) => setMotoristaSelecionado(e.target.value)}
                disabled={fasePesagem === "FINAL" || (vendaSelecionada && (vendaSelecionada.status === "stand-by" || vendaSelecionada.status === "standby"))}
              />
            </div>

            {/* Inputs de peso por eixo */}
            <div className={`space-y-4 ${fasePesagem === "TARA" ? "pesagem-tara p-4 rounded-lg" : fasePesagem === "FINAL" ? "pesagem-final p-4 rounded-lg" : ""}`}>
              <h3 className="text-lg font-semibold text-gray-900">
                Pesos por Eixo {fasePesagem === "TARA" && "(Tara)"} {fasePesagem === "FINAL" && "(Final)"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {(() => {
                  // Converter qtdEixos para número de forma mais robusta
                  let numEixos = 0;
                  if (qtdEixos) {
                    const parsed = parseInt(String(qtdEixos), 10);
                    numEixos = isNaN(parsed) ? 0 : parsed;
                  }
                  
                  // Validar se numEixos está entre 1 e 5
                  if (numEixos >= 1 && numEixos <= 5) {
                    // Gerar array de eixos de 1 até numEixos
                    const eixosArray = Array.from({ length: numEixos }, (_, i) => i + 1);
                    
                    return eixosArray.map((eixo) => {
                      // peso está em TON (string com vírgula)
                      const pesoAtual = pesosEixos[eixo] || "";
                      const excesso = excessoEixos[eixo] || 0;

                      // Lógica de desabilitar:
                      // - Se está em espera (standby): permitir edição apenas na fase FINAL (pesos finais)
                      // - Se não está em espera: permitir edição normalmente, exceto se já finalizou
                      const isStandby = vendaSelecionada && (vendaSelecionada.status === "stand-by" || vendaSelecionada.status === "standby");
                      const isDisabled = vendaSelecionada && vendaSelecionada.status === "finalizado"; // Não pode editar quando finalizado

                      // Converter limite de kg para TON para exibição
                      const limiteEixoTon = limiteEixo / 1000;

                      // Converter excesso de kg para TON
                      const excessoTon = excesso ? excesso / 1000 : undefined;

                      // Na fase FINAL de um carregamento standby, precisamos mostrar campos vazios
                      // para digitar o peso final, e a tara no tooltip
                      let pesoParaExibir = pesoAtual;
                      let taraInfo = "";

                      if (fasePesagem === "FINAL" && isStandby && vendaSelecionada.tara_eixos_kg) {
                        // Pegar tara do carregamento (vem em kg)
                        const taraEixoKg = vendaSelecionada.tara_eixos_kg[eixo] || vendaSelecionada.tara_eixos_kg[String(eixo)];
                        if (taraEixoKg) {
                          const taraEixoTon = (taraEixoKg / 1000).toFixed(3).replace('.', ',');
                          taraInfo = `Tara: ${taraEixoTon} TON`;
                        }
                      }

                      return (
                        <EixoInput
                          key={`eixo-${eixo}-${qtdEixos}-${fasePesagem}`}
                          label={`Eixo ${eixo} (TON)${taraInfo ? ` - ${taraInfo}` : ""}`}
                          eixoNumber={eixo}
                          peso={pesoParaExibir}
                          limiteEixo={limiteEixoTon}
                          excesso={excessoTon}
                          fasePesagem={fasePesagem}
                          onChange={(e) => {
                            // O valor vem formatado do EixoInput (com vírgula em TON)
                            // Armazenar diretamente em TON
                            const valorTonStr = e.target.value;
                            setPesosEixos((prev) => ({ ...prev, [eixo]: valorTonStr }));
                          }}
                          disabled={isDisabled}
                          showTooltip={true}
                        />
                      );
                    });
                  } else {
                    return (
                      <div className="col-span-full text-center text-gray-500 py-4">
                        Selecione a quantidade de eixos acima
                      </div>
                    );
                  }
                })()}
              </div>
            </div>

            {/* Totais */}
            <PesagemTotais
              items={[
                {
                  label: "Peso Total da Carga",
                  value: pesoTotal,
                  unit: "kg",
                  variant: pesoTotal > 0 ? "default" : "default",
                },
                {
                  label: "Peso Líquido da Carga",
                  value: pesoLiquido,
                  unit: "t",
                  variant: pesoLiquido > 48000 ? "danger" : pesoLiquido > 0 ? "success" : "default",
                  highlight: pesoLiquido > 48000,
                },
                {
                  label: `Limite máximo por eixo${permitirExcesso ? " (excesso permitido)" : ""}`,
                  value: limiteEixo,
                  unit: "kg",
                  variant: "default",
                },
              ]}
            />

            {/* Campos complementares */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Quantidade Desejada (ton)"
                type="number"
                value={qtdDesejada}
                onChange={(e) => setQtdDesejada(e.target.value)}
                disabled={fasePesagem === "FINAL" || (vendaSelecionada && (vendaSelecionada.status === "stand-by" || vendaSelecionada.status === "standby"))}
              />
              <Input
                label="Detalhes do Produto"
                value={detalhesProduto}
                onChange={(e) => setDetalhesProduto(e.target.value)}
                disabled={fasePesagem === "FINAL" || (vendaSelecionada && (vendaSelecionada.status === "stand-by" || vendaSelecionada.status === "standby"))}
              />
            </div>

            <Textarea
              label="Observações"
              rows={4}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
                        disabled={fasePesagem === "FINAL" || (vendaSelecionada && (vendaSelecionada.status === "stand-by" || vendaSelecionada.status === "standby"))}
            />

            {/* Botões de ação */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={handleStandBy}
                disabled={fasePesagem === "FINAL" || pesoTotal === 0}
              >
                Stand By
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowTicketModal(true)}
                disabled={fasePesagem !== "FINAL"}
              >
                Imprimir
              </Button>
              <Button
                onClick={handleConfirmar}
                disabled={fasePesagem === "TARA" || !isFinalValido}
              >
                Confirmar
              </Button>
              <Button variant="ghost" onClick={handleLimpar}>
                Limpar
              </Button>
            </div>
          </div>
        </Card>
        )}

        {/* Modal Split */}
        <Modal
          isOpen={showSplitModal}
          onClose={() => setShowSplitModal(false)}
          title="Divisão de Carga"
          variant="warning"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowSplitModal(false)}>
                Não
              </Button>
              <Button onClick={() => {
                setShowSplitModal(false);
                alert("Confirmar com split");
              }}>
                Sim
              </Button>
            </>
          }
        >
          <p className="text-gray-700">
            O Carregamento ultrapassou 48TON, gostaria de realizar a divisão da carga em 2 partes?
          </p>
        </Modal>

        {/* Modal Ticket */}
        <Modal
          isOpen={showTicketModal}
          onClose={() => setShowTicketModal(false)}
          title="Ticket de Impressão"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowTicketModal(false)}>
                Fechar
              </Button>
              <Button onClick={() => alert("Baixar ticket")}>
                Baixar
              </Button>
            </>
          }
        >
          <div className="bg-white p-4 border rounded">
            {ticketHtml ? (
              <div dangerouslySetInnerHTML={{ __html: ticketHtml }} />
            ) : (
              <p className="text-gray-700">Carregando ticket...</p>
            )}
          </div>
        </Modal>

        {/* Modal de Detalhes do Carregamento */}
        {showCarregamentoModal && selectedCarregamentoModal && (
          <Modal
            isOpen={showCarregamentoModal}
            onClose={() => {
              setShowCarregamentoModal(false);
              setSelectedCarregamentoModal(null);
            }}
            title={`Carregamento #${selectedCarregamentoModal.id}`}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Placa:</span>
                  <p className="text-base font-semibold text-gray-900">{selectedCarregamentoModal.placa}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Cliente:</span>
                  <p className="text-base font-semibold text-gray-900">{selectedCarregamentoModal.cliente_nome}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Produto:</span>
                  <p className="text-base font-semibold text-gray-900">{selectedCarregamentoModal.produto_nome || "-"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <div className="mt-1">
                    <Badge variant={getStatusBadgeVariant(selectedCarregamentoModal.status)}>
                      {formatStatus(selectedCarregamentoModal.status)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Líquido:</span>
                  <p className="text-base font-semibold text-gray-900">
                    {formatTonWithUnit(selectedCarregamentoModal.liquido_ton || (selectedCarregamentoModal.liquido_kg ? selectedCarregamentoModal.liquido_kg / 1000 : null))}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Data:</span>
                  <p className="text-base font-semibold text-gray-900">
                    {selectedCarregamentoModal.data_carregamento
                      ? (() => {
                          const date = new Date(selectedCarregamentoModal.data_carregamento);
                          if (isNaN(date.getTime())) {
                            return "-";
                          }
                          return date.toLocaleDateString("pt-BR");
                        })()
                      : "-"
                    }
                  </p>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCarregamentoModal(false);
                    setSelectedCarregamentoModal(null);
                  }}
                >
                  Fechar
                </Button>
                {selectedCarregamentoModal.status === "standby" && (
                  <Button
                    onClick={() => {
                      handleSelecionarVenda(selectedCarregamentoModal);
                      setShowCarregamentoModal(false);
                      setSelectedCarregamentoModal(null);
                      setMostrarLista(false);
                      setMostrarBusca(false);
                      setFasePesagem("FINAL");
                    }}
                  >
                    Pesar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => router.push(`/carregamentos/${selectedCarregamentoModal.id}`)}
                >
                  Ver Detalhes Completos
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}

