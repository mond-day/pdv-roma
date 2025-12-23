"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { Button } from "@/components/ui/Button";
import { todayISO } from "@/lib/utils/dates";

export default function RelatoriosPage() {
  const [de, setDe] = useState(todayISO());
  const [ate, setAte] = useState(todayISO());
  const [groupBy, setGroupBy] = useState("cliente");
  const [data, setData] = useState<any>(null);

  const handleGerar = () => {
    fetch(`/api/relatorios?de=${de}&ate=${ate}&groupBy=${groupBy}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setData(data);
        }
      });
  };

  const handleExportCSV = () => {
    window.open(`/api/relatorios/export.csv?de=${de}&ate=${ate}&groupBy=${groupBy}`);
  };

  const handleExportPDF = () => {
    window.open(`/api/relatorios/export.pdf?de=${de}&ate=${ate}&groupBy=${groupBy}`);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Relatórios</h1>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <DateInput
              label="De"
              value={de}
              onChange={setDe}
            />
            <DateInput
              label="Até"
              value={ate}
              onChange={setAte}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agrupar por
              </label>
              <select
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
              >
                <option value="cliente">Cliente</option>
                <option value="transportadora">Transportadora</option>
                <option value="motorista">Motorista</option>
              </select>
            </div>
          </div>
          <Button onClick={handleGerar}>Gerar Relatório</Button>
        </Card>

        {data && (
          <Card>
            <div className="flex justify-end space-x-2 mb-4">
              <Button variant="secondary" onClick={handleExportCSV}>
                Exportar CSV
              </Button>
              <Button variant="secondary" onClick={handleExportPDF}>
                Exportar PDF
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Agrupador
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Carregamentos
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Líquido (kg)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.rows.map((row: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm">{row.groupKey}</td>
                      <td className="px-4 py-3 text-sm">{row.total_carregamentos}</td>
                      <td className="px-4 py-3 text-sm">{row.total_liquido_kg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

