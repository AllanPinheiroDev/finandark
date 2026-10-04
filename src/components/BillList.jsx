import React from 'react';
import { 
  Check, 
  Trash2, 
  Edit3, 
  Calendar, 
  Tag, 
  AlertCircle, 
  RotateCcw,
  Sparkles,
  Inbox
} from 'lucide-react';
import { formatCurrencyBRL, formatDateBR, getDaysDiff, getDueStatusInfo } from '../utils/dateUtils';
import { CATEGORIES } from './BillFilter';

export function BillList({
  bills,
  onToggleStatus,
  onEditBill,
  onDeleteBill,
  onOpenAddBill
}) {
  const getCategoryInfo = (catId) => {
    return CATEGORIES.find(c => c.id === catId) || { label: catId, icon: '🏷️' };
  };

  if (bills.length === 0) {
    return (
      <div className="empty-bills-card">
        <div className="empty-bills-icon">
          <Inbox size={48} className="text-muted" />
        </div>
        <h3 className="empty-title">Nenhuma conta encontrada</h3>
        <p className="empty-desc">
          Não há contas correspondentes aos filtros selecionados ou nenhuma despesa cadastrada ainda.
        </p>
        <button 
          type="button" 
          className="btn-primary-glow mt-4"
          onClick={onOpenAddBill}
        >
          <Sparkles size={16} />
          <span>Cadastrar Nova Conta</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bills-grid">
      {bills.map(bill => {
        const isPaid = bill.status === 'paid';
        const statusInfo = getDueStatusInfo(bill.dueDate, isPaid);
        const catInfo = getCategoryInfo(bill.category);

        return (
          <div 
            key={bill.id} 
            className={`bill-card ${isPaid ? 'bill-card-paid' : ''} ${statusInfo.type === 'today' ? 'bill-card-urgent-today' : ''}`}
          >
            {/* Linha Superior: Categoria & Status de Vencimento */}
            <div className="bill-card-header">
              <span className="bill-category-badge">
                <span>{catInfo.icon}</span>
                <span>{catInfo.label}</span>
              </span>

              <span className={`bill-status-pill ${statusInfo.badgeClass}`}>
                {statusInfo.text}
              </span>
            </div>

            {/* Linha Central: Título e Valor */}
            <div className="bill-card-body">
              <h3 className={`bill-title ${isPaid ? 'line-through text-muted' : ''}`} title={bill.title}>
                {bill.title}
              </h3>
              <div className="bill-amount-wrap">
                <span className={`bill-amount ${isPaid ? 'text-paid' : 'text-primary-amount'}`}>
                  {formatCurrencyBRL(bill.amount)}
                </span>
              </div>
            </div>

            {/* Observações / Notas */}
            {bill.notes && (
              <p className="bill-notes">
                {bill.notes}
              </p>
            )}

            {/* Linha Inferior: Data de Vencimento e Ações */}
            <div className="bill-card-footer">
              <div className="bill-date-info">
                <Calendar size={14} className="text-secondary" />
                <span>Vencimento: <strong>{formatDateBR(bill.dueDate)}</strong></span>
              </div>

              <div className="bill-actions-group">
                {/* Botão Marcar como Pago / Reabrir */}
                <button
                  type="button"
                  className={`btn-action-status ${isPaid ? 'btn-reopen' : 'btn-mark-paid'}`}
                  onClick={() => onToggleStatus(bill.id)}
                  title={isPaid ? 'Marcar como não pago (Reabrir)' : 'Marcar como pago'}
                >
                  {isPaid ? (
                    <>
                      <RotateCcw size={14} />
                      <span>Reabrir</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Pagar</span>
                    </>
                  )}
                </button>

                {/* Botão Editar */}
                <button
                  type="button"
                  className="btn-icon-subtle"
                  onClick={() => onEditBill(bill)}
                  title="Editar conta"
                >
                  <Edit3 size={15} />
                </button>

                {/* Botão Excluir */}
                <button
                  type="button"
                  className="btn-icon-subtle btn-delete"
                  onClick={() => onDeleteBill(bill.id)}
                  title="Excluir conta"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
