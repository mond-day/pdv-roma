"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const CONFIG_GROUPS = {
  empresa: {
    title: "Empresa",
    keys: ["EMPRESA_LOGO_URL"],
  },
  pesagem: {
    title: "Parâmetros de Pesagem",
    keys: ["PESO_MAXIMO_EIXO", "PERMITIR_EXCESSO_PESO"],
  },
  n8n: {
    title: "Integração n8n",
    keys: ["N8N_WEBHOOK_URL", "N8N_TOKEN"],
  },
  integracoes: {
    title: "Outras Integrações",
    keys: ["NIBO_TOKEN", "GC_TOKEN"],
  },
  smtp: {
    title: "Configurações SMTP",
    keys: ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"],
  },
  email: {
    title: "Alertas por Email",
    keys: ["EMAIL_ON_INTEGRACAO_ERRO", "EMAIL_ON_INTEGRACAO_SUCESSO"],
  },
};

export default function ConfiguracoesPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/configuracoes")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setConfigs(data.items);
        } else {
          console.error("Erro ao carregar configurações:", data);
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar configurações:", error);
      });
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    const items = configs.map((c) => ({
      key: c.key,
      value: c.value || "",
    }));

    const res = await fetch("/api/configuracoes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    if (res.ok) {
      alert("Configurações salvas com sucesso!");
      // Marcar timestamp no localStorage
      localStorage.setItem("configLastUpdate", Date.now().toString());
      // Disparar evento customizado para atualizar logo na sidebar
      window.dispatchEvent(new CustomEvent("configUpdated", { detail: { key: "EMPRESA_LOGO_URL" } }));
      // Forçar atualização imediata (múltiplas tentativas)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("configUpdated"));
      }, 100);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("configUpdated"));
      }, 500);
    } else {
      alert("Erro ao salvar configurações");
    }
    setIsLoading(false);
  };

  const getConfigByKey = (key: string) => {
    return configs.find((c) => c.key === key);
  };

  const updateConfig = (key: string, value: string) => {
    setConfigs(
      configs.map((c) => (c.key === key ? { ...c, value } : c))
    );
  };

  const getLabel = (key: string) => {
    const labels: Record<string, string> = {
      EMPRESA_LOGO_URL: "URL da Logo da Empresa",
      N8N_WEBHOOK_URL: "URL do Webhook n8n",
      N8N_TOKEN: "Token n8n",
      NIBO_TOKEN: "Token Nibo",
      GC_TOKEN: "Token GC",
      SMTP_HOST: "Host SMTP",
      SMTP_PORT: "Porta SMTP",
      SMTP_USER: "Usuário SMTP",
      SMTP_PASS: "Senha SMTP",
      SMTP_FROM: "Email Remetente",
      EMAIL_ON_INTEGRACAO_ERRO: "Enviar email em caso de erro",
      EMAIL_ON_INTEGRACAO_SUCESSO: "Enviar email em caso de sucesso",
      PESO_MAXIMO_EIXO: "Peso Máximo por Eixo (kg)",
      PERMITIR_EXCESSO_PESO: "Permitir carregamento com excesso de peso",
    };
    return labels[key] || key;
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">Gerencie as configurações do sistema</p>
        </div>

        {configs.length === 0 ? (
          <Card className="bg-white">
            <p className="text-gray-700">Carregando configurações...</p>
          </Card>
        ) : (
          Object.entries(CONFIG_GROUPS).map(([groupKey, group]) => {
            const groupConfigs = group.keys
              .map((key) => {
                const config = getConfigByKey(key);
                // Se não encontrou, criar um objeto vazio para permitir edição
                if (!config && configs.length > 0) {
                  return { key, value: "", masked: false };
                }
                return config;
              })
              .filter(Boolean);

            if (groupConfigs.length === 0) return null;

          return (
            <Card key={groupKey} title={group.title} className="bg-white">
              <div className="space-y-4">
                {groupConfigs.map((config) => {
                  if (!config) return null;

                  // Para checkboxes booleanos
                  if (
                    config.key.startsWith("EMAIL_ON_") ||
                    config.key === "EMAIL_ON_INTEGRACAO_ERRO" ||
                    config.key === "EMAIL_ON_INTEGRACAO_SUCESSO" ||
                    config.key === "PERMITIR_EXCESSO_PESO"
                  ) {
                    return (
                      <div key={config.key} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={config.value === "true"}
                          onChange={(e) =>
                            updateConfig(config.key, e.target.checked ? "true" : "false")
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="text-sm font-medium text-gray-900">
                          {getLabel(config.key)}
                        </label>
                      </div>
                    );
                  }

                  // Para PESO_MAXIMO_EIXO (input numérico)
                  if (config.key === "PESO_MAXIMO_EIXO") {
                    return (
                      <div key={config.key} className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">
                          {getLabel(config.key)}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={config.value || "6000"}
                          onChange={(e) => updateConfig(config.key, e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          placeholder="6000"
                        />
                        <p className="text-xs text-gray-500">Valor em kg (quilogramas)</p>
                      </div>
                    );
                  }

                  if (config.key === "EMPRESA_LOGO_URL") {
                    return (
                      <div key={config.key} className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-900">
                          {getLabel(config.key)}
                        </label>
                        <div className="flex items-center space-x-4">
                          {config.value && (
                            <div className="flex-shrink-0">
                              <img
                                src={config.value}
                                alt="Logo"
                                className="h-16 w-auto border border-gray-300 rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <Input
                              label=""
                              type="text"
                              value={config.value || ""}
                              onChange={(e) => updateConfig(config.key, e.target.value)}
                              placeholder="https://exemplo.com/logo.png ou data:image/..."
                            />
                            <div className="mt-2">
                              <label className="block text-xs text-gray-600 mb-1">
                                Ou faça upload de uma imagem:
                              </label>
                              <div className="flex items-center">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setFileName({ ...fileName, [config.key]: file.name });

                                      // Validar tamanho (máximo 2MB)
                                      if (file.size > 2 * 1024 * 1024) {
                                        alert("A imagem deve ter no máximo 2MB");
                                        e.target.value = ""; // Limpar input
                                        return;
                                      }

                                      const reader = new FileReader();
                                      reader.onloadend = async () => {
                                        const base64 = reader.result as string;

                                        // Atualizar estado local primeiro
                                        const updatedConfigs = configs.map((c) =>
                                          c.key === config.key ? { ...c, value: base64 } : c
                                        );
                                        setConfigs(updatedConfigs);

                                        // Salvar automaticamente após upload
                                        const items = updatedConfigs.map((c) => ({
                                          key: c.key,
                                          value: c.value || "",
                                        }));

                                        try {
                                          setIsLoading(true);

                                          // Validar tamanho do base64 (máximo ~2MB)
                                          if (base64.length > 3 * 1024 * 1024) {
                                            alert("A imagem é muito grande. Use uma imagem menor que 2MB.");
                                            setIsLoading(false);
                                            return;
                                          }

                                          const res = await fetch("/api/configuracoes", {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ items }),
                                          });

                                          if (!res.ok) {
                                            let errorMessage = "Erro ao salvar logo";
                                            try {
                                              const errorData = await res.json();
                                              errorMessage = errorData.message || errorMessage;
                                            } catch {
                                              errorMessage = `Erro HTTP ${res.status}: ${res.statusText}`;
                                            }
                                            throw new Error(errorMessage);
                                          }

                                          // Atualizar logo imediatamente
                                          const updatedData = await res.json();
                                          console.log("Logo salva, atualizando sidebar...", updatedData);

                                          // Disparar evento para atualizar logo
                                          localStorage.setItem("configLastUpdate", Date.now().toString());
                                          localStorage.setItem("EMPRESA_LOGO_URL", base64); // Salvar logo no localStorage

                                          // Disparar múltiplos eventos para garantir atualização
                                          window.dispatchEvent(new CustomEvent("configUpdated", { detail: { logo: base64 } }));
                                          setTimeout(() => {
                                            window.dispatchEvent(new CustomEvent("configUpdated", { detail: { logo: base64 } }));
                                          }, 100);
                                          setTimeout(() => {
                                            window.dispatchEvent(new CustomEvent("configUpdated", { detail: { logo: base64 } }));
                                          }, 500);

                                          // Forçar reload do componente Sidebar
                                          window.dispatchEvent(new Event("storage"));

                                          alert("Logo salva com sucesso! Atualize a página para ver a logo no sidebar.");

                                          // Limpar o input file
                                          e.target.value = "";
                                        } catch (error) {
                                          console.error("Erro ao salvar logo:", error);
                                          const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
                                          alert(`Erro ao salvar logo: ${errorMessage}\n\nVerifique se o servidor está rodando e tente novamente.`);
                                          // Limpar o input file em caso de erro
                                          e.target.value = "";
                                        } finally {
                                          setIsLoading(false);
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="hidden"
                                  id={`file-upload-${config.key}`}
                                />
                                <label
                                  htmlFor={`file-upload-${config.key}`}
                                  className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors text-sm font-semibold"
                                >
                                  📁 Escolher Arquivo
                                </label>
                                <span className="ml-2 text-sm text-gray-600">
                                  {fileName[config.key] || "Nenhum arquivo selecionado"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Input
                      key={config.key}
                      label={getLabel(config.key)}
                      type={config.masked ? "password" : "text"}
                      value={config.value || ""}
                      onChange={(e) => updateConfig(config.key, e.target.value)}
                    />
                  );
                })}
                {/* Botão Salvar para seção de Pesagem */}
                {groupKey === "pesagem" && (
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={handleSave} 
                      isLoading={isLoading}
                      className="w-full sm:w-auto"
                    >
                      Salvar Parâmetros de Pesagem
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
          })
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} isLoading={isLoading} size="lg">
            Salvar Todas as Configurações
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

