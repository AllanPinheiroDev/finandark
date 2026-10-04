import React from 'react';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';

export const CATEGORIES = [
  { id: 'all', label: 'Todas as Categorias', icon: '📁' },
  { id: 'moradia', label: 'Moradia / Aluguel', icon: '🏠' },
  { id: 'cartao', label: 'Cartão de Crédito', icon: '💳' },
  { id: 'servicos', label: 'Contas & Serviços (Luz/Net)', icon: '⚡' },
  { id: 'alimentacao', label: 'Alimentação & Mercado', icon: '🛒' },
  { id: 'transporte', label: 'Transporte / Carro', icon: '🚗' },
  { id: 'saude', label: 'Saúde & Cuidados', icon: '🩺' },
  { id: 'lazer', label: 'Lazer & Assinaturas', icon: '🍿' },
  { id: 'outros', label: 'Outras Despesas', icon: '📦' },
];

export function BillFilter({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  totalCount,
  filteredCount
}) {
  return (
    <div className="filter-panel">
      {/* Linha Superior: Busca e Dropdowns */}
      <div className="filter-top-row">
        {/* Barra de Pesquisa */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar conta por nome ou observação..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button 
              type="button" 
              className="btn-clear-search"
              onClick={() => onSearchChange('')}
              title="Limpar busca"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Dropdown de Categorias */}
        <div className="dropdown-wrapper">
          <Filter size={16} className="dropdown-icon" />
          <select 
            value={selectedCategory} 
            onChange={(e) => onCategoryChange(e.target.value)}
            className="filter-select"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown de Ordenação */}
        <div className="dropdown-wrapper">
          <ArrowUpDown size={16} className="dropdown-icon" />
          <select 
            value={sortBy} 
            onChange={(e) => onSortByChange(e.target.value)}
            className="filter-select"
          >
            <option value="dueDateAsc">Vencimento (Mais próximo)</option>
            <option value="dueDateDesc">Vencimento (Mais distante)</option>
            <option value="amountDesc">Valor (Maior para menor)</option>
            <option value="amountAsc">Valor (Menor para maior)</option>
            <option value="titleAsc">Nome (A - Z)</option>
          </select>
        </div>
      </div>

      {/* Linha Inferior: Abas de Filtro de Status */}
      <div className="filter-tabs-row">
        <div className="filter-tabs">
          <button 
            type="button" 
            className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => onStatusFilterChange('all')}
          >
            Todas ({totalCount})
          </button>
          <button 
            type="button" 
            className={`filter-tab ${statusFilter === 'week' ? 'active' : ''}`}
            onClick={() => onStatusFilterChange('week')}
          >
            Desta Semana
          </button>
          <button 
            type="button" 
            className={`filter-tab ${statusFilter === '15days' ? 'active' : ''}`}
            onClick={() => onStatusFilterChange('15days')}
          >
            Próx. 15 Dias
          </button>
          <button 
            type="button" 
            className={`filter-tab ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => onStatusFilterChange('pending')}
          >
            Pendentes
          </button>
          <button 
            type="button" 
            className={`filter-tab ${statusFilter === 'paid' ? 'active' : ''}`}
            onClick={() => onStatusFilterChange('paid')}
          >
            Pagas
          </button>
          <button 
            type="button" 
            className={`filter-tab ${statusFilter === 'overdue' ? 'active' : ''}`}
            onClick={() => onStatusFilterChange('overdue')}
          >
            Atrasadas
          </button>
        </div>

        <span className="results-count-text">
          Exibindo <strong>{filteredCount}</strong> de {totalCount} contas
        </span>
      </div>
    </div>
  );
}
