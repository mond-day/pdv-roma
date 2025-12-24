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
import { formatStatus, getStatusBadgeVariant } from "@/lib/utils/status";

type FasePesagem = "TARA" | "FINAL" | null;

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

  // Opções para selects
  const opcoesEixos = [
    { value: "1", label: "1 Eixo" },
    { value: "2", label: "2 Eixos" },
    { value: "3", label: "3 Eixos" },
    { value: "4", label: "4 Eixos" },
    { value: "5", label: "5 Eixos" },
  ];

  const produtos = [
    { value: "1", label: "Produto A" },
    { value: "2", label: "Produto B" },
  ];

  const placas = [
    { value: "ABC-1234", label: "ABC-1234" },
    { value: "XYZ-5678", label: "XYZ-5678" },
  ];

  const motoristas = [
    { value: "1", label: "Motorista 1" },
    { value: "2", label: "Motorista 2" },
  ];

  const transportadoras = [
    { value: "1", label: "Transportadora 1" },
    { value: "2", label: "Transportadora 2" },
  ];

  useEffect(() => {
    // Calcular totais quando pesos mudarem
    const total = Object.values(pesosEixos).reduce((acc, peso) => {
      // Converter vírgula para ponto
      const num = parseFloat(String(peso).replace(',', '.')) || 0;
      return acc + num;
    }, 0);
    setPesoTotal(total);
    
    // Se está na fase TARA, atualizar tara_kg
    if (fasePesagem === "TARA" && total > 0) {
      setTaraKg(total);
    }
    
    // Calcular líquido
    const tara = taraKg || calcularTara();
    setPesoLiquido(tara > 0 ? total - tara : 0);

    // Calcular excessos
    const novosExcessos: Record<number, number> = {};
    Object.entries(pesosEixos).forEach(([eixo, peso]) => {
      // Converter vírgula para ponto
      const pesoNum = parseFloat(String(peso).replace(',', '.')) || 0;
      const excesso = pesoNum - limiteEixo;
      if (excesso > 0) {
        novosExcessos[parseInt(eixo)] = excesso;
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

  const calcularTara = useCallback(() => {
    const taraEixosArray = Object.keys(pesosEixos)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((key) => parseFloat(String(pesosEixos[parseInt(key)]).replace(',', '.')) || 0);
    return taraEixosArray.reduce((acc, peso) => acc + peso, 0);
  }, [pesosEixos]);

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

    // Converter tara de kg para TON
    const taraTotalTon = (taraTotal || (taraKg || 0)) / 1000;
    
    // Converter tara_eixos de objeto para array JSONB
    const taraEixosArray = Object.keys(pesosEixos)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((key) => parseFloat(String(pesosEixos[parseInt(key)]).replace(',', '.')) || 0);

    // Criar carregamento em stand-by
    const response = await fetch("/api/carregamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        venda_id: vendaSelecionada.id_gc || vendaSelecionada.id,
        placa: placaSelecionada,
        detalhes_produto: produtos.find((p) => p.value === produtoSelecionado)?.label || detalhesProduto,
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
      const response = await fetch(`/api/carregamentos/${vendaSelecionada.id}/finalizar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotency_key: idempotencyKey,
          timestamp: new Date().toISOString(),
          bruto_kg: pesoTotal,
          liquido_kg: pesoLiquido,
          final_eixos_kg: Object.keys(pesosEixos)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map((key) => parseFloat(pesosEixos[parseInt(key)]) || 0),
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
    if (item.is_carregamento) {
      // É um CARREGAMENTO em andamento - carregar dados completos
      console.log("Carregamento selecionado, ID:", item.carregamento_id);

      try {
        const response = await fetch(`/api/carregamentos/${item.carregamento_id}`);
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
          if (carregamento.qtd_desejada) setQtdDesejada(carregamento.qtd_desejada);
          if (carregamento.detalhes_produto) setDetalhesProduto(carregamento.detalhes_produto);
          if (carregamento.observacoes) setObservacoes(carregamento.observacoes);

          // Definir quantidade de eixos
          if (carregamento.eixos) {
            setQtdEixos(String(carregamento.eixos));
          }

          // Preencher pesos de tara (já existentes)
          if (carregamento.tara_eixos_kg && typeof carregamento.tara_eixos_kg === 'object') {
            const taraEixos: Record<number, string> = {};
            Object.keys(carregamento.tara_eixos_kg).forEach((key) => {
              const eixoNum = parseInt(key);
              if (!isNaN(eixoNum)) {
                taraEixos[eixoNum] = String(carregamento.tara_eixos_kg[key]);
              }
            });
            setPesosEixos(taraEixos);
          }

          // Se já tem peso final, preencher (caso tenha sido parcialmente pesado)
          if (carregamento.final_eixos_kg && typeof carregamento.final_eixos_kg === 'object') {
            const finalEixos: Record<number, string> = {};
            Object.keys(carregamento.final_eixos_kg).forEach((key) => {
              const eixoNum = parseInt(key);
              if (!isNaN(eixoNum)) {
                finalEixos[eixoNum] = String(carregamento.final_eixos_kg[key]);
              }
            });
            setPesosEixos(finalEixos);
          }

          // Definir tara_kg
          if (carregamento.tara_total) {
            setTaraKg(carregamento.tara_total);
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
      setDetalhesProduto("");
      setObservacoes("");
      setTaraKg(null);

      // Preencher apenas dados básicos da venda (se disponíveis)
      // Produto pode vir preenchido
      if (item.produto_display) {
        setDetalhesProduto(item.produto_display);
      }
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
                      Líquido (kg)
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
                          {item.liquido_kg ? `${item.liquido_kg} kg` : "-"}
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
                    label="Buscar"
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
                              {item.produto_display || "Sem produto"}
                              {item.placa && ` | Placa: ${item.placa}`}
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
              <Select
                label="Placa"
                options={placas}
                value={placaSelecionada}
                onChange={(e) => setPlacaSelecionada(e.target.value)}
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
                      const peso = pesosEixos[eixo] || "";
                      const excesso = excessoEixos[eixo] || 0;
                      
                      // Lógica de desabilitar:
                      // - Se está em espera (standby): permitir edição apenas na fase FINAL (pesos finais)
                      // - Se não está em espera: permitir edição normalmente, exceto se já finalizou
                      const isStandby = vendaSelecionada && (vendaSelecionada.status === "stand-by" || vendaSelecionada.status === "standby");
                      const isDisabled = isStandby 
                        ? fasePesagem !== "FINAL" // Em espera: só pode editar na fase FINAL
                        : vendaSelecionada && vendaSelecionada.status === "finalizado"; // Não em espera: não pode editar quando finalizado
                      
                      // Converter peso de kg (armazenado) para TON (exibição)
                      // peso está em kg como string numérica
                      const pesoKg = parseFloat(String(peso)) || 0;
                      const pesoEmTon = pesoKg > 0 ? (pesoKg / 1000).toFixed(3).replace('.', ',') : "";
                      
                      // Converter limite de kg para TON para exibição
                      const limiteEixoTon = limiteEixo / 1000;
                      
                      // Converter excesso de kg para TON
                      const excessoTon = excesso ? excesso / 1000 : undefined;
                      
                      return (
                        <EixoInput
                          key={`eixo-${eixo}-${qtdEixos}-${fasePesagem}`}
                          label={`Eixo ${eixo} (TON)`}
                          eixoNumber={eixo}
                          peso={pesoEmTon}
                          limiteEixo={limiteEixoTon}
                          excesso={excessoTon}
                          onChange={(e) => {
                            // O valor já vem formatado do EixoInput (com vírgula)
                            // Converter TON (entrada do usuário) para kg (armazenamento)
                            const valorTonStr = e.target.value;
                            const valorTon = parseFloat(valorTonStr.replace(',', '.')) || 0;
                            const valorKg = Math.round(valorTon * 1000); // Converter para kg e arredondar
                            setPesosEixos({ ...pesosEixos, [eixo]: String(valorKg) });
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
                    {selectedCarregamentoModal.liquido_kg ? `${selectedCarregamentoModal.liquido_kg} kg` : "-"}
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

