/**
 * Tipos compartilhados do CRM WhatsApp MVP
 * Design Philosophy: Minimalismo Corporativo
 */

export type LeadStatus = 'novo' | 'atendimento' | 'convertido' | 'perdido';
export type LeadOrigin = 'whatsapp' | 'indicacao';
export type OrderStatus = 'aberto' | 'confirmado' | 'finalizado';
export type ReferralStatus = 'indicada' | 'contato' | 'convertida' | 'perdida' | 'recompensada';
export type ScheduleType = 'reuniao' | 'treinamento' | 'apresentacao' | 'evento';
export type UserRole = 'vendedor' | 'gerente' | 'dono';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  createdAt: Date;
}

export interface Lead {
  id: string;
  contactId: string;
  status: LeadStatus;
  origin: LeadOrigin;
  referrerId?: string;
  vendedorId?: string;
  phoneNumberId?: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface Message {
  id: string;
  leadId: string;
  sender: 'user' | 'contact';
  content: string;
  timestamp: Date;
  phoneNumberId?: string;
  vendedorId?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
  description?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  leadId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredContactId: string;
  referredLeadId: string;
  status: ReferralStatus;
  channel: 'whatsapp' | 'link' | 'formulario';
  createdAt: Date;
  updatedAt: Date;
}

export interface PhoneNumber {
  id: string;
  number: string;
  vendedorId: string;
  vendedorName: string;
  ativo: boolean;
  createdAt: Date;
}

export interface Schedule {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: ScheduleType;
  dataInicio: Date;
  dataFim: Date;
  local?: string;
  participantes?: string[];
  vendedorId?: string;
  createdAt: Date;
}

export interface MessageMetrics {
  leadId: string;
  vendedorId: string;
  primeiraResposta: Date | null;
  ultimaResposta: Date | null;
  tempoMedioResposta: number;
  totalMensagens: number;
  mensagensEnviadas: number;
  mensagensRecebidas: number;
}

export interface VendedorMetrics {
  vendedorId: string;
  vendedorName: string;
  phoneNumber: string;
  leadsAtribuidos: number;
  leadsConvertidos: number;
  taxaConversao: number;
  tempoMedioRespostaTMR: number;
  totalMensagens: number;
  pedidosCriados: number;
  vendaTotal: number;
  ultimaAtividade: Date;
}

export interface DashboardMetrics {
  leadsRecebidos: number;
  leadsConvertidos: number;
  taxaConversao: number;
  pedidosCriados: number;
  vendaPorIndicacao: number;
  clientesQueIndicam: Array<{ name: string; count: number }>;
  vendedoresMetrics?: VendedorMetrics[];
}
