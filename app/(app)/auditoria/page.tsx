"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";

export default function AuditoriaPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetch("/api/logs")
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.error || `Erro HTTP: ${res.status}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        if (data.ok) {
          setData(data);
        } else {
          setError(data.error || "Erro ao carregar logs");
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar logs:", err);
        setError(err.message || "Erro ao carregar logs. Verifique se você tem permissão de administrador.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Auditoria</h1>
          <Card>
            <div className="p-6 text-center">
              <p className="text-red-600 font-semibold mb-2">Erro ao carregar auditoria</p>
              <p className="text-sm text-gray-600">{error}</p>
              <p className="text-xs text-gray-500 mt-4">
                Apenas administradores podem acessar esta página.
              </p>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Nenhum dado disponível</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Auditoria</h1>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ação
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usuário
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Detalhes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.items.map((log: any) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{log.data}</td>
                    <td className="px-4 py-3 text-sm">{log.acao}</td>
                    <td className="px-4 py-3 text-sm">{log.user.name}</td>
                    <td className="px-4 py-3 text-sm">{log.detalhes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

