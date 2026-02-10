/**
 * Chat - Conversa detalhada com cliente integrada à Evolution API
 * Design Philosophy: Minimalismo Corporativo com interface moderna
 */

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { 
  ArrowLeft, Send, ShoppingCart, AlertCircle, Tag, Plus, Phone, 
  Camera, Loader2, Paperclip, Image, Music, FileText, X, Check, CheckCheck 
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function Chat() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaCaption, setMediaCaption] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get contatoId from URL or state
  const contatoId = parseInt(new URLSearchParams(window.location.search).get('contatoId') || '0');

  // Fetch messages
  const { data: messages = [], isLoading: loadingMessages, refetch: refetchMessages } = trpc.messages.getMessages.useQuery(
    { contatoId },
    { enabled: !!contatoId && !!user }
  );

  // Send message mutation
  const sendMessageMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText('');
      setIsTyping(false);
      toast.success('Mensagem enviada com sucesso!');
      refetchMessages();
    },
    onError: (error) => {
      toast.error(`Erro ao enviar mensagem: ${error.message}`);
    },
  });

  // Send media message mutation
  const sendMediaMutation = trpc.messages.sendMediaMessage.useMutation({
    onSuccess: () => {
      setSelectedMedia(null);
      setMediaPreview(null);
      setMediaCaption('');
      setShowMediaModal(false);
      toast.success('Mídia enviada com sucesso!');
      refetchMessages();
    },
    onError: (error) => {
      toast.error(`Erro ao enviar mídia: ${error.message}`);
    },
  });

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending || !contatoId) return;

    setIsSending(true);
    setIsTyping(true);
    try {
      await sendMessageMutation.mutateAsync({
        contatoId,
        texto: messageText,
        instanceName: 'default',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 16MB for Evolution API)
    if (file.size > 16 * 1024 * 1024) {
      toast.error('Arquivo muito grande (máximo 16MB)');
      return;
    }

    setSelectedMedia(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setMediaPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    setShowMediaModal(true);
  };

  const handleSendMedia = async () => {
    if (!selectedMedia || !contatoId) return;

    const mediaType = getMediaType(selectedMedia.type);
    if (!mediaType) {
      toast.error('Tipo de arquivo não suportado');
      return;
    }

    // In a real app, you would upload to S3 first and get the URL
    // For now, we'll use a data URL (not recommended for production)
    const mediaUrl = mediaPreview || '';

    try {
      await sendMediaMutation.mutateAsync({
        contatoId,
        mediaUrl,
        caption: mediaCaption,
        mediaType: mediaType as 'image' | 'video' | 'audio' | 'document',
        instanceName: 'default',
      });
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
    }
  };

  const getMediaType = (mimeType: string): string | null => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('sheet')) {
      return 'document';
    }
    return null;
  };

  const getMediaIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const handleCall = () => {
    toast.info('Funcionalidade de ligação em desenvolvimento');
  };

  if (!contatoId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Selecione uma conversa</p>
      </div>
    );
  }

  if (loadingMessages) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation('/inbox')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-semibold text-foreground">Cliente #{contatoId}</h2>
            <p className="text-sm text-muted-foreground">Conversa ativa</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCall}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Ligar"
          >
            <Phone className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/5">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma mensagem ainda</p>
              <p className="text-xs mt-1">Comece a conversa digitando abaixo</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.remetente === 'usuario' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl shadow-sm transition-all ${
                    msg.remetente === 'usuario'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card text-foreground border border-border rounded-bl-none'
                  }`}
                >
                  {msg.tipo === 'imagem' && msg.arquivoUrl && (
                    <img 
                      src={msg.arquivoUrl} 
                      alt="Imagem" 
                      className="max-w-xs rounded-lg mb-2"
                    />
                  )}
                  {msg.tipo === 'audio' && msg.arquivoUrl && (
                    <audio 
                      src={msg.arquivoUrl} 
                      controls 
                      className="max-w-xs mb-2"
                    />
                  )}
                  {msg.tipo === 'arquivo' && msg.arquivoUrl && (
                    <a 
                      href={msg.arquivoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 mb-2 hover:opacity-80"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm underline">Arquivo</span>
                    </a>
                  )}
                  <p className="text-sm break-words">{msg.conteudo}</p>
                  <div className="flex items-center justify-end gap-1 mt-2">
                    <p className="text-xs opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {msg.remetente === 'usuario' && (
                      msg.lida ? (
                        <CheckCheck className="w-3 h-3" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground px-4 py-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card space-y-3 shadow-lg">
        <div className="flex gap-2">
          <button
            onClick={() => setShowOrderModal(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Criar pedido"
          >
            <ShoppingCart className="w-5 h-5 text-primary" />
          </button>
          <button
            onClick={() => setShowTagModal(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Adicionar etiqueta"
          >
            <Tag className="w-5 h-5 text-primary" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Anexar arquivo"
          >
            <Paperclip className="w-5 h-5 text-primary" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleMediaSelect}
            className="hidden"
          />
        </div>

        <div className="flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              setIsTyping(e.target.value.length > 0);
            }}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Digite uma mensagem... (Enter para enviar)"
            disabled={isSending}
            className="flex-1 rounded-full"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !messageText.trim()}
            size="icon"
            className="bg-primary hover:bg-primary/90 rounded-full"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Modals */}
      {showOrderModal && (
        <OrderModal
          contatoId={contatoId}
          onClose={() => setShowOrderModal(false)}
        />
      )}

      {showTagModal && (
        <TagModal
          contatoId={contatoId}
          onClose={() => setShowTagModal(false)}
        />
      )}

      {showMediaModal && selectedMedia && (
        <MediaModal
          file={selectedMedia}
          preview={mediaPreview}
          caption={mediaCaption}
          onCaptionChange={setMediaCaption}
          onSend={handleSendMedia}
          onClose={() => {
            setShowMediaModal(false);
            setSelectedMedia(null);
            setMediaPreview(null);
            setMediaCaption('');
          }}
          isSending={sendMediaMutation.isPending}
          mediaIcon={getMediaIcon(selectedMedia.type)}
        />
      )}
    </div>
  );
}

// Order Modal Component
function OrderModal({ contatoId, onClose }: { contatoId: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold mb-4">Criar Pedido</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Funcionalidade de pedidos em desenvolvimento
        </p>
        <Button onClick={onClose} className="w-full">
          Fechar
        </Button>
      </Card>
    </div>
  );
}

// Tag Modal Component
function TagModal({ contatoId, onClose }: { contatoId: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold mb-4">Adicionar Etiqueta</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Funcionalidade de etiquetas em desenvolvimento
        </p>
        <Button onClick={onClose} className="w-full">
          Fechar
        </Button>
      </Card>
    </div>
  );
}

// Media Modal Component
function MediaModal({
  file,
  preview,
  caption,
  onCaptionChange,
  onSend,
  onClose,
  isSending,
  mediaIcon,
}: {
  file: File;
  preview: string | null;
  caption: string;
  onCaptionChange: (caption: string) => void;
  onSend: () => void;
  onClose: () => void;
  isSending: boolean;
  mediaIcon: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Enviar Arquivo</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {preview && (
          <div className="mb-4 rounded-lg overflow-hidden bg-muted p-2">
            {file.type.startsWith('image/') && (
              <img src={preview} alt="Preview" className="w-full rounded" />
            )}
            {file.type.startsWith('video/') && (
              <video src={preview} controls className="w-full rounded" />
            )}
            {file.type.startsWith('audio/') && (
              <audio src={preview} controls className="w-full" />
            )}
            {!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/') && (
              <div className="flex items-center justify-center py-8">
                {mediaIcon}
                <span className="ml-2 text-sm text-muted-foreground">{file.name}</span>
              </div>
            )}
          </div>
        )}

        <Input
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Adicionar legenda (opcional)"
          className="mb-4"
        />

        <div className="flex gap-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isSending}
          >
            Cancelar
          </Button>
          <Button
            onClick={onSend}
            className="flex-1 bg-primary hover:bg-primary/90"
            disabled={isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
