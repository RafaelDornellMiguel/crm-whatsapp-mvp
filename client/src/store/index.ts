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
  PhoneNumber,
  Schedule,
  MessageMetrics,
  VendedorMetrics,
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
  updateLeadVendedor: (id: string, vendedorId: string, phoneNumberId: string) => void;
  getLeadsByStatus: (status: LeadStatus) => Lead[];
  getLeadByContactId: (contactId: string) => Lead | undefined;
  getLeadsByVendedor: (vendedorId: string) => Lead[];

  // Messages
  messages: Message[];
  addMessage: (message: Message) => void;
  getMessagesByLeadId: (leadId: string) => Message[];
  getMessagesByVendedor: (vendedorId: string) => Message[];

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
  getOrdersByVendedor: (vendedorId: string) => Order[];

  // Referrals
  referrals: Referral[];
  addReferral: (referral: Referral) => void;
  updateReferralStatus: (id: string, status: ReferralStatus) => void;
  getReferralsByReferrerId: (referrerId: string) => Referral[];

  // Phone Numbers
  phoneNumbers: PhoneNumber[];
  addPhoneNumber: (phone: PhoneNumber) => void;
  updatePhoneNumber: (id: string, phone: Partial<PhoneNumber>) => void;
  getPhoneNumbersByVendedor: (vendedorId: string) => PhoneNumber[];

  // Schedules
  schedules: Schedule[];
  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (id: string, schedule: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  getSchedules: () => Schedule[];
  getSchedulesByVendedor: (vendedorId: string) => Schedule[];

  // Metrics
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
    vendedorId: 'v1',
    phoneNumberId: 'p1',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'l2',
    contactId: 'c2',
    status: 'atendimento',
    origin: 'whatsapp',
    vendedorId: 'v2',
    phoneNumberId: 'p2',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'l3',
    contactId: 'c3',
    status: 'novo',
    origin: 'indicacao',
    referrerId: 'c1',
    vendedorId: 'v1',
    phoneNumberId: 'p1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'l4',
    contactId: 'c4',
    status: 'novo',
    origin: 'whatsapp',
    vendedorId: 'v3',
    phoneNumberId: 'p3',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'l5',
    contactId: 'c5',
    status: 'perdido',
    origin: 'whatsapp',
    vendedorId: 'v2',
    phoneNumberId: 'p2',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
];

const initialMessages: Message[] = [
  { id: 'm1', leadId: 'l1', sender: 'contact', content: 'Olá, tudo bem?', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), vendedorId: 'v1', phoneNumberId: 'p1' },
  { id: 'm2', leadId: 'l1', sender: 'user', content: 'Oi João! Tudo certo! Como posso ajudar?', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 60000), vendedorId: 'v1', phoneNumberId: 'p1' },
  { id: 'm3', leadId: 'l1', sender: 'contact', content: 'Gostaria de saber mais sobre seus produtos', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 120000), vendedorId: 'v1', phoneNumberId: 'p1' },
  { id: 'm4', leadId: 'l1', sender: 'user', content: 'Claro! Temos ótimas opções. Qual seu interesse?', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 180000), vendedorId: 'v1', phoneNumberId: 'p1' },
  
  { id: 'm5', leadId: 'l2', sender: 'contact', content: 'Oi, preciso de um orçamento', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), vendedorId: 'v2', phoneNumberId: 'p2' },
  { id: 'm6', leadId: 'l2', sender: 'user', content: 'Ótimo! Qual é o seu projeto?', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 120000), vendedorId: 'v2', phoneNumberId: 'p2' },
  
  { id: 'm7', leadId: 'l3', sender: 'contact', content: 'João me indicou vocês', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), vendedorId: 'v1', phoneNumberId: 'p1' },
  { id: 'm8', leadId: 'l3', sender: 'user', content: 'Que legal! Bem-vindo! 🎉', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60000), vendedorId: 'v1', phoneNumberId: 'p1' },
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

