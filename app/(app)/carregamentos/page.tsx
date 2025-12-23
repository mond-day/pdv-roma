"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { todayISO } from "@/lib/utils/dates";

export default function CarregamentosPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [filters, setFilters] = useState({
    date: todayISO(),
    status: "",
    cliente: "",
    placa: "",
  });

  useEffect(() => {
    // Calcular data de 7 dias atrás para mostrar últimos carregamentos
    const hoje = new Date(filters.date);
    const data7DiasAtras = new Date(hoje);
    data7DiasAtras.setDate(data7DiasAtras.getDate() - 7);
    const ano7 = data7DiasAtras.getFullYear();
    const mes7 = String(data7DiasAtras.getMonth() + 1).padStart(2, '0');
    const dia7 = String(data7DiasAtras.getDate()).padStart(2, '0');
    const data7DiasAtrasFormatada = `${ano7}-${mes7}-${dia7}`;

    const params = new URLSearchParams({
      date: data7DiasAtrasFormatada,
      dateFim: filters.date,
      ...(filters.status && { status: filters.status }),
      ...(filters.cliente && { cliente: filters.cliente }),
      ...(filters.placa && { placa: filters.placa }),
    });

    fetch(`/api/carregamentos?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setData(data);
        }
      });
  }, [filters]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "danger"> = {
      finalizado: "success",
      standby: "warning",
      cancelado: "danger",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (!data) {
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Carregamentos</h1>
          <p className="text-gray-600 mt-1">Operação e consulta de carregamentos</p>
        </div>

        <Card className="bg-white">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DateInput
                label="Data"
                value={filters.date}
                onChange={(value) => setFilters({ ...filters, date: value })}
              />
              <Input
                label="Cliente"
                value={filters.cliente}
                onChange={(e) => setFilters({ ...filters, cliente: e.target.value })}
                placeholder="Buscar por cliente..."
              />
              <Input
                label="Placa"
                value={filters.placa}
                onChange={(e) => setFilters({ ...filters, placa: e.target.value })}
                placeholder="Ex: ABC-1234"
              />
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">Todos os status</option>
                  <option value="standby">Standby</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Placa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Líquido (kg)
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
                {data.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Nenhum carregamento encontrado
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
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {item.liquido_kg ? `${item.liquido_kg} kg` : "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/carregamentos/${item.id}`)}
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
                                      // Recarregar os dados
                                      const params = new URLSearchParams({
                                        date: filters.date,
                                        ...(filters.status && { status: filters.status }),
                                        ...(filters.cliente && { cliente: filters.cliente }),
                                        ...(filters.placa && { placa: filters.placa }),
                                      });
                                      fetch(`/api/carregamentos?${params}`)
                                        .then((res) => res.json())
                                        .then((data) => {
                                          if (data.ok) {
                                            setData(data);
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
          {data.total > 0 && (
            <div className="mt-4 text-sm text-gray-700 border-t border-gray-200 pt-4">
              Total: <span className="font-semibold">{data.total}</span> | Página{" "}
              <span className="font-semibold">{data.page}</span> de{" "}
              <span className="font-semibold">{Math.ceil(data.total / data.pageSize)}</span>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

