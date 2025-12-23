"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function NotificationsWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = () => {
      fetch("/api/notificacoes?status=abertas&pageSize=10")
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            setNotifications(data.items);
            setCount(data.total);
          }
        })
        .catch(() => {});
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Auto-refresh a cada 10s

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarcarLida = async (id: string) => {
    await fetch(`/api/notificacoes/${id}/lida`, { method: "POST" });
    // Atualizar lista
    fetch("/api/notificacoes?status=abertas&pageSize=10")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setNotifications(data.items);
          setCount(data.total);
        }
      });
  };

  const getTipoBadge = (tipo: string) => {
    const variants: Record<string, "success" | "warning" | "danger" | "info"> = {
      integracao: "info",
      sistema: "warning",
      aviso: "success",
    };
    return <Badge variant={variants[tipo] || "default"}>{tipo}</Badge>;
  };

  return (
    <div className="relative" ref={widgetRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Notificações"
      >
        <span className="text-2xl">🔔</span>
        {count > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-full ml-2 top-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                router.push("/notificacoes");
              }}
            >
              Ver todas
            </Button>
          </div>
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                      !item.lida ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900">{item.titulo}</h4>
                          {getTipoBadge(item.tipo)}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{item.mensagem}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(item.created_at).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      {!item.lida && (
                        <button
                          onClick={() => handleMarcarLida(item.id)}
                          className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                        >
                          ✓
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


