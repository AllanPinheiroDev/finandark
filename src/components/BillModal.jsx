import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, FileText, Check, Repeat } from 'lucide-react';
import { CATEGORIES } from './BillFilter';
import { formatDateToInput } from '../utils/dateUtils';

export function BillModal({ isOpen, onClose, onSave, editingBill }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(formatDateToInput(new Date()));
  const [category, setCategory] = useState('servicos');
  const [notes, setNotes] = useState('');
  const [recurring, setRecurring] = useState(true);

  useEffect(() => {
    if (editingBill) {
      setTitle(editingBill.title || '');
      setAmount(editingBill.amount ? String(editingBill.amount) : '');
      setDueDate(editingBill.dueDate || formatDateToInput(new Date()));
      setCategory(editingBill.category || 'servicos');
      setNotes(editingBill.notes || '');
      setRecurring(editingBill.recurring !== undefined ? editingBill.recurring : true);
    } else {
      setTitle('');
      setAmount('');
      setDueDate(formatDateToInput(new Date()));
      setCategory('servicos');
      setNotes('');
      setRecurring(true);
    }
  }, [editingBill, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Por favor, informe o nome ou descrição da conta.');
      return;
    }

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor, informe um valor válido maior que zero.');
      return;
    }

    if (!dueDate) {
      alert('Por favor, selecione a data de vencimento.');
      return;
    }

    onSave({
      id: editingBill ? editingBill.id : `bill-${Date.now()}`,
      title: title.trim(),
      amount: parsedAmount,
      dueDate,
      category,
      notes: notes.trim(),
      recurring,
      status: editingBill ? editingBill.status : 'pending',
      paidAt: editingBill ? editingBill.paidAt : null
    });

    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2 className="modal-title">
              {editingBill ? 'Editar Conta' : 'Nova Conta a Pagar'}
            </h2>
            <p className="modal-subtitle">
              Insira o valor e a data de vencimento para receber os alertas programados.
            </p>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Nome da Conta */}
          <div className="form-group">
            <label className="form-label">Nome / Descrição da Conta *</label>
            <div className="input-with-icon">
              <FileText size={18} className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Aluguel, Luz Enel, Cartão Nubank, Internet..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-row-2">
            {/* Valor */}
            <div className="form-group">
              <label className="form-label">Valor (R$) *</label>
              <div className="input-with-icon">
                <DollarSign size={18} className="input-icon" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Data de Vencimento */}
            <div className="form-group">
              <label className="form-label">Data de Vencimento *</label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <input
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Categoria */}
          <div className="form-group">
            <label className="form-label">Categoria</label>
            <div className="input-with-icon">
              <Tag size={18} className="input-icon" />
              <select
                className="form-input form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Observações */}
          <div className="form-group">
            <label className="form-label">Observações / Como pagar (Opcional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Código de barras no e-mail, Débito em conta, PIX..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Recorrente Switch */}
          <div className="form-checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                className="custom-checkbox"
              />
              <span className="checkbox-text">
                <strong>Conta Recorrente Mensal</strong> (Renova todo mês)
              </span>
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              <Check size={18} />
              <span>{editingBill ? 'Salvar Alterações' : 'Cadastrar Conta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
