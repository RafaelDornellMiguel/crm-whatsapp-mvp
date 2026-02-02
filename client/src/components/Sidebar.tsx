/**
 * Sidebar - Navegação principal
 * Design Philosophy: Minimalismo Corporativo
 * - Sidebar persistente à esquerda
 * - Navegação clara com ícones
 * - Indicadores visuais de seção ativa
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
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: 'Inbox', href: '/', icon: <MessageCircle className="w-5 h-5" /> },
    { label: 'Leads', href: '/leads', icon: <Users className="w-5 h-5" /> },
    { label: 'Pedidos', href: '/orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { label: 'Estoque', href: '/inventory', icon: <Package className="w-5 h-5" /> },
    { label: 'Indicacoes', href: '/referrals', icon: <Gift className="w-5 h-5" /> },
    { label: 'Agendamentos', href: '/schedule', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Dashboard', href: '/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Gerenciamento', href: '/manager', icon: <Shield className="w-5 h-5" /> },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location === '/';
    }
    return location.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 hover:bg-secondary rounded-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">CRM</h1>
              <p className="text-xs text-sidebar-accent-foreground">WhatsApp MVP</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </a>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-accent-foreground space-y-1">
            <p className="font-medium">Possibilidades Futuras</p>
            <ul className="space-y-1 text-sidebar-accent-foreground/70">
              <li>• Automação de mensagens</li>
              <li>• Chatbot IA</li>
              <li>• Multiatendente</li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
