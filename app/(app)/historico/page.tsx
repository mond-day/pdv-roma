"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FilterBar } from "@/components/ui/FilterBar";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { todayISO } from "@/lib/utils/dates";
import { formatStatus, getStatusBadgeVariant } from "@/lib/utils/status";
import { formatTon, formatTonWithUnit } from "@/lib/utils/weight";
import { Modal } from "@/components/ui/Modal";

export default function HistoricoPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCarregamento, setSelectedCarregamento] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    dateInicio: todayISO(),
    dateFim: todayISO(),
    status: "",
    cliente: "",
    transportadora: "",
    motorista: "",
    placa: "",
    contrato: "",
    page: 1,
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const loadData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      date: appliedFilters.dateInicio || todayISO(),
      dateFim: appliedFilters.dateFim || todayISO(),
      page: appliedFilters.page.toString(),
      pageSize: "50",
      ...(appliedFilters.status && { status: appliedFilters.status }),
      ...(appliedFilters.cliente && { cliente: appliedFilters.cliente }),
      ...(appliedFilters.transportadora && { transportadora: appliedFilters.transportadora }),
      ...(appliedFilters.motorista && { motorista: appliedFilters.motorista }),
      ...(appliedFilters.placa && { placa: appliedFilters.placa }),
      ...(appliedFilters.contrato && { contrato: appliedFilters.contrato }),
    });

    console.log("HistoricoPage - Fetching with params:", params.toString());
    fetch(`/api/historico?${params}`)
      .then(async (res) => {
        console.log("HistoricoPage - Response status:", res.status);
        if (!res.ok) {
          const errorText = await res.text();
          console.error("HistoricoPage - Response not ok:", res.status, errorText);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("HistoricoPage - Response:", data);
        if (data.ok) {
          setData(data);
        } else {
          console.error("HistoricoPage - Response not ok:", data);
          // Mesmo se não estiver ok, definir data vazia para não ficar em loading
          setData({ ok: true, items: [], total: 0, page: 1, pageSize: 50 });
        }
      })
      .catch((error) => {
        console.error("HistoricoPage - Fetch error:", error);
        // Em caso de erro, definir data vazia para não ficar em loading
        setData({ ok: true, items: [], total: 0, page: 1, pageSize: 50 });
      })
      .finally(() => {
        setLoading(false);
        console.log("HistoricoPage - Loading set to false");
      });
  }, [appliedFilters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusBadge = (status: string) => {
    return <Badge variant={getStatusBadgeVariant(status)}>{formatStatus(status)}</Badge>;
  };

  const getIntegracaoBadge = (status: string | null) => {
    if (!status) return <Badge variant="default">N/A</Badge>;
    const variants: Record<string, "success" | "warning" | "danger"> = {
      enviado: "success",
      pendente: "warning",
      erro: "danger",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };


  // Funções de autocomplete - memoizadas para evitar re-renders
  // Não usar filtro de data para buscar em todo o histórico
  const searchClientes = useCallback(async (query: string): Promise<string[]> => {
    try {
      const res = await fetch(`/api/historico?cliente=${encodeURIComponent(query)}&pageSize=50`);
      const data = await res.json();
      if (data.ok && data.items) {
        const clientes: string[] = [...new Set(data.items.map((item: any) => item.cliente_nome).filter(Boolean))] as string[];
        return clientes.slice(0, 10);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
    return [];
  }, []);

  const searchPlacas = useCallback(async (query: string): Promise<string[]> => {
    try {
      const res = await fetch(`/api/historico?placa=${encodeURIComponent(query)}&pageSize=50`);
      const data = await res.json();
      if (data.ok && data.items) {
        const placas: string[] = [...new Set(data.items.map((item: any) => item.placa).filter(Boolean))] as string[];
        return placas.slice(0, 10);
      }
    } catch (error) {
      console.error("Erro ao buscar placas:", error);
    }
    return [];
  }, []);

  const searchTransportadoras = useCallback(async (query: string): Promise<string[]> => {
    try {
      const res = await fetch(`/api/historico?transportadora=${encodeURIComponent(query)}&pageSize=50`);
      const data = await res.json();
      if (data.ok && data.items) {
        return [...new Set(data.items.map((item: any) => item.transportadora_nome || "").filter(Boolean))].slice(0, 10) as string[];
      }
    } catch (error) {
      console.error("Erro ao buscar transportadoras:", error);
    }
    return [];
  }, []);

  const searchMotoristas = useCallback(async (query: string): Promise<string[]> => {
    try {
      const res = await fetch(`/api/historico?motorista=${encodeURIComponent(query)}&pageSize=50`);
      const data = await res.json();
      if (data.ok && data.items) {
        return [...new Set(data.items.map((item: any) => item.motorista_nome || "").filter(Boolean))].slice(0, 10) as string[];
      }
    } catch (error) {
      console.error("Erro ao buscar motoristas:", error);
    }
    return [];
  }, []);

  const handleSearch = useCallback(() => {
    setAppliedFilters((prev) => {
      // Só atualizar se realmente mudou
      const newFilters = { ...prev, ...filters, page: 1 };
      const hasChanged = Object.keys(newFilters).some(
        (key) => newFilters[key as keyof typeof newFilters] !== prev[key as keyof typeof prev]
      );
      return hasChanged ? newFilters : prev;
    });
  }, [filters]);

  // Handlers para FilterBar - definidos no corpo do componente
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const handleFilterChangeRange = useCallback((key: string, valueInicio: string, valueFim: string) => {
    setFilters((prev) => ({ ...prev, dateInicio: valueInicio, dateFim: valueFim, page: 1 }));
  }, []);

  const handleReset = useCallback(() => {
    const resetFilters = {
      dateInicio: todayISO(),
      dateFim: todayISO(),
      status: "",
      cliente: "",
      transportadora: "",
      motorista: "",
      placa: "",
      contrato: "",
      page: 1,
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  }, []);

  // Memoizar os filtros para evitar recriação desnecessária
  const filterBarFilters = useMemo(() => [
    {
      key: "date",
      label: "Período",
      value: filters.dateInicio,
      valueFim: filters.dateFim,
      type: "daterange" as const,
    },
    {
      key: "status",
      label: "Status",
      value: filters.status,
      type: "select" as const,
      options: [
        { value: "standby", label: "Em Espera" },
        { value: "finalizado", label: "Finalizado" },
        { value: "cancelado", label: "Cancelado" },
      ],
    },
    {
      key: "cliente",
      label: "Cliente",
      value: filters.cliente,
      type: "autocomplete" as const,
      onSearch: searchClientes,
    },
    {
      key: "transportadora",
      label: "Transportadora",
      value: filters.transportadora,
      type: "autocomplete" as const,
      onSearch: searchTransportadoras,
    },
    {
      key: "motorista",
      label: "Motorista",
      value: filters.motorista,
      type: "autocomplete" as const,
      onSearch: searchMotoristas,
    },
    {
      key: "placa",
      label: "Placa",
      value: filters.placa,
      type: "autocomplete" as const,
      onSearch: searchPlacas,
    },
    {
      key: "contrato",
      label: "Contrato",
      value: filters.contrato,
      type: "text" as const,
    },
  ], [filters, searchClientes, searchPlacas, searchTransportadoras, searchMotoristas]);

  if (loading && !data) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Histórico</h1>
            <p className="text-gray-600 mt-1">
              Consulta e auditoria operacional de carregamentos
            </p>
          </div>
        </div>

        <Card className="bg-white">
          <FilterBar
            filters={filterBarFilters}
            onFilterChange={handleFilterChange}
            onFilterChangeRange={handleFilterChangeRange}
            onReset={handleReset}
            onApply={handleSearch}
            isLoading={loading}
          />
        </Card>

        <Card>
          <div className="table-responsive">
            {loading && !data ? (
              <SkeletonTable rows={5} cols={8} className="p-4" />
            ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Placa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Motorista
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Líquido (TON)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      Carregando...
                    </td>
                  </tr>
                ) : !data || !data.items || data.items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      Nenhum carregamento encontrado com os filtros aplicados
                    </td>
                  </tr>
                ) : (
                  data.items.map((item: any) => {
                    // Normalizar status para comparação
                    const statusNormalizado = (item.status || "").toLowerCase().trim();
                    const podeCancelar = (statusNormalizado === "stand-by" || statusNormalizado === "standby" || statusNormalizado === "finalizado") && statusNormalizado !== "cancelado";

                    return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.data_carregamento).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.placa}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.cliente_nome}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.produto_nome || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.motorista_nome || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {item.status === 'finalizado' && (item.liquido_ton || item.liquido_kg)
                          ? formatTon(item.liquido_ton || (item.liquido_kg ? item.liquido_kg / 1000 : null))
                          : "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            const res = await fetch(`/api/carregamentos/${item.id}`);
                            const data = await res.json();
                            if (data.ok) {
                              setSelectedCarregamento(data.item);
                              setShowDetailModal(true);
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
                                      loadData();
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
            )}
          </div>
          {data && data.total > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-700">
                Mostrando {((filters.page - 1) * 50) + 1} a{" "}
                {Math.min(filters.page * 50, data.total)} de {data.total} resultados
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAppliedFilters({ ...appliedFilters, page: appliedFilters.page - 1 })}
                  disabled={appliedFilters.page === 1}
                >
                  Anterior
                </Button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Página {appliedFilters.page} de {Math.ceil(data.total / 50)}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAppliedFilters({ ...appliedFilters, page: appliedFilters.page + 1 })}
                  disabled={appliedFilters.page >= Math.ceil(data.total / 50)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Modal de Detalhes */}
        {showDetailModal && selectedCarregamento && (
          <Modal
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedCarregamento(null);
            }}
            title={`Carregamento #${selectedCarregamento.id}`}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Placa:</span>
                  <p className="text-base font-semibold text-gray-900">{selectedCarregamento.placa}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Cliente:</span>
                  <p className="text-base font-semibold text-gray-900">{selectedCarregamento.cliente_nome}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Produto:</span>
                  <p className="text-base font-semibold text-gray-900">{selectedCarregamento.produto_nome || "-"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedCarregamento.status)}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Líquido:</span>
                  <p className="text-base font-semibold text-gray-900">
                    {formatTon(selectedCarregamento.liquido_ton || (selectedCarregamento.liquido_kg ? selectedCarregamento.liquido_kg / 1000 : null))}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Data:</span>
                  <p className="text-base font-semibold text-gray-900">
                    {selectedCarregamento.data_carregamento 
                      ? (() => {
                          try {
                            const date = new Date(selectedCarregamento.data_carregamento);
                            if (isNaN(date.getTime())) {
                              return selectedCarregamento.data_carregamento;
                            }
                            return date.toLocaleDateString("pt-BR");
                          } catch {
                            return selectedCarregamento.data_carregamento;
                          }
                        })()
                      : "-"}
                  </p>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/carregamentos/${selectedCarregamento.id}`)}
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

