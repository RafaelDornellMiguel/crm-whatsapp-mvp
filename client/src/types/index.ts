/**
 * Tipos compartilhados do CRM WhatsApp MVP
 * Design Philosophy: Minimalismo Corporativo
 */

export type LeadStatus = 'novo' | 'atendimento' | 'convertido' | 'perdido';
export type LeadOrigin = 'whatsapp' | 'indicacao';
export type OrderStatus = 'aberto' | 'confirmado' | 'finalizado';
export type ReferralStatus = 'indicada' | 'contato' | 'convertida' | 'perdida' | 'recompensada';

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

export interface DashboardMetrics {
  leadsRecebidos: number;
  leadsConvertidos: number;
  taxaConversao: number;
  pedidosCriados: number;
  vendaPorIndicacao: number;
  clientesQueIndicam: Array<{ name: string; count: number }>;
}
