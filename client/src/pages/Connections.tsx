/**
 * Connections - Gerenciar conexões WhatsApp
 * Design Philosophy: Minimalismo Corporativo
 * Inspirado no Whaticket
 */

import { useState } from 'react';
import { useCRMStore } from '@/store';
import { Phone, Plus, Trash2, Power, QrCode, CheckCircle2, XCircle } from 'lucide-react';

export default function Connections() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { phoneNumbers } = useCRMStore();

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Conexões</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Gerenciar números WhatsApp conectados
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Nova Conexão
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {phoneNumbers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Phone className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-foreground font-semibold mb-2">Nenhuma conexão configurada</p>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione uma conexão WhatsApp para começar
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Adicionar Conexão
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {phoneNumbers.map((phone) => (
              <div
                key={phone.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{phone.vendedorName}</h3>
                      <p className="text-sm text-muted-foreground">{phone.number}</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {phone.ativo ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Conectado</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Desconectado</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Última sincronização: {new Date().toLocaleString('pt-BR')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium"
                    title="Reconectar"
                  >
                    <QrCode className="w-4 h-4" />
                    QR Code
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium"
                    title={phone.ativo ? 'Desconectar' : 'Conectar'}
                  >
                    <Power className="w-4 h-4" />
                    {phone.ativo ? 'Desconectar' : 'Conectar'}
                  </button>
                  <button
                    className="p-2 bg-secondary hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Connection Modal */}
      {showAddModal && <AddConnectionModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

interface AddConnectionModalProps {
  onClose: () => void;
}

function AddConnectionModal({ onClose }: AddConnectionModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    numero: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar lógica de adicionar conexão
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Nova Conexão WhatsApp</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Adicione um novo número para conectar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nome do Vendedor
            </label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: João Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Número WhatsApp
            </label>
            <input
              type="tel"
              required
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium mb-2">
              Próximo passo: Escanear QR Code
            </p>
            <p className="text-xs text-blue-800">
              Após adicionar, você precisará escanear o QR Code com o WhatsApp para conectar o número.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
