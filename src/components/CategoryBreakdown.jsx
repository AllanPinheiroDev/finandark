import React from 'react';
import { PieChart } from 'lucide-react';
import { CATEGORIES } from './BillFilter';
import { formatCurrencyBRL } from '../utils/dateUtils';

export function CategoryBreakdown({ bills }) {
  const totalAmount = bills.reduce((sum, b) => sum + Number(b.amount || 0), 0);

  if (totalAmount === 0) return null;

  // Agrupa contas por categoria
  const categoryMap = {};
  bills.forEach(bill => {
    const cat = bill.category || 'outros';
    if (!categoryMap[cat]) {
      categoryMap[cat] = {
        amount: 0,
        count: 0
      };
    }
    categoryMap[cat].amount += Number(bill.amount || 0);
    categoryMap[cat].count += 1;
  });

  const categoriesWithTotals = Object.keys(categoryMap).map(catId => {
    const catInfo = CATEGORIES.find(c => c.id === catId) || { label: catId, icon: '🏷️' };
    const amount = categoryMap[catId].amount;
    const percent = Math.round((amount / totalAmount) * 100);
    return {
      id: catId,
      label: catInfo.label,
      icon: catInfo.icon,
      amount,
      count: categoryMap[catId].count,
      percent
    };
  }).sort((a, b) => b.amount - a.amount);

  return (
    <div className="category-breakdown-card">
      <div className="breakdown-header">
        <div className="flex-row items-center gap-2">
          <PieChart size={18} className="text-purple" />
          <h3 className="breakdown-title">Distribuição de Gastos por Categoria</h3>
        </div>
        <span className="breakdown-total">Total: {formatCurrencyBRL(totalAmount)}</span>
      </div>

      <div className="breakdown-list">
        {categoriesWithTotals.map(item => (
          <div key={item.id} className="breakdown-row">
            <div className="breakdown-row-info">
              <span className="breakdown-cat-name">
                <span className="cat-emoji">{item.icon}</span>
                <span>{item.label}</span>
                <span className="cat-count-sub">({item.count})</span>
              </span>
              <span className="breakdown-cat-val">
                <strong>{formatCurrencyBRL(item.amount)}</strong>
                <span className="breakdown-percent">({item.percent}%)</span>
              </span>
            </div>
            <div className="breakdown-bar-bg">
              <div 
                className="breakdown-bar-fill" 
                style={{ width: `${item.percent}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
