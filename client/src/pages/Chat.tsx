/**
 * Chat - Conversa detalhada com lead integrada ao WhatsApp
 * Design Philosophy: Minimalismo Corporativo
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useCRMStore } from '@/store';
import { StatusBadge } from '@/components/StatusBadge';
import { TagBadge } from '@/components/TagBadge';
import { ArrowLeft, Send, ShoppingCart, AlertCircle, Tag, Plus, Phone, Camera } from 'lucide-react';
import type { Message, LeadTag } from '@/types';
import { nanoid } from 'nanoid';
import { sendWhatsAppMessage, fetchIncomingMessages } from '@/services/whatsappApi';
import { toast } from 'sonner';

export default function Chat() {
  const [, setLocation] = useLocation();
  const [messageText, setMessageText] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const {
    selectedLeadId,
    leads,
    contacts,
    phoneNumbers,
    addMessage,
    getMessagesByLeadId,
    getContact,
    updateLeadStatus,
  } = useCRMStore();

  // Polling para mensagens recebidas (simulado)
  useEffect(() => {
    if (!selectedLeadId) return;

    const interval = setInterval(async () => {
      try {
        const incomingMessages = await fetchIncomingMessages();
        const lead = leads.find((l) => l.id === selectedLeadId);
        const contact = lead ? getContact(lead.contactId) : null;
        
        if (contact && lead) {
          incomingMessages.forEach((whatsappMsg) => {
            if (whatsappMsg.from === contact.phone || whatsappMsg.from.includes(contact.phone.replace(/\D/g, ''))) {
              const newMessage: Message = {
                id: nanoid(),
                leadId: selectedLeadId,
                sender: 'contact',
                content: whatsappMsg.text?.body || '',
                timestamp: new Date(whatsappMsg.timestamp),
                phoneNumberId: lead.phoneNumberId,
                vendedorId: lead.vendedorId,
                whatsappMessageId: whatsappMsg.id,
              };
              addMessage(newMessage);
            }
          });
        }
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedLeadId, leads, contacts, addMessage, getContact]);

  if (!selectedLeadId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Selecione uma conversa</p>
      </div>
    );
  }

  const lead = leads.find((l) => l.id === selectedLeadId);
  const contact = lead ? getContact(lead.contactId) : null;
  const chatMessages = getMessagesByLeadId(selectedLeadId);
  const phoneNumber = lead?.phoneNumberId ? phoneNumbers.find((p) => p.id === lead.phoneNumberId) : null;

  if (!lead || !contact) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Conversa não encontrada</p>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) return;

    setIsSending(true);

    try {
      // Enviar via API WhatsApp (simulado)
      const result = await sendWhatsAppMessage(
        phoneNumber?.number || '',
        contact.phone,
        messageText
      );

      if (result.success) {
        const newMessage: Message = {
          id: nanoid(),
          leadId: selectedLeadId,
          sender: 'user',
          content: messageText,
          timestamp: new Date(),
          phoneNumberId: lead.phoneNumberId,
          vendedorId: lead.vendedorId,
          whatsappMessageId: result.messageId,
        };

        addMessage(newMessage);
        setMessageText('');
        toast.success('Mensagem enviada via WhatsApp');

        // Mudar status para atendimento se for novo
        if (lead.status === 'novo') {
          updateLeadStatus(selectedLeadId, 'atendimento');
        }
      } else {
        toast.error(result.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      toast.error('Erro ao enviar mensagem via WhatsApp');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation('/')}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">{contact.name}</h1>
              <p className="text-sm text-muted-foreground">{contact.phone}</p>
              {phoneNumber && (
                <p className="text-xs text-muted-foreground">
                  Via: {phoneNumber.number} ({phoneNumber.vendedorName})
                </p>
              )}
            </div>
          </div>
          <StatusBadge status={lead.status} />
        </div>
        
        {/* Tags */}
        <div className="flex items-center gap-2 mt-2">
          {lead.tags && lead.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {lead.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} size="sm" />
              ))}
            </div>
          )}
          <button
            onClick={() => setShowTagModal(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
            title="Editar etiquetas"
          >
            <Tag className="w-3 h-3" />
            Editar
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-muted-foreground">Nenhuma mensagem ainda</p>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-secondary text-secondary-foreground rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 border-t border-border space-y-3">
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              alert(`📞 Ligando para ${contact.name} (${contact.phone})...\n\nEsta é uma simulação. Em produção, integrar com sistema de telefonia.`);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Phone className="w-4 h-4" />
            Ligar
          </button>
          <button
            onClick={() => setShowOrderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <ShoppingCart className="w-4 h-4" />
            Criar Pedido
          </button>
          <button
            onClick={() => setShowCameraModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Camera className="w-4 h-4" />
            Câmera
          </button>
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Digite uma mensagem..."
            disabled={isSending}
            className="flex-1 px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <OrderModal
          leadId={selectedLeadId}
          contactName={contact.name}
          onClose={() => setShowOrderModal(false)}
        />
      )}

      {/* Tag Modal */}
      {showTagModal && (
        <TagModal
          leadId={selectedLeadId}
          currentTags={lead.tags || []}
          onClose={() => setShowTagModal(false)}
        />
      )}

      {/* Camera Modal */}
      {showCameraModal && (
        <CameraModal
          leadId={selectedLeadId}
          onClose={() => setShowCameraModal(false)}
          onPhotoTaken={(photoUrl) => {
            const newMessage: Message = {
              id: nanoid(),
              leadId: selectedLeadId,
              sender: 'user',
              content: `[Foto enviada: ${photoUrl}]`,
              timestamp: new Date(),
              phoneNumberId: lead.phoneNumberId,
              vendedorId: lead.vendedorId,
            };
            addMessage(newMessage);
            toast.success('Foto enviada!');
            setShowCameraModal(false);
          }}
        />
      )}
    </div>
  );
}

