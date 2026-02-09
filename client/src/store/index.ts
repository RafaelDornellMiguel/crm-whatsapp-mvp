/**
 * Store Zustand - Gerenciamento de estado global
 * Design Philosophy: Minimalismo Corporativo
 * 
 * IMPORTANTE: Todos os dados são carregados do backend via tRPC
 * Nenhum dado mockado ou localStorage
 * Store contém apenas estado de UI e cache local
 */

import { create } from 'zustand';
import type {
  Contact,
  Lead,
  Message,
  Product,
  Order,
  Referral,
  PhoneNumber,
  Schedule,
  MessageMetrics,
  VendedorMetrics,
  LeadStatus,
  OrderStatus,
  ReferralStatus,
  LeadTag,
} from '@/types';

interface CRMStore {
  // Contacts - carregados via tRPC
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  getContact: (id: string) => Contact | undefined;

  // Leads - carregados via tRPC
  leads: Lead[];
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  updateLeadVendedor: (id: string, vendedorId: string, phoneNumberId: string) => void;
  updateLeadTags: (id: string, tags: LeadTag[]) => void;
  getLeadsByStatus: (status: LeadStatus) => Lead[];
  getLeadByContactId: (contactId: string) => Lead | undefined;
  getLeadsByVendedor: (vendedorId: string) => Lead[];
  getLeadsByTag: (tag: LeadTag) => Lead[];

  // Messages - carregados via tRPC
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  getMessagesByLeadId: (leadId: string) => Message[];
  getMessagesByVendedor: (vendedorId: string) => Message[];

  // Products - carregados via tRPC
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  updateProductStock: (id: string, quantity: number) => void;
  getProduct: (id: string) => Product | undefined;

  // Orders - carregados via tRPC
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  getOrdersByLeadId: (leadId: string) => Order[];
  getOrdersByVendedor: (vendedorId: string) => Order[];

  // Referrals - carregados via tRPC
  referrals: Referral[];
  setReferrals: (referrals: Referral[]) => void;
  addReferral: (referral: Referral) => void;
  updateReferralStatus: (id: string, status: ReferralStatus) => void;
  getReferralsByReferrerId: (referrerId: string) => Referral[];

  // Phone Numbers - carregados via tRPC
  phoneNumbers: PhoneNumber[];
  setPhoneNumbers: (phones: PhoneNumber[]) => void;
  addPhoneNumber: (phone: PhoneNumber) => void;
  updatePhoneNumber: (id: string, phone: Partial<PhoneNumber>) => void;
  deletePhoneNumber: (id: string) => void;
  getPhoneNumbersByVendedor: (vendedorId: string) => PhoneNumber[];

  // Schedules - carregados via tRPC
  schedules: Schedule[];
  setSchedules: (schedules: Schedule[]) => void;
  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (id: string, schedule: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  getSchedules: () => Schedule[];
  getSchedulesByVendedor: (vendedorId: string) => Schedule[];

  // Metrics (carregados via tRPC)
  messageMetrics: MessageMetrics[];
  updateMessageMetrics: (leadId: string, vendedorId: string, timestamp: Date, sender: 'user' | 'contact') => void;
  getVendedorMetrics: (vendedorId: string) => VendedorMetrics | null;
  getAllVendedoresMetrics: () => VendedorMetrics[];

  // UI State
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string | null) => void;
  selectedContactId: string | null;
  setSelectedContactId: (id: string | null) => void;
  currentUserRole: 'vendedor' | 'gerente' | 'dono';
  setCurrentUserRole: (role: 'vendedor' | 'gerente' | 'dono') => void;
  currentVendedorId: string | null;
  setCurrentVendedorId: (id: string | null) => void;
  