const initialPhoneNumbers: PhoneNumber[] = [
  {
    id: 'p1',
    number: '(11) 91111-1111',
    vendedorId: 'v1',
    vendedorName: 'Carlos Mendes',
    ativo: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'p2',
    number: '(11) 92222-2222',
    vendedorId: 'v2',
    vendedorName: 'Ana Silva',
    ativo: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'p3',
    number: '(11) 93333-3333',
    vendedorId: 'v3',
    vendedorName: 'Bruno Santos',
    ativo: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
];

const initialSchedules: Schedule[] = [
  {
    id: 'sch1',
    titulo: 'Treinamento com Colaboradores',
    descricao: 'Treinamento de novos produtos',
    tipo: 'treinamento',
    dataInicio: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    dataFim: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    local: 'Sala de Treinamento',
    participantes: ['v1', 'v2', 'v3'],
    createdAt: new Date(),
  },
  {
    id: 'sch2',
    titulo: 'Apresentação de Produto',
    descricao: 'Apresentação do novo produto para clientes',
    tipo: 'apresentacao',
    dataInicio: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    dataFim: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
    local: 'Auditório Principal',
    participantes: ['v1', 'v2'],
    createdAt: new Date(),
  },
  {
    id: 'sch3',
    titulo: 'Reunião com Gerência',
    descricao: 'Reunião mensal de resultados',
    tipo: 'reuniao',
    dataInicio: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    dataFim: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
    local: 'Sala de Reuniões',
    createdAt: new Date(),
  },
];

const convertDateStringsToDate = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(convertDateStringsToDate);
  
  const converted: any = {};
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      converted[key] = new Date(value);
    } else if (typeof value === 'object') {
      converted[key] = convertDateStringsToDate(value);
    } else {
      converted[key] = value;
    }
  }
  return converted;
};

