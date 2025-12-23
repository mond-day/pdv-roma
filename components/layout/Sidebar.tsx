"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NotificationsWidget } from "./NotificationsWidget";
import { Button } from "@/components/ui/Button";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/pesagem", label: "Pesagem e Carregamentos", icon: "⚖️" },
  { href: "/historico", label: "Histórico", icon: "📜" },
  { href: "/relatorios", label: "Relatórios", icon: "📄" },
  { href: "/auditoria", label: "Auditoria", icon: "🔍", adminOnly: true },
  { href: "/usuarios", label: "Usuários", icon: "👥", adminOnly: true },
  { href: "/configuracoes", label: "Configurações", icon: "⚙️", adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Carregar estado do localStorage
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }

    // Buscar dados do usuário
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setUser(data.user);
          setUserRole(data.user.role);
        }
      });

    const loadLogo = () => {
      fetch("/api/configuracoes")
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data.ok && data.items) {
            const logoConfig = data.items.find((item: any) => item.key === "EMPRESA_LOGO_URL");
            if (logoConfig?.value && logoConfig.value.trim() !== "") {
              console.log("Logo encontrada:", logoConfig.value.substring(0, 50) + "...");
              setLogoUrl(logoConfig.value);
            } else {
              console.log("Nenhuma logo configurada");
              setLogoUrl(null);
            }
          } else {
            console.warn("Resposta da API não contém dados válidos:", data);
            setLogoUrl(null);
          }
        })
        .catch((error) => {
          // Não quebrar o sistema se houver erro ao carregar logo
          console.warn("Erro ao carregar logo (não crítico):", error.message);
          setLogoUrl(null);
        });
    };

    loadLogo();

    // Ouvir evento de atualização de configurações
    const handleConfigUpdate = (event?: Event | CustomEvent) => {
      // Recarregar logo após atualização
      console.log("Evento configUpdated recebido, recarregando logo...");
      
      // Se o evento contém a logo diretamente, usar ela
      if (event && 'detail' in event && (event as CustomEvent).detail?.logo) {
        const logoFromEvent = (event as CustomEvent).detail.logo;
        console.log("Logo recebida via evento:", logoFromEvent.substring(0, 50) + "...");
        setLogoUrl(logoFromEvent);
      } else {
        // Caso contrário, recarregar da API
        loadLogo();
      }
    };

    window.addEventListener("configUpdated", handleConfigUpdate as EventListener);
    // Também ouvir eventos customizados do window
    window.addEventListener("storage", handleConfigUpdate as EventListener);
    
    // Listener adicional para garantir que funciona
    const intervalCheck = setInterval(() => {
      // Verificar se há mudança no localStorage (fallback)
      const lastUpdate = localStorage.getItem("configLastUpdate");
      const logoFromStorage = localStorage.getItem("EMPRESA_LOGO_URL");

      if (lastUpdate) {
        const lastUpdateTime = parseInt(lastUpdate, 10);
        const now = Date.now();
        // Se atualizado nos últimos 3 segundos, recarregar
        if (now - lastUpdateTime < 3000) {
          if (logoFromStorage) {
            console.log("Logo encontrada no localStorage, usando...");
            setLogoUrl(logoFromStorage);
          } else {
            loadLogo();
          }
          localStorage.removeItem("configLastUpdate");
        }
      }
    }, 300);

    // Também verificar periodicamente (fallback)
    const interval = setInterval(loadLogo, 5000);

    return () => {
      window.removeEventListener("configUpdated", handleConfigUpdate);
      window.removeEventListener("storage", handleConfigUpdate);
      clearInterval(interval);
      clearInterval(intervalCheck);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
    // Disparar evento customizado para atualizar AppShell na mesma aba
    window.dispatchEvent(new CustomEvent("sidebarToggle", { detail: { collapsed: newState } }));
    // Também disparar storage event (funciona entre abas)
    window.dispatchEvent(new Event("storage"));
  };

  const filteredItems = menuItems.filter(
    (item) => !item.adminOnly || userRole === "admin"
  );

  return (
    <aside
      className={`bg-white shadow-md fixed top-0 left-0 h-screen transition-all duration-300 flex flex-col ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header com Logo e Título */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={toggleCollapse}
          className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {logoUrl ? (
            <img
              key={logoUrl} // Force re-render when logo changes
              src={logoUrl}
              alt="Logo"
              className={`${isCollapsed ? "w-8 h-8" : "w-10 h-10"} object-contain flex-shrink-0`}
              onError={(e) => {
                console.error("Erro ao carregar logo:", logoUrl);
                setLogoUrl(null); // Remove logo on error
              }}
              onLoad={() => {
                console.log("Logo carregada com sucesso:", logoUrl);
              }}
            />
          ) : (
            <div className={`${isCollapsed ? "w-8 h-8" : "w-10 h-10"} bg-gray-200 rounded flex items-center justify-center flex-shrink-0`}>
              <span className="text-lg">🏢</span>
            </div>
          )}
          {!isCollapsed && (
            <span className="text-xl font-bold text-gray-900 flex-1 text-left">
              PDV - Roma
            </span>
          )}
        </button>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 overflow-y-auto mt-4">
        {filteredItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors ${
              pathname === item.href
                ? "bg-blue-50 border-r-4 border-blue-600 text-blue-700 font-semibold"
                : ""
            }`}
            title={isCollapsed ? item.label : undefined}
          >
            <span className={`${isCollapsed ? "mx-auto" : "mr-3"}`}>
              {item.icon}
            </span>
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer com Usuário e Notificações */}
      <div className="border-t border-gray-200 p-4 flex-shrink-0">
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <NotificationsWidget />
            </div>
            {user && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-600 transition-transform flex-shrink-0 ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showUserMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Perfil: <span className="font-medium">{user.role === "admin" ? "Administrador" : "Faturador"}</span>
                      </p>
                    </div>
                    <div className="px-2 py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start"
                      >
                        Sair
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <NotificationsWidget />
            {user && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title={user.name}
                >
                  <span className="text-lg">👤</span>
                </button>
                {showUserMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Perfil: <span className="font-medium">{user.role === "admin" ? "Administrador" : "Faturador"}</span>
                      </p>
                    </div>
                    <div className="px-2 py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start"
                      >
                        Sair
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

