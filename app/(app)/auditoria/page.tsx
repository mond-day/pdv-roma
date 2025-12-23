"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";

export default function AuditoriaPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/logs")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setData(data);
        }
      });
  }, []);

  if (!data) {
    return (
      <AppShell>
        <div>Carregando...</div>
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