  // WebSocket
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

export const useCRMStore = create<CRMStore>((set, get) => ({
  // Dados vazios - serão preenchidos via tRPC
  contacts: [],
  setContacts: (contacts: Contact[]) => set({ contacts }),
  leads: [],
  setLeads: (leads: Lead[]) => set({ leads }),
  messages: [],
  setMessages: (messages: Message[]) => set({ messages }),
  products: [],
  setProducts: (products: Product[]) => set({ products }),
  orders: [],
  setOrders: (orders: Order[]) => set({ orders }),
  referrals: [],
  setReferrals: (referrals: Referral[]) => set({ referrals }),
  phoneNumbers: [],
  setPhoneNumbers: (phones: PhoneNumber[]) => set({ phoneNumbers: phones }),
  schedules: [],
  setSchedules: (schedules: Schedule[]) => set({ schedules }),
  messageMetrics: [] as MessageMetrics[],
  
  // Contacts
  addContact: (contact: Contact) => set((state) => ({ contacts: [...state.contacts, contact] })),
  updateContact: (id: string, updates: Partial<Contact>) => set((state) => ({
    contacts: state.contacts.map((c) => c.id === id ? { ...c, ...updates } : c),
  })),
  getContact: (id: string) => get().contacts.find((c) => c.id === id),

  // Leads
  addLead: (lead: Lead) => set((state) => ({ leads: [...state.leads, lead] })),
  updateLead: (id: string, updates: Partial<Lead>) => set((state) => ({
    leads: state.leads.map((l) => l.id === id ? { ...l, ...updates, updatedAt: new Date() } : l),
  })),
  updateLeadStatus: (id: string, status: LeadStatus) => set((state) => ({
    leads: state.leads.map((l) => l.id === id ? { ...l, status, updatedAt: new Date() } : l),
  })),
  updateLeadVendedor: (id: string, vendedorId: string, phoneNumberId: string) => set((state) => ({
    leads: state.leads.map((l) => l.id === id ? { ...l, vendedorId, phoneNumberId, updatedAt: new Date() } : l),
  })),
  updateLeadTags: (id: string, tags: LeadTag[]) => set((state) => ({
    leads: state.leads.map((l) => l.id === id ? { ...l, tags, updatedAt: new Date() } : l),
  })),
  getLeadsByStatus: (status: LeadStatus) => get().leads.filter((l) => l.status === status),
  getLeadByContactId: (contactId: string) => get().leads.find((l) => l.contactId === contactId),
  getLeadsByVendedor: (vendedorId: string) => get().leads.filter((l) => l.vendedorId === vendedorId),
  getLeadsByTag: (tag: LeadTag) => get().leads.filter((l) => l.tags?.includes(tag)),

  // Messages
  addMessage: (message: Message) => {
    set((state) => ({ messages: [...state.messages, message] }));
    if (message.vendedorId) {
      get().updateMessageMetrics(message.leadId, message.vendedorId, message.timestamp, message.sender);
    }
  },
  getMessagesByLeadId: (leadId: string) => {
    const messages = get().messages.filter((m) => m.leadId === leadId);
    return messages.sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp as any).getTime();
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp as any).getTime();
      return timeA - timeB;
    });
  },
  getMessagesByVendedor: (vendedorId: string) => {
    const messages = get().messages.filter((m) => m.vendedorId === vendedorId);
    return messages.sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp as any).getTime();
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp as any).getTime();
      return timeA - timeB;
    });
  },

  // Products
  addProduct: (product: Product) => set((state) => ({ products: [...state.products, product] })),
  updateProduct: (id: string, updates: Partial<Product>) => set((state) => ({
    products: state.products.map((p) => p.id === id ? { ...p, ...updates } : p),
  })),
  updateProductStock: (id: string, quantity: number) => set((state) => ({
    products: state.products.map((p) => p.id === id ? { ...p, stock: quantity } : p),
  })),
  getProduct: (id: string) => get().products.find((p) => p.id === id),

  // Orders
  addOrder: (order: Order) => set((state) => ({ orders: [...state.orders, order] })),
  updateOrderStatus: (id: string, status: OrderStatus) => set((state) => ({
    orders: state.orders.map((o) => o.id === id ? { ...o, status, updatedAt: new Date() } : o),
  })),
  getOrdersByLeadId: (leadId: string) => get().orders.filter((o) => o.leadId === leadId),
  getOrdersByVendedor: (vendedorId: string) => {
    const leads = get().leads.filter((l) => l.vendedorId === vendedorId);
    const leadIds = leads.map((l) => l.id);
    return get().orders.filter((o) => leadIds.includes(o.leadId));
  },

  // Referrals
  addReferral: (referral: Referral) => set((state) => ({ referrals: [...state.referrals, referral] })),
  updateReferralStatus: (id: string, status: ReferralStatus) => set((state) => ({
    referrals: state.referrals.map((r) => r.id === id ? { ...r, status, updatedAt: new Date() } : r),
  })),
  getReferralsByReferrerId: (referrerId: string) => get().referrals.filter((r) => r.referrerId === referrerId),

  // Phone Numbers
  addPhoneNumber: (phone: PhoneNumber) => set((state) => ({ phoneNumbers: [...state.phoneNumbers, phone] })),
  updatePhoneNumber: (id: string, updates: Partial<PhoneNumber>) => set((state) => ({
    phoneNumbers: state.phoneNumbers.map((p) => p.id === id ? { ...p, ...updates } : p),
  })),
  deletePhoneNumber: (id: string) => set((state) => ({
    phoneNumbers: state.phoneNumbers.filter((p) => p.id !== id),
  })),
  getPhoneNumbersByVendedor: (vendedorId: string) => get().phoneNumbers.filter((p) => p.vendedorId === vendedorId),

  // Schedules
  addSchedule: (schedule: Schedule) => set((state) => ({ schedules: [...state.schedules, schedule] })),
  updateSchedule: (id: string, updates: Partial<Schedule>) => set((state) => ({
    schedules: state.schedules.map((s) => s.id === id ? { ...s, ...updates } : s),
  })),
  deleteSchedule: (id: string) => set((state) => ({
    schedules: state.schedules.filter((s) => s.id !== id),
  })),
  getSchedules: () => get().schedules,
  getSchedulesByVendedor: (vendedorId: string) => get().schedules.filter((s) => s.participantes?.includes(vendedorId)),

  // Metrics
  updateMessageMetrics: (leadId: string, vendedorId: string, timestamp: Date, sender: 'user' | 'contact') => {
    // Métrica é atualizada via tRPC, não localmente
    // Este método é mantido para compatibilidade
  },
  getVendedorMetrics: (vendedorId: string) => {
    // Métricas são carregadas via tRPC
    return null;
  },
  getAllVendedoresMetrics: () => {
    // Métricas são carregadas via tRPC
    return [];
  },

  // UI State
  selectedLeadId: null,
  setSelectedLeadId: (id: string | null) => set({ selectedLeadId: id }),
  selectedContactId: null,
  setSelectedContactId: (id: string | null) => set({ selectedContactId: id }),
  currentUserRole: 'vendedor' as const,
  setCurrentUserRole: (role: 'vendedor' | 'gerente' | 'dono') => set({ currentUserRole: role }),
  currentVendedorId: null,
  setCurrentVendedorId: (id: string | null) => set({ currentVendedorId: id }),
  
  isConnected: false,
  setIsConnected: (connected: boolean) => set({ isConnected: connected }),
  unreadCount: 0,
  setUnreadCount: (count: number) => set({ unreadCount: count }),
}));