interface OrderModalProps {
  leadId: string;
  contactName: string;
  onClose: () => void;
}

function OrderModal({ leadId, contactName, onClose }: OrderModalProps) {
  const [selectedProducts, setSelectedProducts] = useState<
    Array<{ productId: string; quantity: number }>
  >([]);
  const [dataEntrega, setDataEntrega] = useState<string>('');

  const { products, addOrder } = useCRMStore();

  const handleAddProduct = (productId: string) => {
    const existing = selectedProducts.find((p) => p.productId === productId);
    if (existing) {
      setSelectedProducts(
        selectedProducts.map((p) =>
          p.productId === productId ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      setSelectedProducts([...selectedProducts, { productId, quantity: 1 }]);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(
      selectedProducts.filter((p) => p.productId !== productId)
    );
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveProduct(productId);
    } else {
      setSelectedProducts(
        selectedProducts.map((p) =>
          p.productId === productId ? { ...p, quantity } : p
        )
      );
    }
  };

  const orderItems = selectedProducts
    .map((sp) => {
      const product = products.find((p) => p.id === sp.productId);
      return product ? { productId: sp.productId, quantity: sp.quantity, price: product.price } : null;
    })
    .filter((item) => item !== null) as Array<{ productId: string; quantity: number; price: number }>;

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCreateOrder = () => {
    if (orderItems.length === 0) return;

    addOrder({
      id: nanoid(),
      leadId,
      items: orderItems,
      totalAmount,
      status: 'aberto',
      dataEntrega: dataEntrega ? new Date(dataEntrega) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    toast.success('Pedido criado com sucesso!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Criar Pedido</h2>
          <p className="text-sm text-muted-foreground mt-1">Para {contactName}</p>
        </div>

        {/* Products */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Produtos Disponíveis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products.map((product) => {
                const isSelected = selectedProducts.some(
                  (p) => p.productId === product.id
                );
                const selectedItem = selectedProducts.find(
                  (p) => p.productId === product.id
                );

                return (
                  <div key={product.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{product.name}</p>
                        {product.medida && (
                          <p className="text-xs text-muted-foreground">{product.medida}</p>
                        )}
                        <p className="text-sm text-primary font-semibold mt-1">
                          R$ {product.price.toFixed(2)}
                        </p>
                      </div>
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        {product.stock} un
                      </span>
                    </div>

                    {isSelected && selectedItem ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              product.id,
                              selectedItem.quantity - 1
                            )
                          }
                          className="px-2 py-1 bg-secondary rounded hover:bg-secondary/80"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={selectedItem.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              product.id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-12 text-center bg-card border border-border rounded px-2 py-1 text-sm"
                          min="1"
                          max={product.stock}
                        />
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              product.id,
                              selectedItem.quantity + 1
                            )
                          }
                          disabled={selectedItem.quantity >= product.stock}
                          className="px-2 py-1 bg-secondary rounded hover:bg-secondary/80 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddProduct(product.id)}
                        disabled={product.stock === 0}
                        className="w-full px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        Adicionar
                      </button>
                    )}

                    {product.stock < 3 && product.stock > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                        <AlertCircle className="w-3 h-3" />
                        Estoque baixo
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data de Entrega */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Data de Entrega (Opcional)
            </label>
            <input
              type="date"
              value={dataEntrega}
              onChange={(e) => setDataEntrega(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Summary */}
          {orderItems.length > 0 && (
            <div className="border-t border-border pt-4 space-y-2">
              <h3 className="font-semibold text-foreground">Resumo do Pedido</h3>
              <div className="space-y-1 text-sm">
                {orderItems.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <div key={item.productId} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {product?.name} x{item.quantity}
                      </span>
                      <span className="text-foreground font-medium">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold">
                <span>Total:</span>
                <span className="text-primary">R$ {totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreateOrder}
            disabled={orderItems.length === 0}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Criar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}

interface TagModalProps {
  leadId: string;
  currentTags: string[];
  onClose: () => void;
}
function TagModal({ leadId, currentTags, onClose }: TagModalProps) {
  const [tags, setTags] = useState<LeadTag[]>(currentTags as LeadTag[]);
  const [newTagName, setNewTagName] = useState('');
  const { updateLeadTags } = useCRMStore();

  const availableTags: { label: string; value: LeadTag }[] = [
    { label: 'Orçamento', value: 'orcamento' },
    { label: 'Venda Fechada', value: 'venda_fechada' },
    { label: 'Amster dã', value: 'amsterda' },
    { label: 'Royale', value: 'royale' },
  ];

  const handleToggleTag = (tag: LeadTag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const normalized = newTagName.trim().toLowerCase().replace(/\s+/g, '_') as LeadTag;
    if (newTagName.trim() && !tags.includes(normalized)) {
      setTags([...tags, normalized]);
      setNewTagName('');
    }
  };

  const handleSave = () => {
    updateLeadTags(leadId, tags);
    toast.success('Etiquetas atualizadas!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Editar Etiquetas</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione ou crie etiquetas para este cliente
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Available Tags */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Etiquetas Disponíveis
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.value}
                  onClick={() => handleToggleTag(tag.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    tags.includes(tag.value)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Tag */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Criar Nova Etiqueta
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                placeholder="Nome da etiqueta..."
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button
                onClick={handleAddCustomTag}
                disabled={!newTagName.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Selected Tags */}
          {tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Etiquetas Selecionadas
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleToggleTag(tag)}
                      className="hover:bg-primary/20 rounded p-0.5"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

interface CameraModalProps {
  leadId: string;
  onClose: () => void;
  onPhotoTaken: (photoUrl: string) => void;
}

function CameraModal({ leadId, onClose, onPhotoTaken }: CameraModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSendPhoto = () => {
    if (previewUrl) {
      onPhotoTaken(previewUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Câmera / Upload de Foto</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tire uma foto do produto ou faça upload de uma imagem
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* File Input */}
          <div>
            <label
              htmlFor="photo-upload"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <Camera className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Clique para selecionar uma foto
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ou arraste e solte aqui
                  </p>
                </div>
              )}
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {selectedFile && (
            <div className="bg-secondary p-3 rounded-lg">
              <p className="text-sm font-medium text-foreground">
                📷 {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSendPhoto}
            disabled={!previewUrl}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Enviar Foto
          </button>
        </div>
      </div>
    </div>
  );
}
