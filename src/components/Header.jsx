import React from 'react';
import { 
  Wallet, 
  Bell, 
  PlusCircle, 
  ShieldCheck, 
  AlertCircle, 
  Volume2, 
  VolumeX,
  Sparkles
} from 'lucide-react';
import { formatDateBR } from '../utils/dateUtils';

export function Header({ 
  onOpenAddBill, 
  onOpenNotificationCenter, 
  alertCount, 
  hasUrgentToday,
  permissionStatus,
  onRequestPermission,
  soundEnabled,
  onToggleSound,
  onOpenSalaryModal
}) {
  const todayStr = formatDateBR(new Date().toISOString().slice(0, 10));

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand-logo">
          <div className="logo-icon-wrapper">
            <Wallet className="logo-icon" size={24} />
          </div>
          <div>
            <div className="brand-title-wrap">
              <h1 className="brand-title">FinanDark</h1>
              <span className="brand-badge">PRO</span>
            </div>
            <p className="brand-subtitle">Controle Financeiro & Notificações Inteligentes</p>
          </div>
        </div>
      </div>

      <div className="header-right">
        {/* Indicador de Data de Hoje */}
        <div className="date-pill">
          <span className="pulse-dot"></span>
          <span>Hoje: <strong>{todayStr}</strong></span>
        </div>

        {/* Botão de Som */}
        <button 
          type="button"
          className="icon-action-btn"
          onClick={onToggleSound}
          title={soundEnabled ? 'Som das notificações ativado' : 'Som desativado'}
        >
          {soundEnabled ? <Volume2 size={18} className="text-emerald" /> : <VolumeX size={18} className="text-muted" />}
        </button>

        {/* Status de Notificação do Navegador */}
        {permissionStatus !== 'granted' ? (
          <button 
            type="button" 
            className="btn-permission-alert"
            onClick={onRequestPermission}
            title="Clique para ativar notificações no Windows/Navegador"
          >
            <AlertCircle size={16} />
            <span>Ativar Notificações</span>
          </button>
        ) : (
          <div className="permission-active-badge" title="Notificações nativas do navegador autorizadas">
            <ShieldCheck size={16} className="text-emerald" />
            <span>Alertas Ativos</span>
          </div>
        )}

        {/* Central de Notificações com Badge */}
        <button 
          type="button" 
          className={`btn-notification-bell ${hasUrgentToday ? 'urgent-shake' : ''}`}
          onClick={onOpenNotificationCenter}
          title="Ver Central de Notificações e Vencimentos"
        >
          <Bell size={20} />
          {alertCount > 0 && (
            <span className={`notification-counter ${hasUrgentToday ? 'counter-danger' : 'counter-normal'}`}>
              {alertCount}
            </span>
          )}
        </button>

        {/* Botão Adicionar Conta */}
        <button 
          type="button" 
          className="btn-primary-glow"
          onClick={onOpenAddBill}
        >
          <PlusCircle size={18} />
          <span>Nova Conta</span>
        </button>
      </div>
    </header>
  );
}
