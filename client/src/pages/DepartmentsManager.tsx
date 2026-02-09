/**
 * Departments Manager - Gerenciamento de Departamentos
 * Apenas ADM pode acessar
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Users, Phone, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DepartmentsManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', cor: '#3B82F6' });

  const { data: deptsData, isLoading, refetch } = trpc.departments.list.useQuery();
  const createMutation = trpc.departments.create.useMutation();
  const updateMutation = trpc.departments.update.useMutation();
  const deleteMutation = trpc.departments.delete.useMutation();

  const handleCreate = async () => {
    if (!formData.nome.trim()) {
      toast.error('Nome do departamento é obrigatório');
      return;
    }

    try {
      await createMutation.mutateAsync({
        nome: formData.nome,
        descricao: formData.descricao,
        cor: formData.cor,
      });
      toast.success('Departamento criado com sucesso!');
      setFormData({ nome: '', descricao: '', cor: '#3B82F6' });
      setIsCreating(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este departamento?')) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success('Departamento deletado com sucesso!');
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const departments = deptsData?.departamentos || [];

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Departamentos</h1>
          <p className="text-muted-foreground mt-1">Gerencie departamentos e atribua conexões WhatsApp</p>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Departamento
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>Criar Novo Departamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome *</label>
              <Input
                placeholder="Ex: Vendas, Logística, Financeiro"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                placeholder="Descrição do departamento..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Cor</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.cor}
                  onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input
                  value={formData.cor}
                  onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setFormData({ nome: '', descricao: '', cor: '#3B82F6' });
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Criando...' : 'Criar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Departments Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : departments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum departamento criado ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept: any) => (
            <Card key={dept.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: dept.cor }}
                    ></div>
                    <CardTitle className="text-lg">{dept.nome}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(dept.id)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(dept.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {dept.descricao && (
                  <p className="text-sm text-muted-foreground">{dept.descricao}</p>
                )}

                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{dept.usuariosCount || 0} usuários</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{dept.conexoesCount || 0} conexões</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Criado em {new Date(dept.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
