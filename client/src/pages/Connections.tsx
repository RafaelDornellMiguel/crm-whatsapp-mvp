/**
 * Connections - Gerenciar conexões WhatsApp via Evolution API REAL
 * QR Code real, sincronização em tempo real, webhooks
 */

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Phone, Plus, Trash2, Power, QrCode, CheckCircle2, XCircle, Loader2, RefreshCw, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface Instance {
  instanceName: string;
  status: 'open' | 'close' | 'connecting';
  qrCode?: string;
  createdAt?: Date;
}

export default function Connections() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [newInstanceName, setNewInstanceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(true);

  // Procedures tRPC
  const createInstanceMutation = trpc.whatsapp.createInstance.useMutation();
  const getInstancesQuery = trpc.whatsapp.getInstances.useQuery();
  const getQRCodeQuery = trpc.whatsapp.getQRCode.useQuery(
    { instanceName: selectedInstance?.instanceName || '' },
    { enabled: !!selectedInstance?.instanceName && showQRModal }
  );
  const deleteInstanceMutation = trpc.whatsapp.deleteInstance.useMutation();
  const logoutInstanceMutation = trpc.whatsapp.logoutInstance.useMutation();
  const syncContactsMutation = trpc.sync.syncContatos.useMutation();

  // Carregar instâncias ao montar e quando dados mudam
  useEffect(() => {
    if (getInstancesQuery.data?.instances) {
      setInstances(getInstancesQuery.data.instances);
    }
  }, [getInstancesQuery.data]);

  // Polling automático a cada 5 segundos
  useEffect(() => {
    // Carregar instâncias imediatamente
    loadInstances();

    if (!isPolling) return;

    // Configurar intervalo de polling
    const pollInterval = setInterval(async () => {
      try {
        await getInstancesQuery.refetch();
      } catch (error) {
        console.error('Erro ao fazer polling:', error);
      }
    }, 5000); // 5 segundos

    // Limpar intervalo ao desmontar
    return () => clearInterval(pollInterval);
  }, [isPolling]);

  const loadInstances = async () => {
    try {
      await getInstancesQuery.refetch();
    } catch (error: any) {
      console.error('Erro ao carregar instâncias:', error);
      toast.error('Erro ao carregar instâncias da Evolution API');
    }
  };

  const handleCreateInstance = async () => {
    if (!newInstanceName.trim()) {
      toast.error('Digite um nome para a instância');
      return;
    }

    try {
      setLoading(true);
      await createInstanceMutation.mutateAsync({
        instanceName: newInstanceName,
      });
      toast.success('Instância criada! Escaneie o QR Code para conectar.');
      setNewInstanceName('');
      setShowAddModal(false);
      await loadInstances();
    } catch (error: any) {
      console.error('Erro ao criar instância:', error);
      toast.error(error.message || 'Erro ao criar instância');
    } finally {
      setLoading(false);
    }
  };

  const handleShowQRCode = async (instance: Instance) => {
    try {
      setQrLoading(true);
      setSelectedInstance(instance);
      setShowQRModal(true);
      
      // Refetch QR Code quando modal abre
      setTimeout(() => {
        getQRCodeQuery.refetch();
      }, 100);
    } catch (error: any) {
      console.error('Erro ao obter QR Code:', error);
      toast.error(error.message || 'Erro ao obter QR Code');
    } finally {
      setQrLoading(false);
    }
  };

  const handleSyncContacts = async (instanceName: string) => {
    try {
      setLoading(true);
      const result = await syncContactsMutation.mutateAsync({
        instanceName,
      });
      toast.success(`${result.sincronizados} contatos sincronizados!`);
      await loadInstances();
    } catch (error: any) {
      console.error('Erro ao sincronizar contatos:', error);
      toast.error(error.message || 'Erro ao sincronizar contatos');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (instanceName: string) => {
    if (!confirm('Deseja realmente desconectar esta instância?')) return;

    try {
      setLoading(true);
      await logoutInstanceMutation.mutateAsync({
        instanceName,
      });
      toast.success('Instância desconectada!');
      await loadInstances();
    } catch (error: any) {
      console.error('Erro ao desconectar:', error);
      toast.error(error.message || 'Erro ao desconectar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (instanceName: string) => {
    if (!confirm('Deseja realmente deletar esta instância? Esta ação não pode ser desfeita.')) return;

    try {
      setLoading(true);
      await deleteInstanceMutation.mutateAsync({
        instanceName,
      });
      toast.success('Instância deletada!');
      await loadInstances();
    } catch (error: any) {
      console.error('Erro ao deletar:', error);
      toast.error(error.message || 'Erro ao deletar');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Conexões WhatsApp</h1>
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
            Gerenciar números WhatsApp conectados via Evolution API
            {isPolling && (
              <span className="inline-flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-green-600">Sincronizando...</span>
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPolling(!isPolling)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
              isPolling
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={isPolling ? 'Clique para pausar sincronização' : 'Clique para retomar sincronização'}
          >
            <RefreshCw className={`w-4 h-4 ${isPolling ? 'animate-spin' : ''}`} />
            {isPolling ? 'Ativo' : 'Pausado'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Nova Conexão
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        {getInstancesQuery.isLoading && instances.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : instances.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Phone className="w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Nenhuma conexão</h2>
            <p className="text-muted-foreground mb-6">
              Crie uma nova conexão para começar a usar WhatsApp
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Criar Primeira Conexão
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {instances.map((instance) => (
              <div
                key={instance.instanceName}
                className="p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground truncate">
                    {instance.instanceName}
                  </h3>
                  <div className="flex items-center gap-1">
                    {instance.status === 'open' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : instance.status === 'connecting' ? (
                      <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-xs font-medium text-muted-foreground">
                      {instance.status === 'open'
                        ? 'Conectado'
                        : instance.status === 'connecting'
                        ? 'Conectando'
                        : 'Desconectado'}
                    </span>
                  </div>
                </div>

                {/* Status Details */}
                <div className="mb-4 p-3 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground">
                    Criada em {instance.createdAt ? new Date(instance.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {instance.status !== 'open' && (
                    <button
                      onClick={() => handleShowQRCode(instance)}
                      disabled={qrLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50"
                      title="Gerar QR Code para conectar"
                    >
                      <QrCode className="w-4 h-4" />
                      QR Code
                    </button>
                  )}
                  {instance.status === 'open' && (
                    <>
                      <button
                        onClick={() => handleSyncContacts(instance.instanceName)}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium disabled:opacity-50"
                        title="Sincronizar contatos"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Sincronizar
                      </button>
                      <button
                        onClick={() => handleDisconnect(instance.instanceName)}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium disabled:opacity-50"
                        title="Desconectar"
                      >
                        <Power className="w-4 h-4" />
                        Desconectar
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(instance.instanceName)}
                    disabled={loading}
                    className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    title="Deletar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Instance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
            <h2 className="text-lg font-bold text-foreground mb-4">Nova Conexão</h2>
            <input
              type="text"
              placeholder="Nome da instância (ex: Vendas, Suporte)"
              value={newInstanceName}
              onChange={(e) => setNewInstanceName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg mb-4 text-foreground bg-background"
              disabled={loading}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewInstanceName('');
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateInstance}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedInstance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg text-center">
            <h2 className="text-lg font-bold text-foreground mb-4">QR Code - {selectedInstance.instanceName}</h2>
            
            {getQRCodeQuery.isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : getQRCodeQuery.data?.qrCode ? (
              <>
                <img
                  src={getQRCodeQuery.data.qrCode}
                  alt="QR Code"
                  className="w-full max-w-xs mx-auto mb-4 border border-border rounded-lg"
                />
                <p className="text-sm text-muted-foreground mb-4">
                  Escaneie este QR Code com seu WhatsApp para conectar
                </p>
                {getQRCodeQuery.data.code && (
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Código:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs break-all">{getQRCodeQuery.data.code}</code>
                      <button
                        onClick={() => copyToClipboard(getQRCodeQuery.data.code)}
                        className="p-2 hover:bg-background rounded transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground mb-4">Erro ao carregar QR Code</p>
                <button
                  onClick={() => getQRCodeQuery.refetch()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Tentar Novamente
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setShowQRModal(false);
                setSelectedInstance(null);
              }}
              className="w-full mt-4 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
