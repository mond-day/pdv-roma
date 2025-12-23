"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface Usuario {
  id: string;
  name: string;
  email: string;
  role: "admin" | "faturador";
  is_active: boolean;
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "faturador" as "admin" | "faturador",
    password: "",
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    fetch("/api/usuarios")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setUsers(data.items);
        }
      })
      .finally(() => setLoading(false));
  };

  const handleOpenModal = (user?: Usuario) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: "",
        is_active: user.is_active,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        role: "faturador",
        password: "",
        is_active: true,
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres";
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!editingUser && (!formData.password || formData.password.length < 8)) {
      newErrors.password = "Senha deve ter pelo menos 8 caracteres";
    }

    if (editingUser && formData.password && formData.password.length < 8) {
      newErrors.password = "Senha deve ter pelo menos 8 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const url = editingUser ? `/api/usuarios/${editingUser.id}` : "/api/usuarios";
      const method = editingUser ? "PUT" : "POST";

      const body: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (editingUser) {
        if (formData.password) {
          body.password = formData.password;
        }
        body.is_active = formData.is_active;
      } else {
        body.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.ok) {
        handleCloseModal();
        loadUsers();
      } else {
        setErrors({ submit: data.message || "Erro ao salvar usuário" });
      }
    } catch (error) {
      setErrors({ submit: "Erro ao salvar usuário" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user: Usuario) => {
    if (!confirm(`Deseja ${user.is_active ? "desativar" : "ativar"} o usuário ${user.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/usuarios/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !user.is_active }),
      });

      const data = await response.json();
      if (data.ok) {
        loadUsers();
      } else {
        alert(data.message || "Erro ao atualizar usuário");
      }
    } catch (error) {
      alert("Erro ao atualizar usuário");
    }
  };

  if (loading) {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
            <p className="text-gray-600 mt-1">Gerencie usuários e permissões do sistema</p>
          </div>
          <Button onClick={() => handleOpenModal()}>Novo Usuário</Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Perfil
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
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={user.role === "admin" ? "info" : "default"}>
                          {user.role === "admin" ? "Administrador" : "Faturador"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={user.is_active ? "success" : "danger"}>
                          {user.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                            aria-label="Editar usuário"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleToggleActive(user)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.is_active
                                ? "text-red-600 hover:bg-red-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                            title={user.is_active ? "Desativar" : "Ativar"}
                            aria-label={user.is_active ? "Desativar usuário" : "Ativar usuário"}
                          >
                            {user.is_active ? (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingUser ? "Editar Usuário" : "Novo Usuário"}
          footer={
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={handleCloseModal} disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} isLoading={submitting}>
                {editingUser ? "Salvar" : "Criar"}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {errors.submit}
              </div>
            )}

            <Input
              label="Nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
              disabled={!!editingUser}
            />

            <Select
              label="Perfil"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as "admin" | "faturador" })
              }
              options={[
                { value: "admin", label: "Administrador" },
                { value: "faturador", label: "Faturador" },
              ]}
            />

            <Input
              label={editingUser ? "Nova Senha (deixe em branco para manter)" : "Senha"}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              required={!editingUser}
            />

            {editingUser && (
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">Usuário ativo</span>
                </label>
              </div>
            )}
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}

