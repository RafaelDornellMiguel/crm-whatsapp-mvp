/**
 * Chat - Conversa detalhada com lead
 * Design Philosophy: Minimalismo Corporativo
 * - Histórico de mensagens
 * - Campo para digitar
 * - Ações como criar pedido
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { useCRMStore } from '@/store';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft, Send, ShoppingCart, AlertCircle } from 'lucide-react';
import type { Message } from '@/types';
import { nanoid } from 'nanoid';

export default function Chat() {
  const [, setLocation] = useLocation();
  const [messageText, setMessageText] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);

  const {
    selectedLeadId,
    leads,
    contacts,
    messages,
    addMessage,
    getMessagesByLeadId,
    getContact,
    updateLeadStatus,
  } = useCRMStore();

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

  if (!lead || !contact) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Conversa não encontrada</p>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: nanoid(),
      leadId: selectedLeadId,
      sender: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    addMessage(newMessage);
    setMessageText('');

    // Mudar status para atendimento se for novo
    if (lead.status === 'novo') {
      updateLeadStatus(selectedLeadId, 'atendimento');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
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
          </div>
        </div>
        <StatusBadge status={lead.status} />
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
            onClick={() => setShowOrderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <ShoppingCart className="w-4 h-4" />
            Criar Pedido
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
            className="flex-1 px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
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

  const { products, addOrder, getOrdersByLeadId } = useCRMStore();

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
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Criar Pedido</h2>
          <p className="text-sm text-muted-foreground mt-1">Para {contactName}</p>
        </div>

        {/* Products */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Produtos Disponíveis</h3>
            <div className="space-y-2">
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
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {product.price.toFixed(2)}
                        </p>
                      </div>
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        {product.stock} em estoque
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
                          className="w-12 text-center bg-card border border-border rounded px-2 py-1"
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
