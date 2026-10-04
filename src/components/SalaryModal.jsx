import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, PiggyBank, Check } from 'lucide-react';
import { formatCurrencyBRL } from '../utils/dateUtils';

export function SalaryModal({ isOpen, onClose, salary, onSave }) {
  const [amount, setAmount] = useState('');
  const [extraIncome, setExtraIncome] = useState('');
  const [payDay, setPayDay] = useState(5);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (salary) {
      setAmount(salary.amount ? String(salary.amount) : '');
      setExtraIncome(salary.extraIncome ? String(salary.extraIncome) : '0');
      setPayDay(salary.payDay || 5);
      setNotes(salary.notes || '');
    }
  }, [salary, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    const parsedExtra = parseFloat((extraIncome || '0').replace(',', '.'));

    if (isNaN(parsedAmount) || parsedAmount < 0) {
      alert('Por favor, informe um valor de salário válido.');
      return;
    }

    onSave({
      amount: parsedAmount,
      extraIncome: isNaN(parsedExtra) ? 0 : parsedExtra,
      payDay: Number(payDay) || 5,
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2 className="modal-title">Configurar Meu Salário & Renda</h2>
            <p className="modal-subtitle">
              Defina o valor do seu salário para acompanhar o saldo restante e o comprometimento das contas.
            </p>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Valor do Salário Líquido */}
          <div className="form-group">
            <label className="form-label">Valor do Salário Mensal (R$) *</label>
            <div className="input-with-icon">
              <DollarSign size={18} className="input-icon text-emerald" />
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input form-input-highlight"
                placeholder="Ex: 5000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
              />
            </div>
            <span className="input-hint">Informe seu salário líquido mensal após descontos.</span>
          </div>

          <div className="form-row-2">
            {/* Renda Extra */}
            <div className="form-group">
              <label className="form-label">Renda Extra / Freelance (R$)</label>
              <div className="input-with-icon">
                <PiggyBank size={18} className="input-icon" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="0,00"
                  value={extraIncome}
                  onChange={(e) => setExtraIncome(e.target.value)}
                />
              </div>
            </div>

            {/* Dia de Pagamento */}
            <div className="form-group">
              <label className="form-label">Dia do Recebimento (1 - 31)</label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <input
                  type="number"
                  min="1"
                  max="31"
                  className="form-input"
                  placeholder="5"
                  value={payDay}
                  onChange={(e) => setPayDay(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Anotação */}
          <div className="form-group">
            <label className="form-label">Descrição / Origem (Opcional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Salário Empresa XYZ + Vale"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              <Check size={18} />
              <span>Salvar Salário</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