export const useCRMStore = create<CRMStore>()(
  persist(
    (set, get) => ({
      contacts: initialContacts,
      leads: initialLeads,
      messages: initialMessages,
      products: initialProducts,
      orders: initialOrders,
      referrals: initialReferrals,
      phoneNumbers: initialPhoneNumbers,
      schedules: initialSchedules,
      messageMetrics: [],
      selectedLeadId: null,
      selectedContactId: null,
      currentUserRole: 'vendedor' as const,
      currentVendedorId: 'v1',

      addContact: (contact: Contact) => set((state) => ({ contacts: [...state.contacts, contact] })),
      updateContact: (id: string, updates: Partial<Contact>) => set((state) => ({
        contacts: state.contacts.map((c) => c.id === id ? { ...c, ...updates } : c),
      })),
      getContact: (id: string) => get().contacts.find((c) => c.id === id),

      addLead: (lead: Lead) => set((state) => ({ leads: [...state.leads, lead] })),
      updateLeadStatus: (id: string, status: LeadStatus) => set((state) => ({
        leads: state.leads.map((l) => l.id === id ? { ...l, status, updatedAt: new Date() } : l),
      })),
      updateLeadVendedor: (id: string, vendedorId: string, phoneNumberId: string) => set((state) => ({
        leads: state.leads.map((l) => l.id === id ? { ...l, vendedorId, phoneNumberId, updatedAt: new Date() } : l),
      })),
      getLeadsByStatus: (status: LeadStatus) => get().leads.filter((l) => l.status === status),
      getLeadByContactId: (contactId: string) => get().leads.find((l) => l.contactId === contactId),
      getLeadsByVendedor: (vendedorId: string) => get().leads.filter((l) => l.vendedorId === vendedorId),

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

      addProduct: (product: Product) => set((state) => ({ products: [...state.products, product] })),
      updateProductStock: (id: string, quantity: number) => set((state) => ({
        products: state.products.map((p) => p.id === id ? { ...p, stock: Math.max(0, p.stock - quantity) } : p),
      })),
      getProduct: (id: string) => get().products.find((p) => p.id === id),

      addOrder: (order: Order) => {
        set((state) => ({ orders: [...state.orders, order] }));
        order.items.forEach((item) => get().updateProductStock(item.productId, item.quantity));
      },
      updateOrderStatus: (id: string, status: OrderStatus) => set((state) => ({
        orders: state.orders.map((o) => o.id === id ? { ...o, status, updatedAt: new Date() } : o),
      })),
      getOrdersByLeadId: (leadId: string) => get().orders.filter((o) => o.leadId === leadId),
      getOrdersByVendedor: (vendedorId: string) => {
        const vendedorLeads = get().getLeadsByVendedor(vendedorId);
        return get().orders.filter((o) => vendedorLeads.some((l) => l.id === o.leadId));
      },

      addReferral: (referral: Referral) => set((state) => ({ referrals: [...state.referrals, referral] })),
      updateReferralStatus: (id: string, status: ReferralStatus) => set((state) => ({
        referrals: state.referrals.map((r) => r.id === id ? { ...r, status, updatedAt: new Date() } : r),
      })),
      getReferralsByReferrerId: (referrerId: string) => get().referrals.filter((r) => r.referrerId === referrerId),

      addPhoneNumber: (phone: PhoneNumber) => set((state) => ({ phoneNumbers: [...state.phoneNumbers, phone] })),
      updatePhoneNumber: (id: string, updates: Partial<PhoneNumber>) => set((state) => ({
        phoneNumbers: state.phoneNumbers.map((p) => p.id === id ? { ...p, ...updates } : p),
      })),
      getPhoneNumbersByVendedor: (vendedorId: string) => get().phoneNumbers.filter((p) => p.vendedorId === vendedorId),

      addSchedule: (schedule: Schedule) => set((state) => ({ schedules: [...state.schedules, schedule] })),
      updateSchedule: (id: string, updates: Partial<Schedule>) => set((state) => ({
        schedules: state.schedules.map((s) => s.id === id ? { ...s, ...updates } : s),
      })),
      deleteSchedule: (id: string) => set((state) => ({ schedules: state.schedules.filter((s) => s.id !== id) })),
      getSchedules: () => {
        const schedules = get().schedules;
        return schedules.sort((a, b) => {
          const timeA = a.dataInicio instanceof Date ? a.dataInicio.getTime() : new Date(a.dataInicio as any).getTime();
          const timeB = b.dataInicio instanceof Date ? b.dataInicio.getTime() : new Date(b.dataInicio as any).getTime();
          return timeA - timeB;
        });
      },
      getSchedulesByVendedor: (vendedorId: string) => {
        const schedules = get().schedules.filter((s) => s.participantes?.includes(vendedorId));
        return schedules.sort((a, b) => {
          const timeA = a.dataInicio instanceof Date ? a.dataInicio.getTime() : new Date(a.dataInicio as any).getTime();
          const timeB = b.dataInicio instanceof Date ? b.dataInicio.getTime() : new Date(b.dataInicio as any).getTime();
          return timeA - timeB;
        });
      },

      updateMessageMetrics: (leadId: string, vendedorId: string, timestamp: Date, sender: 'user' | 'contact') => {
        const safeTimestamp = timestamp instanceof Date ? timestamp : new Date(timestamp);
        set((state) => {
          const existingMetric = state.messageMetrics.find((m) => m.leadId === leadId && m.vendedorId === vendedorId);
          if (existingMetric) {
            return {
              messageMetrics: state.messageMetrics.map((m) => {
                if (m.leadId === leadId && m.vendedorId === vendedorId) {
                  const totalMensagens = m.totalMensagens + 1;
                  const mensagensEnviadas = sender === 'user' ? m.mensagensEnviadas + 1 : m.mensagensEnviadas;
                  const mensagensRecebidas = sender === 'contact' ? m.mensagensRecebidas + 1 : m.mensagensRecebidas;
                  let tempoMedioResposta = m.tempoMedioResposta;
                  if (sender === 'user' && m.ultimaResposta) {
                    const ultimaRespostaTime = m.ultimaResposta instanceof Date ? m.ultimaResposta.getTime() : new Date(m.ultimaResposta as any).getTime();
                    const diffMs = safeTimestamp.getTime() - ultimaRespostaTime;
                    const diffMinutos = Math.round(diffMs / (1000 * 60));
                    tempoMedioResposta = Math.round((m.tempoMedioResposta * (totalMensagens - 1) + diffMinutos) / totalMensagens);
                  }
                  return { ...m, totalMensagens, mensagensEnviadas, mensagensRecebidas, ultimaResposta: sender === 'user' ? safeTimestamp : m.ultimaResposta, tempoMedioResposta };
                }
                return m;
              }),
            };
          }
          return {
            messageMetrics: [...state.messageMetrics, {
              leadId, vendedorId, primeiraResposta: sender === 'user' ? safeTimestamp : null, ultimaResposta: sender === 'user' ? safeTimestamp : null,
              tempoMedioResposta: 0, totalMensagens: 1, mensagensEnviadas: sender === 'user' ? 1 : 0, mensagensRecebidas: sender === 'contact' ? 1 : 0,
            }],
          };
        });
      },

      getVendedorMetrics: (vendedorId: string) => {
        const state = get();
        const vendedorLeads = state.leads.filter((l) => l.vendedorId === vendedorId);
        const vendedorOrders = state.getOrdersByVendedor(vendedorId);
        const vendedorMessages = state.getMessagesByVendedor(vendedorId);
        const phoneNumbers = state.getPhoneNumbersByVendedor(vendedorId);
        const phoneNumber = phoneNumbers[0]?.number || 'N/A';
        const vendedorName = phoneNumbers[0]?.vendedorName || 'Desconhecido';
        const leadsConvertidos = vendedorLeads.filter((l) => l.status === 'convertido').length;
        const taxaConversao = vendedorLeads.length > 0 ? (leadsConvertidos / vendedorLeads.length) * 100 : 0;
        const vendaTotal = vendedorOrders.filter((o) => o.status === 'finalizado').reduce((sum, o) => sum + o.totalAmount, 0);
        const vendedorMetrics = state.messageMetrics.filter((m) => m.vendedorId === vendedorId);
        const tempoMedioRespostaTMR = vendedorMetrics.length > 0 ? Math.round(vendedorMetrics.reduce((sum, m) => sum + m.tempoMedioResposta, 0) / vendedorMetrics.length) : 0;
        const ultimaAtividade = vendedorMessages.length > 0 ? vendedorMessages[vendedorMessages.length - 1].timestamp : new Date();
        return { vendedorId, vendedorName, phoneNumber, leadsAtribuidos: vendedorLeads.length, leadsConvertidos, taxaConversao, tempoMedioRespostaTMR, totalMensagens: vendedorMessages.length, pedidosCriados: vendedorOrders.length, vendaTotal, ultimaAtividade };
      },

      getAllVendedoresMetrics: () => {
        const state = get();
        const vendedorIds = new Set(state.leads.map((l) => l.vendedorId).filter(Boolean));
        return Array.from(vendedorIds).map((vendedorId) => state.getVendedorMetrics(vendedorId as string)).filter((m) => m !== null) as VendedorMetrics[];
      },

      setSelectedLeadId: (id: string | null) => set({ selectedLeadId: id }),
      setSelectedContactId: (id: string | null) => set({ selectedContactId: id }),
      setCurrentUserRole: (role: 'vendedor' | 'gerente' | 'dono') => set({ currentUserRole: role }),
      setCurrentVendedorId: (id: string | null) => set({ currentVendedorId: id }),
    }),
    {
      name: 'crm-store',
      merge: (persistedState: any, currentState: any) => {
        if (persistedState) {
          persistedState.contacts = convertDateStringsToDate(persistedState.contacts);
          persistedState.leads = convertDateStringsToDate(persistedState.leads);
          persistedState.messages = convertDateStringsToDate(persistedState.messages);
          persistedState.orders = convertDateStringsToDate(persistedState.orders);
          persistedState.referrals = convertDateStringsToDate(persistedState.referrals);
          persistedState.phoneNumbers = convertDateStringsToDate(persistedState.phoneNumbers);
          persistedState.schedules = convertDateStringsToDate(persistedState.schedules);
          persistedState.messageMetrics = convertDateStringsToDate(persistedState.messageMetrics);
        }
        return { ...currentState, ...persistedState };
      },
    }
  )
);
