/**
 * Sidebar - Navegação principal
 * Design Philosophy: Minimalismo Corporativo + Responsividade
 * - Sidebar responsivo com scroll suave
 * - Navegação clara com ícones
 * - Indicadores visuais de seção ativa
 * - Mobile-first com drawer
 */

import { Link, useLocation } from 'wouter';
import {
  MessageCircle,
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  Gift,
  BarChart3,
  Calendar,
  Shield,
  Menu,
  X,
  Phone,
  UserCircle,
  Zap,
  Clock,
  Moon,
  Sun,
  Cog,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/_core/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  section?: string;
}

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  // Agrupar itens por seção
  const navItems: NavItem[] = [
    // Comunicação
    { label: 'Conversas', href: '/', icon: <MessageCircle className="w-5 h-5" />, section: 'Comunicação' },
    { label: 'Conexões', href: '/connections', icon: <Phone className="w-5 h-5" />, section: 'Comunicação' },
    { label: 'Contatos', href: '/contacts', icon: <UserCircle className="w-5 h-5" />, section: 'Comunicação' },
    { label: 'Respostas Rápidas', href: '/quick-replies', icon: <Zap className="w-5 h-5" />, section: 'Comunicação' },
    { label: 'Mensagens Agendadas', href: '/scheduled-messages', icon: <Clock className="w-5 h-5" />, section: 'Comunicação' },

    // Vendas
    { label: 'Leads', href: '/leads', icon: <Users className="w-5 h-5" />, section: 'Vendas' },
    { label: 'Pedidos', href: '/orders', icon: <ShoppingCart className="w-5 h-5" />, section: 'Vendas' },
    { label: 'Indicações', href: '/referrals', icon: <Gift className="w-5 h-5" />, section: 'Vendas' },

    // Operações
    { label: 'Produtos & Estoque', href: '/products-inventory', icon: <Package className="w-5 h-5" />, section: 'Operações' },
    { label: 'Agendamentos', href: '/schedule', icon: <Calendar className="w-5 h-5" />, section: 'Operações' },

    // Administração
    { label: 'Dashboard', href: '/dashboard', icon: <BarChart3 className="w-5 h-5" />, section: 'Administração' },
    { label: 'Gerenciamento', href: '/manager', icon: <Shield className="w-5 h-5" />, section: 'Administração' },
    { label: 'Configurações', href: '/settings', icon: <Cog className="w-5 h-5" />, section: 'Administração' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location === '/';
    }
    return location.startsWith(href);
  };

  // Agrupar itens por seção
  const groupedItems = navItems.reduce((acc, item) => {
    const section = item.section || 'Outros';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const sections = ['Comunicação', 'Vendas', 'Operações', 'Administração'];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 hover:bg-secondary rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-72 bg-background border-r border-border transition-transform duration-300 z-40 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">GRUPO</h1>
              <p className="text-xs text-muted-foreground truncate">EVOLUTION</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-6 py-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {sections.map((section) => (
            groupedItems[section] && (
              <div key={section}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-3">
                  {section}
                </h3>
                <div className="space-y-1">
                  {groupedItems[section].map((item) => (
                    <Link key={item.href} href={item.href}>
                      <a
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                          isActive(item.href)
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-foreground hover:bg-secondary/80'
                        }`}
                      >
                        <span className={`flex-shrink-0 transition-colors ${
                          isActive(item.href) ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                        }`}>
                          {item.icon}
                        </span>
                        <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            )
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2 flex-shrink-0">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-foreground hover:bg-secondary/80 group"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
            )}
            <span className="text-sm font-medium">Modo {theme === 'dark' ? 'Claro' : 'Escuro'}</span>
          </button>

          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-foreground hover:bg-red-500/10 hover:text-red-600 group"
          >
            <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-red-600" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
