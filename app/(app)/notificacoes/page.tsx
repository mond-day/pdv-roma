"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function NotificacoesPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/notificacoes?status=abertas")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setData(data);
        }
      });
  }, []);

  const handleMarcarLida = async (id: string) => {
    await fetch(`/api/notificacoes/${id}/lida`, { method: "POST" });
    window.location.reload();
  };

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
        <h1 className="text-2xl font-bold">Notificações</h1>

        <Card>
          <div className="space-y-4">
            {data.items.map((item: any) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg ${!item.lida ? "bg-blue-50" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{item.titulo}</h3>
                      <Badge variant={item.tipo === "erro" ? "danger" : "info"}>
                        {item.tipo}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{item.mensagem}</p>
                    <p className="text-xs text-gray-500 mt-2">{item.created_at}</p>
                  </div>
                  {!item.lida && (
                    <button
                      onClick={() => handleMarcarLida(item.id)}
                      className="ml-4 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Marcar como lida
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

