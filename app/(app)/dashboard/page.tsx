"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DateInput } from "@/components/ui/DateInput";
import { todayISO } from "@/lib/utils/dates";
import { formatStatus } from "@/lib/utils/status";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [date, setDate] = useState(todayISO());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Limpar dados anteriores para mostrar loading
    setData(null);
    
    fetch(`/api/dashboard?date=${date}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.ok) {
          console.log("Dashboard data recebida:", data);
          console.log("KPIs:", data.kpis);
          // Garantir que os KPIs existem
          if (!data.kpis) {
            console.warn("KPIs não encontrados na resposta, usando valores padrão");
            data.kpis = { total: 0, standby: 0, finalizado: 0, cancelado: 0 };
          }
          setData(data);
        } else {
          console.error("Erro ao carregar dashboard:", data);
          // Mesmo com erro, definir valores padrão para não quebrar a UI
          setData({ ok: false, kpis: { total: 0, standby: 0, finalizado: 0, cancelado: 0 } });
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar dashboard:", error);
        setData({ ok: false, kpis: { total: 0, standby: 0, finalizado: 0, cancelado: 0 } });
      })
      .finally(() => setLoading(false));
  }, [date]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </AppShell>
    );
  }

  // Garantir que KPIs sempre existam, mesmo sem dados
  const kpis = data?.kpis || {
    total: 0,
    standby: 0,
    finalizado: 0,
    cancelado: 0,
  };
  const integracoes = data?.integracoes || {
    pendentes: 0,
    erros: 0,
  };
  const ultimosLogs = data?.ultimosLogs || [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Início</h1>
            <p className="text-gray-600 mt-1">{formatDate(date)}</p>
          </div>
          <DateInput
            value={date}
            onChange={setDate}
          />
        </div>

        <Card title="Novo Carregamento" className="bg-white border-blue-200">
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Utilize esta área para realizar novos carregamentos. Preencha os dados do caminhão,
              cliente e produto para iniciar o processo de pesagem.
            </p>
            <Button
              onClick={() => router.push("/pesagem")}
              className="w-full sm:w-auto"
            >
              Criar Novo Carregamento
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Total
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {kpis.total}
                </p>
              </div>
              <div className="text-4xl opacity-20">📊</div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-amber-500 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Em Espera
                </p>
                <p className="text-3xl font-bold text-amber-700 mt-2">
                  {kpis.standby}
                </p>
              </div>
              <div className="text-4xl opacity-20">⏳</div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Finalizados
                </p>
                <p className="text-3xl font-bold text-emerald-700 mt-2">
                  {kpis.finalizado}
                </p>
              </div>
              <div className="text-4xl opacity-20">✅</div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-red-500 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Cancelados
                </p>
                <p className="text-3xl font-bold text-red-700 mt-2">
                  {kpis.cancelado}
                </p>
              </div>
              <div className="text-4xl opacity-20">❌</div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Status de Integrações" className="bg-white">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-amber-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="font-medium text-gray-800">Pendentes</span>
                </div>
                <span className="text-2xl font-bold text-amber-700">
                  {integracoes.pendentes}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-gray-800">Erros</span>
                </div>
                <span className="text-2xl font-bold text-red-700">
                  {integracoes.erros}
                </span>
              </div>
              {(integracoes.pendentes > 0 || integracoes.erros > 0) && (
                <div className="mt-4 p-3 bg-white border border-yellow-300 rounded-lg">
                  <p className="text-sm text-gray-800">
                    ⚠️ Atenção: Existem integrações que precisam de atenção
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card title="Últimos Logs" className="bg-white">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {ultimosLogs.length === 0 ? (
                <p className="text-gray-700 text-center py-4">
                  Nenhum log registrado hoje
                </p>
              ) : (
                ultimosLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {log.acao.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </p>
                        {log.detalhes && (
                          <p className="text-xs text-gray-700 mt-1">{log.detalhes}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-gray-600">
                            {log.user?.name || "Sistema"}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-600">
                            {new Date(log.data).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

