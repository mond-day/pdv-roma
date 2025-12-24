"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { formatStatus, getStatusBadgeVariant } from "@/lib/utils/status";
import { formatTon, formatTonWithUnit, gramasToTon, parseTon } from "@/lib/utils/weight";

export default function CarregamentoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [cancelMotivo, setCancelMotivo] = useState("");
  const [pesos, setPesos] = useState({
    bruto_ton: "",
    liquido_ton: "",
  });

  useEffect(() => {
    fetch(`/api/carregamentos/${params.id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erro HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.ok) {
          setData(data.item);
        } else {
          console.error("Erro ao carregar carregamento:", data);
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar carregamento:", error);
      });
  }, [params.id]);

  const handleFinalizar = async () => {
    if (!data) return;

    const brutoTon = parseTon(pesos.bruto_ton);
    const taraTon = data.tara_ton || (data.tara_total ? gramasToTon(data.tara_total) : null);
    const liquidoTon = brutoTon && taraTon ? (brutoTon - taraTon) : null;

    if (!brutoTon || brutoTon <= 0) {
      alert("Por favor, preencha o peso bruto");
      return;
    }
    
    if (!liquidoTon || liquidoTon <= 0) {
      alert("O peso líquido deve ser maior que zero. Verifique o peso bruto e a tara.");
      return;
    }

    const idempotencyKey = `finalizar-${data.id}-${Date.now()}`;
    const payload = {
      idempotency_key: idempotencyKey,
      timestamp: new Date().toISOString(),
      bruto_kg: brutoTon, // Na verdade é TON
      liquido_kg: liquidoTon, // Na verdade é TON
      final_eixos_kg: [],
    };

    const res = await fetch(`/api/carregamentos/${params.id}/finalizar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setShowFinalizarModal(false);
      router.refresh();
      window.location.reload();
    } else {
      const error = await res.json();
      alert(error.message || "Erro ao finalizar carregamento");
    }
  };

  const handleCancelar = async () => {
    if (!cancelMotivo || cancelMotivo.length < 3) return;

    const res = await fetch(`/api/carregamentos/${params.id}/cancelar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        motivo: cancelMotivo,
        request_id: `cancel-${params.id}-${Date.now()}`,
      }),
    });

    if (res.ok) {
      setShowCancelModal(false);
      router.refresh();
      window.location.reload();
    }
  };

  if (!data) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando carregamento...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Carregamento #{data.id}</h1>
          <Button variant="ghost" onClick={() => router.back()}>
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Identificação">
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">Placa:</span>
                <div className="text-base font-semibold text-gray-900">{data.placa}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">Cliente:</span>
                <div className="text-base font-semibold text-gray-900">{data.cliente_nome}</div>
              </div>
              {data.contrato_codigo && (
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-1">Contrato:</span>
                  <div className="text-base font-semibold text-gray-900">{data.contrato_codigo}</div>
                </div>
              )}
              {data.produto_nome && (
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-1">Produto:</span>
                  <div className="text-base font-semibold text-gray-900">{data.produto_nome}</div>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">Status:</span>
                <div>
                  <Badge variant={getStatusBadgeVariant(data.status)}>
                    {formatStatus(data.status)}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Pesos">
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">Tara:</span>
                <div className="text-base font-semibold text-gray-900">
                  {formatTonWithUnit(data.tara_ton || (data.tara_total ? gramasToTon(data.tara_total) : null))}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">Bruto:</span>
                <div className="text-base font-semibold text-gray-900">
                  {formatTonWithUnit(data.bruto_ton || (data.peso_final_total ? gramasToTon(data.peso_final_total) : null))}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">Líquido:</span>
                <div className="text-base font-semibold text-gray-900">
                  {formatTonWithUnit(data.liquido_ton || (data.liquido_kg ? data.liquido_kg / 1000 : null))}
                </div>
              </div>
              {data.qtd_desejada_ton && (
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-1">Quantidade Desejada:</span>
                  <div className="text-base font-semibold text-gray-900">
                    {data.qtd_desejada_ton} ton
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {data.integracao && (
          <Card title="Integração" className="bg-white">
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">Status:</span>
                <Badge
                  variant={
                    data.integracao.status === "enviado"
                      ? "success"
                      : data.integracao.status === "erro"
                      ? "danger"
                      : "warning"
                  }
                >
                  {data.integracao.status}
                </Badge>
              </div>
              {data.integracao.ultima_mensagem && (
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-1">Última mensagem:</span>
                  <div className="text-sm text-gray-800">{data.integracao.ultima_mensagem}</div>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">Tentativas:</span>
                <div className="text-base font-semibold text-gray-900">{data.integracao.tentativas}/5</div>
              </div>
            </div>
          </Card>
        )}

        {data.status === "standby" && (
          <Card title="Finalizar Carregamento" className="bg-blue-50 border-blue-200">
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Preencha os pesos da 2ª pesagem para finalizar o carregamento.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Peso Bruto (TON)"
                  type="text"
                  value={pesos.bruto_ton}
                  onChange={(e) => {
                    const bruto = e.target.value;
                    const taraTon = data.tara_ton || (data.tara_total ? gramasToTon(data.tara_total) : null);
                    const brutoTon = parseTon(bruto);
                    const liquido = brutoTon && taraTon ? formatTon(brutoTon - taraTon) : "";
                    setPesos({ bruto_ton: bruto, liquido_ton: liquido });
                  }}
                  placeholder="Ex: 25,500"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso Líquido (TON)
                  </label>
                  <input
                    type="text"
                    value={pesos.liquido_ton}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 cursor-not-allowed"
                    placeholder="Calculado automaticamente"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Calculado automaticamente: Bruto - Tara
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button onClick={() => setShowFinalizarModal(true)}>
                  Finalizar Carregamento
                </Button>
                <Button variant="danger" onClick={() => setShowCancelModal(true)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {data.status !== "standby" && (
          <Card>
            <div className="flex space-x-4">
              {(data.status === "finalizado") && (
                <Button variant="danger" onClick={() => setShowCancelModal(true)}>
                  Cancelar
                </Button>
              )}
            </div>
          </Card>
        )}

        <Modal
          isOpen={showFinalizarModal}
          onClose={() => setShowFinalizarModal(false)}
          title="Confirmar Finalização"
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowFinalizarModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleFinalizar}>
                Confirmar Finalização
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Confirme os dados antes de finalizar o carregamento:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Peso Bruto:</span>
                <span className="text-sm font-semibold text-gray-900">{formatTonWithUnit(parseTon(pesos.bruto_ton))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Peso Líquido:</span>
                <span className="text-sm font-semibold text-gray-900">{formatTonWithUnit(parseTon(pesos.liquido_ton))}</span>
              </div>
              {(data.tara_ton || (data.tara_total ? gramasToTon(data.tara_total) : null)) && (
                <div className="flex justify-between text-xs text-gray-600 pt-2 border-t">
                  <span>Tara:</span>
                  <span>{formatTonWithUnit(data.tara_ton || (data.tara_total ? gramasToTon(data.tara_total) : null))}</span>
                </div>
              )}
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancelar Carregamento"
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowCancelModal(false)}>
                Fechar
              </Button>
              <Button variant="danger" onClick={handleCancelar}>
                Confirmar Cancelamento
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Informe o motivo do cancelamento (mínimo 3 caracteres):
            </p>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
              placeholder="Motivo do cancelamento..."
              value={cancelMotivo}
              onChange={(e) => setCancelMotivo(e.target.value)}
            />
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}


