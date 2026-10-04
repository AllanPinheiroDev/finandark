import React from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  ShieldCheck, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Send, 
  Clock, 
  CheckCircle, 
  ExternalLink 
} from 'lucide-react';
import { analyzeBillsForNotifications } from '../utils/notificationService';
import { formatCurrencyBRL, formatDateBR } from '../utils/dateUtils';

export function NotificationCenterModal({
  isOpen,
  onClose,
  bills,
  permissionStatus,
  onRequestPermission,
  soundEnabled,
  onToggleSound,
  onTestNotification
}) {
  if (!isOpen) return null;

  const { allAlerts } = analyzeBillsForNotifications(bills);

  return (
    <div className="modal-backdrop">
      <div className="modal-container modal-wide">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="flex-row items-center gap-2">
              <BellRing className="text-cyan" size={24} />
              <h2 className="modal-title">Central de Notificações & Alertas</h2>
            </div>
            <p className="modal-subtitle">
              Configuração e monitoramento dos avisos de 15 dias, 7 dias, 3 dias e vencimento no dia pela manhã.
            </p>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="notification-modal-content">
          {/* Caixa de Status e Configurações */}
          <div className="notification-config-panel">
            <div className="config-item">
              <div className="config-label-group">
                <span className="config-title">Notificações no Windows / Navegador</span>
                <span className="config-status">
                  {permissionStatus === 'granted' ? (
                    <span className="badge-granted"><ShieldCheck size={14} /> Ativado e Autorizado</span>
                  ) : permissionStatus === 'denied' ? (
                    <span className="badge-denied"><AlertTriangle size={14} /> Bloqueado no Navegador</span>
                  ) : (
                    <span className="badge-pending">Pendente de Autorização</span>
                  )}
                </span>
              </div>
              {permissionStatus !== 'granted' && (
                <button 
                  type="button" 
                  className="btn-enable-notifications"
                  onClick={onRequestPermission}
                >
                  Permitir Notificações
                </button>
              )}
            </div>

            <div className="config-item">
              <div className="config-label-group">
                <span className="config-title">Aviso Sonoro</span>
                <span className="config-desc">Emite um sinal sonoro ao disparar alertas</span>
              </div>
              <button 
                type="button" 
                className={`btn-sound-toggle ${soundEnabled ? 'sound-on' : 'sound-off'}`}
                onClick={onToggleSound}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 size={16} />
                    <span>Som Ativado</span>
                  </>
                ) : (
                  <>
                    <VolumeX size={16} />
                    <span>Som Mudo</span>
                  </>
                )}
              </button>
            </div>

            <div className="config-item">
              <div className="config-label-group">
                <span className="config-title">Horário do Lembrete Matinal</span>
                <span className="config-desc">Para contas que vencem no dia (diff = 0)</span>
              </div>
              <span className="pill-morning-time">🌅 Às 08:00 da manhã</span>
            </div>

            <div className="config-item">
              <div className="config-label-group">
                <span className="config-title">Teste em Tempo Real</span>
                <span className="config-desc">Dispara os alertas agora para você testar no seu computador</span>
              </div>
              <button 
                type="button" 
                className="btn-trigger-test"
                onClick={onTestNotification}
              >
                <Send size={15} />
                <span>Disparar Notificações Agora</span>
              </button>
            </div>
          </div>

          {/* Lista de Alertas Ativos */}
          <div className="active-alerts-section">
            <h3 className="alerts-section-heading">
              Alertas Ativos Detectados ({allAlerts.length})
            </h3>

            {allAlerts.length === 0 ? (
              <div className="no-alerts-card">
                <CheckCircle size={32} className="text-emerald" />
                <p>Nenhuma notificação pendente no momento!</p>
                <span>Todas as contas estão pagas ou com vencimentos em períodos sem alertas.</span>
              </div>
            ) : (
              <div className="alerts-feed">
                {allAlerts.map(alert => {
                  let alertBadgeClass = 'alert-badge-info';
                  if (alert.urgency === 'critical') alertBadgeClass = 'alert-badge-critical';
                  if (alert.urgency === 'high') alertBadgeClass = 'alert-badge-high';
                  if (alert.urgency === 'medium') alertBadgeClass = 'alert-badge-medium';

                  return (
                    <div key={alert.id} className={`alert-card ${alertBadgeClass}`}>
                      <div className="alert-card-header">
                        <span className="alert-card-title">{alert.title}</span>
                        <span className="alert-tag">{alert.type.toUpperCase()}</span>
                      </div>
                      <p className="alert-card-message">{alert.message}</p>
                      {alert.bill && (
                        <div className="alert-bill-details">
                          <span>Vencimento: {formatDateBR(alert.bill.dueDate)}</span>
                          <span>Valor: {formatCurrencyBRL(alert.bill.amount)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
