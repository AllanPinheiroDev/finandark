import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  PiggyBank, 
  AlertTriangle 
} from 'lucide-react';
import { formatCurrencyBRL } from '../utils/dateUtils';

export function FinancialSummary({ salary, bills, onOpenSalaryModal }) {
  const totalSalary = Number(salary.amount || 0) + Number(salary.extraIncome || 0);

  // Total de contas pendentes
  const pendingBills = bills.filter(b => b.status === 'pending');
  const totalPending = pendingBills.reduce((acc, b) => acc + Number(b.amount || 0), 0);

  // Total já pago
  const paidBills = bills.filter(b => b.status === 'paid');
  const totalPaid = paidBills.reduce((acc, b) => acc + Number(b.amount || 0), 0);

  // Total geral de despesas do mês
  const totalExpenses = totalPending + totalPaid;

  // Saldo final previsto após pagar todas as contas
  const remainingProjected = totalSalary - totalExpenses;

  // Porcentagem de comprometimento da renda
  const commitmentPercent = totalSalary > 0 
    ? Math.min(Math.round((totalExpenses / totalSalary) * 100), 100) 
    : 0;

  // Status de saúde financeira
  let healthColor = 'status-green';
  let healthLabel = 'Saudável (Gastos controlados)';
  if (commitmentPercent > 80) {
    healthColor = 'status-red';
    healthLabel = 'Crítico (Mais de 80% do salário comprometido)';
  } else if (commitmentPercent > 60) {
    healthColor = 'status-yellow';
    healthLabel = 'Moderado (Atenção aos novos gastos)';
  }

  return (
    <section className="summary-section">
      <div className="summary-grid">
        {/* Card 1: Salário / Renda */}
        <div className="summary-card card-salary">
          <div className="card-top">
            <span className="card-label">Meu Salário & Renda</span>
            <button 
              type="button" 
              className="btn-card-edit" 
              onClick={onOpenSalaryModal}
              title="Alterar valor do salário ou dia de recebimento"
            >
              <Edit3 size={15} />
              <span>Editar</span>
            </button>
          </div>
          <div className="card-value-wrap">
            <span className="card-value text-emerald">{formatCurrencyBRL(totalSalary)}</span>
          </div>
          <div className="card-footer">
            <span className="salary-payday-pill">
              Recebimento todo dia <strong>{salary.payDay || 5}</strong>
            </span>
            {Number(salary.extraIncome || 0) > 0 && (
              <span className="extra-income-tag">
                + {formatCurrencyBRL(salary.extraIncome)} extra
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Contas a Pagar (Pendentes) */}
        <div className="summary-card card-pending">
          <div className="card-top">
            <span className="card-label">Total a Pagar (Pendentes)</span>
            <div className="card-icon-tag bg-amber">
              <Clock size={16} />
            </div>
          </div>
          <div className="card-value-wrap">
            <span className="card-value text-amber">{formatCurrencyBRL(totalPending)}</span>
          </div>
          <div className="card-footer">
            <span className="footer-subtext">
              <strong>{pendingBills.length}</strong> {pendingBills.length === 1 ? 'conta aguardando' : 'contas aguardando'}
            </span>
          </div>
        </div>

        {/* Card 3: Total Já Pago */}
        <div className="summary-card card-paid">
          <div className="card-top">
            <span className="card-label">Total Já Pago</span>
            <div className="card-icon-tag bg-emerald">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="card-value-wrap">
            <span className="card-value text-green">{formatCurrencyBRL(totalPaid)}</span>
          </div>
          <div className="card-footer">
            <span className="footer-subtext">
              <strong>{paidBills.length}</strong> {paidBills.length === 1 ? 'conta liquidada' : 'contas liquidadas'}
            </span>
          </div>
        </div>

        {/* Card 4: Saldo Restante Projetado */}
        <div className="summary-card card-balance">
          <div className="card-top">
            <span className="card-label">Saldo Livre Projetado</span>
            <div className={`card-icon-tag ${remainingProjected >= 0 ? 'bg-cyan' : 'bg-rose'}`}>
              <PiggyBank size={16} />
            </div>
          </div>
          <div className="card-value-wrap">
            <span className={`card-value ${remainingProjected >= 0 ? 'text-cyan' : 'text-rose'}`}>
              {formatCurrencyBRL(remainingProjected)}
            </span>
          </div>
          <div className="card-footer">
            <span className={`balance-badge ${remainingProjected >= 0 ? 'badge-surplus' : 'badge-deficit'}`}>
              {remainingProjected >= 0 ? '✓ Sobra após despesas' : '⚠ Despesas superam salário!'}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Progresso de Comprometimento de Renda */}
      <div className="financial-health-bar-card">
        <div className="health-bar-header">
          <div className="health-bar-title-group">
            <span className="health-title">Comprometimento do Salário</span>
            <span className={`health-status-badge ${healthColor}`}>
              {healthLabel}
            </span>
          </div>
          <span className="health-percent-text">
            <strong>{commitmentPercent}%</strong> do salário
          </span>
        </div>
        
        <div className="health-progress-track">
          <div 
            className={`health-progress-fill ${healthColor}`}
            style={{ width: `${Math.min(commitmentPercent, 100)}%` }}
          ></div>
        </div>

        <div className="health-bar-footer">
          <span>Total de Despesas: {formatCurrencyBRL(totalExpenses)}</span>
          <span>Salário Líquido: {formatCurrencyBRL(totalSalary)}</span>
        </div>
      </div>
    </section>
  );
}
