/**
 * Store Zustand - Gerenciamento de estado global
 * Design Philosophy: Minimalismo Corporativo
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Contact,
  Lead,
  Message,
  Product,
  Order,
  Referral,
  LeadStatus,
  OrderStatus,
  ReferralStatus,
} from '@/types';

interface CRMStore {
  // Contacts
  contacts: Contact[];
  addContact: (contact: Contact) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  getContact: (id: string) => Contact | undefined;

  // Leads
  leads: Lead[];
  addLead: (lead: Lead) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  getLeadsByStatus: (status: LeadStatus) => Lead[];
  getLeadByContactId: (contactId: string) => Lead | undefined;

  // Messages
  messages: Message[];
  addMessage: (message: Message) => void;
  getMessagesByLeadId: (leadId: string) => Message[];

  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProductStock: (id: string, quantity: number) => void;
  getProduct: (id: string) => Product | undefined;

  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  getOrdersByLeadId: (leadId: string) => Order[];

  // Referrals
  referrals: Referral[];
  addReferral: (referral: Referral) => void;
  updateReferralStatus: (id: string, status: ReferralStatus) => void;
  getReferralsByReferrerId: (referrerId: string) => Referral[];

  // UI State
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string | null) => void;
  selectedContactId: string | null;
  setSelectedContactId: (id: string | null) => void;
}

// Dados iniciais mockados
const initialContacts: Contact[] = [
  {
    id: 'c1',
    name: 'João Silva',
    phone: '(11) 99999-1111',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'c2',
    name: 'Maria Santos',
    phone: '(11) 98888-2222',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'c3',
    name: 'Pedro Oliveira',
    phone: '(11) 97777-3333',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'c4',
    name: 'Ana Costa',
    phone: '(11) 96666-4444',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'c5',
    name: 'Carlos Ferreira',
    phone: '(11) 95555-5555',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

const initialLeads: Lead[] = [
  {
    id: 'l1',
    contactId: 'c1',
    status: 'convertido',
    origin: 'whatsapp',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'l2',
    contactId: 'c2',
    status: 'atendimento',
    origin: 'whatsapp',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'l3',
    contactId: 'c3',
    status: 'novo',
    origin: 'indicacao',
    referrerId: 'c1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'l4',
    contactId: 'c4',
    status: 'novo',
    origin: 'whatsapp',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'l5',
    contactId: 'c5',
    status: 'perdido',
    origin: 'whatsapp',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
];

const initialMessages: Message[] = [
  { id: 'm1', leadId: 'l1', sender: 'contact', content: 'Olá, tudo bem?', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
  { id: 'm2', leadId: 'l1', sender: 'user', content: 'Oi João! Tudo certo! Como posso ajudar?', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 60000) },
  { id: 'm3', leadId: 'l1', sender: 'contact', content: 'Gostaria de saber mais sobre seus produtos', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 120000) },
  { id: 'm4', leadId: 'l1', sender: 'user', content: 'Claro! Temos ótimas opções. Qual seu interesse?', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 180000) },
  
  { id: 'm5', leadId: 'l2', sender: 'contact', content: 'Oi, preciso de um orçamento', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
  { id: 'm6', leadId: 'l2', sender: 'user', content: 'Ótimo! Qual é o seu projeto?', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 60000) },
  
  { id: 'm7', leadId: 'l3', sender: 'contact', content: 'João me indicou vocês', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { id: 'm8', leadId: 'l3', sender: 'user', content: 'Que legal! Bem-vindo! 🎉', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60000) },
];

const initialProducts: Product[] = [
  {
    id: 'p1',
    name: 'Produto Premium A',
    price: 299.90,
    stock: 15,
    sku: 'SKU-001',
    description: 'Produto de alta qualidade',
  },
  {
    id: 'p2',
    name: 'Produto Standard B',
    price: 149.90,
    stock: 8,
    sku: 'SKU-002',
    description: 'Produto versátil e confiável',
  },
  {
    id: 'p3',
    name: 'Produto Economy C',
    price: 79.90,
    stock: 2,
    sku: 'SKU-003',
    description: 'Opção econômica',
  },
  {
    id: 'p4',
    name: 'Serviço Premium',
    price: 499.90,
    stock: 20,
    sku: 'SKU-004',
    description: 'Serviço completo com suporte',
  },
];

const initialOrders: Order[] = [
  {
    id: 'o1',
    leadId: 'l1',
    items: [
      { productId: 'p1', quantity: 2, price: 299.90 },
      { productId: 'p3', quantity: 1, price: 79.90 },
    ],
    totalAmount: 679.70,
    status: 'finalizado',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

const initialReferrals: Referral[] = [
  {
    id: 'ref1',
    referrerId: 'c1',
    referredContactId: 'c3',
    referredLeadId: 'l3',
    status: 'indicada',
    channel: 'whatsapp',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
];

export const useCRMStore = create<CRMStore>()(
  persist(
    (set, get) => ({
      // Initial state
      contacts: initialContacts,
      leads: initialLeads,
      messages: initialMessages,
      products: initialProducts,
      orders: initialOrders,
      referrals: initialReferrals,
      selectedLeadId: null,
      selectedContactId: null,

      // Contact methods
      addContact: (contact) => {
        set((state) => ({
          contacts: [...state.contacts, contact],
        }));
      },
      updateContact: (id, updates) => {
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },
      getContact: (id) => {
        return get().contacts.find((c) => c.id === id);
      },

      // Lead methods
      addLead: (lead) => {
        set((state) => ({
          leads: [...state.leads, lead],
        }));
      },
      updateLeadStatus: (id, status) => {
        set((state) => ({
          leads: state.leads.map((l) =>
            l.id === id ? { ...l, status, updatedAt: new Date() } : l
          ),
        }));
      },
      getLeadsByStatus: (status) => {
        return get().leads.filter((l) => l.status === status);
      },
      getLeadByContactId: (contactId) => {
        return get().leads.find((l) => l.contactId === contactId);
      },

      // Message methods
      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },
      getMessagesByLeadId: (leadId) => {
        return get()
          .messages.filter((m) => m.leadId === leadId)
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      },

      // Product methods
      addProduct: (product) => {
        set((state) => ({
          products: [...state.products, product],
        }));
      },
      updateProductStock: (id, quantity) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, stock: Math.max(0, p.stock - quantity) } : p
          ),
        }));
      },
      getProduct: (id) => {
        return get().products.find((p) => p.id === id);
      },

      // Order methods
      addOrder: (order) => {
        set((state) => ({
          orders: [...state.orders, order],
        }));
        // Atualizar estoque
        order.items.forEach((item) => {
          get().updateProductStock(item.productId, item.quantity);
        });
      },
      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status, updatedAt: new Date() } : o
          ),
        }));
      },
      getOrdersByLeadId: (leadId) => {
        return get().orders.filter((o) => o.leadId === leadId);
      },

      // Referral methods
      addReferral: (referral) => {
        set((state) => ({
          referrals: [...state.referrals, referral],
        }));
      },
      updateReferralStatus: (id, status) => {
        set((state) => ({
          referrals: state.referrals.map((r) =>
            r.id === id ? { ...r, status, updatedAt: new Date() } : r
          ),
        }));
      },
      getReferralsByReferrerId: (referrerId) => {
        return get().referrals.filter((r) => r.referrerId === referrerId);
      },

      // UI methods
      setSelectedLeadId: (id) => {
        set({ selectedLeadId: id });
      },
      setSelectedContactId: (id) => {
        set({ selectedContactId: id });
      },
    }),
    {
      name: 'crm-store',
    }
  )
);
