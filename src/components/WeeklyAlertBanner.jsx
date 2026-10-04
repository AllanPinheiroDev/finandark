import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  CheckCircle, 
  BellRing, 
  Sparkles, 
  ChevronRight,
  Flame,
  Send
} from 'lucide-react';
import { formatCurrencyBRL, formatDateBR, getDaysDiff } from '../utils/dateUtils';

export function WeeklyAlertBanner({ 
  bills, 
  onMarkPaid, 
  onTestNotification, 
  onOpenNotificationCenter 
}) {
  const [activeTab, setActiveTab] = useState('all-week'); // 'all-week' | 'today' | '3days' | '7days' | '15days'

  const pendingBills = bills.filter(b => b.status === 'pending');

  const todayBills = pendingBills.filter(b => getDaysDiff(b.dueDate) === 0);
  const threeDaysBills = pendingBills.filter(b => getDaysDiff(b.dueDate) === 3);
  const sevenDaysBills = pendingBills.filter(b => getDaysDiff(b.dueDate) === 7);
  const fifteenDaysBills = pendingBills.filter(b => getDaysDiff(b.dueDate) === 15);
  const thisWeekBills = pendingBills.filter(b => {
    const diff = getDaysDiff(b.dueDate);
    return diff >= 0 && diff <= 7;
  });
  const overdueBills = pendingBills.filter(b => getDaysDiff(b.dueDate) < 0);

  const totalWeekAmount = thisWeekBills.reduce((acc, b) => acc + Number(b.amount || 0), 0);

  // Seleciona a lista de acordo com a aba selecionada
  let displayedList = thisWeekBills;
  let tabTitle = 'Contas a Vencer Esta Semana';
  if (activeTab === 'today') {
    displayedList = todayBills;
    tabTitle = 'Vencimento Hoje (Lembrete da Manhã)';
  } else if (activeTab === '3days') {
    displayedList = threeDaysBills;
    tabTitle = 'Vencimento em Exatos 3 Dias';
  } else if (activeTab === '7days') {
    displayedList = sevenDaysBills;
    tabTitle = 'Vencimento em Exatos 7 Dias';
  } else if (activeTab === '15days') {
    displayedList = fifteenDaysBills;
    tabTitle = 'Vencimento em Exatos 15 Dias';
  } else if (activeTab === 'overdue') {
    displayedList = overdueBills;
    tabTitle = 'Contas Já Vencidas';
  }

  return (
    <section className="weekly-banner-card">
      {/* Alerta Crítico Superior se houver contas vencendo hoje ou atrasadas */}
      {todayBills.length > 0 && (
        <div className="urgent-flash-strip strip-today">
          <div className="strip-content">
            <Flame className="strip-icon animate-pulse" size={20} />
            <div>
              <strong>ATENÇÃO: Você tem {todayBills.length} conta(s) que VENCE HOJE!</strong>
              <p>Lembrete programado para a manhã. Não se esqueça de efetuar a quitação.</p>
            </div>
          </div>
          <button 
            type="button" 
            className="btn-strip-action"
            onClick={() => setActiveTab('today')}
          >
            Ver contas de hoje
          </button>
        </div>
      )}

      {overdueBills.length > 0 && todayBills.length === 0 && (
        <div className="urgent-flash-strip strip-overdue">
          <div className="strip-content">
            <AlertTriangle className="strip-icon" size={20} />
            <div>
              <strong>ALERTA: {overdueBills.length} conta(s) em atraso!</strong>
              <p>Regularize para evitar multas e juros bancários.</p>
            </div>
          </div>
          <button 
            type="button" 
            className="btn-strip-action"
            onClick={() => setActiveTab('overdue')}
          >
            Ver atrasadas
          </button>
        </div>
      )}

      {/* Cabeçalho do Banner de Notificações */}
      <div className="weekly-header">
        <div className="weekly-header-title">
          <div className="icon-glow-wrap">
            <BellRing size={20} className="text-cyan" />
          </div>
          <div>
            <h2 className="section-title">Central de Vencimentos & Notificações Programadas</h2>
            <p className="section-subtitle">
              Monitoramento automático: <strong>15 dias</strong>, <strong>7 dias</strong>, <strong>3 dias</strong> e <strong>no dia pela manhã</strong>.
            </p>
          </div>
        </div>

        <div className="weekly-actions">
          <button 
            type="button" 
            className="btn-test-notification"
            onClick={onTestNotification}
            title="Dispara a notificação de teste no navegador e toca o som"
          >
            <Send size={15} />
            <span>Testar Alertas Agora</span>
          </button>

          <button 
            type="button" 
            className="btn-view-all-alerts"
            onClick={onOpenNotificationCenter}
          >
            Ver Painel Completo
          </button>
        </div>
      </div>

      {/* Abas de Navegação pelos Prazos Específicos */}
      <div className="notification-pills-bar">
        <button 
          type="button" 
          className={`pill-btn ${activeTab === 'all-week' ? 'active' : ''}`}
          onClick={() => setActiveTab('all-week')}
        >
          <Calendar size={15} />
          <span>Nesta Semana ({thisWeekBills.length})</span>
          <span className="pill-amount">{formatCurrencyBRL(totalWeekAmount)}</span>
        </button>

        <button 
          type="button" 
          className={`pill-btn pill-today ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          <span className="dot dot-red"></span>
          <span>Hoje ({todayBills.length})</span>
        </button>

        <button 
          type="button" 
          className={`pill-btn pill-orange ${activeTab === '3days' ? 'active' : ''}`}
          onClick={() => setActiveTab('3days')}
        >
          <span className="dot dot-orange"></span>
          <span>Em 3 Dias ({threeDaysBills.length})</span>
        </button>

        <button 
          type="button" 
          className={`pill-btn pill-yellow ${activeTab === '7days' ? 'active' : ''}`}
          onClick={() => setActiveTab('7days')}
        >
          <span className="dot dot-yellow"></span>
          <span>Em 7 Dias ({sevenDaysBills.length})</span>
        </button>

        <button 
          type="button" 
          className={`pill-btn pill-blue ${activeTab === '15days' ? 'active' : ''}`}
          onClick={() => setActiveTab('15days')}
        >
          <span className="dot dot-blue"></span>
          <span>Em 15 Dias ({fifteenDaysBills.length})</span>
        </button>

        {overdueBills.length > 0 && (
          <button 
            type="button" 
            className={`pill-btn pill-overdue ${activeTab === 'overdue' ? 'active' : ''}`}
            onClick={() => setActiveTab('overdue')}
          >
            <span className="dot dot-danger"></span>
            <span>Atrasadas ({overdueBills.length})</span>
          </button>
        )}
      </div>

      {/* Lista Rápida de Contas Filtradas pelo Prazo */}
      <div className="weekly-content-box">
        <div className="tab-current-header">
          <span className="tab-heading">{tabTitle}</span>
          <span className="tab-count-tag">{displayedList.length} {displayedList.length === 1 ? 'item' : 'itens'}</span>
        </div>

        {displayedList.length === 0 ? (
          <div className="empty-notification-state">
            <CheckCircle size={32} className="text-emerald" />
            <p className="empty-text">Nenhuma conta pendente para este prazo específico.</p>
            <span className="empty-subtext">Você está em dia com esta faixa de vencimento!</span>
          </div>
        ) : (
          <div className="quick-bills-grid">
            {displayedList.map(bill => {
              const diff = getDaysDiff(bill.dueDate);
              let diffTag = `${diff} dias`;
              let diffClass = 'tag-blue';
              if (diff === 0) {
                diffTag = '🚨 Vence Hoje (Manhã)';
                diffClass = 'tag-red animate-pulse';
              } else if (diff === 3) {
                diffTag = '⚠️ Vence em 3 dias';
                diffClass = 'tag-orange';
              } else if (diff === 7) {
                diffTag = '📅 Vence em 7 dias';
                diffClass = 'tag-yellow';
              } else if (diff === 15) {
                diffTag = '🔔 Vence em 15 dias';
                diffClass = 'tag-blue';
              } else if (diff < 0) {
                diffTag = `⛔ Atrasada há ${Math.abs(diff)}d`;
                diffClass = 'tag-danger';
              }

              return (
                <div key={bill.id} className="quick-bill-card">
                  <div className="q-card-top">
                    <span className={`q-due-pill ${diffClass}`}>{diffTag}</span>
                    <span className="q-date">Vencimento: {formatDateBR(bill.dueDate)}</span>
                  </div>

                  <div className="q-card-mid">
                    <span className="q-title" title={bill.title}>{bill.title}</span>
                    <span className="q-amount">{formatCurrencyBRL(bill.amount)}</span>
                  </div>

                  {bill.notes && (
                    <p className="q-notes">{bill.notes}</p>
                  )}

                  <div className="q-card-actions">
                    <button 
                      type="button" 
                      className="btn-quick-pay"
                      onClick={() => onMarkPaid(bill.id)}
                    >
                      <CheckCircle size={15} />
                      <span>Marcar como Pago</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
